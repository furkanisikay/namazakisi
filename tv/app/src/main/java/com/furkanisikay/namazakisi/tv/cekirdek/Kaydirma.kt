package com.furkanisikay.namazakisi.tv.cekirdek

/**
 * Ekran yanığı (burn-in) koruması: pano saatlerce aynı yerde durur; OLED/plazma
 * TV'de sabit rakamlar iz bırakabilir. İçerik dakikada bir, [ADIMLAR] konumdan
 * birine birkaç dp kaydırılır — göze batmaz, aynı piksel sürekli yanmaz. SAF.
 */
object Kaydirma {
    /** (x, y) dp ofsetleri; döngü sekiz dakikada bir başa döner. */
    private val ADIMLAR = listOf(
        0 to 0, 6 to 0, 6 to 6, 0 to 6, -6 to 6, -6 to 0, -6 to -6, 0 to -6,
    )

    fun ofset(simdiMs: Long): Pair<Int, Int> {
        val dakika = Math.floorDiv(simdiMs, 60_000L)
        return ADIMLAR[Math.floorMod(dakika, ADIMLAR.size.toLong()).toInt()]
    }
}
