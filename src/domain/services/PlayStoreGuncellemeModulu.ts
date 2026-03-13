/**
 * Play Store Guncelleme Modulu — TypeScript Köprüsü
 *
 * Android native PlayStoreGuncellemeModulu.kt'a type-safe erişim sağlar.
 * Sadece Android'de çalışır; diğer platformlarda no-op döner.
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PlayStoreGuncelleme } = NativeModules;

/** Uygulamanın kurulum kaynağı */
export type KurulumKaynagi = 'play_store' | 'sideload' | 'unknown';

/** guncellemeDurumunuKontrolEt sonucu */
export interface PlayStoreGuncellemeDurumu {
  guncellemeMevcut: boolean;
  availableVersionCode?: number;
  hata?: string;
}

/** PlayStoreInstallStateChanged olay verisi */
export interface InstallDurumOlayi {
  /** com.google.android.play.core.install.model.InstallStatus değerleri */
  installStatus: number;
  bytesDownloaded: number;
  totalBytesToDownload: number;
}

/** InstallStatus sabitleri (Play Core'dan) */
export const InstallDurumlari = {
  UNKNOWN: 0,
  PENDING: 1,
  DOWNLOADING: 2,
  DOWNLOADED: 11,
  INSTALLING: 3,
  INSTALLED: 4,
  FAILED: 5,
  CANCELED: 6,
} as const;

// NativeEventEmitter — sadece native modül varsa oluştur
const _emitter =
  Platform.OS === 'android' && PlayStoreGuncelleme
    ? new NativeEventEmitter(PlayStoreGuncelleme)
    : null;

/**
 * Play Store native modülüne erişim nesnesi.
 * Tüm metodlar güvenli — native modül yoksa (iOS, emülatör) graceful fallback döner.
 */
export const PlayStoreModulu = {
  /**
   * Uygulamanın hangi kaynaktan kurulduğunu döner.
   * "play_store" → Google Play Store
   * "sideload"   → APK ile manuel kurulum (GitHub vb.)
   * "unknown"    → Tespit edilemedi
   */
  async kurulumKaynagiGetir(): Promise<KurulumKaynagi> {
    if (Platform.OS !== 'android' || !PlayStoreGuncelleme) {
      return 'unknown';
    }
    try {
      return await PlayStoreGuncelleme.kurulumKaynagiGetir();
    } catch {
      return 'unknown';
    }
  },

  /**
   * Play Store'da güncelleme var mı kontrol eder.
   * Play Store erişilemezse veya hata olursa { guncellemeMevcut: false } döner.
   */
  async guncellemeDurumunuKontrolEt(): Promise<PlayStoreGuncellemeDurumu> {
    if (Platform.OS !== 'android' || !PlayStoreGuncelleme) {
      return { guncellemeMevcut: false };
    }
    try {
      return await PlayStoreGuncelleme.guncellemeDurumunuKontrolEt();
    } catch (e: any) {
      return { guncellemeMevcut: false, hata: e?.message };
    }
  },

  /**
   * FLEXIBLE update flow başlatır (native Play Store bottom sheet).
   * Kullanıcı "Güncelle"ye basarsa indirme arka planda başlar.
   * Promise "DOWNLOADED" ile resolve olunca guncellemeYuklemeyiTamamla çağır.
   */
  async esnekGuncellemeBaslat(): Promise<string> {
    if (Platform.OS !== 'android' || !PlayStoreGuncelleme) {
      throw new Error('Play Store modülü mevcut değil');
    }
    return await PlayStoreGuncelleme.esnekGuncellemeBaslat();
  },

  /**
   * İndirme tamamlandıktan sonra güncellemeyi uygular.
   * Uygulama yeniden başlar.
   */
  async guncellemeYuklemeyiTamamla(): Promise<boolean> {
    if (Platform.OS !== 'android' || !PlayStoreGuncelleme) {
      return false;
    }
    return await PlayStoreGuncelleme.guncellemeYuklemeyiTamamla();
  },

  /**
   * İndirme durumu değişikliklerini dinler.
   * @param handler InstallDurumOlayi olayını işleyen fonksiyon
   * @returns Aboneliği iptal eden fonksiyon
   */
  installDurumDinle(handler: (olay: InstallDurumOlayi) => void): () => void {
    if (!_emitter) return () => {};
    const subscription = _emitter.addListener('PlayStoreInstallStateChanged', handler);
    return () => subscription.remove();
  },
};
