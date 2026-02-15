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
      // Eksik alanlar doldurulmali
      expect(sonuc.veri!.rank).toBeDefined();
      expect(sonuc.veri!.rank).not.toBe('');
      expect(sonuc.veri!.rankIkonu).toBeDefined();
      expect(sonuc.veri!.rankIkonu).not.toBe('');
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
