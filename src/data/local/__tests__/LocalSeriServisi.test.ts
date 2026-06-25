/**
 * LocalSeriServisi veri migrasyonu testleri
 *
 * Eski versiyondan gelen verilerin dogru sekilde migrate edilmesini test eder.
 * - SeviyeDurumu: rank ve rankIkonu eksik olabilir
 * - SeriDurumu: dondurulduMu ve dondurulmaTarihi eksik olabilir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { VARSAYILAN_SERI_AYARLARI } from '../../../core/types/SeriTipleri';
import type {
  SeriDurumu,
  SeriAyarlari,
  KullaniciRozeti,
  SeviyeDurumu,
  OzelGunAyarlari,
} from '../../../core/types/SeriTipleri';
import {
  localSeviyeDurumunuGetir,
  localSeriDurumunuGetir,
  localSeriDurumunuKaydet,
  localRozetleriGetir,
  localRozetleriKaydet,
  localSeviyeDurumunuKaydet,
  localSeriAyarlariniGetir,
  localSeriAyarlariniKaydet,
  localOzelGunAyarlariniGetir,
  localOzelGunAyarlariniKaydet,
  VARSAYILAN_OZEL_GUN_AYARLARI,
  localToplamKilinanNamaziGetir,
  localToplamKilinanNamaziKaydet,
  localToplamKilinanNamaziArttir,
  localToparlanmaSayisiniGetir,
  localToparlanmaSayisiniArttir,
  localMukemmelGunSayisiniGetir,
  localMukemmelGunSayisiniArttir,
  localMukemmelGunSayisiniKaydet,
  localBonusPuaniGetir,
  localBonusPuaniKaydet,
  localTumSeriVerileriniGetir,
  localTumSeriVerileriniTemizle,
} from '../LocalSeriServisi';

describe('LocalSeriServisi - Veri Migrasyonu', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('localSeviyeDurumunuGetir migrasyonu', () => {
    test('rank ve rankIkonu eksik olan eski veriyi migrate etmeli', async () => {
      // Eski versiyondan kalan veri (rank ve rankIkonu yok)
      const eskiVeri = {
        mevcutSeviye: 3,
        toplamPuan: 450,
        mevcutSeviyePuani: 150,
        sonrakiSeviyeKalanPuan: 150,
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
        JSON.stringify(eskiVeri)
      );

      const sonuc = await localSeviyeDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toBeDefined();
      // Puanlar korunmali
      expect(sonuc.veri!.toplamPuan).toBe(450);
      expect(sonuc.veri!.mevcutSeviye).toBe(3);
      // Eksik alanlar 450 puanin GERCEK seviye karsiligi (seviye 3 = Salik)
      // ile doldurulmali. Sadece "bos degil" demek migrasyon yanlis rank
      // atarsa regresyonu gizlerdi; bu yuzden kesin referans deger bekleriz.
      // 450 puan: minPuan esikleri [0,100,300,600] icin seviye 3 (Salik / 🌟).
      expect(sonuc.veri!.rank).toBe('Sâlik');
      expect(sonuc.veri!.rankIkonu).toBe('🌟');
    });

    test('seviye SINIR puanlarinda dogru rank/ikon turetmeli (off-by-one yakalar)', async () => {
      // SEVIYE_TANIMLARI minPuan esikleri ve referans rank/ikon karsiliklari.
      // seviyeHesapla "toplamPuan >= minPuan" mantigi kullaniyor; bu yuzden
      // her esik degeri (X) o seviyeye, esigin bir altı (X-1) bir onceki
      // seviyeye dusmeli. Boylece bir aralik eslemesi kayarsa (off-by-one)
      // veya bir rank metni/ikonu degisirse migrasyon sessizce bozulmaz.
      const senaryolar: Array<{
        puan: number;
        rank: string;
        ikon: string;
      }> = [
        { puan: 0, rank: 'Mübtedi', ikon: '🌙' },
        { puan: 99, rank: 'Mübtedi', ikon: '🌙' }, // 100'un bir altı -> hala seviye 1
        { puan: 100, rank: 'Tâlip', ikon: '⭐' },
        { puan: 299, rank: 'Tâlip', ikon: '⭐' }, // 300'un bir altı
        { puan: 300, rank: 'Sâlik', ikon: '🌟' },
        { puan: 600, rank: 'Mürid', ikon: '💫' },
        { puan: 1000, rank: 'Ârif', ikon: '✨' },
        { puan: 1500, rank: 'Hâfız', ikon: '🏆' },
        { puan: 2500, rank: 'Kâmil', ikon: '👑' },
      ];

      for (const { puan, rank, ikon } of senaryolar) {
        await AsyncStorage.clear();
        // rank/rankIkonu hic yok -> migrasyon puandan turetmeli
        await AsyncStorage.setItem(
          DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
          JSON.stringify({
            mevcutSeviye: 1,
            toplamPuan: puan,
            mevcutSeviyePuani: 0,
            sonrakiSeviyeKalanPuan: 0,
          })
        );

        const sonuc = await localSeviyeDurumunuGetir();

        expect(sonuc.basarili).toBe(true);
        expect(sonuc.veri!.rank).toBe(rank);
        expect(sonuc.veri!.rankIkonu).toBe(ikon);
      }
    });

    test('kismi migrasyon: rank VAR ama rankIkonu YOK iken sadece eksik ikon doldurulmali', async () => {
      // Uretim satir 141: "!rank || !rankIkonu" OR kosulu; satir 143-144
      // her alani AYRI doldurur. Var olan rank EZILMEMELI, sadece eksik
      // rankIkonu puandan (450 -> seviye 3 = Sâlik/🌟) turetilmeli.
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
        JSON.stringify({
          mevcutSeviye: 3,
          toplamPuan: 450,
          mevcutSeviyePuani: 150,
          sonrakiSeviyeKalanPuan: 150,
          rank: 'Kendi Rankim', // bilincli olarak resmi rank degil
          // rankIkonu yok
        })
      );

      const sonuc = await localSeviyeDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      // Var olan rank korunmali (puandan turetilen 'Sâlik' ile EZILMEMELI)
      expect(sonuc.veri!.rank).toBe('Kendi Rankim');
      // Eksik ikon 450 puanin karsiligi olan seviye 3 ikonu ile doldurulmali
      expect(sonuc.veri!.rankIkonu).toBe('🌟');
    });

    test('kismi migrasyon: rankIkonu VAR ama rank YOK iken sadece eksik rank doldurulmali', async () => {
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
        JSON.stringify({
          mevcutSeviye: 3,
          toplamPuan: 450,
          mevcutSeviyePuani: 150,
          sonrakiSeviyeKalanPuan: 150,
          // rank yok
          rankIkonu: '🎯', // bilincli olarak resmi ikon degil
        })
      );

      const sonuc = await localSeviyeDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      // Eksik rank 450 puanin karsiligi olan seviye 3 rank'i ile doldurulmali
      expect(sonuc.veri!.rank).toBe('Sâlik');
      // Var olan ikon korunmali (puandan turetilen '🌟' ile EZILMEMELI)
      expect(sonuc.veri!.rankIkonu).toBe('🎯');
    });

    test('bozuk JSON oldugunda basarili:false ve hata dondurmeli (cokmemeli)', async () => {
      // Uretim catch blogu (satir 153-158): JSON.parse firlatirsa
      // basarili:false + hata donmeli; kullanicinin seviye ekrani cokmemeli.
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
        '{bozuk json degil}'
      );

      const sonuc = await localSeviyeDurumunuGetir();

      expect(sonuc.basarili).toBe(false);
      expect(sonuc.veri).toBeUndefined();
      expect(typeof sonuc.hata).toBe('string');
      expect(sonuc.hata!.length).toBeGreaterThan(0);
    });

    test('rank ve rankIkonu olan yeni veriyi degistirmemeli', async () => {
      const yeniVeri = {
        mevcutSeviye: 3,
        toplamPuan: 450,
        mevcutSeviyePuani: 150,
        sonrakiSeviyeKalanPuan: 150,
        rank: 'Salik',
        rankIkonu: '🌟',
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SEVIYE_DURUMU,
        JSON.stringify(yeniVeri)
      );

      const sonuc = await localSeviyeDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri!.rank).toBe('Salik');
      expect(sonuc.veri!.rankIkonu).toBe('🌟');
      expect(sonuc.veri!.toplamPuan).toBe(450);
    });

    test('veri yoksa bos seviye durumu dondurmeli', async () => {
      const sonuc = await localSeviyeDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toBeDefined();
      expect(sonuc.veri!.toplamPuan).toBe(0);
      expect(sonuc.veri!.mevcutSeviye).toBe(1);
      expect(sonuc.veri!.rank).toBeDefined();
      expect(sonuc.veri!.rankIkonu).toBeDefined();
    });
  });

  describe('localSeriDurumunuGetir migrasyonu', () => {
    test('dondurulduMu ve dondurulmaTarihi eksik olan eski veriyi migrate etmeli', async () => {
      // Eski versiyondan kalan veri
      const eskiVeri = {
        mevcutSeri: 10,
        enUzunSeri: 15,
        sonTamGun: '2026-02-14',
        seriBaslangici: '2026-02-04',
        toparlanmaDurumu: null,
        sonGuncelleme: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
        JSON.stringify(eskiVeri)
      );

      const sonuc = await localSeriDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toBeDefined();
      // Eski veriler korunmali
      expect(sonuc.veri!.mevcutSeri).toBe(10);
      expect(sonuc.veri!.enUzunSeri).toBe(15);
      // Eksik alanlar varsayilan degerlerle doldurulmali
      expect(sonuc.veri!.dondurulduMu).toBe(false);
      expect(sonuc.veri!.dondurulmaTarihi).toBeNull();
    });

    test('migrasyonda tarih alanlarini (sonTamGun, seriBaslangici) aynen korumali', async () => {
      // dondurulduMu/dondurulmaTarihi doldurulurken seri/streak mantigi icin
      // kritik olan tarih alanlari (sonTamGun = serinin son tam gunu,
      // seriBaslangici = serinin baslangic tarihi) DEGISMEDEN gecmeli.
      // Bu alanlar bozulursa seri devamlilik kontrolu (sonTamGun === dun)
      // yanlis calisir ve kullanicinin serisi sessizce kopar/atlar.
      const eskiVeri = {
        mevcutSeri: 10,
        enUzunSeri: 15,
        sonTamGun: '2026-02-14',
        seriBaslangici: '2026-02-04',
        toparlanmaDurumu: null,
        sonGuncelleme: new Date().toISOString(),
        // dondurulduMu / dondurulmaTarihi yok -> migrasyon doldurmali
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
        JSON.stringify(eskiVeri)
      );

      const sonuc = await localSeriDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      // Migrasyon eksik alanlari doldururken tarih alanlarini bozmamali
      expect(sonuc.veri!.sonTamGun).toBe('2026-02-14');
      expect(sonuc.veri!.seriBaslangici).toBe('2026-02-04');
      // Eklenen varsayilanlar dogru
      expect(sonuc.veri!.dondurulduMu).toBe(false);
      expect(sonuc.veri!.dondurulmaTarihi).toBeNull();
    });

    test('dondurulduMu zaten false ise EZILMEMELI (undefined ile false ayrimi)', async () => {
      // Uretim "if (parsed.dondurulduMu === undefined)" kontrolu kullaniyor;
      // tanimli false bir deger bu kosula GIRMEMELI. Yani migrasyon false'u
      // varsayilan false ile ezmek yerine oldugu gibi birakmali. undefined
      // ile false'un ayrildigini kanitlar (=== undefined yerine !dondurulduMu
      // gibi bir refactor bu testi de bozar ama davranissal olarak ayni kalir;
      // burada amac dondurulmaTarihi gibi tanimli degerlerin korundugunu da
      // dogrulamak).
      const veri = {
        mevcutSeri: 5,
        enUzunSeri: 8,
        sonTamGun: '2026-03-10',
        seriBaslangici: '2026-03-06',
        toparlanmaDurumu: null,
        dondurulduMu: false, // zaten tanimli
        dondurulmaTarihi: null,
        sonGuncelleme: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
        JSON.stringify(veri)
      );

      const sonuc = await localSeriDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri!.dondurulduMu).toBe(false);
      expect(sonuc.veri!.dondurulmaTarihi).toBeNull();
      // Diger alanlar da bozulmamali
      expect(sonuc.veri!.mevcutSeri).toBe(5);
      expect(sonuc.veri!.sonTamGun).toBe('2026-03-10');
    });

    test('bozuk JSON oldugunda basarili:false ve hata dondurmeli (cokmemeli)', async () => {
      // Uretim catch blogu (satir 52-57): JSON.parse firlatirsa
      // basarili:false + hata donmeli; seri ekrani cokmemeli.
      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
        '{bozuk seri json'
      );

      const sonuc = await localSeriDurumunuGetir();

      expect(sonuc.basarili).toBe(false);
      expect(sonuc.veri).toBeUndefined();
      expect(typeof sonuc.hata).toBe('string');
      expect(sonuc.hata!.length).toBeGreaterThan(0);
    });

    test('tum alanlar olan yeni veriyi degistirmemeli', async () => {
      const yeniVeri = {
        mevcutSeri: 10,
        enUzunSeri: 15,
        sonTamGun: '2026-02-14',
        seriBaslangici: '2026-02-04',
        toparlanmaDurumu: null,
        dondurulduMu: true,
        dondurulmaTarihi: '2026-02-15',
        sonGuncelleme: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        DEPOLAMA_ANAHTARLARI.SERI_DURUMU,
        JSON.stringify(yeniVeri)
      );

      const sonuc = await localSeriDurumunuGetir();

      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri!.dondurulduMu).toBe(true);
      expect(sonuc.veri!.dondurulmaTarihi).toBe('2026-02-15');
      expect(sonuc.veri!.mevcutSeri).toBe(10);
    });
  });
});

// Hata yolu testlerinde AsyncStorage metodunu gecici olarak red'e cevirir.
// Resmi @react-native-async-storage jest mock'unda her metot bir jest.fn'dir;
// mockImplementationOnce ile sadece BIR cagriyi reddederiz -> sonraki test'lerin
// in-memory store'u etkilenmez, manuel geri-yukleme gerekmez.
type AsyncMethod = 'getItem' | 'setItem' | 'removeItem';
const asyncStorageHatasiEnjekteEt = (
  metot: AsyncMethod,
  hataMesaji = 'disk hatasi'
): (() => void) => {
  (AsyncStorage[metot] as jest.Mock).mockImplementationOnce(() =>
    Promise.reject(new Error(hataMesaji))
  );
  // mockImplementationOnce kendiliginden temizlenir; uyumluluk icin no-op doner.
  return () => undefined;
};

describe('LocalSeriServisi - Kaydetme (round-trip) ve hata yollari', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Seri durumu kaydet/getir', () => {
    test('kaydedilen seri durumu aynen geri okunur (round-trip)', async () => {
      const durum: SeriDurumu = {
        mevcutSeri: 7,
        enUzunSeri: 12,
        sonTamGun: '2026-06-20',
        seriBaslangici: '2026-06-14',
        toparlanmaDurumu: null,
        dondurulduMu: false,
        dondurulmaTarihi: null,
        sonGuncelleme: '2026-06-20T10:00:00.000Z',
      };

      const kaydet = await localSeriDurumunuKaydet(durum);
      expect(kaydet.basarili).toBe(true);

      // Diskte gercekten JSON yazilmis olmali
      const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SERI_DURUMU);
      expect(ham).toBe(JSON.stringify(durum));

      const getir = await localSeriDurumunuGetir();
      expect(getir.basarili).toBe(true);
      expect(getir.veri!.mevcutSeri).toBe(7);
      expect(getir.veri!.enUzunSeri).toBe(12);
      expect(getir.veri!.sonTamGun).toBe('2026-06-20');
    });

    test('setItem reddederse basarili:false + hata mesaji doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('setItem', 'yazma basarisiz');
      try {
        const sonuc = await localSeriDurumunuKaydet({
          mevcutSeri: 1,
          enUzunSeri: 1,
          sonTamGun: null,
          seriBaslangici: null,
          toparlanmaDurumu: null,
          dondurulduMu: false,
          dondurulmaTarihi: null,
          sonGuncelleme: '2026-06-20T10:00:00.000Z',
        });
        expect(sonuc.basarili).toBe(false);
        expect(sonuc.hata).toBe('yazma basarisiz');
      } finally {
        geriYukle();
      }
    });

    test('getItem reddederse basarili:false + hata mesaji doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('getItem', 'okuma basarisiz');
      try {
        const sonuc = await localSeriDurumunuGetir();
        expect(sonuc.basarili).toBe(false);
        expect(sonuc.hata).toBe('okuma basarisiz');
        expect(sonuc.veri).toBeUndefined();
      } finally {
        geriYukle();
      }
    });
  });

  describe('Rozet verileri getir/kaydet', () => {
    test('veri yokken bos (tum tanimli ama kazanilmamis) rozet listesi doner', async () => {
      const sonuc = await localRozetleriGetir();
      expect(sonuc.basarili).toBe(true);
      expect(Array.isArray(sonuc.veri)).toBe(true);
      expect(sonuc.veri!.length).toBeGreaterThan(0);
      // Bos liste = hicbiri kazanilmamis
      expect(sonuc.veri!.every((r) => r.kazanildiMi === false)).toBe(true);
      expect(sonuc.veri!.every((r) => r.kazanilmaTarihi === null)).toBe(true);
    });

    test('kaydedilen rozetler aynen geri okunur (round-trip)', async () => {
      const rozetler: KullaniciRozeti[] = [
        { rozetId: 'ilk_adim', kazanildiMi: true, kazanilmaTarihi: '2026-06-19' },
        { rozetId: 'yuz_namaz', kazanildiMi: false, kazanilmaTarihi: null },
      ];

      const kaydet = await localRozetleriKaydet(rozetler);
      expect(kaydet.basarili).toBe(true);

      const getir = await localRozetleriGetir();
      expect(getir.basarili).toBe(true);
      expect(getir.veri).toEqual(rozetler);
      // Kazanilan rozet korunmus olmali
      const ilkAdim = getir.veri!.find((r) => r.rozetId === 'ilk_adim');
      expect(ilkAdim?.kazanildiMi).toBe(true);
      expect(ilkAdim?.kazanilmaTarihi).toBe('2026-06-19');
    });

    test('getItem reddederse basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('getItem');
      try {
        const sonuc = await localRozetleriGetir();
        expect(sonuc.basarili).toBe(false);
        expect(sonuc.hata).toBe('disk hatasi');
      } finally {
        geriYukle();
      }
    });

    test('setItem reddederse kaydet basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('setItem');
      try {
        const sonuc = await localRozetleriKaydet([]);
        expect(sonuc.basarili).toBe(false);
        expect(sonuc.hata).toBe('disk hatasi');
      } finally {
        geriYukle();
      }
    });
  });

  describe('Seviye durumu kaydet', () => {
    test('kaydedilen seviye durumu aynen geri okunur (round-trip)', async () => {
      const seviye: SeviyeDurumu = {
        mevcutSeviye: 4,
        toplamPuan: 750,
        mevcutSeviyePuani: 150,
        sonrakiSeviyeKalanPuan: 250,
        rank: 'Mürid',
        rankIkonu: '💫',
      };

      const kaydet = await localSeviyeDurumunuKaydet(seviye);
      expect(kaydet.basarili).toBe(true);

      const getir = await localSeviyeDurumunuGetir();
      expect(getir.basarili).toBe(true);
      // rank/rankIkonu zaten dolu -> migrasyon dokunmamali
      expect(getir.veri).toEqual(seviye);
    });

    test('setItem reddederse basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('setItem');
      try {
        const sonuc = await localSeviyeDurumunuKaydet({
          mevcutSeviye: 1,
          toplamPuan: 0,
          mevcutSeviyePuani: 0,
          sonrakiSeviyeKalanPuan: 100,
          rank: 'Mübtedi',
          rankIkonu: '🌙',
        });
        expect(sonuc.basarili).toBe(false);
      } finally {
        geriYukle();
      }
    });
  });

  describe('Seri ayarlari getir/kaydet', () => {
    test('veri yokken varsayilan ayarlari doner', async () => {
      const sonuc = await localSeriAyarlariniGetir();
      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toEqual(VARSAYILAN_SERI_AYARLARI);
    });

    test('kaydedilen ozel ayar varsayilani EZER ve geri okunur', async () => {
      const ayar: SeriAyarlari = {
        ...VARSAYILAN_SERI_AYARLARI,
        tamGunEsigi: 3,
        bildirimlerAktif: false,
        bildirimSaati: 22,
      };

      const kaydet = await localSeriAyarlariniKaydet(ayar);
      expect(kaydet.basarili).toBe(true);

      const getir = await localSeriAyarlariniGetir();
      expect(getir.basarili).toBe(true);
      expect(getir.veri!.tamGunEsigi).toBe(3);
      expect(getir.veri!.bildirimlerAktif).toBe(false);
      expect(getir.veri!.bildirimSaati).toBe(22);
    });

    test('getItem reddederse basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('getItem');
      try {
        const sonuc = await localSeriAyarlariniGetir();
        expect(sonuc.basarili).toBe(false);
      } finally {
        geriYukle();
      }
    });
  });

  describe('Ozel gun ayarlari getir/kaydet', () => {
    test('veri yokken VARSAYILAN_OZEL_GUN_AYARLARI doner', async () => {
      const sonuc = await localOzelGunAyarlariniGetir();
      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toEqual(VARSAYILAN_OZEL_GUN_AYARLARI);
      expect(sonuc.veri!.ozelGunModuAktif).toBe(false);
      expect(sonuc.veri!.aktifOzelGun).toBeNull();
      expect(sonuc.veri!.gecmisKayitlar).toEqual([]);
    });

    test('kaydedilen aktif ozel gun + gecmis kayit round-trip', async () => {
      const ayar: OzelGunAyarlari = {
        ozelGunModuAktif: true,
        aktifOzelGun: {
          id: 'og-1',
          baslangicTarihi: '2026-06-18',
          bitisTarihi: '2026-06-22',
          aciklama: 'Yolculuk',
          olusturulmaTarihi: '2026-06-18T08:00:00.000Z',
        },
        gecmisKayitlar: [
          {
            id: 'og-0',
            baslangicTarihi: '2026-05-01',
            bitisTarihi: '2026-05-03',
            olusturulmaTarihi: '2026-05-01T08:00:00.000Z',
          },
        ],
      };

      const kaydet = await localOzelGunAyarlariniKaydet(ayar);
      expect(kaydet.basarili).toBe(true);

      const getir = await localOzelGunAyarlariniGetir();
      expect(getir.basarili).toBe(true);
      expect(getir.veri).toEqual(ayar);
      expect(getir.veri!.aktifOzelGun!.aciklama).toBe('Yolculuk');
      expect(getir.veri!.gecmisKayitlar).toHaveLength(1);
    });

    test('setItem reddederse kaydet basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('setItem');
      try {
        const sonuc = await localOzelGunAyarlariniKaydet(
          VARSAYILAN_OZEL_GUN_AYARLARI
        );
        expect(sonuc.basarili).toBe(false);
      } finally {
        geriYukle();
      }
    });
  });

  describe('Istatistik sayaclari (toplam/toparlanma/mukemmel gun)', () => {
    test('toplam kilinan namaz: veri yokken 0 doner', async () => {
      const sonuc = await localToplamKilinanNamaziGetir();
      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toBe(0);
    });

    test('toplam kilinan namaz kaydet -> string olarak yazar, sayi olarak okunur', async () => {
      await localToplamKilinanNamaziKaydet(42);
      const ham = await AsyncStorage.getItem(
        DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ
      );
      expect(ham).toBe('42'); // string olarak saklanir
      const sonuc = await localToplamKilinanNamaziGetir();
      expect(sonuc.veri).toBe(42); // parseInt ile sayi doner
    });

    test('toplam kilinan namaz arttir: varsayilan miktar 1 ekler', async () => {
      await localToplamKilinanNamaziKaydet(10);
      const sonuc = await localToplamKilinanNamaziArttir();
      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toBe(11);
      // Kalici olmali
      expect((await localToplamKilinanNamaziGetir()).veri).toBe(11);
    });

    test('toplam kilinan namaz arttir: ozel miktar ve sifirdan baslama', async () => {
      // Hic veri yok -> mevcut 0 kabul edilip miktar eklenir
      const sonuc = await localToplamKilinanNamaziArttir(5);
      expect(sonuc.veri).toBe(5);
      const sonuc2 = await localToplamKilinanNamaziArttir(3);
      expect(sonuc2.veri).toBe(8);
    });

    test('toparlanma sayisi: arttir her cagrida 1 artar ve kalici olur', async () => {
      const ilk = await localToparlanmaSayisiniArttir();
      expect(ilk.veri).toBe(1);
      const ikinci = await localToparlanmaSayisiniArttir();
      expect(ikinci.veri).toBe(2);
      expect((await localToparlanmaSayisiniGetir()).veri).toBe(2);
    });

    test('toparlanma sayisi getir: veri yokken 0', async () => {
      expect((await localToparlanmaSayisiniGetir()).veri).toBe(0);
    });

    test('mukemmel gun: arttir + getir + dogrudan kaydet (set) davranisi', async () => {
      expect((await localMukemmelGunSayisiniGetir()).veri).toBe(0);
      const art = await localMukemmelGunSayisiniArttir();
      expect(art.veri).toBe(1);

      // Kaydet dogrudan set eder (Arttir degil)
      await localMukemmelGunSayisiniKaydet(9);
      expect((await localMukemmelGunSayisiniGetir()).veri).toBe(9);
    });

    test('mukemmel gun kaydet: negatif/ondalik degerleri 0 alt sinir + yuvarlama ile temizler', async () => {
      // Math.max(0, Math.round(sayi)) -> negatif 0'a, ondalik en yakina yuvarlanir
      await localMukemmelGunSayisiniKaydet(-3);
      expect((await localMukemmelGunSayisiniGetir()).veri).toBe(0);

      await localMukemmelGunSayisiniKaydet(4.7);
      expect((await localMukemmelGunSayisiniGetir()).veri).toBe(5);
    });

    test('toplam getir: getItem reddederse basarili:false', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('getItem');
      try {
        const sonuc = await localToplamKilinanNamaziGetir();
        expect(sonuc.basarili).toBe(false);
      } finally {
        geriYukle();
      }
    });
  });

  describe('Bonus puan (kalici defter)', () => {
    test('anahtar yokken null doner (henuz migrate edilmemis sinyali)', async () => {
      const sonuc = await localBonusPuaniGetir();
      expect(sonuc.basarili).toBe(true);
      // null = anahtar yok; 0 ile karistirilmamali (migrasyon ayrimi kritik)
      expect(sonuc.veri).toBeNull();
    });

    test('0 kaydedildiyse null DEGIL 0 doner (migrasyon yapilmis demektir)', async () => {
      await localBonusPuaniKaydet(0);
      const sonuc = await localBonusPuaniGetir();
      expect(sonuc.basarili).toBe(true);
      expect(sonuc.veri).toBe(0); // null degil
    });

    test('kaydet: negatif degeri 0 alt sinira ceker, ondaligi yuvarlar', async () => {
      await localBonusPuaniKaydet(-50);
      expect((await localBonusPuaniGetir()).veri).toBe(0);

      await localBonusPuaniKaydet(123.4);
      expect((await localBonusPuaniGetir()).veri).toBe(123);
    });

    test('getItem reddederse basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('getItem');
      try {
        const sonuc = await localBonusPuaniGetir();
        expect(sonuc.basarili).toBe(false);
      } finally {
        geriYukle();
      }
    });
  });

  describe('Toplu islemler (getir/temizle)', () => {
    test('localTumSeriVerileriniGetir: tum alt alanlari tek seferde toplar', async () => {
      // Onceden bir kismini diske yaz; geri kalan varsayilanlardan gelmeli
      await localToplamKilinanNamaziKaydet(30);
      await localMukemmelGunSayisiniKaydet(4);
      await localToparlanmaSayisiniArttir(); // 1
      await localSeriAyarlariniKaydet({
        ...VARSAYILAN_SERI_AYARLARI,
        tamGunEsigi: 4,
      });

      const sonuc = await localTumSeriVerileriniGetir();
      expect(sonuc.basarili).toBe(true);
      const v = sonuc.veri!;
      expect(v.toplamKilinanNamaz).toBe(30);
      expect(v.mukemmelGunSayisi).toBe(4);
      expect(v.toparlanmaSayisi).toBe(1);
      expect(v.ayarlar.tamGunEsigi).toBe(4);
      // Yazilmayanlar varsayilan/bos durum
      expect(v.seriDurumu.mevcutSeri).toBe(0);
      expect(Array.isArray(v.rozetler)).toBe(true);
      expect(v.seviyeDurumu.mevcutSeviye).toBe(1);
      expect(v.ozelGunAyarlari.ozelGunModuAktif).toBe(false);
    });

    test('localTumSeriVerileriniTemizle: istatistik+seri anahtarlarini siler, AYARLARI korur', async () => {
      // Hem temizlenecek hem korunacak anahtarlari doldur
      await localSeriDurumunuKaydet({
        mevcutSeri: 5,
        enUzunSeri: 9,
        sonTamGun: '2026-06-20',
        seriBaslangici: '2026-06-16',
        toparlanmaDurumu: null,
        dondurulduMu: false,
        dondurulmaTarihi: null,
        sonGuncelleme: '2026-06-20T10:00:00.000Z',
      });
      await localToplamKilinanNamaziKaydet(100);
      await localMukemmelGunSayisiniKaydet(7);
      await localBonusPuaniKaydet(40);
      // Ayarlar KORUNMALI (temizlemede silinmiyor)
      await localSeriAyarlariniKaydet({
        ...VARSAYILAN_SERI_AYARLARI,
        tamGunEsigi: 3,
      });

      const temizle = await localTumSeriVerileriniTemizle();
      expect(temizle.basarili).toBe(true);

      // Silinenler: ham anahtar artik yok
      expect(
        await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.SERI_DURUMU)
      ).toBeNull();
      expect(
        await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.TOPLAM_KILILAN_NAMAZ)
      ).toBeNull();
      expect(
        await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUKEMMEL_GUN_SAYISI)
      ).toBeNull();
      // Bonus puan da silinmeli -> getir tekrar null doner (migrate sifirlandi)
      expect((await localBonusPuaniGetir()).veri).toBeNull();

      // Korunan: ayarlar hala diskte ve degeri aynen
      const ayarSonuc = await localSeriAyarlariniGetir();
      expect(ayarSonuc.veri!.tamGunEsigi).toBe(3);
    });

    test('temizle: removeItem reddederse basarili:false doner', async () => {
      const geriYukle = asyncStorageHatasiEnjekteEt('removeItem');
      try {
        const sonuc = await localTumSeriVerileriniTemizle();
        expect(sonuc.basarili).toBe(false);
        expect(sonuc.hata).toBe('disk hatasi');
      } finally {
        geriYukle();
      }
    });
  });
});
