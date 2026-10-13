package expo.modules.camigeofence

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Yeniden başlatma / güncelleme: Android geofence'leri ve alarmları siler.
 * Camileri son merkeze (bayat → `INITIAL_TRIGGER_EXIT` ile) yeniden kaydeder,
 * Namaz modu plan zincirini ve camide üst süresini geri kurar. Modülün kendi
 * alıcısıdır (AnonsYenidenKurucu deseni). LOCKED_BOOT_COMPLETED DİNLENMEZ.
 */
class CamiYenidenKurucu : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED && intent.action != Intent.ACTION_MY_PACKAGE_REPLACED) return
        val ctx = context.applicationContext
        val sonuc = goAsync()
        try {
            CamiDurumu.yenidenKur(ctx)
            NamazModuZamanlayici.yenidenKur(ctx)
            CamiIzleyici.sonMerkezeGoreKur(ctx) {
                Log.i("CamiYenidenKurucu", "Camideyim yeniden kuruldu: $it (${intent.action})")
                try { sonuc.finish() } catch (_: Exception) { /* yok */ }
            }
        } catch (e: Exception) {
            Log.e("CamiYenidenKurucu", "Yeniden kurulamadi: ${e.message}")
            try { sonuc.finish() } catch (_: Exception) { /* yok */ }
        }
    }
}
