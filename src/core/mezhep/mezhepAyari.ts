/**
 * Ortak mezhep ayarı (Kaza Defteri 2.0 ile ortaklaştı; önceden yalnız seferîlik
 * kartındaydı) — saf tipler ve normalize.
 *
 * Tüketiciler: seferîlik bilgi kartı (kalış süresi, cem) ve kaza defterinde
 * vitirin otomatik eklenmesi (Hanefî: vacip → eklenir).
 *
 * ⚠️ NAMAZ VAKTİ HESABINA DOKUNMAZ. İkindi hesabı hesap yöntemi ayarındadır
 * (`core/vakit/hesapProfilleri`, Türkiye'de Diyanet = asr-ı evvel); "Hanefî kullanıcıya
 * Hanefî ikindi" sezgisiyle buraya bağlamak Türkiye'de ikindiyi ~45 dk kaydırır. Nöbetçi:
 * `mezhepAyari.test.ts`.
 */

import { canli } from '../dil/aktifDil';

export type Mezhep = 'hanefi' | 'safii';

export const MEZHEPLER: readonly Mezhep[] = ['hanefi', 'safii'];

/** Görünen mezhep adları, etkin dilde (sözlük `seferilik.mezhepler`; sabit harita). */
export const MEZHEP_ADLARI: Readonly<Record<Mezhep, string>> = canli((s) => s.seferilik.mezhepler);

export const VARSAYILAN_MEZHEP: Mezhep = 'hanefi';

/**
 * Kayıtlı ayar biçimi: `{ mezhep, secildi? }`. `secildi` kullanıcının ekrandan
 * BİLİNÇLİ seçtiğini söyler; eski yedeğin seferîlik mezhebi onu ezmez.
 */
export interface MezhepAyari {
  mezhep: Mezhep;
  secildi?: boolean;
}

/** Ham seferîlik kaydındaki GEÇERLİ mezhep (yoksa `null`; varsayılana düşülmez). */
export function seferilikMezhebi(seferilikHam: unknown): Mezhep | null {
  if (!seferilikHam || typeof seferilikHam !== 'object' || Array.isArray(seferilikHam)) return null;
  const m = (seferilikHam as Record<string, unknown>).mezhep;
  return m === 'hanefi' || m === 'safii' ? m : null;
}

/** Ortak ayar kullanıcının bilinçli seçimi mi? */
export const mezhepSecildiMi = (ortakHam: unknown): boolean =>
  !!ortakHam && typeof ortakHam === 'object' && (ortakHam as Record<string, unknown>).secildi === true;

/** Ham değeri mezhebe çevirir; tanınmayan her şey varsayılana düşer. */
export function mezhepNormalize(ham: unknown): Mezhep {
  if (ham === 'safii') return 'safii';
  if (ham === 'hanefi') return 'hanefi';
  if (ham && typeof ham === 'object' && !Array.isArray(ham)) {
    return mezhepNormalize((ham as Record<string, unknown>).mezhep);
  }
  return VARSAYILAN_MEZHEP;
}

/**
 * Ortak ayar henüz yazılmamışsa (eski kurulum) seferîlik kaydındaki mezhep
 * kaynak alınır. Ortak ayar varsa O kazanır. Saf: göçün karar kısmı.
 *
 * Hiçbir kaynak yoksa varsayılan döner ama KALICI YAZILMAZ: yazılsaydı sonradan
 * geri yüklenen eski yedekteki seferîlik mezhebi (ör. Şâfiî) ortak ayara hiç
 * ulaşamaz ve vitir her gün borca eklenirdi.
 */
export function mezhepGocKarari(ortakHam: unknown, seferilikHam: unknown): { mezhep: Mezhep; yazilmali: boolean } {
  if (ortakHam !== null && ortakHam !== undefined) {
    return { mezhep: mezhepNormalize(ortakHam), yazilmali: false };
  }
  const eski = seferilikMezhebi(seferilikHam);
  return eski ? { mezhep: eski, yazilmali: true } : { mezhep: VARSAYILAN_MEZHEP, yazilmali: false };
}

/** Vitir (Hanefî'de vacip) kaza defterine otomatik eklenir mi? */
export const vitirOtomatikEklenirMi = (mezhep: Mezhep): boolean => mezhep === 'hanefi';
