package expo.modules.camigeofence

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

/**
 * Tek atışlık alarm kurucu (camide üst süresi, Namaz modu planı).
 *
 * Tam alarm izni yoksa (`canScheduleExactAlarms` false) `setAndAllowWhileIdle`'a
 * düşer — izinsiz tam alarm SecurityException atar (AGENTS.md notifee dersi).
 * Her iş YALNIZ BİR alarm kullanır (zincir): muhafızın alarm bütçesini yemesin.
 */
object PlanliAlarm {
    fun pendingIntent(ctx: Context, alici: Class<*>, eylem: String, istekKodu: Int): PendingIntent =
        PendingIntent.getBroadcast(
            ctx,
            istekKodu,
            Intent(ctx, alici).setAction(eylem).setPackage(ctx.packageName),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    fun kur(ctx: Context, zamanMs: Long, pi: PendingIntent) {
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, zamanMs, pi)
            } else {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, zamanMs, pi)
            }
        } catch (e: SecurityException) {
            Log.w("PlanliAlarm", "Tam alarm kurulamadi, yaklasik kuruluyor: ${e.message}")
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, zamanMs, pi)
        }
    }

    fun iptal(ctx: Context, pi: PendingIntent) {
        (ctx.getSystemService(Context.ALARM_SERVICE) as? AlarmManager)?.cancel(pi)
    }
}
