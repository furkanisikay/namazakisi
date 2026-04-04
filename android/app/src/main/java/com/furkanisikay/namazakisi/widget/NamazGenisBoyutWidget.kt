package com.furkanisikay.namazakisi.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.graphics.Color
import android.util.Log
import android.widget.RemoteViews
import com.furkanisikay.namazakisi.R
import com.furkanisikay.namazakisi.WidgetVeriModulu
import org.json.JSONObject
import java.util.Calendar

/**
 * 4x2 Geniş Namaz Widget'ı.
 *
 * Sol bölüm: Bir sonraki namaz vaktine geri sayım (vakit adı + HH:MM).
 * Sağ bölüm: Tüm günlük vakitler listesi; içinde bulunulan vakit vurgulanır.
 *
 * Güncelleme: NamazWidget ile aynı 1 dakikalık AlarmManager döngüsünü paylaşır.
 */
class NamazGenisBoyutWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            try {
                guncelleWidget(context, appWidgetManager, appWidgetId)
            } catch (e: Throwable) {
                Log.e(TAG, "Widget güncellenemedi: id=$appWidgetId", e)
            }
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        // Küçük widget yoksa bile alarm döngüsünü başlat
        NamazWidget.sonrakiGuncellemeIcinAlarmAyarla(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        // Alarmı yalnızca küçük widget da kaldırılmışsa iptal et
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val smallIds = appWidgetManager.getAppWidgetIds(
            ComponentName(context, NamazWidget::class.java)
        )
        if (smallIds.isEmpty()) {
            NamazWidget.alarmIptalEt(context)
        }
    }

    companion object {

        private const val TAG = "NamazGenisBoyutWidget"

        private val VAKIT_GORUNTU = mapOf(
            "sabah" to "İmsak",
            "gunes" to "Güneş",
            "ogle" to "Öğle",
            "ikindi" to "İkindi",
            "aksam" to "Akşam",
            "yatsi" to "Yatsı"
        )

        private val VAKIT_DATIF = mapOf(
            "sabah" to "Sabaha",
            "gunes" to "Güneşe",
            "ogle" to "Öğleye",
            "ikindi" to "İkindiye",
            "aksam" to "Akşama",
            "yatsi" to "Yatsıya"
        )

        private val SIRA = listOf("sabah", "gunes", "ogle", "ikindi", "aksam", "yatsi")

        private val ROW_IDS = mapOf(
            "sabah" to R.id.row_sabah,
            "gunes" to R.id.row_gunes,
            "ogle" to R.id.row_ogle,
            "ikindi" to R.id.row_ikindi,
            "aksam" to R.id.row_aksam,
            "yatsi" to R.id.row_yatsi
        )

        private val AD_IDS = mapOf(
            "sabah" to R.id.txt_sabah_ad,
            "gunes" to R.id.txt_gunes_ad,
            "ogle" to R.id.txt_ogle_ad,
            "ikindi" to R.id.txt_ikindi_ad,
            "aksam" to R.id.txt_aksam_ad,
            "yatsi" to R.id.txt_yatsi_ad
        )

        private val SAAT_IDS = mapOf(
            "sabah" to R.id.txt_sabah_saat,
            "gunes" to R.id.txt_gunes_saat,
            "ogle" to R.id.txt_ogle_saat,
            "ikindi" to R.id.txt_ikindi_saat,
            "aksam" to R.id.txt_aksam_saat,
            "yatsi" to R.id.txt_yatsi_saat
        )

        fun guncelleWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_namaz_genis)

            // Tıklamada uygulamayı aç
            val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launchIntent != null) {
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_genis_container, pendingIntent)
            }

            geriSayimVeListeyiGuncelle(context, views)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun geriSayimVeListeyiGuncelle(context: Context, views: RemoteViews) {
            try {
                val prefs = context.getSharedPreferences(
                    WidgetVeriModulu.PREFS_NAME, Context.MODE_PRIVATE
                )
                val dataJson = prefs.getString(WidgetVeriModulu.KEY_DATA, null)
                if (dataJson == null) {
                    views.setTextViewText(R.id.widget_genis_vakit_adi, "--")
                    views.setTextViewText(R.id.widget_genis_kalan_sure, "--:--")
                    return
                }

                val data = JSONObject(dataJson)
                val vakitlerArray = data.getJSONArray("vakitler")
                val now = System.currentTimeMillis()

                // Bugünün takvim günü
                val bugun = Calendar.getInstance()

                // Bugüne ait vakitleri topla (aynı takvim günü)
                val bugunVakitleri = mutableMapOf<String, Long>()
                for (i in 0 until vakitlerArray.length()) {
                    val v = vakitlerArray.getJSONObject(i)
                    val vakit = v.getString("vakit")
                    if (bugunVakitleri.containsKey(vakit)) continue
                    val ms = v.getLong("ms")
                    val cal = Calendar.getInstance().apply { timeInMillis = ms }
                    if (cal.get(Calendar.YEAR) == bugun.get(Calendar.YEAR) &&
                        cal.get(Calendar.DAY_OF_YEAR) == bugun.get(Calendar.DAY_OF_YEAR)
                    ) {
                        bugunVakitleri[vakit] = ms
                    }
                }

                // Mevcut vakit (en son geçmiş olan) ve sonraki vakti bul
                var mevcutVakit: String? = null
                var sonrakiVakit: String? = null
                var sonrakiMs = 0L

                for (i in 0 until vakitlerArray.length()) {
                    val v = vakitlerArray.getJSONObject(i)
                    val ms = v.getLong("ms")
                    if (ms > now) {
                        sonrakiVakit = v.getString("vakit")
                        sonrakiMs = ms
                        break
                    }
                    mevcutVakit = v.getString("vakit")
                }

                // Geri sayım bölümünü güncelle
                if (sonrakiVakit != null) {
                    val dativ = VAKIT_DATIF[sonrakiVakit] ?: sonrakiVakit
                    val kalanMs = sonrakiMs - now
                    val saatler = (kalanMs / (1000L * 60 * 60)).toInt()
                    val dakikalar = ((kalanMs % (1000L * 60 * 60)) / (1000L * 60)).toInt()
                    views.setTextViewText(R.id.widget_genis_vakit_adi, dativ)
                    views.setTextViewText(
                        R.id.widget_genis_kalan_sure,
                        "%02d:%02d".format(saatler, dakikalar)
                    )
                } else {
                    views.setTextViewText(R.id.widget_genis_vakit_adi, "--")
                    views.setTextViewText(R.id.widget_genis_kalan_sure, "--:--")
                }

                // Vakit listesi satırlarını güncelle
                for (vakit in SIRA) {
                    val rowId = ROW_IDS[vakit] ?: continue
                    val adId = AD_IDS[vakit] ?: continue
                    val saatId = SAAT_IDS[vakit] ?: continue

                    val ms = bugunVakitleri[vakit]
                    val saatStr = if (ms != null) msToSaat(ms) else "--:--"
                    val goruntu = VAKIT_GORUNTU[vakit] ?: vakit

                    views.setTextViewText(adId, goruntu)
                    views.setTextViewText(saatId, saatStr)

                    // Aktif vakti vurgula
                    if (vakit == mevcutVakit) {
                        views.setInt(rowId, "setBackgroundColor", Color.parseColor("#BB000000"))
                        views.setTextColor(adId, Color.WHITE)
                        views.setTextColor(saatId, Color.WHITE)
                    } else {
                        views.setInt(rowId, "setBackgroundColor", Color.TRANSPARENT)
                        views.setTextColor(adId, Color.parseColor("#CCFFFFFF"))
                        views.setTextColor(saatId, Color.parseColor("#CCFFFFFF"))
                    }
                }

            } catch (e: Throwable) {
                Log.e(TAG, "Vakit listesi güncellenemedi", e)
            }
        }

        private fun msToSaat(ms: Long): String {
            val cal = Calendar.getInstance().apply { timeInMillis = ms }
            return "%02d:%02d".format(
                cal.get(Calendar.HOUR_OF_DAY),
                cal.get(Calendar.MINUTE)
            )
        }
    }
}
