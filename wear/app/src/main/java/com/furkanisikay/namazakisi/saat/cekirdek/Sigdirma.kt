package com.furkanisikay.namazakisi.saat.cekirdek

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

/**
 * Saat ekranında uzun dile dayanıklı yerleşimin saf kuralları (ölçüm yapan taraf
 * `ui/VakitYayi.kt`, `ui/TesbihatEkrani.kt`). SAF, JVM testli.
 */
object Sigdirma {
    /**
     * Metnin sığdırma kararı: yazı boyu (sp) ve satır sayısı. [sigdi] false = hiçbir deneme
     * sığmadı, metin üç noktayla kesilecek (yerleşimi değiştirmek için işaret: `TesbihatEkrani`).
     */
    data class Karar(val boy: Float, val satir: Int, val sigdi: Boolean = true)

    /**
     * Önce TEK satır [enFazla]'dan [tekSatirTabani]'na [adim] adımla; sığmazsa 2..[enCokSatir]
     * satırda [enFazla]'dan [enAz]'a. [sigar] (boy, satır) o yerleşimin taşmadan sığıp
     * sığmadığını söyler (ölçüm tarafı; sözcük ortasından kırılmayı da "sığmaz" saymalı).
     * Hiçbiri sığmazsa en küçük boy + en çok satır, `sigdi = false` (kalan taşma üç noktayla
     * kesilir).
     *
     * Neden: tek satırda 0,6× tabana inip yine "…" basan dua ("அல்லாஹ் ஏற்றுக்கொள்வா…")
     * KESİLMEMELİ; iki satıra okunur boyda sarılmak, tek satırda okunmaz küçülmekten iyidir.
     */
    fun karar(
        enFazla: Float,
        enAz: Float,
        enCokSatir: Int = 1,
        tekSatirTabani: Float = enAz,
        adim: Float = 0.5f,
        sigar: (boy: Float, satir: Int) -> Boolean,
    ): Karar {
        require(adim > 0f && enAz <= enFazla && enCokSatir >= 1)
        val tekTaban = if (enCokSatir == 1) enAz else max(enAz, min(tekSatirTabani, enFazla))
        for (b in boylar(enFazla, tekTaban, adim)) {
            if (sigar(b, 1)) return Karar(b, 1)
        }
        for (satir in 2..enCokSatir) {
            for (b in boylar(enFazla, enAz, adim)) {
                if (sigar(b, satir)) return Karar(b, satir)
            }
        }
        return Karar(if (enCokSatir == 1) tekTaban else enAz, enCokSatir, sigdi = false)
    }

    /**
     * [ust]'ten [adim] adımla inen boylar; taban adım ızgarasına düşmüyorsa EN SON tabanın
     * kendisi de denenir (yoksa tabanda sığan metin "sığmadı" sayılırdı).
     */
    private fun boylar(ust: Float, taban: Float, adim: Float): Sequence<Float> = sequence {
        var b = ust
        while (b >= taban - 1e-4f) {
            yield(b)
            b -= adim
        }
        if (b + adim > taban + 1e-4f) yield(taban)
    }

    /**
     * Büyük rakam satırının (tesbihat sayacı) yazı tipindeki boş üst ve alt payından kırpılacak
     * px: rakamın üstünde ~0,22 em (çıkıntı payı), altında ~0,24 em (iniş payı) boşluk vardır.
     * Kırpınca sütun kısalır ve ortalanmış blokta tepedeki zikir adı aşağı, halkanın geniş
     * kirişine iner (kare saatte Tamilce/Malayalamca ad en küçük boyda da sığmıyordu). Kırpma
     * payın altında kalır: rakam ile ad arasında boşluk korunur, vuruş büyümesi (1,12×) çakışmaz.
     */
    fun rakamKirpmasi(rakamBoyuPx: Float): Pair<Int, Int> =
        (rakamBoyuPx * RAKAM_UST_KIRPMA).roundToInt() to (rakamBoyuPx * RAKAM_ALT_KIRPMA).roundToInt()

    const val RAKAM_UST_KIRPMA = 0.10f
    const val RAKAM_ALT_KIRPMA = 0.18f

    /**
     * Ortalanmış halkanın İÇ kenarı (px): `vakitYayiCiz` ve tesbihat halkası aynı geometriyi
     * kullanır — yay `kenarPay + 2,2·kalınlık` içeriden çizilir; iç kenar = yarıçap − kalınlık/2.
     */
    fun halkaIcYaricapi(enKisaKenar: Float, kalinlik: Float, kenarPay: Float): Float {
        val cap = enKisaKenar - (kenarPay + kalinlik * 2.2f) * 2
        return max(0f, cap / 2 - kalinlik / 2)
    }

    /** Yarıçapı [r] olan dairenin merkezden [dy] uzaktaki kirişi; dy ≥ r ise 0. */
    fun kiris(r: Float, dy: Float): Float {
        val d = abs(dy)
        if (d >= r) return 0f
        return 2f * sqrt(r * r - d * d)
    }

    /**
     * Dikeyde [ust]..[alt] aralığını kaplayan yatay bir metnin halkaya DEĞMEDEN alabileceği
     * en geniş genişlik (her yandan [pay] düşülmüş). En dar nokta merkezden en uzak kenardır.
     * Kare saatte de halka dairedir; zikir adı gibi sütunun TEPESİNDEKİ satır, sütuna sığsa da
     * daralan kirişe değiyordu — göz kararı oran (0,82 / 0,48) yerine konumdan hesaplanır.
     */
    fun guvenliGenislik(r: Float, merkezY: Float, ust: Float, alt: Float, pay: Float): Float {
        val dy = max(abs(ust - merkezY), abs(alt - merkezY))
        return max(0f, kiris(r, dy) - 2f * pay)
    }

    /** İçerik [icerik] px, sınır [sinir] px: sığdırma ölçeği (≤ 1). */
    fun genislikOlcegi(icerik: Int, sinir: Int): Float =
        if (icerik <= 0 || icerik <= sinir) 1f else sinir.toFloat() / icerik
}
