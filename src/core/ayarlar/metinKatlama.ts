/**
 * Arama karşılaştırması için Türkçe metin katlama.
 *
 * `toLowerCase()` KULLANILMAZ (AGENTS.md `toUpperCase()` tuzağının ikizi):
 * - `'İstanbul'.toLowerCase()` → `'i̇stanbul'` — sonunda U+0307 BİRLEŞEN NOKTA
 *   kalır, kullanıcının yazdığı düz `'istanbul'` ile eşleşmez.
 * - `'I'.toLowerCase()` → `'i'`; Türkçede büyük I'nın küçüğü `'ı'` olmalıdır.
 *
 * `Intl`/`localeCompare` de KULLANILMAZ — Hermes'te ICU varlığı garanti değil.
 * Bunun yerine sabit harita + aksan-duyarsız indirgeme uygulanır: Türkçe
 * klavyesi olmayan kullanıcı "muhafiz" yazıp "Muhafız"ı bulabilsin.
 */

/** Türkçeye özgü harflerin katlanmış (küçük, aksan-duyarsız) karşılıkları. */
const TURKCE_HARF_HARITASI: Record<string, string> = {
  İ: 'i',
  I: 'i',
  ı: 'i',
  i: 'i',
  Ş: 's',
  ş: 's',
  S: 's',
  s: 's',
  Ğ: 'g',
  ğ: 'g',
  G: 'g',
  g: 'g',
  Ü: 'u',
  ü: 'u',
  U: 'u',
  u: 'u',
  Ö: 'o',
  ö: 'o',
  O: 'o',
  o: 'o',
  Ç: 'c',
  ç: 'c',
  C: 'c',
  c: 'c',
};

/**
 * Metni arama karşılaştırması için katlar: Türkçe harfler sabit haritayla,
 * kalan ASCII harfler basit büyük→küçük dönüşümüyle (kod noktası farkı 32),
 * harf olmayan karakterler DEĞİŞMEDEN geçer.
 */
export function aramaIcinKatla(metin: string): string {
  let sonuc = '';
  for (const karakter of metin) {
    const turkceKarsilik = TURKCE_HARF_HARITASI[karakter];
    if (turkceKarsilik !== undefined) {
      sonuc += turkceKarsilik;
      continue;
    }
    const kod = karakter.codePointAt(0)!;
    // ASCII 'A'-'Z' (65-90) → 'a'-'z' (97-122); diğer her şey olduğu gibi kalır.
    if (kod >= 65 && kod <= 90) {
      sonuc += String.fromCodePoint(kod + 32);
    } else {
      sonuc += karakter;
    }
  }
  return sonuc;
}
