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
const SAVE_DEBOUNCE_MS = 1000; // Ardisik yazimlar birlestirilir

class LoggerClass {
  private enabled: boolean = false;
  private logs: LogEntry[] = [];
  private initialized: boolean = false;
  // Eslezamanli initialize() cagrilerini tek bir Promise'e baglar
  private initPromise: Promise<void> | null = null;
  // Debounced storage yazimi icin timer
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Logger'i baslatir ve ayarlari yukler.
   * Eslezamanli cagrilarda ayni Promise donulur; basarili veya basarisiz
   * tamamlanma sonrasinda this.initialized = true set edilir.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
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
      } catch (error) {
        // Storage okuma veya JSON.parse hatasi: in-memory bos basla, hata sessizce gecilmez
        console.error('[Logger] initialize() storage okuma/parse hatasi:', error);
      } finally {
        // Basarisiz olsa bile tekrar denemeyi engelle
        this.initialized = true;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Debug modunu acip kapatir.
   * @returns true ise ayar kalici olarak kaydedildi, false ise sadece oturum icin aktif.
   */
  async setEnabled(enabled: boolean): Promise<boolean> {
    this.enabled = enabled;
    try {
      await AsyncStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
      return true;
    } catch (error) {
      console.error('[Logger] Enabled ayari kaydedilemedi:', error);
      return false;
    }
  }

  /**
   * Debug modunun aktif olup olmadigini dondurur
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Log ekler — senkron (console + in-memory anlık, storage debounced)
   */
  private addLog(level: LogLevel, tag: string, message: string, data?: unknown): void {
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

    // Debug modu kapaliysa storage'a kaydetme
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

    // Storage yazimini debounce et: ardisik loglar tek bir yazima indirgenir
    this.scheduleSave();
  }

  /**
   * Storage yazimini debounce ederek I/O thrashing'i onler
   */
  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.saveLogs(); // ic metod, kendi try-catch'i var
    }, SAVE_DEBOUNCE_MS);
  }

  /**
   * DEBUG seviyesinde log (senkron)
   */
  debug(tag: string, message: string, data?: unknown): void {
    this.addLog(LogLevel.DEBUG, tag, message, data);
  }

  /**
   * INFO seviyesinde log (senkron)
   */
  info(tag: string, message: string, data?: unknown): void {
    this.addLog(LogLevel.INFO, tag, message, data);
  }

  /**
   * WARN seviyesinde log (senkron)
   */
  warn(tag: string, message: string, data?: unknown): void {
    this.addLog(LogLevel.WARN, tag, message, data);
  }

  /**
   * ERROR seviyesinde log (senkron)
   */
  error(tag: string, message: string, data?: unknown): void {
    this.addLog(LogLevel.ERROR, tag, message, data);
  }

  /**
   * Tum loglari dondurur (en yeni once)
   */
  getLogs(): LogEntry[] {
    return [...this.logs].reverse();
  }

  /**
   * Belirli seviyedeki loglari dondurur (en yeni once)
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level).reverse();
  }

  /**
   * Loglari temizler ve hemen storage'a yazar (debounce'u atlar)
   */
  async clearLogs(): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
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
