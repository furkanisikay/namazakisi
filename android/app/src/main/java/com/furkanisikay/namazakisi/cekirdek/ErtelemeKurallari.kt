package com.furkanisikay.namazakisi.cekirdek

/**
 * Muhafız bildirimindeki "Ertele" (issue #289) — SAF kurallar (JVM testi:
 * ErtelemeKurallariTest).
 *
 * İKİZ: `src/core/muhafiz/erteleme.ts`. İki taraf aynı fikstürü kabul eder:
 * `src/test/resources/erteleme-ornekleri.json` (JS testi de okur). Bir kural
 * değişirse ÜÇÜNÜ birlikte güncelle.
 *
 * Üst sınırın kendisi (çıkış − 3 dk; ikindide gurub kerahati başlangıcı) JS'te
 * hesaplanıp bildirimin `data`sına `erteleSinirMs` olarak yazılır — kerahat
 * sabitinin ikinci bir kopyası tutulmasın diye burada YENİDEN HESAPLANMAZ.
 */
object ErtelemeKurallari {
    private const val DK = 60_000L

    /** JS `ERTELEME_EN_AZ_DK` */
    const val EN_AZ_DK = 5L
    /** JS `ERTELEME_EN_AZ_GECIKME_MS` */
    const val EN_AZ_GECIKME_MS = 60_000L
    /** JS `ERTELEME_CAKISMA_PAYI_MS` */
    const val CAKISMA_PAYI_MS = 60_000L

    val SURELER_DK = listOf(10L, 20L)

    const val KATEGORI_YOK = "muhafiz_category"
    const val KATEGORI_TEK = "muhafiz_ertele1_category"
    const val KATEGORI_IKI = "muhafiz_ertele2_category"

    private const val SURE_YER_TUTUCU = "{sure}"

    private val ERTELEME_DESENI = Regex("""^muhafiz_(\d{4}-\d{2}-\d{2})_vakit_([a-z]+)_ertele$""")
    private val PLAN_DESENI = Regex("""^muhafiz_\d{4}-\d{2}-\d{2}_vakit_[a-z]+_seviye_\d+_dk_(-?\d+)$""")

    /** Eylem kimliği → süre (dk); ertele eylemi değilse null. */
    fun eylemSuresiDk(eylem: String?): Long? = when (eylem) {
        "ertele_10" -> 10L
        "ertele_20" -> 20L
        else -> null
    }

    /** JS `ertelemeSecenekleri` */
    fun secenekler(tetikMs: Long, sinirMs: Long): List<Long> {
        val kalanDk = Math.floorDiv(sinirMs - tetikMs, DK)
        if (kalanDk < EN_AZ_DK) return emptyList()
        val sigan = SURELER_DK.filter { it <= kalanDk }
        return if (sigan.isNotEmpty()) sigan else listOf(SURELER_DK.first())
    }

    /** JS `ertelemeKategorisi` */
    fun kategori(tetikMs: Long, sinirMs: Long): String = when (secenekler(tetikMs, sinirMs).size) {
        0 -> KATEGORI_YOK
        1 -> KATEGORI_TEK
        else -> KATEGORI_IKI
    }

    /** JS `ertelemeHedefiHesapla` — sınıra çok az kalmışsa null (ertelenmez). */
    fun hedefHesapla(simdiMs: Long, sureDk: Long, sinirMs: Long): Long? {
        val hedef = minOf(simdiMs + sureDk * DK, sinirMs)
        return if (hedef - simdiMs >= EN_AZ_GECIKME_MS) hedef else null
    }

    /** `muhafiz_<tarih>_vakit_<vakit>_ertele` */
    fun kimlik(tarih: String, vakit: String): String = "muhafiz_${tarih}_vakit_${vakit}_ertele"

    fun ertelemeKimligiMi(kimlik: String): Boolean = ERTELEME_DESENI.matches(kimlik)

    /** Plan kimliğindeki kalanDk (tetik = çıkış − kalanDk). */
    fun kimliktenKalanDk(kimlik: String): Long? =
        PLAN_DESENI.matchEntire(kimlik)?.groupValues?.get(1)?.toLongOrNull()

    /**
     * Muhafız PLANININ kimliği mi? Saat köprü etiketi yalnız bunlara basılır:
     * saat yalnız planı kendi kurar; erteleme ve yatış/muhasebe saatte yoktur,
     * köprüyle gelmeleri gerekir.
     */
    fun planKimligiMi(kimlik: String): Boolean = PLAN_DESENI.matches(kimlik)

    /** JS `ertelemedeSusturulurMu` */
    fun susturulurMu(tetikMs: Long, hedefMs: Long): Boolean = tetikMs < hedefMs + CAKISMA_PAYI_MS

    /** JS `sureMetni` — "25 dk" / "1 sa" / "1 sa 5 dk". */
    fun sureMetni(dk: Long): String {
        val d = maxOf(0L, dk)
        val sa = d / 60
        val kalan = d % 60
        if (sa == 0L) return "$kalan dk"
        return if (kalan == 0L) "$sa sa" else "$sa sa $kalan dk"
    }

    /** JS `ertelemeBasligiOlustur` — şablon yoksa null (asıl başlık korunur). */
    fun baslik(sablon: String?, cikisMs: Long, hedefMs: Long): String? {
        if (sablon.isNullOrEmpty() || !sablon.contains(SURE_YER_TUTUCU)) return null
        return sablon.replace(SURE_YER_TUTUCU, sureMetni(Math.floorDiv(cikisMs - hedefMs, DK)))
    }
}
