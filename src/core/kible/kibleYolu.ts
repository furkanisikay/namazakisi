/**
 * Kameralı kıblede yerdeki YOL — SAF (React/expo import ETMEZ).
 *
 * Kullanıcının ayağından kıble yönüne zeminde uzanan bir şerit: dünya uzayında yer
 * düzlemindeki noktalar kurulur ve `kabeyiIzdusur` ile AYNI iğne deliği modeliyle ekrana
 * izdüşürülür. Perspektif kendiliğinden gelir: şerit ufka doğru daralır, noktalar küçülür
 * ve sıklaşır.
 *
 * Dünya modeli: göz (kamera) yerden `gozYuksekligiM` yukarıda; yer düzlemi dünya "yukarı"
 * eksenine diktir. Nokta P(d, l) = d·t + l·yan − h·yukarı (cihaz ekseninde), t = kıblenin
 * yatay birim yönü, yan = t × yukarı (sağ). Kamera −z'ye bakar; derinlik = −P.z.
 *
 * Görünür aralık: derinlik her kenarda `YAKIN_DUZLEM_M`'den büyük olmalı (iğne deliği yakın
 * düzlemde patlar). Derinlik d'ye göre DOĞRUSALDIR → aralık kapalı biçimde çözülür,
 * örnekleme gerekmez. Kıble arkadaysa yol ancak telefon aşağı bakarken ayak ucunda görünür.
 */
import type { DunyaTabani, Vektor3 } from './cihazYonelimi';
import { capraz } from './cihazYonelimi';
import { KameraOptigi, odakUzakligiPx } from './kameraProjeksiyonu';

export const KIBLE_YOLU = {
  /** Göz (telefon) yüksekliği (m). */
  gozYuksekligiM: 1.4,
  /** Şeridin yarı genişliği (m). */
  yariGenislikM: 0.32,
  /** Yolun başladığı / bittiği mesafe (m). Ötesi ufukta tek piksele iner. */
  baslangicM: 0.5,
  bitisM: 45,
  /** Bant sınırları (m): yakın / orta / uzak — opaklık uzaklıkla azalır. */
  bantSinirlariM: [4, 13] as const,
  /** Akan noktaların aralığı ve yarıçapı (m). */
  noktaAraligiM: 1.6,
  noktaYaricapiM: 0.07,
  /** Kenar başına örnek sayısı (log aralıklı). */
  ornekSayisi: 22,
} as const;

/** İğne deliği yakın düzlemi (m). */
export const YAKIN_DUZLEM_M = 0.25;

export interface KibleYoluGeometrisi {
  /** Yakın, orta, uzak bant çokgenleri (SVG path `d`); boş dize = bant yok. */
  bantlar: [string, string, string];
  /** Akan noktalar (tek path, daireler). */
  noktalar: string;
}

const BOS: KibleYoluGeometrisi = { bantlar: ['', '', ''], noktalar: '' };

const sayi = (v: number) => (Math.round(v * 10) / 10).toString();

/**
 * Yolun ekran geometrisi. `faz` [0,1) akan noktaların kayması (animasyon); hareketi
 * azaltılmış kullanıcı için sabit verilir. Yol görünmüyorsa boş geometri döner.
 */
export function kibleYoluGeometrisi(girdi: {
  taban: DunyaTabani;
  kibleManyetik: number;
  genislik: number;
  yukseklik: number;
  optik: KameraOptigi;
  faz: number;
}): KibleYoluGeometrisi {
  const { taban, kibleManyetik, genislik, yukseklik, optik } = girdi;
  const f = odakUzakligiPx(genislik, yukseklik, optik);
  if (!(f > 0)) return BOS;
  const r = (kibleManyetik * Math.PI) / 180;
  const s = Math.sin(r);
  const c = Math.cos(r);
  const t: Vektor3 = {
    x: s * taban.dogu.x + c * taban.kuzey.x,
    y: s * taban.dogu.y + c * taban.kuzey.y,
    z: s * taban.dogu.z + c * taban.kuzey.z,
  };
  const u = taban.yukari;
  const yan = capraz(t, u);
  const h = KIBLE_YOLU.gozYuksekligiM;
  const w = KIBLE_YOLU.yariGenislikM;

  const nokta = (d: number, l: number): Vektor3 => ({
    x: d * t.x + l * yan.x - h * u.x,
    y: d * t.y + l * yan.y - h * u.y,
    z: d * t.z + l * yan.z - h * u.z,
  });

  // derinlik(d, l) = −(d·t.z + l·yan.z − h·u.z) ≥ yakın  →  d aralığı (kenarlar + merkez).
  let alt: number = KIBLE_YOLU.baslangicM;
  let ust: number = KIBLE_YOLU.bitisM;
  for (const l of [-w, 0, w]) {
    const a = -t.z; // d katsayısı
    const b = -(l * yan.z) + h * u.z - YAKIN_DUZLEM_M; // sabit: a·d + b ≥ 0
    if (Math.abs(a) < 1e-9) {
      if (b < 0) return BOS;
    } else if (a > 0) {
      alt = Math.max(alt, -b / a);
    } else {
      ust = Math.min(ust, -b / a);
    }
  }
  if (!(ust > alt * 1.02)) return BOS;

  const izdus = (p: Vektor3): [number, number] => {
    const derinlik = -p.z;
    return [genislik / 2 + (f * p.x) / derinlik, yukseklik / 2 - (f * p.y) / derinlik];
  };

  const bant = (d0: number, d1: number): string => {
    const a0 = Math.max(d0, alt);
    const a1 = Math.min(d1, ust);
    if (!(a1 > a0)) return '';
    const n = Math.max(3, Math.round((KIBLE_YOLU.ornekSayisi * Math.log(a1 / a0)) / Math.log(KIBLE_YOLU.bitisM / KIBLE_YOLU.baslangicM)));
    const sol: string[] = [];
    const sag: string[] = [];
    for (let i = 0; i <= n; i++) {
      const d = a0 * Math.pow(a1 / a0, i / n);
      const [xs, ys] = izdus(nokta(d, -w));
      const [xr, yr] = izdus(nokta(d, w));
      sol.push(`${sayi(xs)} ${sayi(ys)}`);
      sag.push(`${sayi(xr)} ${sayi(yr)}`);
    }
    return `M${sol.join('L')}L${sag.reverse().join('L')}Z`;
  };

  const [b1, b2] = KIBLE_YOLU.bantSinirlariM;
  const bantlar: [string, string, string] = [bant(alt, b1), bant(b1, b2), bant(b2, ust)];

  const parcalar: string[] = [];
  const aralik = KIBLE_YOLU.noktaAraligiM;
  const faz = ((girdi.faz % 1) + 1) % 1;
  for (let k = Math.floor(alt / aralik); k * aralik <= ust; k++) {
    const d = (k + faz) * aralik;
    if (d < alt || d > ust) continue;
    const p = nokta(d, 0);
    const derinlik = -p.z;
    const yar = (f * KIBLE_YOLU.noktaYaricapiM) / derinlik;
    if (yar < 0.6) break; // ufka yaklaştı; ötesi görünmez
    const [x, y] = izdus(p);
    parcalar.push(`M${sayi(x - yar)} ${sayi(y)}a${sayi(yar)} ${sayi(yar)} 0 1 0 ${sayi(2 * yar)} 0a${sayi(yar)} ${sayi(yar)} 0 1 0 ${sayi(-2 * yar)} 0`);
  }
  return { bantlar, noktalar: parcalar.join('') };
}

/** Akış hızı: bir nokta aralığını bu sürede geçer (ms). */
export const KIBLE_YOLU_AKIS_MS = 1400;

/** Zamandan akış fazı (azaltılmış harekette sabit). */
export function kibleYoluFazi(simdiMs: number, hareketAzalt: boolean): number {
  if (hareketAzalt) return 0.5;
  return (simdiMs % KIBLE_YOLU_AKIS_MS) / KIBLE_YOLU_AKIS_MS;
}
