package com.furkanisikay.namazakisi.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.GununAyetiKurallari
import com.furkanisikay.namazakisi.cekirdek.GununAyetiYuku
import com.furkanisikay.namazakisi.cekirdek.SinirAlarmi

/**
 * Günün ayeti widget'ı ve duvar kâğıdının zamanlayıcısı (#380/#381) — namaz widget'larının
 * `WidgetGuncelleyici`'sinden AYRI kapı (kendi sağlayıcı listesi, kendi alarmı):
 * - namaz `SAGLAYICILAR` listesi namaz çizimini (`WidgetVeriDeposu.anlik`), `widgetEkliMi`
 *   sayımını ve namaz sınır alarmının iptal sayımını besler; ayet widget'ı oraya girmez.
 * - Namaz sınır alarmı requestCode 0 + `VAKIT_SINIRI` niyetidir; aynı niyet ezilirdi.
 *
 * Dakikalık/periyodik iş YOK: planın bir sonraki `baslangicMs`'ine (imsak) TEK alarm. Widget
 * yalnızken alarm UYANDIRMAZ (`RTC`, widget ekran açıkken görünür); duvar kâğıdı açıksa
 * `RTC_WAKEUP` + Doze'da da çalışan kurulum (`…AllowWhileIdle`): kişi telefonu eline aldığında
 * kilit ekranında bugünün ayeti hazır olsun. Günde bir uyanma.
 *
 * Tetikler: sınır alarmı, saat/saat dilimi/tarih değişimi, açılış ve paket güncellemesi
 * (`NamazWidgetAlarmAlici` → `GununAyetiAlarmAlici`'ye açık yayın), JS yükü yazınca
 * (`WidgetVeri.gununAyetiKaydet`), widget eklenince/boyutlanınca, yapılandırma kaydında.
 */
object GununAyetiGuncelleyici {
    private const val TAG = "GununAyetiGuncelleyici"
    const val SINIR_EYLEMI = "com.furkanisikay.namazakisi.widget.GUNUN_AYETI_SINIRI"
    /** Sistem olayları (saat, saat dilimi, açılış…) için yeniden hesaplama. */
    const val YENIDEN_EYLEMI = "com.furkanisikay.namazakisi.widget.GUNUN_AYETI_YENIDEN"
    private const val ISTEK_KODU = 0x41594501
    /** Tam alarm izni yokken pencere (API 31+'da sistem ≥10 dk'ya genişletir, `SinirAlarmi`). */
    private const val PENCERE_MS = 5_000L

    /** Ayet widget sağlayıcıları — TEK liste. */
    val SAGLAYICILAR = listOf(GununAyetiWidget::class.java)

    fun widgetSayisi(context: Context): Int = try {
        val yonetici = AppWidgetManager.getInstance(context)
        SAGLAYICILAR.sumOf { yonetici.getAppWidgetIds(ComponentName(context, it)).size }
    } catch (_: Exception) {
        0
    }

    /** Tüm ayet widget'larını çizer ve sınır alarmını kurar (ya da gereksizse iptal eder). */
    fun tumunuGuncelle(context: Context) {
        val uygulama = context.applicationContext
        try {
            val yonetici = AppWidgetManager.getInstance(uygulama)
            val yuk = GununAyetiDeposu.yuk(uygulama)
            val simdi = System.currentTimeMillis()
            var widgetVar = false
            for (sinif in SAGLAYICILAR) {
                for (id in yonetici.getAppWidgetIds(ComponentName(uygulama, sinif))) {
                    widgetVar = true
                    guncelle(uygulama, yonetici, id, yuk, simdi)
                }
            }
            val duvarAcik = yuk?.duvar?.acik == true
            if (yuk != null && (widgetVar || duvarAcik)) {
                sinirAlarminiKur(uygulama, yuk, simdi, uyandir = duvarAcik)
            } else {
                sinirAlarminiIptalEt(uygulama)
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Ayet widgetlari guncellenemedi", e)
        }
    }

    fun guncelle(
        context: Context,
        yonetici: AppWidgetManager,
        appWidgetId: Int,
        yuk: GununAyetiYuku? = GununAyetiDeposu.yuk(context),
        simdiMs: Long = System.currentTimeMillis(),
    ) {
        try {
            yonetici.updateAppWidget(appWidgetId, GununAyetiCizici.gorunum(context, yonetici, appWidgetId, yuk, simdiMs))
        } catch (e: Throwable) {
            Log.e(TAG, "Ayet widget'i cizilemedi: id=$appWidgetId", e)
        }
    }

    private fun sinirNiyeti(context: Context): PendingIntent = PendingIntent.getBroadcast(
        context, ISTEK_KODU,
        Intent(context, GununAyetiAlarmAlici::class.java).setAction(SINIR_EYLEMI),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    /** Aynı PendingIntent → önceki alarm ezilir; bekleyen alarm sayısı her zaman ≤ 1. */
    private fun sinirAlarminiKur(context: Context, yuk: GununAyetiYuku, simdiMs: Long, uyandir: Boolean) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val sinir = GununAyetiKurallari.sonrakiSinirMs(yuk.plan, simdiMs)
        if (sinir == null) {
            // Plan bitti: son kayıtta kalınır; JS bir sonraki yazımda planı uzatır.
            alarm.cancel(sinirNiyeti(context))
            return
        }
        val niyet = sinirNiyeti(context)
        try {
            val tamIzin = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarm.canScheduleExactAlarms()
            val tam = SinirAlarmi.yontem(Build.VERSION.SDK_INT, tamIzin) == SinirAlarmi.Yontem.TAM
            when {
                uyandir && tam -> alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, sinir, niyet)
                uyandir -> alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, sinir, niyet)
                tam -> alarm.setExact(AlarmManager.RTC, sinir, niyet)
                else -> alarm.setWindow(AlarmManager.RTC, sinir, PENCERE_MS, niyet)
            }
        } catch (e: SecurityException) {
            Log.w(TAG, "Tam alarm izni yok, yaklasik kuruluyor", e)
            try {
                if (uyandir) alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, sinir, niyet)
                else alarm.setWindow(AlarmManager.RTC, sinir, PENCERE_MS, niyet)
            } catch (_: Exception) {
            }
        } catch (e: Exception) {
            Log.w(TAG, "Ayet sinir alarmi kurulamadi", e)
        }
    }

    fun sinirAlarminiIptalEt(context: Context) {
        try {
            val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarm.cancel(sinirNiyeti(context))
        } catch (e: Exception) {
            Log.w(TAG, "Ayet sinir alarmi iptal edilemedi", e)
        }
    }

    /** Sistem olayında (saat değişimi, açılış…) ayet yüzeylerini yeniden hesaplatır — paket içi açık yayın. */
    fun yenidenHesaplat(context: Context) {
        try {
            context.sendBroadcast(Intent(context, GununAyetiAlarmAlici::class.java).setAction(YENIDEN_EYLEMI))
        } catch (e: Exception) {
            Log.w(TAG, "Ayet yeniden hesaplama yayini gonderilemedi", e)
        }
    }
}
