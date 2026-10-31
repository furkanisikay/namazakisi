package com.furkanisikay.namazakisi.saat.cekirdek

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * Saat ekranında uzun dile dayanıklı yerleşimin saf kuralları (ölçüm yapan taraf
 * `ui/VakitYayi.kt`, `ui/TesbihatEkrani.kt`). SAF, JVM testli.
 */
object Sigdirma {
    /** Metnin sığdırma kararı: yazı boyu (sp) ve satır sayısı. */
    data class Karar(val boy: Float, val satir: Int)

    /**
     * Önce TEK satır [enFazla]'dan [tekSatirTabani]'na [adim] adımla; sığmazsa 2..[enCokSatir]
     * satırda [enFazla]'dan [enAz]'a. [sigar] (boy, satır) o yerleşimin taşmadan sığıp
     * sığmadığını söyler (ölçüm tarafı; sözcük ortasından kırılmayı da "sığmaz" saymalı).
     * Hiçbiri sığmazsa en küçük boy + en çok satır (kalan taşma üç noktayla kesilir).
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
        var b = enFazla
        while (b >= tekTaban - 1e-4f) {
            if (sigar(b, 1)) return Karar(b, 1)
            b -= adim
        }
        for (satir in 2..enCokSatir) {
            b = enFazla
            while (b >= enAz - 1e-4f) {
                if (sigar(b, satir)) return Karar(b, satir)
                b -= adim
            }
        }
        return Karar(if (enCokSatir == 1) tekTaban else enAz, enCokSatir)
    }

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
