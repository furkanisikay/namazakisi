package com.furkanisikay.namazakisi.cekirdek

/*
 * Rakam sistemi — telefonun native yüzeylerinde (widget, hızlı ayar kutusu, bildirim, alarm
 * ekranı) kullanıcının uygulamada SEÇTİĞİ rakamlar. SAF (Android import ETMEZ).
 *
 * Seçimi JS çözer (`core/dil/rakam.ts > rakamSistemiCoz`: açık seçim → ülke → dil) ve
 * ÇÖZÜLMÜŞ değeri yazar: `namazakisi_dil/rakam_sistemi` = "arab" (Doğu Arap rakamı) ya da
 * anahtar yok (Batı). Native taraf yalnız arayüz dili Arapçayken "arab"ı uygular; diğer her
 * durumda (Türkçe dahil) çıktı BİREBİR aynı kalır.
 *
 * Kural (Wear `saat/cekirdek/Rakam.kt` deseni): çekirdek metni Batı rakamıyla ÜRETİR (testler,
 * fikstürler, sesli okuma, veri aynı kalır); dönüşüm yalnız ÇİZİM KENARINDA bu yardımcıyla
 * yapılır. Kaynak dizgesindeki `%d` ve tarih biçimleyicileri ise yerel ayardan biçimlenir →
 * Arapçada yerel ayar `-u-nu-<sistem>` uzantısıyla kurulur ([yerelEtiketi]); ikisi aynı seçimi
 * izlediği için rakamlar karışmaz. Sistemin kendi çizdiği sayılar (widget/bildirim
 * `Chronometer`) başlatıcının/SystemUI'nin sürecinde CİHAZ yerel ayarıyla çizilir — buradan
 * zorlanamaz.
 *
 * İKİZ: `modules/expo-countdown-notification/.../cekirdek/Rakam.kt` (modül uygulama
 * sınıflarını göremez). Biri değişirse ikisini birlikte değiştir.
 */
object Rakam {
    const val ARAB = "arab"
    const val LATN = "latn"

    /** Doğu Arap (Arapça-Hint) sıfırı, U+0660. */
    const val DOGU_SIFIR = '٠'

    /** Arayüz dili kodunun kökü Arapça mı? ("ar", "ar-SA", "ar_MA" → evet). */
    fun arapcaMi(dil: String?): Boolean =
        dil?.trim()?.substringBefore('-')?.substringBefore('_') == "ar"

    /**
     * Etkin rakam sistemi: YALNIZ arayüz dili Arapça VE kayıt "arab" iken [ARAB]; kayıt yok,
     * "latn", bozuk ya da dil Arapça değilse [LATN].
     */
    fun sistem(dil: String?, kayitli: String?): String =
        if (arapcaMi(dil) && kayitli?.trim() == ARAB) ARAB else LATN

    /** Sistemin sıfır rakamı ([rakamlariYerellestir]'e verilir): Doğu → '٠', Batı → '0'. */
    fun sifir(sistem: String): Char = if (sistem == ARAB) DOGU_SIFIR else '0'

    fun sifir(dil: String?, kayitli: String?): Char = sifir(sistem(dil, kayitli))

    /**
     * Kaynak bağlamının (`dildeBaglam`) ve biçimleyicilerin BCP-47 etiketi. Arapçada rakam
     * sistemi `-u-nu-` uzantısıyla AÇIKÇA verilir: CLDR'de çıplak "ar"ın varsayılanı Doğu
     * rakamıdır, uzantısız kaynak `%d`'si Batı seçen (Mağrip) kullanıcıya da Doğu yazardı.
     * Kaynak klasörü seçimi uzantıyı yok sayar (`values-ar` yine seçilir). Diğer dillerde
     * etiket AYNEN döner (Türkçe, Endonezce "id"… değişmez).
     */
    fun yerelEtiketi(dil: String, kayitli: String?): String =
        if (arapcaMi(dil)) "ar-u-nu-${sistem(dil, kayitli)}" else dil
}

/**
 * [metin]deki ASCII 0-9'u [sifir]dan başlayan rakam dizisine çevirir; metnin geri kalanına
 * (harf, ":", "°", "/", zaten Doğu rakamı) dokunmaz. [sifir] '0' ise ya da metinde ASCII rakam
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
 * Arap (U+0660–0669) ve Farsça/Urduca (U+06F0–06F9) rakamların HEPSİNİ [sifir] dizisine
 * eşitler. Yalnız Arapça arayüzde kullanılır (diğer dillerde cihazın biçimi aynen kalır).
 * Değişecek rakam yoksa AYNI nesne döner.
 */
fun rakamlariEsitle(metin: String, sifir: Char): String {
    fun deger(c: Char): Int = when (c) {
        in '0'..'9' -> c - '0'
        in '\u0660'..'\u0669' -> c - '\u0660'
        in '\u06F0'..'\u06F9' -> c - '\u06F0'
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
