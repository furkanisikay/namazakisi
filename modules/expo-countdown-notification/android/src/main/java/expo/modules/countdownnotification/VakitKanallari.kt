package expo.modules.countdownnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.util.Log

/**
 * "Vakit girdi" bildirimlerinin SESE OZGU kanallari (`vakit_bildirim_<hash8>`).
 *
 * Muhafiz kanallarinin ([MuhafizKanallari]) ikizidir ama AYRI bir uzaydadir:
 *  - Onem ve titresim TABAN `vakit_bildirim` kanaliyla BIREBIR aynidir
 *    (`BildirimServisi.izinIste`: IMPORTANCE_DEFAULT, desen [0,250,250,250], yesil isik).
 *    Kullanici yalniz sesi degistirdigi icin bildirimin davranisi degismemeli.
 *  - Cop toplama YALNIZ `vakit_bildirim_` onekli kanallari siler; taban kanala ve
 *    muhafiz kanallarina dokunmaz (muhafizin GC'si de bunlara dokunmaz).
 *
 * Kanal sesi kurulduktan sonra degistirilemez → id JS'te sesin hash'inden uretilir
 * (`core/bildirim/vakitBildirimSesi.ts`).
 */
object VakitKanallari {
    private const val ETIKET = "VakitKanallari"
    private const val TABAN = "vakit_bildirim"
    private const val ONEK = "vakit_bildirim_"
    private val DESEN = longArrayOf(0, 250, 250, 250)

    private fun yonetici(context: Context): NotificationManager? =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    /** Kanal YOKSA olusturur; varsa dokunmaz (kullanicinin kanal tercihleri korunur). */
    fun garantile(context: Context, kanalId: String, kanalAdi: String, aciklama: String, sesUri: String) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (!kanalId.startsWith(ONEK) || sesUri.isBlank()) return
        val yonetici = yonetici(context) ?: return
        try {
            if (yonetici.getNotificationChannel(kanalId) != null) return
            val kanal = NotificationChannel(kanalId, kanalAdi, NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = aciklama
                enableVibration(true)
                vibrationPattern = DESEN
                enableLights(true)
                lightColor = Color.parseColor("#4CAF50")
                setSound(
                    Uri.parse(sesUri),
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build()
                )
            }
            yonetici.createNotificationChannel(kanal)
        } catch (e: Exception) {
            Log.e(ETIKET, "Kanal olusturulamadi ($kanalId): ${e.message}")
        }
    }

    /** Listede olmayan `vakit_bildirim_*` kanallarini siler. Tabana asla dokunmaz. */
    fun copleriTopla(context: Context, korunacakIdler: List<String>) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val yonetici = yonetici(context) ?: return
        try {
            val korunacak = korunacakIdler.toSet()
            val kanallar = yonetici.notificationChannels ?: return
            kanallar
                .map { it.id }
                .filter { it != TABAN && it.startsWith(ONEK) && it !in korunacak }
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
