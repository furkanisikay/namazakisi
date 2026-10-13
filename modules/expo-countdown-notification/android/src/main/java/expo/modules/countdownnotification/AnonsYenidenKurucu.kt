package expo.modules.countdownnotification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Cihaz yeniden baslayinca ya da uygulama guncellenince sesli anons alarmlarini
 * geri kurar (Android tum alarmlari bu iki olayda siler).
 *
 * Modul kendi kendine yeterli kalsin diye ayri alicidir; uygulamanin widget
 * alicisina eklenmez. LOCKED_BOOT_COMPLETED DINLENMEZ: kayit kimlik korumali
 * depodadir ve ilk kilit acilisindan once okunamaz.
 */
class AnonsYenidenKurucu : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED -> {
                try {
                    val sayi = AnonsZamanlayici.yenidenKur(context.applicationContext)
                    Log.i("AnonsYenidenKurucu", "$sayi sesli anons yeniden kuruldu (${intent.action})")
                } catch (e: Exception) {
                    Log.e("AnonsYenidenKurucu", "Anonslar yeniden kurulamadi: ${e.message}")
                }
                // Now Bar planı (issue #282): alarm zinciri ve gösterilen sayaçlar da silindi.
                try {
                    CanliPlan.yenidenKur(context.applicationContext)
                } catch (e: Exception) {
                    Log.e("AnonsYenidenKurucu", "Canli plan yeniden kurulamadi: ${e.message}")
                }
            }
        }
    }
}
