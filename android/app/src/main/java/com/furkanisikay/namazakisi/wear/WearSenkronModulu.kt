package com.furkanisikay.namazakisi.wear

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable

/**
 * JS ↔ Wear OS köprüsü (issue #269). JS adı: `NativeModules.WearSenkron`.
 *
 * - `durumGonder(json)`: telefon → saat yükü `/namazakisi/durum` DataItem'ına
 *   yazılır. DataItem'lar bağlantı yokken kuyrukta bekler, bağlanınca senkronlanır
 *   (MessageClient bağlantı yoksa DÜŞER — bu yüzden kullanılmaz).
 * - `bekleyenleriAl` / `tamamlandi` / `basarisiz`: saatten gelen "Kıldım" kuyruğu.
 *
 * Saat eşleşmemişse ya da Play Hizmetleri'nde Wearable API yoksa çağrı hata ile
 * döner; JS bunu yutar (saat yoksa telefonda hiçbir şey bozulmamalı).
 */
class WearSenkronModulu(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "WearSenkron"
        const val DURUM_YOLU = "/namazakisi/durum"
        private const val TAG = "WearSenkron"
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun durumGonder(json: String, promise: Promise) {
        try {
            val istek = PutDataMapRequest.create(DURUM_YOLU).apply {
                dataMap.putString("yuk", json)
            }.asPutDataRequest().setUrgent()
            Wearable.getDataClient(reactApplicationContext).putDataItem(istek)
                .addOnSuccessListener { promise.resolve(null) }
                .addOnFailureListener { e ->
                    Log.w(TAG, "Saate durum yazilamadi", e)
                    promise.reject("WEAR_GONDERIM", e.message, e)
                }
        } catch (e: Throwable) {
            promise.reject("WEAR_GONDERIM", e.message, e)
        }
    }

    @ReactMethod
    fun bekleyenleriAl(promise: Promise) {
        promise.resolve(WearKildimKuyrugu.tumu(reactApplicationContext))
    }

    @ReactMethod
    fun tamamlandi(id: String, promise: Promise) {
        WearKildimKuyrugu.tamamlandi(reactApplicationContext, id)
        promise.resolve(null)
    }

    @ReactMethod
    fun basarisiz(id: String, promise: Promise) {
        WearKildimKuyrugu.basarisiz(reactApplicationContext, id)
        promise.resolve(null)
    }
}
