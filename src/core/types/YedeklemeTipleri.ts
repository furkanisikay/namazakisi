/**
 * Yerel yedekleme & aktarım tipleri.
 *
 * Domain (YedeklemeServisi, YedekBirlestirmeServisi), store (yedeklemeSlice) ve
 * sunum (sihirbaz) bu tipleri buradan import eder — domain'in sunuma bağımlı
 * olmaması için paylaşılan tipler `core` katmanındadır.
 *
 * Tasarım: docs/superpowers/specs/2026-06-14-yerel-yedekleme-aktarim-design.md
 */

/** Yedek dosyasının biçim kimliği (dosya doğrulaması için). */
export const YEDEK_BICIMI = 'namaz-akisi-yedek';

/** Yedek payload şema sürümü. Şema değişince artırılır; içe-aktarmada göç tetikler. */
export const YEDEK_SURUMU = 1;

/** Bir günün namaz tamamlanma haritası: { [namazAdi]: tamamlandiMi }. */
export type GunNamazHaritasi = Record<string, boolean>;

/** Tarih → gün namaz haritası. */
export type NamazGunleri = Record<string, GunNamazHaritasi>;

/**
 * Şifreli yedek dosyasının dış zarfı (düz JSON olarak diske yazılır).
 * `veri` alanı şifrelenmiş payload'ı taşır.
 */
export interface YedekZarfi {
  bicim: string;
  surum: number;
  /** ISO 8601 oluşturulma zamanı. */
  olusturulma: string;
  /** Yedeği oluşturan uygulama sürümü. */
  uygulamaSurumu: string;
  sifreli: boolean;
  /** secretbox nonce (base64). */
  nonce: string;
  /** Şifrelenmiş payload (base64). */
  veri: string;
  /** Payload düz-metninin SHA-256'sı (bütünlük doğrulaması). */
  kontrol: string;
}

/** Şifre çözüldükten sonra elde edilen yedek içeriği. */
export interface YedekPayload {
  namazGunleri: NamazGunleri;
  kilinanVakitler: Record<string, string[]>;
  seri: unknown;
  rozetler: unknown[];
  seviye: unknown;
  bonusPuan: number;
  istatistik: { toplamKilinan: number; mukemmelGun: number; toparlanma: number };
  /**
   * Eski (`KazaDurumu`) şekilli anlık görüntü. Kaza Defteri 2.0'dan beri defterden
   * TÜRETİLİP yazılır (eski sürümlü cihazlar için); okurken yalnız hareket alanı
   * olmayan (eski sürüm) yükte göç / "en az bu kadar kılındı" kaynağıdır.
   */
  kaza: unknown;
  kazaTempo: Record<string, number>;
  /**
   * Kaza Defteri 2.0 hareketleri (değişmez defter). OPSİYONEL: eski yedeklerde
   * yoktur, eski uygulama bilinmeyen alanı yok sayar → `YEDEK_SURUMU` artmadı.
   */
  kazaHareketleri?: unknown[];
  /**
   * Cihazlar arası olay günlüğü (`core/cihazAgi/olayGunlugu.ts`). OPSİYONEL ve bugün HİÇBİR
   * üretici yazmaz: alan yoksa özet birebir eskisidir. Bir üretici eklenmeden ÖNCE birleştirme
   * (kimliğe göre birleşim + `olaylariUygula`) yazılmalı — yoksa iki cihaz aynı özete ulaşamaz.
   */
  cihazOlaylari?: unknown[];
  ayarlar: Record<string, unknown>;
}

/** İçe-aktarma birleştirme stratejisi. */
export type BirlestirmeStratejisi = 'akilli' | 'uzerineYaz' | 'eksikleriEkle' | 'gelismis';

/** Kategori bazında uygulanabilir strateji (Gelişmiş hariç — o üst seviyedir). */
export type KategoriStratejisi = Exclude<BirlestirmeStratejisi, 'gelismis'>;

/** "Gelişmiş" modda kategori-kategori strateji seçimi. */
export interface KategoriSecimleri {
  namaz: KategoriStratejisi;
  puan: KategoriStratejisi;
  kaza: KategoriStratejisi;
  ayarlar: KategoriStratejisi;
}

/** İçe-aktarma yazım planı: AsyncStorage anahtarı → yazılacak değer. Boş = yazma. */
export type YazimPlani = Record<string, unknown>;

/** İçe-aktarma öncesi kullanıcıya gösterilen karşılaştırma özeti. */
export interface FarkOzeti {
  gelenGunSayisi: number;
  mevcutGunSayisi: number;
  cakisanGunSayisi: number;
  rozetVar: boolean;
  kazaVar: boolean;
  ayarVar: boolean;
}
