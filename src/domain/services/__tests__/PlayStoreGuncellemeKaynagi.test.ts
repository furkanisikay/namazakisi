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
    indirilenGuncellemeVarMiKontrolEt: jest.fn(),
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
    it('Android\'de true döner', () => {
      jest.resetModules();
      jest.doMock('react-native', () => ({ Platform: { OS: 'android' } }));
      const { PlayStoreGuncellemeKaynagi: K } = require('../PlayStoreGuncellemeKaynagi');
      expect(new K().destekleniyor()).toBe(true);
    });

    it('tip değeri "playstore" olmalı', () => {
      expect(kaynak.tip).toBe('playstore');
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
  });
});
