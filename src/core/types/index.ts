/**
 * Uygulama genelinde kullanilan TypeScript tipleri
 */

import { NamazAdi } from '../constants/UygulamaSabitleri';

// Seri, Rozet ve Seviye tiplerini export et
export * from './SeriTipleri';

/**
 * Tek bir namaz kaydini temsil eder
 */
export interface Namaz {
  id?: string;
  namazAdi: NamazAdi;
  tamamlandi: boolean;
  tarih: string; // ISO format: yyyy-MM-dd
}

/**
 * Bir gune ait tum namazlari temsil eder
 */
export interface GunlukNamazlar {
  tarih: string;
  namazlar: Namaz[];
}

/**
 * Istatistik ozeti
 */
export interface IstatistikOzeti {
  toplamNamaz: number;
  tamamlananNamaz: number;
  tamamlanmaYuzdesi: number;
}

/**
 * Gunluk istatistik
 */
export interface GunlukIstatistik extends IstatistikOzeti {
  tarih: string;
  gunAdi: string;
}

/**
 * Haftalik istatistik
 */
export interface HaftalikIstatistik extends IstatistikOzeti {
  baslangicTarihi: string;
  bitisTarihi: string;
  gunlukVeriler: GunlukIstatistik[];
  enIyiGun: GunlukIstatistik | null;
}

/**
 * Aylik istatistik
 */
export interface AylikIstatistik extends IstatistikOzeti {
  ay: number;
  yil: number;
  ayAdi: string;
  aktifGunSayisi: number;
  namazBazindaYuzdeler: Record<NamazAdi, number>;
}

/**
 * Kullanici bilgileri
 */
export interface Kullanici {
  id: string;
  email: string | null;
  adSoyad?: string | null;
  avatarUrl?: string | null;
  olusturulmaTarihi: string;
}

/**
 * Auth durumu
 */
export type AuthDurumu = 'yukleniyor' | 'misafir' | 'girisYapildi' | 'hata';

/**
 * Senkronizasyon durumu
 */
export interface SenkronizasyonDurumu {
  sonSenkronizasyon: string | null;
  senkronizeEdiliyor: boolean;
  hata: string | null;
  bekleyenDegisiklikSayisi: number;
}



/**
 * Local depolama formati
 */
export interface LocalNamazVerileri {
  [tarih: string]: {
    [namazAdi: string]: boolean;
  };
}

/**
 * API yanit tipi
 */
export interface ApiYanit<T> {
  basarili: boolean;
  veri?: T;
  hata?: string;
}

