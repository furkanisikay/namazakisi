package com.furkanisikay.namazakisi.wear

import android.util.Log
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.kildim.KildimKuyrugu
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService

/**
 * Saat → telefon "Kıldım" alıcısı (issue #269).
 *
 * Saat `/namazakisi/kildim/<tarih>_<vakit>` DataItem'ı yazar; burada:
 * 1. öğe doğrulanıp KALICI kuyruğa alınır ([KildimKuyrugu], kaynak `wear` — widget,
 *    hızlı ayarlar ve kısayolla ORTAK kuyruk, issue #275/#276) ve DataItem silinir,
 * 2. widget "işaretleniyor" çizilir, JS uyandırılır ([KildimKuyrugu.jsUyandir]:
 *    ön plandaysa olay, değilse headless görev).
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
                if (KildimKuyrugu.ekle(
                        this,
                        harita.getString("tarih"),
                        harita.getString("vakit"),
                        KildimKuyruguKurallari.KAYNAK_WEAR,
                    )
                ) {
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
        if (yeniOge) {
            WidgetGuncelleyici.tumunuGuncelle(this)
            KildimKuyrugu.jsUyandir(this)
        }
    }
}
