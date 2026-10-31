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
 * Ayrışmayan (NFD'de işaret çıkmayan) çizgili d: Vietnamca/Boşnakça "đ" aksansız "d" yazılır.
 * Tipografik kesme işaretleri (’ ‘ ʼ) düz `'` sayılır: Vietnamca "‘Asr", "Qur’an"; Hausa ʼy.
 */
const EK_HARF_HARITASI: Record<string, string> = { Đ: 'd', đ: 'd', '’': "'", '‘': "'", ʼ: "'" };

/**
 * Malayalamca eski chillu yazımı (ünsüz + virama + ZWJ, ör. "ര്‍") atomik chillu harfine
 * (U+0D7A–U+0D7F) indirgenir; kalan ZWJ/ZWNJ aramada yok sayılır. Meal eski, arayüz yeni
 * yazımı kullanır: yoksa "ഖുര്‍ആന്‍" ile "ഖുർആൻ" eşleşmez.
 */
const ESKI_CHILLU: [RegExp, string][] = [
  [/ണ്‍/g, 'ൺ'],
  [/ന്‍/g, 'ൻ'],
  [/ര്‍/g, 'ർ'],
  [/ല്‍/g, 'ൽ'],
  [/ള്‍/g, 'ൾ'],
  [/ക്‍/g, 'ൿ'],
];
const BIRLESTIRME_DENETIMI = /[‌‍]/g;

function malayalamChilluBirlestir(metin: string): string {
  let sonuc = metin;
  for (const [eski, yeni] of ESKI_CHILLU) sonuc = sonuc.replace(eski, yeni);
  return sonuc.replace(BIRLESTIRME_DENETIMI, '');
}

/**
 * YALNIZ birleşik aksan işaretleri bloğu (U+0300–036F): Vietnamca ses işaretleri, şapka,
 * kanca (ơ ư), alt nokta, Rumence virgül/çengel (ș ş), Yunan tonos/diyalitika (ά ϊ) ve Kiril
 * kısa işareti (й ї). `\p{M}` BİLİNÇLİ kullanılmaz: Arap harekesi, Devanagari/Bengal/
 * Tamil/Malayalam ünlü işaretleri ve Tay işaretleri de `M`'dir; silinirse o dillerin araması
 * anlamsız eşleşir. Bu aralık dışındaki işaretler bayt bayt aynı kalır.
 */
const LATIN_ISARET = /[\u0300-\u036f]/g;
const TEK_LATIN_ISARET = /^[\u0300-\u036f]$/;

/**
 * Kiril ve Yunan büyük harfin küçüğü, sabit Unicode bloklarından (Hermes'te `toLowerCase`
 * ICU'ya bağlı değil ama Türkçe "I" tuzağı yüzünden yasak; bu bloklarda eşleme kod noktası
 * farkıyla kesindir). Vurgulu Yunan büyük harfleri buraya NFD'de vurgusu atılmış gelir.
 */
function kirilYunanKucuk(kod: number): number {
  if (kod >= 0x0410 && kod <= 0x042f) return kod + 0x20; // А-Я
  if (kod >= 0x0400 && kod <= 0x040f) return kod + 0x50; // Ѐ-Џ (Є І Ї Ђ Ј Љ Њ Ћ Џ)
  if ((kod >= 0x0460 && kod <= 0x0481) || (kod >= 0x048a && kod <= 0x04bf) || (kod >= 0x04d0 && kod <= 0x052f)) {
    return kod % 2 === 0 ? kod + 1 : kod; // çift = büyük (Ґ Қ Ң Ү Ұ Ҳ Ә Ө…)
  }
  if (kod >= 0x04c1 && kod <= 0x04ce) return kod % 2 === 1 ? kod + 1 : kod;
  if (kod === 0x04c0) return 0x04cf; // Ӏ
  if (kod >= 0x0391 && kod <= 0x03a9 && kod !== 0x03a2) return kod + 0x20; // Α-Ω
  if (kod === 0x03c2) return 0x03c3; // son harf sigması ς → σ
  return kod;
}

/** Bir harfi küçültür: Türkçe harita, ASCII büyük→küçük (kod noktası farkı 32), Kiril ve Yunan. */
function harfKatla(karakter: string): string {
  const turkceKarsilik = TURKCE_HARF_HARITASI[karakter];
  if (turkceKarsilik !== undefined) return turkceKarsilik;
  const kod = karakter.codePointAt(0)!;
  // ASCII 'A'-'Z' (65-90) → 'a'-'z' (97-122).
  if (kod >= 65 && kod <= 90) return String.fromCodePoint(kod + 32);
  const kucuk = kirilYunanKucuk(kod);
  return kucuk === kod ? karakter : String.fromCodePoint(kucuk);
}

/**
 * Metni arama karşılaştırması için katlar: Türkçe harfler sabit haritayla,
 * aksanlı harfler aksansız tabanına (NFD + U+0300–036F silme; "chuông" → "chuong",
 * "Đổi" → "doi", "Φάτζρ" → "φατζρ"), ASCII, Kiril ve Yunan büyük harfler küçüğüne
 * (Yunan son harf sigması σ'ya), harf olmayan karakterler DEĞİŞMEDEN geçer.
 */
export function aramaIcinKatla(metin: string): string {
  let sonuc = '';
  for (const karakter of malayalamChilluBirlestir(metin)) {
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
