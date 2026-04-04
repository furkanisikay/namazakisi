package com.furkanisikay.namazakisi

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.furkanisikay.namazakisi.widget.NamazGenisBoyutWidget
import com.furkanisikay.namazakisi.widget.NamazWidget

/**
 * Widget veri köprüsü — RN tarafından hesaplanan namaz vakitlerini
 * SharedPreferences'a yazar ve tüm widget örneklerini güncellemeye zorlar.
 */
class WidgetVeriModulu(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "WidgetVeriModulu"
        const val MODULE_NAME = "WidgetVeri"
        const val PREFS_NAME = "namazakisi_widget"
        const val KEY_DATA = "widget_data"
    }

    override fun getName(): String = MODULE_NAME

    /**
     * Namaz vakitlerini (JSON string) SharedPreferences'a kaydeder
     * ve mevcut tüm widget örneklerini (küçük + büyük) günceller.
     */
    @ReactMethod
    fun vakitlerKaydet(dataJson: String) {
        try {
            val context = reactApplicationContext
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_DATA, dataJson)
                .apply()

            val appWidgetManager = AppWidgetManager.getInstance(context)

            // Küçük widget (1x1)
            val kucukIds = appWidgetManager.getAppWidgetIds(
                ComponentName(context, NamazWidget::class.java)
            )
            if (kucukIds.isNotEmpty()) {
                context.sendBroadcast(Intent(context, NamazWidget::class.java).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, kucukIds)
                })
            }

            // Büyük widget (4x2)
            val buyukIds = appWidgetManager.getAppWidgetIds(
                ComponentName(context, NamazGenisBoyutWidget::class.java)
            )
            if (buyukIds.isNotEmpty()) {
                context.sendBroadcast(Intent(context, NamazGenisBoyutWidget::class.java).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, buyukIds)
                })
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Vakit verisi kaydedilemedi veya widget güncellenemedi", e)
        }
    }
}
