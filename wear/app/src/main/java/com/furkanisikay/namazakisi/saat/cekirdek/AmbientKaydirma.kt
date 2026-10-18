package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Always-on (ambient) görünümlerin burn-in kaydırması — SAF, JVM testli. Ana ekran ve
 * tesbihat AYNI kuralı okur (eskiden `TesbihatAmbient` içindeydi; davranış aynı,
 * nöbetçi `TesbihatAmbientTest`).
 *
 * OLED'de aynı pikselleri dakikalarca yakmamak için içerik her ambient güncellemesinde
 * (≈ dakikada bir) birkaç dp kaydırılır. Wear OS 6+ (API 36) sistemi içeriği KENDİSİ
 * kaydırır ve uygulamanın ayrıca kaydırmamasını ister → orada kaydırma YOK (çift
 * kaydırma içeriği kenara taşır).
 */
object AmbientKaydirma {
    /** Kaydırma genliği (dp): kenardan ~10 px güvenli pay korunur, göz fark etmez. */
    const val KAYDIRMA_DP = 4

    /** Sistemin kendi burn-in kaydırmasını yaptığı ilk API (Wear OS 6). */
    const val SISTEM_KAYDIRMA_API = 36

    data class Kaydirma(val xDp: Int, val yDp: Int) {
        companion object {
            val YOK = Kaydirma(0, 0)
        }
    }

    /**
     * Merkez + çevresindeki sekiz nokta: art arda iki adım asla aynı yerde değildir,
     * dokuz dakikada tüm noktalar dolaşılır (piksel başına süre ~1/9'a iner).
     */
    private val DESEN = listOf(
        Kaydirma(0, 0),
        Kaydirma(KAYDIRMA_DP, 0),
        Kaydirma(KAYDIRMA_DP, KAYDIRMA_DP),
        Kaydirma(0, KAYDIRMA_DP),
        Kaydirma(-KAYDIRMA_DP, KAYDIRMA_DP),
        Kaydirma(-KAYDIRMA_DP, 0),
        Kaydirma(-KAYDIRMA_DP, -KAYDIRMA_DP),
        Kaydirma(0, -KAYDIRMA_DP),
        Kaydirma(KAYDIRMA_DP, -KAYDIRMA_DP),
    )

    /** Sistem içeriği kendisi kaydırıyor mu? (API 36+) */
    fun sistemKaydiriyor(sdk: Int): Boolean = sdk >= SISTEM_KAYDIRMA_API

    /**
     * @param adim ambient'e girişten bu yana kaçıncı güncelleme (0 = giriş anı)
     * @param burnInKorumasi cihaz burn-in koruması istiyor mu (`AmbientDetails`)
     */
    fun kaydirma(adim: Int, burnInKorumasi: Boolean, sdk: Int): Kaydirma {
        if (!burnInKorumasi || sistemKaydiriyor(sdk)) return Kaydirma.YOK
        return DESEN[Math.floorMod(adim, DESEN.size)]
    }
}
