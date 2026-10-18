package com.furkanisikay.namazakisi.saat.veri

import com.furkanisikay.namazakisi.saat.cekirdek.TelefonKomutu
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import com.furkanisikay.namazakisi.saat.cekirdek.UyandirmaZinciri
import com.furkanisikay.namazakisi.saat.hatirlatma.Hatirlatici
import com.furkanisikay.namazakisi.saat.hatirlatma.UyandirmaBildirimi
import com.furkanisikay.namazakisi.saat.hatirlatma.UyandirmaDeposu

/**
 * Telefon → saat: `/namazakisi/durum` değişince yükü kaydet, yüzeyleri ve hatırlatma
 * zincirini tazele (telefonda "kılındı" → saatteki kalan alarmlar da susar).
 */
class TelefonDinleyiciServisi : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (olay in dataEvents) {
            if (olay.type != DataEvent.TYPE_CHANGED) continue
            // Camideyim / Namaz modu gösterimi (saat W3) — ana yükten AYRI küçük öğe.
            if (olay.dataItem.uri.path == TelefonKomutu.CAMI_DURUM_YOLU) {
                val durum = DataMapItem.fromDataItem(olay.dataItem).dataMap.getString("durum") ?: continue
                Senkron.camiDurumuGeldi(this, durum)
                continue
            }
            if (olay.dataItem.uri.path != Senkron.DURUM_YOLU) continue
            val json = DataMapItem.fromDataItem(olay.dataItem).dataMap.getString("yuk") ?: continue
            if (YukDeposu(this).kaydet(json)) Senkron.yerelVeriDegisti(this)
        }
    }

    /**
     * Telefonda susturulan uyandırma (saat W3, inceleme bulgusu 7): bilekteki titreşim de
     * durur ve bu uyandırma bir daha çalmaz. Kimlik doğrulanır (telefon başka bir şey
     * susturamaz).
     */
    override fun onMessageReceived(olay: MessageEvent) {
        if (olay.path != TelefonKomutu.TELEFONDA_KAPANDI_YOLU) return
        val id = olay.data?.toString(Charsets.UTF_8) ?: return
        if (!UyandirmaZinciri.uyandirmaKimligiMi(id)) return
        UyandirmaDeposu(this).kapat(id)
        UyandirmaBildirimi.kaldir(this, id)
        Hatirlatici.tazele(this)
    }
}
