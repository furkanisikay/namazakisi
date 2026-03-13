/**
 * PlayStoreGuncellemeModulu Unit Testleri
 *
 * Native modül köprüsünün:
 * - Android'de native modülü doğru çağırdığını
 * - Modül yoksa (iOS, emülatör) graceful fallback döndürdüğünü
 * - Her metodun hata durumlarında güvenli davrandığını
 * doğrular.
 */

// Platform mock — her testte override edilir
const mockPlatform = { OS: 'android' };
jest.mock('react-native', () => ({
  Platform: mockPlatform,
  NativeModules: {},
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
}));

describe('PlayStoreGuncellemeModulu', () => {
  // Her testte module cache'ini temizle
  beforeEach(() => {
    jest.resetModules();
    mockPlatform.OS = 'android';
  });

  // ==================== kurulumKaynagiGetir ====================
  describe('kurulumKaynagiGetir', () => {
    it('native modül "play_store" döndürdüğünde doğru değeri iletir', async () => {
      const mockGetir = jest.fn().mockResolvedValue('play_store');
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { kurulumKaynagiGetir: mockGetir } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.kurulumKaynagiGetir();

      expect(sonuc).toBe('play_store');
      expect(mockGetir).toHaveBeenCalledTimes(1);
    });

    it('native modül "sideload" döndürdüğünde doğru değeri iletir', async () => {
      const mockGetir = jest.fn().mockResolvedValue('sideload');
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { kurulumKaynagiGetir: mockGetir } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.kurulumKaynagiGetir();

      expect(sonuc).toBe('sideload');
    });

    it('iOS platformda "unknown" döndürür (native modül yok)', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        NativeModules: {},
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.kurulumKaynagiGetir();

      expect(sonuc).toBe('unknown');
    });

    it('native modül null döndürdüğünde "unknown" fallback', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: {},
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.kurulumKaynagiGetir();

      expect(sonuc).toBe('unknown');
    });

    it('native modül hata fırlattığında "unknown" döndürür', async () => {
      const mockGetir = jest.fn().mockRejectedValue(new Error('Native hata'));
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { kurulumKaynagiGetir: mockGetir } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.kurulumKaynagiGetir();

      expect(sonuc).toBe('unknown');
    });
  });

  // ==================== guncellemeDurumunuKontrolEt ====================
  describe('guncellemeDurumunuKontrolEt', () => {
    it('güncelleme mevcut olduğunda doğru sonuç döner', async () => {
      const mockKontrol = jest.fn().mockResolvedValue({
        guncellemeMevcut: true,
        availableVersionCode: 28,
      });
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { guncellemeDurumunuKontrolEt: mockKontrol } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeDurumunuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(true);
      expect(sonuc.availableVersionCode).toBe(28);
    });

    it('güncelleme yokken false döner', async () => {
      const mockKontrol = jest.fn().mockResolvedValue({
        guncellemeMevcut: false,
        availableVersionCode: 27,
      });
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { guncellemeDurumunuKontrolEt: mockKontrol } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeDurumunuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(false);
    });

    it('iOS platformda { guncellemeMevcut: false } döner', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        NativeModules: {},
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeDurumunuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(false);
    });

    it('native hata durumunda { guncellemeMevcut: false } döner', async () => {
      const mockKontrol = jest.fn().mockRejectedValue(new Error('Play Store erişilemez'));
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { guncellemeDurumunuKontrolEt: mockKontrol } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeDurumunuKontrolEt();

      expect(sonuc.guncellemeMevcut).toBe(false);
      expect(sonuc.hata).toBeDefined();
    });
  });

  // ==================== installDurumDinle ====================
  describe('installDurumDinle', () => {
    it('Android\'de event listener kaydeder ve iptal fonksiyonu döner', () => {
      const mockRemove = jest.fn();
      const mockAddListener = jest.fn().mockReturnValue({ remove: mockRemove });
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: {} },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: mockAddListener,
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const handler = jest.fn();
      const iptalEt = PlayStoreModulu.installDurumDinle(handler);

      expect(mockAddListener).toHaveBeenCalledWith('PlayStoreInstallStateChanged', handler);
      expect(typeof iptalEt).toBe('function');

      iptalEt();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('iOS\'ta no-op fonksiyon döner', () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        NativeModules: {},
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const handler = jest.fn();
      const iptalEt = PlayStoreModulu.installDurumDinle(handler);

      expect(typeof iptalEt).toBe('function');
      expect(() => iptalEt()).not.toThrow();
    });
  });

  // ==================== indirilenGuncellemeVarMiKontrolEt ====================
  describe('indirilenGuncellemeVarMiKontrolEt', () => {
    it('bekleyen güncelleme varsa tamamlar', async () => {
      const mockVarMi = jest.fn().mockResolvedValue(true);
      const mockTamamla = jest.fn().mockResolvedValue(true);
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: {
          PlayStoreGuncelleme: {
            indirilenGuncellemeVarMi: mockVarMi,
            guncellemeYuklemeyiTamamla: mockTamamla,
          },
        },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      await PlayStoreModulu.indirilenGuncellemeVarMiKontrolEt();

      expect(mockVarMi).toHaveBeenCalled();
      expect(mockTamamla).toHaveBeenCalled();
    });

    it('bekleyen güncelleme yoksa tamamlamaz', async () => {
      const mockVarMi = jest.fn().mockResolvedValue(false);
      const mockTamamla = jest.fn();
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: {
          PlayStoreGuncelleme: {
            indirilenGuncellemeVarMi: mockVarMi,
            guncellemeYuklemeyiTamamla: mockTamamla,
          },
        },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      await PlayStoreModulu.indirilenGuncellemeVarMiKontrolEt();

      expect(mockTamamla).not.toHaveBeenCalled();
    });

    it('hata durumunda sessizce devam eder', async () => {
      const mockVarMi = jest.fn().mockRejectedValue(new Error('native crash'));
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: {
          PlayStoreGuncelleme: { indirilenGuncellemeVarMi: mockVarMi },
        },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      await expect(PlayStoreModulu.indirilenGuncellemeVarMiKontrolEt()).resolves.toBeUndefined();
    });
  });
});
