package expo.modules.countdownnotification.cekirdek

/**
 * "Kendi dosyanizdan secin" ice aktarimin SAF kurallari (android.* import ETMEZ;
 * JVM testi: `SesDosyasiKurallariTest`).
 *
 * Akisin kendisi `SesIceAktarici`dadir: SAF ile secilen dosya gecici izinle okunur,
 * dogrulanir ve MediaStore'a (Notifications/NamazAkisi, IS_NOTIFICATION=1) kopyalanir.
 * Buradaki kararlar: hangi bicim kabul edilir, sinirlar, kayit adi.
 */
object SesDosyasiKurallari {

    /** Bildirim sesi icin ust boyut sinir (20 MB). Ezan kaydi 128 kbps ~5 dk ≈ 5 MB. */
    const val MAKS_BOYUT_BAYT: Long = 20L * 1024 * 1024

    /**
     * Ust sure siniri (8 dk). Tam bir ezan 2–5 dk surer; daha uzunu (sarki listesi,
     * kitap) bildirim sesi olarak anlamsizdir ve her vakitte dakikalarca calardi.
     */
    const val MAKS_SURE_MS: Long = 8L * 60 * 1000

    /** Bu surenin altindaki "ses" cozulemeyen/bos dosyadir. */
    const val MIN_SURE_MS: Long = 200L

    /** MediaStore'daki klasor (Environment.DIRECTORY_NOTIFICATIONS altinda). ASCII. */
    const val KLASOR = "NamazAkisi"

    enum class Hata(val kod: String) {
        BICIM("bicim"),
        BOYUT("boyut"),
        SURE("sure"),
    }

    private val UZANTI_MIME = mapOf(
        "mp3" to "audio/mpeg",
        "m4a" to "audio/mp4",
        "aac" to "audio/aac",
        "ogg" to "audio/ogg",
        "oga" to "audio/ogg",
        "opus" to "audio/ogg",
        "wav" to "audio/x-wav",
        "flac" to "audio/flac",
        "amr" to "audio/amr",
        "3gp" to "audio/3gpp",
    )

    private val MIME_UZANTI = mapOf(
        "audio/mpeg" to "mp3",
        "audio/mp3" to "mp3",
        "audio/mp4" to "m4a",
        "audio/x-m4a" to "m4a",
        "audio/m4a" to "m4a",
        "audio/aac" to "aac",
        "audio/ogg" to "ogg",
        "audio/opus" to "ogg",
        "audio/vorbis" to "ogg",
        "audio/wav" to "wav",
        "audio/x-wav" to "wav",
        "audio/wave" to "wav",
        "audio/flac" to "flac",
        "audio/x-flac" to "flac",
        "audio/amr" to "amr",
        "audio/3gpp" to "3gp",
    )

    private fun uzanti(dosyaAdi: String?): String? {
        val ad = dosyaAdi?.trim() ?: return null
        val nokta = ad.lastIndexOf('.')
        if (nokta <= 0 || nokta == ad.length - 1) return null
        return ad.substring(nokta + 1).lowercase()
    }

    /**
     * Dosyanin MediaStore'a yazilacak MIME turu; ses degilse null.
     *
     * MediaStore Audio koleksiyonu yalniz `audio/` turlerini kabul eder. Bazi saglayicilar
     * (bulut, dosya yoneticisi) `application/ogg` ya da `application/octet-stream`
     * bildirir → o durumda uzantiya bakilir.
     */
    fun mimeCoz(bildirilen: String?, dosyaAdi: String?): String? {
        val m = bildirilen?.trim()?.lowercase()
        if (m != null && m.startsWith("audio/") && m.length > "audio/".length) return m
        return UZANTI_MIME[uzanti(dosyaAdi)]
    }

    /** Kayit icin uzanti: once dosya adindaki (taniniyorsa), yoksa MIME'den. */
    fun uzantiCoz(mime: String, dosyaAdi: String?): String {
        val u = uzanti(dosyaAdi)
        if (u != null && UZANTI_MIME.containsKey(u)) return u
        return MIME_UZANTI[mime] ?: "mp3"
    }

    /** Boyut siniri; bilinmeyen boyut (null) kopyalama sirasinda olculur. */
    fun boyutGecerliMi(boyut: Long?): Boolean = boyut == null || (boyut in 1..MAKS_BOYUT_BAYT)

    /** Sure kontrolu: cozulemeyen (null/0) dosya BICIM hatasidir, uzun dosya SURE hatasi. */
    fun sureHatasi(sureMs: Long?): Hata? = when {
        sureMs == null || sureMs < MIN_SURE_MS -> Hata.BICIM
        sureMs > MAKS_SURE_MS -> Hata.SURE
        else -> null
    }

    /**
     * Kullaniciya gorunen ad: uzantisiz, dosya yolu icin tehlikeli karakterlerden
     * arindirilmis, en fazla 60 karakter. Turkce harfler KORUNUR (yalniz gorunur ad).
     */
    fun gorunenAd(dosyaAdi: String?): String {
        val ham = dosyaAdi?.trim().orEmpty()
        val nokta = ham.lastIndexOf('.')
        val govde = if (nokta > 0) ham.substring(0, nokta) else ham
        val temiz = govde
            .replace(Regex("[\\\\/:*?\"<>|\\p{Cntrl}]"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()
            .take(60)
            .trim()
        return temiz.ifEmpty { "Ses" }
    }

    /**
     * MediaStore'daki dosya adi: `<gorunen ad>_<icerik izi 8>.<uzanti>`.
     * Icerik izi ayni dosyanin ikinci kez eklenmesinde mevcut kaydi bulmaya yarar
     * (klasorde kopya birikmesin).
     */
    fun kayitAdi(dosyaAdi: String?, icerikIzi: String, uzanti: String): String =
        "${gorunenAd(dosyaAdi)}_${icerikIzi.take(8)}.$uzanti"
}
