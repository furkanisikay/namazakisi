package expo.modules.countdownnotification

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import expo.modules.countdownnotification.cekirdek.CanliPlanKurallari
import expo.modules.countdownnotification.cekirdek.CanliPlanKurallari.Karar
import expo.modules.countdownnotification.cekirdek.CanliPlanKurallari.PlanOlayi

/**
 * Now Bar / canlı sayaç PLANLAYICISI (issue #282 ikinci aşama) — native uygulayıcı.
 *
 * JS hangi öğenin ne zaman öne çıkacağını SAF olarak hesaplar ve olay listesini
 * `kur` ile verir. Burada:
 *  - plan SharedPreferences'ta saklanır (süreç ölse de, yeniden başlatmada da),
 *  - AYNI ANDA TEK alarm kurulur: sıradaki olayın anı (wear `AlarmZinciri` deseni;
 *    uygulama başına alarm sınırına yaklaşılmaz, dakikalık yoklama YOK),
 *  - alarm gelince vadesi gelen olaylar uygulanır ve bir sonraki kurulur.
 *
 * Olayın gösterimi mevcut sayaç yolundan geçer (`CountdownNotificationHelper`):
 * öne çıkarma izni yoksa sayaç adayı sıradan sayaç olur, Now Bar'a özel aday hiç
 * gösterilmez (`CanliPlanKurallari.karar`).
 *
 * Kullanıcı bildirimi kapatırsa (kaydırma / "Durdur") ya da "Kıldım" derse, ya da JS
 * sayacı durdurursa o kimliğin İLERİDEKİ olayları da düşer (`kimligiDusur`) — plan
 * kapatılan sayacı bir sonraki dilimde geri getirmesin.
 */
object CanliPlan {
    private const val TAG = "CanliPlan"
    private const val PREFS = "expo_countdown_canli_plan"
    private const val ANAHTAR_PLAN = "plan"
    private const val ANAHTAR_SON = "son"
    private const val ANAHTAR_GOSTERILEN = "gosterilen"

    /** Zincirin tek istek kodu: yeniden kurmak öncekinin YERİNE geçer. */
    private const val ISTEK_KODU = 0x4E4F57

    /** Now Bar'a özel adayların kanalı (`canliSayacPlani.ts > CANLI_SAYAC_KANALI`). */
    const val KANAL = "canli_sayac"

    @Synchronized
    fun kur(context: Context, json: String) {
        val app = context.applicationContext
        val plan = CanliPlanKurallari.planiCoz(json)
        val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val simdi = System.currentTimeMillis()
        val guncel = CanliPlanKurallari.vadesiGelenler(plan, Long.MIN_VALUE, simdi)
        val oncekiGosterilen = prefs.getStringSet(ANAHTAR_GOSTERILEN, emptySet())?.toSet() ?: emptySet()
        val izin = CanliGuncelleme.destekleniyorMu(app)
        val guncelGosterilen = guncel.filter { CanliPlanKurallari.karar(it, izin) != Karar.GIZLE }.map { it.id }.toSet()

        // Önceki plandan kalan, artık gösterilmeyecek bildirimler kalksın (öğe kapatıldı,
        // vakit kılındı, sayaç ayarı kapatıldı...).
        CanliPlanKurallari.kaldirilacaklar(oncekiGosterilen, guncelGosterilen).forEach { kaldir(app, it) }
        prefs.edit()
            .putString(ANAHTAR_PLAN, CanliPlanKurallari.planJsonu(plan))
            .putLong(ANAHTAR_SON, simdi)
            .putStringSet(ANAHTAR_GOSTERILEN, oncekiGosterilen.intersect(guncelGosterilen))
            .apply()
        guncel.forEach { uygula(app, it, izin) }
        alarmiKur(app, CanliPlanKurallari.sonrakiAlarm(plan, simdi))
    }

    /** Zincirdeki alarm geldi: `(son, şimdi]` olaylarını uygula, sonrakini kur. */
    @Synchronized
    fun alarmGeldi(context: Context) {
        val app = context.applicationContext
        try {
            val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val plan = CanliPlanKurallari.planiCoz(prefs.getString(ANAHTAR_PLAN, null))
            val simdi = System.currentTimeMillis()
            val son = prefs.getLong(ANAHTAR_SON, Long.MIN_VALUE)
            // Saat geri alındıysa (son > şimdi) tüm güncel hâli yeniden uygula.
            val sonrasi = if (son > simdi) Long.MIN_VALUE else son
            val izin = CanliGuncelleme.destekleniyorMu(app)
            try {
                CanliPlanKurallari.vadesiGelenler(plan, sonrasi, simdi).forEach { uygula(app, it, izin) }
            } finally {
                prefs.edit().putLong(ANAHTAR_SON, simdi).apply()
                // Gösterim patlasa bile zincir kopmamalı.
                alarmiKur(app, CanliPlanKurallari.sonrakiAlarm(plan, simdi))
            }
        } catch (e: Exception) {
            Log.w(TAG, "Plan olayi uygulanamadi", e)
        }
    }

    /**
     * Yeniden başlatma / uygulama güncellemesi: Android alarmları ve bildirimleri
     * sildi → planın ŞU ANKİ hâli yeniden gösterilir, zincir yeniden kurulur.
     */
    @Synchronized
    fun yenidenKur(context: Context) {
        val app = context.applicationContext
        val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val json = prefs.getString(ANAHTAR_PLAN, null) ?: return
        // Gösterilen kümesi geçersiz (bildirimler silindi); `kur` baştan kurar.
        prefs.edit().remove(ANAHTAR_GOSTERILEN).apply()
        kur(app, json)
    }

    /**
     * Bir kimliğin ileride planlı olaylarını düşür (kullanıcı kapattı / "Kıldım" /
     * JS durdurdu). Bildirimin kendisini kaldırmak çağıranın işidir.
     */
    @Synchronized
    fun kimligiDusur(context: Context, id: String) {
        try {
            val app = context.applicationContext
            val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val ham = prefs.getString(ANAHTAR_PLAN, null) ?: return
            val plan = CanliPlanKurallari.planiCoz(ham)
            if (plan.none { it.id == id }) return
            val yeni = CanliPlanKurallari.kimligiDusur(plan, id)
            val gosterilen = (prefs.getStringSet(ANAHTAR_GOSTERILEN, emptySet()) ?: emptySet()) - id
            prefs.edit()
                .putString(ANAHTAR_PLAN, CanliPlanKurallari.planJsonu(yeni))
                .putStringSet(ANAHTAR_GOSTERILEN, gosterilen)
                .apply()
            alarmiKur(app, CanliPlanKurallari.sonrakiAlarm(yeni, System.currentTimeMillis()))
        } catch (e: Exception) {
            Log.w(TAG, "Kimlik plandan dusurulemedi", e)
        }
    }

    /** Tanı özeti (salt okur): saklı plan, sıradaki alarm, son uygulama anı, gösterilenler. */
    data class TaniOzeti(val olaySayisi: Int, val sonrakiAlarmMs: Long?, val sonMs: Long?, val gosterilenler: Set<String>)

    @Synchronized
    fun taniOzeti(context: Context): TaniOzeti {
        val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val plan = CanliPlanKurallari.planiCoz(prefs.getString(ANAHTAR_PLAN, null))
        val son = prefs.getLong(ANAHTAR_SON, Long.MIN_VALUE).takeIf { it != Long.MIN_VALUE }
        return TaniOzeti(
            olaySayisi = plan.size,
            sonrakiAlarmMs = CanliPlanKurallari.sonrakiAlarm(plan, System.currentTimeMillis()),
            sonMs = son,
            gosterilenler = prefs.getStringSet(ANAHTAR_GOSTERILEN, emptySet())?.toSet() ?: emptySet(),
        )
    }

    private fun uygula(context: Context, olay: PlanOlayi, izin: Boolean) {
        try {
            when (CanliPlanKurallari.karar(olay, izin)) {
                Karar.GIZLE -> kaldir(context, olay.id)
                Karar.ONE_CIKAR -> goster(context, olay, oneCikar = true)
                Karar.NORMAL -> goster(context, olay, oneCikar = false)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Olay uygulanamadi: ${olay.id}", e)
        }
    }

    private fun goster(context: Context, o: PlanOlayi, oneCikar: Boolean) {
        val ek = o.ek ?: return
        if (o.kanalId == KANAL) kanaliGarantile(context)
        CountdownNotificationHelper.showCountdownNotification(
            context, o.id, o.hedefMs, o.baslik, o.govde, o.kanalId, "", o.tema,
            ek.hedefteKaybol, if (oneCikar) ek else null
        )
        CountdownNotificationHelper.bitisAlarminiKur(context, o.id, o.hedefMs, o.baslik, o.govde, o.kanalId, "")
        gosterilenEkle(context, o.id)
    }

    private fun kaldir(context: Context, id: String) {
        CountdownNotificationHelper.cancelNotification(context, id)
        CountdownNotificationHelper.bitisAlarminiIptalEt(context, id)
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val gosterilen = prefs.getStringSet(ANAHTAR_GOSTERILEN, emptySet()) ?: emptySet()
        if (id in gosterilen) prefs.edit().putStringSet(ANAHTAR_GOSTERILEN, gosterilen - id).apply()
    }

    private fun gosterilenEkle(context: Context, id: String) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val gosterilen = prefs.getStringSet(ANAHTAR_GOSTERILEN, emptySet()) ?: emptySet()
        if (id !in gosterilen) prefs.edit().putStringSet(ANAHTAR_GOSTERILEN, gosterilen + id).apply()
    }

    /**
     * Now Bar'a özel adayların kanalı YOKSA kurulur (arka planda uygulama hiç
     * açılmadan da gelebilir). Önem DEFAULT: öne çıkarma MIN önemli kanalda olmaz;
     * ses/titreşim yok (sayaç bir uyarı değil, gösterge).
     */
    private fun kanaliGarantile(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(KANAL) != null) return
        nm.createNotificationChannel(
            NotificationChannel(KANAL, "Canlı sayaçlar", NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = "Now Bar ve durum çubuğundaki geri sayımlar"
                setSound(null, null)
                enableVibration(false)
                setShowBadge(false)
            }
        )
    }

    private fun alarmIstegi(context: Context): PendingIntent = PendingIntent.getBroadcast(
        context,
        ISTEK_KODU,
        Intent(context, CountdownReceiver::class.java).setAction(CountdownReceiver.ACTION_CANLI_PLAN),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    private fun alarmiKur(context: Context, anMs: Long?) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = alarmIstegi(context)
        if (anMs == null) {
            am.cancel(pi)
            return
        }
        try {
            val kesin = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
            if (kesin) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
        } catch (e: SecurityException) {
            // Tam alarm izni tam bu arada geri alındı → yaklaşık alarma düş.
            try {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, anMs, pi)
            } catch (_: Exception) {
            }
        } catch (e: Exception) {
            Log.w(TAG, "Plan alarmi kurulamadi", e)
        }
    }
}
