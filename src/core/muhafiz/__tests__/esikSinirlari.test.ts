import {
  esikSinirlariniHesapla,
  ESIK_MUTLAK_MIN,
  ESIK_MUTLAK_MAX,
  ESIK_GUVENLIK_TAVANI,
} from '../esikSinirlari';
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

  /**
   * KAPALI (sessiz) adım komşularını KİLİTLEMEYE DEVAM EDER — bilinçli.
   *
   * Kapalı adım atlanırsa kullanıcı komşuyu onun eşiğine eşit/aşan bir değere
   * çekebilir; adım yeniden açıldığında kesin azalan sıra bozulur
   * (`esikSiralamasiGecerliMi` false) ve motor eşit-eşik tie-break'ine düşer.
   * Bedeli küçük: sınır metni görünmeyen bir komşudan gelebilir.
   */
  test('kapalı (sessiz) adım komşu sınırlarını etkilemeye DEVAM eder', () => {
    const s = seviyeler();
    s[1] = { ...s[1], mod: 'sessiz', oncekiMod: 'bildirim' };

    // Kapalı olan 25'lik adım hâlâ üsttekinin alt sınırını ve alttakinin üst sınırını belirler
    expect(esikSinirlariniHesapla(s, 0).min).toBe(26);
    expect(esikSinirlariniHesapla(s, 2).max).toBe(24);
  });
});

/**
 * Faz 0 — tavan artık sabit 120 degil, VAKTIN O GUNKU PENCERESINDEN gelir.
 * Pencere bilinmiyorsa (ekran konumu/vakitleri hesaplayamadiysa) eski davranis
 * birebir korunur: gercek geriye uyumluluk.
 */
describe('esikSinirlariniHesapla — dinamik pencere tavani (Faz 0)', () => {
  test('pencere 400 dk → tavan 399 (vaktin son dakikasi kapsanmaz)', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 0, { pencereUzunluguDk: 400 })).toEqual({
      min: 26,
      max: 399,
    });
  });

  test('pencere 900 dk → GUVENLIK TAVANI 720 (Android alarm siniri)', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 0, { pencereUzunluguDk: 900 })).toEqual({
      min: 26,
      max: ESIK_GUVENLIK_TAVANI,
    });
    expect(ESIK_GUVENLIK_TAVANI).toBe(720);
  });

  test('pencere VERILMEZSE tavan 120 (eski davranis)', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 0)).toEqual({ min: 26, max: ESIK_MUTLAK_MAX });
    expect(esikSinirlariniHesapla(seviyeler(), 0, {})).toEqual({ min: 26, max: ESIK_MUTLAK_MAX });
  });

  test('KOMSU kisiti tavanin onune gecer', () => {
    // 1. seviye: ust komsusu 45 → max 44, pencere 400 olsa bile
    expect(esikSinirlariniHesapla(seviyeler(), 1, { pencereUzunluguDk: 400 }).max).toBe(44);
  });

  test('cok kisa pencerede min > max uretilmez (stepper kilitlenmez)', () => {
    const sinir = esikSinirlariniHesapla(seviyeler(), 0, { pencereUzunluguDk: 10 });
    expect(sinir.max).toBeGreaterThanOrEqual(sinir.min);
  });

  test('gecersiz indekste de tavan pencereden gelir', () => {
    expect(esikSinirlariniHesapla(seviyeler(), -1, { pencereUzunluguDk: 400 })).toEqual({
      min: ESIK_MUTLAK_MIN,
      max: 399,
    });
  });
});

/**
 * Faz 1 — `girisindenItibaren` yönünde sıra kesin ARTANdır (nazik 1 → acil 45),
 * dolayısıyla komşu kısıtı TERS çevrilir: bir üst komşudan (daha nazik) BÜYÜK,
 * bir alt komşudan (daha sert) KÜÇÜK olmalı.
 */
describe('esikSinirlariniHesapla — girisindenItibaren yönü (Faz 1)', () => {
  // giriş yönü preset: 5 / 15 / 30 / 45 (ARTAN)
  const artan = () => [sv(5), sv(15), sv(30), sv(45)];
  const giris = { yon: 'girisindenItibaren' as const };

  test('ilk (en nazik) seviyenin alt sınırı mutlak min, üst sınırı komşusundan 1 eksik', () => {
    expect(esikSinirlariniHesapla(artan(), 0, giris)).toEqual({ min: ESIK_MUTLAK_MIN, max: 14 });
  });

  test('son (en sert) seviyenin alt sınırı komşusundan 1 fazla, üstü tavan', () => {
    expect(esikSinirlariniHesapla(artan(), 3, giris)).toEqual({ min: 31, max: ESIK_MUTLAK_MAX });
  });

  test('ortadaki seviye iki komşuya birden kısıtlanır (ters yönde)', () => {
    expect(esikSinirlariniHesapla(artan(), 1, giris)).toEqual({ min: 6, max: 29 });
    expect(esikSinirlariniHesapla(artan(), 2, giris)).toEqual({ min: 16, max: 44 });
  });

  test('sınırlar içindeki her değer ARTAN sıralamayı bozmaz', () => {
    const s = artan();
    const { min, max } = esikSinirlariniHesapla(s, 1, giris);
    for (const deger of [min, max, Math.floor((min + max) / 2)]) {
      const yeni = s.map((x, i) => (i === 1 ? sv(deger) : x));
      expect(esikSiralamasiGecerliMi(yeni, 'girisindenItibaren')).toBe(true);
    }
  });

  test('pencere tavanı giriş yönünde de uygulanır', () => {
    expect(
      esikSinirlariniHesapla(artan(), 3, { ...giris, pencereUzunluguDk: 400 }).max
    ).toBe(399);
  });

  test('yön verilmezse ÇIKIŞ yönü davranışı birebir korunur', () => {
    expect(esikSinirlariniHesapla(seviyeler(), 1)).toEqual(
      esikSinirlariniHesapla(seviyeler(), 1, { yon: 'cikisaDogru' })
    );
  });

  test('bozuk (ters) veride giriş yönünde de min > max üretilmez', () => {
    const bozuk = [sv(5), sv(40), sv(20), sv(45)];
    const sinir = esikSinirlariniHesapla(bozuk, 1, giris);
    expect(sinir.max).toBeGreaterThanOrEqual(sinir.min);
  });
});
