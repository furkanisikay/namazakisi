package com.furkanisikay.namazakisi.wear

import android.content.Intent
import android.util.Log
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.LifecycleState
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService

/**
 * Saat → telefon "Kıldım" alıcısı (issue #269).
 *
 * Saat `/namazakisi/kildim/<tarih>_<vakit>` DataItem'ı yazar; burada:
 * 1. öğe doğrulanıp KALICI kuyruğa alınır ([WearKildimKuyrugu]) ve DataItem silinir,
 * 2. JS uyandırılır: uygulama ÖN PLANDAYSA `WearKildimGeldi` olayı yayılır (headless
 *    görev ön planda çökerdi), DEĞİLSE headless görev başlatılmaya ÇALIŞILIR.
 *
 * `startService` API 26+'da arka plan kısıtına takılabilir ("Not allowed to start
 * service"). Bu bir HATA DEĞİLDİR: öğe kuyrukta kalır, uygulama ön plana gelince
 * ve 15 dk'lık arka plan görevinde işlenir. Foreground service bilinçli olarak
 * KULLANILMAZ (AGENTS.md).
 */
class WearDinleyiciServisi : WearableListenerService() {

    companion object {
        private const val TAG = "WearDinleyici"
        const val KILDIM_YOLU_ONEKI = "/namazakisi/kildim/"
        const val OLAY_ADI = "WearKildimGeldi"
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        var yeniOge = false
        for (olay in dataEvents) {
            if (olay.type != DataEvent.TYPE_CHANGED) continue
            val oge = olay.dataItem
            val yol = oge.uri.path ?: continue
            if (!yol.startsWith(KILDIM_YOLU_ONEKI)) continue
            try {
                val harita = DataMapItem.fromDataItem(oge).dataMap
                if (WearKildimKuyrugu.ekle(this, harita.getString("tarih") ?: "", harita.getString("vakit") ?: "")) {
                    yeniOge = true
                } else {
                    Log.w(TAG, "Gecersiz kildim istegi atlandi: $yol")
                }
            } catch (e: Exception) {
                Log.w(TAG, "Kildim istegi okunamadi: $yol", e)
            } finally {
                // İşlendi (ya da geçersiz) — saat tarafında birikmesin.
                Wearable.getDataClient(this).deleteDataItems(oge.uri)
            }
        }
        if (yeniOge) jsUyandir()
    }

    private fun jsUyandir() {
        val baglam: ReactContext? = try {
            (application as? ReactApplication)?.reactHost?.currentReactContext
        } catch (_: Throwable) {
            null
        }
        if (baglam != null && baglam.lifecycleState == LifecycleState.RESUMED) {
            try {
                baglam.emitDeviceEvent(OLAY_ADI, null)
                return
            } catch (e: Throwable) {
                Log.w(TAG, "On plan olayi yayilamadi", e)
            }
        }
        try {
            startService(Intent(this, WearKildimGorevServisi::class.java))
        } catch (e: Exception) {
            // Kuyruk korunur; ön plan / 15 dk görevi boşaltır.
            Log.i(TAG, "Headless gorev baslatilamadi, kuyrukta bekleyecek", e)
        }
    }
}
