package expo.modules.countdownnotification

import android.content.Context
import android.content.Intent
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.util.Log

/**
 * Sistem ses secici (RingtoneManager) + secilen sesin adi ve onizlemesi.
 *
 * NEDEN SISTEM SECICI (kendi dosya secicimiz DEGIL):
 *  - IZIN GEREKTIRMEZ. `ACTION_RINGTONE_PICKER` depolama izni istemez; boylece
 *    `READ_MEDIA_AUDIO` eklemek zorunda kalmayiz (uygulama manifesti depolama
 *    izinlerini bilincli olarak `tools:node="remove"` ile siliyor).
 *  - Kullanicinin KENDI ekledigi sesleri zaten listeler; cogu OEM secicisinde
 *    "+ Ses ekle" affordance'i vardir → "kendi muzigini sec" ihtiyaci karsilanir.
 *  - Kendi SAF hattimizi kursaydik iki bilinen tuzaga duserdik: document picker'in
 *    `copyToCacheDirectory` varsayilani (cache tahliye edilince ses SESSIZCE
 *    kaybolur) ve `takePersistableUriPermission` cagrilmadigi icin cihaz yeniden
 *    baslayinca erisimin bitmesi. (Thunderbird ekibi kendi SAF hattini kurup
 *    SILDI, sistem secicisine devretti.)
 *
 * Sonuc URI'si `content://...` semasindadir ve dogrudan `NotificationChannel`
 * sesine verilir (bkz. [MuhafizKanallari]).
 */
object SesSecici {
    private const val ETIKET = "SesSecici"

    /** `OnActivityResult` ile eslesen istek kodu. */
    const val ISTEK_KODU = 0x5E51 // "SES1"

    /**
     * Calan onizleme. `@Volatile`: onizleme cagrilari modul kuyrugundan
     * (AsyncFunction → arka plan thread'i) gelir, `durdur()` ise ekran kapanisinda
     * baska bir thread'den cagrilabilir; gorunurluk garantisi olmadan biri
     * digerinin yazdigini gormeyebilir ve calar SIZAR.
     */
    @Volatile
    private var aktifOnizleme: Ringtone? = null

    /**
     * Ses secici Intent'i. Mevcut secim isaretlensin diye [mevcutUri] verilir;
     * "Varsayilan" ve "Yok" (sessiz) secenekleri de gosterilir.
     */
    fun seciciIntenti(baslik: String, mevcutUri: String?): Intent {
        return Intent(RingtoneManager.ACTION_RINGTONE_PICKER).apply {
            putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_NOTIFICATION)
            putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, baslik)
            putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
            putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
            putExtra(
                RingtoneManager.EXTRA_RINGTONE_EXISTING_URI,
                mevcutUri?.takeIf { it.isNotBlank() }?.let { Uri.parse(it) }
            )
        }
    }

    /**
     * Secici sonucundan URI'yi cikarir; kullanici vazgectiyse (veya sonuc
     * cozulemezse) null.
     *
     * NEDEN try/catch: `getParcelableExtra` extras Bundle'ini TUMDEN unmarshall
     * eder. Bu Intent bize UCUNCU TARAF bir Activity'den (OEM ses secicisi —
     * Samsung/Xiaomi kendi secicilerini koyar) geliyor ve Bundle icinde bizim
     * class loader'imizin tanimadigi Parcelable siniflar olabilir →
     * `BadParcelableException`. Yakalanmazsa ana thread'de yakalanmamis istisna
     * olur ve uygulama COKER. Sonuc okunamiyorsa "vazgecildi" gibi davranmak
     * kullanici acisindan dogru davranistir (secim bozulmadan kalir).
     *
     * API 33+ tip guvenli asiri yukleme kullanilir; altinda deprecated yol.
     */
    fun sonucuCoz(veri: Intent?): Uri? {
        if (veri == null) return null
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                veri.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI, Uri::class.java)
            } else {
                @Suppress("DEPRECATION")
                veri.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
            }
        } catch (e: Exception) {
            Log.w(ETIKET, "Secici sonucu cozulemedi: ${e.message}")
            null
        }
    }

    /**
     * URI'nin kullaniciya gosterilecek adi. Ad cozulemezse (erisim kaybi, silinmis
     * dosya) bos string doner — cagiran taraf kendi yedek metnini gosterir.
     */
    fun sesAdi(context: Context, uri: String?): String {
        if (uri.isNullOrBlank()) return ""
        return try {
            RingtoneManager.getRingtone(context, Uri.parse(uri))?.getTitle(context) ?: ""
        } catch (e: Exception) {
            Log.w(ETIKET, "Ses adi cozulemedi: ${e.message}")
            ""
        }
    }

    /**
     * Secilen sesi ANINDA calar (onizleme). `expo-audio`'nun `content://` calip
     * calmadigi dogrulanmadigi icin bu yol native tutulur — garantili.
     *
     * Ust uste basma: onceki onizleme durdurulur, ses ust uste BINMEZ.
     */
    fun onizle(context: Context, uri: String?) {
        if (uri.isNullOrBlank()) return
        durdur()
        try {
            aktifOnizleme = RingtoneManager.getRingtone(context, Uri.parse(uri))?.also { it.play() }
        } catch (e: Exception) {
            Log.w(ETIKET, "Ses onizlemesi calinamadi: ${e.message}")
            aktifOnizleme = null
        }
    }

    /**
     * Calan onizlemeyi durdurur (idempotent).
     *
     * `stop()` KOSULSUZ cagrilir: `isPlaying` kontrolu bir SIZINTIYDI. Ses kendi
     * kendine bittiyse `isPlaying == false` olur ama Ringtone'un ic MediaPlayer'i
     * HALA ayaktadir — `Ringtone.stop()` `destroyLocalPlayer()`'i cagiran TEK
     * yoldur. Kontrolle atlanirsa referans null'lanir ve player/AudioTrack birikir
     * (alan statik, surec omru boyunca yasar). Bitmis bir Ringtone'da `stop()`
     * cagirmak guvenlidir.
     */
    fun durdur() {
        try {
            aktifOnizleme?.stop()
        } catch (e: Exception) {
            Log.w(ETIKET, "Ses onizlemesi durdurulamadi: ${e.message}")
        }
        aktifOnizleme = null
    }

    /**
     * Onizleme HALA caliyor mu? JS tarafi sesin bitisini bekleyebilsin diye
     * (bkz. `OnizlemeSesServisi.bitisiniBekle`): kullanici uzun bir muzik secmis
     * olabilir, sesli anonsu sabit bir gecikmeyle ustune bindirmemeliyiz.
     */
    fun caliyorMu(): Boolean =
        try {
            aktifOnizleme?.isPlaying == true
        } catch (e: Exception) {
            Log.w(ETIKET, "Onizleme durumu okunamadi: ${e.message}")
            false
        }
}
