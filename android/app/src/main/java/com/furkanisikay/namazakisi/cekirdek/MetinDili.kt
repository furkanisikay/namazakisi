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

    /** Sıra tablo düzeniyle aynı (tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo, zh, ta, ml, th, ko, vi, pt, it, sv, uk, ro, hr, sr, el, ku, tk, tt, sd, pl, ja, gu, bg, mk). */
    val DESTEKLENENLER = listOf(TR, EN, "id", "de", "fr", "bs", "ru", "ms", "ar", "ur", "es", "nl", "sq", "hi", "bn", "fa", "ps", "ckb", "ug", "az", "uz", "kk", "ky", "tg", "sw", "ha", "am", "om", "so", "ff", "yo", "zh", "ta", "ml", "th", "ko", "vi", "pt", "it", "sv", "uk", "ro", "hr", "sr", "el", "ku", "tk", "tt", "sd", "pl", "ja", "gu", "bg", "mk")

    /**
     * "en", "en-US", "de_DE" → kök kod; desteklenmeyen ya da boş → "tr". Java/Android eski
     * Endonezce kodu "in" (`java.util.Locale` "id"yi "in"e çevirir) "id" sayılır; Kurmancînin ISO 639-3
     * kodu "kmr" uygulamanın Kurmancî kodu "ku" sayılır (Arap harfli "ku-Arab" cihaz da "ku": yalnız Latin).
     */
    fun coz(kod: String?): String {
        val kok = kod?.trim()?.substringBefore('-')?.substringBefore('_')
        val normal = when (kok) {
            "in" -> "id"
            "kmr" -> "ku"
            else -> kok
        }
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
        "es" -> CEKIRDEK_ES
        "nl" -> CEKIRDEK_NL
        "sq" -> CEKIRDEK_SQ
        "hi" -> CEKIRDEK_HI
        "bn" -> CEKIRDEK_BN
        "fa" -> CEKIRDEK_FA
        "ps" -> CEKIRDEK_PS
        "ckb" -> CEKIRDEK_CKB
        "ug" -> CEKIRDEK_UG
        "az" -> CEKIRDEK_AZ
        "uz" -> CEKIRDEK_UZ
        "kk" -> CEKIRDEK_KK
        "ky" -> CEKIRDEK_KY
        "tg" -> CEKIRDEK_TG
        "sw" -> CEKIRDEK_SW
        "ha" -> CEKIRDEK_HA
        "am" -> CEKIRDEK_AM
        "om" -> CEKIRDEK_OM
        "so" -> CEKIRDEK_SO
        "ff" -> CEKIRDEK_FF
        "yo" -> CEKIRDEK_YO
        "zh" -> CEKIRDEK_ZH
        "ta" -> CEKIRDEK_TA
        "ml" -> CEKIRDEK_ML
        "th" -> CEKIRDEK_TH
        "ko" -> CEKIRDEK_KO
        "vi" -> CEKIRDEK_VI
        "pt" -> CEKIRDEK_PT
        "it" -> CEKIRDEK_IT
        "sv" -> CEKIRDEK_SV
        "uk" -> CEKIRDEK_UK
        "ro" -> CEKIRDEK_RO
        "hr" -> CEKIRDEK_HR
        "sr" -> CEKIRDEK_SR
        "el" -> CEKIRDEK_EL
        "ku" -> CEKIRDEK_KU
        "tk" -> CEKIRDEK_TK
        "tt" -> CEKIRDEK_TT
        "sd" -> CEKIRDEK_SD
        "pl" -> CEKIRDEK_PL
        "ja" -> CEKIRDEK_JA
        "gu" -> CEKIRDEK_GU
        "bg" -> CEKIRDEK_BG
        "mk" -> CEKIRDEK_MK
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
