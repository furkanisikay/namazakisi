package expo.modules.countdownnotification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class CountdownReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_COUNTDOWN_FINISHED = "expo.countdown.ACTION_COUNTDOWN_FINISHED"
        const val ACTION_STOP = "expo.countdown.ACTION_STOP"

        const val EXTRA_ID = "countdown_id"
        const val EXTRA_TITLE = "title"
        const val EXTRA_BODY_TEMPLATE = "body_template"
        const val EXTRA_CHANNEL_ID = "channel_id"
        const val EXTRA_SMALL_ICON = "small_icon"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val id = intent.getStringExtra(EXTRA_ID) ?: return

        Log.d("CountdownReceiver", "Received action: $action for id: $id")

        when (action) {
            ACTION_COUNTDOWN_FINISHED -> {
                // Süre dolduğunda sayacı ve arka planı temizle ki notifee'nin kendi bildirimi devreye girsin.
                // 00:00 olarak ekranda kalmasına gerek yok
                CountdownNotificationHelper.cancelNotification(context, id)
            }
            ACTION_STOP -> {
                // Bildirimi kapat
                CountdownNotificationHelper.cancelNotification(context, id)
                
                // Eğer alarm kurulmuşsa onu da iptal et
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
                val cancelIntent = Intent(context, CountdownReceiver::class.java).apply {
                    this.action = ACTION_COUNTDOWN_FINISHED
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
    }
}
