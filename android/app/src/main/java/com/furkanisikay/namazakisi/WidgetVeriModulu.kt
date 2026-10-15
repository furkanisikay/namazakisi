package com.furkanisikay.namazakisi

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici
import com.furkanisikay.namazakisi.widget.WidgetVeriDeposu

/**
 * Widget veri köprüsü — JS'in hesapladığı vakitleri ve kılınmışlığı
 * SharedPreferences'a yazar, widget'ları + hızlı ayarlar kutusunu HEMEN tazeler
 * (issue #275: uygulamadaki işaretleme ≤ 1 sn'de widget'a yansır).
 * JS tarafı: `src/domain/services/WidgetServisi.ts`.
 */
class WidgetVeriModulu(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "WidgetVeriModulu"
        const val MODULE_NAME = "WidgetVeri"
        const val PREFS_NAME = WidgetVeriDeposu.PREFS_NAME
        const val KEY_DATA = WidgetVeriDeposu.KEY_DATA
    }

    override fun getName(): String = MODULE_NAME

    /** Vakit çizelgesi (dün + 8 gün, `src/core/widget/widgetYuku.ts`). */
    @ReactMethod
    fun vakitlerKaydet(dataJson: String) {
        yazVeTazele(WidgetVeriDeposu.KEY_DATA, dataJson)
    }

    /** tarih → kılınan widget kodları. */
    @ReactMethod
    fun kilinanlarKaydet(json: String) {
        yazVeTazele(WidgetVeriDeposu.KEY_KILINAN, json)
    }

    private fun yazVeTazele(anahtar: String, deger: String) {
        try {
            val context = reactApplicationContext
            context.getSharedPreferences(WidgetVeriDeposu.PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(anahtar, deger)
                .commit()
            WidgetGuncelleyici.tumunuGuncelle(context)
        } catch (e: Throwable) {
            Log.e(TAG, "Widget verisi kaydedilemedi veya widget guncellenemedi", e)
        }
    }
}
