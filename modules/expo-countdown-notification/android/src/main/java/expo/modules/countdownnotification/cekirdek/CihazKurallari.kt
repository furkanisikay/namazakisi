package expo.modules.countdownnotification.cekirdek

/**
 * Cihaz durumu okumalarının SAF kararları (sade tasarım, Dalga 1). Android import ETMEZ.
 * Sözleşme JS `core/cihaz` modülleriyle aynı: `null` = bilinmiyor → ekran susar.
 */
object CihazKurallari {
    /** `Build.VERSION.SDK_INT_FULL` yalnız API 36'da geldi. */
    const val TAM_SURUM_API = 36

    /**
     * Android tam sürümü (ana × 100000 + alt; QPR2 = 3600001). API 36 altında alan
     * YOKTUR (statik alan erişimi eski çalışma zamanında `NoSuchFieldError` atar) → `null`.
     * Okuyucu her hatayı yutar.
     */
    fun tamSurum(sdkInt: Int, okuyucu: () -> Int): Int? {
        if (sdkInt < TAM_SURUM_API) return null
        return try {
            okuyucu().takeIf { it >= TAM_SURUM_API * 100000 }
        } catch (_: Throwable) {
            null
        }
    }

    /** Alarm ses düzeyi (`STREAM_ALARM`) açık mı; okunamadıysa (`null`/negatif) bilinmiyor. */
    fun alarmSesiAcik(duzey: Int?): Boolean? = when {
        duzey == null || duzey < 0 -> null
        else -> duzey > 0
    }
}
