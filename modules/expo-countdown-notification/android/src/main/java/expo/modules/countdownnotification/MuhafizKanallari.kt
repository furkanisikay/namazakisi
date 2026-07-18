package expo.modules.countdownnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.util.Log

/**
 * Muhafiz bildirim kanallarini TEMBEL olusturur ve artik kullanilmayanlari toplar.
 *
 * NEDEN NATIVE (expo-notifications DEGIL): expo tarafinin kanal `sound` alani
 * `res/raw` icindeki bir dosya ADI bekler; kullanicinin sectigi `content://` URI'si
 * oradan gecmez. Kanal sesini dogru kurmanin garantili yolu `NotificationChannel`
 * uzerinde dogrudan `setSound(uri, attrs)` cagirmaktir.
 *
 * ANDROID TUZAKLARI (mimarinin sebebi):
 *  - Kanal sesi olusturulduktan SONRA degistirilemez.
 *  - `deleteNotificationChannel` + ayni id ile yeniden olusturma tombstone'a takilir:
 *    Android eski ayarlari diriltir.
 *  → Bu yuzden kanal id'si JS tarafinda sesin hash'inden uretilir; ses degisince id
 *    de degisir, ayni id'nin sesini degistirme ihtiyaci HIC DOGMAZ.
 *
 * TABAN kanallar (`muhafiz`, `muhafiz_acil`) BURADA olusturulmaz — onlari mevcut
 * JS akisi (BildirimServisi.izinIste) zaten kuruyor ve mevcut kurulumlarda kullanicinin
 * kendi tercihleri (titresim/onem/DND) o kanallarda birikmis durumda. Burasi yalniz
 * hash'li (ozel sesli) kanallarla ilgilenir.
 */
object MuhafizKanallari {
    private const val ETIKET = "MuhafizKanallari"

    /** Taban kanallar: bu modul tarafindan ne olusturulur ne de silinir. */
    private val TABAN_KANALLAR = setOf("muhafiz", "muhafiz_acil")

    private fun yonetici(context: Context): NotificationManager? =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    private fun muhafizKanaliMi(id: String): Boolean =
        id == "muhafiz" || id == "muhafiz_acil" ||
            id.startsWith("muhafiz_") || id.startsWith("muhafiz_acil_")

    /**
     * Kanali YOKSA olusturur (varsa dokunmaz — kullanicinin o kanalda yaptigi
     * degisiklikler korunur; zaten sesi degistirmek de mumkun degildir).
     */
    fun garantile(
        context: Context,
        kanalId: String,
        kanalAdi: String,
        aciklama: String,
        sesUri: String?,
        acilMi: Boolean
    ) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (kanalId.isBlank()) return

        val yonetici = yonetici(context) ?: return
        if (yonetici.getNotificationChannel(kanalId) != null) return

        try {
            val onem =
                if (acilMi) NotificationManager.IMPORTANCE_HIGH else NotificationManager.IMPORTANCE_DEFAULT
            val kanal = NotificationChannel(kanalId, kanalAdi, onem).apply {
                description = aciklama
                enableVibration(true)
                vibrationPattern =
                    if (acilMi) longArrayOf(0, 1000, 500, 1000, 500, 1000)
                    else longArrayOf(0, 500, 200, 500)
                if (acilMi) setBypassDnd(true)

                if (!sesUri.isNullOrBlank()) {
                    // USAGE_NOTIFICATION: bu bir bildirim sesidir (alarm degil) —
                    // kullanicinin bildirim ses seviyesi ve sessiz mod tercihine uyar.
                    val nitelikler = AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build()
                    setSound(Uri.parse(sesUri), nitelikler)
                }
            }
            yonetici.createNotificationChannel(kanal)
        } catch (e: Exception) {
            Log.e(ETIKET, "Kanal olusturulamadi ($kanalId): ${e.message}")
        }
    }

    /**
     * Artik referans verilmeyen HASH'LI muhafiz kanallarini siler.
     *
     * Taban kanallara ve muhafiz disi kanallara DOKUNMAZ. Kullanici bir sesi
     * degistirdiginde eski kanal oksuz kalir; toplanmazsa Android bildirim
     * ayarlarinda olu kanallar birikir.
     */
    fun copleriTopla(context: Context, korunacakIdler: List<String>) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val yonetici = yonetici(context) ?: return

        try {
            val korunacak = korunacakIdler.toSet()
            yonetici.notificationChannels
                .map { it.id }
                .filter { muhafizKanaliMi(it) && it !in TABAN_KANALLAR && it !in korunacak }
                .forEach { id ->
                    try {
                        yonetici.deleteNotificationChannel(id)
                    } catch (e: Exception) {
                        Log.w(ETIKET, "Kanal silinemedi ($id): ${e.message}")
                    }
                }
        } catch (e: Exception) {
            Log.e(ETIKET, "Kanal cop toplama basarisiz: ${e.message}")
        }
    }
}
