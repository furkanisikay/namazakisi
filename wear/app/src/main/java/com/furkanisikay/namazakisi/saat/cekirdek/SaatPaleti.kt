package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Saatin TEK renk kaynağı (yeniden tasarım W1) — SAF (android.* import ETMEZ).
 *
 * Uygulama ekranları (`ui/SaatTemasi`), tile'lar ve "son dakikalar" bildirimi rengi
 * yalnız buradan okur; eskiden uygulama Material'in varsayılan lila tonunda, tile'lar
 * sabit kodlu yeşil/amber ile çiziliyordu ("dört farklı dil").
 *
 * Kurallar (AGENTS.md "token ≠ en yakın renk" dersi):
 *  - Zemin saf siyah (OLED'de piksel kapalı).
 *  - Vakit tonları YALNIZ yay, vakit adı ve şu anki satırın şeridinde; metin olarak
 *    kullanıldıkları için siyaha karşı ≥ 7:1 (`SaatPaletiTest` ölçer).
 *  - Eylem ve "kılındı" telefonun koyu tema yeşili; üstündeki yazı [EYLEM_USTU].
 *  - Kerahat sarısı yalnız BANT (dekoratif); kerahat UYARI metni de ≥ 7:1 tutar.
 *
 * Değerler ARGB `Long`; Compose `Color(Long)`, protolayout `argb(Int)` ile okur.
 */
object SaatPaleti {
    const val ZEMIN = 0xFF000000L
    const val YUZEY = 0xFF111813L
    const val YUZEY2 = 0xFF1B241DL
    const val METIN = 0xFFF2F5F2L
    const val METIN2 = 0xFFA9B5ACL

    /** Yayın sönük izi ve gelecek dilimler (dekoratif) */
    const val IZ = 0xFF1E2A21L

    /** Eylem ve "kılındı" — telefonun koyu tema yeşili */
    const val EYLEM = 0xFF66BB6AL

    /** Eylem yeşili üstündeki yazı */
    const val EYLEM_USTU = 0xFF06210AL

    /** Vaktin son [ACIL_ESIK_DK] dakikası (muhafızın acil tonuyla aynı eşik) */
    const val ACIL = 0xFFFF7A6BL

    /** Kerahat bandı ve kerahat uyarı satırı */
    const val KERAHAT = 0xFFFFCA28L

    // Ambient: renk yok, yalnız beyaz/gri tonları (düşük güç).
    const val AMBIENT_METIN = 0xFFE8E8E8L
    const val AMBIENT_IKINCIL = 0xFFBDBDBDL
    const val AMBIENT_IZ = 0xFF3A3A3AL

    /**
     * "Son dakikalar" eşiği (dk). Telefondaki `ACIL_TON_UST_DK` (src/core/muhafiz/motorAdaptoru.ts)
     * ile AYNI olmalı — jest nöbetçisi `saatSabitleri.test.ts` bu satırı okur.
     */
    const val ACIL_ESIK_DK = 15

    private val VAKIT_RENKLERI = mapOf(
        "imsak" to 0xFF9FA8FFL,
        "gunes" to 0xFFFFCC80L,
        "ogle" to 0xFFFFE07AL,
        "ikindi" to 0xFFFFB37AL,
        "aksam" to 0xFFFF9E9EL,
        "yatsi" to 0xFFC3AEFFL,
    )

    /** Vaktin tonu; bilinmeyen vakit metin rengine düşer. */
    fun vakitRengi(vakit: String?): Long = VAKIT_RENKLERI[vakit] ?: METIN

    val vakitRenkleri: Map<String, Long> get() = VAKIT_RENKLERI

    /** protolayout `argb(Int)` için. */
    fun int(renk: Long): Int = renk.toInt()

    /** WCAG bağıl parlaklık (sRGB). */
    fun bagilParlaklik(renk: Long): Double {
        fun kanal(c: Long): Double {
            val v = c / 255.0
            return if (v <= 0.04045) v / 12.92 else Math.pow((v + 0.055) / 1.055, 2.4)
        }
        val r = kanal((renk shr 16) and 0xFF)
        val g = kanal((renk shr 8) and 0xFF)
        val b = kanal(renk and 0xFF)
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    /** WCAG kontrast oranı (1..21). */
    fun kontrast(a: Long, b: Long): Double {
        val la = bagilParlaklik(a)
        val lb = bagilParlaklik(b)
        return (maxOf(la, lb) + 0.05) / (minOf(la, lb) + 0.05)
    }
}
