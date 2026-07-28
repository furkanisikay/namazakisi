/**
 * LocalCumaHatirlatmaServisi — cuma hatırlatma ayarı depolama DAVRANIŞ testleri
 *
 * Kapsanan davranışlar:
 * - getAyarlar: veri yokken varsayılan; bozuk kayıtta (null / "null" / sayı / dizi /
 *   kesik JSON / getItem hatası) ÇÖKMEDEN varsayılana döner
 * - oncedenDk normalizasyonu: sınır dışı (0, 5, 500), sayı olmayan (NaN, string,
 *   eksik) değerler güvenli aralığa (15–180) çekilir
 * - saveAyarlar: doğru anahtara normalize edilmiş JSON yazımı, true/false dönüş
 * - round-trip: yazılan değer aynen geri okunur
 */

import {
  LocalCumaHatirlatmaServisi,
  CumaHatirlatmaAyarlari,
  CUMA_ONCEDEN_MIN_DK,
  CUMA_ONCEDEN_MAX_DK,
} from '../LocalCumaHatirlatmaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası erişebilsin).
const mockStore = new Map<string, string>();
const mockGetItem = jest.fn(async (k: string) =>
  mockStore.has(k) ? mockStore.get(k)! : null
);
const mockSetItem = jest.fn(async (k: string, v: string) => {
  mockStore.set(k, v);
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (k: string) => mockGetItem(k),
    setItem: (k: string, v: string) => mockSetItem(k, v),
    removeItem: async (k: string) => {
      mockStore.delete(k);
    },
  },
}));

// Logger'ı sustur (hata yollarında gerçek log/timer testi kirletmesin)
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const KEY = DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI;

// Cuma herkese farz-ı ayn değil → varsayılan KAPALI.
const VARSAYILAN: CumaHatirlatmaAyarlari = { aktif: false, oncedenDk: 60 };

beforeEach(() => {
  mockStore.clear();
  mockGetItem.mockClear();
  mockSetItem.mockClear();
});

describe('LocalCumaHatirlatmaServisi.getAyarlar', () => {
  test('veri yokken kapalı + 60 dk varsayılanı döner', async () => {
    const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(ayarlar).toEqual(VARSAYILAN);
    expect(mockGetItem).toHaveBeenCalledWith(KEY);
  });

  test('kayıtlı geçerli ayarı doğru anahtardan okur', async () => {
    mockStore.set(KEY, JSON.stringify({ aktif: true, oncedenDk: 90 }));

    const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(ayarlar).toEqual({ aktif: true, oncedenDk: 90 });
  });

  test('aktif alanı yalnız gerçek true iken açıktır (truthy string açmaz)', async () => {
    mockStore.set(KEY, JSON.stringify({ aktif: 'evet', oncedenDk: 30 }));

    const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

    // Bozuk/eski bir kayıt yüzünden hatırlatma KENDİLİĞİNDEN açılmamalı.
    expect(ayarlar.aktif).toBe(false);
    expect(ayarlar.oncedenDk).toBe(30);
  });

  describe('bozuk disk kaydı ÇÖKMEDEN varsayılana döner', () => {
    const bozukKayitlar: Array<[string, string]> = [
      ['JSON null ("null" dizesi)', 'null'],
      ['sayı', '42'],
      ['dizi', '[1,2,3]'],
      ['boş dize', ''],
      ['kesik JSON', '{"aktif":true,"oncedenDk":'],
      ['tamamen bozuk metin', '{bozuk json'],
      ['JSON dize', '"aktif"'],
    ];

    test.each(bozukKayitlar)('%s → varsayılan', async (_ad, ham) => {
      mockStore.set(KEY, ham);

      const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

      expect(ayarlar).toEqual(VARSAYILAN);
    });
  });

  test('getItem fırlatırsa varsayılana düşer (asla reddetmez)', async () => {
    mockGetItem.mockImplementationOnce(async () => {
      throw new Error('disk hatası');
    });

    const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(ayarlar).toEqual(VARSAYILAN);
  });
});

describe('LocalCumaHatirlatmaServisi — oncedenDk normalizasyonu (okuma)', () => {
  // Sınır dışı / geçersiz değer planlamayı bozmasın: güvenli aralığa çekilir.
  const durumlar: Array<[string, unknown, number]> = [
    ['0 → alt sınır', 0, CUMA_ONCEDEN_MIN_DK],
    ['5 → alt sınır', 5, CUMA_ONCEDEN_MIN_DK],
    ['negatif → alt sınır', -30, CUMA_ONCEDEN_MIN_DK],
    ['500 → üst sınır', 500, CUMA_ONCEDEN_MAX_DK],
    ['alt sınırın kendisi korunur', CUMA_ONCEDEN_MIN_DK, CUMA_ONCEDEN_MIN_DK],
    ['üst sınırın kendisi korunur', CUMA_ONCEDEN_MAX_DK, CUMA_ONCEDEN_MAX_DK],
    ['ondalık değer yuvarlanır', 22.4, 22],
    ['string → varsayılan', '60', 60],
    ['null (NaN JSON\'da null olur) → varsayılan', null, 60],
    ['boolean → varsayılan', true, 60],
    ['nesne → varsayılan', { dk: 30 }, 60],
  ];

  test.each(durumlar)('%s', async (_ad, ham, beklenen) => {
    mockStore.set(KEY, JSON.stringify({ aktif: true, oncedenDk: ham }));

    const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(ayarlar.oncedenDk).toBe(beklenen);
  });

  test('oncedenDk hiç yoksa varsayılan 60 kullanılır', async () => {
    mockStore.set(KEY, JSON.stringify({ aktif: true }));

    const ayarlar = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(ayarlar).toEqual({ aktif: true, oncedenDk: 60 });
  });
});

describe('LocalCumaHatirlatmaServisi.saveAyarlar', () => {
  test('ayarı doğru anahtara JSON olarak yazar ve true döner', async () => {
    const ayarlar: CumaHatirlatmaAyarlari = { aktif: true, oncedenDk: 45 };

    const sonuc = await LocalCumaHatirlatmaServisi.saveAyarlar(ayarlar);

    expect(sonuc).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith(KEY, JSON.stringify(ayarlar));
    expect(JSON.parse(mockStore.get(KEY)!)).toEqual(ayarlar);
  });

  test('yazarken de normalize eder (sınır dışı değer diske sızmaz)', async () => {
    await LocalCumaHatirlatmaServisi.saveAyarlar({ aktif: true, oncedenDk: 999 });

    expect(JSON.parse(mockStore.get(KEY)!)).toEqual({
      aktif: true,
      oncedenDk: CUMA_ONCEDEN_MAX_DK,
    });
  });

  test('NaN gibi geçersiz süre diske varsayılan olarak yazılır', async () => {
    await LocalCumaHatirlatmaServisi.saveAyarlar({ aktif: true, oncedenDk: NaN });

    expect(JSON.parse(mockStore.get(KEY)!)).toEqual({ aktif: true, oncedenDk: 60 });
  });

  test('yazılan değer getAyarlar ile aynen geri okunur (round-trip)', async () => {
    const ayarlar: CumaHatirlatmaAyarlari = { aktif: true, oncedenDk: 30 };

    await LocalCumaHatirlatmaServisi.saveAyarlar(ayarlar);
    const okunan = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(okunan).toEqual(ayarlar);
  });

  test('sınır dışı yazım sonrası okuma da düzeltilmiş değeri verir (round-trip)', async () => {
    await LocalCumaHatirlatmaServisi.saveAyarlar({ aktif: false, oncedenDk: 0 });

    const okunan = await LocalCumaHatirlatmaServisi.getAyarlar();

    expect(okunan).toEqual({ aktif: false, oncedenDk: CUMA_ONCEDEN_MIN_DK });
  });

  test('setItem fırlatırsa false döner (fırlatmaz)', async () => {
    mockSetItem.mockImplementationOnce(async () => {
      throw new Error('disk dolu');
    });

    const sonuc = await LocalCumaHatirlatmaServisi.saveAyarlar(VARSAYILAN);

    expect(sonuc).toBe(false);
  });
});
