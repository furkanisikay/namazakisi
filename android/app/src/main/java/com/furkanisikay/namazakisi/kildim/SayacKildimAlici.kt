package com.furkanisikay.namazakisi.kildim

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.widget.WidgetGuncelleyici

/**
 * Öne çıkarılmış (Android 16 Live Update) vakit sayacındaki "Kıldım" (issue #282).
 *
 * Sayaç `modules/expo-countdown-notification` içindedir ve uygulama sınıflarını
 * göremez; dokunuşta sayacı kaldırıp bu eylemi paket-kapsamlı açık yayınla
 * (`setPackage`) gönderir. Burada öğe ortak kalıcı kuyruğa yazılır ve JS uyandırılır
 * → JS bildirimdeki "Kıldım" ile AYNI gövdeden işler (`kildimAksiyonunuIsle`).
 *
 * Widget dokunuşundaki "hâlâ aktif mi?" doğrulaması BURADA YOK (bilinçli): sayaç
 * yalnız o vaktin kılınmamış son dakikalarında görünür ve vakit çıkınca bitiş
 * alarmıyla kalkar; notifee yer tutucusundaki "Kıldım" da doğrulama yapmaz.
 * Biçim doğrulaması `KildimKuyruguKurallari.gecerliMi` (tarih + vakit) ile yapılır.
 */
class SayacKildimAlici : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != EYLEM) return
        val tarih = intent.getStringExtra(EK_TARIH)
        val vakit = intent.getStringExtra(EK_VAKIT)
        if (!KildimKuyrugu.ekle(context, tarih, vakit, KildimKuyruguKurallari.KAYNAK_SAYAC)) return
        WidgetGuncelleyici.tumunuGuncelle(context)
        KildimKuyrugu.jsUyandir(context)
    }

    companion object {
        /** `CanliGuncelleme.SAYAC_KILDIM_EYLEMI` (sayaç modülü) ile AYNI olmalı. */
        const val EYLEM = "com.furkanisikay.namazakisi.SAYAC_KILDIM"
        const val EK_TARIH = "tarih"
        const val EK_VAKIT = "vakit"
    }
}
