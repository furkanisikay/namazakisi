package expo.modules.countdownnotification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Sesli anons alarmini karsilar ve TTS ile konusur.
 *
 * `goAsync()` ile ~10 sn'lik pencere acilir; [AnonsKonusucu] konusma bitince
 * (veya hata/zaman asiminda) pencereyi kapatir. Foreground Service YOKTUR —
 * kisa anons bu pencereye sigar (bkz. [AnonsZamanlayici] mimari notu).
 */
class AnonsReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_ANONS = "expo.countdown.ACTION_ANONS"
        const val EXTRA_ID = "anons_id"
        const val EXTRA_METIN = "anons_metin"
        private const val ETIKET = "AnonsReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_ANONS) return

        val id = intent.getStringExtra(EXTRA_ID).orEmpty()
        val metin = intent.getStringExtra(EXTRA_METIN)?.trim().orEmpty()

        // Alarm tuketildi -> kayittan dus (iptal listesi sismesin).
        if (id.isNotEmpty()) {
            try { AnonsZamanlayici.kayittanCikar(context.applicationContext, id) } catch (_: Exception) { /* yok sayilir */ }
        }

        if (metin.isEmpty()) return

        val sonuc = goAsync()
        var kapatildi = false
        try {
            AnonsKonusucu.konus(context.applicationContext, metin) {
                if (!kapatildi) {
                    kapatildi = true
                    try { sonuc.finish() } catch (_: Exception) { /* yok sayilir */ }
                }
            }
        } catch (e: Exception) {
            Log.e(ETIKET, "Anons calistirilamadi: ${e.message}")
            if (!kapatildi) {
                kapatildi = true
                try { sonuc.finish() } catch (_: Exception) { /* yok sayilir */ }
            }
        }
    }
}
