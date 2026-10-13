package com.furkanisikay.namazakisi.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.furkanisikay.namazakisi.cekirdek.KildimKuyruguKurallari
import com.furkanisikay.namazakisi.kildim.KildimIslemleri

/**
 * Widget "Kıldım" dokunuşu (issue #275). Yalnız İŞARETLEME yapar (geri alma uygulamada).
 *
 * Dokunuş anında yeniden doğrulanır: widget, ekran kapalıyken bekleyen sınır
 * alarmı yüzünden bir önceki vakti gösteriyor olabilir; bayat çizime dokunmak
 * yanlış vakti kaydetmesin diye yalnız ŞU ANKİ aktif vakit işaretlenir, aksi
 * halde widget yalnız tazelenir.
 */
class WidgetKildimAlici : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != EYLEM) return
        val tarih = intent.getStringExtra(EK_TARIH) ?: return
        val widgetKodu = intent.getStringExtra(EK_VAKIT) ?: return
        KildimIslemleri.dokunustanKuyrugaAl(context, tarih, widgetKodu, KildimKuyruguKurallari.KAYNAK_WIDGET)
    }

    companion object {
        const val EYLEM = "com.furkanisikay.namazakisi.widget.KILDIM"
        const val EK_TARIH = "tarih"
        const val EK_VAKIT = "vakit"
    }
}
