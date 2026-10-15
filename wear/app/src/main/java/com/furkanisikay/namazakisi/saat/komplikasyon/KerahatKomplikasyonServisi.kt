package com.furkanisikay.namazakisi.saat.komplikasyon

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import androidx.wear.watchface.complications.datasource.ComplicationDataTimeline
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingTimelineComplicationDataSourceService
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.KerahatCizelgesi
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import java.time.Instant
import java.util.concurrent.TimeUnit

/**
 * Kerahat komplikasyonu (issue #281) — SHORT_TEXT, zaman çizelgeli.
 *
 * Kerahat İÇİNDE: "Kerahat" + bitişine kalan süre (sistem çizer, uyandırma yok).
 * DIŞINDA: sıradaki kerahatin başlangıç saati. Pencere sınırlarında çizelge
 * kendiliğinden bir sonraki girdiye geçer. Kerahat UYARIDIR, engel değil.
 */
class KerahatKomplikasyonServisi : SuspendingTimelineComplicationDataSourceService() {

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationDataTimeline? {
        val yuk = YukDeposu(this).yuk()
        val simdi = System.currentTimeMillis()
        val araliklar = if (yuk == null) emptyList() else KerahatCizelgesi.cizelge(yuk, simdi)
        return KomplikasyonOrtak.cizelge(
            araliklar.map { a -> Triple(a.baslangic, a.bitis, veri(request.complicationType, a)) }
        )
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        return veri(type, KerahatCizelgesi.Aralik(simdi, simdi + 12 * 60_000L, icinde = true, hedefMs = simdi + 12 * 60_000L))
    }

    private fun veri(tur: ComplicationType, a: KerahatCizelgesi.Aralik): ComplicationData? {
        if (tur != ComplicationType.SHORT_TEXT) return null
        val saat = VakitHesabi.saat(a.hedefMs)
        val (metin, aciklama) = if (a.icinde) {
            TimeDifferenceComplicationText.Builder(
                TimeDifferenceStyle.SHORT_SINGLE_UNIT,
                CountDownTimeReference(Instant.ofEpochMilli(a.hedefMs)),
            ).setMinimumTimeUnit(TimeUnit.MINUTES).build() to "Kerahat vaktindesiniz, bitiş $saat"
        } else {
            duz(saat) to "Sıradaki kerahat vakti $saat"
        }
        return ShortTextComplicationData.Builder(metin, duz(aciklama))
            .setTitle(duz("Kerahat"))
            .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit_gunes))
            .setTapAction(KomplikasyonOrtak.uygulamayiAc(this))
            .build()
    }
}
