package com.furkanisikay.namazakisi.saat.veri

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

/**
 * Telefon → saat: `/namazakisi/durum` değişince yükü kaydet, yüzeyleri ve hatırlatma
 * zincirini tazele (telefonda "kılındı" → saatteki kalan alarmlar da susar).
 */
class TelefonDinleyiciServisi : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (olay in dataEvents) {
            if (olay.type != DataEvent.TYPE_CHANGED) continue
            if (olay.dataItem.uri.path != Senkron.DURUM_YOLU) continue
            val json = DataMapItem.fromDataItem(olay.dataItem).dataMap.getString("yuk") ?: continue
            if (YukDeposu(this).kaydet(json)) Senkron.yerelVeriDegisti(this)
        }
    }
}
