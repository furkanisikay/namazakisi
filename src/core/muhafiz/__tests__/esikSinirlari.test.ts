import { esikSinirlariniHesapla, ESIK_MUTLAK_MIN, ESIK_MUTLAK_MAX } from '../esikSinirlari';
import { esikSiralamasiGecerliMi } from '../aktifSeviye';
import type { SeviyeAyari } from '../matrisTipleri';

const sv = (esikDk: number): SeviyeAyari => ({
  kademe: 'nazik', mod: 'bildirim', esikDk, siklik: 'birkez', bildirimSesi: 'can', anonsMetni: '',
});

// normal preset: 45 / 25 / 10 / 3
const seviyeler = () => [sv(45), sv(25), sv(10), sv(3)];

describe('esikSinirlariniHesapla (spec 4.2 kesin azalan sıra)', () => {
  test('ilk seviyenin üst sınırı mutlak max, alt sınırı komşusundan 1 fazla', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 0)).toEqual({ min: 26, max: ESIK_MUTLAK_MAX });
  });

  test('son seviyenin alt sınırı mutlak min, üst sınırı komşusundan 1 eksik', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 3)).toEqual({ min: ESIK_MUTLAK_MIN, max: 9 });
  });

  test('ortadaki seviye iki komşuya birden kısıtlanır', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 1)).toEqual({ min: 11, max: 44 });
    expect(esikSinirlariniHesapla(seviyeler(), 2)).toEqual({ min: 4, max: 24 });
  });

  test('sınırlar içinde kalan her değer sıralamayı bozmaz', () => {
    const s = seviyeler();
    const { min, max } = esikSinirlariniHesapla(s, 1);
    for (const deger of [min, max, Math.floor((min + max) / 2)]) {
      const yeni = s.map((x, i) => (i === 1 ? sv(deger) : x));
      expect(esikSiralamasiGecerliMi(yeni)).toBe(true);
    }
  });

  test('komşuya eşit değer sınır dışıdır (ters sıra reddi)', () => {
    const s = seviyeler();
    // 1. seviye 45 olamaz (0. seviye ile eşit) — max 44
    expect(esikSinirlariniHesapla(s, 1).max).toBeLessThan(s[0].esikDk);
    // 1. seviye 10 olamaz (2. seviye ile eşit) — min 11
    expect(esikSinirlariniHesapla(s, 1).min).toBeGreaterThan(s[2].esikDk);
  });

  test('geçersiz indeks mutlak sınırları döner', () => {
    expect(esikSinirlariniHesapla(seviyeler(), -1)).toEqual({ min: ESIK_MUTLAK_MIN, max: ESIK_MUTLAK_MAX });
    expect(esikSinirlariniHesapla(seviyeler(), 9)).toEqual({ min: ESIK_MUTLAK_MIN, max: ESIK_MUTLAK_MAX });
  });

  test('bozuk (ters) veride min > max üretmez', () => {
    // 1 ve 2 ters: 10 < 25 olmalıydı ama 40 girilmiş
    const bozuk = [sv(45), sv(20), sv(40), sv(3)];
    const sinir = esikSinirlariniHesapla(bozuk, 1);
    expect(sinir.max).toBeGreaterThanOrEqual(sinir.min);
  });

  test('tek elemanlı listede mutlak sınırlar geçerli', () => {
    expect(esikSinirlariniHesapla([sv(30)], 0)).toEqual({ min: ESIK_MUTLAK_MIN, max: ESIK_MUTLAK_MAX });
  });
});
