/**
 * Logger Utility
 * Profesyonel hata kayit sistemi
 * Uretim ortaminda bile kullanilabilir
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  tag: string;
  message: string;
  data?: unknown;
}

const STORAGE_KEY = '@namazakisi:logs';
const ENABLED_KEY = '@namazakisi:debug_enabled';
const MAX_LOGS = 500; // Maksimum log sayisi
const MAX_LOG_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gun

class LoggerClass {
  private enabled: boolean = false;
  private logs: LogEntry[] = [];
  private initialized: boolean = false;

  /**
   * Logger'i baslatir ve ayarlari yukler
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const [enabledStr, logsStr] = await Promise.all([
        AsyncStorage.getItem(ENABLED_KEY),
        AsyncStorage.getItem(STORAGE_KEY),
      ]);

      this.enabled = enabledStr === 'true';
      
      if (logsStr) {
        const allLogs: LogEntry[] = JSON.parse(logsStr);
        // Eski loglari temizle
        const now = Date.now();
        this.logs = allLogs.filter(
          (log) => now - log.timestamp < MAX_LOG_AGE_MS
        );
        
        // Fazla loglari temizle
        if (this.logs.length > MAX_LOGS) {
          this.logs = this.logs.slice(-MAX_LOGS);
        }
        
        await this.saveLogs();
      }

      this.initialized = true;
    } catch (error) {
      console.error('[Logger] Baslangic hatasi:', error);
    }
  }

  /**
   * Debug modunu acip kapatir
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    try {
      await AsyncStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('[Logger] Enabled ayari kaydedilemedi:', error);
    }
  }

  /**
   * Debug modunun aktif olup olmadigini dondurur
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log ekler
   */
  private async addLog(level: LogLevel, tag: string, message: string, data?: unknown): Promise<void> {
    // Her zaman console'a yaz (development icin)
    const consoleMsg = `[${tag}] ${message}`;
    switch (level) {
      case LogLevel.DEBUG:
        console.log(consoleMsg, data || '');
        break;
      case LogLevel.INFO:
        console.info(consoleMsg, data || '');
        break;
      case LogLevel.WARN:
        console.warn(consoleMsg, data || '');
        break;
      case LogLevel.ERROR:
        console.error(consoleMsg, data || '');
        break;
    }

    // Debug modu kapaliysa kaydetme
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      tag,
      message,
      data,
    };

    this.logs.push(entry);

    // Fazla loglari sil
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }

    await this.saveLogs();
  }

  /**
   * DEBUG seviyesinde log
   */
  async debug(tag: string, message: string, data?: unknown): Promise<void> {
    await this.addLog(LogLevel.DEBUG, tag, message, data);
  }

  /**
   * INFO seviyesinde log
   */
  async info(tag: string, message: string, data?: unknown): Promise<void> {
    await this.addLog(LogLevel.INFO, tag, message, data);
  }

  /**
   * WARN seviyesinde log
   */
  async warn(tag: string, message: string, data?: unknown): Promise<void> {
    await this.addLog(LogLevel.WARN, tag, message, data);
  }

  /**
   * ERROR seviyesinde log
   */
  async error(tag: string, message: string, data?: unknown): Promise<void> {
    await this.addLog(LogLevel.ERROR, tag, message, data);
  }

  /**
   * Tum loglari dondurur
   */
  getLogs(): LogEntry[] {
    return [...this.logs].reverse(); // En yeni log once
  }

  /**
   * Belirli seviyedeki loglari dondurur
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level).reverse();
  }

  /**
   * Loglari temizler
   */
  async clearLogs(): Promise<void> {
    this.logs = [];
    await this.saveLogs();
  }

  /**
   * Loglari export eder (text formatinda)
   */
  exportLogs(): string {
    if (this.logs.length === 0) {
      return 'Log bulunamadi';
    }

    const lines = this.logs.map((log) => {
      const date = new Date(log.timestamp).toISOString();
      const dataStr = log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : '';
      return `[${date}] [${log.level}] [${log.tag}] ${log.message}${dataStr}`;
    });

    return lines.join('\n\n');
  }

  /**
   * Loglari storage'a kaydeder
   */
  private async saveLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('[Logger] Loglar kaydedilemedi:', error);
    }
  }
}

// Singleton instance
export const Logger = new LoggerClass();
