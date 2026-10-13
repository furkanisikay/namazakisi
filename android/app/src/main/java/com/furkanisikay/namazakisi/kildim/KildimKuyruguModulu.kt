package com.furkanisikay.namazakisi.kildim

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici

/**
 * JS ↔ "Kıldım" kuyruğu köprüsü. JS adı: `NativeModules.KildimKuyrugu`
 * (`src/domain/services/KildimKuyruguServisi.ts`).
 */
class KildimKuyruguModulu(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun bekleyenleriAl(promise: Promise) {
        promise.resolve(KildimKuyrugu.tumu(reactApplicationContext))
    }

    /**
     * Widget burada TAZELENMEZ: JS önce kaydı yazar, kılınmışlık dinleyicisi
     * widget'ı "kılındı"ya çevirir; burada çizseydik kılınmışlık yazımı gelmeden
     * kısa bir an "kılınmadı" görünürdü (titreme).
     */
    @ReactMethod
    fun tamamlandi(id: String, promise: Promise) {
        KildimKuyrugu.tamamlandi(reactApplicationContext, id)
        promise.resolve(null)
    }

    /** Zehirli öğe düşürüldüyse iyimser "işaretleniyor" durumu geri alınır. */
    @ReactMethod
    fun basarisiz(id: String, promise: Promise) {
        if (KildimKuyrugu.basarisiz(reactApplicationContext, id)) {
            WidgetGuncelleyici.tumunuGuncelle(reactApplicationContext)
        }
        promise.resolve(null)
    }

    companion object {
        const val MODULE_NAME = "KildimKuyrugu"
    }
}
