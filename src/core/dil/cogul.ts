/**
 * Sayının CLDR çoğul kategorisi — ELLE yazılmış kurallar (yalnız tam sayılar).
 *
 * Hermes'te `Intl.PluralRules` olduğu varsayılmaz; polyfill ve yerel veri paketi eklemek
 * yerine desteklenen dillerin kuralları buradadır. Nöbetçi: `cogul.test.ts` her dil için
 * 0–1000 arası her sayıyı Node'un ICU'lu `Intl.PluralRules` sonucuyla karşılaştırır.
 */
import type { CogulKategori, CogulMetin } from './tipler';

type Kural = (n: number) => CogulKategori;

const birDiger: Kural = (n) => (n === 1 ? 'one' : 'other');
const hepDiger: Kural = () => 'other';
/** Fransızca: 0 ve 1 tekil; 1.000.000 ve katları `many`. */
const fransizca: Kural = (n) => (n === 0 || n === 1 ? 'one' : n !== 0 && n % 1000000 === 0 ? 'many' : 'other');
/** İspanyolca: yalnız 1 tekil (0 çoğul); 1.000.000 ve katları `many`. */
const ispanyolca: Kural = (n) => (n === 1 ? 'one' : n !== 0 && n % 1000000 === 0 ? 'many' : 'other');
/** Doğu Slav (Rusça): 1, 21… one; 2–4, 22–24… few; gerisi many. */
const rusca: Kural = (n) => {
  const s10 = n % 10;
  const s100 = n % 100;
  if (s10 === 1 && s100 !== 11) return 'one';
  if (s10 >= 2 && s10 <= 4 && (s100 < 12 || s100 > 14)) return 'few';
  return 'many';
};
/** Boşnakça (tam sayıda): Rusça gibi ama `many` yerine `other`. */
const bosnakca: Kural = (n) => {
  const k = rusca(n);
  return k === 'many' ? 'other' : k;
};
const arapca: Kural = (n) => {
  const s100 = n % 100;
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (s100 >= 3 && s100 <= 10) return 'few';
  if (s100 >= 11 && s100 <= 99) return 'many';
  return 'other';
};
/**
 * Rumence (tam sayıda): yalnız 1 tekil; 0 ve son iki hanesi 1–19 olan (1 hariç: 2–19, 101–119…)
 * `few`; gerisi (20, 100, 120, 1.000.000…) `other`. CLDR: few = v != 0 or n = 0 or n != 1 and n % 100 = 1..19.
 */
const rumence: Kural = (n) => (n === 1 ? 'one' : n === 0 || (n % 100 >= 1 && n % 100 <= 19) ? 'few' : 'other');
/**
 * Lehçe (tam sayıda): yalnız 1 tekil; son hanesi 2–4 olan (12–14 hariç: 2, 22, 104) `few`; gerisi
 * (0, 5–21, 25, 1.000.000…) `many`. CLDR: one = i = 1 and v = 0; few = v = 0 and i % 10 = 2..4 and
 * i % 100 != 12..14; many = v = 0 and (i != 1 and i % 10 = 0..1 or i % 10 = 5..9 or i % 100 = 12..14).
 */
const lehce: Kural = (n) => {
  if (n === 1) return 'one';
  const s10 = n % 10;
  const s100 = n % 100;
  return s10 >= 2 && s10 <= 4 && (s100 < 12 || s100 > 14) ? 'few' : 'many';
};
/** Makedonca (tam sayıda): son hanesi 1 olan (11 hariç: 1, 21, 101) tekil; gerisi `other`. */
const makedonca: Kural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'one' : 'other');
/**
 * Filipince (tam sayıda): son hanesi 4, 6 ya da 9 OLMAYAN her sayı tekil (0, 1, 2, 3, 5, 10, 11, 1.000.000);
 * gerisi (4, 6, 9, 14, 106…) `other`. CLDR: one = v = 0 and i = 1,2,3 or v = 0 and i % 10 != 4,6,9 or
 * v != 0 and f % 10 != 4,6,9.
 */
const filipince: Kural = (n) => (n % 10 === 4 || n % 10 === 6 || n % 10 === 9 ? 'other' : 'one');
/** Farsça, Hintçe, Bengalce, Gucaratça, Kannada, Assamca, Pencapça, Sinhala, Amharca ve Fula: 0 ve 1 tekil (Fulada 1,5 de tekil; burada yalnız tam sayı). */
const sifirBir: Kural = (n) => (n === 0 || n === 1 ? 'one' : 'other');

const KURALLAR: Record<string, Kural> = {
  tr: birDiger,
  en: birDiger,
  de: birDiger,
  ur: birDiger,
  az: birDiger,
  uz: birDiger,
  kk: birDiger,
  ky: birDiger,
  tg: birDiger,
  sw: birDiger,
  ha: birDiger,
  om: birDiger,
  so: birDiger,
  ta: birDiger,
  ml: birDiger,
  sq: birDiger,
  nl: birDiger,
  ps: birDiger,
  ckb: birDiger,
  ug: birDiger,
  sv: birDiger,
  el: birDiger,
  ku: birDiger,
  tk: birDiger,
  bg: birDiger,
  sd: birDiger,
  te: birDiger,
  mr: birDiger,
  ne: birDiger,
  id: hepDiger,
  ms: hepDiger,
  yo: hepDiger,
  zh: hepDiger,
  th: hepDiger,
  ko: hepDiger,
  vi: hepDiger,
  ja: hepDiger,
  // Tatarca CLDR `plurals.xml`'de YOK (CLDR 49 dil çoğul tablosu, 2026-11-02) → ICU kök kuralı: yalnız
  // `other`. Android `<plurals>` seçimi de kökten düşer (yalnız `other`); JS aynısını yapar.
  tt: hepDiger,
  km: hepDiger,
  fr: fransizca,
  ru: rusca,
  uk: rusca,
  bs: bosnakca,
  hr: bosnakca,
  sr: bosnakca,
  ro: rumence,
  pl: lehce,
  mk: makedonca,
  fil: filipince,
  ar: arapca,
  fa: sifirBir,
  bn: sifirBir,
  hi: sifirBir,
  am: sifirBir,
  ff: sifirBir,
  gu: sifirBir,
  kn: sifirBir,
  as: sifirBir,
  // Pencapça Şahmuki: ICU `pa-Arab` kuralı `pa`nınkidir (one = 0, 1).
  pa: sifirBir,
  // Sinhala CLDR: one = n = 0,1 or i = 0 and f = 1 → tam sayıda Hintçe kuralı.
  si: sifirBir,
  es: ispanyolca,
  // Portekizce Avrupa normu: pt-PT kuralı (yalnız 1 tekil). CLDR `pt` (Brezilya) 0'ı da tekil sayar
  // (one = i = 0..1); uygulama tek kural taşır. Nöbetçi ICU karşılaştırmasını `pt-PT` ile yapar.
  pt: ispanyolca,
  it: ispanyolca,
};

/** Desteklenen dil kodları (nöbetçi testin taradığı liste). */
export const COGUL_DILLERI = Object.keys(KURALLAR);

export function cogulKategorisi(dil: string, n: number): CogulKategori {
  const kural = KURALLAR[dil] ?? birDiger;
  return kural(Math.abs(Math.trunc(n)));
}

/** Çoğul metinden sayıya uyan biçimi seçer; kategori yoksa `other`. */
export function cogulSec(dil: string, metin: CogulMetin, n: number): string {
  return metin[cogulKategorisi(dil, n)] ?? metin.other;
}
