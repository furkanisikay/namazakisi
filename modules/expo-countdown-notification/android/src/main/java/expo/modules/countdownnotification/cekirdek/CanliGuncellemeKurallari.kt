package expo.modules.countdownnotification.cekirdek

import org.json.JSONObject

/**
 * Android 16 "Live Update" (öne çıkarılmış sürekli bildirim) SAF kuralları — issue #282.
 *
 * Android'e bağımlı DEĞİLDİR (yalnız `org.json`); JVM birim testiyle sınanır. Aynı
 * kuralların JS ikizi `src/core/sayac/canliGuncelleme.ts`'tedir ve İKİSİ AYNI fikstürü
 * (`src/test/resources/kisa-metin-ornekleri.json`) kabul etmek zorundadır: JS kısa metni
 * ilk gösterimde değil, native taraf HER DAKİKA yeniden çizerken üretir (JS o an çalışmıyor
 * olabilir) — iki dil ayrışırsa ekrandaki önizleme ile durum çubuğu çipi farklı konuşur.
 */
object CanliGuncellemeKurallari {

    const val DAKIKA_MS = 60_000L

    /**
     * Öne çıkarılabilecek sayaç temaları (native kapı). POLİTİKA KAPISI JS'TEDİR:
     * seri, cuma ve nafile yalnız kullanıcı Now Bar ayarında o öğeyi AÇTIYSA
     * planlayıcıdan (`CanliPlan`) gelir — seri varsayılan kapalıdır (baskı hissi),
     * eski sayaç yolu seriyi hâlâ öne çıkarmaz (`canliGuncellemeyeUygunMu`).
     * Sürekli "sonraki vakit" kartı YOK (politika).
     */
    val ONE_CIKARILABILIR_TEMALAR: Set<String> = setOf("vakit", "iftar", "sahur", "seri", "cuma", "nafile")

    /** ProgressStyle bölüm sayısı üst sınırı (sistem fazlasını kırpar; biz baştan reddederiz). */
    const val MAKS_BOLUM = 10

    fun oneCikarilabilirMi(tema: String): Boolean = tema in ONE_CIKARILABILIR_TEMALAR

    /**
     * Kalan süre, dakika olarak, YUKARI yuvarlanır: 30 sn kala "1 dk" görünür —
     * aşağı yuvarlama son dakikada "0 dk" yazdırırdı (geri sayım hâlâ sürerken).
     */
    fun kalanDakika(kalanMs: Long): Long =
        if (kalanMs <= 0L) 0L else (kalanMs + DAKIKA_MS - 1) / DAKIKA_MS

    /**
     * Kısa süre birimleri, arayüz diline göre (JS `sozluk/<dil>/sure.ts > kisa`).
     * Bilinmeyen dil Türkçeye düşer. Yeni dil: buraya bir satır + JS sözlüğü. Sıra tr, en,
     * id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo; çevrilmemiş dil İngilizcenin kopyasıdır (`// ÇEVİRİ: <kod>`).
     */
    internal val KISA_BIRIMLER: Map<String, Pair<String, String>> = mapOf(
        "tr" to ("sa" to "dk"),
        "en" to ("h" to "min"),
        // id
        "id" to ("j" to "mnt"),
        "de" to ("Std." to "Min."),
        // fr
        "fr" to ("h" to "min"),
        // bs
        "bs" to ("h" to "min"),
        // ru
        "ru" to ("ч" to "мин"),
        // ms
        "ms" to ("j" to "min"),
        // ar
        "ar" to ("س" to "د"),
        // ur
        "ur" to ("گھنٹے" to "منٹ"),
        // es
        "es" to ("h" to "min"),
        // nl
        "nl" to ("u" to "min"),
        // sq
        "sq" to ("orë" to "min"),
        // hi
        "hi" to ("घंटे" to "मिनट"),
        // bn
        "bn" to ("ঘ" to "মি"),
        // fa
        "fa" to ("ساعت" to "دقیقه"),
        // ps
        "ps" to ("ساعت" to "دقیقې"),
        // ckb
        "ckb" to ("کاتژمێر" to "خولەک"),
        // ug
        "ug" to ("سائەت" to "مىنۇت"),
        // az
        "az" to ("saat" to "dəq"),
        // uz (Latin)
        "uz" to ("soat" to "daq"),
        // kk
        "kk" to ("сағ" to "мин"),
        // ky
        "ky" to ("ст" to "мүн"),
        // tg
        "tg" to ("соат" to "дақ"),
        // sw
        "sw" to ("saa" to "dk"),
        // ÇEVİRİ: ha
        "ha" to ("h" to "min"),
        // ÇEVİRİ: am
        "am" to ("h" to "min"),
        // ÇEVİRİ: om
        "om" to ("h" to "min"),
        // ÇEVİRİ: so
        "so" to ("h" to "min"),
        // ÇEVİRİ: ff
        "ff" to ("h" to "min"),
        // ÇEVİRİ: yo
        "yo" to ("h" to "min"),
    )

    /**
     * Durum çubuğu çipi metni (`setShortCriticalText`): "12 dk", "1 sa", "1 sa 5 dk"
     * (İngilizce: "12 min", "1 h", "1 h 5 min"). Çip dardır; saniye YOK (canlı saniye
     * sayımını chronometer zaten çizer). [dil] arayüz dilidir (`ArayuzDili`), varsayılan
     * Türkçe — ortak fikstür Türkçe biçimi sınar.
     */
    fun kisaMetin(kalanMs: Long, dil: String = "tr"): String {
        val (saBirim, dkBirim) = KISA_BIRIMLER[dil] ?: KISA_BIRIMLER.getValue("tr")
        val dk = kalanDakika(kalanMs)
        if (dk < 60) return "$dk $dkBirim"
        val sa = dk / 60
        val artan = dk % 60
        return if (artan == 0L) "$sa $saBirim" else "$sa $saBirim $artan $dkBirim"
    }

    /**
     * Kısa metnin bir sonraki DEĞİŞECEĞİ an: `hedef − (dk − 1)·60 sn`. Son dakikada
     * (dk = 1) değişecek bir şey yoktur — bildirimi hedef anında bitiş alarmı kaldırır
     * → `null`. Hedef geçmişse de `null`.
     */
    fun sonrakiTazelemeMs(simdiMs: Long, hedefMs: Long): Long? {
        val kalan = hedefMs - simdiMs
        if (kalan <= 0L) return null
        val dk = kalanDakika(kalan)
        if (dk <= 1L) return null
        return hedefMs - (dk - 1) * DAKIKA_MS
    }

    data class Bolum(val uzunlukDk: Int, val vurgulu: Boolean)

    /**
     * Öne çıkarılmış bildirimin yeniden çizilebilmesi için gereken her şey.
     *
     * Native taraf bunu SharedPreferences'ta saklar: dakikalık tazeleme alarmı süreç
     * ölmüşken de gelir ve bildirimi JS olmadan yeniden kurmak zorundadır.
     */
    data class Durum(
        val id: String,
        val hedefMs: Long,
        val baslik: String,
        val metin: String,
        val kanalId: String,
        val kucukIkon: String,
        val tema: String,
        val hedefteKaybol: Boolean,
        val baslangicMs: Long,
        val bolumler: List<Bolum>,
        val kildimTarih: String?,
        val kildimVakit: String?,
    )

    /** Toplam ilerleme ölçeği (dk) — bölümlerin toplamı. */
    fun toplamDk(bolumler: List<Bolum>): Int = bolumler.sumOf { it.uzunlukDk }

    /** Başlangıçtan geçen dakika, `[0, toplam]` aralığına kıstırılmış. */
    fun ilerleme(simdiMs: Long, baslangicMs: Long, bolumler: List<Bolum>): Int {
        val toplam = toplamDk(bolumler)
        if (toplam <= 0) return 0
        val gecen = (simdiMs - baslangicMs) / DAKIKA_MS
        return gecen.coerceIn(0L, toplam.toLong()).toInt()
    }

    /** Bölüm listesi geçerli mi? Boş liste geçerlidir (ilerleme çubuğu çizilmez). */
    fun bolumlerGecerliMi(bolumler: List<Bolum>): Boolean =
        bolumler.size <= MAKS_BOLUM && bolumler.all { it.uzunlukDk > 0 }

    /**
     * JS'ten gelen ek yük (`startCountdownCanli` son argümanı). Bozuk/eksik alanlar
     * GÜVENLİ varsayılana düşer: ilerleme yoksa çubuk çizilmez, "Kıldım" verisi
     * eksikse eylem eklenmez. Hiçbir durumda fırlatmaz.
     */
    fun ekYukuCoz(json: String?): EkYuk {
        val o = try {
            if (json.isNullOrBlank()) JSONObject() else JSONObject(json)
        } catch (_: Exception) {
            JSONObject()
        }
        val bolumler = mutableListOf<Bolum>()
        val dizi = o.optJSONArray("bolumler")
        if (dizi != null) {
            for (i in 0 until dizi.length()) {
                val b = dizi.optJSONObject(i) ?: continue
                bolumler += Bolum(b.optInt("uzunlukDk", 0), b.optBoolean("vurgulu", false))
            }
        }
        val gecerliBolumler = if (bolumlerGecerliMi(bolumler)) bolumler.toList() else emptyList()
        val kildim = o.optJSONObject("kildim")
        val tarih = kildim?.optString("tarih")?.takeIf { TARIH_DESENI.matches(it) }
        val vakit = kildim?.optString("vakit")?.takeIf { it in KILDIM_VAKITLERI }
        return EkYuk(
            baslangicMs = o.optLong("baslangicMs", 0L),
            bolumler = gecerliBolumler,
            hedefteKaybol = o.optBoolean("hedefteKaybol", false),
            kildimTarih = if (tarih != null && vakit != null) tarih else null,
            kildimVakit = if (tarih != null && vakit != null) vakit else null,
        )
    }

    data class EkYuk(
        val baslangicMs: Long,
        val bolumler: List<Bolum>,
        val hedefteKaybol: Boolean,
        val kildimTarih: String?,
        val kildimVakit: String?,
    )

    /** "Kıldım" kuyruğunun kabul ettiği vakitler (`KildimKuyruguKurallari` ile aynı). */
    private val KILDIM_VAKITLERI = setOf("imsak", "ogle", "ikindi", "aksam", "yatsi")
    private val TARIH_DESENI = Regex("""^\d{4}-\d{2}-\d{2}$""")

    fun durumuJsonaCevir(d: Durum): String = JSONObject()
        .put("id", d.id)
        .put("hedefMs", d.hedefMs)
        .put("baslik", d.baslik)
        .put("metin", d.metin)
        .put("kanalId", d.kanalId)
        .put("kucukIkon", d.kucukIkon)
        .put("tema", d.tema)
        .put("hedefteKaybol", d.hedefteKaybol)
        .put("baslangicMs", d.baslangicMs)
        .put("bolumler", org.json.JSONArray().apply {
            d.bolumler.forEach { put(JSONObject().put("uzunlukDk", it.uzunlukDk).put("vurgulu", it.vurgulu)) }
        })
        .apply {
            if (d.kildimTarih != null && d.kildimVakit != null) {
                put("kildim", JSONObject().put("tarih", d.kildimTarih).put("vakit", d.kildimVakit))
            }
        }
        .toString()

    /** Saklanan durumu geri okur; bozuksa `null` (tazeleme sessizce durur). */
    fun durumuJsondanOku(json: String?): Durum? {
        if (json.isNullOrBlank()) return null
        return try {
            val o = JSONObject(json)
            val id = o.optString("id")
            val hedef = o.optLong("hedefMs", 0L)
            if (id.isEmpty() || hedef <= 0L) return null
            val ek = ekYukuCoz(json)
            Durum(
                id = id,
                hedefMs = hedef,
                baslik = o.optString("baslik"),
                metin = o.optString("metin"),
                kanalId = o.optString("kanalId"),
                kucukIkon = o.optString("kucukIkon"),
                tema = o.optString("tema", "vakit"),
                hedefteKaybol = ek.hedefteKaybol,
                baslangicMs = ek.baslangicMs,
                bolumler = ek.bolumler,
                kildimTarih = ek.kildimTarih,
                kildimVakit = ek.kildimVakit,
            )
        } catch (_: Exception) {
            null
        }
    }
}
