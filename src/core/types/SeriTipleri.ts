/**
 * Seri (Streak), Rozet ve Seviye sistemleri icin TypeScript tipleri
 * Baris Ozcan'in "zinciri kirma" motivasyonu ve Duolingo streak sisteminden esinlenilmistir
 */

// ==================== SERI (STREAK) TIPLERI ====================

/**
 * Toparlanma (Recovery) Durumu - Seri bozuldugunda aktif olur
 * Kullanici 5 gun tam kilarak onceki serisini kurtarabilir
 */
export interface ToparlanmaDurumu {
  /** Tamamlanan toparlanma gun sayisi */
  tamamlananGun: number;
  /** Toparlanma baslangic tarihi (ISO format) */
  baslangicTarihi: string;
  /** Hedef gun sayisi (varsayilan 5) */
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
  /** Gun bitis saati - DEPRECATED: Artık otomatik hesaplanıyor (imsak vaktine göre) */
  gunBitisSaati: string;
  /** Seri hatirlaticilari aktif mi */
  bildirimlerAktif: boolean;
  /** Toparlanma icin gereken gun sayisi (varsayilan 5) */
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
  gunBitisSaati: '05:00', // DEPRECATED - artık otomatik hesaplanıyor
  bildirimlerAktif: true,
  toparlanmaGunSayisi: 5,
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

/**
 * Onceden tanimlanmis seri hedefleri
 */
export const SERI_HEDEFLERI: SeriHedefi[] = [
  {
    gun: 7,
    ad: 'Ilk Hafta',
    aciklama: '7 gun kesintisiz namaz kil',
    ikon: '🌱',
    rozetId: 'ilk_adim',
  },
  {
    gun: 21,
    ad: 'Aliskanlik Ustasi',
    aciklama: '21 gun - aliskanlik olusturma suresi',
    ikon: '🔥',
    rozetId: 'aliskanlik_ustasi',
  },
  {
    gun: 60,
    ad: 'Kararlilik',
    aciklama: '60 gun kesintisiz devam',
    ikon: '💎',
    rozetId: 'kararlilik',
  },
  {
    gun: 90,
    ad: 'Efsane',
    aciklama: '90 gun - ustun kararlilik',
    ikon: '👑',
    rozetId: 'efsane',
  },
];

// ==================== SEVIYE TANIMLARI ====================

/**
 * Tum seviye tanimlari
 */
export const SEVIYE_TANIMLARI: SeviyeTanimi[] = [
  { seviye: 1, minPuan: 0, rank: 'Mubtedi', ikon: '🌙' },
  { seviye: 2, minPuan: 100, rank: 'Talip', ikon: '⭐' },
  { seviye: 3, minPuan: 300, rank: 'Salik', ikon: '🌟' },
  { seviye: 4, minPuan: 600, rank: 'Murid', ikon: '💫' },
  { seviye: 5, minPuan: 1000, rank: 'Arif', ikon: '✨' },
  { seviye: 6, minPuan: 1500, rank: 'Hafiz', ikon: '🏆' },
  { seviye: 7, minPuan: 2500, rank: 'Kamil', ikon: '👑' },
];

// ==================== ROZET TANIMLARI ====================

/**
 * Tum rozet tanimlari
 */
export const ROZET_TANIMLARI: RozetTanimi[] = [
  // Seri rozetleri
  {
    id: 'ilk_adim',
    ad: 'Ilk Adim',
    aciklama: 'Ilk haftayi tamamladiniz!',
    ikon: '🌱',
    tip: 'seri',
    seviye: 'bronz',
    kosul: 7,
    kosulAciklamasi: '7 gunluk seri',
  },
  {
    id: 'aliskanlik_ustasi',
    ad: 'Aliskanlik Ustasi',
    aciklama: '21 gun - aliskanlik olusturma suresi tamamlandi!',
    ikon: '🔥',
    tip: 'seri',
    seviye: 'gumus',
    kosul: 21,
    kosulAciklamasi: '21 gunluk seri',
  },
  {
    id: 'kararlilik',
    ad: 'Kararlilik',
    aciklama: '60 gun kesintisiz namaz kildiniz!',
    ikon: '💎',
    tip: 'seri',
    seviye: 'altin',
    kosul: 60,
    kosulAciklamasi: '60 gunluk seri',
  },
  {
    id: 'efsane',
    ad: 'Efsane',
    aciklama: '90 gun - ustun kararlilik gosterdiniz!',
    ikon: '👑',
    tip: 'seri',
    seviye: 'elmas',
    kosul: 90,
    kosulAciklamasi: '90 gunluk seri',
  },
  // Ozel rozetler
  {
    id: 'toparlanma_ustasi',
    ad: 'Toparlanma Ustasi',
    aciklama: '3 kez toparlanma modunu basariyla tamamladiniz!',
    ikon: '🔄',
    tip: 'ozel',
    seviye: 'gumus',
    kosul: 3,
    kosulAciklamasi: '3 kez toparlanma',
  },
  {
    id: 'mukemmeliyetci',
    ad: 'Mukemmeliyetci',
    aciklama: '30 gun boyunca 5/5 namaz kildiniz!',
    ikon: '⭐',
    tip: 'ozel',
    seviye: 'altin',
    kosul: 30,
    kosulAciklamasi: '30 gun 5/5 namaz',
  },
  // Toplam rozetler
  {
    id: 'yuz_namaz',
    ad: '100 Namaz',
    aciklama: 'Toplam 100 namaz kildiniz!',
    ikon: '💯',
    tip: 'toplam',
    seviye: 'bronz',
    kosul: 100,
    kosulAciklamasi: '100 namaz kilmak',
  },
  {
    id: 'bin_namaz',
    ad: '1000 Namaz',
    aciklama: 'Toplam 1000 namaz kildiniz!',
    ikon: '🏅',
    tip: 'toplam',
    seviye: 'altin',
    kosul: 1000,
    kosulAciklamasi: '1000 namaz kilmak',
  },
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

/**
 * Varsayilan gun bitis saati secenekleri
 */
export const GUN_BITIS_SAATI_SECENEKLERI: GunBitisSaatiSecenegi[] = [
  { deger: '04:00', etiket: '04:00', aciklama: 'Erken yatanlar icin' },
  { deger: '05:00', etiket: '05:00', aciklama: 'Varsayilan - cogu imsak vaktinden once' },
  { deger: '06:00', etiket: '06:00', aciklama: 'Gec yatanlar icin' },
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


