package expo.modules.countdownnotification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class CountdownReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_COUNTDOWN_FINISHED = "expo.countdown.ACTION_COUNTDOWN_FINISHED"
        const val ACTION_STOP = "expo.countdown.ACTION_STOP"
        /** Öne çıkarılmış (Live Update) sayacın dakikalık yeniden çizimi (issue #282). */
        const val ACTION_CANLI_TAZELE = "expo.countdown.ACTION_CANLI_TAZELE"
        /** Öne çıkarılmış vakit sayacındaki "Kıldım" (issue #282). */
        const val ACTION_KILDIM = "expo.countdown.ACTION_KILDIM"

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
                // Bildirimi kapat; kurulmuş bitiş alarmını da iptal et
                CountdownNotificationHelper.cancelNotification(context, id)
                CountdownNotificationHelper.bitisAlarminiIptalEt(context, id)
            }
            ACTION_CANLI_TAZELE -> CanliGuncelleme.tazele(context, id)
            ACTION_KILDIM -> CanliGuncelleme.kildimIsle(
                context,
                id,
                intent.getStringExtra(CanliGuncelleme.EK_TARIH),
                intent.getStringExtra(CanliGuncelleme.EK_VAKIT)
            )
        }
    }
}
