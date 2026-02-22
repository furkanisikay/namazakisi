package expo.modules.countdownnotification

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.os.Build

/**
 * Expo Module bridge for countdown notification service.
 * Provides JS-callable functions to start/stop countdown notifications
 * that display remaining time in the notification body using a native
 * Android Foreground Service.
 */
class ExpoCountdownNotificationModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("ExpoCountdownNotification")

        /**
         * Starts a countdown notification with the given configuration.
         * Launches a Foreground Service that uses CountDownTimer
         * to update the notification body every second.
         *
         * @param id Unique countdown identifier
         * @param targetTimeMs Target time in epoch milliseconds
         * @param title Notification title text
         * @param bodyTemplate Body template with {time} placeholder
         * @param channelId Android notification channel ID
         * @param smallIcon Resource name for small icon (optional)
         */
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
                val intent = Intent(context, CountdownService::class.java).apply {
                    action = CountdownService.ACTION_START
                    putExtra(CountdownService.EXTRA_ID, id)
                    putExtra(CountdownService.EXTRA_TARGET_TIME, targetTimeMs.toLong())
                    putExtra(CountdownService.EXTRA_TITLE, title)
                    putExtra(CountdownService.EXTRA_BODY_TEMPLATE, bodyTemplate)
                    putExtra(CountdownService.EXTRA_CHANNEL_ID, channelId)
                    putExtra(CountdownService.EXTRA_SMALL_ICON, smallIcon)
                    putExtra(CountdownService.EXTRA_THEME_TYPE, themeType)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            }
            Unit
        }

        /**
         * Stops a specific countdown by its ID.
         * If no more countdowns remain, the service will stop itself.
         *
         * @param id The countdown identifier to stop
         */
        Function("stopCountdown") { id: String ->
            val context = appContext.reactContext
            if (context != null) {
                val intent = Intent(context, CountdownService::class.java).apply {
                    action = CountdownService.ACTION_STOP
                    putExtra(CountdownService.EXTRA_ID, id)
                }
                context.startService(intent)
            }
            Unit
        }

        /**
         * Stops all active countdowns and the foreground service.
         */
        Function("stopAll") {
            val context = appContext.reactContext
            if (context != null) {
                val intent = Intent(context, CountdownService::class.java).apply {
                    action = CountdownService.ACTION_STOP_ALL
                }
                context.startService(intent)
            }
            Unit
        }
    }
}
