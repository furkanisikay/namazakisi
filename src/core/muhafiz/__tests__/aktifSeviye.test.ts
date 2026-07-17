import { aktifSeviyeyiBul, esikSiralamasiGecerliMi } from '../aktifSeviye';
import type { SeviyeAyari, VakitMuhafizAyari, SeviyeKademe, UyariModu } from '../matrisTipleri';

const sv = (kademe: SeviyeKademe, esikDk: number, mod: UyariModu = 'bildirim'): SeviyeAyari =>
  ({ kademe, mod, esikDk, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '' });

const vakitAyari: VakitMuhafizAyari = {
  seviyeler: [sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3)],
};

describe('aktifSeviyeyiBul', () => {
  test('35 dk kala: hiçbir pencere kapsamaz → null', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 35)).toBeNull();
  });
  test('20 dk kala: yalnız nazik(30) kapsar → nazik', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 20)?.kademe).toBe('nazik');
  });
  test('5 dk kala: nazik+uyari+sert kapsar → en acil = sert(8)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 5)?.kademe).toBe('sert');
  });
  test('2 dk kala: hepsi kapsar → acil(3)', () => {
    expect(aktifSeviyeyiBul(vakitAyari, 2)?.kademe).toBe('acil');
  });
  test('sessiz seviye pencere sağlamaz: acil sessizse 2 dk kala sert kazanır', () => {
    const v: VakitMuhafizAyari = { seviyeler: [sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3, 'sessiz')] };
    expect(aktifSeviyeyiBul(v, 2)?.kademe).toBe('sert');
  });
});

describe('esikSiralamasiGecerliMi', () => {
  test('azalan eşik geçerli', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 30), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(true);
  });
  test('ters/eşit sıra geçersiz', () => {
    expect(esikSiralamasiGecerliMi([sv('nazik', 10), sv('uyari', 15), sv('sert', 8), sv('acil', 3)])).toBe(false);
  });
});
