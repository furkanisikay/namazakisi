package com.furkanisikay.namazakisi.cekirdek

/**
 * Saf karar sınıflarının metin dili — SAF (Android import ETMEZ).
 *
 * `cekirdek/` metin üreten her fonksiyon SON parametre olarak `dil: String = MetinDili.TR`
 * alır; Android katmanı `Context.arayuzDili()` verir. Metinler Android kaynağından DEĞİL,
 * dil başına bir bloktan ([CekirdekMetinleri], `CekirdekMetinleri.kt`) gelir (karar: JVM
 * testinde Android bağlamı yok, fikstür testleri Türkçe çıktıyı BAYT BAYT kilitler).
 * Android katmanının kendi metinleri (`res/values`, `res/values-xx` altındaki
 * `strings.xml`) ayrıdır.
 *
 * Yeni dil: [DESTEKLENENLER]'e kod + `CekirdekMetinleri.kt`'ye blok + [metinler] eşlemesi
 * (Android kaynakları ise `values-xx`). Tanınmayan kod Türkçeye düşer (uygulama hiç
 * açılmamışkenki varsayılanla aynı).
 */
object MetinDili {
    const val TR = "tr"
    const val EN = "en"

    /** Sıra tablo düzeniyle aynı (tr, en, id, de, fr, bs, ru, ms, ar, ur). */
    val DESTEKLENENLER = listOf(TR, EN, "id", "de", "fr", "bs", "ru", "ms", "ar", "ur")

    /**
     * "en", "en-US", "de_DE" → kök kod; desteklenmeyen ya da boş → "tr". Java/Android eski
     * Endonezce kodu "in" (`java.util.Locale` "id"yi "in"e çevirir) "id" sayılır.
     */
    fun coz(kod: String?): String {
        val kok = kod?.trim()?.substringBefore('-')?.substringBefore('_')
        val normal = if (kok == "in") "id" else kok
        return if (normal != null && normal in DESTEKLENENLER) normal else TR
    }

    /** Dilin metin bloğu (bilinmeyen → Türkçe). */
    fun metinler(dil: String?): CekirdekMetinleri = when (coz(dil)) {
        EN -> CEKIRDEK_EN
        "id" -> CEKIRDEK_ID
        "de" -> CEKIRDEK_DE
        "fr" -> CEKIRDEK_FR
        "bs" -> CEKIRDEK_BS
        "ru" -> CEKIRDEK_RU
        "ms" -> CEKIRDEK_MS
        "ar" -> CEKIRDEK_AR
        "ur" -> CEKIRDEK_UR
        else -> CEKIRDEK_TR
    }

    private val YER_TUTUCU = Regex("""\{(\w+)\}""")

    /**
     * `{anahtar}` yer tutucularını TEK geçişte doldurur (değer başka bir yer tutucu taşısa da
     * — ör. kullanıcının verdiği vakit adı — yeniden işlenmez). Bilinmeyen yer tutucu kalır.
     */
    fun bicim(sablon: String, vararg degerler: Pair<String, String>): String {
        if (degerler.isEmpty()) return sablon
        val harita = degerler.toMap()
        return YER_TUTUCU.replace(sablon) { m -> harita[m.groupValues[1]] ?: m.value }
    }
}
