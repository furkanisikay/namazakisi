package com.furkanisikay.namazakisi.saat.veri

import android.content.ComponentName
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.wear.tiles.TileService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.komplikasyon.VakitKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.tile.VakitTileServisi
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.tasks.await

/**
 * Data Layer yolları — telefon tarafının aynası (`WearSenkronModulu.kt`,
 * `WearDinleyiciServisi.kt`). Yollar iki tarafta AYNI olmalı.
 */
object Senkron {
    const val DURUM_YOLU = "/namazakisi/durum"
    const val KILDIM_YOLU_ONEKI = "/namazakisi/kildim/"
    private const val TAG = "SaatSenkron"

    /** Yeni yük geldi → tile ve komplikasyonları tazele (zaman çizelgeleri yeniden kurulur). */
    fun yuzeyleriTazele(context: Context) {
        try {
            TileService.getUpdater(context).requestUpdate(VakitTileServisi::class.java)
            ComplicationDataSourceUpdateRequester
                .create(context, ComponentName(context, VakitKomplikasyonServisi::class.java))
                .requestUpdateAll()
        } catch (e: Exception) {
            Log.w(TAG, "Yuzeyler tazelenemedi", e)
        }
    }

    /**
     * Uygulama açılışında Data Layer'daki SON yükü oku: dinleyici servis saat
     * kapalıyken gelen değişikliği kaçırmış olabilir; DataItem kalıcıdır.
     */
    suspend fun sonYukuCek(context: Context) {
        try {
            val tampon = Wearable.getDataClient(context)
                .getDataItems(Uri.parse("wear://*$DURUM_YOLU"))
                .await()
            try {
                for (oge in tampon) {
                    val json = DataMapItem.fromDataItem(oge).dataMap.getString("yuk") ?: continue
                    if (YukDeposu(context).kaydet(json)) yuzeyleriTazele(context)
                }
            } finally {
                tampon.release()
            }
        } catch (e: Exception) {
            Log.w(TAG, "Son yuk cekilemedi", e)
        }
    }

    /**
     * Saatten "Kıldım": DataItem (MessageClient DEĞİL — bağlantı yokken kuyrukta
     * bekler). Telefon işleyince öğeyi siler ve güncel durumu geri gönderir.
     */
    suspend fun kildimGonder(context: Context, tarih: String, vakit: String) {
        YukDeposu(context).bekleyenEkle(VakitHesabi.kimlik(tarih, vakit))
        yuzeyleriTazele(context)
        try {
            val istek = PutDataMapRequest.create("$KILDIM_YOLU_ONEKI${tarih}_$vakit").apply {
                dataMap.putString("tarih", tarih)
                dataMap.putString("vakit", vakit)
                dataMap.putLong("zamanMs", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()
            Wearable.getDataClient(context).putDataItem(istek).await()
        } catch (e: Exception) {
            // Yerel kuyrukta kalır; Data Layer bağlanınca iletir.
            Log.w(TAG, "Kildim istegi yazilamadi", e)
        }
    }
}
