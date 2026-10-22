/**
 * Cihazlar arası eşitleme — OTOMATİK tur kapısı (SAF).
 *
 * Kullanıcı tercihi (sıklık, yalnız Wi-Fi, yalnız şarjda) ve sistem koşulları (ağ,
 * güç/veri tasarrufu) bir otomatik turun şimdi koşup koşmayacağını belirler. Elle
 * "Şimdi eşitleyin" bu kapıdan GEÇMEZ (her zaman koşar).
 *
 * Tercihler CİHAZA ÖZGÜDÜR ve yedeğe/eşitlemeye GİRMEZ: Wi-Fi/şarj alışkanlığı her
 * cihazda farklıdır; eşitleme tercihini eşitlemeyle taşımak döngüseldir (bir cihaz
 * "Yalnız elle"yi içe alıp sessizce eşitlemeden çekilebilirdi).
 */

import { SistemDurumu, sinirsizAgMi } from '../sistem/sistemDurumu';

export type EsitlemeSikligi = 'degisince' | 'ceyrek' | 'saatlik' | 'gunluk' | 'elle';

export interface EsitlemeTercihleri {
  siklik: EsitlemeSikligi;
  /** Otomatik turlar yalnız Wi-Fi'de (ya da kablolu, ölçülmeyen ağda). */
  yalnizWifi: boolean;
  /** Otomatik turlar yalnız şarjdayken. */
  yalnizSarjda: boolean;
}

/** Varsayılan en iyi deneyim: değişince hemen, her ağda; güç tasarrufunda şarja ertele. */
export const VARSAYILAN_ESITLEME_TERCIHLERI: EsitlemeTercihleri = Object.freeze({
  siklik: 'degisince',
  yalnizWifi: false,
  yalnizSarjda: false,
});

const SIKLIKLAR: readonly EsitlemeSikligi[] = ['degisince', 'ceyrek', 'saatlik', 'gunluk', 'elle'];

export function esitlemeTercihleriniNormalizeEt(deger: unknown): EsitlemeTercihleri {
  if (!deger || typeof deger !== 'object') return { ...VARSAYILAN_ESITLEME_TERCIHLERI };
  const d = deger as Partial<EsitlemeTercihleri>;
  return {
    siklik: SIKLIKLAR.includes(d.siklik as EsitlemeSikligi) ? (d.siklik as EsitlemeSikligi) : 'degisince',
    yalnizWifi: d.yalnizWifi === true,
    yalnizSarjda: d.yalnizSarjda === true,
  };
}

const DK = 60 * 1000;

/** Otomatik turlar arasındaki en kısa süre. "Değişince" de 15 dk'da bir uzağı yoklar. */
export const SIKLIK_ARALIGI_MS: Record<Exclude<EsitlemeSikligi, 'elle'>, number> = {
  degisince: 15 * DK,
  ceyrek: 15 * DK,
  saatlik: 60 * DK,
  gunluk: 24 * 60 * DK,
};

/**
 * Aralığa bırakılan pay: 15 dk'lık arka plan görevi birkaç saniye erken uyanabilir;
 * pay olmasa "14 dk 58 sn geçti" turu atlanır ve gerçek aralık 30 dk'ya çıkardı.
 */
export const ARALIK_PAYI_MS = 2 * DK;

/** Yerel değişiklikten sonra bu kadar beklenir (art arda işaretlemeler tek tura insin). */
export const DEGISIKLIK_BEKLEMESI_MS = 30 * 1000;

/**
 * Otomatik turu doğuran olay.
 * - `acilis`: uygulama açıldı; `oneGelis`: öne geldi; `arkaPlan`: 15 dk görevi;
 * - `degisiklik`: bu cihazda kayıt değişti (yalnız "Değişince hemen");
 * - `kosulDegisti`: Wi-Fi geldi, şarja takıldı, güç tasarrufu kapandı.
 */
export type EsitlemeTetigi = 'acilis' | 'oneGelis' | 'arkaPlan' | 'degisiklik' | 'kosulDegisti';

/** Otomatik turun beklediği şey (ekranda "… bekleniyor" diye görünür). */
export type BeklemeNedeni = 'elle' | 'siklik' | 'agYok' | 'wifi' | 'sarj' | 'gucTasarrufu' | 'veriTasarrufu';

/** Kullanıcıya gösterilmeye değer bekleme (sıklık ve "yalnız elle" olağan durumdur). */
export function gorunurBeklemeMi(n: BeklemeNedeni | null | undefined): boolean {
  return n === 'agYok' || n === 'wifi' || n === 'sarj' || n === 'gucTasarrufu' || n === 'veriTasarrufu';
}

export type EsitlemeKarari = { kos: true } | { kos: false; neden: BeklemeNedeni };

export interface EsitlemeKarariGirdisi {
  tetik: EsitlemeTetigi;
  tercih: EsitlemeTercihleri;
  sistem: SistemDurumu;
  /** Son tamamlanan (başarılı ya da hatalı) turun zamanı. */
  sonDenemeMs: number | null;
  /** Önceki otomatik tur görünür bir koşul yüzünden mi bekledi? */
  bekliyordu: boolean;
  simdiMs: number;
}

/**
 * Otomatik tur şimdi koşsun mu? Sıra: elle → ağ → arka plan verisi → Wi-Fi → şarj →
 * güç tasarrufu → sıklık. "Bilinmiyor" (köprüsüz build) hiçbir koşulu ihlal etmez.
 *
 * - Veri Tasarrufu / Düşük Veri Modu YALNIZ arka plan turunu durdurur (Android zaten
 *   arka plan verisini keser); ön planda tur küçüktür ve kullanıcının kendi değişikliğidir.
 * - Ölçülen ağ tek başına durdurmaz — yalnız "Yalnız Wi-Fi'de" açıksa.
 * - Güç tasarrufu şarjda değilken durdurur; şarja takılınca `kosulDegisti` koşar.
 */
export function esitlemeKarari(g: EsitlemeKarariGirdisi): EsitlemeKarari {
  const { tercih, sistem } = g;
  if (tercih.siklik === 'elle') return { kos: false, neden: 'elle' };
  if (g.tetik === 'degisiklik' && tercih.siklik !== 'degisince') return { kos: false, neden: 'siklik' };
  if (sistem.agTuru === 'yok') return { kos: false, neden: 'agYok' };
  if (g.tetik === 'arkaPlan' && sistem.veriTasarrufu === 'acik') return { kos: false, neden: 'veriTasarrufu' };
  if (tercih.yalnizWifi && sinirsizAgMi(sistem) === false) return { kos: false, neden: 'wifi' };
  if (tercih.yalnizSarjda && sistem.sarjda === false) return { kos: false, neden: 'sarj' };
  if (sistem.gucTasarrufu === true && sistem.sarjda !== true) return { kos: false, neden: 'gucTasarrufu' };

  // Değişiklik turu kendi beklemesiyle (DEGISIKLIK_BEKLEMESI_MS) gelir; açılış "değişince"
  // ve "15 dk"da uzağı hemen yoklar; bekleyen tur koşul düzelince hemen koşar.
  const araliksiz =
    g.tetik === 'degisiklik' ||
    (g.tetik === 'acilis' && SIKLIK_ARALIGI_MS[tercih.siklik] <= SIKLIK_ARALIGI_MS.ceyrek) ||
    (g.tetik === 'kosulDegisti' && g.bekliyordu);
  // Saat geri alındıysa (fark < 0) aralık dolmuş sayılır: tur süresiz kilitlenmesin.
  const fark = g.sonDenemeMs === null ? Infinity : g.simdiMs - g.sonDenemeMs;
  if (!araliksiz && fark >= 0 && fark < SIKLIK_ARALIGI_MS[tercih.siklik] - ARALIK_PAYI_MS) {
    return { kos: false, neden: 'siklik' };
  }
  return { kos: true };
}
