import { aktifDil, aktifDiliKur, aktifDilSifirla, bicim, metin, sayili, sozluk } from '../aktifDil';
import { cihazDilindenSec, DILLER } from '../diller';
import { cogul, type CogulMetin } from '../tipler';
import { tr } from '../sozluk/tr';

afterEach(() => aktifDilSifirla());

it('varsayılan Türkçe; geçersiz kod Türkçeye düşer', () => {
  expect(aktifDil()).toBe('tr');
  expect(aktifDiliKur('xx')).toBe(false);
  expect(aktifDiliKur('en')).toBe(true);
  expect(metin()).toBe(sozluk('en'));
  expect(aktifDiliKur(undefined)).toBe(true);
  expect(aktifDil()).toBe('tr');
});

it('yer tutucu ve çoğul', () => {
  expect(bicim('{ad} ile devam edin', { ad: 'İzmir' })).toBe('İzmir ile devam edin');
  expect(bicim('{yok} kalır')).toBe('{yok} kalır');
  const gun = cogul({ one: '{n} day', other: '{n} days' });
  expect(sayili(gun, 1, {}, 'en')).toBe('1 day');
  expect(sayili(gun, 3, {}, 'en')).toBe('3 days');
});

it('cihaz dili yalnız SEÇİLEBİLİR dilse kullanılır (yarım dil kendiliğinden açılmaz)', () => {
  expect(cihazDilindenSec('tr_TR')).toBe('tr');
  const en = DILLER.find((d) => d.kod === 'en')!;
  expect(cihazDilindenSec('en_US')).toBe(en.secilebilir ? 'en' : null);
  expect(cihazDilindenSec('ja-JP')).toBeNull();
  // Android'in eski Endonezce kodu ("in_ID") Endonezceye eşlenir.
  const id = DILLER.find((d) => d.kod === 'id')!;
  expect(cihazDilindenSec('in_ID')).toBe(id.secilebilir ? 'id' : null);
  expect(cihazDilindenSec(null)).toBeNull();
});

/** Sözlük ağacındaki her metin: boş değil, yer tutucuları Türkçeyle aynı, çoğullar dilin kategorilerini taşır. */
function yapraklar(o: unknown, yol = ''): [string, unknown][] {
  if (typeof o === 'string' || (o && typeof o === 'object' && '__cogul' in (o as object))) return [[yol, o]];
  return Object.entries(o as object).flatMap(([k, v]) => yapraklar(v, yol ? `${yol}.${k}` : k));
}
const yerTutucular = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe.each(DILLER.map((d) => d.kod))('%s sözlüğü', (kod) => {
  const kaynak = new Map(yapraklar(tr));
  const hedef = yapraklar(sozluk(kod));

  it('anahtar kümesi Türkçeyle aynı', () => {
    expect(hedef.map(([y]) => y).sort()).toEqual([...kaynak.keys()].sort());
  });

  it('boş metin yok, yer tutucular aynı, çoğul kategorileri tam', () => {
    const icu = new Intl.PluralRules(kod).resolvedOptions().pluralCategories;
    for (const [yol, deger] of hedef) {
      const k = kaynak.get(yol);
      if (typeof deger === 'string') {
        expect(deger.trim()).not.toBe('');
        expect([yol, yerTutucular(deger)]).toEqual([yol, yerTutucular(k as string)]);
      } else {
        const c = deger as CogulMetin;
        for (const kat of icu) expect([yol, kat, typeof c[kat]]).toEqual([yol, kat, 'string']);
      }
    }
  });
});
