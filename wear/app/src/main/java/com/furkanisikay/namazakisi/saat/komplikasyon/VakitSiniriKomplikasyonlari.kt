package com.furkanisikay.namazakisi.saat.komplikasyon

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import com.furkanisikay.namazakisi.saat.R
import com.furkanisikay.namazakisi.saat.cekirdek.VakitHesabi
import com.furkanisikay.namazakisi.saat.cekirdek.VakitSiniri
import com.furkanisikay.namazakisi.saat.cekirdek.ZamanCizelgesi
import com.furkanisikay.namazakisi.saat.komplikasyon.KomplikasyonOrtak.duz
import com.furkanisikay.namazakisi.saat.veri.YukDeposu

/**
 * "Kalan süre" yuvasından AYRILAN bilgiler (sahip kararı: her yuva tek bilgi taşır,
 * kalan süre yuvası yalnız süreyi gösterir). İkisi de SHORT_TEXT + LONG_TEXT, düz
 * metin, zaman çizelgeli; geri sayım yok, ilerleme halkası yok. GOAL_PROGRESS gibi
 * API 33 türü bildirmedikleri için "Yedek" ikizleri GEREKMEZ.
 *
 *  - "Vakit çıkış saati": şu anki farzın çıkışı ("Çıkış" / "15:42", uzun "Öğle çıkışı
 *    15:42"); güneş→öğle arasında öğlenin girişi ("Giriş" / "Öğle girişi 13:05").
 *  - "Sıradaki namaz": sıradaki namaz vaktinin adı ve giriş saati (güneş atlanır).
 */
abstract class SaatEtiketiKomplikasyonu : GuvenliKomplikasyonServisi() {
    protected abstract val yalnizNamaz: Boolean

    /** Veri yokken SHORT_TEXT başlığı (kaynak dizgesi). */
    protected abstract val bekleyenBaslik: Int

    protected abstract fun etiket(a: ZamanCizelgesi.Aralik, dil: String): VakitSiniri.Etiket

    /** İkon: etiketin anlattığı vakit. */
    protected abstract fun ikonVakti(a: ZamanCizelgesi.Aralik): String

    override fun araliklar(tur: ComplicationType): List<Triple<Long, Long, ComplicationData?>> {
        val yuk = YukDeposu(this).yuk() ?: return emptyList()
        return ZamanCizelgesi.araliklar(yuk, System.currentTimeMillis(), yalnizNamaz = yalnizNamaz)
            .map { a -> Triple(a.baslangic, a.bitis, veri(tur, a)) }
    }

    override fun onizleme(type: ComplicationType): ComplicationData? {
        val simdi = System.currentTimeMillis()
        return veri(
            type,
            ZamanCizelgesi.Aralik(
                simdi,
                simdi + 72 * 60_000L,
                VakitHesabi.VakitAni("", "ikindi", simdi + 72 * 60_000L),
                VakitHesabi.VakitAni("", "ogle", simdi - 60 * 60_000L),
            ),
        )
    }

    /** Telefon henüz veri göndermediyse ya da çizelge tükendiyse: "—". */
    override fun varsayilan(tur: ComplicationType): ComplicationData? {
        val aciklama = duz(getString(R.string.komplikasyon_bekleniyor_aciklama))
        val ikon = KomplikasyonOrtak.monokrom(this, R.drawable.ic_vakit)
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(duz("—"), aciklama)
                    .setTitle(duz(getString(bekleyenBaslik))).setMonochromaticImage(ikon).setTapAction(dokunus).build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(duz(getString(R.string.komplikasyon_bekleniyor)), aciklama)
                    .setMonochromaticImage(ikon).setTapAction(dokunus).build()
            else -> null
        }
    }

    private fun veri(tur: ComplicationType, a: ZamanCizelgesi.Aralik): ComplicationData? {
        val e = etiket(a, dil)
        val aciklama = duz(e.aciklama)
        val ikon = KomplikasyonOrtak.monokrom(this, KomplikasyonOrtak.vakitIkonu(ikonVakti(a)))
        val dokunus = KomplikasyonOrtak.uygulamayiAc(this)
        return when (tur) {
            ComplicationType.SHORT_TEXT ->
                ShortTextComplicationData.Builder(duz(e.kisaMetin), aciklama)
                    .setTitle(duz(e.kisaBaslik)).setMonochromaticImage(ikon).setTapAction(dokunus).build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(duz(e.uzunMetin), aciklama)
                    .setMonochromaticImage(ikon).setTapAction(dokunus).build()
            else -> null
        }
    }
}

/** "Vakit çıkış saati": sayılan sınırın (kalan süre yuvasıyla AYNI an) saati. */
class VakitCikisSaatiKomplikasyonServisi : SaatEtiketiKomplikasyonu() {
    override val yalnizNamaz = false
    override val bekleyenBaslik = R.string.komplikasyon_cikis

    override fun etiket(a: ZamanCizelgesi.Aralik, dil: String) =
        VakitSiniri.cikisSaati(a.onceki?.vakit, a.siradaki.vakit, VakitHesabi.saat(a.siradaki.ms), dil)

    override fun ikonVakti(a: ZamanCizelgesi.Aralik) = VakitHesabi.sayilanAn(a.onceki, a.siradaki).vakit
}

/** "Sıradaki namaz": sıradaki namaz vaktinin adı ve giriş saati (güneş atlanır). */
class SiradakiNamazKomplikasyonServisi : SaatEtiketiKomplikasyonu() {
    override val yalnizNamaz = true
    override val bekleyenBaslik = R.string.komplikasyon_sirada

    override fun etiket(a: ZamanCizelgesi.Aralik, dil: String) =
        VakitSiniri.siradaki(a.siradaki.vakit, VakitHesabi.saat(a.siradaki.ms), dil)

    override fun ikonVakti(a: ZamanCizelgesi.Aralik) = a.siradaki.vakit
}
