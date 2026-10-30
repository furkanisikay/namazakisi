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
/** Farsça, Hintçe, Bengalce, Amharca ve Fula: 0 ve 1 tekil (Fulada 1,5 de tekil; burada yalnız tam sayı). */
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
  sq: birDiger,
  nl: birDiger,
  ps: birDiger,
  ckb: birDiger,
  ug: birDiger,
  id: hepDiger,
  ms: hepDiger,
  yo: hepDiger,
  fr: fransizca,
  ru: rusca,
  bs: bosnakca,
  ar: arapca,
  fa: sifirBir,
  bn: sifirBir,
  hi: sifirBir,
  am: sifirBir,
  ff: sifirBir,
  es: ispanyolca,
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
