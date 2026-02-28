package expo.modules.countdownnotification

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.os.Build
import android.content.Context
import android.util.Log

class ExpoCountdownNotificationModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("ExpoCountdownNotification")

        Function("startCountdown") {
            id: String,
            targetTimeMs: Double,
            title: String,
            bodyTemplate: String,
            channelId: String,
            smallIcon: String,
            themeType: String ->

            val context = appContext.reactContext
            if (context != null) {
                // Bildirimi doğrudan göster (Chronometer ile saymaya başlar)
                CountdownNotificationHelper.showCountdownNotification(
                    context, id, targetTimeMs.toLong(), title, bodyTemplate, channelId, smallIcon, themeType
                )

                // Süre dolduğunda tetiklenecek AlarmManager
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
                val intent = Intent(context, CountdownReceiver::class.java).apply {
                    action = CountdownReceiver.ACTION_COUNTDOWN_FINISHED
                    putExtra(CountdownReceiver.EXTRA_ID, id)
                    putExtra(CountdownReceiver.EXTRA_TITLE, title)
                    putExtra(CountdownReceiver.EXTRA_BODY_TEMPLATE, bodyTemplate)
                    putExtra(CountdownReceiver.EXTRA_CHANNEL_ID, channelId)
                    putExtra(CountdownReceiver.EXTRA_SMALL_ICON, smallIcon)
                }

                val pendingIntent = android.app.PendingIntent.getBroadcast(
                    context,
                    id.hashCode(),
                    intent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        if (alarmManager.canScheduleExactAlarms()) {
                            alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs.toLong(), pendingIntent)
                        } else {
                            alarmManager.setAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs.toLong(), pendingIntent)
                        }
                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs.toLong(), pendingIntent)
                    } else {
                        alarmManager.setExact(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs.toLong(), pendingIntent)
                    }
                } catch (e: Exception) {
                    Log.e("CountdownModule", "Alarm ayarlanamadi: \${e.message}")
                }
            }
            Unit
        }

        Function("stopCountdown") { id: String ->
            val context = appContext.reactContext
            if (context != null) {
                // Bildirimi iptal et
                CountdownNotificationHelper.cancelNotification(context, id)

                // Varsa iptal et (AlarmManager)
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
                val cancelIntent = Intent(context, CountdownReceiver::class.java).apply {
                    action = CountdownReceiver.ACTION_COUNTDOWN_FINISHED
                }
                val pendingIntent = android.app.PendingIntent.getBroadcast(
                    context,
                    id.hashCode(),
                    cancelIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                alarmManager.cancel(pendingIntent)
            }
            Unit
        }

        Function("stopAll") {
            val context = appContext.reactContext
            if (context != null) {
                val ids = CountdownNotificationHelper.getActiveIds()
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager

                ids.forEach { id ->
                    CountdownNotificationHelper.cancelNotification(context, id)

                    val cancelIntent = Intent(context, CountdownReceiver::class.java).apply {
                        action = CountdownReceiver.ACTION_COUNTDOWN_FINISHED
                    }
                    val pendingIntent = android.app.PendingIntent.getBroadcast(
                        context,
                        id.hashCode(),
                        cancelIntent,
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                    )
                    alarmManager.cancel(pendingIntent)
                }
            }
            Unit
        }
    }
}
