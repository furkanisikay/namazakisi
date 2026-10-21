package com.furkanisikay.namazakisi.wear

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.furkanisikay.namazakisi.kildim.KildimKuyrugu
import com.furkanisikay.namazakisi.cekirdek.CihazDurumKurallari

/**
 * JS ↔ Wear OS köprüsü (issue #269). JS adı: `NativeModules.WearSenkron`.
 *
 * - `durumGonder(json)`: telefon → saat yükü `/namazakisi/durum` DataItem'ına
 *   yazılır. DataItem'lar bağlantı yokken kuyrukta bekler, bağlanınca senkronlanır
 *   (MessageClient bağlantı yoksa DÜŞER — bu yüzden kullanılmaz).
 * - `bekleyenleriAl` / `tamamlandi` / `basarisiz`: ESKİ arayüz — kuyruk artık ortak
 *   ([KildimKuyrugu], JS `KildimKuyruguServisi` boşaltır); geriye uyumluluk için durur.
 *
 * Saat eşleşmemişse ya da Play Hizmetleri'nde Wearable API yoksa çağrı hata ile
 * döner; JS bunu yutar (saat yoksa telefonda hiçbir şey bozulmamalı).
 */
class WearSenkronModulu(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "WearSenkron"
        const val DURUM_YOLU = "/namazakisi/durum"
        /**
         * Cihazda Play Hizmetleri / Wearable API yok (Huawei, de-Googled cihazlar —
         * GitHub APK kitlesi). JS bu kodu görünce süreç boyunca bir daha denemez;
         * yoksa her işaretleme/açılış/15 dk tanı loguna uyarı yazar ve 500 satırlık
         * tamponu gerçek hatalardan boşaltırdı.
         */
        const val KOD_WEAR_YOK = "WEAR_YOK"
        private const val TAG = "WearSenkron"
        private val WEAR_YOK_DURUMLARI = setOf(
            CommonStatusCodes.API_NOT_CONNECTED,
            ConnectionResult.API_UNAVAILABLE,
            ConnectionResult.SERVICE_MISSING,
            ConnectionResult.SERVICE_INVALID,
        )
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun durumGonder(json: String, promise: Promise) {
        gonder(json, acil = true, promise = promise)
    }

    /**
     * Aciliyet seçilebilen gönderim (denetim D-08). `acil=false` → `setUrgent` YOK: Data Layer
     * yazımı kendi toplu senkronuna bırakır (Google: ≤30 dk gecikebilir), saat radyosu ayrıca
     * uyandırılmaz. JS periyodik turda false, kullanıcı eyleminde true geçer. Ayrı yöntem:
     * `durumGonder`'in imzası değişirse eski JS ile yeni ikili (ya da tersi) uyuşmazdı.
     */
    @ReactMethod
    fun durumGonderSecenekli(json: String, acil: Boolean, promise: Promise) {
        gonder(json, acil, promise)
    }

    private fun gonder(json: String, acil: Boolean, promise: Promise) {
        if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(reactApplicationContext) != ConnectionResult.SUCCESS) {
            promise.reject(KOD_WEAR_YOK, "Play Hizmetleri yok")
            return
        }
        try {
            val temel = PutDataMapRequest.create(DURUM_YOLU).apply {
                dataMap.putString("yuk", json)
            }.asPutDataRequest()
            val istek = if (acil) temel.setUrgent() else temel
            Wearable.getDataClient(reactApplicationContext).putDataItem(istek)
                .addOnSuccessListener { promise.resolve(null) }
                .addOnFailureListener { e ->
                    if (e is ApiException && e.statusCode in WEAR_YOK_DURUMLARI) {
                        promise.reject(KOD_WEAR_YOK, e.message, e)
                    } else {
                        Log.w(TAG, "Saate durum yazilamadi", e)
                        promise.reject("WEAR_GONDERIM", e.message, e)
                    }
                }
        } catch (e: Throwable) {
            promise.reject("WEAR_GONDERIM", e.message, e)
        }
    }

    /**
     * Camideyim / Namaz modu durumunu saate yeniden yaz (saat W3). JS her saat gönderiminde
     * çağırır (açılış, konum yayması, 15 dk görevi): modül yayını kaçırıldıysa (süreç
     * ölüydü) durum yine yakalanır. İçerik aynıysa native yazmaz.
     */
    @ReactMethod
    fun camiDurumunuTazele(promise: Promise) {
        SaatDurumu.gonder(reactApplicationContext) { promise.resolve(null) }
    }

    /**
     * Saatte uyandırmaya verilen cevaplar (saat W3; `SaatUyandirmaDeposu`). JS planlama turu
     * okur: kapatılan yedek yeniden kurulmaz (ertele YOK).
     */
    @ReactMethod
    fun saatUyandirmaDurumlari(promise: Promise) {
        promise.resolve(SaatUyandirmaDeposu.oku(reactApplicationContext))
    }

    /**
     * Şu an BAĞLI bir Wear OS saati var mı? (Sade tasarım: "Wear OS saatiniz…" cümlesi
     * yalnız saat sahibine söylensin.) İzin GEREKMEZ (`NodeClient.getConnectedNodes`).
     * Dönüş `CihazDurumKurallari`: "esli" | "esliDegil" | "yok" | null (bilinmiyor).
     * Eşli ama o an bağlı olmayan saat "esliDegil" görünür — metin bunu hesaba katar.
     */
    @ReactMethod
    fun esliSaatDurumu(promise: Promise) {
        try {
            if (GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(reactApplicationContext) != ConnectionResult.SUCCESS) {
                promise.resolve(CihazDurumKurallari.saatDurumu(true, null))
                return
            }
            Wearable.getNodeClient(reactApplicationContext).connectedNodes
                .addOnSuccessListener { dugumler -> promise.resolve(CihazDurumKurallari.saatDurumu(false, dugumler.size)) }
                .addOnFailureListener { e ->
                    val wearYok = e is ApiException && e.statusCode in WEAR_YOK_DURUMLARI
                    promise.resolve(CihazDurumKurallari.saatDurumu(wearYok, null))
                }
        } catch (_: Throwable) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun bekleyenleriAl(promise: Promise) {
        promise.resolve(KildimKuyrugu.tumu(reactApplicationContext))
    }

    @ReactMethod
    fun tamamlandi(id: String, promise: Promise) {
        KildimKuyrugu.tamamlandi(reactApplicationContext, id)
        promise.resolve(null)
    }

    @ReactMethod
    fun basarisiz(id: String, promise: Promise) {
        KildimKuyrugu.basarisiz(reactApplicationContext, id)
        promise.resolve(null)
    }
}
