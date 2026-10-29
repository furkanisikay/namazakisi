/**
 * Ülke adı (ISO alfa-2 → görünen ad). Tablo `ulkeAdlariVerisi.ts` (üretilmiş, CLDR).
 * Dil tabloda yoksa İngilizceye, o da yoksa koda düşer. Özbekçe ve Kazakça tabloda Kirildir;
 * dilin gösterilen yazısı Latinse ad çalışma anında çevrilir (`core/dil/yazi.ts`).
 */
import { yaziyaCevir } from '../dil/aktifDil';
import { dilKoduMu } from '../dil/diller';
import { ULKE_ADLARI } from './ulkeAdlariVerisi';

export function ulkeAdi(kod: string, dil = 'tr'): string {
  const ad = ULKE_ADLARI[dil]?.[kod];
  if (ad === undefined) return ULKE_ADLARI.en?.[kod] ?? kod;
  return dilKoduMu(dil) ? yaziyaCevir(ad, dil) : ad;
}
