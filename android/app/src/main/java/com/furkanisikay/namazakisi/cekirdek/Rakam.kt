package com.furkanisikay.namazakisi.cekirdek

/*
 * Rakam sistemi — telefonun native yüzeylerinde (widget, hızlı ayar kutusu, bildirim, alarm
 * ekranı) kullanıcının uygulamada SEÇTİĞİ rakamlar. SAF (Android import ETMEZ).
 *
 * Seçimi JS çözer (`core/dil/rakam.ts > rakamSistemiCoz`: açık seçim → ülke → dil) ve
 * ÇÖZÜLMÜŞ değeri yazar: `namazakisi_dil/rakam_sistemi` = yerel rakamın CLDR adı ("arab" Doğu
 * Arap, "beng" Bengalce) ya da anahtar yok (Batı). Native taraf kaydı YALNIZ arayüz dilinin
 * kendi yerel sistemiyle eşleşirse uygular ([YEREL]: Arapçada "arab", Bengalcede "beng"); diğer
 * her durumda (Türkçe dahil, dil değişimiyle yazım yarışında da) çıktı BİREBİR aynı kalır.
 *
 * Kural (Wear `saat/cekirdek/Rakam.kt` deseni): çekirdek metni Batı rakamıyla ÜRETİR (testler,
 * fikstürler, sesli okuma, veri aynı kalır); dönüşüm yalnız ÇİZİM KENARINDA bu yardımcıyla
 * yapılır. Kaynak dizgesindeki `%d` ve tarih biçimleyicileri ise yerel ayardan biçimlenir →
 * yerel rakamlı dilde yerel ayar `-u-nu-<sistem>` uzantısıyla kurulur ([yerelEtiketi]); ikisi
 * aynı seçimi izlediği için rakamlar karışmaz. Sistemin kendi çizdiği sayılar (widget/bildirim
 * `Chronometer`) başlatıcının/SystemUI'nin sürecinde CİHAZ yerel ayarıyla çizilir — buradan
 * zorlanamaz.
 *
 * İKİZ: `modules/expo-countdown-notification/.../cekirdek/Rakam.kt` (modül uygulama
 * sınıflarını göremez). Biri değişirse ikisini birlikte değiştir. Eşlemenin JS ikizi
 * `core/dil/rakam.ts > YEREL_RAKAMLAR`, iOS ikizi `VakitKarari.swift > RakamSistemi`.
 */
object Rakam {
    const val ARAB = "arab"
    const val BENG = "beng"
    const val LATN = "latn"

    /** Doğu Arap (Arapça-Hint) sıfırı, U+0660. */
    const val DOGU_SIFIR = '٠'

    /** Bengalce sıfır, U+09E6. */
    const val BENG_SIFIR = '০'

    /** Dil kökü → yerel rakam sistemi (TEK eşleme; listede olmayan dil Batı rakamı yazar). */
    private val YEREL = mapOf("ar" to ARAB, "bn" to BENG)

    /** Yerel sistem → sıfır rakamı (dizi Unicode'da ardışık). */
    private val SIFIRLAR = mapOf(ARAB to DOGU_SIFIR, BENG to BENG_SIFIR)

    /** "ar", "ar-SA", "bn_BD" → "ar" / "bn"; null → "". */
    private fun kok(dil: String?): String = dil?.trim()?.substringBefore('-')?.substringBefore('_').orEmpty()

    /** Dilin yerel rakam sistemi ("arab", "beng") ya da null (yalnız Batı rakamı). */
    fun yerelSistem(dil: String?): String? = YEREL[kok(dil)]

    /** Arayüz dilinin yerel rakamı (dolayısıyla rakam seçimi) var mı? (Arapça, Bengalce) */
    fun yerelRakamli(dil: String?): Boolean = yerelSistem(dil) != null

    /**
     * Etkin rakam sistemi: kayıt arayüz dilinin KENDİ yerel sistemiyse o ("ar" + "arab",
     * "bn" + "beng"); kayıt yok, "latn", bozuk, başka dilin sistemi ya da dil yerel rakamsızsa
     * [LATN].
     */
    fun sistem(dil: String?, kayitli: String?): String {
        val yerel = yerelSistem(dil) ?: return LATN
        return if (kayitli?.trim() == yerel) yerel else LATN
    }

    /** Sistemin sıfır rakamı ([rakamlariYerellestir]'e verilir): yerel → '٠'/'০', Batı → '0'. */
    fun sifir(sistem: String): Char = SIFIRLAR[sistem] ?: '0'

    fun sifir(dil: String?, kayitli: String?): Char = sifir(sistem(dil, kayitli))

    /**
     * Kaynak bağlamının (`dildeBaglam`) ve biçimleyicilerin BCP-47 etiketi. Yerel rakamlı dilde
     * rakam sistemi `-u-nu-` uzantısıyla AÇIKÇA verilir: CLDR'de çıplak "ar" (JDK/Android) ve "bn"
     * varsayılanı yerel rakamdır, uzantısız kaynak `%d`'si Batı seçen kullanıcıya da yerel rakam
     * yazardı. Kaynak klasörü seçimi uzantıyı yok sayar (`values-ar`, `values-bn` yine seçilir).
     * Diğer dillerde etiket AYNEN döner (Türkçe, Endonezce "id"… değişmez).
     */
    fun yerelEtiketi(dil: String, kayitli: String?): String =
        if (yerelRakamli(dil)) "${kok(dil)}-u-nu-${sistem(dil, kayitli)}" else dil
}

/**
 * [metin]deki ASCII 0-9'u [sifir]dan başlayan rakam dizisine çevirir; metnin geri kalanına
 * (harf, ":", "°", "/", zaten yerel rakam) dokunmaz. [sifir] '0' ise ya da metinde ASCII rakam
 * yoksa metin AYNEN (aynı nesne) döner. İdempotent. Wear `rakamlariYerellestir` ile aynı imza.
 */
fun rakamlariYerellestir(metin: String, sifir: Char): String {
    if (sifir == '0' || metin.none { it in '0'..'9' }) return metin
    val fark = sifir - '0'
    val sb = StringBuilder(metin.length)
    for (c in metin) sb.append(if (c in '0'..'9') c + fark else c)
    return sb.toString()
}

/**
 * SİSTEMİN biçimlediği metin (ör. `TextClock`, cihaz yerel ayarıyla yazar) için: ASCII, Doğu
 * Arap (U+0660–0669), Farsça/Urduca (U+06F0–06F9) ve Bengalce (U+09E6–09EF) rakamların HEPSİNİ
 * [sifir] dizisine eşitler. Yalnız yerel rakamlı arayüzde (`Rakam.yerelRakamli`: Arapça,
 * Bengalce) kullanılır (diğer dillerde cihazın biçimi aynen kalır). Değişecek rakam yoksa AYNI
 * nesne döner.
 */
fun rakamlariEsitle(metin: String, sifir: Char): String {
    fun deger(c: Char): Int = when (c) {
        in '0'..'9' -> c - '0'
        in '\u0660'..'\u0669' -> c - '\u0660'
        in '\u06F0'..'\u06F9' -> c - '\u06F0'
        in '\u09E6'..'\u09EF' -> c - '\u09E6'
        else -> -1
    }
    if (metin.none { deger(it) >= 0 && it != sifir + deger(it) }) return metin
    val sb = StringBuilder(metin.length)
    for (c in metin) {
        val d = deger(c)
        sb.append(if (d >= 0) sifir + d else c)
    }
    return sb.toString()
}
