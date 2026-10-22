/**
 * Pusula kalibrasyon rehberi — karar ve çizim geometrisi, SAF (React/expo import ETMEZ).
 *
 * Rehber YALNIZ yön verisi güvenilmezken açılır (sürekli uyarı yok):
 *  - işletim sisteminin pusula doğruluğu düşük (expo-location `accuracy` ≤ 1; Android
 *    SensorManager SENSOR_STATUS_UNRELIABLE / ACCURACY_LOW, iOS headingAccuracy > 35°),
 *  - manyetik alan büyüklüğü beklenen yerel aralığın dışında (metal / mıknatıslı kılıf),
 *  - telefon dururken yön tutarsız sıçrıyor (`YonFiltresi` teşhisi).
 * Üçü de kendi içinde kararlılaştırılmıştır (doğruluk `dogrulukAdimi`, alan 1,2 sn,
 * tutarsızlık histerezisli), burada ayrıca titreşim süzgeci gerekmez.
 */

export type KalibrasyonNedeni = 'alan' | 'dogruluk' | 'tutarsiz';

export function kalibrasyonNedeni(g: {
  dogruluk: number | null;
  alanBozuk: boolean;
  tutarsiz: boolean;
}): KalibrasyonNedeni | null {
  // Alan bozulması önce: çözümü farklıdır (8 çizmek değil, metalden uzaklaşmak da gerekir).
  if (g.alanBozuk) return 'alan';
  if (g.dogruluk !== null && Number.isFinite(g.dogruluk) && g.dogruluk <= 1) return 'dogruluk';
  if (g.tutarsiz) return 'tutarsiz';
  return null;
}

/** Gerek ortadan kalktıktan sonra "teşekkürler"e geçmeden önce beklenen süre (ms). */
export const KALIBRASYON_KAPANIS_KARARLI_MS = 1500;
/** "Teşekkürler" satırının ekranda kalma süresi (ms). */
export const KALIBRASYON_TESEKKUR_MS = 2500;
/** Telefon silüetinin ∞ yolunu bir kez dolaşma süresi (ms). */
export const KALIBRASYON_TUR_MS = 3600;

export interface SonsuzlukYolu {
  /** SVG path `d`. */
  d: string;
  /** Yol uzunluğu (px). */
  uzunluk: number;
  /** Yay uzunluğuna göre EŞİT aralıklı örnekler (silüet konumu + teğet). */
  x: number[];
  y: number[];
  aci: number[];
}

/**
 * Bernoulli lemniskatı (∞), `genislik × yukseklik` kutusuna ortalı. Silüet zamana göre
 * sabit hızla ilerlesin ve iz (`strokeDashoffset`) silüetin tam arkasında bitsin diye
 * örnekler YAY UZUNLUĞUNA göre yeniden dağıtılır (parametre t'ye göre değil).
 */
export function sonsuzlukYolu(genislik: number, yukseklik: number, ornek = 96): SonsuzlukYolu {
  const a = Math.min(genislik / 2, yukseklik * 1.35) * 0.92;
  const cx = genislik / 2;
  const cy = yukseklik / 2;
  const ham: Array<[number, number]> = [];
  const N = 720;
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * i) / N;
    const s = Math.sin(t);
    const k = 1 + s * s;
    ham.push([cx + (a * Math.cos(t)) / k, cy + (a * Math.sin(t) * Math.cos(t)) / k]);
  }
  const kum: number[] = [0];
  for (let i = 1; i < ham.length; i++) {
    kum.push(kum[i - 1] + Math.hypot(ham[i][0] - ham[i - 1][0], ham[i][1] - ham[i - 1][1]));
  }
  const uzunluk = kum[kum.length - 1];
  const x: number[] = [];
  const y: number[] = [];
  let j = 0;
  for (let i = 0; i < ornek; i++) {
    const hedef = (uzunluk * i) / ornek;
    while (j < kum.length - 2 && kum[j + 1] < hedef) j++;
    const p = (hedef - kum[j]) / Math.max(1e-9, kum[j + 1] - kum[j]);
    x.push(ham[j][0] + p * (ham[j + 1][0] - ham[j][0]));
    y.push(ham[j][1] + p * (ham[j + 1][1] - ham[j][1]));
  }
  const aci = x.map((_, i) => {
    const s = (i + 1) % ornek;
    const o = (i - 1 + ornek) % ornek;
    return (Math.atan2(y[s] - y[o], x[s] - x[o]) * 180) / Math.PI;
  });
  const yuvarla = (v: number) => Math.round(v * 10) / 10;
  const d = `M${ham.filter((_, i) => i % 6 === 0).map((q) => `${yuvarla(q[0])} ${yuvarla(q[1])}`).join('L')}Z`;
  return { d, uzunluk, x, y, aci };
}
