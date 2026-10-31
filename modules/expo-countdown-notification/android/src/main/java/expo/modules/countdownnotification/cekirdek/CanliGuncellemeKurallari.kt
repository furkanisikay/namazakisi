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
     * Bir dilin kısa süre birimleri ve boşlukları. [birimAyirici] sayı ile birim arası
     * (JS `sure.birimli` kalıbının `{n}` ile `{birim}` arası), [parcaAyirici] "1 sa" ile "5 dk"
     * arası (JS `sure.parcali`); boşluksuz yazan dil (Çince "1小时5分钟") ikisine de "" verir.
     */
    data class KisaBirimler(val sa: String, val dk: String, val birimAyirici: String = " ", val parcaAyirici: String = " ")

    /**
     * Kısa süre birimleri, arayüz diline göre (JS `sozluk/<dil>/sure.ts > kisa`).
     * Bilinmeyen dil Türkçeye düşer. Yeni dil: buraya bir satır + JS sözlüğü. Sıra tr, en,
     * id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi; çevrilmemiş dil İngilizcenin kopyasıdır (`// ÇEVİRİ: <kod>`).
     */
    internal val KISA_BIRIMLER: Map<String, KisaBirimler> = mapOf(
        "tr" to KisaBirimler("sa", "dk"),
        "en" to KisaBirimler("h", "min"),
        // id
        "id" to KisaBirimler("j", "mnt"),
        "de" to KisaBirimler("Std.", "Min."),
        // fr
        "fr" to KisaBirimler("h", "min"),
        // bs
        "bs" to KisaBirimler("h", "min"),
        // ru
        "ru" to KisaBirimler("ч", "мин"),
        // ms
        "ms" to KisaBirimler("j", "min"),
        // ar
        "ar" to KisaBirimler("س", "د"),
        // ur
        "ur" to KisaBirimler("گھنٹے", "منٹ"),
        // es
        "es" to KisaBirimler("h", "min"),
        // nl
        "nl" to KisaBirimler("u", "min"),
        // sq
        "sq" to KisaBirimler("orë", "min"),
        // hi
        "hi" to KisaBirimler("घंटे", "मिनट"),
        // bn
        "bn" to KisaBirimler("ঘ", "মি"),
        // fa
        "fa" to KisaBirimler("ساعت", "دقیقه"),
        // ps
        "ps" to KisaBirimler("ساعت", "دقیقې"),
        // ckb
        "ckb" to KisaBirimler("کاتژمێر", "خولەک"),
        // ug
        "ug" to KisaBirimler("سائەت", "مىنۇت"),
        // az
        "az" to KisaBirimler("saat", "dəq"),
        // uz (Latin)
        "uz" to KisaBirimler("soat", "daq"),
        // kk
        "kk" to KisaBirimler("сағ", "мин"),
        // ky
        "ky" to KisaBirimler("ст", "мүн"),
        // tg
        "tg" to KisaBirimler("соат", "дақ"),
        // sw
        "sw" to KisaBirimler("saa", "dk"),
        // ha
        "ha" to KisaBirimler("awa", "min"),
        // am
        "am" to KisaBirimler("ሰዓ", "ደቂ"),
        // om
        "om" to KisaBirimler("sa'a", "daq"),
        // so
        "so" to KisaBirimler("s", "daq"),
        // ff
        "ff" to KisaBirimler("sa", "hj"),
        // yo
        "yo" to KisaBirimler("wkt", "ìṣj"),
        // zh (boşluksuz yazılır: "5分钟", "1小时5分钟")
        "zh" to KisaBirimler("小时", "分钟", birimAyirici = "", parcaAyirici = ""),
        // ta
        "ta" to KisaBirimler("மணி", "நிமி", birimAyirici = " ", parcaAyirici = " "),
        // ml
        "ml" to KisaBirimler("മ", "മി", birimAyirici = " ", parcaAyirici = " "),
        // th
        "th" to KisaBirimler("ชม.", "นาที", birimAyirici = " ", parcaAyirici = " "),
        // ÇEVİRİ: ko
        "ko" to KisaBirimler("h", "min", birimAyirici = " ", parcaAyirici = " "),
        // vi
        "vi" to KisaBirimler("giờ", "phút", birimAyirici = " ", parcaAyirici = " "),
    )

    /**
     * Durum çubuğu çipi metni (`setShortCriticalText`): "12 dk", "1 sa", "1 sa 5 dk"
     * (İngilizce: "12 min", "1 h", "1 h 5 min"). Çip dardır; saniye YOK (canlı saniye
     * sayımını chronometer zaten çizer). [dil] arayüz dilidir (`ArayuzDili`), varsayılan
     * Türkçe — ortak fikstür Türkçe biçimi sınar.
     */
    fun kisaMetin(kalanMs: Long, dil: String = "tr"): String {
        val b = KISA_BIRIMLER[dil] ?: KISA_BIRIMLER.getValue("tr")
        val dk = kalanDakika(kalanMs)
        // `${}` zorunlu: Han/Hangıl harfi şablonda tanımlayıcıya yapışır.
        if (dk < 60) return "${dk}${b.birimAyirici}${b.dk}"
        val sa = dk / 60
        val artan = dk % 60
        val saatli = "${sa}${b.birimAyirici}${b.sa}"
        return if (artan == 0L) saatli else "${saatli}${b.parcaAyirici}${artan}${b.birimAyirici}${b.dk}"
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
