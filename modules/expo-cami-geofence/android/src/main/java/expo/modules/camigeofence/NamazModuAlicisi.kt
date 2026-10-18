package expo.modules.camigeofence

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Namaz modu yayınları:
 *  - plan alarmı (sıradaki pencere geçişi),
 *  - süre alarmı (`NamazModu.ACTION_SURE`: bilekten açılan modun bitişi),
 *  - API 35+ `ACTION_AUTOMATIC_ZEN_RULE_STATUS_CHANGED`: kullanıcı modu elle
 *    kapattıysa (DEACTIVATED) o turda yeniden açılmaz; kuralı sildiyse (REMOVED)
 *    özellik kapanır — kullanıcının kararı zorla geri alınmaz.
 */
class NamazModuAlicisi : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val ctx = context.applicationContext
        when (intent.action) {
            NamazModuZamanlayici.ACTION_PLAN -> NamazModuZamanlayici.uygula(ctx)
            NamazModu.ACTION_SURE -> {
                NamazModu.suresiGecenleriTemizle(ctx)
                CamiOlaylari.yay("namazModu")
            }
            NotificationManager.ACTION_AUTOMATIC_ZEN_RULE_STATUS_CHANGED -> {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) return
                val id = intent.getStringExtra(NotificationManager.EXTRA_AUTOMATIC_ZEN_RULE_ID)
                if (id == null || id != NamazModu.kuralId(ctx)) return
                when (intent.getIntExtra(NotificationManager.EXTRA_AUTOMATIC_ZEN_RULE_STATUS, NotificationManager.AUTOMATIC_RULE_STATUS_UNKNOWN)) {
                    NotificationManager.AUTOMATIC_RULE_STATUS_DEACTIVATED -> {
                        if (NamazModu.aktifMi(ctx)) NamazModu.kullaniciKapatti(ctx)
                    }
                    NotificationManager.AUTOMATIC_RULE_STATUS_REMOVED -> NamazModu.kuralSilindi(ctx)
                }
                CamiOlaylari.yay("namazModu")
            }
        }
    }
}
