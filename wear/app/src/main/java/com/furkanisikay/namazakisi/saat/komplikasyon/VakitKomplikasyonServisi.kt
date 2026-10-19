package com.furkanisikay.namazakisi.saat.komplikasyon

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationText
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.CountDownTimeReference
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.MonochromaticImageComplicationData
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
 * Kadran komplikasyonu (issue #269): VAKTİN ÇIKIŞINA kalan süre, CANLI, DÜZ METİN.
 *
 * YALNIZ SÜRE (sahip kararı): çıkış saati ve sıradaki vakit bu yuvaya YAZILMAZ — dar
 * yuvada kalan süre görünmez oluyordu. O bilgiler ayrı kaynaklardadır:
 * `VakitCikisSaatiKomplikasyonServisi`, `SiradakiNamazKomplikasyonServisi`.
 *
 * Geri sayım `TimeDifferenceComplicationText` ile SİSTEM tarafından çizilir —
 * uygulama her dakika uyanmaz; vakit sınırlarında zaman çizelgesi bir sonraki
 * girdiye geçer. Etiketler `KalanSure`'den: farz vakti sürüyorsa başlık o vaktin
 * adıdır ("Öğle" + kalan), güneş→öğle arasında "Öğleye".
 *
 * İLERLEME ÇUBUĞU YOK (sahip kararı): kadran yuvası RANGED_VALUE/GOAL_PROGRESS
 * destekliyorsa sistem o türü seçer ve kalan sürenin etrafına bir halka çizer — "kalan
 * süreyi söyleyen" yüzey çubuk gibi okunuyordu. Bu kaynak yalnız metin (ve yalnız ikon
 * kabul eden yuvalar için ikon) sunar; halka isteyen "Günlük ilerleme" kaynağını seçer.
 *
 *  - SHORT_TEXT: "1:23" (sa:dk; son saatte "0:23") + kısa ad ("Öğle"). Dakika
 *    çözünürlüklü: "1:12" daima sa:dk okunur (eskiden son saatte dk:sn idi, iki biçim
 *    aynı görünüyordu).
 *  - LONG_TEXT: metin yalnız süre ("1 sa 12 dk"), başlık "Öğle çıkışına" (girişe
 *    sayarken "Öğleye"); saat YOK.
 *  - MONOCHROMATIC_IMAGE / SMALL_IMAGE: yalnız ikon kabul eden yuvalar (issue #281).
 */
class VakitKomplikasyonServisi : GuvenliKomplikasyonServisi() {

    override fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>> {
        val yuk = YukDeposu(this).yuk() ?: return emptyList()
        return ZamanCizelgesi.araliklar(yuk, System.currentTimeMillis())
            .map { a -> Triple(a.baslangic, a.bitis, veri(tur, a)) }
    }

    override fun onizleme(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        val ornek = ZamanCizelgesi.Aralik(
            simdi,
            simdi + 72 * 60_000L,
            VakitHesabi.VakitAni("", "ikindi", simdi + 72 * 60_000L),
            VakitHesabi.VakitAni("", "ogle", simdi - 60 * 60_000L),
        )
        return veri(type, ornek)
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
            ComplicationType.MONOCHROMATIC_IMAGE ->
                MonochromaticImageComplicationData.Builder(ikon, aciklama).setTapAction(dokunus).build()
            ComplicationType.SMALL_IMAGE ->
                SmallImageComplicationData.Builder(KomplikasyonOrtak.kucukIkon(this, R.drawable.ic_vakit), aciklama)
                    .setTapAction(dokunus).build()
            // RANGED_VALUE artık SUNULMAZ (halka çizilirdi). Güncelleme öncesi bu türle
            // bağlanmış bir yuva null → NO_DATA alır; kullanıcı yuvayı yeniden seçer (Neler Yeni).
            else -> null
        }
    }

    /** Dakika çözünürlüklü geri sayım: kronometre "1:23"/"0:23", diğer stiller "1 sa 23 dk". */
    private fun sayac(hedefMs: Long, stil: TimeDifferenceStyle): ComplicationText =
        TimeDifferenceComplicationText.Builder(stil, CountDownTimeReference(Instant.ofEpochMilli(hedefMs)))
            .setMinimumTimeUnit(TimeUnit.MINUTES)
            .build()

    private fun veri(tur: ComplicationType, a: ZamanCizelgesi.Aralik): ComplicationData? {
        val bitis = a.siradaki.ms
        val g = KalanSure.gosterim(a.onceki?.vakit, a.siradaki.vakit)
        // Sayılan an ana ekran ve tile ile AYNI kuraldan (tek kaynak).
        val sayilan = VakitHesabi.sayilanAn(a.onceki, a.siradaki)
        val aciklama = duz(g.aciklama)
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        // İkon: sayılan şeyin vakti (çıkışta şu anki vakit, girişte gelecek vakit) — güneş olamaz.
        val ikon = KomplikasyonOrtak.vakitIkonu(sayilan.vakit)
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(sayac(bitis, TimeDifferenceStyle.STOPWATCH), aciklama)
                    .setTitle(duz(g.kisaBaslik))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(sayac(bitis, TimeDifferenceStyle.SHORT_DUAL_UNIT), aciklama)
                    .setTitle(duz(g.uzunBaslik))
                    .setMonochromaticImage(KomplikasyonOrtak.monokrom(this, ikon))
                    .setTapAction(dokunus)
                    .build()
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
