/**
 * Logger test
 * Logger sinifininin davranisini dogrular
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger, LogLevel } from '../Logger';
import type { LogEntry } from '../Logger';

// Uretim kodundaki sabit storage anahtarlari (Logger.ts ile ayni olmali)
const LOGLAR_ANAHTARI = '@namazakisi:logs';
const ETKIN_ANAHTARI = '@namazakisi:debug_enabled';
const YEDI_GUN_MS = 7 * 24 * 60 * 60 * 1000;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Logger', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    // Reset logger state
    await Logger.setEnabled(false);
    await Logger.clearLogs();
  });

  describe('initialize', () => {
    it('etkin bayragini yukler, eski loglari filtreler ve temizlenmis listeyi storage\'a geri yazar', async () => {
      // initialize() singleton'da "initialized" guard'i ile bir kez calisir.
      // Test sira-bagimsiz olsun diye guard'i sifirlayip govdenin gercekten
      // calismasini garantiliyoruz (yalnizca test-only erisim, uretim kodu degismez).
      (Logger as unknown as { initialized: boolean }).initialized = false;
      (Logger as unknown as { initPromise: Promise<void> | null }).initPromise = null;

      const taze: LogEntry = {
        timestamp: Date.now(),
        level: LogLevel.INFO,
        tag: 'T',
        message: 'taze',
      };
      const eski: LogEntry = {
        // 8 gun once -> 7 gunluk yas esiginin disinda, atilmali
        timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
        level: LogLevel.INFO,
        tag: 'T',
        message: 'eski',
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((anahtar: string) => {
        if (anahtar === ETKIN_ANAHTARI) return Promise.resolve('true');
        if (anahtar === LOGLAR_ANAHTARI) return Promise.resolve(JSON.stringify([eski, taze]));
        return Promise.resolve(null);
      });
      (AsyncStorage.setItem as jest.Mock).mockClear();

      await Logger.initialize();

      // 1) Etkin bayragi storage'dan 'true' okundu ve uygulandi
      expect(Logger.isEnabled()).toBe(true);

      // 2) Yas filtresi: yalnizca taze log kaldi, eski (8 gun) atildi
      const loglar = Logger.getLogs();
      expect(loglar).toHaveLength(1);
      expect(loglar[0].message).toBe('taze');

      // 3) Temizlenmis liste storage'a geri yazildi (yas filtresinin sonucu kalici)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LOGLAR_ANAHTARI,
        JSON.stringify([taze])
      );
    });

    it('7 gunluk yas esigini gecmeyen log korunur (sinir testi)', async () => {
      (Logger as unknown as { initialized: boolean }).initialized = false;
      (Logger as unknown as { initPromise: Promise<void> | null }).initPromise = null;

      // 7 gunden 1 dakika kisa: filtre korumali (now - timestamp < YEDI_GUN_MS)
      const sinirIcinde: LogEntry = {
        timestamp: Date.now() - (YEDI_GUN_MS - 60 * 1000),
        level: LogLevel.WARN,
        tag: 'T',
        message: 'sinir-ici',
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((anahtar: string) => {
        if (anahtar === ETKIN_ANAHTARI) return Promise.resolve('false');
        if (anahtar === LOGLAR_ANAHTARI) return Promise.resolve(JSON.stringify([sinirIcinde]));
        return Promise.resolve(null);
      });

      await Logger.initialize();

      // Etkin bayragi 'false' okundu
      expect(Logger.isEnabled()).toBe(false);
      // Yas esigi icindeki log korundu
      const loglar = Logger.getLogs();
      expect(loglar).toHaveLength(1);
      expect(loglar[0].message).toBe('sinir-ici');
    });

    it('tam 7 gun (esige esit) olan log ATILIR — strict < siniri (off-by-one)', async () => {
      // Saati dondur ki initialize() icindeki Date.now() ile test'teki referans
      // BIREBIR ayni olsun; aksi halde == sinirini deterministik test edemeyiz.
      jest.useFakeTimers();
      try {
        jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0)); // 2026-06-15 12:00 yerel
        const simdi = Date.now();

        (Logger as unknown as { initialized: boolean }).initialized = false;
        (Logger as unknown as { initPromise: Promise<void> | null }).initPromise = null;

        // now - timestamp === YEDI_GUN_MS -> filtre `< YEDI_GUN_MS` oldugundan ATILIR
        const tamYediGun: LogEntry = {
          timestamp: simdi - YEDI_GUN_MS,
          level: LogLevel.INFO,
          tag: 'T',
          message: 'tam-yedi-gun',
        };
        // 7 gun - 1ms -> sinir icinde, korunur
        const sinirIci: LogEntry = {
          timestamp: simdi - (YEDI_GUN_MS - 1),
          level: LogLevel.INFO,
          tag: 'T',
          message: 'sinir-ici-1ms',
        };

        (AsyncStorage.getItem as jest.Mock).mockImplementation((anahtar: string) => {
          if (anahtar === ETKIN_ANAHTARI) return Promise.resolve('true');
          if (anahtar === LOGLAR_ANAHTARI)
            return Promise.resolve(JSON.stringify([tamYediGun, sinirIci]));
          return Promise.resolve(null);
        });

        await Logger.initialize();

        const loglar = Logger.getLogs();
        expect(loglar).toHaveLength(1);
        expect(loglar[0].message).toBe('sinir-ici-1ms');
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('setEnabled', () => {
    it('should enable debug mode', async () => {
      await Logger.setEnabled(true);
      expect(Logger.isEnabled()).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@namazakisi:debug_enabled', 'true');
    });

    it('should disable debug mode', async () => {
      await Logger.setEnabled(false);
      expect(Logger.isEnabled()).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@namazakisi:debug_enabled', 'false');
    });
  });

  describe('logging methods', () => {
    beforeEach(async () => {
      await Logger.setEnabled(true);
    });

    it('should log debug messages when enabled', async () => {
      await Logger.debug('TestTag', 'Debug message');
      const logs = Logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].tag).toBe('TestTag');
      expect(logs[0].message).toBe('Debug message');
    });

    it('should log info messages', async () => {
      await Logger.info('TestTag', 'Info message', { key: 'value' });
      const logs = Logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].data).toEqual({ key: 'value' });
    });

    it('should log warn messages', async () => {
      await Logger.warn('TestTag', 'Warning message');
      const logs = Logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should log error messages', async () => {
      await Logger.error('TestTag', 'Error message');
      const logs = Logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
    });

    it('should not store logs when disabled', async () => {
      await Logger.setEnabled(false);
      await Logger.debug('TestTag', 'Debug message');
      const logs = Logger.getLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe('getLogsByLevel', () => {
    beforeEach(async () => {
      await Logger.setEnabled(true);
    });

    it('should filter logs by level', async () => {
      await Logger.debug('Test', 'Debug');
      await Logger.info('Test', 'Info');
      await Logger.warn('Test', 'Warn');
      await Logger.error('Test', 'Error');

      const errorLogs = Logger.getLogsByLevel(LogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].level).toBe(LogLevel.ERROR);
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', async () => {
      await Logger.setEnabled(true);
      await Logger.info('Test', 'Message');
      expect(Logger.getLogs()).toHaveLength(1);

      await Logger.clearLogs();
      expect(Logger.getLogs()).toHaveLength(0);
    });
  });

  describe('exportLogs', () => {
    it('should export logs as text', async () => {
      await Logger.setEnabled(true);
      await Logger.info('TestTag', 'Test message');
      
      const exported = Logger.exportLogs();
      expect(exported).toContain('[TestTag]');
      expect(exported).toContain('Test message');
      expect(exported).toContain('[INFO]');
    });

    it('should return message when no logs', () => {
      const exported = Logger.exportLogs();
      expect(exported).toBe('Log bulunamadi');
    });
  });

  describe('debounce ile storage kalicilik (saveLogs tetiklenmesi)', () => {
    it('addLog 1000ms debounce sonunda setItem(STORAGE_KEY, JSON) ile dogru icerigi yazar', async () => {
      jest.useFakeTimers();
      try {
        await Logger.setEnabled(true);
        // setEnabled'in setItem cagrilarini ayirmak icin temizle
        (AsyncStorage.setItem as jest.Mock).mockClear();

        Logger.info('Kalici', 'kalici-mesaj', { x: 1 });

        // Debounce dolmadan saveLogs (log icerigi) henuz YAZILMAMALI
        expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
          LOGLAR_ANAHTARI,
          expect.any(String)
        );

        // Debounce penceresini doldur -> setTimeout govdesi calisir
        jest.advanceTimersByTime(1000);
        // setTimeout icindeki saveLogs() async; bekleyen microtask'lari bosalt
        await Promise.resolve();

        // Tam olarak in-memory log dizisinin JSON'u yazilmali
        const yazilan = JSON.stringify(Logger['logs']);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(LOGLAR_ANAHTARI, yazilan);

        const parsed = JSON.parse(yazilan);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toMatchObject({
          level: LogLevel.INFO,
          tag: 'Kalici',
          message: 'kalici-mesaj',
          data: { x: 1 },
        });
      } finally {
        jest.useRealTimers();
      }
    });

    it('ardisik birden cok addLog tek bir setItem yazimina indirgenir (debounce birlestirme)', async () => {
      jest.useFakeTimers();
      try {
        await Logger.setEnabled(true);
        (AsyncStorage.setItem as jest.Mock).mockClear();

        Logger.info('T', 'bir');
        jest.advanceTimersByTime(400);
        Logger.info('T', 'iki');
        jest.advanceTimersByTime(400);
        Logger.info('T', 'uc');

        // Her log timer'i sifirladigindan, son logdan once hic yazim olmamali
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();

        // Son logdan 1000ms sonra TEK yazim olur
        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const logYazimlari = (AsyncStorage.setItem as jest.Mock).mock.calls.filter(
          ([anahtar]) => anahtar === LOGLAR_ANAHTARI
        );
        expect(logYazimlari).toHaveLength(1);
        // Uc log da tek yazimda bulunur
        const parsed = JSON.parse(logYazimlari[0][1]);
        expect(parsed.map((l: LogEntry) => l.message)).toEqual(['bir', 'iki', 'uc']);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('MAX_LOGS=500 truncation', () => {
    it('addLog ile 501 log eklenince en eski dusurulur ve uzunluk 500de sabitlenir', async () => {
      await Logger.setEnabled(true);

      for (let i = 0; i < 501; i++) {
        Logger.info('T', `m${i}`);
      }

      const loglar = Logger.getLogs(); // en yeni once
      expect(loglar).toHaveLength(500);
      // En eski (m0) dusmeli; kalan en eski m1 olmali (getLogs en yeni once -> son eleman en eski)
      expect(loglar[loglar.length - 1].message).toBe('m1');
      // En yeni m500 olmali
      expect(loglar[0].message).toBe('m500');
    });

    it('initialize storage 501 log okudugunda da son 500e kirpar', async () => {
      jest.useFakeTimers();
      try {
        (Logger as unknown as { initialized: boolean }).initialized = false;
        (Logger as unknown as { initPromise: Promise<void> | null }).initPromise = null;

        const simdi = Date.now();
        const cokLog: LogEntry[] = Array.from({ length: 501 }, (_, i) => ({
          timestamp: simdi - i * 1000, // hepsi yas esigi icinde
          level: LogLevel.INFO,
          tag: 'T',
          message: `s${i}`,
        }));

        (AsyncStorage.getItem as jest.Mock).mockImplementation((anahtar: string) => {
          if (anahtar === ETKIN_ANAHTARI) return Promise.resolve('true');
          if (anahtar === LOGLAR_ANAHTARI) return Promise.resolve(JSON.stringify(cokLog));
          return Promise.resolve(null);
        });

        await Logger.initialize();

        // slice(-500): ilk eleman (s0) dusurulur, 500 kalir
        expect(Logger.getLogs()).toHaveLength(500);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('getLogs / getLogsByLevel siralamasi (en yeni once)', () => {
    it('getLogs ekleme sirasinin tersini (newest-first) dondurur', async () => {
      await Logger.setEnabled(true);
      Logger.info('T', 'birinci');
      Logger.info('T', 'ikinci');
      Logger.info('T', 'ucuncu');

      const loglar = Logger.getLogs();
      expect(loglar.map((l) => l.message)).toEqual(['ucuncu', 'ikinci', 'birinci']);
    });

    it('getLogsByLevel ayni seviyedeki loglari newest-first dondurur', async () => {
      await Logger.setEnabled(true);
      Logger.error('T', 'hata-1');
      Logger.info('T', 'bilgi');
      Logger.error('T', 'hata-2');

      const hatalar = Logger.getLogsByLevel(LogLevel.ERROR);
      expect(hatalar).toHaveLength(2);
      expect(hatalar.map((l) => l.message)).toEqual(['hata-2', 'hata-1']);
    });
  });

  describe('eszamanli initialize() dedup', () => {
    it('ayni anda iki initialize cagrisi getItem-i ikiye katlamadan tek init yapar', async () => {
      (Logger as unknown as { initialized: boolean }).initialized = false;
      (Logger as unknown as { initPromise: Promise<void> | null }).initPromise = null;
      (AsyncStorage.getItem as jest.Mock).mockClear();

      (AsyncStorage.getItem as jest.Mock).mockImplementation((anahtar: string) => {
        if (anahtar === ETKIN_ANAHTARI) return Promise.resolve('false');
        if (anahtar === LOGLAR_ANAHTARI) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      // Eszamanli iki cagri: ikisi de ayni initPromise'i paylasmali
      await Promise.all([Logger.initialize(), Logger.initialize()]);

      // initialize basina ENABLED_KEY + STORAGE_KEY = 2 getItem; iki kez calissaydi 4 olurdu
      const getItemCagriSayisi = (AsyncStorage.getItem as jest.Mock).mock.calls.length;
      expect(getItemCagriSayisi).toBe(2);
    });
  });

  describe('initialize() dayaniklilik (parse/storage hatasi)', () => {
    it('bozuk JSON okununca cokmeden bos in-memory ile baslar ve initialized=true kalir', async () => {
      (Logger as unknown as { initialized: boolean }).initialized = false;
      (Logger as unknown as { initPromise: Promise<void> | null }).initPromise = null;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      (AsyncStorage.getItem as jest.Mock).mockImplementation((anahtar: string) => {
        if (anahtar === ETKIN_ANAHTARI) return Promise.resolve('true');
        // Gecersiz JSON -> JSON.parse firlatir
        if (anahtar === LOGLAR_ANAHTARI) return Promise.resolve('{bozuk-json');
        return Promise.resolve(null);
      });

      await expect(Logger.initialize()).resolves.toBeUndefined();

      // Hata sessizce yutulmadi (loglandi)
      expect(consoleErrorSpy).toHaveBeenCalled();
      // In-memory bos basladi
      expect(Logger.getLogs()).toHaveLength(0);
      // initialized=true: ikinci initialize tekrar getItem cagirmamali
      (AsyncStorage.getItem as jest.Mock).mockClear();
      await Logger.initialize();
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearLogs bekleyen saveTimer-i iptal edip hemen yazar', () => {
    it('clearLogs sonrasi setItem([]) cagrilir ve bekleyen debounce timer iptal edilir', async () => {
      jest.useFakeTimers();
      try {
        await Logger.setEnabled(true);
        // Bekleyen bir saveTimer olusturmak icin log ekle (henuz flush etme)
        Logger.info('T', 'bekleyen');
        // saveTimer su an kurulu olmali
        expect(Logger['saveTimer']).not.toBeNull();

        (AsyncStorage.setItem as jest.Mock).mockClear();

        await Logger.clearLogs();

        // clearLogs debounce'u ATLAYIP hemen bos dizi yazmali
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(LOGLAR_ANAHTARI, '[]');
        // Bekleyen timer iptal edilmis olmali
        expect(Logger['saveTimer']).toBeNull();

        // Iptal edilen timer ilerletilince EK bir yazim olmamali
        (AsyncStorage.setItem as jest.Mock).mockClear();
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    });
  });
});
