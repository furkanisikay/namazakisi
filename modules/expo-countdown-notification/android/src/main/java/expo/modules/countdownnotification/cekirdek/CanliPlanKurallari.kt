package expo.modules.countdownnotification.cekirdek

import org.json.JSONArray
import org.json.JSONObject

/**
 * Canlı sayaç PLANI (Now Bar kullanıcı seçimi — issue #282 ikinci aşama). SAF, JVM testli.
 *
 * JS (`src/core/sayac/canliSayacPlani.ts`) hangi öğenin NE ZAMAN öne çıkacağını
 * hesaplayıp bir OLAY listesi gönderir; native taraf bu listeyi saklar ve TEK bir
 * alarm zinciriyle (aynı anda yalnız sıradaki olayın alarmı) uygular — dakikalık
 * yoklama YOK, süreç ölse de JS'siz çalışır. Sözleşme iki dilde kilitlidir:
 * `src/test/resources/canli-plan-ornegi.json` hem JS testinde üretilir hem burada çözülür.
 *
 * Eylemler:
 *  - `oneCikar`: Live Update (durum çubuğu çipi / Now Bar) olarak göster.
 *  - `normal`: sıradan (özel görünümlü) sayaç olarak göster — yalnız kullanıcının
 *    ayrıca açtığı SAYAÇLARIN (kaynak `sayac`) öne çıkma yarışını kaybettiği dilim.
 *  - `gizle`: kaldır (yalnız Now Bar'a özel adayın yarışı kaybettiği dilim).
 */
object CanliPlanKurallari {

    const val ONE_CIKAR = "oneCikar"
    const val NORMAL = "normal"
    const val GIZLE = "gizle"

    data class PlanOlayi(
        val anMs: Long,
        val id: String,
        val eylem: String,
        /** `sayac` | `nowBar` — `gizle` olayında boş. */
        val kaynak: String = "",
        val hedefMs: Long = 0L,
        val baslik: String = "",
        val govde: String = "",
        val kanalId: String = "",
        val tema: String = "vakit",
        val ek: CanliGuncellemeKurallari.EkYuk? = null,
        /** Ham `ek` JSON'u — saklanan plan yeniden yazılırken kayıpsız taşınır. */
        val ekJson: String = "",
    ) {
        val gosterimMi: Boolean get() = eylem == ONE_CIKAR || eylem == NORMAL
    }

    /** Uygulama kararı (native tarafın tek sorusu). */
    enum class Karar { ONE_CIKAR, NORMAL, GIZLE }

    /**
     * Bir olay şu an NASIL uygulanır? Öne çıkarma izni yoksa (API < 36 ya da
     * kullanıcı sistemde "Canlı güncellemeler"i kapattı) sayaç sıradan gösterilir,
     * Now Bar'a özel aday hiç gösterilmez (kullanıcı onu çekmecede istemedi).
     */
    fun karar(olay: PlanOlayi, oneCikarIzni: Boolean): Karar = when (olay.eylem) {
        ONE_CIKAR -> when {
            oneCikarIzni -> Karar.ONE_CIKAR
            olay.kaynak == "sayac" -> Karar.NORMAL
            else -> Karar.GIZLE
        }
        NORMAL -> if (olay.kaynak == "sayac") Karar.NORMAL else Karar.GIZLE
        else -> Karar.GIZLE
    }

    /**
     * JS'ten gelen (ya da saklanan) planı çözer. Tek bozuk olay ATLANIR, plan
     * reddedilmez (bir öğenin hatası diğerlerini susturmasın); dizi hiç
     * çözülemezse boş liste. Hiçbir durumda fırlatmaz. Kronolojik döner.
     */
    fun planiCoz(json: String?): List<PlanOlayi> {
        val dizi = try {
            if (json.isNullOrBlank()) return emptyList() else JSONArray(json)
        } catch (_: Exception) {
            return emptyList()
        }
        val sonuc = mutableListOf<PlanOlayi>()
        for (i in 0 until dizi.length()) {
            val o = dizi.optJSONObject(i) ?: continue
            olayCoz(o)?.let { sonuc += it }
        }
        return sonuc.sortedBy { it.anMs }
    }

    private fun olayCoz(o: JSONObject): PlanOlayi? {
        val id = o.optString("id")
        val eylem = o.optString("eylem")
        if (id.isEmpty() || !o.has("anMs")) return null
        val an = o.optLong("anMs", Long.MIN_VALUE)
        if (an == Long.MIN_VALUE) return null
        return when (eylem) {
            GIZLE -> PlanOlayi(anMs = an, id = id, eylem = GIZLE)
            ONE_CIKAR, NORMAL -> {
                val kaynak = o.optString("kaynak")
                if (kaynak != "sayac" && kaynak != "nowBar") return null
                val hedef = o.optLong("hedefMs", 0L)
                if (hedef == 0L || hedef <= an) return null
                val ekJson = o.optJSONObject("ek")?.toString() ?: ""
                PlanOlayi(
                    anMs = an,
                    id = id,
                    eylem = eylem,
                    kaynak = kaynak,
                    hedefMs = hedef,
                    baslik = o.optString("baslik"),
                    govde = o.optString("govde"),
                    kanalId = o.optString("kanalId"),
                    tema = o.optString("tema", "vakit"),
                    ek = CanliGuncellemeKurallari.ekYukuCoz(ekJson),
                    ekJson = ekJson,
                )
            }
            else -> null
        }
    }

    /** Saklama için yeniden yazar (`planiCoz` ile kayıpsız gidiş-dönüş). */
    fun planJsonu(plan: List<PlanOlayi>): String = JSONArray().apply {
        plan.forEach { p ->
            val o = JSONObject().put("anMs", p.anMs).put("id", p.id).put("eylem", p.eylem)
            if (p.gosterimMi) {
                o.put("kaynak", p.kaynak)
                    .put("hedefMs", p.hedefMs)
                    .put("baslik", p.baslik)
                    .put("govde", p.govde)
                    .put("kanalId", p.kanalId)
                    .put("tema", p.tema)
                if (p.ekJson.isNotEmpty()) o.put("ek", JSONObject(p.ekJson))
            }
            put(o)
        }
    }.toString()

    /**
     * `(sonrasi, simdi]` aralığında vadesi gelen olaylardan her kimliğin SONUNCUSU.
     * Gecikmeyle birden çok olay birikmişse ara durumlar atlanır (yalnız güncel hâl
     * uygulanır). Hedefi geçmiş gösterim düşer (bitiş alarmı zaten kaldırdı).
     * `sonrasi = Long.MIN_VALUE` → planın şu anki tüm hâli (ilk kurulum / yeniden başlatma).
     */
    fun vadesiGelenler(plan: List<PlanOlayi>, sonrasi: Long, simdi: Long): List<PlanOlayi> {
        val sonOlay = LinkedHashMap<String, PlanOlayi>()
        plan.filter { it.anMs in (sonrasi + 1)..simdi || (sonrasi == Long.MIN_VALUE && it.anMs <= simdi) }
            .sortedBy { it.anMs }
            .forEach { sonOlay[it.id] = it }
        return sonOlay.values.filter { !it.gosterimMi || it.hedefMs > simdi }
    }

    /** Sıradaki alarmın anı: `simdi`den SONRAKİ ilk olay (yoksa null → alarm iptal). */
    fun sonrakiAlarm(plan: List<PlanOlayi>, simdi: Long): Long? =
        plan.asSequence().map { it.anMs }.filter { it > simdi }.minOrNull()

    /**
     * Kullanıcı bildirimi kapattı / "Kıldım" dedi / JS sayacı durdurdu: o kimliğin
     * İLERİDEKİ olayları da düşer — yoksa plan, kapatılan sayacı bir sonraki dilimde
     * (ör. öne çıkma sırası ona geldiğinde) geri getirirdi.
     */
    fun kimligiDusur(plan: List<PlanOlayi>, id: String): List<PlanOlayi> = plan.filter { it.id != id }

    /** Plan yenilenince artık gösterilmemesi gereken (öncekiden kalan) kimlikler. */
    fun kaldirilacaklar(oncekiGosterilen: Set<String>, guncelGosterilen: Set<String>): Set<String> =
        oncekiGosterilen - guncelGosterilen
}
