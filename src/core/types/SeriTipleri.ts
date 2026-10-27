/**
 * Seri (Streak), Rozet ve Seviye sistemleri icin TypeScript tipleri
 * Baris Ozcan'in "zinciri kirma" motivasyonu ve Duolingo streak sisteminden esinlenilmistir
 */

import { metin } from '../dil/aktifDil';
import type { Sozluk } from '../dil/sozluk/tr';

// ==================== SERI (STREAK) TIPLERI ====================

/**
 * Toparlanma (Recovery) Durumu - Seri bozuldugunda aktif olur
 * Kullanici ard arda `toparlanmaGunSayisi` (varsayilan 2) gun tam kilarak onceki serisini
 * kurtarabilir
 */
export interface ToparlanmaDurumu {
  /** Tamamlanan toparlanma gun sayisi */
  tamamlananGun: number;
  /** Toparlanma baslangic tarihi (ISO format) */
  baslangicTarihi: string;
  /** Hedef gun sayisi (varsayilan 2) */
  hedefGunSayisi: number;
  /** Kurtarilacak onceki seri degeri */
  oncekiSeri: number;
}

/**
 * Seri (Streak) Durumu
 * Kullanicinin mevcut seri bilgilerini icerir
 */
export interface SeriDurumu {
  /** Mevcut seri gun sayisi */
  mevcutSeri: number;
  /** En uzun seri rekoru */
  enUzunSeri: number;
  /** Son tam kilinan gun tarihi (ISO format) */
  sonTamGun: string | null;
  /** Mevcut serinin baslangic tarihi (ISO format) */
  seriBaslangici: string | null;
  /** Toparlanma modu durumu (null ise normal mod) */
  toparlanmaDurumu: ToparlanmaDurumu | null;
  /** Seri donduruldu mu (ozel gun modu) */
  dondurulduMu: boolean;
  /** Seri dondurulma tarihi (ISO format) */
  dondurulmaTarihi: string | null;
  /** Son guncelleme zamani (ISO format) */
  sonGuncelleme: string;
  /**
   * Bugun "tam" sayilmadan ONCEki streak durumu. Ayni-gun geri-alimi (5/5 -> 4/5) icin:
   * bugun tam sayildiginda doldurulur, ayni gun tam-altina dusurulurse bu duruma donulur.
   * Eski verilerde olmayabilir (opsiyonel). `tarih` alani hangi gune ait oldugunu soyler;
   * baska bir gune ait snapshot ASLA uygulanmaz (bkz. SeriHesaplayiciServisi).
   */
  bugunOncesi?: BugunOncesiSnapshot | null;
  /**
   * Bugun icin verilen seri/gun bonusu (Faz 1b). Bugun tam sayilirken set edilir; ayni gun
   * geri alininca bu kadar bonus da geri dusulur (negatif kazanilanPuan). Eski verilerde olmayabilir.
   */
  bugunKazanilanPuan?: number | null;
}

/** seriHesapla'nin ayni-gun geri-alimi icin sakladigi minimal onceki-durum snapshot'i. */
export interface BugunOncesiSnapshot {
  /**
   * Snapshot'in ait oldugu namaz gunu (ISO). Yalnizca "bugun" ile eslesen snapshot geri
   * alinabilir; eski kayitlarda olmayabilir (o zaman bayat sayilir ve uygulanmaz).
   */
  tarih?: string;
  mevcutSeri: number;
  enUzunSeri: number;
  sonTamGun: string | null;
  seriBaslangici: string | null;
  toparlanmaDurumu: ToparlanmaDurumu | null;
  dondurulduMu: boolean;
  dondurulmaTarihi: string | null;
}

// ==================== OZEL GUN (MAZERET) TIPLERI ====================

/**
 * Ozel Gun (Mazeret) Kaydi
 */
export interface OzelGunKaydi {
  id: string;
  baslangicTarihi: string;  // ISO format (YYYY-MM-DD)
  bitisTarihi: string;      // ISO format (YYYY-MM-DD)
  aciklama?: string;        // Opsiyonel not
  olusturulmaTarihi: string;
}

/**
 * Kullanici Ozel Gun Ayarlari
 */
export interface OzelGunAyarlari {
  /** Kullanici bu ozelligi kullanmak istiyor mu */
  ozelGunModuAktif: boolean;
  /** Suanda aktif olan ozel gun */
  aktifOzelGun: OzelGunKaydi | null;
  /** Gecmis ozel gun kayitlari */
  gecmisKayitlar: OzelGunKaydi[];
}


// ==================== ROZET TIPLERI ====================

/**
 * Rozet tipleri
 * - seri: Seri hedeflerine ulasildiginda kazanilir
 * - toplam: Toplam namaz sayisina gore kazanilir
 * - ozel: Ozel basarimlar icin kazanilir
 */
export type RozetTipi = 'seri' | 'toplam' | 'ozel';

/**
 * Rozet seviyeleri - Nadirlik derecesi
 */
export type RozetSeviyesi = 'bronz' | 'gumus' | 'altin' | 'elmas';

/**
 * Rozet tanimi
 */
export interface RozetTanimi {
  /** Benzersiz rozet kimlik numarasi */
  id: string;
  /** Rozet adi */
  ad: string;
  /** Rozet aciklamasi */
  aciklama: string;
  /** Rozet ikonu (emoji) */
  ikon: string;
  /** Rozet tipi */
  tip: RozetTipi;
  /** Rozet seviyesi */
  seviye: RozetSeviyesi;
  /** Kazanma kosulu (ornegin 21 gun seri) */
  kosul: number;
  /** Kosul aciklamasi */
  kosulAciklamasi: string;
}

/**
 * Kullanici rozeti - Kazanilan rozet bilgisi
 */
export interface KullaniciRozeti {
  /** Rozet tanimi ID'si */
  rozetId: string;
  /** Rozet kazanildi mi */
  kazanildiMi: boolean;
  /** Kazanilma tarihi (ISO format, null ise henuz kazanilmamis) */
  kazanilmaTarihi: string | null;
}

/**
 * Rozet ile tanimi birlestirilmis hali
 */
export interface RozetDetay extends RozetTanimi, KullaniciRozeti { }

// ==================== SEVIYE/RANK TIPLERI ====================

/**
 * Seviye tanimi
 */
export interface SeviyeTanimi {
  /** Seviye numarasi */
  seviye: number;
  /** Bu seviye icin gereken minimum puan */
  minPuan: number;
  /** Rank adi */
  rank: string;
  /** Rank ikonu (emoji) */
  ikon: string;
}

/**
 * Kullanicinin seviye durumu
 */
export interface SeviyeDurumu {
  /** Mevcut seviye numarasi */
  mevcutSeviye: number;
  /** Toplam kazanilan puan */
  toplamPuan: number;
  /** Mevcut seviyedeki puan (min puandan baslayarak) */
  mevcutSeviyePuani: number;
  /** Bir sonraki seviyeye kalan puan */
  sonrakiSeviyeKalanPuan: number;
  /** Mevcut rank adi */
  rank: string;
  /** Mevcut rank ikonu */
  rankIkonu: string;
}

// ==================== GÜN SONU BİLDİRİM MODU TİPLERİ ====================

/**
 * Gün sonu bildirim modu
 * - otomatik: İmsak vaktine göre hesaplanır
 * - sabit: Kullanıcının belirlediği sabit saat
 */
export type GunSonuBildirimModu = 'otomatik' | 'sabit';

/**
 * Sabit bildirim modu için gün seçimi
 * - ayniGun: Gece yarısından önce (18:00-23:59)
 * - ertesiGun: Gece yarısından sonra, imsak öncesi (00:00-imsak)
 */
export type BildirimGunSecimi = 'ayniGun' | 'ertesiGun';

// ==================== KULLANICI AYARLARI ====================

/**
 * Kullanici seri ayarlari
 */
export interface SeriAyarlari {
  /** Tam gun esigi - kac namaz kilinirsa gun tam sayilir (3, 4 veya 5) */
  tamGunEsigi: number;
  /**
   * Gun siniri FALLBACK'i (HH:mm). Seri gunu artik ERTESI IMSAK'ta biter
   * (`SeriHesaplayiciServisi.namazGunuHesapla`); bu alan yalnizca imsak kaynagi
   * (konum) hazir DEGILKEN kullanilir. "DEPRECATED" DEGIL — motor onu hala
   * okuyor; kaldirmak konumsuz cihazda gun sinirini belirsiz birakir.
   */
  gunBitisSaati: string;
  /** Seri hatirlaticilari aktif mi */
  bildirimlerAktif: boolean;
  /**
   * Toparlanma icin gereken gun sayisi (varsayilan 2).
   * Kullanici ayari DEGIL, uygulama kuralidir: diskten okunurken guncel kurala cekilir
   * (`localSeriAyarlariniGetir`).
   */
  toparlanmaGunSayisi: number;
  /** Gun sonu bildirimi aktif mi */
  gunSonuBildirimAktif: boolean;
  /** Gun bitiminden ne kadar once bildirim gonderilsin (dakika) - DEPRECATED */
  gunSonuBildirimDk: number;

  // ====== YENİ: Gün Sonu Bildirim Ayarları ======
  /** Gün sonu bildirim modu: otomatik (imsak öncesi) veya sabit (kullanıcı seçimi) */
  gunSonuBildirimModu: GunSonuBildirimModu;
  /** Otomatik mod: İmsak vaktinden kaç dakika önce bildirim (0-60) */
  bildirimImsakOncesiDk: number;
  /** Sabit mod: Aynı gün mü ertesi gün mü */
  bildirimGunSecimi: BildirimGunSecimi;
  /** Sabit mod: Bildirim saati (0-23) */
  bildirimSaati: number;
  /** Sabit mod: Bildirim dakikası (0-59) */
  bildirimDakikasi: number;
}

/**
 * Varsayilan seri ayarlari
 */
export const VARSAYILAN_SERI_AYARLARI: SeriAyarlari = {
  tamGunEsigi: 5,
  gunBitisSaati: '05:00', // Yalnizca imsak kaynagi yokken kullanilan fallback sinir
  bildirimlerAktif: true,
  toparlanmaGunSayisi: 2,
  gunSonuBildirimAktif: true,
  gunSonuBildirimDk: 60, // DEPRECATED
  // Yeni gün sonu bildirim ayarları
  gunSonuBildirimModu: 'otomatik',
  bildirimImsakOncesiDk: 30,
  bildirimGunSecimi: 'ertesiGun',
  bildirimSaati: 4,
  bildirimDakikasi: 0,
};

// ==================== PUAN SISTEMI ====================

/**
 * Puan kazanma tipleri
 */
export type PuanTipi =
  | 'namaz_kilindi'      // Her kilinin namaz
  | 'tam_gun'            // Gunun tum namazlari kilindiginda bonus
  | 'seri_devam'         // Seri devam ettiginde (seri sayisi kadar puan)
  | 'rozet_kazanildi'    // Rozet kazanildiginda
  | 'toparlanma_tamamlandi'; // Toparlanma basariyla tamamlandiginda

/**
 * Puan degerleri
 */
export const PUAN_DEGERLERI: Record<PuanTipi, number> = {
  namaz_kilindi: 5,
  tam_gun: 10,
  seri_devam: 1, // Seri sayisi ile carpilir
  rozet_kazanildi: 50, // Rozet seviyesine gore artar
  toparlanma_tamamlandi: 25,
};

/**
 * Rozet seviyesine gore bonus puan carpani
 */
export const ROZET_SEVIYE_CARPANI: Record<RozetSeviyesi, number> = {
  bronz: 1,
  gumus: 2,
  altin: 3,
  elmas: 4,
};

// ==================== SERI HEDEFLERI ====================

/**
 * Seri hedef tipi
 */
export interface SeriHedefi {
  /** Hedef gun sayisi */
  gun: number;
  /** Hedef adi */
  ad: string;
  /** Hedef aciklamasi */
  aciklama: string;
  /** Hedef ikonu */
  ikon: string;
  /** Iliskili rozet ID'si */
  rozetId: string;
}

type HedefAnahtari = keyof Sozluk['seri']['hedefler'];
type RozetAnahtari = keyof Sozluk['seri']['rozetler'];

/**
 * Görünen metinler sözlükten (`seri` ad alanı) OKUNDUĞU AN çözülür (getter): tanımı yayan
 * (`{ ...tanim }`) kod o anki dilin metnini kopyalar. Redux'ta saklanan kopyalar dil
 * değişince bayatlar → ekranlar adı kimlikten çizer (`rozetMetni`, `seviyeAdi`).
 */
function seriHedefi(gun: number, ikon: string, rozetId: HedefAnahtari): SeriHedefi {
  return {
    gun,
    get ad() {
      return metin().seri.hedefler[rozetId].ad;
    },
    get aciklama() {
      return metin().seri.hedefler[rozetId].aciklama;
    },
    ikon,
    rozetId,
  };
}

/**
 * Onceden tanimlanmis seri hedefleri
 */
export const SERI_HEDEFLERI: SeriHedefi[] = [
  seriHedefi(7, '🌱', 'ilk_adim'),
  seriHedefi(21, '🔥', 'aliskanlik_ustasi'),
  seriHedefi(60, '💎', 'kararlilik'),
  seriHedefi(90, '👑', 'efsane'),
];

/** Seri hedefinin sentence case adı (Tesbih); bilinmeyen kimlikte `null`. */
export function seriHedefiCumleAdi(rozetId: string): string | null {
  const h = (metin().seri.hedefler as Record<string, { cumle: string } | undefined>)[rozetId];
  return h ? h.cumle : null;
}

// ==================== SEVIYE TANIMLARI ====================

/** Seviye (rank) adı, etkin dilde; bilinmeyen seviyede ilk seviyenin adı. */
export function seviyeAdi(seviye: number): string {
  const adlar = metin().seri.seviyeler;
  return adlar[seviye - 1] ?? adlar[0];
}

function seviyeTanimi(seviye: number, minPuan: number, ikon: string): SeviyeTanimi {
  return {
    seviye,
    minPuan,
    get rank() {
      return seviyeAdi(seviye);
    },
    ikon,
  };
}

/**
 * Tum seviye tanimlari
 */
export const SEVIYE_TANIMLARI: SeviyeTanimi[] = [
  seviyeTanimi(1, 0, '🌙'),
  seviyeTanimi(2, 100, '⭐'),
  seviyeTanimi(3, 300, '🌟'),
  seviyeTanimi(4, 600, '💫'),
  seviyeTanimi(5, 1000, '✨'),
  seviyeTanimi(6, 1500, '🏆'),
  seviyeTanimi(7, 2500, '👑'),
];

// ==================== ROZET TANIMLARI ====================

/** Rozetin görünen metinleri, etkin dilde; bilinmeyen kimlikte `null`. */
export function rozetMetni(id: string): { ad: string; aciklama: string; kosul: string } | null {
  return (metin().seri.rozetler as Record<string, { ad: string; aciklama: string; kosul: string } | undefined>)[id] ?? null;
}

function rozetTanimi(
  id: RozetAnahtari,
  ikon: string,
  tip: RozetTipi,
  seviye: RozetSeviyesi,
  kosul: number
): RozetTanimi {
  return {
    id,
    get ad() {
      return metin().seri.rozetler[id].ad;
    },
    get aciklama() {
      return metin().seri.rozetler[id].aciklama;
    },
    ikon,
    tip,
    seviye,
    kosul,
    get kosulAciklamasi() {
      return metin().seri.rozetler[id].kosul;
    },
  };
}

/**
 * Tum rozet tanimlari
 */
export const ROZET_TANIMLARI: RozetTanimi[] = [
  // Seri rozetleri
  rozetTanimi('ilk_adim', '🌱', 'seri', 'bronz', 7),
  rozetTanimi('aliskanlik_ustasi', '🔥', 'seri', 'gumus', 21),
  rozetTanimi('kararlilik', '💎', 'seri', 'altin', 60),
  rozetTanimi('efsane', '👑', 'seri', 'elmas', 90),
  // Ozel rozetler
  rozetTanimi('toparlanma_ustasi', '🔄', 'ozel', 'gumus', 3),
  rozetTanimi('mukemmeliyetci', '⭐', 'ozel', 'altin', 30),
  // Toplam rozetler
  rozetTanimi('yuz_namaz', '💯', 'toplam', 'bronz', 100),
  rozetTanimi('bin_namaz', '🏅', 'toplam', 'altin', 1000),
];

// ==================== GUN BITIS SAATI SECENEKLERI ====================

/**
 * Gun bitis saati secenegi
 */
export interface GunBitisSaatiSecenegi {
  /** Saat degeri (HH:mm format) */
  deger: string;
  /** Gosterilecek etiket */
  etiket: string;
  /** Aciklama */
  aciklama: string;
}

function gunBitisSecenegi(deger: string, anahtar: keyof Sozluk['seri']['gunBitis']): GunBitisSaatiSecenegi {
  return {
    deger,
    etiket: deger,
    get aciklama() {
      return metin().seri.gunBitis[anahtar];
    },
  };
}

/**
 * Varsayilan gun bitis saati secenekleri
 */
export const GUN_BITIS_SAATI_SECENEKLERI: GunBitisSaatiSecenegi[] = [
  gunBitisSecenegi('04:00', 'erken'),
  gunBitisSecenegi('05:00', 'varsayilan'),
  gunBitisSecenegi('06:00', 'gec'),
];

// ==================== KUTLAMA TIPLERI ====================

/**
 * Kutlama tipi
 */
export type KutlamaTipi =
  | 'rozet_kazanildi'
  | 'hedef_tamamlandi'
  | 'seviye_atlandi'
  | 'toparlanma_tamamlandi'
  | 'en_uzun_seri';

/**
 * Kutlama bilgisi
 */
export interface KutlamaBilgisi {
  /** Kutlama tipi */
  tip: KutlamaTipi;
  /** Baslik */
  baslik: string;
  /** Mesaj */
  mesaj: string;
  /** Ikon */
  ikon: string;
  /** Ekstra veri (rozet, seviye, vb.) */
  ekstraVeri?: Record<string, unknown>;
}


