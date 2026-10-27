package com.furkanisikay.namazakisi.saat.tile

import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.TypeBuilders
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicFloat
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicInstant
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicInt32
import androidx.wear.protolayout.expression.DynamicBuilders.DynamicString
import com.furkanisikay.namazakisi.saat.cekirdek.SaatPaleti
import com.furkanisikay.namazakisi.saat.cekirdek.rakamlariYerellestir
import com.furkanisikay.namazakisi.saat.cekirdek.saatDili
import java.time.Instant

/**
 * Tile'ların ortak çizim yardımcıları (yeniden tasarım W1).
 *
 * KALAN SÜRE GİRDİLER ARASINDA DONMAZ: zaman çizelgesi girdileri yalnız vakit
 * sınırlarındadır (alarm/girdi bütçesi değişmez); dakikalık kalan süre protolayout'un
 * dinamik zaman ifadesiyle ÇİZİCİDE hesaplanır (şema 1.2, protolayout 1.4.2'de
 * doğrulandı). Eski çizici yalnız STATİK değeri okur → statik yedek asla bayatlamayan
 * bir metin olmalı (ör. "çıkış 15:56"), "1 sa 58 dk" gibi bir an değeri DEĞİL.
 *
 * RAKAM: tile'ın her statik metni ve dinamik metnin sabit parçaları ZORUNLU `sifir`
 * parametresiyle cihaz yerel ayarının rakamına çevrilir (`cekirdek/Rakam.kt`; servis
 * `yerelSifirRakami()` geçer). `DynamicInt32.format()` rakamı çizicide zaten yerel ayarla
 * yazar → ar-SA'da "٧ س ١٨ د" ile statik "تنتهي ١٥:٥٦" aynı rakamla çizilir.
 */
object TileOrtak {
    /** Dinamik metnin kaplayabileceği en geniş kalıp — yer ayrılır, metin titremez/kırpılmaz. */
    const val KALAN_KALIBI = "23 sa 59 dk sonra"

    /**
     * [kalip] dilindeki en geniş kalıp: "23 sa 59 dk sonra" / "in 23 h 59 min". [kalip]
     * `%1$s` yer tutuculu kaynak dizgesidir ("%1$s sonra" / "in %1$s"); yoksa yalnız süre.
     */
    fun kalanKalibi(dil: String, kalip: String = YER_TUTUCU): String {
        val d = saatDili(dil)
        return kalip.replace(YER_TUTUCU, "23 ${d.birimSa} 59 ${d.birimDk}")
    }

    /**
     * Kalıp dizgesindeki yer tutucu. Ham kalıp `getString(R.string.tile_sonra, YER_TUTUCU)` ile
     * alınır (biçimlendirme yer tutucuyu kendisiyle değiştirir; lint argüman sayısını doğrular).
     */
    const val YER_TUTUCU = "%1\$s"

    private fun sabit(s: String): DynamicString = DynamicString.constant(s)

    /** Şu andan [hedefMs]'ye kalan tam dakika (aşağı yuvarlanır; `VakitHesabi.kalanMetni` ile aynı). */
    private fun kalanDakika(hedefMs: Long): DynamicInt32 =
        DynamicInstant.platformTimeWithSecondsPrecision()
            .durationUntil(DynamicInstant.withSecondsPrecision(Instant.ofEpochMilli(hedefMs)))
            .toIntMinutes()

    /**
     * "1 sa 58 dk" / "2 sa" / "12 dk" / "1 dk'dan az" — `VakitHesabi.kalanMetni` kuralının
     * ÇİZİCİDEKİ ikizi; birimler [dil]den (`SaatDili`). [kalip] `%1$s` yer tutuculu kaynak
     * dizgesidir ("%1$s sonra" / "in %1$s"): yer tutucunun önü ve arkası sabit eklenir.
     */
    fun kalanMetni(
        hedefMs: Long,
        statikYedek: String,
        dil: String,
        kalip: String = YER_TUTUCU,
        sifir: Char,
    ): TypeBuilders.StringProp {
        val d = saatDili(dil)
        val i = kalip.indexOf(YER_TUTUCU)
        val onEk = if (i >= 0) kalip.substring(0, i) else ""
        val sonEk = if (i >= 0) kalip.substring(i + YER_TUTUCU.length) else ""
        // Sabit parçalar ("1 dk'dan az" rakam taşır) yerel rakamla; `format()` çizicide yerelleşir.
        fun yerel(s: String) = sabit(rakamlariYerellestir(s, sifir))
        val dk = kalanDakika(hedefMs)
        val sa = dk.div(60)
        val kalanDk = dk.rem(60)
        val saatli = DynamicString.onCondition(kalanDk.eq(0))
            .use(sa.format().concat(yerel(" ${d.birimSa}")))
            .elseUse(sa.format().concat(yerel(" ${d.birimSa} ")).concat(kalanDk.format()).concat(yerel(" ${d.birimDk}")))
        val dakikali = DynamicString.onCondition(dk.gt(0))
            .use(dk.format().concat(yerel(" ${d.birimDk}")))
            .elseUse(yerel(d.birDakikadanAzKisa))
        val metin = yerel(onEk).concat(DynamicString.onCondition(sa.gt(0)).use(saatli).elseUse(dakikali)).concat(yerel(sonEk))
        return TypeBuilders.StringProp.Builder(rakamlariYerellestir(statikYedek, sifir)).setDynamicValue(metin).build()
    }

    /**
     * Yayın kalan kısmı (derece): [tamDerece] × kalan / toplam, çizicide her saniye.
     * Statik yedek: girdinin başındaki oran.
     */
    fun kalanDerece(hedefMs: Long, toplamMs: Long, tamDerece: Float): DynamicFloat {
        val toplamSn = (toplamMs / 1000f).coerceAtLeast(1f)
        return DynamicInstant.platformTimeWithSecondsPrecision()
            .durationUntil(DynamicInstant.withSecondsPrecision(Instant.ofEpochMilli(hedefMs)))
            .toIntSeconds()
            .asFloat()
            .div(toplamSn)
            .times(tamDerece)
    }

    fun renk(argbDegeri: Long) = argb(SaatPaleti.int(argbDegeri))

    fun yaziStili(boyut: Float, renk: Long, kalin: Boolean): LayoutElementBuilders.FontStyle =
        LayoutElementBuilders.FontStyle.Builder()
            .setSize(sp(boyut))
            .setColor(renk(renk))
            .setWeight(if (kalin) LayoutElementBuilders.FONT_WEIGHT_BOLD else LayoutElementBuilders.FONT_WEIGHT_NORMAL)
            .build()

    /** Statik metin; rakamları [sifir]'ın dizisiyle (cihaz yerel ayarı) çizilir. */
    fun metin(yazi: String, boyut: Float, renk: Long, kalin: Boolean = false, sifir: Char): LayoutElementBuilders.Text =
        LayoutElementBuilders.Text.Builder()
            .setText(rakamlariYerellestir(yazi, sifir))
            .setMaxLines(1)
            .setFontStyle(yaziStili(boyut, renk, kalin))
            .build()

    /**
     * Dinamik metin: en geniş kalıp ([kalip], dilde) yer ayırır (aksi halde çizici metni kırpar).
     * Kalıp da yerel rakamla ölçülür (çizilecek rakamın genişliği).
     */
    fun dinamikMetin(
        prop: TypeBuilders.StringProp,
        boyut: Float,
        renk: Long,
        kalin: Boolean = false,
        kalip: String = KALAN_KALIBI,
        sifir: Char,
    ): LayoutElementBuilders.Text =
        LayoutElementBuilders.Text.Builder()
            .setText(prop)
            .setLayoutConstraintsForDynamicText(TypeBuilders.StringLayoutConstraint.Builder(rakamlariYerellestir(kalip, sifir)).build())
            .setMaxLines(1)
            .setFontStyle(yaziStili(boyut, renk, kalin))
            .build()
}
