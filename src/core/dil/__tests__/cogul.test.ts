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

describe.each(COGUL_DILLERI)('%s çoğul kuralı', (dil) => {
  it('ICU ile aynı', () => {
    const icu = new Intl.PluralRules(dil);
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
