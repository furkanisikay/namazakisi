/**
 * Esik stepper sinirlari — spec 4.2 "Esikleri ZORLA SIRALA (nazik > uyari > sert > acil)".
 *
 * Kullanici ters sira giremesin diye her seviyenin stepper'i KOMSULARINA gore
 * kisitlanir; boylece kesin azalan sira UI seviyesinde korunur (ayrica
 * `esikSiralamasiGecerliMi` ile dogrulanabilir).
 *
 * FAZ 0 — TAVAN ARTIK SABIT DEGIL: vaktin O GUNKU penceresinden gelir. Sabit 120
 * dk, yatsi gibi 6-11 saat suren vakitlerde kullaniciyi gereksiz kisitliyordu.
 *
 * SAF: store'a/UI'a bagimli degil.
 */
import type { SeviyeAyari } from './matrisTipleri';

export const ESIK_MUTLAK_MIN = 1;

/**
 * Pencere BILINMIYORKEN (konum/vakit hesabi yoksa) uygulanan tavan.
 * Gercek geriye uyumluluk: eski davranis birebir korunur.
 */
export const ESIK_MUTLAK_MAX = 120;

/**
 * Pencere bilinse bile asilamayan guvenlik tavani.
 *
 * Yalniz "cok buyuk sayi" korkusu degil: 720 dk'lik bir esik `TEKRAR_MIN_DK = 1`
 * ile birlesince tek vakitte yuzlerce bildirim + exact alarm demektir. Ikinci
 * muhafiz `planButcesi` (seviye basina adim siniri).
 */
export const ESIK_GUVENLIK_TAVANI = 720;

export interface EsikSinirlari {
  min: number;
  max: number;
}

export interface EsikSinirSecenekleri {
  /** Vaktin bugunku pencere uzunlugu (dk). Verilmezse tavan `ESIK_MUTLAK_MAX`. */
  pencereUzunluguDk?: number;
}

/** Pencereden turetilen mutlak tavan (komsu kisiti bunun USTUNE uygulanir). */
function tavaniHesapla(pencereUzunluguDk?: number): number {
  if (!Number.isFinite(pencereUzunluguDk) || (pencereUzunluguDk as number) <= 0) {
    return ESIK_MUTLAK_MAX;
  }
  // Pencereye ESIT esik calismaz (uyari vaktin giris anina duser) -> -1.
  const pencereTavani = Math.floor(pencereUzunluguDk as number) - 1;
  return Math.max(ESIK_MUTLAK_MIN, Math.min(pencereTavani, ESIK_GUVENLIK_TAVANI));
}

/**
 * `seviyeler` SEVIYE_KADEMELERI sirasindadir (nazik -> acil, esik AZALAN).
 * - Bir ust komsu (daha nazik) varsa: bu seviye ondan KUCUK olmali -> max = onceki - 1
 * - Bir alt komsu (daha acil) varsa: bu seviye ondan BUYUK olmali -> min = sonraki + 1
 */
export function esikSinirlariniHesapla(
  seviyeler: SeviyeAyari[],
  indeks: number,
  secenekler?: EsikSinirSecenekleri
): EsikSinirlari {
  const tavan = tavaniHesapla(secenekler?.pencereUzunluguDk);

  if (indeks < 0 || indeks >= seviyeler.length) {
    return { min: ESIK_MUTLAK_MIN, max: tavan };
  }

  const onceki = indeks > 0 ? seviyeler[indeks - 1] : null;
  const sonraki = indeks < seviyeler.length - 1 ? seviyeler[indeks + 1] : null;

  const min = Math.max(ESIK_MUTLAK_MIN, sonraki ? sonraki.esikDk + 1 : ESIK_MUTLAK_MIN);
  const hamMax = Math.min(tavan, onceki ? onceki.esikDk - 1 : tavan);

  // Disk/goc kaynakli bozuk veri min > max uretebilir; stepper'i kilitlemek yerine
  // daralt (min'e sabitle) — kullanici yine de komsuyu duzeltip acabilir.
  return { min, max: Math.max(min, hamMax) };
}
