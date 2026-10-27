package com.furkanisikay.namazakisi.saat.komplikasyon

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.KerahatCizelgesi
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import java.time.Instant

/**
 * Kerahat komplikasyonu (issue #281) — SHORT_TEXT, zaman çizelgeli.
 *
 * Kerahat İÇİNDE: "Kerahat" + bitişine kalan süre (kronometre, sistem çizer, uyandırma yok).
 * DIŞINDA: sıradaki kerahatin başlangıç saati. Pencere sınırlarında çizelge
 * kendiliğinden bir sonraki girdiye geçer. Kerahat UYARIDIR, engel değil.
 */
class KerahatKomplikasyonServisi : GuvenliKomplikasyonServisi() {

    override fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>> {
        val yuk = YukDeposu(this).yuk() ?: return emptyList()
        return KerahatCizelgesi.cizelge(yuk, System.currentTimeMillis())
            .map { a -> Triple(a.baslangic, a.bitis, veri(tur, a)) }
    }

    override fun onizleme(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        return veri(type, KerahatCizelgesi.Aralik(simdi, simdi + 12 * 60_000L, icinde = true, hedefMs = simdi + 12 * 60_000L))
    }

    override fun varsayilan(tur: ComplicationType): ComplicationData? {
        if (tur != ComplicationType.SHORT_TEXT) return null
        return ShortTextComplicationData.Builder(duz("—"), duz(getString(R.string.komplikasyon_bekleniyor_aciklama)))
            .setTitle(duz(getString(R.string.komplikasyon_kerahat)))
            .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit_gunes))
            .setTapAction(KomplikasyonOrtak.uygulamayiAc(this))
            .build()
    }

    private fun veri(tur: ComplicationType, a: KerahatCizelgesi.Aralik): ComplicationData? {
        if (tur != ComplicationType.SHORT_TEXT) return null
        val saat = VakitHesabi.saat(a.hedefMs)
        val (metin, aciklama) = if (a.icinde) {
            // Kronometre: kerahat penceresi bir saatten kısadır → "12:34" (dk:sn), canlı.
            TimeDifferenceComplicationText.Builder(
                TimeDifferenceStyle.STOPWATCH,
                CountDownTimeReference(Instant.ofEpochMilli(a.hedefMs)),
            ).build() to getString(R.string.kerahat_icinde_aciklama, saat)
        } else {
            duz(saat) to getString(R.string.kerahat_siradaki_aciklama, saat)
        }
        return ShortTextComplicationData.Builder(metin, duz(aciklama))
            .setTitle(duz(getString(R.string.komplikasyon_kerahat)))
            .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit_gunes))
            .setTapAction(KomplikasyonOrtak.uygulamayiAc(this))
            .build()
    }
}
