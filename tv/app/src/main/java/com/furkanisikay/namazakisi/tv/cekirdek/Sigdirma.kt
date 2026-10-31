package com.furkanisikay.namazakisi.tv.cekirdek

/**
 * Uzun dile dayanıklı yerleşimin saf kuralları (ölçüm yapan taraf `ui/Sigdirma.kt`). SAF.
 *
 * TV'de Compose `Column` taşmaz: içerik yüksekliği aşınca SON çocuklar 0 yükseklikle ölçülür
 * (Tamilce/Malayalamca onay penceresinde düğmeler metinsiz boş çubuk olarak çiziliyordu).
 * Kural: esneyen blok METİNDİR, düğme değil — metin bloğu kalan yüksekliğe sığana dek
 * yazı ölçeğiyle küçülür ([YAZI_OLCEKLERI]), düğmeler tam boyda kalır.
 */
object Sigdirma {
    /** Metin bloğunun denenecek yazı ölçekleri (büyükten küçüğe); 0,6 altı 3 m'den okunmaz. */
    val YAZI_OLCEKLERI = listOf(1f, 0.92f, 0.85f, 0.78f, 0.72f, 0.66f, 0.6f)

    /** [enKucuk]'ten küçük olmayan ölçekler (en az bir öğe döner: en küçüğü). */
    fun olcekler(enKucuk: Float): List<Float> =
        YAZI_OLCEKLERI.filter { it >= enKucuk - 1e-4f }.ifEmpty { listOf(YAZI_OLCEKLERI.last()) }

    /**
     * [sigarMi]'nın doğru döndüğü en büyük boy: [enBuyuk]'ten [enKucuk]'e [adim] adımla iner.
     * Hiçbiri sığmazsa [enKucuk]. Bir grup etikete ORTAK boy için kullanılır ("Sil" ve "Geri"
     * tuşları: her biri ayrı küçülünce uzun dilde biri ötekinden belirgin küçük kalıyordu).
     */
    fun enBuyukSiganBoy(enBuyuk: Float, enKucuk: Float, adim: Float = 1f, sigarMi: (Float) -> Boolean): Float {
        require(adim > 0f && enKucuk <= enBuyuk)
        var b = enBuyuk
        while (b > enKucuk) {
            if (sigarMi(b)) return b
            b -= adim
        }
        return enKucuk
    }
}
