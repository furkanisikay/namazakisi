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
});
