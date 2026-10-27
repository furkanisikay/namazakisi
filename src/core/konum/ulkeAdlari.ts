/**
 * Ülke adı (ISO alfa-2 → görünen ad). Tablo `ulkeAdlariVerisi.ts` (üretilmiş, CLDR).
 * Dil tabloda yoksa İngilizceye, o da yoksa koda düşer.
 */
import { ULKE_ADLARI } from './ulkeAdlariVerisi';

export function ulkeAdi(kod: string, dil = 'tr'): string {
  return ULKE_ADLARI[dil]?.[kod] ?? ULKE_ADLARI.en?.[kod] ?? kod;
}
