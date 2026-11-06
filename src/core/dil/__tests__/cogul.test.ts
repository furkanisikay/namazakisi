/**
 * Nöbetçi: elle yazılmış CLDR çoğul kuralları Node'un ICU'lu `Intl.PluralRules`'ıyla
 * 0–1000 ve büyük sayılarda birebir aynı. Hermes'te bu API'ye güvenilmediği için uygulama
 * kendi tablosunu kullanır; tablo bir dilde ayrışırsa burada kırılır.
 */
import { COGUL_DILLERI, cogulKategorisi, cogulSec } from '../cogul';
import { cogul } from '../tipler';

const SAYILAR = [
  ...Array.from({ length: 1001 }, (_, i) => i),
  1001, 1011, 1021, 1100, 10000, 100000, 1000000, 2000000, 1000001,
];

/** Uygulama kodunun ICU yerel ayarı: Portekizce Avrupa normudur (çıplak `pt` ICU'da Brezilya, 0 tekil). */
// Tatarca CLDR çoğul tablosunda YOK (CLDR 49 `language_plural_rules`, 2026-11-02): ICU `tt`'yi kök kurala
// (yalnız `other`) düşürmez, Node `Intl.PluralRules('tt')` `en-US`'ye düşer (one/other) → karşılaştırma kök
// davranışı taşıyan bir yerelle (`ja`, yalnız other) yapılır. Android `<plurals>` de `tt`'de kökten düşer.
// Dalga 13: Kinyarwanda, Kirundi, Dagbani, Mooré, Afar ve Maguindanao da CLDR çoğul tablosunda YOK (CLDR main
// `plurals.xml`, 2026-11-04) → Node `en-US`'ye düşer; aynı gerekçeyle kök davranışlı `ja` ile karşılaştırılır.
const ICU_YERELI: Record<string, string> = { pt: 'pt-PT', tt: 'ja', rw: 'ja', rn: 'ja', dag: 'ja', mos: 'ja', aa: 'ja', mdh: 'ja' };

describe.each(COGUL_DILLERI)('%s çoğul kuralı', (dil) => {
  it('ICU ile aynı', () => {
    const icu = new Intl.PluralRules(ICU_YERELI[dil] ?? dil);
    const sapma = SAYILAR.filter((n) => cogulKategorisi(dil, n) !== icu.select(n));
    expect(sapma).toEqual([]);
  });
});

it('metinden kategori seçer, yoksa other', () => {
  const m = cogul({ one: '{n} gün', other: '{n} günler' });
  expect(cogulSec('en', m, 1)).toBe('{n} gün');
  expect(cogulSec('en', m, 2)).toBe('{n} günler');
  expect(cogulSec('ar', m, 3)).toBe('{n} günler');
});

it('yeni diller: es 0 çoğul ve milyon katı many, hi/bn 0 tekil, nl/sq one/other', () => {
  expect([0, 1, 2, 1000000, 1000001].map((n) => cogulKategorisi('es', n))).toEqual(['other', 'one', 'other', 'many', 'other']);
  expect([0, 1, 2].map((n) => cogulKategorisi('hi', n))).toEqual(['one', 'one', 'other']);
  expect([0, 1, 2].map((n) => cogulKategorisi('bn', n))).toEqual(['one', 'one', 'other']);
  for (const dil of ['nl', 'sq']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
});

it('sağdan sola dalga: fa 0 tekil, ps/ckb/ug one/other', () => {
  expect([0, 1, 2].map((n) => cogulKategorisi('fa', n))).toEqual(['one', 'one', 'other']);
  for (const dil of ['ps', 'ckb', 'ug']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
});

it('Orta Asya dalgası: az/uz/kk/ky/tg one/other (0 çoğul)', () => {
  for (const dil of ['az', 'uz', 'kk', 'ky', 'tg']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
});

it('Afrika dalgası: sw/ha/om/so one/other (0 çoğul), am/ff 0 tekil, yo yalnız other', () => {
  for (const dil of ['sw', 'ha', 'om', 'so']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
  for (const dil of ['am', 'ff']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['one', 'one', 'other']);
  expect([0, 1, 2].map((n) => cogulKategorisi('yo', n))).toEqual(['other', 'other', 'other']);
});

it('Asya dalgası: zh/th/ko/vi yalnız other, ta/ml one/other (0 çoğul)', () => {
  for (const dil of ['zh', 'th', 'ko', 'vi']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'other', 'other']);
  for (const dil of ['ta', 'ml']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
});

it('Avrupa dalgası: pt (pt-PT)/it one/many/other, sv/el one/other, uk Rusça, hr/sr Boşnakça, ro yeni kural', () => {
  for (const dil of ['pt', 'it']) expect([0, 1, 2, 1000000].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other', 'many']);
  for (const dil of ['sv', 'el']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
  expect([1, 2, 5, 11, 21].map((n) => cogulKategorisi('uk', n))).toEqual(['one', 'few', 'many', 'many', 'one']);
  for (const dil of ['hr', 'sr']) expect([1, 2, 5, 11, 21].map((n) => cogulKategorisi(dil, n))).toEqual(['one', 'few', 'other', 'other', 'one']);
  // Rumence: 0 ve …01–…19 (1 hariç) few; 20, 100, 120, 1.000.000 other.
  expect([0, 1, 2, 19, 20, 100, 101, 119, 120, 1000000].map((n) => cogulKategorisi('ro', n))).toEqual([
    'few', 'one', 'few', 'few', 'other', 'other', 'few', 'few', 'other', 'other',
  ]);
});

it('dalga 11: ku/tk/bg/sd one/other, gu 0 ve 1 tekil, ja/tt yalnız other, pl one/few/many, mk …1 tekil', () => {
  for (const dil of ['ku', 'tk', 'bg', 'sd']) expect([0, 1, 2, 21].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other', 'other']);
  expect([0, 1, 2].map((n) => cogulKategorisi('gu', n))).toEqual(['one', 'one', 'other']);
  for (const dil of ['ja', 'tt']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'other', 'other']);
  // Lehçe: 1 one; …2–4 (…12–14 hariç) few; gerisi (0, 5–21, 25, 1.000.000) many.
  expect([0, 1, 2, 4, 5, 12, 14, 21, 22, 25, 104, 112, 1000000].map((n) => cogulKategorisi('pl', n))).toEqual([
    'many', 'one', 'few', 'few', 'many', 'many', 'many', 'many', 'few', 'many', 'few', 'many', 'many',
  ]);
  // Makedonca: son hanesi 1 (11 hariç) one; gerisi other.
  expect([0, 1, 2, 11, 21, 101, 111].map((n) => cogulKategorisi('mk', n))).toEqual(['other', 'one', 'other', 'other', 'one', 'one', 'other']);
});

it('dalga 12: fil yeni kural, te/mr/ne one/other, kn/as/pa/si 0 ve 1 tekil, km yalnız other', () => {
  // Filipince: son hanesi 4, 6, 9 OLMAYAN her tam sayı tekil (0 ve 1.000.000 dahil).
  expect([0, 1, 2, 3, 4, 5, 6, 9, 10, 14, 16, 19, 21, 104, 1000000].map((n) => cogulKategorisi('fil', n))).toEqual([
    'one', 'one', 'one', 'one', 'other', 'one', 'other', 'other', 'one', 'other', 'other', 'other', 'one', 'other', 'one',
  ]);
  for (const dil of ['te', 'mr', 'ne']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
  for (const dil of ['kn', 'as', 'pa', 'si']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['one', 'one', 'other']);
  expect([0, 1, 2].map((n) => cogulKategorisi('km', n))).toEqual(['other', 'other', 'other']);
});

it('dalga 13: he ve lt yeni kural, ceb Filipince kuralı, mg/ln/ak 0 ve 1 tekil, CLDR dışı diller yalnız other', () => {
  // İbranice (CLDR 42+): 1 one, 2 two, gerisi other (eski `many` yok: 20, 100 other).
  expect([0, 1, 2, 3, 10, 20, 100, 1000000].map((n) => cogulKategorisi('he', n))).toEqual(['other', 'one', 'two', 'other', 'other', 'other', 'other', 'other']);
  // Litvanca: …1 one, …2–9 few (…11–19 hariç), gerisi other; `many` yalnız kesirli.
  expect([0, 1, 2, 9, 10, 11, 12, 19, 21, 22, 101, 111, 1000000].map((n) => cogulKategorisi('lt', n))).toEqual([
    'other', 'one', 'few', 'few', 'other', 'other', 'other', 'other', 'one', 'few', 'one', 'other', 'other',
  ]);
  expect([0, 1, 4, 14, 21].map((n) => cogulKategorisi('ceb', n))).toEqual(['one', 'one', 'other', 'other', 'one']);
  for (const dil of ['mg', 'ln', 'ak']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['one', 'one', 'other']);
  for (const dil of ['ka', 'lg']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'one', 'other']);
  for (const dil of ['rw', 'rn', 'dag', 'mos', 'aa', 'mdh', 'nqo']) expect([0, 1, 2].map((n) => cogulKategorisi(dil, n))).toEqual(['other', 'other', 'other']);
});
