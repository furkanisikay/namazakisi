/**
 * LocalVakitBildirimServisi — vakit bildirim ayarları depolama DAVRANIŞ testleri
 *
 * Kapsanan davranışlar:
 * - getAyarlar: veri yokken varsayılan, geçerli okuma, eksik alan migrasyonu
 *   (varsayılanla birleştirme), bozuk JSON dayanıklılığı (varsayılana düşer, fırlatmaz)
 * - saveAyarlar: doğru anahtar+değer (JSON) yazımı, true/false dönüş, hata yolu
 * - updateVakitAyar: tek alan güncelleme + kalıcılık, dönen nesne, hata yolu null
 */

import {
  LocalVakitBildirimServisi,
  VakitBildirimAyarlari,
} from '../LocalVakitBildirimServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası erişebilsin).
// getItem/setItem jest.fn ile sarılı → testte mockImplementationOnce ile hata enjekte edilebilir.
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

const KEY = DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI;

const VARSAYILAN: VakitBildirimAyarlari = {
  imsak: false,
  ogle: false,
  ikindi: false,
  aksam: false,
  yatsi: false,
};

beforeEach(() => {
  mockStore.clear();
  mockGetItem.mockClear();
  mockSetItem.mockClear();
});

describe('LocalVakitBildirimServisi.getAyarlar', () => {
  test('veri yokken tüm vakitler kapalı varsayılan döner', async () => {
    const ayarlar = await LocalVakitBildirimServisi.getAyarlar();
    expect(ayarlar).toEqual(VARSAYILAN);
  });

  test('kayıtlı geçerli ayarları doğru anahtardan okur', async () => {
    const kayitli: VakitBildirimAyarlari = {
      imsak: true,
      ogle: false,
      ikindi: true,
      aksam: false,
      yatsi: true,
    };
    mockStore.set(KEY, JSON.stringify(kayitli));

    const ayarlar = await LocalVakitBildirimServisi.getAyarlar();

    expect(ayarlar).toEqual(kayitli);
    expect(mockGetItem).toHaveBeenCalledWith(KEY);
  });

  test('eksik alanlı eski kayıtta eksikler varsayılanla (false) tamamlanır', async () => {
    // Migrasyon davranışı: sadece imsak yazılmış eski biçim
    mockStore.set(KEY, JSON.stringify({ imsak: true }));

    const ayarlar = await LocalVakitBildirimServisi.getAyarlar();

    expect(ayarlar).toEqual({
      imsak: true,
      ogle: false,
      ikindi: false,
      aksam: false,
      yatsi: false,
    });
  });

  test('bozuk JSON varsa fırlatmaz, varsayılana düşer', async () => {
    mockStore.set(KEY, '{bozuk json');

    const ayarlar = await LocalVakitBildirimServisi.getAyarlar();

    expect(ayarlar).toEqual(VARSAYILAN);
  });

  test('getItem fırlatırsa varsayılana düşer (asla reddetmez)', async () => {
    mockGetItem.mockImplementationOnce(async () => {
      throw new Error('disk hatası');
    });

    const ayarlar = await LocalVakitBildirimServisi.getAyarlar();

    expect(ayarlar).toEqual(VARSAYILAN);
  });
});

describe('LocalVakitBildirimServisi.saveAyarlar', () => {
  test('ayarları doğru anahtara JSON olarak yazar ve true döner', async () => {
    const ayarlar: VakitBildirimAyarlari = {
      imsak: true,
      ogle: true,
      ikindi: false,
      aksam: true,
      yatsi: false,
    };

    const sonuc = await LocalVakitBildirimServisi.saveAyarlar(ayarlar);

    expect(sonuc).toBe(true);
    expect(mockSetItem).toHaveBeenCalledWith(KEY, JSON.stringify(ayarlar));
    // Disk içeriği geri okunabilir olmalı
    expect(JSON.parse(mockStore.get(KEY)!)).toEqual(ayarlar);
  });

  test('yazılan değer getAyarlar ile aynen geri okunur (round-trip)', async () => {
    const ayarlar: VakitBildirimAyarlari = {
      imsak: false,
      ogle: true,
      ikindi: true,
      aksam: false,
      yatsi: true,
    };

    await LocalVakitBildirimServisi.saveAyarlar(ayarlar);
    const okunan = await LocalVakitBildirimServisi.getAyarlar();

    expect(okunan).toEqual(ayarlar);
  });

  test('setItem fırlatırsa false döner (fırlatmaz)', async () => {
    mockSetItem.mockImplementationOnce(async () => {
      throw new Error('disk dolu');
    });

    const sonuc = await LocalVakitBildirimServisi.saveAyarlar(VARSAYILAN);

    expect(sonuc).toBe(false);
  });
});

describe('LocalVakitBildirimServisi.updateVakitAyar', () => {
  test('tek vakti açar, diğerlerini korur ve güncel nesneyi döner', async () => {
    // Başlangıç: yatsi açık
    mockStore.set(
      KEY,
      JSON.stringify({ ...VARSAYILAN, yatsi: true })
    );

    const sonuc = await LocalVakitBildirimServisi.updateVakitAyar('ogle', true);

    expect(sonuc).toEqual({ ...VARSAYILAN, yatsi: true, ogle: true });
  });

  test('güncellemeyi diske kalıcı yazar', async () => {
    await LocalVakitBildirimServisi.updateVakitAyar('ikindi', true);

    const diskten = await LocalVakitBildirimServisi.getAyarlar();
    expect(diskten.ikindi).toBe(true);
    // Yazma doğru anahtara gitti
    expect(mockSetItem).toHaveBeenCalledWith(
      KEY,
      JSON.stringify({ ...VARSAYILAN, ikindi: true })
    );
  });

  test('mevcut açık bir vakti kapatabilir', async () => {
    mockStore.set(KEY, JSON.stringify({ ...VARSAYILAN, imsak: true }));

    const sonuc = await LocalVakitBildirimServisi.updateVakitAyar('imsak', false);

    expect(sonuc).toEqual(VARSAYILAN);
  });

  test('saveAyarlar başarısız olsa bile güncel nesneyi döner (kayıt yutulmaz)', async () => {
    // updateVakitAyar saveAyarlar dönüşünü beklemez; nesneyi yine de döner
    mockSetItem.mockImplementationOnce(async () => {
      throw new Error('disk hatası');
    });

    const sonuc = await LocalVakitBildirimServisi.updateVakitAyar('aksam', true);

    expect(sonuc).toEqual({ ...VARSAYILAN, aksam: true });
  });
});
