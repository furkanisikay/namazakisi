/**
 * Kaza Defteri özelliği için tip tanımları
 */

export type KazaNamazAdi = 'Sabah' | 'Öğle' | 'İkindi' | 'Akşam' | 'Yatsı' | 'Vitir';

export const KAZA_NAMAZ_LISTESI: KazaNamazAdi[] = [
  'Sabah',
  'Öğle',
  'İkindi',
  'Akşam',
  'Yatsı',
  'Vitir',
];

/**
 * Tek bir namaz türü için kaza takip verisi
 */
export interface KazaNamaz {
  namazAdi: KazaNamazAdi;
  toplamBorc: number;    // Eklenen toplam borç miktarı
  kalanBorc: number;     // Henüz kılınmamış kaza sayısı
  tamamlanan: number;    // Toplam kılınan (tüm zamanlar)
}

/**
 * Kaza Defteri'nin tüm durumu
 */
export interface KazaDurumu {
  namazlar: KazaNamaz[];       // 6 namaz türü (Vitir dahil)
  toplamKalan: number;         // Tüm kalanların toplamı
  toplamTamamlanan: number;    // Tüm tamamlananların toplamı

  // Günlük takip
  gunlukHedef: number;         // Günlük hedef (0 = belirsiz)
  gunlukTamamlanan: number;    // Bugün kılınan kaza sayısı
  gunlukHedefTarihi: string;   // YYYY-MM-DD — gece sıfırlama için

  // Gizlilik
  toplamGizleMi: boolean;      // Toplam borç sayısını blur'la gizle

  // Meta
  guncellemeTarihi: string;
}

/**
 * Hesaplama Sihirbazı için kullanıcı girdisi
 */
export interface HesaplamaSihirbazGirdisi {
  dogumTarihi: string;               // YYYY-MM-DD
  ergenlikYasi: number;              // Varsayılan: erkek=14, kız=12
  kildigiTahminiYuzdesi: number;     // 0–100: bugüne kadar namazların yüzde kaçını kıldı
}

/**
 * Motivasyon önerisi — "Her vakitten sonra X kaza kılsan Y günde biter"
 */
export interface MotivasyonOnerisi {
  kazaAdediPerVakit: number;       // Örn: 3
  toplamGunlukKaza: number;        // kazaAdediPerVakit × 6 vakit
  tamamlanmaGunSayisi: number;     // toplamKalan / toplamGunlukKaza
  tamamlanmaAySayisi: number;      // tamamlanmaGunSayisi / 30
  aciklama: string;                // "Her vakitten sonra 3 kaza kılsan 47 günde biter"
}

/**
 * Kaza istatistikleri — haftalık tempo ve tahmini tamamlanma
 */
export interface KazaIstatistik {
  haftaOrtalamasi: number;                  // Son 7 günde günlük ortalama kaza sayısı
  tahminiTamamlanmaTarihi: string | null;   // ISO tarih — mevcut tempoya göre
  tahminiTamamlanmaGunSayisi: number | null;
  motivasyonOnerileri: MotivasyonOnerisi[];
}
