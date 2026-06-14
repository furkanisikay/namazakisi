/**
 * PlayStoreGuncellemeKaynagi Unit Testleri
 *
 * GuncellemeKaynagi interface implementasyonunu doğrular:
 * - destekleniyor() sadece Android'de true döner
 * - enSonSurumuKontrolEt() Play Store API'sini doğru yorumlar
 * - Hata durumları graceful şekilde ele alınır
 */

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

// PlayStoreModulu mock — jest.mock fabrikası hoisted olur, bu yüzden modüle
// doğrudan require() ile erişip .mockResolvedValue kullanıyoruz
jest.mock('../PlayStoreGuncellemeModulu', () => ({
  PlayStoreModulu: {
    guncellemeDurumunuKontrolEt: jest.fn(),
    kurulumKaynagiGetir: jest.fn(),
    esnekGuncellemeBaslat: jest.fn(),
    guncellemeYuklemeyiTamamla: jest.fn(),
    installDurumDinle: jest.fn().mockReturnValue(() => {}),
    bekleyenGuncellemeVarMi: jest.fn().mockResolvedValue(false),
  },
}));

import { PlayStoreGuncellemeKaynagi } from '../PlayStoreGuncellemeKaynagi';
import { PlayStoreModulu } from '../PlayStoreGuncellemeModulu';

const mockKontrolEt = PlayStoreModulu.guncellemeDurumunuKontrolEt as jest.Mock;

describe('PlayStoreGuncellemeKaynagi', () => {
  let kaynak: PlayStoreGuncellemeKaynagi;

  beforeEach(() => {
    kaynak = new PlayStoreGuncellemeKaynagi();
    mockKontrolEt.mockReset();
  });

  // ==================== destekleniyor() ====================
  describe('destekleniyor()', () => {
    it('tip değeri "playstore" olmalı', () => {
      expect(kaynak.tip).toBe('playstore');
    });

    it('Android\'de true döner', () => {
      // Global mock (Platform.OS = 'android') + beforeEach instance zaten 'android';
      // resetModules/doMock gerekmez. Üretim: `Platform.OS === 'android'`.
      expect(kaynak.destekleniyor()).toBe(true);
    });

    it('iOS\'ta false döner (platform gating)', () => {
      // `=== 'android'` karşılaştırmasının gerçek negatif dalı: iOS'ta destek YOK.
      // Modül kayıt defterini izole et, react-native'i iOS olarak yeniden mock'la,
      // taze require ile yeni sınıfı yükle. Temizlik afterEach'te yapılır.
      jest.resetModules();
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      const {
        PlayStoreGuncellemeKaynagi: K,
      } = require('../PlayStoreGuncellemeKaynagi');
      expect(new K().destekleniyor()).toBe(false);
    });

    afterEach(() => {
      // iOS testi modül kayıt defterini ve react-native mock'unu değiştirdi.
      // Sonraki testlerin global 'android' mock'una dönmesi için geri al.
      jest.dontMock('react-native');
      jest.resetModules();
    });
  });

  // ==================== enSonSurumuKontrolEt() ====================
  describe('enSonSurumuKontrolEt()', () => {
    it('güncelleme mevcut olduğunda doğru bilgi döner', async () => {
      mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        availableVersionCode: 28,
      });

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(true);
      expect(sonuc.bilgi).not.toBeNull();
      expect(sonuc.bilgi!.kaynak).toBe('playstore');
      expect(sonuc.bilgi!.zorunluMu).toBe(false);
    });

    it('kullanıcıya çirkin "versionCode" göstermez; temiz etiket kullanır', async () => {
      mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        availableVersionCode: 46,
      });

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      // versionCode mantık için saklanır ama gösterim etiketi temiz olmalı
      expect(sonuc.bilgi!.yeniVersiyon).toBe('46');
      expect(sonuc.bilgi!.yeniVersiyonEtiketi).toBe('Yeni sürüm');
      expect(sonuc.bilgi!.yeniVersiyon).not.toContain('versionCode');
    });

    it('güncelleme yokken { guncellemeMevcut: false } döner', async () => {
      mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: false,
        availableVersionCode: 27,
      });

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(false);
      expect(sonuc.bilgi).toBeNull();
    });

    it('Play Store API hatasında { guncellemeMevcut: false } döner', async () => {
      mockKontrolEt.mockRejectedValue(new Error('Network error'));

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(false);
      expect(sonuc.bilgi).toBeNull();
    });

    it('indirmeBaglantisi "playstore://update" olarak ayarlanır', async () => {
      mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        availableVersionCode: 28,
      });

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      expect(sonuc.bilgi!.indirmeBaglantisi).toBe('playstore://update');
    });

    it('mevcutVersiyon UYGULAMA.VERSIYON ile eşleşir', async () => {
      const { UYGULAMA } = require('../../../core/constants/UygulamaSabitleri');
      mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        availableVersionCode: 28,
      });

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      expect(sonuc.bilgi!.mevcutVersiyon).toBe(UYGULAMA.VERSIYON);
    });

    it('availableVersionCode yokken yeniVersiyon "playstore" olur (fallback dalı)', async () => {
      // Play Core bazı durumlarda yalnızca güncelleme VAR bilgisini verir,
      // availableVersionCode'u VERMEZ. Üretim ternary'si:
      //   yeniVersiyon: durum.availableVersionCode ? String(...) : 'playstore'
      // Bu falsy dal hiç tetiklenmiyordu — burada açıkça doğrularız.
      // Eğer ternary kaldırılıp String(undefined) yapılsaydı "undefined" olur,
      // bu test FAIL ederdi.
      mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        // availableVersionCode bilerek YOK (undefined)
      });

      const sonuc = await kaynak.enSonSurumuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(true);
      expect(sonuc.bilgi).not.toBeNull();
      expect(sonuc.bilgi!.yeniVersiyon).toBe('playstore');
      // Fallback değeri yine de kullanıcıya çirkin teknik metin sızdırmaz
      expect(sonuc.bilgi!.yeniVersiyon).not.toContain('undefined');
      expect(sonuc.bilgi!.yeniVersiyon).not.toContain('versionCode');
      // Etiket fallback'te de temiz kalmalı
      expect(sonuc.bilgi!.yeniVersiyonEtiketi).toBe('Yeni sürüm');
    });

    it('Play Store güncellemesi ASLA zorunlu işaretlenmez (politika kontratı)', async () => {
      // UX/policy garantisi: Play Core sürüm adı/changelog vermediğinden,
      // kullanıcıyı zorunlu güncellemeye sokmak yanlış olur. availableVersionCode
      // OLSA da OLMASA da zorunluMu daima false ve kaynak daima 'playstore' kalmalı.
      // Üretimde biri zorunluMu: true yazarsa bu test (her iki senaryoda da) FAIL eder.
      const senaryolar = [
        { guncellemeMevcut: true, availableVersionCode: 28 },
        { guncellemeMevcut: true }, // availableVersionCode yok
      ];

      for (const durum of senaryolar) {
        mockKontrolEt.mockResolvedValue(durum);

        const sonuc = await kaynak.enSonSurumuKontrolEt();

        expect(sonuc.bilgi).not.toBeNull();
        expect(sonuc.bilgi!.zorunluMu).toBe(false);
        expect(sonuc.bilgi!.kaynak).toBe('playstore');
      }
    });
  });
});
