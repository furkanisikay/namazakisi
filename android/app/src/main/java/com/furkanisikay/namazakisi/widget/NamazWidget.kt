package com.furkanisikay.namazakisi.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
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
 * Güncelleme: ekran açıkken dakikada bir, uyandırmayan AlarmManager (NamazWidgetAlarmAlici)
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
         * Bir sonraki tam dakika başına UYANDIRMAYAN bir alarm kurar.
         *
         * Eskiden her dakika `setExactAndAllowWhileIdle(RTC)` kuruluyordu: günde ~1440
         * tam alarm, Doze'un "allow while idle" kotasını muhafız alarmlarıyla paylaşıyor
         * ve ekran kapalıyken kimsenin görmediği bir widget için cihazı uyandırıyordu.
         * Widget yalnız ekran açıkken görünür → `RTC` (uyandırmaz) + `setWindow`:
         *  - ekran açıkken dakika başında (birkaç sn pay ile) tetiklenir,
         *  - cihaz uyurken HİÇ tetiklenmez; uyanınca bekleyen alarm hemen teslim
         *    edilir ve widget kullanıcı bakmadan tazelenir.
         * Tam alarm izni de gerekmez.
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
                alarmManager.setWindow(AlarmManager.RTC, cal.timeInMillis, PENCERE_MS, pendingIntent)
            } catch (e: Exception) {
                Log.w(TAG, "Widget alarmı kurulamadı", e)
            }
        }

        /** Dakika başından sonra teslim payı: sistem alarmları toplayabilsin, gecikme fark edilmesin. */
        private const val PENCERE_MS = 5_000L

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
