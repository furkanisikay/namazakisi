package expo.modules.camigeofence.cekirdek

/**
 * Namaz modu (#277) için hangi sistem ayar ekranının, hangi SIRAYLA deneneceği.
 * Saf: `android.*` import ETMEZ (JVM testi `AyarEkraniKarariTest`).
 *
 * v0.31.0 iç testi (Samsung): Rahatsız Etmeyin erişimi zaten verilmişken kullanıcı
 * yine erişim ekranına gönderildi ve Ayarlar uygulaması çöktü (sistem kullanıcıyı
 * ana ekrana attı); "Modun ayarlarını açın" da Ayarlar'ı çökertti. Ayarlar'ın
 * KENDİ sürecindeki çöküş `startActivity` etrafındaki try/catch ile yakalanamaz;
 * yapılabilecek olan, gereksiz yönlendirmeyi hiç yapmamak ve riskli ekranı
 * (kurala özgü sayfa) bilinen sorunlu üreticide atlamaktır.
 */
enum class AyarHedefi {
    /** `Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS` */
    DND_ERISIMI,
    /** `Settings.ACTION_AUTOMATIC_ZEN_RULE_SETTINGS` + kural kimliği (API 35+) */
    KURAL_AYARI,
    /** `android.settings.ZEN_MODE_SETTINGS` (Modlar / Rahatsız Etmeyin) */
    MODLAR,
    /** Uygulama ayrıntıları (`ACTION_APPLICATION_DETAILS_SETTINGS`) */
    UYGULAMA_AYRINTI,
}

object AyarEkraniKarari {

    /** API 35 (VANILLA_ICE_CREAM) — kurala özgü ayar ekranı ve modlar arayüzü. */
    const val KURAL_AYARI_API = 35

    /** Kurala özgü sayfası Ayarlar'ı çökerttiği gözlenen üretici(ler) (küçük harf). */
    private val KURAL_SAYFASI_SORUNLU = setOf("samsung")

    /**
     * Rahatsız Etmeyin erişim ekranı yolu. Erişim zaten varsa BOŞ: yönlendirme yok
     * (çağıran "zaten var" der, kullanıcı Ayarlar'a gönderilmez).
     */
    fun erisimEkranlari(erisimVar: Boolean): List<AyarHedefi> =
        if (erisimVar) emptyList()
        else listOf(AyarHedefi.DND_ERISIMI, AyarHedefi.MODLAR, AyarHedefi.UYGULAMA_AYRINTI)

    /**
     * Modun ayar ekranı yolu. Kurala özgü sayfa yalnız API 35+, kural kimliği
     * varken ve sorunlu üretici DEĞİLKEN denenir; aksi halde genel Modlar ekranı.
     */
    fun modEkranlari(sdk: Int, uretici: String?, kuralId: String?): List<AyarHedefi> {
        val sonuc = mutableListOf<AyarHedefi>()
        val sorunlu = uretici?.trim()?.lowercase() in KURAL_SAYFASI_SORUNLU
        if (sdk >= KURAL_AYARI_API && !kuralId.isNullOrBlank() && !sorunlu) sonuc.add(AyarHedefi.KURAL_AYARI)
        sonuc.add(AyarHedefi.MODLAR)
        sonuc.add(AyarHedefi.UYGULAMA_AYRINTI)
        return sonuc
    }

    /**
     * `addAutomaticZenRule` `SecurityException` verdiğinde gerçekten erişim mi
     * eksik? Erişim varken atılan istisna başka bir sebepten (üretici kısıtı vb.)
     * doğar → "erisimYok" demek kullanıcıyı boşuna erişim ekranına yollar.
     */
    fun guvenlikHatasiSonucu(erisimVar: Boolean): String = if (erisimVar) "hata" else "erisimYok"
}
