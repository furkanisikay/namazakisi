package com.furkanisikay.namazakisi.saat.komplikasyon

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.MonochromaticImageComplicationData
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.data.SmallImageComplicationData
import androidx.wear.watchface.complications.data.TimeDifferenceComplicationText
import androidx.wear.watchface.complications.data.TimeDifferenceStyle
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.KalanSure
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.ZamanCizelgesi
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.veri.YukDeposu
import java.time.Instant
import java.util.concurrent.TimeUnit

/**
 * Kadran komplikasyonu (issue #269): VAKTİN ÇIKIŞINA kalan süre, CANLI.
 *
 * Geri sayım `TimeDifferenceComplicationText` ile SİSTEM tarafından çizilir —
 * uygulama her dakika uyanmaz; vakit sınırlarında zaman çizelgesi bir sonraki
 * girdiye geçer. Etiketler `KalanSure`'den: farz vakti sürüyorsa başlık o vaktin
 * adıdır ("Öğle" + kalan), güneş→öğle arasında "Öğleye".
 *
 *  - SHORT_TEXT: kronometre ("1:12" / son saatte "12:34" dk:sn) + kısa ad.
 *  - RANGED_VALUE: aynı metin ana öğe; halka vaktin geçen kısmıdır (ikincil, girdiler
 *    arasında statik — dinamik değer API 34+, bilinçli bedel).
 *  - LONG_TEXT: "Öğle · 1 sa 12 dk kaldı" + başlıkta sıradaki vaktin saati.
 *  - MONOCHROMATIC_IMAGE / SMALL_IMAGE: yalnız ikon kabul eden yuvalar (issue #281).
 */
class VakitKomplikasyonServisi : GuvenliKomplikasyonServisi() {

    override fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>> {
        val yuk = YukDeposu(this).yuk() ?: return emptyList()
        return ZamanCizelgesi.araliklar(yuk, System.currentTimeMillis())
            .map { a -> Triple(a.baslangic, a.bitis, veri(tur, a, a.baslangic)) }
    }

    override fun onizleme(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        val ornek = ZamanCizelgesi.Aralik(
            simdi,
            simdi + 72 * 60_000L,
            VakitHesabi.VakitAni("", "ikindi", simdi + 72 * 60_000L),
            VakitHesabi.VakitAni("", "ogle", simdi - 60 * 60_000L),
        )
        return veri(type, ornek, simdi)
    }

    /** Telefon henüz veri göndermediyse ya da çizelge tükendiyse: "—", geri sayım YOK. */
    override fun varsayilan(tur: ComplicationType): ComplicationData? {
        val aciklama = duz("Vakit bilgisi bekleniyor; telefonda Namaz Akışı'nı açın")
        val ikon = KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit)
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(duz("—"), aciklama)
                    .setTitle(duz("Vakit")).setMonochromaticImage(ikon).setTapAction(dokunus).build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(duz("Vakitler bekleniyor"), aciklama)
                    .setMonochromaticImage(ikon).setTapAction(dokunus).build()
            ComplicationType.RANGED_VALUE ->
                RangedValueComplicationData.Builder(0f, 0f, 1f, aciklama)
                    .setText(duz("—")).setMonochromaticImage(ikon).setTapAction(dokunus).build()
            ComplicationType.MONOCHROMATIC_IMAGE ->
                MonochromaticImageComplicationData.Builder(ikon, aciklama).setTapAction(dokunus).build()
            ComplicationType.SMALL_IMAGE ->
                SmallImageComplicationData.Builder(KomplikasyonOrtak.kucukIkon(this, R.drawable.ic_vakit), aciklama)
                    .setTapAction(dokunus).build()
            else -> null
        }
    }

    private fun sayac(hedefMs: Long, stil: TimeDifferenceStyle, sablon: String? = null): ComplicationText =
        TimeDifferenceComplicationText.Builder(stil, CountDownTimeReference(Instant.ofEpochMilli(hedefMs)))
            .apply { if (sablon != null) setText(sablon) }
            // Kronometre son saatte saniyeyi de gösterir; diğer stiller dakikada durur.
            .apply { if (stil != TimeDifferenceStyle.STOPWATCH) setMinimumTimeUnit(TimeUnit.MINUTES) }
            .build()

    private fun veri(tur: ComplicationType, a: ZamanCizelgesi.Aralik, an: Long): ComplicationData? {
        val bitis = a.siradaki.ms
        val saat = VakitHesabi.saat(bitis)
        val g = KalanSure.gosterim(a.onceki?.vakit, a.siradaki.vakit, saat)
        val aciklama = duz(g.aciklama)
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        // İkon: sayılan şeyin vakti (çıkışta şu anki vakit, girişte gelecek vakit).
        val ikonVakti = if (g.mod == KalanSure.Mod.CIKIS) a.onceki?.vakit ?: a.siradaki.vakit else a.siradaki.vakit
        val ikon = KomplikasyonOrtak.vakitIkonu(ikonVakti)
        val kronometre = sayac(bitis, TimeDifferenceStyle.STOPWATCH)
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(kronometre, aciklama)
                    .setTitle(duz(g.kisaBaslik))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(sayac(bitis, TimeDifferenceStyle.SHORT_DUAL_UNIT, g.uzunSablon), aciklama)
                    .setTitle(duz("${KalanSure.kisaAd(a.siradaki.vakit)} $saat"))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.RANGED_VALUE -> {
                val bas = a.onceki?.ms ?: a.baslangic
                val uzunluk = (bitis - bas).coerceAtLeast(1L).toFloat()
                val deger = ((an - bas) / uzunluk).coerceIn(0f, 1f)
                RangedValueComplicationData.Builder(deger, 0f, 1f, aciklama)
                    .setText(kronometre)
                    .setTitle(duz(g.kisaBaslik))
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
