package com.furkanisikay.namazakisi.widget

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * AlarmManager ve önyükleme olaylarını dinler.
 * Her dakika tetiklenerek tüm widget tiplerini günceller ve bir sonraki alarmı kurar.
 * Cihaz yeniden başladığında (kilitli veya açık) alarmı yeniden başlatır.
 */
class NamazWidgetAlarmAlici : BroadcastReceiver() {

    companion object {
        private const val TAG = "NamazWidgetAlarmAlici"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action

        // Sadece beklenen aksiyonları işle: önyükleme olayları veya (aksiyon olmayan) AlarmManager tetikleyicisi
        val isBootAction = action == Intent.ACTION_BOOT_COMPLETED ||
                action == "android.intent.action.LOCKED_BOOT_COMPLETED"
        val isAlarmTick = action == null

        if (!isBootAction && !isAlarmTick) return

        val appWidgetManager = AppWidgetManager.getInstance(context)
        val kucukIds = appWidgetManager.getAppWidgetIds(ComponentName(context, NamazWidget::class.java))
        val buyukIds = appWidgetManager.getAppWidgetIds(ComponentName(context, NamazGenisBoyutWidget::class.java))

        // Hiç widget yoksa alarmı yeniden kurma
        if (kucukIds.isEmpty() && buyukIds.isEmpty()) return

        if (isBootAction) {
            // Cihaz yeniden başladı, alarmı yeniden kur
            NamazWidget.sonrakiGuncellemeIcinAlarmAyarla(context)
            return
        }

        // Dakikalık alarm: her iki widget tipini de güncelle
        try {
            for (id in kucukIds) NamazWidget.guncelleWidget(context, appWidgetManager, id)
            for (id in buyukIds) NamazGenisBoyutWidget.guncelleWidget(context, appWidgetManager, id)
        } catch (e: Throwable) {
            Log.e(TAG, "Widget güncellemesi sırasında hata oluştu", e)
        }
        NamazWidget.sonrakiGuncellemeIcinAlarmAyarla(context)
    }
}
