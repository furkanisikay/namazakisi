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

  // ==================== bekleyenGuncellemeVarMi ====================
  // ISSUE #91: Bu metot ARTIK OTOMATIK completeUpdate CAGIRMAZ. Yalnizca bekleyen
  // (DOWNLOADED) guncelleme var mi bilgisini doner; restart kullanici onayina birakilir.
  describe('bekleyenGuncellemeVarMi', () => {
    it('bekleyen güncelleme varsa true döner ve completeUpdate ÇAĞIRMAZ', async () => {
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
      const sonuc = await PlayStoreModulu.bekleyenGuncellemeVarMi();

      expect(sonuc).toBe(true);
      expect(mockVarMi).toHaveBeenCalled();
      // KRITIK: otomatik tamamlama (restart) TETIKLENMEMELI
      expect(mockTamamla).not.toHaveBeenCalled();
    });

    it('bekleyen güncelleme yoksa false döner', async () => {
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
      const sonuc = await PlayStoreModulu.bekleyenGuncellemeVarMi();

      expect(sonuc).toBe(false);
      expect(mockTamamla).not.toHaveBeenCalled();
    });

    it('hata durumunda false döner (sessizce)', async () => {
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
      await expect(PlayStoreModulu.bekleyenGuncellemeVarMi()).resolves.toBe(false);
    });

    it('iOS\'ta native modülü hiç çağırmadan false döner', async () => {
      // iOS/null-modül erken-return dalı: native varMi ASLA çağrılmamalı,
      // Promise false ile resolve olmalı (graceful no-op).
      const mockVarMi = jest.fn();
      const mockTamamla = jest.fn();
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        NativeModules: {
          // iOS'ta bu modül normalde bulunmaz; yine de tanımlasak da guard
          // Platform.OS kontrolünde takılıp native'e GİTMEMELİ.
          PlayStoreGuncelleme: {
            indirilenGuncellemeVarMi: mockVarMi,
            guncellemeYuklemeyiTamamla: mockTamamla,
          },
        },
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      await expect(PlayStoreModulu.bekleyenGuncellemeVarMi()).resolves.toBe(false);
      expect(mockVarMi).not.toHaveBeenCalled();
      expect(mockTamamla).not.toHaveBeenCalled();
    });
  });

  // ==================== esnekGuncellemeBaslat ====================
  describe('esnekGuncellemeBaslat', () => {
    it('Android\'de native sonucu (string) doğrudan iletir', async () => {
      const mockBaslat = jest.fn().mockResolvedValue('DOWNLOADED');
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { esnekGuncellemeBaslat: mockBaslat } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.esnekGuncellemeBaslat();

      expect(sonuc).toBe('DOWNLOADED');
      expect(mockBaslat).toHaveBeenCalledTimes(1);
    });

    it('iOS\'ta fallback yerine HATA fırlatır (diğer metodların aksine)', async () => {
      // Bu metot tek istisna: graceful fallback DEĞİL, açıkça reject eder.
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        NativeModules: {},
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');

      await expect(PlayStoreModulu.esnekGuncellemeBaslat()).rejects.toThrow(
        'Play Store modülü mevcut değil',
      );
    });

    it('Android\'de native modül yokken HATA fırlatır', async () => {
      // Android olsa bile native modül enjekte edilmemişse guard devreye girer.
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: {},
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');

      await expect(PlayStoreModulu.esnekGuncellemeBaslat()).rejects.toThrow(
        'Play Store modülü mevcut değil',
      );
    });
  });

  // ==================== guncellemeYuklemeyiTamamla ====================
  describe('guncellemeYuklemeyiTamamla', () => {
    it('Android\'de native sonucu (true) doğrudan iletir', async () => {
      const mockTamamla = jest.fn().mockResolvedValue(true);
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { guncellemeYuklemeyiTamamla: mockTamamla } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeYuklemeyiTamamla();

      expect(sonuc).toBe(true);
      expect(mockTamamla).toHaveBeenCalledTimes(1);
    });

    it('Android\'de native sonucu (false) doğrudan iletir', async () => {
      const mockTamamla = jest.fn().mockResolvedValue(false);
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: { PlayStoreGuncelleme: { guncellemeYuklemeyiTamamla: mockTamamla } },
        NativeEventEmitter: jest.fn().mockImplementation(() => ({
          addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        })),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeYuklemeyiTamamla();

      expect(sonuc).toBe(false);
    });

    it('iOS\'ta native modülü çağırmadan false döner', async () => {
      const mockTamamla = jest.fn();
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
        NativeModules: { PlayStoreGuncelleme: { guncellemeYuklemeyiTamamla: mockTamamla } },
        NativeEventEmitter: jest.fn(),
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');
      const sonuc = await PlayStoreModulu.guncellemeYuklemeyiTamamla();

      expect(sonuc).toBe(false);
      expect(mockTamamla).not.toHaveBeenCalled();
    });
  });

  // ==================== installDurumDinle — gerçek olay akışı ====================
  describe('installDurumDinle (gerçek olay akışı)', () => {
    it('Android\'de NativeEventEmitter modülle kurulur ve emit edilen olayı handler\'a iletir', () => {
      // Gerçek bir emitter benzetimi: addListener handler'ı saklar, emit ise çağırır.
      // Böylece sadece addListener çağrı argümanını değil, asıl PAYLOAD akışını doğrularız.
      const dinleyiciler: Record<string, ((olay: unknown) => void)[]> = {};
      const sahteEmitter = {
        addListener: jest.fn((olayAdi: string, cb: (olay: unknown) => void) => {
          (dinleyiciler[olayAdi] ??= []).push(cb);
          return {
            remove: jest.fn(() => {
              dinleyiciler[olayAdi] = (dinleyiciler[olayAdi] ?? []).filter((h) => h !== cb);
            }),
          };
        }),
        emit: (olayAdi: string, olay: unknown) => {
          (dinleyiciler[olayAdi] ?? []).forEach((h) => h(olay));
        },
      };
      const sahteModul = { PlayStoreGuncelleme: {} };
      const NativeEventEmitterMock = jest.fn().mockImplementation(() => sahteEmitter);
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        NativeModules: sahteModul,
        NativeEventEmitter: NativeEventEmitterMock,
      }));

      const { PlayStoreModulu } = require('../PlayStoreGuncellemeModulu');

      // Modül-yükleme anında emitter, native modülle (no-op DEĞİL) kurulmuş olmalı.
      expect(NativeEventEmitterMock).toHaveBeenCalledWith(sahteModul.PlayStoreGuncelleme);

      const alinanOlaylar: unknown[] = [];
      const iptalEt = PlayStoreModulu.installDurumDinle((olay: unknown) => {
        alinanOlaylar.push(olay);
      });

      // Native'ten gelen InstallDurumOlayi payload'ını emit et.
      const olay = { installStatus: 11, bytesDownloaded: 1000, totalBytesToDownload: 1000 };
      sahteEmitter.emit('PlayStoreInstallStateChanged', olay);

      expect(alinanOlaylar).toEqual([olay]);

      // İptal sonrası yeni olay handler'a ULAŞMAMALI.
      iptalEt();
      sahteEmitter.emit('PlayStoreInstallStateChanged', {
        installStatus: 4,
        bytesDownloaded: 0,
        totalBytesToDownload: 0,
      });
      expect(alinanOlaylar).toHaveLength(1);
    });
  });

  // ==================== InstallDurumlari sabitleri ====================
  describe('InstallDurumlari sabitleri', () => {
    it('Play Core InstallStatus referans değerleriyle birebir eşleşir', () => {
      // Bu sayılar native com.google.android.play.core.install.model.InstallStatus
      // ile eşleşmek ZORUNDA; yanlış sabit sessiz hataya yol açar (ör. DOWNLOADED
      // yanlışsa indirme tamamlanması hiç tetiklenmez). Referans değerle sabitle.
      const { InstallDurumlari } = require('../PlayStoreGuncellemeModulu');

      expect(InstallDurumlari).toEqual({
        UNKNOWN: 0,
        PENDING: 1,
        DOWNLOADING: 2,
        DOWNLOADED: 11,
        INSTALLING: 3,
        INSTALLED: 4,
        FAILED: 5,
        CANCELED: 6,
      });
    });
  });
});
