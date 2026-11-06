package com.furkanisikay.namazakisi.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.os.Bundle

/**
 * Günün ayeti widget'ı (#380). Namaz widget'larının ortak sağlayıcısından (`NamazWidgetSaglayicisi`)
 * TÜREMEZ: onun `onUpdate`'i namaz çizicisini çalıştırır. Çizim ve zamanlama tek kapıda:
 * [GununAyetiGuncelleyici]. Sınıf adı yayımlandıktan sonra DEĞİŞTİRİLMEZ (ana ekrandaki
 * widget'lar düşer).
 */
class GununAyetiWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        GununAyetiGuncelleyici.tumunuGuncelle(context)
    }

    /** Boyut değişimi: düzen yeni boyutta yeniden ÖLÇÜLÜR (API 31+'da da; boyutlar seçenekten). */
    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle,
    ) {
        GununAyetiGuncelleyici.guncelle(context, appWidgetManager, appWidgetId)
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        appWidgetIds.forEach {
            WidgetVeriDeposu.ayarSil(context, it)
            GununAyetiDeposu.icerikSil(context, it)
        }
    }

    override fun onEnabled(context: Context) {
        GununAyetiGuncelleyici.tumunuGuncelle(context)
    }

    override fun onDisabled(context: Context) {
        // Son ayet widget'ı kalktı: duvar kâğıdı açık değilse alarm gereksiz (açıksa zincir sürer).
        if (GununAyetiDeposu.yuk(context)?.duvar?.acik != true) {
            GununAyetiGuncelleyici.sinirAlarminiIptalEt(context)
        }
    }
}
