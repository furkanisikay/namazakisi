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
import java.time.Instant

/**
 * Tile'ların ortak çizim yardımcıları (yeniden tasarım W1).
 *
 * KALAN SÜRE GİRDİLER ARASINDA DONMAZ: zaman çizelgesi girdileri yalnız vakit
 * sınırlarındadır (alarm/girdi bütçesi değişmez); dakikalık kalan süre protolayout'un
 * dinamik zaman ifadesiyle ÇİZİCİDE hesaplanır (şema 1.2, protolayout 1.4.2'de
 * doğrulandı). Eski çizici yalnız STATİK değeri okur → statik yedek asla bayatlamayan
 * bir metin olmalı (ör. "çıkış 15:56"), "1 sa 58 dk" gibi bir an değeri DEĞİL.
 */
object TileOrtak {
    /** Dinamik metnin kaplayabileceği en geniş kalıp — yer ayrılır, metin titremez/kırpılmaz. */
    const val KALAN_KALIBI = "23 sa 59 dk sonra"

    private fun sabit(s: String): DynamicString = DynamicString.constant(s)

    /** Şu andan [hedefMs]'ye kalan tam dakika (aşağı yuvarlanır; `VakitHesabi.kalanMetni` ile aynı). */
    private fun kalanDakika(hedefMs: Long): DynamicInt32 =
        DynamicInstant.platformTimeWithSecondsPrecision()
            .durationUntil(DynamicInstant.withSecondsPrecision(Instant.ofEpochMilli(hedefMs)))
            .toIntMinutes()

    /**
     * "1 sa 58 dk" / "2 sa" / "12 dk" / "1 dk'dan az" + [sonEk] — `VakitHesabi.kalanMetni`
     * kuralının ÇİZİCİDEKİ ikizi.
     */
    fun kalanMetni(hedefMs: Long, sonEk: String, statikYedek: String): TypeBuilders.StringProp {
        val dk = kalanDakika(hedefMs)
        val sa = dk.div(60)
        val kalanDk = dk.rem(60)
        val saatli = DynamicString.onCondition(kalanDk.eq(0))
            .use(sa.format().concat(sabit(" sa")))
            .elseUse(sa.format().concat(sabit(" sa ")).concat(kalanDk.format()).concat(sabit(" dk")))
        val dakikali = DynamicString.onCondition(dk.gt(0))
            .use(dk.format().concat(sabit(" dk")))
            .elseUse(sabit("1 dk'dan az"))
        val metin = DynamicString.onCondition(sa.gt(0)).use(saatli).elseUse(dakikali).concat(sabit(sonEk))
        return TypeBuilders.StringProp.Builder(statikYedek).setDynamicValue(metin).build()
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

    fun metin(yazi: String, boyut: Float, renk: Long, kalin: Boolean = false): LayoutElementBuilders.Text =
        LayoutElementBuilders.Text.Builder()
            .setText(yazi)
            .setMaxLines(1)
            .setFontStyle(yaziStili(boyut, renk, kalin))
            .build()

    /** Dinamik metin: en geniş kalıp yer ayırır (aksi halde çizici metni kırpar). */
    fun dinamikMetin(prop: TypeBuilders.StringProp, boyut: Float, renk: Long, kalin: Boolean = false): LayoutElementBuilders.Text =
        LayoutElementBuilders.Text.Builder()
            .setText(prop)
            .setLayoutConstraintsForDynamicText(TypeBuilders.StringLayoutConstraint.Builder(KALAN_KALIBI).build())
            .setMaxLines(1)
            .setFontStyle(yaziStili(boyut, renk, kalin))
            .build()
}
