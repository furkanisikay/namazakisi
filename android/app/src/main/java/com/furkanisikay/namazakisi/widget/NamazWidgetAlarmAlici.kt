package com.furkanisikay.namazakisi.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Widget'ı yeniden hesaplatan olaylar (issue #275):
 * - vakit sınırı alarmı ([WidgetGuncelleyici.SINIR_EYLEMI]) — dakikalık alarm YOK,
 * - Widget 1.0'ın eylemsiz dakika alarmı (güncellemeden sonra son kez gelebilir),
 * - açılış, uygulama güncellemesi,
 * - saat / saat dilimi / tarih değişimi: kalan süre `Chronometer` tabanı ve sınır
 *   alarmı duvar saatine göre kurulduğu için elle saat değişince yeniden kurulmalı.
 *
 * Her durumda tek iş: [WidgetGuncelleyici.tumunuGuncelle] (çiz + tek alarm + kutu).
 */
class NamazWidgetAlarmAlici : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == null || intent.action in EYLEMLER) {
            WidgetGuncelleyici.tumunuGuncelle(context)
        }
    }

    companion object {
        private val EYLEMLER = setOf(
            WidgetGuncelleyici.SINIR_EYLEMI,
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.LOCKED_BOOT_COMPLETED",
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_DATE_CHANGED,
        )
    }
}
