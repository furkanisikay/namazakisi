/**
 * LocalSeriServisi veri migrasyonu testleri
 *
 * Eski versiyondan gelen verilerin dogru sekilde migrate edilmesini test eder.
 * - SeviyeDurumu: rank ve rankIkonu eksik olabilir
 * - SeriDurumu: dondurulduMu ve dondurulmaTarihi eksik olabilir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import {
  localSeviyeDurumunuGetir,
  localSeriDurumunuGetir,
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
