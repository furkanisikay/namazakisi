package com.furkanisikay.namazakisi

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.furkanisikay.namazakisi.duvar.DuvarKagidiUygulayici
import com.furkanisikay.namazakisi.widget.GununAyetiDeposu

/**
 * Günün ayeti duvar kâğıdı köprüsü (#381) — yalnız Android (iOS'ta genel API yok).
 * Ayarlar ayrı tutulmaz: günün ayeti yükünün `duvar` nesnesi (`WidgetVeri.gununAyetiKaydet`).
 *
 * - `durum()` → `{ izinli, sonHata }`: `izinli` = cihaz destekliyor VE yönetim izin veriyor;
 *   false ise ekran "Kullanılamıyor" der (sessiz sapma yok). `sonHata` = "yazilamadi" ya da null.
 * - `simdiUygula()` → gerekirse yazar (imza aynıysa yazmaz) ve sonucu bildirir, true/false.
 */
class DuvarKagidiModulu(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun durum(promise: Promise) {
        try {
            val context = reactApplicationContext
            val sonuc = Arguments.createMap()
            sonuc.putBoolean("izinli", DuvarKagidiUygulayici.izinliMi(context))
            val hata = GununAyetiDeposu.duvarHatasi(context)
            if (hata == null) sonuc.putNull("sonHata") else sonuc.putString("sonHata", hata)
            promise.resolve(sonuc)
        } catch (e: Throwable) {
            Log.w(TAG, "Duvar kagidi durumu okunamadi", e)
            promise.reject("DURUM_OKUNAMADI", e)
        }
    }

    @ReactMethod
    fun simdiUygula(promise: Promise) {
        try {
            DuvarKagidiUygulayici.arkaPlandaSimdiUygula(reactApplicationContext) { promise.resolve(it) }
        } catch (e: Throwable) {
            Log.w(TAG, "Duvar kagidi uygulanamadi", e)
            promise.resolve(false)
        }
    }

    companion object {
        private const val TAG = "DuvarKagidiModulu"
        const val MODULE_NAME = "DuvarKagidi"
    }
}
