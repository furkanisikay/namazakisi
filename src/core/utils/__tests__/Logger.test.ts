/**
 * Logger test
 * Logger sinifininin davranisini dogrular
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger, LogLevel } from '../Logger';

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
    it('should initialize successfully', async () => {
      await Logger.initialize();
      expect(AsyncStorage.getItem).toHaveBeenCalled();
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
