package expo.modules.countdownnotification

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import expo.modules.countdownnotification.cekirdek.CanliGuncellemeKurallari
import expo.modules.countdownnotification.cekirdek.CanliGuncellemeKurallari.Durum

/**
 * Android 16 "Live Update" ikiz yolu — issue #282 (durum çubuğu çipi + One UI 8 Now Bar).
 *
 * NEDEN AYRI BİR YOL: sistem yalnız STANDART şablonlu bildirimi öne çıkarır.
 * `RemoteViews` (özel içerik görünümü) ve `setColorized(true)` taşıyan bildirim
 * öne çıkarılamaz → mevcut tema görünümlü sayaç (`CountdownNotificationHelper`)
 * olduğu gibi kalır, öne çıkarma isteği ise bu yoldan, API 36+ ve
 * `NotificationManager.canPostPromotedNotifications()` true iken gider. Kullanıcı
 * sistem ayarlarında "Canlı güncellemeler"i kapatırsa kapı false döner ve eski yol
 * BİREBİR çalışır.
 *
 * Öne çıkarma şartları (biri eksikse bildirim sessizce sıradan bildirim olarak
 * çizilir — hata VERMEZ, bu yüzden `hasPromotableCharacteristics()` loglanır):
 * `setOngoing(true)` · başlık var · renklendirme yok · özel görünüm yok · stil
 * yok/BigText/Call/Progress · grup özeti değil · kanal önemi MIN değil ·
 * `android.requestPromotedOngoing` ekstrası · manifestte
 * `POST_PROMOTED_NOTIFICATIONS` (normal izin, kurulumda verilir).
 *
 * TAZELEME: chronometer ve ilerleme çubuğu sistemin çizdiği şeyler değildir —
 * kısa metin ("12 dk") ve ilerleme bildirim gönderildiği anki değerle donar.
 * Bu yüzden durum SharedPreferences'ta saklanır ve kısa metnin değişeceği her
 * dakika UYANDIRMAYAN (`RTC`) bir alarm bildirimi yeniden kurar: ekran kapalıyken
 * alarm bekler (çip zaten görünmez), cihaz uyanınca hemen teslim edilir — widget
 * dakika alarmının deseni. Süreç ölmüş olsa da alıcı JS'siz yeniden çizer.
 */
object CanliGuncelleme {

    private const val TAG = "CanliGuncelleme"
    private const val PREFS = "expo_countdown_canli"

    /** API 36 (Android 16 / Baklava). `VERSION_CODES.BAKLAVA` yerine sayı: eski SDK'larla da derlensin. */
    private const val API_36 = 36

    /**
     * Öne çıkarma isteği ekstrası. API 36 SDK'sında henüz sabit olarak YAYIMLANMADI
     * (androidx `NotificationCompat.EXTRA_REQUEST_PROMOTED_ONGOING` ile aynı dize).
     */
    private const val EKSTRA_ONE_CIKAR = "android.requestPromotedOngoing"

    /**
     * "Kıldım" yönlendirmesi: uygulamanın `kildim/SayacKildimAlici`'si bu eylemi
     * dinler ve öğeyi ortak "Kıldım" kuyruğuna yazar. Modül uygulama sınıflarını
     * import EDEMEZ (ayrı Gradle projesi) → paket-kapsamlı açık yayın (`setPackage`).
     */
    const val SAYAC_KILDIM_EYLEMI = "com.furkanisikay.namazakisi.SAYAC_KILDIM"
    const val EK_TARIH = "tarih"
    const val EK_VAKIT = "vakit"

    /** İlerleme çubuğu bölüm renkleri: tema → (normal, vurgulu). Renklendirme (colorized) DEĞİL. */
    private val TEMA_RENKLERI: Map<String, Pair<Int, Int>> = mapOf(
        "vakit" to Pair(0xFF8E7C78.toInt(), 0xFFE53935.toInt()),
        "iftar" to Pair(0xFF1E88E5.toInt(), 0xFFFFB300.toInt()),
        "sahur" to Pair(0xFF7E57C2.toInt(), 0xFFFFB300.toInt()),
        "seri" to Pair(0xFF8E7C78.toInt(), 0xFFFF7043.toInt()),
        "cuma" to Pair(0xFF2E7D32.toInt(), 0xFFFFB300.toInt()),
        "nafile" to Pair(0xFF5C6BC0.toInt(), 0xFFFFB300.toInt()),
    )

    fun destekleniyorMu(context: Context): Boolean {
        if (Build.VERSION.SDK_INT < API_36) return false
        return try {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.canPostPromotedNotifications()
        } catch (e: Throwable) {
            Log.w(TAG, "canPostPromotedNotifications okunamadi", e)
            false
        }
    }

    /** @return gösterildiyse true; false → çağıran eski RemoteViews yoluna düşer. */
    fun goster(context: Context, durum: Durum): Boolean {
        if (Build.VERSION.SDK_INT < API_36) return false
        return try {
            val simdi = System.currentTimeMillis()
            if (durum.hedefMs <= simdi) return false
            val bildirim = olustur(context, durum, simdi)
            if (!bildirim.hasPromotableCharacteristics()) {
                Log.w(TAG, "Bildirim one cikarilabilir degil (sartlardan biri eksik): ${durum.tema}")
            }
            kaydet(context, durum)
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.notify(CountdownNotificationHelper.generateNotificationId(durum.id), bildirim)
            tazelemeyiKur(context, durum.id, CanliGuncellemeKurallari.sonrakiTazelemeMs(simdi, durum.hedefMs))
            true
        } catch (e: Exception) {
            Log.w(TAG, "Canli guncelleme gosterilemedi", e)
            temizle(context, durum.id)
            false
        }
    }

    /** Dakikalık tazeleme alarmı geldi: saklı durumdan yeniden çiz. */
    fun tazele(context: Context, id: String) {
        val durum = oku(context, id) ?: return
        if (Build.VERSION.SDK_INT < API_36) {
            temizle(context, id)
            return
        }
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val bildirimId = CountdownNotificationHelper.generateNotificationId(id)
        // Kullanıcı bildirimi kaydırıp kapattıysa GERİ GETİRME (Android 14+ sürekli
        // bildirimi kapatmaya izin verir; silme niyeti de `setDeleteIntent` ile gelir).
        val gorunuyor = try {
            nm.activeNotifications.any { it.id == bildirimId }
        } catch (_: Exception) {
            true
        }
        if (!gorunuyor || durum.hedefMs <= System.currentTimeMillis()) {
            temizle(context, id)
            return
        }
        goster(context, durum)
    }

    /** Saklı durumu ve tazeleme alarmını siler (bildirimin kendisine dokunmaz). */
    fun temizle(context: Context, id: String) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(id).apply()
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(tazelemePendingIntent(context, id))
    }

    /** Saklı (öne çıkarılmış) sayaçların kimlikleri — süreç ölse de `stopAll` hepsini bulsun. */
    fun kayitliIdler(context: Context): List<String> =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).all.keys.toList()

    @RequiresApi(API_36)
    private fun olustur(context: Context, d: Durum, simdi: Long): Notification {
        val kanal = d.kanalId.ifEmpty { CountdownNotificationHelper.FOREGROUND_CHANNEL_ID }
        val builder = Notification.Builder(context, kanal)
            .setSmallIcon(CountdownNotificationHelper.smallIconRes(context, d.kucukIkon))
            .setContentTitle(d.baslik)
            .setContentText(d.metin)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setColorized(false)
            // Chronometer geri sayımı: canlı saniyeyi SİSTEM çizer.
            .setWhen(d.hedefMs)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            // Durum çubuğu çipi + Now Bar kısa metni ("12 dk").
            .setShortCriticalText(CanliGuncellemeKurallari.kisaMetin(d.hedefMs - simdi))
            .setContentIntent(CountdownNotificationHelper.launchPendingIntent(context))
            .setDeleteIntent(CountdownNotificationHelper.stopPendingIntent(context, d.id))
            .setCategory(Notification.CATEGORY_ALARM)
            // Saat kendi yüzeyini çiziyor (#281): telefondaki sayaç köprülenmesin.
            .setLocalOnly(true)
            .addExtras(Bundle().apply { putBoolean(EKSTRA_ONE_CIKAR, true) })

        if (d.hedefteKaybol) builder.setTimeoutAfter(d.hedefMs - simdi)

        if (d.bolumler.isNotEmpty()) {
            val (normal, vurgu) = TEMA_RENKLERI[d.tema] ?: TEMA_RENKLERI.getValue("vakit")
            val stil = Notification.ProgressStyle()
                .setStyledByProgress(true)
                .setProgressSegments(
                    d.bolumler.map {
                        Notification.ProgressStyle.Segment(it.uzunlukDk).setColor(if (it.vurgulu) vurgu else normal)
                    }
                )
                .setProgress(CanliGuncellemeKurallari.ilerleme(simdi, d.baslangicMs, d.bolumler))
            builder.setStyle(stil)
        }

        if (d.kildimTarih != null && d.kildimVakit != null) {
            builder.addAction(
                Notification.Action.Builder(
                    Icon.createWithResource(context, android.R.drawable.checkbox_on_background),
                    "Kıldım",
                    kildimPendingIntent(context, d.id, d.kildimTarih, d.kildimVakit)
                ).build()
            )
        }
        builder.addAction(
            Notification.Action.Builder(
                Icon.createWithResource(context, android.R.drawable.ic_menu_close_clear_cancel),
                "Durdur",
                CountdownNotificationHelper.stopPendingIntent(context, d.id)
            ).build()
        )
        return builder.build()
    }

    private fun kildimPendingIntent(context: Context, id: String, tarih: String, vakit: String): PendingIntent {
        val intent = Intent(context, CountdownReceiver::class.java).apply {
            action = CountdownReceiver.ACTION_KILDIM
            putExtra(CountdownReceiver.EXTRA_ID, id)
            putExtra(EK_TARIH, tarih)
            putExtra(EK_VAKIT, vakit)
        }
        return PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    /**
     * "Kıldım" dokunuşu: sayaç hemen kalkar (iyimser), istek uygulamanın ortak
     * kuyruğuna yönlendirilir. Kuyruk JS'te bildirimdeki "Kıldım" ile AYNI gövdeden
     * işlenir (`BildirimServisi.kuyruktanKildimIsle`).
     */
    fun kildimIsle(context: Context, id: String, tarih: String?, vakit: String?) {
        CountdownNotificationHelper.cancelNotification(context, id)
        CountdownNotificationHelper.bitisAlarminiIptalEt(context, id)
        // Kılındı: Now Bar planındaki ileriki dilimleri (ör. öne çıkma sırası) de düşer.
        CanliPlan.kimligiDusur(context, id)
        if (tarih.isNullOrEmpty() || vakit.isNullOrEmpty()) return
        try {
            context.sendBroadcast(
                Intent(SAYAC_KILDIM_EYLEMI)
                    .setPackage(context.packageName)
                    .putExtra(EK_TARIH, tarih)
                    .putExtra(EK_VAKIT, vakit)
            )
        } catch (e: Exception) {
            Log.w(TAG, "Kildim yonlendirilemedi", e)
        }
    }

    private fun tazelemePendingIntent(context: Context, id: String): PendingIntent {
        val intent = Intent(context, CountdownReceiver::class.java).apply {
            action = CountdownReceiver.ACTION_CANLI_TAZELE
            putExtra(CountdownReceiver.EXTRA_ID, id)
        }
        return PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun tazelemeyiKur(context: Context, id: String, anMs: Long?) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = tazelemePendingIntent(context, id)
        if (anMs == null) {
            am.cancel(pi)
            return
        }
        try {
            // UYANDIRMAZ (RTC): ekran kapalıyken bekler. Kısa pencere tam alarm
            // izniyle (USE_EXACT_ALARM, uygulama manifesti) geçerlidir.
            am.setWindow(AlarmManager.RTC, anMs, 5_000L, pi)
        } catch (e: Exception) {
            Log.w(TAG, "Tazeleme alarmi kurulamadi, gevsek alarma dusuluyor", e)
            try {
                am.set(AlarmManager.RTC, anMs, pi)
            } catch (_: Exception) {
            }
        }
    }

    private fun kaydet(context: Context, d: Durum) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString(d.id, CanliGuncellemeKurallari.durumuJsonaCevir(d)).apply()
    }

    private fun oku(context: Context, id: String): Durum? =
        CanliGuncellemeKurallari.durumuJsondanOku(
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(id, null)
        )
}
