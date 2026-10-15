package com.furkanisikay.namazakisi.saat.veri

import android.content.ComponentName
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.wear.tiles.TileService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.hatirlatma.Hatirlatici
import com.furkanisikay.namazakisi.saat.hatirlatma.MuhafizBildirimci
import com.furkanisikay.namazakisi.saat.komplikasyon.GunDagilimiKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.komplikasyon.GunDagilimiYedekKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.komplikasyon.GunlukIlerlemeKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.komplikasyon.GunlukIlerlemeYedekKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.komplikasyon.KerahatKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.komplikasyon.VakitKomplikasyonServisi
import com.furkanisikay.namazakisi.saat.tile.BugunTileServisi
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

    /**
     * Yerel veri değişti (yeni yük ya da saatte "Kıldım") → yüzeyler + bağımsız
     * hatırlatma zinciri (issue #280) birlikte tazelenir.
     */
    fun yerelVeriDegisti(context: Context) {
        yuzeyleriTazele(context)
        Hatirlatici.tazele(context)
    }

    private val TILELAR = listOf(VakitTileServisi::class.java, BugunTileServisi::class.java)

    /**
     * Tüm komplikasyon veri kaynakları. Yeni bir kaynak eklenirse BURAYA da eklenmeli —
     * yoksa kılınmışlık değişince o yuva bir sonraki vakit sınırına kadar eski kalır.
     * Yedek ikizler (API 33 öncesi) cihazda devre dışıysa istek zararsızdır.
     */
    private val KOMPLIKASYONLAR = listOf(
        VakitKomplikasyonServisi::class.java,
        GunlukIlerlemeKomplikasyonServisi::class.java,
        GunlukIlerlemeYedekKomplikasyonServisi::class.java,
        GunDagilimiKomplikasyonServisi::class.java,
        GunDagilimiYedekKomplikasyonServisi::class.java,
        KerahatKomplikasyonServisi::class.java,
    )

    /** Tile ve komplikasyonları tazele (zaman çizelgeleri yeniden kurulur). */
    fun yuzeyleriTazele(context: Context) {
        // Her yüzey kendi try'ında: biri patlarsa diğerleri yine tazelensin.
        for (tile in TILELAR) {
            try {
                TileService.getUpdater(context).requestUpdate(tile)
            } catch (e: Exception) {
                Log.w(TAG, "Tile tazelenemedi: ${tile.simpleName}", e)
            }
        }
        for (kaynak in KOMPLIKASYONLAR) {
            try {
                ComplicationDataSourceUpdateRequester
                    .create(context, ComponentName(context, kaynak))
                    .requestUpdateAll()
            } catch (e: Exception) {
                Log.w(TAG, "Komplikasyon tazelenemedi: ${kaynak.simpleName}", e)
            }
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
                    if (YukDeposu(context).kaydet(json)) yerelVeriDegisti(context)
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
        // Telefon uzakta olsa da o vaktin kalan uyarıları HEMEN susar: bekleyen
        // kimlik zinciri o vakti atlatır, ekrandaki bildirim kaldırılır.
        MuhafizBildirimci.vakitBildiriminiKaldir(context, tarih, vakit)
        yerelVeriDegisti(context)
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
