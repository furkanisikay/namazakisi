/**
 * Ortak mezhep ayarı (Kaza Defteri 2.0 ile ortaklaştı; önceden yalnız seferîlik
 * kartındaydı) — saf tipler ve normalize.
 *
 * Tüketiciler: seferîlik bilgi kartı (kalış süresi, cem) ve kaza defterinde
 * vitirin otomatik eklenmesi (Hanefî: vacip → eklenir).
 *
 * ⚠️ NAMAZ VAKTİ HESABINA DOKUNMAZ. İkindi daima asr-ı evvel'dir
 * (`turkiyeHesapParametreleri()`, Diyanet takvimi); "Hanefî kullanıcıya Hanefî
 * ikindi" sezgisiyle buraya bağlamak ikindiyi ~45 dk kaydırır. Nöbetçi:
 * `mezhepAyari.test.ts`.
 */

export type Mezhep = 'hanefi' | 'safii';

export const MEZHEPLER: readonly Mezhep[] = ['hanefi', 'safii'];

/** Görünen mezhep adları (sabit harita — `toUpperCase`/`toLowerCase` kullanılmaz). */
export const MEZHEP_ADLARI: Record<Mezhep, string> = {
  hanefi: 'Hanefî',
  safii: 'Şâfiî',
};

export const VARSAYILAN_MEZHEP: Mezhep = 'hanefi';

/** Kayıtlı ayar biçimi: `{ mezhep }`. */
export interface MezhepAyari {
  mezhep: Mezhep;
}

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
 */
export function mezhepGocKarari(ortakHam: unknown, seferilikHam: unknown): { mezhep: Mezhep; yazilmali: boolean } {
  if (ortakHam !== null && ortakHam !== undefined) {
    return { mezhep: mezhepNormalize(ortakHam), yazilmali: false };
  }
  const eski =
    seferilikHam && typeof seferilikHam === 'object' && !Array.isArray(seferilikHam)
      ? (seferilikHam as Record<string, unknown>).mezhep
      : undefined;
  return { mezhep: mezhepNormalize(eski), yazilmali: true };
}

/** Vitir (Hanefî'de vacip) kaza defterine otomatik eklenir mi? */
export const vitirOtomatikEklenirMi = (mezhep: Mezhep): boolean => mezhep === 'hanefi';
