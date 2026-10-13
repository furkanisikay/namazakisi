package com.furkanisikay.namazakisi.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.cekirdek.MuhafizAlarmKurallari

/**
 * Gerçek alarmın (issue #74) bildirimi ve KANALI.
 *
 * SES = KANAL SESİ + `FLAG_INSISTENT` (Foreground Service YOK — AGENTS.md kararı):
 * insistent bildirim kanal sesini, bildirim kaldırılana ya da bildirim gölgeliği
 * açılana kadar DÖNGÜDE çalar. Ses `USAGE_ALARM`'dır → alarm ses seviyesini kullanır ve
 * Rahatsız Etmeyin'de "alarmlara izin ver" varsayılanıyla duyulur. Çalma süresi
 * [MuhafizAlarmKurallari.CALMA_SURESI_MS] ile sınırlıdır: süre dolunca alıcı bildirimi
 * NORMAL (sessiz güncellenen) bildirime çevirir, emniyet olarak da `setTimeoutAfter`.
 *
 * KANAL SESİ DEĞİŞTİRİLEMEZ (Android tuzağı, AGENTS.md "kanal = sesin fonksiyonu") →
 * alarm kanal id'si de SESİN fonksiyonudur (JS `alarmKanalIdOlustur`): varsayılan ses
 * `namaz_alarm`, seçilen ses `namaz_alarm_<hash8>`. Kanal YOKSA oluşturulur, varsa
 * dokunulmaz. Öksüz kalan hash'li alarm kanallarını JS planlama turu toplar ([kanallariTemizle]).
 *
 * TAM EKRAN: `setFullScreenIntent` ekran kapalı/kilitliyken [MuhafizAlarmActivity]'yi
 * açar; ekran açıkken sistem heads-up gösterir (düğmeler aynı). Android 14+'ta
 * `USE_FULL_SCREEN_INTENT` izni yoksa sistem bunu sessizce heads-up'a indirger — ses
 * yine çalar (izin rehberi: `tamEkranIzniVarMi`).
 */
object MuhafizAlarmBildirimi {
    private const val TAG = "MuhafizAlarm"

    /** Alarm bildiriminin numarası; etiket = muhafız kimliği ("Kıldım" önek iptali bulsun). */
    const val BILDIRIM_NUMARASI = 74_074

    private val DESEN = longArrayOf(0, 800, 400, 800, 400, 800)

    private fun yonetici(context: Context): NotificationManager? =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    /** Kullanıcının seçtiği ses; yoksa cihazın varsayılan ALARM sesi (dinamik — kullanıcının alarmı). */
    private fun alarmSesi(sesUri: String?): Uri? =
        sesUri?.let { Uri.parse(it) }
            ?: Settings.System.DEFAULT_ALARM_ALERT_URI
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)

    private val ALARM_NITELIKLERI: AudioAttributes
        get() = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

    /** Kanal YOKSA oluşturur (varsa dokunmaz — sesi zaten değiştirilemez). */
    fun kanaliGarantile(context: Context, kanalId: String, ad: String, sesUri: String?) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (!MuhafizAlarmKurallari.alarmKanaliMi(kanalId)) return
        val nm = yonetici(context) ?: return
        try {
            if (nm.getNotificationChannel(kanalId) != null) return
            val kanal = NotificationChannel(kanalId, ad, NotificationManager.IMPORTANCE_HIGH).apply {
                description = context.getString(R.string.alarm_kanal_aciklamasi)
                setSound(alarmSesi(sesUri), ALARM_NITELIKLERI)
                enableVibration(true)
                vibrationPattern = DESEN
                // DND politika izni yoksa sistem yok sayar; alarm kategorisi zaten
                // "alarmlara izin ver" ile geçer.
                setBypassDnd(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            nm.createNotificationChannel(kanal)
        } catch (e: Exception) {
            Log.w(TAG, "Alarm kanali olusturulamadi ($kanalId)", e)
        }
    }

    /** Listede olmayan HASH'LI alarm kanallarını siler; taban `namaz_alarm`'a dokunmaz. */
    fun kanallariTemizle(context: Context, korunacak: Collection<String>) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = yonetici(context) ?: return
        try {
            val kume = korunacak.toSet()
            (nm.notificationChannels ?: return)
                .map { it.id }
                .filter { it != MuhafizAlarmKurallari.KANAL_TABANI && MuhafizAlarmKurallari.alarmKanaliMi(it) && it !in kume }
                .forEach { id ->
                    try {
                        nm.deleteNotificationChannel(id)
                    } catch (_: Exception) {
                        // Biri silinemezse diğerleri yine denensin.
                    }
                }
        } catch (e: Exception) {
            Log.w(TAG, "Alarm kanallari toplanamadi", e)
        }
    }

    /** Android 14+: tam ekran izni var mı? (Daha eskide kurulumda verilir.) */
    fun tamEkranIzniVarMi(context: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return true
        return try {
            yonetici(context)?.canUseFullScreenIntent() ?: false
        } catch (_: Exception) {
            false
        }
    }

    /** Eylem düğmesinin yayını (açık bileşen → dışa kapalı alıcı). */
    fun eylemIntenti(context: Context, eylem: String, yuk: MuhafizAlarmKurallari.Yuk, hamYuk: String): PendingIntent {
        val intent = Intent(context, MuhafizAlarmAlici::class.java)
            .setAction(eylem)
            .setData(Uri.Builder().scheme("namazakisi-alarm").authority(eylem.substringAfterLast('.')).appendPath(yuk.kimlik).build())
            .putExtra(MuhafizAlarmAlici.EK_YUK, hamYuk)
        return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun ekranIntenti(context: Context, hamYuk: String, kimlik: String, baslangicMs: Long): PendingIntent {
        val intent = Intent(context, MuhafizAlarmActivity::class.java)
            .setData(Uri.Builder().scheme("namazakisi-alarm").authority("ekran").appendPath(kimlik).build())
            .putExtra(MuhafizAlarmAlici.EK_YUK, hamYuk)
            .putExtra(MuhafizAlarmActivity.EK_BASLANGIC, baslangicMs)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
        return PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun temelOlustur(context: Context, kanal: String, yuk: MuhafizAlarmKurallari.Yuk, hamYuk: String, simdiMs: Long) =
        NotificationCompat.Builder(context, kanal)
            .setSmallIcon(R.drawable.ic_alarm_muhafiz)
            .setContentTitle(yuk.baslik)
            .setContentText(yuk.metin)
            .setStyle(NotificationCompat.BigTextStyle().bigText(yuk.metin))
            // Saat kendi planını kurar (issue #280) — alarm bileğe köprülenmesin.
            .setLocalOnly(true)
            .addAction(0, context.getString(R.string.alarm_kildim), eylemIntenti(context, MuhafizAlarmAlici.EYLEM_KILDIM, yuk, hamYuk))
            .apply {
                if (MuhafizAlarmKurallari.ertelemeDugmesiVarMi(simdiMs, yuk.erteleSinirMs)) {
                    addAction(0, context.getString(R.string.alarm_ertele), eylemIntenti(context, MuhafizAlarmAlici.EYLEM_ERTELE, yuk, hamYuk))
                }
            }

    /** Çalan alarm: tam ekran + insistent + ongoing. */
    fun calanGoster(context: Context, yuk: MuhafizAlarmKurallari.Yuk, hamYuk: String, baslangicMs: Long) {
        kanaliGarantile(context, yuk.alarmKanalId, yuk.alarmKanalAdi, yuk.sesUri)
        val ekran = ekranIntenti(context, hamYuk, yuk.kimlik, baslangicMs)
        val bildirim = temelOlustur(context, yuk.alarmKanalId, yuk, hamYuk, baslangicMs)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(ekran)
            .setFullScreenIntent(ekran, true)
            .setDeleteIntent(eylemIntenti(context, MuhafizAlarmAlici.EYLEM_KAPAT, yuk, hamYuk))
            .addAction(0, context.getString(R.string.alarm_kapat), eylemIntenti(context, MuhafizAlarmAlici.EYLEM_KAPAT, yuk, hamYuk))
            // Emniyet: süre dolunca susturma alarmı gelmese bile bildirim (ve sesi) biter.
            .setTimeoutAfter(MuhafizAlarmKurallari.CALMA_SURESI_MS + 60_000L)
            .apply {
                // 8 öncesi: kanal yok, ses + titreşim bildirimin kendisinde.
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
                    @Suppress("DEPRECATION")
                    setSound(alarmSesi(yuk.sesUri), AudioManager.STREAM_ALARM)
                    setVibrate(DESEN)
                }
            }
            .build()
        bildirim.flags = bildirim.flags or Notification.FLAG_INSISTENT
        goster(context, yuk.kimlik, bildirim)
    }

    /**
     * NORMAL bildirim: çalma süresi doldu (sessiz), alarm geç tetiklendi (sesli) ya da
     * camideyken (sessiz). Kanal: adımın NORMAL muhafız kanalı; yoksa taban `muhafiz`.
     */
    fun normalGoster(context: Context, yuk: MuhafizAlarmKurallari.Yuk, hamYuk: String, sessiz: Boolean) {
        val kanal = mevcutKanal(context, yuk.kanalId)
        val bildirim = temelOlustur(context, kanal, yuk, hamYuk, System.currentTimeMillis())
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setSilent(sessiz)
            .setContentIntent(acilisIntenti(context))
            .build()
        goster(context, yuk.kimlik, bildirim)
    }

    fun kaldir(context: Context, kimlik: String) {
        try {
            yonetici(context)?.cancel(kimlik, BILDIRIM_NUMARASI)
        } catch (_: Exception) {
            // Bildirim zaten yoksa sorun değil.
        }
    }

    /** Alarm bildirimi hâlâ gösteriliyor mu? (Tam ekran etkinliği başka yoldan kapanışı böyle anlar.) */
    fun gosteriliyorMu(context: Context, kimlik: String): Boolean = try {
        yonetici(context)?.activeNotifications?.any { it.tag == kimlik && it.id == BILDIRIM_NUMARASI } == true
    } catch (_: Exception) {
        true
    }

    private fun mevcutKanal(context: Context, kanalId: String): String {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return kanalId
        return try {
            if (yonetici(context)?.getNotificationChannel(kanalId) != null) kanalId else "muhafiz"
        } catch (_: Exception) {
            "muhafiz"
        }
    }

    private fun acilisIntenti(context: Context): PendingIntent? {
        val acilis = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
        return PendingIntent.getActivity(context, 0, acilis, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun goster(context: Context, kimlik: String, bildirim: Notification) {
        try {
            yonetici(context)?.notify(kimlik, BILDIRIM_NUMARASI, bildirim)
        } catch (e: SecurityException) {
            // Bildirim izni geri alınmış: gösterilecek bir şey yok.
            Log.w(TAG, "Bildirim izni yok", e)
        } catch (e: Exception) {
            Log.w(TAG, "Alarm bildirimi gosterilemedi", e)
        }
    }
}
