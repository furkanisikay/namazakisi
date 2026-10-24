package expo.modules.countdownnotification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import android.widget.RemoteViews
import expo.modules.countdownnotification.cekirdek.CanliGuncellemeKurallari

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
            // Her çağrıda yeniden verilir (eski davranış): var olan kanalın yalnız adı ve
            // açıklaması güncellenir → dil değişince ad da arayüz diline geçer.
            val m = context.dildeBaglam()
            val channel = NotificationChannel(
                FOREGROUND_CHANNEL_ID,
                m.getString(R.string.countdown_kanal_genel_ad),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = m.getString(R.string.countdown_kanal_genel_aciklama)
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
        themeType: String,
        autoDismissAtTarget: Boolean = false,
        canli: CanliGuncellemeKurallari.EkYuk? = null
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

        // Android 16 Live Update (issue #282): yalnız istendiğinde (JS ek yük verdi),
        // yalnız izinli temada (seri YOK) ve yalnız sistem öne çıkarmaya izin
        // veriyorsa standart şablonlu İKİZ yola geçilir. Aksi halde aşağıdaki özel
        // RemoteViews yolu BİREBİR çalışır.
        if (canli != null && CanliGuncellemeKurallari.oneCikarilabilirMi(themeType) &&
            CanliGuncelleme.destekleniyorMu(context)
        ) {
            val durum = CanliGuncellemeKurallari.Durum(
                id = id,
                hedefMs = targetTimeMs,
                baslik = title,
                metin = aciklamaMetni(context, bodyTemplate, themeType),
                kanalId = channelId,
                kucukIkon = smallIcon,
                tema = themeType,
                hedefteKaybol = autoDismissAtTarget,
                baslangicMs = canli.baslangicMs,
                bolumler = canli.bolumler,
                kildimTarih = canli.kildimTarih,
                kildimVakit = canli.kildimVakit,
            )
            if (CanliGuncelleme.goster(context, durum)) return
            // Gösterilemediyse (beklenmeyen hata) eski yola düş: kullanıcı sayaçsız kalmasın.
        }

        // Eski yol: önceki bir öne çıkarılmış gösterimin dakikalık tazelemesi kalmışsa
        // bu bildirimi standart şablonla EZMESİN (kullanıcı Canlı güncellemeleri kapattı).
        try {
            CanliGuncelleme.temizle(context, id)
        } catch (_: Exception) {
        }

        val collapsedLayoutRes = when (themeType) {
            "iftar" -> R.layout.custom_iftar_notification_collapsed
            "sahur" -> R.layout.custom_sahur_notification_collapsed
            "seri" -> R.layout.custom_seri_notification_collapsed
            else -> R.layout.custom_vakit_notification_collapsed
        }
        val expandedLayoutRes = when (themeType) {
            "iftar" -> R.layout.custom_iftar_notification
            "sahur" -> R.layout.custom_sahur_notification
            "seri" -> R.layout.custom_seri_notification
            else -> R.layout.custom_vakit_notification
        }

        // Önek layout'ta DEĞİL kodda: RemoteViews'i SystemUI CİHAZ dilinde şişirir,
        // uygulamanın arayüz dili ancak buradan verilebilir.
        val m = context.dildeBaglam()
        val (onekGenis, onekDar) = when (themeType) {
            "iftar" -> R.string.countdown_onek_iftar to R.string.countdown_onek_iftar_dar
            "sahur" -> R.string.countdown_onek_sahur to R.string.countdown_onek_sahur_dar
            "seri" -> R.string.countdown_onek_seri to R.string.countdown_onek_seri_dar
            else -> R.string.countdown_onek_vakit to R.string.countdown_onek_vakit_dar
        }

        val baseTimeMs = android.os.SystemClock.elapsedRealtime() + millisRemaining

        val remoteViewsCollapsed = RemoteViews(context.packageName, collapsedLayoutRes)
        remoteViewsCollapsed.setTextViewText(R.id.tv_prefix, m.getString(onekDar))
        remoteViewsCollapsed.setChronometer(R.id.tv_countdown, baseTimeMs, null, true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            remoteViewsCollapsed.setChronometerCountDown(R.id.tv_countdown, true)
        }

        val remoteViewsExpanded = RemoteViews(context.packageName, expandedLayoutRes)
        remoteViewsExpanded.setTextViewText(R.id.tv_prefix, m.getString(onekGenis))
        remoteViewsExpanded.setChronometer(R.id.tv_countdown, baseTimeMs, null, true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            remoteViewsExpanded.setChronometerCountDown(R.id.tv_countdown, true)
        }

        remoteViewsExpanded.setTextViewText(R.id.tv_description, aciklamaMetni(context, bodyTemplate, themeType))

        val activeChannelId = if (channelId.isNotEmpty()) channelId else FOREGROUND_CHANNEL_ID
        val builder = NotificationCompat.Builder(context, activeChannelId)
            .setSmallIcon(getSmallIconRes(context, smallIcon))
            .setContentTitle(title)
            .setCustomContentView(remoteViewsCollapsed)
            .setCustomBigContentView(remoteViewsExpanded)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            // CHRONOMETER HEDEFTE DURMAZ: sifiri gecince YUKARI saymaya baslar
            // (`setChronometerCountDown` yalnizca yonu belirler). Cagiran isterse
            // bildirim hedef aninda sistem tarafindan otomatik kaldirilir.
            .apply { if (autoDismissAtTarget) setTimeoutAfter(millisRemaining) }
            .setShowWhen(false)
            .setContentIntent(getLaunchPendingIntent(context))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setSilent(true)
            // Saat kendi geri sayım yüzeyini çiziyor (#281) → telefondaki sayaç
            // Wear OS'a köprülenmesin (yalnız sayaç bildirimleri).
            .setLocalOnly(true)

        builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, m.getString(R.string.countdown_eylem_durdur), stopPendingIntent(context, id))

        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(notificationId, builder.build())
    }



    /**
     * Bildirim gövdesi: şablondaki `{time}` / ⏱️ ayıklanır, boşsa temaya göre yedek
     * (arayüz dilinde; JS gövdesi zaten etkin dilde gelir).
     */
    fun aciklamaMetni(context: Context, bodyTemplate: String, themeType: String): String {
        val descriptionText = bodyTemplate.replace("{time}", "").replace("⏱️", "").trim()
        return descriptionText.takeIf { it.isNotEmpty() } ?: context.dildeBaglam().getString(
            when (themeType) {
                "iftar" -> R.string.countdown_yedek_iftar
                "sahur" -> R.string.countdown_yedek_sahur
                "seri" -> R.string.countdown_yedek_seri
                else -> R.string.countdown_yedek_vakit
            }
        )
    }

    fun smallIconRes(context: Context, iconName: String): Int = getSmallIconRes(context, iconName)

    fun launchPendingIntent(context: Context): PendingIntent = getLaunchPendingIntent(context)

    /** "Durdur" eylemi (iki yol da aynı alıcıyı kullanır). */
    fun stopPendingIntent(context: Context, id: String): PendingIntent {
        val stopIntent = Intent(context, CountdownReceiver::class.java).apply {
            action = CountdownReceiver.ACTION_STOP
            putExtra(CountdownReceiver.EXTRA_ID, id)
        }
        return PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun cancelNotification(context: Context, id: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(generateNotificationId(id))
        removeActiveId(id)
        // Öne çıkarılmış ikiz: saklı durum + dakikalık tazeleme alarmı da gitmeli,
        // yoksa alarm kapatılmış bildirimi geri getirirdi.
        try {
            CanliGuncelleme.temizle(context, id)
        } catch (e: Exception) {
            Log.w("CountdownHelper", "Canli guncelleme durumu temizlenemedi", e)
        }
    }

    /** Hedef anında bildirimi kaldıran alarm (iki yol için ortak). */
    fun bitisAlarminiKur(context: Context, id: String, targetTimeMs: Long, title: String, bodyTemplate: String, channelId: String, smallIcon: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
        val intent = Intent(context, CountdownReceiver::class.java).apply {
            action = CountdownReceiver.ACTION_COUNTDOWN_FINISHED
            putExtra(CountdownReceiver.EXTRA_ID, id)
            putExtra(CountdownReceiver.EXTRA_TITLE, title)
            putExtra(CountdownReceiver.EXTRA_BODY_TEMPLATE, bodyTemplate)
            putExtra(CountdownReceiver.EXTRA_CHANNEL_ID, channelId)
            putExtra(CountdownReceiver.EXTRA_SMALL_ICON, smallIcon)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs, pendingIntent)
                } else {
                    alarmManager.setAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs, pendingIntent)
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs, pendingIntent)
            } else {
                alarmManager.setExact(android.app.AlarmManager.RTC_WAKEUP, targetTimeMs, pendingIntent)
            }
        } catch (e: Exception) {
            Log.e("CountdownModule", "Alarm ayarlanamadi: ${e.message}")
        }
    }

    /** Bitiş alarmını iptal eder (`filterEquals` ekstraları yok sayar; eylem + istek kodu yeter). */
    fun bitisAlarminiIptalEt(context: Context, id: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
        val cancelIntent = Intent(context, CountdownReceiver::class.java).apply {
            action = CountdownReceiver.ACTION_COUNTDOWN_FINISHED
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
    }
}
