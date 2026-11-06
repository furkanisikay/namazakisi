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

    /** Bir etiket grubunun ortak yazı boyu (sp) ve en çok satır sayısı. */
    data class Karar(val boy: Float, val satir: Int)

    /**
     * [enBuyukSiganBoy]'un satırlı hâli: önce TEK satırda [enBuyuk]'ten [enKucuk]'e; hiçbiri
     * sığmazsa 2..[enCokSatir] satırda yeniden büyükten küçüğe. [sigarMi] (boy, satır) taşma
     * olmadan sığıyor mu (ölçüm tarafı sözcük ortasından kırılmayı "sığmaz" saymalı). Hiçbiri
     * sığmazsa en küçük boy + en çok satır (kalan taşma üç noktayla kesilir, sessiz kırpma yok).
     *
     * Neden: kod ekranında Sil tuşu Malayalamcada "ഇല്ലാതാ" diye üç noktasız kırpılıyordu
     * (tek satır + varsayılan kırpma ilk satırı gösteriyordu).
     */
    fun enBuyukSiganKarar(
        enBuyuk: Float,
        enKucuk: Float,
        enCokSatir: Int = 1,
        adim: Float = 1f,
        sigarMi: (boy: Float, satir: Int) -> Boolean,
    ): Karar {
        require(adim > 0f && enKucuk <= enBuyuk && enCokSatir >= 1)
        for (satir in 1..enCokSatir) {
            var b = enBuyuk
            while (b >= enKucuk - 1e-4f) {
                if (sigarMi(b, satir)) return Karar(b, satir)
                b -= adim
            }
        }
        return Karar(enKucuk, enCokSatir)
    }

    /**
     * Satırdaki etiket ile düğme yan yana sığar mı (px, etiketin DOĞAL tek satır genişliği).
     * Sığmazsa düğme etiketin altına iner: etiket önceliklidir (üyeler kartında "Az önce"
     * Malayalamcada düğmenin yanında "ഇ…" diye tek harfe iniyordu).
     */
    fun yanYanaSigar(etiket: Int, dugme: Int, genislik: Int): Boolean = etiket + dugme <= genislik
}
