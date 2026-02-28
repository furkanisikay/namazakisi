package expo.modules.countdownnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import android.widget.RemoteViews

object CountdownNotificationHelper {

    const val FOREGROUND_CHANNEL_ID = "countdown_fg_channel"
    private val activeIds = mutableSetOf<String>()

    fun registerActiveId(id: String) {
        synchronized(activeIds) {
            activeIds.add(id)
        }
    }

    fun removeActiveId(id: String) {
        synchronized(activeIds) {
            activeIds.remove(id)
        }
    }

    fun getActiveIds(): List<String> {
        return synchronized(activeIds) { activeIds.toList() }
    }

    fun generateNotificationId(id: String): Int {
        return (id.hashCode() and 0x7FFFFFFF) + 50000
    }

    fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                FOREGROUND_CHANNEL_ID,
                "Geri Sayim Bildirimleri",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Geri sayim bildirimleri icin kanal"
                setShowBadge(false)
            }
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun getSmallIconRes(context: Context, iconName: String): Int {
        if (iconName.isNotEmpty()) {
            val resId = context.resources.getIdentifier(iconName, "drawable", context.packageName)
            if (resId != 0) return resId

            val mipmapId = context.resources.getIdentifier(iconName, "mipmap", context.packageName)
            if (mipmapId != 0) return mipmapId
        }
        return context.applicationInfo.icon
    }

    private fun getLaunchPendingIntent(context: Context): PendingIntent {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?: Intent()
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        return PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun showCountdownNotification(
        context: Context,
        id: String,
        targetTimeMs: Long,
        title: String,
        bodyTemplate: String,
        channelId: String,
        smallIcon: String,
        themeType: String
    ) {
        createChannel(context)
        registerActiveId(id)

        val notificationId = generateNotificationId(id)
        val now = System.currentTimeMillis()
        val millisRemaining = targetTimeMs - now

        if (millisRemaining <= 0) {
            cancelNotification(context, id)
            return
        }

        val collapsedLayoutRes = when (themeType) {
            "iftar" -> R.layout.custom_iftar_notification_collapsed
            "sahur" -> R.layout.custom_sahur_notification_collapsed
            else -> R.layout.custom_vakit_notification_collapsed
        }
        val expandedLayoutRes = when (themeType) {
            "iftar" -> R.layout.custom_iftar_notification
            "sahur" -> R.layout.custom_sahur_notification
            else -> R.layout.custom_vakit_notification
        }

        val baseTimeMs = android.os.SystemClock.elapsedRealtime() + millisRemaining

        val remoteViewsCollapsed = RemoteViews(context.packageName, collapsedLayoutRes)
        remoteViewsCollapsed.setChronometer(R.id.tv_countdown, baseTimeMs, null, true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            remoteViewsCollapsed.setChronometerCountDown(R.id.tv_countdown, true)
        }

        val remoteViewsExpanded = RemoteViews(context.packageName, expandedLayoutRes)
        remoteViewsExpanded.setChronometer(R.id.tv_countdown, baseTimeMs, null, true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            remoteViewsExpanded.setChronometerCountDown(R.id.tv_countdown, true)
        }

        val descriptionText = bodyTemplate.replace("{time}", "").replace("⏱️", "").trim()
        val descFinal = descriptionText.takeIf { it.isNotEmpty() } ?: when (themeType) {
            "iftar" -> "Zaman daralıyor!"
            "sahur" -> "Yemeye içmeye devam, imsak yaklaşıyor!"
            else -> "Acele et, vaktin çıkmasına az kaldı!"
        }
        remoteViewsExpanded.setTextViewText(R.id.tv_description, descFinal)

        val activeChannelId = if (channelId.isNotEmpty()) channelId else FOREGROUND_CHANNEL_ID
        val builder = NotificationCompat.Builder(context, activeChannelId)
            .setSmallIcon(getSmallIconRes(context, smallIcon))
            .setContentTitle(title)
            .setCustomContentView(remoteViewsCollapsed)
            .setCustomBigContentView(remoteViewsExpanded)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false)
            .setContentIntent(getLaunchPendingIntent(context))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setSilent(true)

        val stopIntent = Intent(context, CountdownReceiver::class.java).apply {
            action = CountdownReceiver.ACTION_STOP
            putExtra(CountdownReceiver.EXTRA_ID, id)
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, "Durdur", stopPendingIntent)

        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(notificationId, builder.build())
    }



    fun cancelNotification(context: Context, id: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(generateNotificationId(id))
        removeActiveId(id)
    }
}
