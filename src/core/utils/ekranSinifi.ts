/**
 * Pencere boyut sınıfı (katlanabilir/tablet düzeni, issue #283).
 *
 * Material "window size class" kırılımları, dp cinsinden PENCERE GENİŞLİĞİ ile:
 *   <600 kompakt (telefon) · 600–839 orta (Fold iç ekranı dikey, küçük tablet)
 *   · ≥840 geniş (tablet yatay, açık Fold yatay).
 *
 * Neden ekran değil PENCERE genişliği: bölünmüş ekran / serbest pencere
 * kipinde tablet bile kompakt bir pencere verir; düzen o pencereye uymalı.
 * React Native'in `useWindowDimensions` değeri zaten dp (density-independent)
 * olduğu için ölçek dönüşümü gerekmez.
 *
 * SAF: react-native'e bağımlı değildir; hook (`useEkranSinifi`) ayrı dosyadadır.
 */

export type EkranSinifi = 'kompakt' | 'orta' | 'genis';

/** Bu genişlikten (dahil) itibaren pencere "orta" sınıftır. */
export const ORTA_KIRILIM_DP = 600;
/** Bu genişlikten (dahil) itibaren pencere "geniş" sınıftır. */
export const GENIS_KIRILIM_DP = 840;
/**
 * Geniş pencerede metin ağırlıklı (ayar) ekranların içerik sütunu üst sınırı.
 * Satır çok uzayınca okunurluk düşer; 640 dp, telefon için tasarlanmış ayar
 * kartlarını gereksiz germeden ortalar.
 */
export const OKUNABILIR_MAKS_GENISLIK_DP = 640;

/**
 * Pencere genişliğinden (dp) boyut sınıfını hesaplar.
 * Geçersiz değer (NaN, negatif, sonsuz) güvenli tarafa — kompakta — düşer:
 * telefon düzeni her genişlikte çalışır, iki bölmeli düzen dar pencerede çalışmaz.
 */
export function ekranSinifiHesapla(genislikDp: number): EkranSinifi {
  if (!Number.isFinite(genislikDp) || genislikDp < ORTA_KIRILIM_DP) return 'kompakt';
  if (genislikDp < GENIS_KIRILIM_DP) return 'orta';
  return 'genis';
}

/** Ana ekran iki bölmeli (solda vakit kartı, sağda günlük akış) mı çizilmeli? */
export function ikiBolmeliMi(sinif: EkranSinifi): boolean {
  return sinif !== 'kompakt';
}

/**
 * İçerik sütunu daraltılmalı mı? Yalnız pencere okunabilir genişlikten
 * gerçekten genişse — orta sınıfın 600–640 dp aralığında anlamsız kenar
 * boşluğu üretmek yerine tam genişlik kullanılır.
 */
export function icerikDaraltilmaliMi(genislikDp: number): boolean {
  return Number.isFinite(genislikDp) && genislikDp > OKUNABILIR_MAKS_GENISLIK_DP;
}

/**
 * Gezinme yüzeyi (Material 3 / iPadOS): kompakt → alt sekme çubuğu; orta → 80 dp ray
 * (ikon üstte, etiket altta); geniş → kalıcı kenar çubuğu (ikon + etiket yan yana).
 */
export type GezinmeTuru = 'alt' | 'ray' | 'kenar';

export const RAY_GENISLIGI_DP = 80;
export const KENAR_GENISLIGI_DP = 220;

export function gezinmeTuruSec(genislikDp: number): GezinmeTuru {
  const sinif = ekranSinifiHesapla(genislikDp);
  return sinif === 'kompakt' ? 'alt' : sinif === 'orta' ? 'ray' : 'kenar';
}

/** Gezinme yüzeyinin kapladığı genişlik (dp); alt çubukta 0. */
export function gezinmeGenisligi(tur: GezinmeTuru): number {
  return tur === 'ray' ? RAY_GENISLIGI_DP : tur === 'kenar' ? KENAR_GENISLIGI_DP : 0;
}

/** Bugün ekranının üç sütunu için gereken İÇERİK genişliği (gezinme hariç). */
export const UC_SUTUN_ICERIK_MIN_DP = 960;

/**
 * Bugün yatay üç sütun mu (vakit kartı | akış | "Bu hafta")? Yalnız yatay pencerede ve
 * gezinme yüzeyi düşüldükten sonra yeterli genişlik kaldıysa; dikeyde iki sütun.
 */
export function ucSutunluMu(genislikDp: number, yukseklikDp: number): boolean {
  if (!Number.isFinite(genislikDp) || !Number.isFinite(yukseklikDp) || genislikDp <= yukseklikDp) return false;
  return genislikDp - gezinmeGenisligi(gezinmeTuruSec(genislikDp)) >= UC_SUTUN_ICERIK_MIN_DP;
}

/** Ayarlar ve Kaza ana-ayrıntı (solda liste, sağda sayfa) mı? Yalnız geniş pencerede. */
export function anaAyrintiMi(genislikDp: number): boolean {
  return ekranSinifiHesapla(genislikDp) === 'genis';
}
