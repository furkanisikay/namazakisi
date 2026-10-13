package com.furkanisikay.namazakisi.saat.ui

import android.os.Bundle
import android.view.ViewConfiguration
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.view.ViewConfigurationCompat
import com.furkanisikay.namazakisi.saat.cekirdek.Tesbihat
import com.furkanisikay.namazakisi.saat.tesbihat.TesbihatDeposu
import com.furkanisikay.namazakisi.saat.tesbihat.TesbihatEtkinligi
import com.furkanisikay.namazakisi.saat.tesbihat.TesbihatHissi

/**
 * Tesbihat sayacı (issue #293). Durum her dokunuşta diske yazılır (süreç ölse de
 * kaldığı yerden); ekran kapanınca / çıkınca yarım oturum kadranda Ongoing simgesi
 * olarak kalır ve tek dokunuşla buraya döner.
 *
 * Ekranı açık tutmaz (`FLAG_KEEP_SCREEN_ON` YOK — pil): ekran kapalıyken dokunuş ve
 * taç dönüşü uygulamaya ulaşmaz; ekran uyanınca sayım kaldığı yerden sürer.
 */
class TesbihatAktivite : ComponentActivity() {
    private lateinit var depo: TesbihatDeposu
    private lateinit var his: TesbihatHissi
    private var durum by mutableStateOf(Tesbihat.Durum())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        depo = TesbihatDeposu(this)
        his = TesbihatHissi(this)
        durum = depo.oku(System.currentTimeMillis())
        // Bir çerçeve çentiği ≈ bir kaydırma birimi; payla bir çentik = bir sayım.
        val tacEsigi = ViewConfigurationCompat.getScaledVerticalScrollFactor(ViewConfiguration.get(this), this) * TAC_CENTIK_ORANI
        setContent {
            TesbihatEkrani(
                durum = durum,
                tacEsigi = tacEsigi,
                onSay = { uygula(Tesbihat.say(durum)) },
                onGeriAl = { uygula(Tesbihat.geriAl(durum)) },
                onSifirla = {
                    durum = Tesbihat.sifirla()
                    depo.yaz(durum, System.currentTimeMillis())
                    TesbihatEtkinligi.kaldir(this)
                },
            )
        }
    }

    override fun onStart() {
        super.onStart()
        // Uzun aradan sonra (ekran saatlerce kapalı kaldı) dönülürse eskimiş oturum sıfırlanır.
        durum = depo.oku(System.currentTimeMillis())
    }

    override fun onStop() {
        super.onStop()
        TesbihatEtkinligi.guncelle(this, durum)
    }

    private fun uygula(sonuc: Tesbihat.Sonuc) {
        if (sonuc.olay == Tesbihat.Olay.YOK) return
        durum = sonuc.durum
        depo.yaz(durum, System.currentTimeMillis())
        his.ver(sonuc.olay)
        if (!Tesbihat.suruyorMu(durum)) TesbihatEtkinligi.kaldir(this)
    }

    private companion object {
        const val TAC_CENTIK_ORANI = 0.9f
    }
}
