package expo.modules.googleyetki.cekirdek

/**
 * Google yetki köprüsünün SAF kararları (android.* / gms import ETMEZ → JVM testi).
 * Durum kodları Play hizmetleri `CommonStatusCodes` değerleridir (kararlı, belgeli).
 */
object YetkiKurallari {
    const val SIGN_IN_REQUIRED = 4
    const val NETWORK_ERROR = 7
    const val INTERRUPTED = 14
    const val TIMEOUT = 15
    const val CANCELED = 16

    /** Sonucu gelmeyen onay slotu bu süreden sonra bayat sayılır ve devralınır. */
    const val BAYAT_SLOT_MS = 10 * 60_000L

    /**
     * Yeni bir onay ekranı açılabilir mi? Slot boşsa evet; doluysa yalnız bayatsa
     * (sonuç hiç gelmedi → aksi halde her bağlanma sonsuza dek `mesgul` olurdu).
     */
    fun slotDevralinabilirMi(dolu: Boolean, gecenMs: Long): Boolean =
        !dolu || gecenMs >= BAYAT_SLOT_MS

    /**
     * `ApiException.statusCode` → köprü durumu. `null` = genel `hata` (kod taşınır).
     * SIGN_IN_REQUIRED kullanıcının yeniden bağlanmasını gerektirir → `cozumGerekli`.
     */
    fun durumKodu(statusCode: Int?): String? = when (statusCode) {
        CANCELED -> "iptal"
        SIGN_IN_REQUIRED -> "cozumGerekli"
        NETWORK_ERROR, TIMEOUT, INTERRUPTED -> "agYok"
        else -> null
    }
}
