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
import { namazGunuHesapla, oncekiGunuAl } from '../../../domain/services/SeriHesaplayiciServisi';

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
      expect((sonuc.meta as any).condition).toBe(true);
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
      // Uretim "bugun"u namazGunuHesapla(now, gunBitisSaati='05:00') ile hesaplar (namaz
      // gunu = gun-bitis-saati offset'li). bugunuAl() (takvim gunu) gun-bitis-saatinden once
      // bir onceki gunu verir -> gun-siniri/timezone flakiligi (CI 04:13 UTC'de patladi).
      // Uretimle BIREBIR ayni hesaplayarak gun-siniri bagimsiz hale getir.
      const bugun = namazGunuHesapla(new Date(), '05:00');
      const sonuc = await store.dispatch(
        seriKontrolet({
          bugunNamazlar: tamNamazlar(bugun),
          dunNamazlar: null,
        })
      );

      // Thunk calismali (condition engellememeli) ve basariyla tamamlanmali
      expect((sonuc.meta as any).condition).not.toBe(true);
      expect(sonuc.type).toContain('fulfilled');

      // Verilen girdide (mevcutSeri=10, sonTamGun cok eski '2026-02-14',
      // bugun 5/5 tam, dun=null) seriHesapla "arada gun kacti & mevcutSeri>=7"
      // dalina girer (SeriHesaplayiciServisi.ts:384) ve TOPARLANMA modu baslatir.
      const guncelDurum = store.getState().seri.seriDurumu!;
      expect(guncelDurum.sonTamGun).toBe(bugun); // bugun tam gun olarak islendi
      expect(guncelDurum.toparlanmaDurumu).not.toBeNull(); // toparlanma basladi
      expect(guncelDurum.toparlanmaDurumu!.oncekiSeri).toBe(10); // onceki seri korundu
      expect(guncelDurum.toparlanmaDurumu!.tamamlananGun).toBe(1); // bugun ilk toparlanma gunu
      expect(guncelDurum.toparlanmaDurumu!.baslangicTarihi).toBe(bugun);

      // mevcutSeri toparlanma boyunca degismez; onceki seri toparlanmaDurumu'nda tutulur
      expect(guncelDurum.mevcutSeri).toBe(10);

      // Tam guncelleme persist edildi (no-op degil, gercek yazma)
      expect(mockLocalSeriDurumunuKaydet).toHaveBeenCalled();
      expect(mockLocalSeviyeDurumunuKaydet).toHaveBeenCalled();
    });

    test('yuklenmis puanlar degisiklik olmayan seriKontrolet sonrasi sifirlanmaz', async () => {
      // Kullanicinin mevcut puanlari var; sonTamGun'u bugune esitleyerek
      // seriHesapla'nin "gun zaten islendi" erken-donus dalini (SeriHesaplayiciServisi.ts:287)
      // deterministik tetikliyoruz. Boylece seriDegisti=false olur ve seriKontrolet
      // (seriSlice.ts:183-192) state'teki sayaclari AYNEN geri yazar -> hicbiri sifirlanmamali.
      // Uretimle ayni gun hesabi (namazGunuHesapla) -> gun-siniri bagimsiz.
      const bugun = namazGunuHesapla(new Date(), '05:00');
      const veriler = mockSeriVerileri();
      veriler.veri.seriDurumu.sonTamGun = bugun;
      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(veriler);
      mockLocalSeriDurumunuKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());

      // Puanlar dogru yuklenmis olmali (load echo)
      expect(store.getState().seri.seviyeDurumu?.toplamPuan).toBe(450);
      expect(store.getState().seri.toplamKilinanNamaz).toBe(50);
      expect(store.getState().seri.toparlanmaSayisi).toBe(2);
      expect(store.getState().seri.mukemmelGunSayisi).toBe(5);

      // Degisiklik olmayan bir seriKontrolet (bugun zaten islenmis) -> sayaclar korunmali
      const sonuc = await store.dispatch(
        seriKontrolet({
          bugunNamazlar: tamNamazlar(bugun),
          dunNamazlar: null,
        })
      );
      // Thunk gercekten calisti (condition engellemedi) ve fulfilled oldu
      expect((sonuc.meta as any).condition).not.toBe(true);
      expect(sonuc.type).toContain('fulfilled');

      const s = store.getState().seri;
      // KRITIK: degisiklik yok yolunda hicbir sayac sifirlanmamali / degismemeli
      expect(s.toplamKilinanNamaz).toBe(50);
      expect(s.toparlanmaSayisi).toBe(2);
      expect(s.mukemmelGunSayisi).toBe(5);
      expect(s.seviyeDurumu?.toplamPuan).toBe(450);
      // sonTamGun bugun olarak kalir (degismez), toparlanma baslatilmaz
      expect(s.seriDurumu?.sonTamGun).toBe(bugun);
      expect(s.seriDurumu?.toparlanmaDurumu).toBeNull();

      // Degisiklik olmadigi icin durum/seviye persist edilmemeli (gereksiz yazma yok)
      expect(mockLocalSeriDurumunuKaydet).not.toHaveBeenCalled();
      expect(mockLocalSeviyeDurumunuKaydet).not.toHaveBeenCalled();
    });
  });

  describe('namazKilindiPuanla condition guard', () => {
    test('seri verileri yuklenmeden namazKilindiPuanla calistirilamamali', async () => {
      const sonuc = await store.dispatch(
        namazKilindiPuanla({ namazSayisi: 1 })
      );

      // condition false dondurdugu icin thunk engellenmeli
      expect(sonuc.type).toContain('rejected');
      expect((sonuc.meta as any).condition).toBe(true);
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
      expect((sonuc.meta as any).condition).not.toBe(true);
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

  // ==================== seriKontrolet PAYLOAD -> STATE DOGRULUGU ====================
  describe('seriKontrolet payload state reducer dogrulugu', () => {
    /**
     * Yardimci: verileri yukle, ardindan SIFIRDAN bir seri kurarak
     * (mevcutSeri=0, sonTamGun=null) deterministik bir "yeni seri basladi" dali tetikle.
     * Boylece slice reducer'inin (seriKontrolet.fulfilled) payload'i state'e dogru yazdigi
     * gercek seriHesapla + tamGuncellemeyiYap sonucu uzerinden dogrulanir.
     */
    test('5/5 tam gunde mevcutSeri artar, mukemmelGunSayisi +1 olur ve seviye puani yansir', async () => {
      const veriler = mockSeriVerileri();
      // Sifirdan yeni seri: mevcutSeri=0 -> "yeni basladi" dali (SeriHesaplayiciServisi.ts:361)
      veriler.veri.seriDurumu.mevcutSeri = 0;
      veriler.veri.seriDurumu.enUzunSeri = 0;
      (veriler.veri.seriDurumu as any).sonTamGun = null;
      (veriler.veri.seriDurumu as any).seriBaslangici = null;
      veriler.veri.seriDurumu.toparlanmaDurumu = null;
      // Seviye sifirdan baslasin ki kazanilan puanin yansimasi net olculur
      veriler.veri.seviyeDurumu = {
        mevcutSeviye: 1,
        toplamPuan: 0,
        mevcutSeviyePuani: 0,
        sonrakiSeviyeKalanPuan: 100,
        rank: 'Mübtedi',
        rankIkonu: '🌙',
      };
      veriler.veri.mukemmelGunSayisi = 0;

      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(veriler);
      mockLocalSeriDurumunuKaydet.mockResolvedValue({ basarili: true });
      mockLocalRozetleriKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());

      // Uretimle birebir ayni gun hesabi -> gun-siniri/timezone bagimsiz
      const bugun = namazGunuHesapla(new Date(), '05:00');
      const sonuc = await store.dispatch(
        seriKontrolet({
          bugunNamazlar: tamNamazlar(bugun),
          dunNamazlar: null,
        })
      );

      expect((sonuc.meta as any).condition).not.toBe(true);
      expect(sonuc.type).toContain('fulfilled');

      const s = store.getState().seri;
      // mevcutSeri 0 -> 1 (yeni seri basladi); reducer payload'i state'e yazdi
      expect(s.seriDurumu!.mevcutSeri).toBe(1);
      expect(s.seriDurumu!.enUzunSeri).toBe(1);
      expect(s.seriDurumu!.sonTamGun).toBe(bugun);
      expect(s.seriDurumu!.seriBaslangici).toBe(bugun);
      expect(s.seriDurumu!.toparlanmaDurumu).toBeNull();

      // 5/5 tam gun -> mukemmelGunSayisi +1 (seriSlice.ts:202-206 dali)
      expect(s.mukemmelGunSayisi).toBe(1);
      expect(mockLocalMukemmelGunSayisiniArttir).toHaveBeenCalledTimes(1);
      // Toparlanma yok -> toparlanma sayaci artmamali
      expect(mockLocalToparlanmaSayisiniArttir).not.toHaveBeenCalled();

      // Kazanilan puan seviyeye yansidi: yeni seri=1 icin seriHesapla 10+1=11 puan verir.
      // tamGuncellemeyiYap rozet/seviye eklerse puan >=11 olur; en azindan artmis olmali.
      expect(s.seviyeDurumu!.toplamPuan).toBeGreaterThanOrEqual(11);

      // Reducer rozet detaylarini da turetmis olmali (bos degil)
      expect(s.rozetDetaylari.length).toBeGreaterThan(0);

      // Tam guncelleme persist edildi
      expect(mockLocalSeriDurumunuKaydet).toHaveBeenCalled();
      expect(mockLocalSeviyeDurumunuKaydet).toHaveBeenCalled();
    });

    test('toparlanma SON gununde toparlanmaBasarili dali calisir: seri kurtarilir, sayac artar, rekor guncellenir', async () => {
      // Uretimle ayni gun hesabi: bugun gun-bitis-saatine gore.
      const bugun = namazGunuHesapla(new Date(), '05:00');
      const dun = oncekiGunuAl(bugun);

      const veriler = mockSeriVerileri();
      // Toparlanmanin SON gunu: tamamlanan=4, hedef=5 -> bugun tam kilinca 5 olur ve kurtarir.
      // sonTamGun=dun (bugun degil) ki erken-donus (sonTamGun===bugun) tetiklenmesin.
      veriler.veri.seriDurumu.mevcutSeri = 0; // toparlanmada mevcutSeri 0 tutulur
      veriler.veri.seriDurumu.enUzunSeri = 15;
      veriler.veri.seriDurumu.sonTamGun = dun;
      veriler.veri.seriDurumu.seriBaslangici = '2026-01-01';
      (veriler.veri.seriDurumu as any).toparlanmaDurumu = {
        tamamlananGun: 4,
        baslangicTarihi: '2026-02-10',
        hedefGunSayisi: 5,
        oncekiSeri: 15,
      };
      veriler.veri.toparlanmaSayisi = 2;

      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(veriler);
      mockLocalSeriDurumunuKaydet.mockResolvedValue({ basarili: true });
      mockLocalRozetleriKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());
      expect(store.getState().seri.seriDurumu!.toparlanmaDurumu).not.toBeNull();

      const sonuc = await store.dispatch(
        seriKontrolet({
          bugunNamazlar: tamNamazlar(bugun),
          dunNamazlar: null,
        })
      );
      expect((sonuc.meta as any).condition).not.toBe(true);
      expect(sonuc.type).toContain('fulfilled');

      const s = store.getState().seri;
      // Toparlanma basarili: kurtarilan seri = oncekiSeri(15) + 1 (bugun) = 16
      expect(s.seriDurumu!.mevcutSeri).toBe(16);
      // Rekor guncellendi: max(15, 16) = 16
      expect(s.seriDurumu!.enUzunSeri).toBe(16);
      // Toparlanma bitti
      expect(s.seriDurumu!.toparlanmaDurumu).toBeNull();
      expect(s.seriDurumu!.sonTamGun).toBe(bugun);

      // toparlanmaBasarili dali (seriSlice.ts:196-199): sayac +1 ve persist cagrildi
      expect(s.toparlanmaSayisi).toBe(3);
      expect(mockLocalToparlanmaSayisiniArttir).toHaveBeenCalledTimes(1);

      // Bugun 5/5 tam -> mukemmel gun de artmali
      expect(mockLocalMukemmelGunSayisiniArttir).toHaveBeenCalledTimes(1);

      expect(mockLocalSeriDurumunuKaydet).toHaveBeenCalled();
    });
  });

  // ==================== namazKilindiPuanla SEVIYE ATLAMA + KUTLAMA ====================
  describe('namazKilindiPuanla seviye atlama ve kutlama kuyrugu', () => {
    test('seviye sinirini asan puanla seviyeAtlandi olur ve bekleyenKutlamalar kuyruga eklenir', async () => {
      // Yuklenen seviye: mevcutSeviye=3, toplamPuan=450. Seviye 4 esigi = 600 (SEVIYE_TANIMLARI).
      // namazSayisi=30 -> 30*5=150 puan -> 450+150=600 -> seviye 4 (Mürid). Atlama tetiklenir.
      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(mockSeriVerileri());
      mockLocalToplamKilinanNamaziKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());
      expect(store.getState().seri.seviyeDurumu!.mevcutSeviye).toBe(3);
      // Onceden kutlama kuyrugu bos olmali
      expect(store.getState().seri.bekleyenKutlamalar.length).toBe(0);

      const sonuc = await store.dispatch(
        namazKilindiPuanla({ namazSayisi: 30 })
      );
      expect((sonuc.meta as any).condition).not.toBe(true);
      expect(sonuc.type).toContain('fulfilled');

      const s = store.getState().seri;
      // Tam 600 puan -> seviye 4'e atladi (referans esik dogrulugu)
      expect(s.seviyeDurumu!.toplamPuan).toBe(600);
      expect(s.seviyeDurumu!.mevcutSeviye).toBe(4);
      expect(s.seviyeDurumu!.rank).toBe('Mürid');

      // seviyeAtlandi dali (seriSlice.ts:488-493): kutlama kuyruga eklendi
      expect(s.bekleyenKutlamalar.length).toBe(1);
      const kutlama = s.bekleyenKutlamalar[0];
      expect(kutlama.tip).toBe('seviye_atlandi');
      // Kutlama yeni seviyenin (Mürid) bilgisini tasimali
      expect((kutlama.ekstraVeri as any).seviye.seviye).toBe(4);
    });

    test('seviye atlatmayan kucuk puanda kutlama kuyruga eklenmez', async () => {
      mockLocalTumSeriVerileriniGetir.mockResolvedValueOnce(mockSeriVerileri());
      mockLocalToplamKilinanNamaziKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });

      await store.dispatch(seriVerileriniYukle());

      // namazSayisi=1 -> 5 puan -> 450+5=455 (<600), seviye 3'te kalir -> atlama yok
      await store.dispatch(namazKilindiPuanla({ namazSayisi: 1 }));

      const s = store.getState().seri;
      expect(s.seviyeDurumu!.toplamPuan).toBe(455);
      expect(s.seviyeDurumu!.mevcutSeviye).toBe(3);
      // Seviye atlanmadi -> kutlama kuyrugu bos kalmali
      expect(s.bekleyenKutlamalar.length).toBe(0);
    });
  });

  // ==================== ESZAMANLI (RACE) GUARD PENCERESI ====================
  describe('eszamanli dispatch guard penceresi', () => {
    test('seriVerileriniYukle pending iken eszamanli seriKontrolet/namazKilindiPuanla bloklanir', async () => {
      // Yukleme cozulmesini elimizde tutarak (sonYukleme hala null) GERCEK race penceresini simule et.
      let yuklemeyiCoz: (deger: ReturnType<typeof mockSeriVerileri>) => void;
      const yuklemePromise = new Promise<ReturnType<typeof mockSeriVerileri>>((resolve) => {
        yuklemeyiCoz = resolve;
      });
      mockLocalTumSeriVerileriniGetir.mockReturnValueOnce(yuklemePromise);
      mockLocalSeriDurumunuKaydet.mockResolvedValue({ basarili: true });
      mockLocalRozetleriKaydet.mockResolvedValue({ basarili: true });
      mockLocalSeviyeDurumunuKaydet.mockResolvedValue({ basarili: true });
      mockLocalToplamKilinanNamaziKaydet.mockResolvedValue({ basarili: true });

      // Yukleme henuz cozulmedi -> dispatch et ama bekleme
      const yuklemeDispatch = store.dispatch(seriVerileriniYukle());

      // sonYukleme hala null olmali (yukleme tamamlanmadi)
      expect(store.getState().seri.sonYukleme).toBeNull();

      const bugun = namazGunuHesapla(new Date(), '05:00');
      // Yukleme pending iken eszamanli iki islem dispatch et
      const [kontrolSonuc, puanSonuc] = await Promise.all([
        store.dispatch(
          seriKontrolet({ bugunNamazlar: tamNamazlar(bugun), dunNamazlar: null })
        ),
        store.dispatch(namazKilindiPuanla({ namazSayisi: 1 })),
      ]);

      // Guard ikisini de bloklamali (condition === true -> rejected, calismadi)
      expect((kontrolSonuc.meta as any).condition).toBe(true);
      expect(kontrolSonuc.type).toContain('rejected');
      expect((puanSonuc.meta as any).condition).toBe(true);
      expect(puanSonuc.type).toContain('rejected');

      // Bloklanan islemler hicbir yazma yapmamali
      expect(mockLocalSeriDurumunuKaydet).not.toHaveBeenCalled();
      expect(mockLocalToplamKilinanNamaziKaydet).not.toHaveBeenCalled();
      // State degismemis olmali
      expect(store.getState().seri.toplamKilinanNamaz).toBe(0);
      expect(store.getState().seri.seviyeDurumu).toBeNull();

      // Simdi yuklemeyi coz ve tamamla -> guard bundan sonra GECMELI
      yuklemeyiCoz!(mockSeriVerileri());
      await yuklemeDispatch;
      expect(store.getState().seri.sonYukleme).not.toBeNull();
    });
  });
});
