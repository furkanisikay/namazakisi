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

/** Ayrışmayan (NFD'de işaret çıkmayan) çizgili d: Vietnamca/Boşnakça "đ" aksansız "d" yazılır. */
const EK_HARF_HARITASI: Record<string, string> = { Đ: 'd', đ: 'd' };

/**
 * YALNIZ Latin birleşik aksan işaretleri (U+0300–036F): Vietnamca ses işaretleri, şapka,
 * kanca (ơ ư), alt nokta. `\p{M}` BİLİNÇLİ kullanılmaz: Arap harekesi, Devanagari/Bengal/
 * Tamil/Malayalam ünlü işaretleri ve Tay işaretleri de `M`'dir; silinirse o dillerin araması
 * anlamsız eşleşir. Bu aralık dışındaki yazılar bayt bayt aynı kalır.
 */
const LATIN_ISARET = /[̀-ͯ]/g;
const TEK_LATIN_ISARET = /^[̀-ͯ]$/;

/** Bir harfi küçültür: Türkçe harita, sonra ASCII büyük→küçük (kod noktası farkı 32). */
function harfKatla(karakter: string): string {
  const turkceKarsilik = TURKCE_HARF_HARITASI[karakter];
  if (turkceKarsilik !== undefined) return turkceKarsilik;
  const kod = karakter.codePointAt(0)!;
  // ASCII 'A'-'Z' (65-90) → 'a'-'z' (97-122); diğer her şey olduğu gibi kalır.
  return kod >= 65 && kod <= 90 ? String.fromCodePoint(kod + 32) : karakter;
}

/**
 * Metni arama karşılaştırması için katlar: Türkçe harfler sabit haritayla,
 * Latin aksanlı harfler aksansız tabanına (NFD + U+0300–036F silme; "chuông" →
 * "chuong", "Đổi" → "doi"), kalan ASCII harfler basit büyük→küçük dönüşümüyle,
 * harf olmayan karakterler DEĞİŞMEDEN geçer.
 */
export function aramaIcinKatla(metin: string): string {
  let sonuc = '';
  for (const karakter of metin) {
    if (TURKCE_HARF_HARITASI[karakter] !== undefined) {
      sonuc += TURKCE_HARF_HARITASI[karakter];
      continue;
    }
    const ek = EK_HARF_HARITASI[karakter];
    if (ek !== undefined) {
      sonuc += ek;
      continue;
    }
    // NFD gelmiş metnin tek başına duran işareti ("o" + U+0302) atlanır.
    if (TEK_LATIN_ISARET.test(karakter)) continue;
    const ayrik = karakter.normalize('NFD');
    const taban = ayrik === karakter ? karakter : ayrik.replace(LATIN_ISARET, '');
    // Yalnız Latin işareti taşıyan harf tabanına iner; başka yazının ayrışması (Hangıl, nukta) aynen kalır.
    if (taban !== ayrik && taban.length > 0) {
      for (const parca of taban.normalize('NFC')) sonuc += harfKatla(parca);
    } else {
      sonuc += harfKatla(karakter);
    }
  }
  return sonuc;
}
