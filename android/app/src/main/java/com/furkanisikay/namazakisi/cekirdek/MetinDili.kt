package com.furkanisikay.namazakisi.cekirdek

/**
 * Saf karar sınıflarının metin dili — SAF (Android import ETMEZ).
 *
 * `cekirdek/` metin üreten her fonksiyon SON parametre olarak `dil: String = MetinDili.TR`
 * alır; Android katmanı `Context.arayuzDili()` verir. Metinler Android kaynağından DEĞİL,
 * sınıf içi küçük tablolardan gelir (karar: JVM testinde Android bağlamı yok, fikstür
 * testleri Türkçe çıktıyı BAYT BAYT kilitler). Android katmanının kendi metinleri
 * (`res/values` ve `res/values-en` altındaki `strings.xml`) ayrıdır.
 *
 * Yeni dil: buraya kod + her tabloya bir sütun (Android kaynakları ise yalnız `values-xx`).
 * Tanınmayan kod Türkçeye düşer (uygulama hiç açılmamışkenki varsayılanla aynı).
 */
object MetinDili {
    const val TR = "tr"
    const val EN = "en"

    /** "en", "en-US", "en_GB" → "en"; geri kalan her şey → "tr". */
    fun coz(kod: String?): String {
        val kok = kod?.trim()?.substringBefore('-')?.substringBefore('_')
        return if (kok == EN) EN else TR
    }

    /** Dile göre metin seçer — tablolar bunu kullanır (tr/en kopyala-yapıştır dalı yazılmaz). */
    fun sec(dil: String, tr: String, en: String): String = if (coz(dil) == EN) en else tr
}
