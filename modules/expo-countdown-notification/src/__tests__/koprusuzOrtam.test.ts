/**
 * NOBETCI — NATIVE MODUL YOKKEN KOPRU COKMEZ (iOS acilis cokmesi).
 *
 * `expo-module.config.json` yalniz `android` platformunu tanimlar; iOS'ta native
 * taraf YOKTUR. Kopru eskiden modul yuklenirken `requireNativeModule` cagiriyordu
 * ve o fonksiyon modul bulunamayinca FIRLATIR → bu dosyayi import eden herhangi
 * bir modul (App.tsx zinciri `ArkaplanMuhafizServisi` uzerinden buraya baglanir)
 * iOS'ta uygulamayi ACILISTA COKERTIRDI. Fonksiyonlarin icindeki `Platform.OS`
 * kapilari ise yaramaz: cokme kapilar hic calismadan, import aninda olur.
 *
 * Bu suite iki seyi birden kanitlar:
 *   1. Kopruyu import etmek native modul yokken FIRLATMAZ.
 *   2. Disa aktarilan 14 fonksiyonun hicbiri cagrilinca firlatmaz ve hepsi
 *      guvenli varsayilan doner.
 *
 * IKINCI DURUM KASITLI: `Platform.OS === 'android'` iken de modul `null`
 * olabilir (kopru kurulmamis bir build). Kapilar bu yuzden platformun YANINDA
 * modulun varligini da kontrol eder — iki savunma birlikte.
 */

// Native modul YOK: `requireOptionalNativeModule` null doner (firlatmaz).
jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: () => null,
}));

const mockPlatformDurumu = { OS: 'ios' };
jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformDurumu.OS;
    },
  },
}));

import * as kopru from '../index';

/** Cagrildiginda firlatmamasi gereken senkron fonksiyonlar. */
const SENKRON_CAGRILAR: { ad: string; cagir: () => void }[] = [
  {
    ad: 'startCountdown',
    cagir: () =>
      kopru.startCountdown({
        id: 'x',
        targetTimeMs: 1_800_000_000_000,
        title: 'b',
        bodyTemplate: '{time}',
        channelId: 'k',
      }),
  },
  { ad: 'stopCountdown', cagir: () => kopru.stopCountdown('x') },
  { ad: 'stopAll', cagir: () => kopru.stopAll() },
  { ad: 'planlaAnons', cagir: () => kopru.planlaAnons('x', 1_800_000_000_000, 'metin') },
  { ad: 'iptalEtAnons', cagir: () => kopru.iptalEtAnons('x') },
  { ad: 'iptalEtTumAnonslar', cagir: () => kopru.iptalEtTumAnonslar() },
];

describe('Kopru — native modul YOK (iOS)', () => {
  beforeEach(() => {
    mockPlatformDurumu.OS = 'ios';
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('modulu import etmek firlatmaz (ACILIS COKMESI NOBETCISI)', () => {
    // Import zaten dosya tepesinde gerceklesti; buraya gelebilmek kanittir.
    expect(typeof kopru.planlaAnons).toBe('function');
  });

  test.each(SENKRON_CAGRILAR.map((c) => [c.ad, c.cagir] as const))(
    '%s firlatmaz',
    (_ad, cagir) => {
      expect(() => cagir()).not.toThrow();
    }
  );

  test('trDestekleniyorMu false doner — "bilinmiyor" degil, sorgulanamadi', async () => {
    await expect(kopru.trDestekleniyorMu()).resolves.toBe(false);
  });

  test('sesSec null doner (secici acilamaz)', async () => {
    await expect(kopru.sesSec(null, 'Ses secin')).resolves.toBeNull();
  });

  test('sesAdiAl bos dize doner', async () => {
    await expect(kopru.sesAdiAl('content://ses/1')).resolves.toBe('');
  });

  test('onizlemeCaliyorMu false doner', async () => {
    await expect(kopru.onizlemeCaliyorMu()).resolves.toBe(false);
  });

  test('ses onizleme ve kanal fonksiyonlari firlatmaz', async () => {
    await expect(kopru.sesiOnizle('content://ses/1')).resolves.toBeUndefined();
    await expect(kopru.onizlemeyiDurdur()).resolves.toBeUndefined();
    await expect(
      kopru.muhafizKanaliniGarantile('muhafiz_ab12', 'Muhafiz', 'aciklama', null, false, false)
    ).resolves.toBeUndefined();
    await expect(kopru.muhafizKanallariniTemizle(['muhafiz'])).resolves.toBeUndefined();
  });
});

describe('Kopru — Android ama native modul YOK (ikinci savunma)', () => {
  beforeEach(() => {
    mockPlatformDurumu.OS = 'android';
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(SENKRON_CAGRILAR.map((c) => [c.ad, c.cagir] as const))(
    '%s platform kapisi GECERKEN de firlatmaz',
    (_ad, cagir) => {
      expect(() => cagir()).not.toThrow();
    }
  );

  test('async fonksiyonlar guvenli varsayilanla doner', async () => {
    await expect(kopru.trDestekleniyorMu()).resolves.toBe(false);
    await expect(kopru.sesSec(null, 'Ses secin')).resolves.toBeNull();
    await expect(kopru.sesAdiAl('content://ses/1')).resolves.toBe('');
    await expect(kopru.onizlemeCaliyorMu()).resolves.toBe(false);
  });
});
