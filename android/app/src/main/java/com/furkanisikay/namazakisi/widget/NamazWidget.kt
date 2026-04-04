package com.furkanisikay.namazakisi.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import android.widget.RemoteViews
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.WidgetVeriModulu
import org.json.JSONObject
import java.util.Calendar

/**
 * 1x1 Namaz Widget'ı — bir sonraki namaz vaktine kalan süreyi gösterir.
 *
 * Veri akışı: RN (adhan.js) → WidgetVeriModulu → SharedPreferences → NamazWidget
 * Güncelleme: 1 dakikada bir AlarmManager (NamazWidgetAlarmAlici üzerinden)
 */
class NamazWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            guncelleWidget(context, appWidgetManager, appWidgetId)
        }
        sonrakiGuncellemeIcinAlarmAyarla(context)
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        sonrakiGuncellemeIcinAlarmAyarla(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        // Büyük widget da kaldırılmışsa alarmı iptal et
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val buyukIds = appWidgetManager.getAppWidgetIds(
            ComponentName(context, NamazGenisBoyutWidget::class.java)
        )
        if (buyukIds.isEmpty()) {
            alarmIptalEt(context)
        }
    }

    companion object {

        private const val TAG = "NamazWidget"

        private val VAKIT_DATIFLERI = mapOf(
            "sabah" to "sabaha",
            "gunes" to "güneşe",
            "ogle" to "öğleye",
            "ikindi" to "ikindiye",
            "aksam" to "akşama",
            "yatsi" to "yatsıya"
        )

        fun guncelleWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_namaz)

            // Tıklamada uygulamayı aç
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            }

            val (vakitSatiri, sureSatiri) = sonrakiVaktiHesapla(context)
            views.setTextViewText(R.id.widget_vakit_adi, vakitSatiri)
            views.setTextViewText(R.id.widget_kalan_sure, sureSatiri)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * SharedPreferences'taki JSON verisinden bir sonraki namaz vaktini bulur
         * ve (dativ, "HH:MM") ikilisi döner.
         */
        private fun sonrakiVaktiHesapla(context: Context): Pair<String, String> {
            return try {
                val prefs = context.getSharedPreferences(
                    WidgetVeriModulu.PREFS_NAME,
                    Context.MODE_PRIVATE
                )
                val dataJson = prefs.getString(WidgetVeriModulu.KEY_DATA, null)
                    ?: return Pair("uygulama açın", "--:--")

                val data = JSONObject(dataJson)
                val vakitler = data.getJSONArray("vakitler")
                val now = System.currentTimeMillis()

                for (i in 0 until vakitler.length()) {
                    val vakit = vakitler.getJSONObject(i)
                    val ms = vakit.getLong("ms")
                    if (ms > now) {
                        val vakitKodu = vakit.getString("vakit")
                        val dativ = VAKIT_DATIFLERI[vakitKodu] ?: vakitKodu
                        val kalanMs = ms - now
                        val saatler = (kalanMs / (1000L * 60 * 60)).toInt()
                        val dakikalar = ((kalanMs % (1000L * 60 * 60)) / (1000L * 60)).toInt()
                        return Pair("$dativ:", "%02d:%02d".format(saatler, dakikalar))
                    }
                }

                Pair("--", "--:--")
            } catch (e: Throwable) {
                Log.e(TAG, "Vakit hesaplama hatası", e)
                Pair("--", "--:--")
            }
        }

        /**
         * Bir sonraki tam dakika başına AlarmManager ayarlar.
         * Alarm tetiklenince NamazWidgetAlarmAlici widget'ları günceller.
         */
        fun sonrakiGuncellemeIcinAlarmAyarla(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, NamazWidgetAlarmAlici::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val cal = Calendar.getInstance().apply {
                add(Calendar.MINUTE, 1)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            try {
                when {
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && alarmManager.canScheduleExactAlarms() ->
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC, cal.timeInMillis, pendingIntent
                        )
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ->
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC, cal.timeInMillis, pendingIntent
                        )
                    else ->
                        alarmManager.setExact(AlarmManager.RTC, cal.timeInMillis, pendingIntent)
                }
            } catch (e: SecurityException) {
                // Exact alarm izni yoksa (Android 12+) yaklaşık zamanlama kullan
                Log.w(TAG, "Exact alarm izni yok, yaklaşık zamanlama kullanılıyor", e)
                alarmManager.set(AlarmManager.RTC, cal.timeInMillis, pendingIntent)
            }
        }

        fun alarmIptalEt(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, NamazWidgetAlarmAlici::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager.cancel(pendingIntent)
        }
    }
}
