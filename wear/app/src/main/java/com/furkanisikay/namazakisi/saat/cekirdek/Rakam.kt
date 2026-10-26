package com.furkanisikay.namazakisi.saat.cekirdek

import java.text.DecimalFormatSymbols
import java.util.Locale

/*
 * Rakam sistemi — saatin kullanıcıya görünen sayıları cihaz yerel ayarının rakamıyla. SAF.
 *
 * Saat CİHAZIN dilini izler (`SaatDili`); rakam da cihazın YEREL AYARINI izler: ar-SA gibi
 * Doğu Arap rakamlı yerel ayarda saatin her sayısı ٠-٩, Batı rakamlı yerel ayarda (tr, en,
 * ur-PK, ar-MA…) 0-9. Sistem saati (`TimeText`), tile'daki `DynamicInt32.format()` ve kaynak
 * dizgesindeki `%d` (Android `getString(id, …)` `String.format(yerel, …)` ile biçimler) zaten
 * böyle çizer; uygulamanın kendi ürettiği metin (Kotlin şablonu, `toString()`,
 * `DateTimeFormatter("HH:mm")`, telefondan gelen hazır metin) ise Batı rakamıyla gelir.
 *
 * Kural: çekirdek metni Batı rakamıyla ÜRETİR (testler, fikstürler, sesli okuma aynı kalır);
 * dönüşüm yalnız ÇİZİM KENARINDA, tek yardımcıyla yapılır (Compose `ui/YerelRakam`, tile
 * `TileOrtak`, komplikasyon `KomplikasyonOrtak.duz`, bildirim `Context.yerelRakamla`).
 * Yerel ayar `resources.configuration.locales[0]`'dan okunur (dil kodundan DEĞİL: ar-MA "ar"
 * dilidir ama Batı rakamı yazar) — `%d`'yi biçimleyen yerel ayarla aynı, rakamlar karışmaz.
 */

/**
 * [metin]deki ASCII 0-9'u [sifir]dan başlayan rakam dizisine çevirir; metnin geri kalanına
 * (harf, ":", "°", "/", zaten yerel rakam) dokunmaz. [sifir] '0' ise metin AYNEN döner
 * (Türkçe ve diğer Batı rakamlı yerel ayarlarda çıktı birebir aynı). İdempotent.
 */
fun rakamlariYerellestir(metin: String, sifir: Char): String {
    if (sifir == '0' || metin.none { it in '0'..'9' }) return metin
    val fark = sifir - '0'
    val sb = StringBuilder(metin.length)
    for (c in metin) sb.append(if (c in '0'..'9') c + fark else c)
    return sb.toString()
}

/**
 * [yerel] ayarın sıfır rakamı: ar-SA → '٠' (U+0660), fa-IR / ur-IN → '۰' (U+06F0), tr/en/
 * ur-PK/ar-MA → '0'. `-u-nu-` uzantısı (kullanıcının rakam tercihi) da dikkate alınır.
 * Rakam dizisi Unicode'da ardışık değilse (beklenmez) güvenli yol: '0'.
 */
fun yerelSifir(yerel: Locale): Char {
    val sifir = DecimalFormatSymbols.getInstance(yerel).zeroDigit
    return if (Character.isDigit(sifir) && Character.digit(sifir, 10) == 0 && Character.digit(sifir + 9, 10) == 9) sifir else '0'
}
