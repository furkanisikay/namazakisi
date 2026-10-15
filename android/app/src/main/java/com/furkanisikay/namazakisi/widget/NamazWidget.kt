package com.furkanisikay.namazakisi.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.os.Bundle

/**
 * Namaz widget'larının ORTAK sağlayıcı davranışı (issue #275). Çizim ve zamanlama
 * tek kapıdadır: [WidgetGuncelleyici].
 */
open class NamazWidgetSaglayicisi : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        // Tek örnek değil HEPSİ: sınır alarmı ve kutu da aynı turda tazelenir.
        WidgetGuncelleyici.tumunuGuncelle(context)
    }

    /** API < 31 boyut değişimi: düzen yeni boyuta göre yeniden seçilir. */
    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle,
    ) {
        WidgetGuncelleyici.guncelle(context, appWidgetManager, appWidgetId)
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        appWidgetIds.forEach { WidgetVeriDeposu.ayarSil(context, it) }
    }

    override fun onEnabled(context: Context) {
        WidgetGuncelleyici.tumunuGuncelle(context)
    }

    override fun onDisabled(context: Context) {
        val yonetici = AppWidgetManager.getInstance(context)
        val kalan = WidgetGuncelleyici.SAGLAYICILAR
            .sumOf { yonetici.getAppWidgetIds(ComponentName(context, it)).size }
        if (kalan == 0) WidgetGuncelleyici.sinirAlarminiIptalEt(context)
    }
}

/**
 * Tek vakit widget'ı — 1×1 başlar, büyütülebilir.
 * Sınıf adı KORUNUR: değişseydi kullanıcıların ana ekranındaki widget'lar düşerdi.
 */
class NamazWidget : NamazWidgetSaglayicisi()
