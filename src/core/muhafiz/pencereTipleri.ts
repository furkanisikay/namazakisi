/**
 * Hatirlatma penceresi (Faz 1) — motorun "neyin icinde, hangi yone dogru"
 * hatirlattigini tarif eden ortak tip.
 *
 * NEDEN YON: bugune kadar motor tek yonluydu — olcut daima "vaktin cikmasina
 * kalan dakika"ydi. Bu, yatsi gibi 6-11 saat suren vakitlerde tersine caliyordu:
 * kullanici "vakit girer girmez hatirlat, cikana kadar surdur" diyemiyordu
 * (yatsinin 1. seviyesi 120 dk'dan once konusamiyordu). Ayni motorun cuma ve
 * seri gibi vakit-disi pencerelerde kullanilabilmesi de yon gerektirir.
 *
 * SAF: store'a, native'e ve `new Date()`'e bagimli DEGIL — olcum ani daima
 * disaridan `simdi` ile enjekte edilir.
 */

/** Olcunun hangi uctan sayildigi. */
export type PencereYonu =
  /** Olcu = pencerenin BITISINE kalan dakika (tarihsel davranis). */
  | 'cikisaDogru'
  /** Olcu = pencerenin BASLANGICINDAN gecen dakika. */
  | 'girisindenItibaren';

/**
 * Yon alani tasimayan her eski kayit bu yonde okunur.
 * Tum yon parametreleri bu degere varsayilanlanir → sifir gocle geriye uyum.
 */
export const VARSAYILAN_PENCERE_YONU: PencereYonu = 'cikisaDogru';

export interface HatirlatmaPenceresi {
  /**
   * Pencerenin kimligi — `'vakit:ogle'`, `'cuma'`, `'seri'` gibi.
   * Motor bunu yorumlamaz; cagiran taraf id/log uretiminde kullanir.
   */
  kaynak: string;
  baslangic: Date;
  bitis: Date;
  yon: PencereYonu;
}

const BIR_GUN_MS = 24 * 60 * 60 * 1000;

/**
 * Pencerenin mutlak ms sinirlari.
 *
 * GECE YARISI SARMASI: ekranin o gunku vakit tablosu yatsi (21:15) ile imsagi
 * (05:15) AYNI takvim gunune koyar → ham fark negatif cikar ve pencere ters
 * gorunur. `pencereUzunluguDkHesapla` ile ayni sozlesme: bitis baslangictan
 * onceyse +24 sa sarilir.
 */
export function pencereSinirlariniCoz(pencere: HatirlatmaPenceresi): {
  baslangicMs: number;
  bitisMs: number;
} {
  const baslangicMs = pencere.baslangic.getTime();
  const hamBitisMs = pencere.bitis.getTime();
  if (!Number.isFinite(baslangicMs) || !Number.isFinite(hamBitisMs)) {
    return { baslangicMs, bitisMs: hamBitisMs };
  }
  return {
    baslangicMs,
    bitisMs: hamBitisMs < baslangicMs ? hamBitisMs + BIR_GUN_MS : hamBitisMs,
  };
}

/**
 * Pencerenin yonune gore olculen TAM dakika.
 *
 * Sonuc pencere disinda NEGATIF olabilir (vakit henuz girmedi / coktan cikti) ya
 * da pencere uzunlugunu ASABILIR (giris yonunde vakit cikmis). Eleme burada
 * DEGIL `seviyeTetiklenirMi` kapisinda yapilir — alt/ust sinirin tek kaynagi
 * orasidir (AGENTS.md: yasanmis cift-anons dersi).
 *
 * Saniyeler her iki yonde de ASAGI yuvarlanir: `kalanDk`/`gecenDk` bir dakikayi
 * ancak tam doldurunca ilerler, boylece siklik capasi kaymaz.
 */
export function olcuDkHesapla(pencere: HatirlatmaPenceresi, simdi: Date): number {
  const { baslangicMs, bitisMs } = pencereSinirlariniCoz(pencere);
  const simdiMs = simdi.getTime();
  if (!Number.isFinite(baslangicMs) || !Number.isFinite(bitisMs) || !Number.isFinite(simdiMs)) {
    return 0;
  }

  const farkMs =
    pencere.yon === 'girisindenItibaren' ? simdiMs - baslangicMs : bitisMs - simdiMs;
  return Math.floor(farkMs / 60000);
}
