/**
 * Nass (ayet/hadis) içeriğinin dil kuralı — SAF.
 *
 * Sahip kararı (2026-10-24): Türkçe dışında YALNIZ ayet. Hadis yalnız repoda künyesi
 * doğrulanmış Türkçe metinle gösterilir (lisansı temiz, dereceli bir hadis çeviri seti
 * yok; dinî denetimden geçmemiş hadis çevirisi yayımlanmaz). Ayet meali QuranEnc'ten
 * birebir ve KESİLMEDEN (`ayetMealleri.ts`, üretici `scripts/icerik/ayet-mealleri-uret.js`);
 * künyede yayımcı ve sürüm yazar. Meali olmayan ayet o dilde gösterilmez (tahmin YOK).
 */
import { aktifDil, bicim, sozluk } from '../dil/aktifDil';
import type { DilKodu } from '../dil/diller';
import { AYET_MEALLERI } from '../data/ayetMealleri';

/** Hadis gösterilen diller. */
export const HADIS_DILLERI: readonly DilKodu[] = ['tr'];

export type NassTuru = 'hadis' | 'ayet';

/** Etkin dilde hadis gösterilebilir mi? */
export const hadisGosterilir = (dil: DilKodu = aktifDil()): boolean => HADIS_DILLERI.includes(dil);

/** QuranEnc başlığından yayımcı: "English Translation - Noor International Center" → "Noor International Center". */
function yayimci(baslik: string): string {
  const i = baslik.lastIndexOf(' - ');
  return i >= 0 ? baslik.slice(i + 3) : baslik;
}

/**
 * Ayetin etkin dildeki meali ve künyesi ("sûre:ayet"). Türkçede `null` döner (Türkçe havuz
 * kendi doğrulanmış metnini taşır); meali olmayan dilde de `null`.
 */
export function ayetMeali(ref: string, dil: DilKodu = aktifDil()): { metin: string; kaynak: string } | null {
  if (dil === 'tr') return null;
  const kaynak = AYET_MEALLERI[dil];
  const metin = kaynak?.ayetler[ref];
  if (!kaynak || !metin) return null;
  return {
    metin,
    kaynak: bicim(sozluk(dil).icerik.ayetKunyesi, { ref, yayimci: yayimci(kaynak.baslik), surum: kaynak.surum }),
  };
}
