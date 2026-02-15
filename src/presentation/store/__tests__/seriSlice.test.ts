/**
 * seriSlice Testleri
 *
 * Race condition korumasi testleri:
 * - seriKontrolet, seri verileri yuklenmeden calistirilmamali
 * - namazKilindiPuanla, seri verileri yuklenmeden calistirilmamali
 * - seriVerileriniYukle sonrasi seriKontrolet dogru calismali
 */

import { configureStore } from '@reduxjs/toolkit';
import seriReducer, {
  seriVerileriniYukle,
  seriKontrolet,
  namazKilindiPuanla,
} from '../seriSlice';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { GunlukNamazlar } from '../../../core/types';

// ==================== MOCKLAR ====================

// LocalSeriServisi mock
const mockLocalTumSeriVerileriniGetir = jest.fn();
const mockLocalSeriDurumunuKaydet = jest.fn();
const mockLocalRozetleriKaydet = jest.fn();
const mockLocalSeviyeDurumunuKaydet = jest.fn();
const mockLocalToplamKilinanNamaziKaydet = jest.fn();
const mockLocalToparlanmaSayisiniArttir = jest.fn();
const mockLocalMukemmelGunSayisiniArttir = jest.fn();

jest.mock('../../../data/local/LocalSeriServisi', () => ({
  localTumSeriVerileriniGetir: (...args: any[]) => mockLocalTumSeriVerileriniGetir(...args),
  localSeriDurumunuKaydet: (...args: any[]) => mockLocalSeriDurumunuKaydet(...args),
  localRozetleriKaydet: (...args: any[]) => mockLocalRozetleriKaydet(...args),
  localSeviyeDurumunuKaydet: (...args: any[]) => mockLocalSeviyeDurumunuKaydet(...args),
  localToplamKilinanNamaziKaydet: (...args: any[]) => mockLocalToplamKilinanNamaziKaydet(...args),
  localToparlanmaSayisiniArttir: (...args: any[]) => mockLocalToparlanmaSayisiniArttir(...args),
  localMukemmelGunSayisiniArttir: (...args: any[]) => mockLocalMukemmelGunSayisiniArttir(...args),
  VARSAYILAN_OZEL_GUN_AYARLARI: {
    ozelGunModuAktif: false,
    aktifOzelGun: null,
    gecmisKayitlar: [],
  },
}));

// BildirimServisi mock
jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: {
    getInstance: jest.fn(() => ({
      bildirimPlanla: jest.fn(),
      bildirimIptalEt: jest.fn(),
    })),
  },
}));

// KonumYoneticiServisi mock
jest.mock('../../../domain/services/KonumYoneticiServisi', () => ({
  KonumYoneticiServisi: {
    getInstance: jest.fn(() => ({
      sonrakiGunImsakVaktiGetir: jest.fn(() => null),
    })),
  },
}));

// ==================== YARDIMCI ====================

function storeOlustur() {
  return configureStore({
    reducer: {
      seri: seriReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

const tamNamazlar = (tarih: string): GunlukNamazlar => ({
  tarih,
  namazlar: [
    { namazAdi: NamazAdi.Sabah, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Ogle, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Ikindi, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Aksam, tamamlandi: true, tarih },
    { namazAdi: NamazAdi.Yatsi, tamamlandi: true, tarih },
  ],
});

const mockSeriVerileri = () => ({
  basarili: true,
  veri: {
    seriDurumu: {
      mevcutSeri: 10,
      enUzunSeri: 15,
      sonTamGun: '2026-02-14',
      seriBaslangici: '2026-02-04',
      toparlanmaDurumu: null,
      dondurulduMu: false,
      dondurulmaTarihi: null,
      sonGuncelleme: new Date().toISOString(),
    },
    rozetler: [
      { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-02-10T00:00:00.000Z' },
    ],
    seviyeDurumu: {
      mevcutSeviye: 3,
      toplamPuan: 450,
      mevcutSeviyePuani: 150,
      sonrakiSeviyeKalanPuan: 150,
      rank: 'Salik',
      rankIkonu: '🌟',
    },
    ayarlar: {
      tamGunEsigi: 5,
      gunBitisSaati: '05:00',
      bildirimlerAktif: true,
      toparlanmaGunSayisi: 5,
      gunSonuBildirimAktif: true,
      gunSonuBildirimDk: 60,
      gunSonuBildirimModu: 'otomatik',
      bildirimImsakOncesiDk: 30,
      bildirimGunSecimi: 'ertesiGun',
      bildirimSaati: 4,
      bildirimDakikasi: 0,
    },
    ozelGunAyarlari: {
      ozelGunModuAktif: false,
      aktifOzelGun: null,
      gecmisKayitlar: [],
    },
    toplamKilinanNamaz: 50,
    toparlanmaSayisi: 2,
    mukemmelGunSayisi: 5,
  },
});

// ==================== TESTLER ====================

describe('seriSlice - Race Condition Korumasi', () => {
  let store: ReturnType<typeof storeOlustur>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = storeOlustur();
  });

  describe('seriKontrolet condition guard', () => {
    test('seri verileri yuklenmeden seriKontrolet calistirilamamali', async () => {
      // sonYukleme null - veriler henuz yuklenmedi
      const bugun = new Date().toISOString().split('T')[0];

      const sonuc = await store.dispatch(
        seriKontrolet({
          bugunNamazlar: tamNamazlar(bugun),
          dunNamazlar: null,
        })
      );

      // condition false dondurdugu icin thunk engellenmeli (meta.condition === true)
      expect(sonuc.type).toContain('rejected');
      expect(sonuc.meta.condition).toBe(true);
      // State degismemeli
      expect(store.getState().seri.seviyeDurumu).toBeNull();
      expect(store.getState().seri.toplamKilinanNamaz).toBe(0);
      // AsyncStorage'a yazilmamali
      expect(mockLocalSeriDurumunuKaydet).not.toHaveBeenCalled();
      expect(mockLocalSeviyeDurumunuKaydet).not.toHaveBeenCalled();
    });

    test('seri verileri yuklendikten sonra seriKontrolet calistirilabilmeli', async () => {
      // Once verileri yukle
      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(mockSeriVerileri());
      mockLocalSeriDurumunuKaydet.mockResolvedValue({ basarili: true });
      mockLocalRozetleriKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());

      // sonYukleme artik dolu olmali
      expect(store.getState().seri.sonYukleme).not.toBeNull();
      expect(store.getState().seri.seviyeDurumu?.toplamPuan).toBe(450);

      // Simdi seriKontrolet calistirilabilmeli
      const bugun = new Date().toISOString().split('T')[0];
      const sonuc = await store.dispatch(
        seriKontrolet({
          bugunNamazlar: tamNamazlar(bugun),
          dunNamazlar: null,
        })
      );

      // Thunk calismali (condition engellememeli)
      expect(sonuc.meta.condition).not.toBe(true);
    });

    test('seri verileri yuklenmeden puanlar sifirlanmamali', async () => {
      // Seri verilerini yukle (kullanicinin mevcut puanlari var)
      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(mockSeriVerileri());

      await store.dispatch(seriVerileriniYukle());

      // Puanlar dogru yuklenmis olmali
      expect(store.getState().seri.seviyeDurumu?.toplamPuan).toBe(450);
      expect(store.getState().seri.toplamKilinanNamaz).toBe(50);
      expect(store.getState().seri.toparlanmaSayisi).toBe(2);
      expect(store.getState().seri.mukemmelGunSayisi).toBe(5);
    });
  });

  describe('namazKilindiPuanla condition guard', () => {
    test('seri verileri yuklenmeden namazKilindiPuanla calistirilamamali', async () => {
      const sonuc = await store.dispatch(
        namazKilindiPuanla({ namazSayisi: 1 })
      );

      // condition false dondurdugu icin thunk engellenmeli
      expect(sonuc.type).toContain('rejected');
      expect(sonuc.meta.condition).toBe(true);
      // State degismemeli - toplamKilinanNamaz 0 kalmali
      expect(store.getState().seri.toplamKilinanNamaz).toBe(0);
      // AsyncStorage'a yazilmamali
      expect(mockLocalToplamKilinanNamaziKaydet).not.toHaveBeenCalled();
      expect(mockLocalSeviyeDurumunuKaydet).not.toHaveBeenCalled();
    });

    test('seri verileri yuklendikten sonra namazKilindiPuanla thunk calismali ve state guncellenmeli', async () => {
      // Once verileri yukle
      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(mockSeriVerileri());
      mockLocalToplamKilinanNamaziKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());

      // sonYukleme set olmali - condition guard gecmeli
      const oncekiSeriState = store.getState().seri;
      expect(oncekiSeriState.sonYukleme).not.toBeNull();

      const oncekiToplam = oncekiSeriState.toplamKilinanNamaz;
      const oncekiSeviyeDurumu = oncekiSeriState.seviyeDurumu;

      const namazSayisi = 1;
      const sonuc = await store.dispatch(
        namazKilindiPuanla({ namazSayisi })
      );

      // Thunk condition tarafindan engellenmemeli (condition gecmeli)
      expect(sonuc.meta.condition).not.toBe(true);
      // Thunk basariyla tamamlanmali
      expect(sonuc.type).toContain('fulfilled');

      const guncelSeriState = store.getState().seri;
      // toplamKilinanNamaz artmali
      expect(guncelSeriState.toplamKilinanNamaz).toBe(oncekiToplam + namazSayisi);
      // seviyeDurumu guncellenmis olmali (puan artmali)
      expect(guncelSeriState.seviyeDurumu).not.toEqual(oncekiSeviyeDurumu);
      expect(guncelSeriState.seviyeDurumu!.toplamPuan).toBeGreaterThan(oncekiSeviyeDurumu!.toplamPuan);

      // AsyncStorage/persistence cagrilmis olmali
      expect(mockLocalToplamKilinanNamaziKaydet).toHaveBeenCalled();
      expect(mockLocalSeviyeDurumunuKaydet).toHaveBeenCalled();
    });
  });
});
