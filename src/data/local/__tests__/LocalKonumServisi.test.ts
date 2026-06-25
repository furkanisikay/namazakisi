/**
 * LocalKonumServisi — konum persistence DAVRANIŞ testleri
 *
 * Kapsanan davranışlar:
 * - Getir: veri yok → null ile başarılı; geçerli veri → parse; getItem fırlatırsa → {basarili:false}
 * - Kaydet: doğru anahtara doğru JSON yazar; setItem fırlatırsa → {basarili:false}
 * - Kısmi güncelleyiciler (koordinat/GPS/mod/il-ilçe): mevcut ayarları KORUYUP yalnız ilgili
 *   alanı değiştirir; kayıtlı veri yoksa VARSAYILAN üzerine uygular
 * - GPS: gpsAdres verilince sonGpsGuncellemesi yenilenir, null verilince ESKİsi korunur
 * - İl/ilçe: konumModu 'manuel'e çekilir + seciliSehirId = String(ilId)
 * - Temizle: removeItem çağrılır → veri kalmaz; hata yolu {basarili:false}
 * - VarMi: kayıt varken true, yokken false, hata olunca false
 */

import {
  localKonumAyarlariniGetir,
  localKonumAyarlariniKaydet,
  localKoordinatlariGuncelle,
  localGpsAdresiniGuncelle,
  localKonumModunuGuncelle,
  localIlIlceSeciminiGuncelle,
  localKonumVerileriniTemizle,
  localKonumVerisiVarMi,
  VARSAYILAN_KONUM_AYARLARI,
  type KonumAyarlari,
} from '../LocalKonumServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası closure dışına erişebilsin).
// mockFirlat* bayrakları catch dallarını davranışsal test etmeye olanak verir.
const mockStore = new Map<string, string>();
const mockHata = {
  getItem: false,
  setItem: false,
  removeItem: false,
};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => {
      if (mockHata.getItem) throw new Error('getItem patladi');
      return mockStore.has(k) ? mockStore.get(k)! : null;
    },
    setItem: async (k: string, v: string) => {
      if (mockHata.setItem) throw new Error('setItem patladi');
      mockStore.set(k, v);
    },
    removeItem: async (k: string) => {
      if (mockHata.removeItem) throw new Error('removeItem patladi');
      mockStore.delete(k);
    },
  },
}));

// Logger'ı sustur
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const KEY = DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI;

/** Diske yazılı ham JSON'u çözer (test assertion'ları için). */
const diskOku = (): KonumAyarlari | null => {
  const ham = mockStore.get(KEY);
  return ham ? (JSON.parse(ham) as KonumAyarlari) : null;
};

beforeEach(() => {
  mockStore.clear();
  mockHata.getItem = false;
  mockHata.setItem = false;
  mockHata.removeItem = false;
});

describe('localKonumAyarlariniGetir', () => {
  test('kayıtlı veri yokken null ile başarılı döner (slice varsayılan kullansın)', async () => {
    const y = await localKonumAyarlariniGetir();
    expect(y.basarili).toBe(true);
    expect(y.veri).toBeNull();
  });

  test('kayıtlı geçerli veriyi parse edip döner', async () => {
    const kayit: KonumAyarlari = {
      ...VARSAYILAN_KONUM_AYARLARI,
      seciliIlAdi: 'Ankara',
      seciliIlId: 6,
      konumModu: 'oto',
    };
    mockStore.set(KEY, JSON.stringify(kayit));

    const y = await localKonumAyarlariniGetir();
    expect(y.basarili).toBe(true);
    expect(y.veri?.seciliIlAdi).toBe('Ankara');
    expect(y.veri?.seciliIlId).toBe(6);
    expect(y.veri?.konumModu).toBe('oto');
  });

  test('AsyncStorage okuması fırlatırsa hata mesajıyla başarısız döner', async () => {
    mockHata.getItem = true;
    const y = await localKonumAyarlariniGetir();
    expect(y.basarili).toBe(false);
    expect(y.hata).toBe('getItem patladi');
  });
});

describe('localKonumAyarlariniKaydet', () => {
  test('ayarları doğru anahtara JSON olarak yazar', async () => {
    const ayarlar: KonumAyarlari = {
      ...VARSAYILAN_KONUM_AYARLARI,
      seciliIlAdi: 'Izmir',
      seciliIlId: 35,
    };
    const y = await localKonumAyarlariniKaydet(ayarlar);

    expect(y.basarili).toBe(true);
    expect(diskOku()?.seciliIlAdi).toBe('Izmir');
    expect(diskOku()?.seciliIlId).toBe(35);
  });

  test('yazma fırlatırsa başarısız döner ve diske yazılmaz', async () => {
    mockHata.setItem = true;
    const y = await localKonumAyarlariniKaydet(VARSAYILAN_KONUM_AYARLARI);

    expect(y.basarili).toBe(false);
    expect(y.hata).toBe('setItem patladi');
    expect(mockStore.has(KEY)).toBe(false);
  });
});

describe('localKoordinatlariGuncelle', () => {
  test('mevcut ayarları koruyup yalnız koordinatı değiştirir', async () => {
    const onceki: KonumAyarlari = {
      ...VARSAYILAN_KONUM_AYARLARI,
      seciliIlAdi: 'Bursa',
      seciliIlId: 16,
      konumModu: 'oto',
    };
    mockStore.set(KEY, JSON.stringify(onceki));

    const yeni = { lat: 40.1885, lng: 29.061 };
    const y = await localKoordinatlariGuncelle(yeni);

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.koordinatlar).toEqual(yeni);
    // diğer alanlar korunmalı
    expect(disk.seciliIlAdi).toBe('Bursa');
    expect(disk.seciliIlId).toBe(16);
    expect(disk.konumModu).toBe('oto');
  });

  test('kayıtlı veri yokken VARSAYILAN üzerine koordinatı uygular', async () => {
    const yeni = { lat: 1, lng: 2 };
    const y = await localKoordinatlariGuncelle(yeni);

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.koordinatlar).toEqual(yeni);
    expect(disk.seciliIlAdi).toBe(VARSAYILAN_KONUM_AYARLARI.seciliIlAdi);
  });
});

describe('localGpsAdresiniGuncelle', () => {
  test('gpsAdres verilince adresi yazar ve sonGpsGuncellemesi tarihini tazeler', async () => {
    const onceki: KonumAyarlari = {
      ...VARSAYILAN_KONUM_AYARLARI,
      sonGpsGuncellemesi: null,
    };
    mockStore.set(KEY, JSON.stringify(onceki));

    const adres = { semt: 'Kadikoy', ilce: 'Kadikoy', il: 'Istanbul' };
    const oncesi = Date.now();
    const y = await localGpsAdresiniGuncelle(adres);
    const sonrasi = Date.now();

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.gpsAdres).toEqual(adres);
    expect(disk.sonGpsGuncellemesi).not.toBeNull();
    const zaman = new Date(disk.sonGpsGuncellemesi!).getTime();
    expect(zaman).toBeGreaterThanOrEqual(oncesi);
    expect(zaman).toBeLessThanOrEqual(sonrasi);
  });

  test('gpsAdres null verilince adresi temizler ama eski sonGpsGuncellemesi korunur', async () => {
    const eskiZaman = '2026-01-15T10:00:00.000Z';
    const onceki: KonumAyarlari = {
      ...VARSAYILAN_KONUM_AYARLARI,
      gpsAdres: { semt: 'X', ilce: 'Y', il: 'Z' },
      sonGpsGuncellemesi: eskiZaman,
    };
    mockStore.set(KEY, JSON.stringify(onceki));

    const y = await localGpsAdresiniGuncelle(null);

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.gpsAdres).toBeNull();
    expect(disk.sonGpsGuncellemesi).toBe(eskiZaman);
  });
});

describe('localKonumModunuGuncelle', () => {
  test('yalnız konum modunu değiştirir, diğer alanları korur', async () => {
    const onceki: KonumAyarlari = {
      ...VARSAYILAN_KONUM_AYARLARI,
      konumModu: 'manuel',
      seciliIlAdi: 'Konya',
    };
    mockStore.set(KEY, JSON.stringify(onceki));

    const y = await localKonumModunuGuncelle('oto');

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.konumModu).toBe('oto');
    expect(disk.seciliIlAdi).toBe('Konya');
  });
});

describe('localIlIlceSeciminiGuncelle', () => {
  test('il/ilçe alanlarını yazar, modu manuele çeker, seciliSehirId = String(ilId)', async () => {
    // başlangıçta oto moddaki bir kayıt
    mockStore.set(
      KEY,
      JSON.stringify({ ...VARSAYILAN_KONUM_AYARLARI, konumModu: 'oto' })
    );

    const koord = { lat: 38.4237, lng: 27.1428 };
    const y = await localIlIlceSeciminiGuncelle(35, 'Izmir', 5, 'Bornova', koord);

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.konumModu).toBe('manuel');
    expect(disk.seciliIlId).toBe(35);
    expect(disk.seciliSehirId).toBe('35');
    expect(disk.seciliIlAdi).toBe('Izmir');
    expect(disk.seciliIlceId).toBe(5);
    expect(disk.seciliIlceAdi).toBe('Bornova');
    expect(disk.koordinatlar).toEqual(koord);
  });

  test('ilçe null geçilebilir (sadece il seçimi)', async () => {
    const y = await localIlIlceSeciminiGuncelle(
      6,
      'Ankara',
      null,
      '',
      { lat: 39.9334, lng: 32.8597 }
    );

    expect(y.basarili).toBe(true);
    const disk = diskOku()!;
    expect(disk.seciliIlceId).toBeNull();
    expect(disk.seciliIlceAdi).toBe('');
    expect(disk.seciliIlAdi).toBe('Ankara');
  });

  test('kayıt yazılamazsa başarısız döner', async () => {
    mockHata.setItem = true;
    const y = await localIlIlceSeciminiGuncelle(34, 'Istanbul', null, '', {
      lat: 41,
      lng: 28,
    });
    expect(y.basarili).toBe(false);
  });
});

describe('localKonumVerileriniTemizle', () => {
  test('kayıtlı veriyi siler ve başarılı döner', async () => {
    mockStore.set(KEY, JSON.stringify(VARSAYILAN_KONUM_AYARLARI));

    const y = await localKonumVerileriniTemizle();

    expect(y.basarili).toBe(true);
    expect(mockStore.has(KEY)).toBe(false);
  });

  test('silme fırlatırsa hata mesajıyla başarısız döner', async () => {
    mockStore.set(KEY, JSON.stringify(VARSAYILAN_KONUM_AYARLARI));
    mockHata.removeItem = true;

    const y = await localKonumVerileriniTemizle();

    expect(y.basarili).toBe(false);
    expect(y.hata).toBe('removeItem patladi');
    // veri silinmeden durur
    expect(mockStore.has(KEY)).toBe(true);
  });
});

describe('localKonumVerisiVarMi', () => {
  test('kayıt varken true döner', async () => {
    mockStore.set(KEY, JSON.stringify(VARSAYILAN_KONUM_AYARLARI));
    expect(await localKonumVerisiVarMi()).toBe(true);
  });

  test('kayıt yokken false döner', async () => {
    expect(await localKonumVerisiVarMi()).toBe(false);
  });

  test('okuma fırlatsa bile (sessizce) false döner', async () => {
    mockHata.getItem = true;
    expect(await localKonumVerisiVarMi()).toBe(false);
  });
});
