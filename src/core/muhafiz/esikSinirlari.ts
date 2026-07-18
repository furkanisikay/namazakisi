/**
 * Esik stepper sinirlari — spec 4.2 "Esikleri ZORLA SIRALA (nazik > uyari > sert > acil)".
 *
 * Kullanici ters sira giremesin diye her seviyenin stepper'i KOMSULARINA gore
 * kisitlanir; boylece kesin azalan sira UI seviyesinde korunur (ayrica
 * `esikSiralamasiGecerliMi` ile dogrulanabilir).
 *
 * SAF: store'a/UI'a bagimli degil.
 */
import type { SeviyeAyari } from './matrisTipleri';

export const ESIK_MUTLAK_MIN = 1;
export const ESIK_MUTLAK_MAX = 120;

export interface EsikSinirlari {
  min: number;
  max: number;
}

/**
 * `seviyeler` SEVIYE_KADEMELERI sirasindadir (nazik -> acil, esik AZALAN).
 * - Bir ust komsu (daha nazik) varsa: bu seviye ondan KUCUK olmali -> max = onceki - 1
 * - Bir alt komsu (daha acil) varsa: bu seviye ondan BUYUK olmali -> min = sonraki + 1
 */
export function esikSinirlariniHesapla(seviyeler: SeviyeAyari[], indeks: number): EsikSinirlari {
  if (indeks < 0 || indeks >= seviyeler.length) {
    return { min: ESIK_MUTLAK_MIN, max: ESIK_MUTLAK_MAX };
  }

  const onceki = indeks > 0 ? seviyeler[indeks - 1] : null;
  const sonraki = indeks < seviyeler.length - 1 ? seviyeler[indeks + 1] : null;

  const min = Math.max(ESIK_MUTLAK_MIN, sonraki ? sonraki.esikDk + 1 : ESIK_MUTLAK_MIN);
  const hamMax = Math.min(ESIK_MUTLAK_MAX, onceki ? onceki.esikDk - 1 : ESIK_MUTLAK_MAX);

  // Disk/goc kaynakli bozuk veri min > max uretebilir; stepper'i kilitlemek yerine
  // daralt (min'e sabitle) — kullanici yine de komsuyu duzeltip acabilir.
  return { min, max: Math.max(min, hamMax) };
}
