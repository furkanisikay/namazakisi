package expo.modules.countdownnotification

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import android.widget.RemoteViews

/**
 * Android Foreground Service that manages countdown notifications.
 *
 * Uses native CountDownTimer to update notification body text every second,
 * displaying the remaining time in the format "HH:mm:ss" or "mm:ss".
 * This approach is battery-efficient as it uses Android's native
 * Handler/Looper mechanism instead of JS runtime timers.
 *
 * Supports multiple concurrent countdowns, each with its own notification.
 * When the last countdown finishes or is stopped, the service stops itself.
 */
class CountdownService : Service() {

    private val manager = CountdownManager()
    private val tag = "CountdownService"

    companion object {
        const val ACTION_START = "expo.countdown.ACTION_START"
        const val ACTION_STOP = "expo.countdown.ACTION_STOP"
        const val ACTION_STOP_ALL = "expo.countdown.ACTION_STOP_ALL"

        const val EXTRA_ID = "countdown_id"
        const val EXTRA_TARGET_TIME = "target_time_ms"
        const val EXTRA_TITLE = "title"
        const val EXTRA_BODY_TEMPLATE = "body_template"
        const val EXTRA_CHANNEL_ID = "channel_id"
        const val EXTRA_SMALL_ICON = "small_icon"
        const val EXTRA_THEME_TYPE = "theme_type"

        // Foreground servisin kendi bildirimi icin sabit ID
        private const val FOREGROUND_NOTIFICATION_ID = 49999
        private const val FOREGROUND_CHANNEL_ID = "countdown_fg_channel"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d(tag, "Service created")
        createForegroundChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> handleStart(intent)
            ACTION_STOP -> handleStop(intent)
            ACTION_STOP_ALL -> handleStopAll()
            else -> {
                Log.w(tag, "Unknown action: ${intent?.action}")
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        Log.d(tag, "Service destroyed")
        manager.clear()
        super.onDestroy()
    }

    /**
     * Creates the foreground service notification channel.
     * Required for Android 8.0+ (API 26).
     */
    private fun createForegroundChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                FOREGROUND_CHANNEL_ID,
                "Geri Sayim Servisi",
                NotificationManager.IMPORTANCE_MIN
            ).apply {
                description = "Geri sayim bildirimleri icin arka plan servisi"
                setShowBadge(false)
            }
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    /**
     * Returns the small icon resource ID.
     * Falls back to app icon if the specified resource is not found.
     */
    private fun getSmallIconRes(iconName: String): Int {
        if (iconName.isNotEmpty()) {
            val resId = resources.getIdentifier(iconName, "drawable", packageName)
            if (resId != 0) return resId

            // mipmap'te ara
            val mipmapId = resources.getIdentifier(iconName, "mipmap", packageName)
            if (mipmapId != 0) return mipmapId
        }
        // Varsayilan uygulama ikonu
        return applicationInfo.icon
    }

    /**
     * Returns a PendingIntent that opens the app when the notification is tapped.
     */
    private fun getLaunchPendingIntent(): PendingIntent {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            ?: Intent()
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        return PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /**
     * Handles ACTION_START: creates or replaces a countdown and starts the timer.
     */
    private fun handleStart(intent: Intent) {
        val id = intent.getStringExtra(EXTRA_ID) ?: return
        val targetTimeMs = intent.getLongExtra(EXTRA_TARGET_TIME, 0L)
        val title = intent.getStringExtra(EXTRA_TITLE) ?: ""
        val bodyTemplate = intent.getStringExtra(EXTRA_BODY_TEMPLATE) ?: "{time}"
        val channelId = intent.getStringExtra(EXTRA_CHANNEL_ID) ?: FOREGROUND_CHANNEL_ID
        val smallIcon = intent.getStringExtra(EXTRA_SMALL_ICON) ?: ""
        val themeType = intent.getStringExtra(EXTRA_THEME_TYPE) ?: "vakit"

        val now = System.currentTimeMillis()
        val remaining = targetTimeMs - now

        if (remaining <= 0) {
            Log.w(tag, "Countdown $id: target time is in the past, skipping")
            return
        }

        Log.d(tag, "Starting countdown $id: ${remaining / 1000}s remaining")

        val notificationId = CountdownManager.generateNotificationId(id)
        val entry = CountdownEntry(
            id = id,
            targetTimeMs = targetTimeMs,
            title = title,
            bodyTemplate = bodyTemplate,
            channelId = channelId,
            smallIcon = smallIcon,
            themeType = themeType,
            notificationId = notificationId
        )
        manager.addOrReplace(entry)

        // Foreground servis baslat (ilk countdown'da)
        ensureForeground()

        // Ilk bildirimi hemen goster
        showCountdownNotification(entry, remaining)

        // CountDownTimer basalt
        val timer = object : CountDownTimer(remaining, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                showCountdownNotification(entry, millisUntilFinished)
            }

            override fun onFinish() {
                Log.d(tag, "Countdown $id finished")
                // Son bildirimi guncelle
                showFinishedNotification(entry)
                manager.remove(id)
                checkAndStopIfEmpty()
            }
        }
        entry.timer = timer
        timer.start()
    }

    /**
     * Handles ACTION_STOP: stops a specific countdown.
     */
    private fun handleStop(intent: Intent) {
        val id = intent.getStringExtra(EXTRA_ID) ?: return
        Log.d(tag, "Stopping countdown $id")

        val entry = manager.remove(id)
        if (entry != null) {
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.cancel(entry.notificationId)
        }
        checkAndStopIfEmpty()
    }

    /**
     * Handles ACTION_STOP_ALL: stops all countdowns and the service.
     */
    private fun handleStopAll() {
        Log.d(tag, "Stopping all countdowns")
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.getAll().forEach { nm.cancel(it.notificationId) }
        manager.clear()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    /**
     * Promotes the service to foreground with a minimal persistent notification.
     * This is required by Android for long-running background work.
     */
    private fun ensureForeground() {
        // Foreground service icin Android 8.0+ uzerinde gosterimi zorunlu bildirim.
        // Kullaniciyi rahatsiz etmemek adina metinleri kaldiriyor ve en dusuk onceligi (MIN) seciyoruz.
        val notification = NotificationCompat.Builder(this, FOREGROUND_CHANNEL_ID)
            .setContentTitle(null)
            .setContentText(null)
            .setSmallIcon(applicationInfo.icon)
            .setPriority(NotificationCompat.PRIORITY_MIN) // Bildirimi durum cubugundan gizler, sadece altta yigitla cikar
            .setOngoing(true)
            .setSilent(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            // Android 14+ icin foregroundServiceType belirtmek zorunlu
            startForeground(
                FOREGROUND_NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(FOREGROUND_NOTIFICATION_ID, notification)
        }
    }

    /**
     * Updates (or creates) the countdown notification with the current remaining time.
     * This is called every second by the CountDownTimer.
     *
     * @param entry The countdown entry
     * @param millisRemaining Remaining milliseconds
     */
    private fun showCountdownNotification(entry: CountdownEntry, millisRemaining: Long) {
        val timeFormatted = formatTime(millisRemaining)

        val collapsedLayoutRes = when (entry.themeType) {
            "iftar" -> R.layout.custom_iftar_notification_collapsed
            "sahur" -> R.layout.custom_sahur_notification_collapsed
            else -> R.layout.custom_vakit_notification_collapsed
        }
        val expandedLayoutRes = when (entry.themeType) {
            "iftar" -> R.layout.custom_iftar_notification
            "sahur" -> R.layout.custom_sahur_notification
            else -> R.layout.custom_vakit_notification
        }

        // Custom Collapsed RemoteViews (Dar Alan)
        val remoteViewsCollapsed = RemoteViews(packageName, collapsedLayoutRes)
        remoteViewsCollapsed.setTextViewText(R.id.tv_countdown, timeFormatted)

        // Custom Expanded RemoteViews (Geniş Alan)
        val remoteViewsExpanded = RemoteViews(packageName, expandedLayoutRes)
        remoteViewsExpanded.setTextViewText(R.id.tv_countdown, timeFormatted)

        // Eger bodyTemplate icinde '{time}' varsa temizle veya description olarak duzenle
        val descriptionText = entry.bodyTemplate.replace("{time}", "").replace("⏱️", "").trim()
        val descFinal = descriptionText.takeIf { it.isNotEmpty() } ?: when (entry.themeType) {
            "iftar" -> "Zaman daralıyor!"
            "sahur" -> "Yemeye içmeye devam, imsak yaklaşıyor!"
            else -> "Acele et, vaktin çıkmasına az kaldı!"
        }
        remoteViewsExpanded.setTextViewText(R.id.tv_description, descFinal)

        val builder = NotificationCompat.Builder(this, entry.channelId)
            .setSmallIcon(getSmallIconRes(entry.smallIcon))
            .setContentTitle(entry.title) // Dekorasyonlu stilde baslik olarak destekleyen cihazlarda ufakca gorunur.
            .setCustomContentView(remoteViewsCollapsed)
            .setCustomBigContentView(remoteViewsExpanded) // Genisletilmis haline buyuk tasarimi atar.
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setShowWhen(false) // Standart timestamp gizle
            .setContentIntent(getLaunchPendingIntent())
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setSilent(true) // Her saniye ses calinmamasi icin

        // Action buttons
        val stopIntent = Intent(this, CountdownService::class.java).apply {
            action = ACTION_STOP
            putExtra(EXTRA_ID, entry.id)
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            entry.id.hashCode(),
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, "Durdur", stopPendingIntent)

        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(entry.notificationId, builder.build())
    }
    /**
     * Shows a final notification when the countdown reaches zero.
     */
    private fun showFinishedNotification(entry: CountdownEntry) {
        val bodyText = entry.bodyTemplate.replace("{time}", "00:00")

        val notification = NotificationCompat.Builder(this, entry.channelId)
            .setContentTitle(entry.title)
            .setContentText(bodyText)
            .setSmallIcon(getSmallIconRes(entry.smallIcon))
            .setOngoing(false)
            .setShowWhen(false)
            .setContentIntent(getLaunchPendingIntent())
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(entry.notificationId, notification)
    }

    /**
     * If no countdowns remain, stops the foreground service.
     */
    private fun checkAndStopIfEmpty() {
        if (manager.isEmpty()) {
            Log.d(tag, "No more countdowns, stopping service")
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    /**
     * Formats milliseconds to a human-readable time string.
     * Format: "HH:ss:dd" if >= 1 hour, "mm:ss" otherwise.
     *
     * @param millis Remaining milliseconds
     * @return Formatted time string
     */
    private fun formatTime(millis: Long): String {
        val totalSeconds = millis / 1000
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60

        return if (hours > 0) {
            String.format("%d:%02d:%02d", hours, minutes, seconds)
        } else {
            String.format("%02d:%02d", minutes, seconds)
        }
    }
}
