package expo.modules.countdownnotification

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.os.Build
import android.content.Context
import android.util.Log

class ExpoCountdownNotificationModule : Module() {

    /**
     * Acik ses secici ekraninin promise'i. Ayni anda yalniz BIR secici acilabilir
     * (kullanici tek ekranla etkilesir); `OnActivityResult` bunu cozup temizler.
     */
    private var bekleyenSecim: Promise? = null

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

        // ============================================================
        // SESLI ANONS (muhafiz TTS) — Foreground Service KULLANILMAZ
        // ============================================================

        /** Verilen zamanda [metin]'i Turkce TTS ile seslendirecek exact alarm kurar. */
        Function("planlaAnons") { id: String, tetikZamanMs: Double, metin: String ->
            val context = appContext.reactContext
            if (context != null) {
                AnonsZamanlayici.planla(context.applicationContext, id, tetikZamanMs.toLong(), metin)
            }
            Unit
        }

        /** Tek bir anonsu iptal eder (ilgili bildirim iptal edilirken cagrilir). */
        Function("iptalEtAnons") { id: String ->
            val context = appContext.reactContext
            if (context != null) {
                AnonsZamanlayici.iptal(context.applicationContext, id)
            }
            Unit
        }

        /** Planli tum anonslari iptal eder (yeniden planlama oncesi temizlik). */
        Function("iptalEtTumAnonslar") {
            val context = appContext.reactContext
            if (context != null) {
                AnonsZamanlayici.tumunuIptal(context.applicationContext)
            }
            Unit
        }

        // ============================================================
        // BILDIRIM SESI SECIMI (sistem ses secici + kanal yonetimi)
        // ============================================================

        /**
         * Sistem ses secicisini acar; kullanicinin sectigi sesi
         * `{ uri, ad }` olarak dondurur. Vazgecilirse `null` doner.
         *
         * IZIN GEREKTIRMEZ (RingtoneManager). `RegisterActivityContracts` yerine
         * `OnActivityResult` kullanilir — Expo dokumani birincisi icin Activity
         * yasam dongusu uyumsuzlugu notu dusuyor.
         */
        AsyncFunction("sesSecAsync") { mevcutUri: String?, baslik: String, promise: Promise ->
            val aktivite = appContext.currentActivity
            if (aktivite == null) {
                promise.resolve(null)
            } else {
                try {
                    bekleyenSecim = promise
                    aktivite.startActivityForResult(
                        SesSecici.seciciIntenti(baslik, mevcutUri),
                        SesSecici.ISTEK_KODU
                    )
                } catch (e: Exception) {
                    Log.e("CountdownModule", "Ses secici acilamadi: ${e.message}")
                    bekleyenSecim = null
                    promise.resolve(null)
                }
            }
        }

        /** URI'nin gosterilecek adi; cozulemezse bos string. */
        AsyncFunction("sesAdiAl") { uri: String?, promise: Promise ->
            val context = appContext.reactContext
            promise.resolve(if (context == null) "" else SesSecici.sesAdi(context, uri))
        }

        /** Secilen sesi aninda calar (onizleme). */
        Function("sesiOnizle") { uri: String? ->
            appContext.reactContext?.let { SesSecici.onizle(it, uri) }
            Unit
        }

        /** Calan onizlemeyi durdurur. */
        Function("onizlemeyiDurdur") {
            SesSecici.durdur()
            Unit
        }

        /**
         * Ozel sesli muhafiz kanalini YOKSA olusturur (tembel).
         * Kanal id'si JS tarafinda sesin hash'inden uretilir (bkz. sesKimligi.ts).
         */
        Function("muhafizKanaliniGarantile") {
            kanalId: String,
            kanalAdi: String,
            aciklama: String,
            sesUri: String?,
            acilMi: Boolean ->
            appContext.reactContext?.let {
                MuhafizKanallari.garantile(it, kanalId, kanalAdi, aciklama, sesUri, acilMi)
            }
            Unit
        }

        /** Artik kullanilmayan hash'li muhafiz kanallarini siler (GC). */
        Function("muhafizKanallariniTemizle") { korunacakIdler: List<String> ->
            appContext.reactContext?.let { MuhafizKanallari.copleriTopla(it, korunacakIdler) }
            Unit
        }

        /**
         * Ses secici sonucu. `sesSecAsync` promise'i BURADA cozulur; her sonuc
         * yolunda (secim/iptal/hata) tam olarak BIR kez cozulur ve
         * `bekleyenSecim` temizlenir — aksi halde ekran ikinci acilista asili kalir.
         */
        OnActivityResult { _, payload ->
            if (payload.requestCode == SesSecici.ISTEK_KODU) {
                val promise = bekleyenSecim
                bekleyenSecim = null
                if (promise != null) {
                    val uri = SesSecici.sonucuCoz(payload.data)
                    if (uri == null) {
                        promise.resolve(null)
                    } else {
                        val context = appContext.reactContext
                        val uriMetni = uri.toString()
                        promise.resolve(
                            mapOf(
                                "uri" to uriMetni,
                                "ad" to (context?.let { SesSecici.sesAdi(it, uriMetni) } ?: "")
                            )
                        )
                    }
                }
            }
        }

        /** Cihazda Turkce TTS verisi kurulu mu? (Ekran uyari gosterebilsin diye.) */
        AsyncFunction("trDestekleniyorMu") { promise: Promise ->
            val context = appContext.reactContext
            if (context == null) {
                promise.resolve(false)
            } else {
                try {
                    AnonsKonusucu.turkceDestekleniyorMu(context.applicationContext) { destekleniyor ->
                        promise.resolve(destekleniyor)
                    }
                } catch (e: Exception) {
                    Log.e("CountdownModule", "TTS dil sorgusu basarisiz: ${e.message}")
                    promise.resolve(false)
                }
            }
        }
    }
}
