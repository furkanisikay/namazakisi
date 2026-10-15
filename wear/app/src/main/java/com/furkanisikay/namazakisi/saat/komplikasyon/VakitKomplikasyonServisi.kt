package com.furkanisikay.namazakisi.saat.komplikasyon

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.MonochromaticImageComplicationData
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.SmallImageComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import androidx.wear.watchface.complications.datasource.ComplicationDataTimeline
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingTimelineComplicationDataSourceService
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.ZamanCizelgesi
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import java.time.Instant
import java.util.concurrent.TimeUnit

/**
 * Kadran komplikasyonu (issue #269): sıradaki vakit + CANLI geri sayım.
 *
 * Geri sayım `TimeDifferenceComplicationText` ile SİSTEM tarafından çizilir —
 * uygulama her dakika uyanmaz. Vakit sınırlarında zaman çizelgesi bir sonraki
 * girdiye geçer. RANGED_VALUE ilerlemesi girdiler arasında statiktir (dinamik
 * değer API 34+; bilinçli bedel).
 *
 * Issue #281: SMALL_IMAGE + MONOCHROMATIC_IMAGE (yalnız ikon kabul eden kadran
 * yuvaları) ve metin türlerine sıradaki vaktin tek renkli simgesi eklendi.
 */
class VakitKomplikasyonServisi : SuspendingTimelineComplicationDataSourceService() {

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationDataTimeline? {
        val yuk = YukDeposu(this).yuk()
        val simdi = System.currentTimeMillis()
        val araliklar = if (yuk == null) emptyList() else ZamanCizelgesi.araliklar(yuk, simdi)
        return KomplikasyonOrtak.cizelge(
            araliklar.map { a -> Triple(a.baslangic, a.bitis, veri(request.complicationType, a, a.baslangic)) }
        )
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        val ornek = ZamanCizelgesi.Aralik(
            simdi,
            simdi + 72 * 60_000L,
            VakitHesabi.VakitAni("", "ikindi", simdi + 72 * 60_000L),
            VakitHesabi.VakitAni("", "ogle", simdi - 60 * 60_000L),
        )
        return veri(type, ornek, simdi)
    }

    private fun veri(tur: ComplicationType, a: ZamanCizelgesi.Aralik, an: Long): ComplicationData? {
        val geriSayim = TimeDifferenceComplicationText.Builder(
            TimeDifferenceStyle.SHORT_DUAL_UNIT,
            CountDownTimeReference(Instant.ofEpochMilli(a.siradaki.ms)),
        ).setMinimumTimeUnit(TimeUnit.MINUTES).build()
        val aciklama = duz("Sıradaki vakit ${a.siradaki.ad}, ${VakitHesabi.saat(a.siradaki.ms)}")
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        val ikon = KomplikasyonOrtak.vakitIkonu(a.siradaki.vakit)
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(geriSayim, aciklama)
                    .setTitle(duz(a.siradaki.ad))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(geriSayim, aciklama)
                    .setTitle(duz("${a.siradaki.ad} ${VakitHesabi.saat(a.siradaki.ms)}"))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.RANGED_VALUE -> {
                val bas = a.onceki?.ms ?: a.baslangic
                val uzunluk = (a.siradaki.ms - bas).coerceAtLeast(1L).toFloat()
                val deger = ((an - bas) / uzunluk).coerceIn(0f, 1f)
                RangedValueComplicationData.Builder(deger, 0f, 1f, aciklama)
                    .setText(geriSayim)
                    .setTitle(duz(a.siradaki.ad))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
            }
            ComplicationType.MONOCHROMATIC_IMAGE ->
                MonochromaticImageComplicationData.Builder(KomplikasyonOrtak.monokrom(this, ikon), aciklama)
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.SMALL_IMAGE ->
                SmallImageComplicationData.Builder(KomplikasyonOrtak.kucukIkon(this, ikon), aciklama)
                    .setTapAction(dokunus)
                    .build()
            else -> null
        }
    }
}
