/**
 * Kameralı kıblede yerdeki YOL — SAF (React/expo import ETMEZ).
 *
 * Kullanıcının ayağından kıble yönüne zeminde uzanan bir şerit: dünya uzayında yer
 * düzlemindeki noktalar kurulur ve `kabeyiIzdusur` ile AYNI iğne deliği modeliyle ekrana
 * izdüşürülür. Perspektif kendiliğinden gelir: şerit ayağın dibinde geniş, ufka doğru
 * daralır; telefon eğildikçe (pitch) yer düzlemi ekranda farklı yatar. Üstünde Kâbe'ye
 * doğru akan çevronlar (›) yön hissi verir, kenarlar yumuşak parıltıyla çizilir.
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
  /** Şeridin yarı genişliği (m) — ayağın dibinde ekranı geniş kaplar, ufukta incelir. */
  yariGenislikM: 0.5,
  /** Yolun başladığı / bittiği mesafe (m). Ötesi ufukta tek piksele iner. */
  baslangicM: 0.35,
  bitisM: 45,
  /** Bant sınırları (m): yakın / orta / uzak — opaklık uzaklıkla azalır. */
  bantSinirlariM: [3.5, 11] as const,
  /** Akan çevronlar (yer düzleminde, Kâbe'yi gösteren "›"): aralık, boy, kol açıklığı, kalınlık (m). */
  cevronAraligiM: 1.25,
  cevronBoyuM: 0.34,
  cevronKoluM: 0.3,
  cevronKalinligiM: 0.13,
  /** Çevronların bittiği mesafe (m): uzakta yön hissi değil kalabalık üretirler. */
  cevronBitisM: 24,
  /** Kenar başına örnek sayısı (log aralıklı). */
  ornekSayisi: 22,
} as const;

/** İğne deliği yakın düzlemi (m). */
export const YAKIN_DUZLEM_M = 0.25;

export interface KibleYoluGeometrisi {
  /** Yakın, orta, uzak bant çokgenleri (SVG path `d`); boş dize = bant yok. */
  bantlar: [string, string, string];
  /** Şeridin iki kenarı (açık çoklu çizgi; yumuşak parıltı konturu için). */
  kenarlar: string;
  /** Akan çevronlar (tek path, çokgenler) — Kâbe yönünü gösterir. */
  cevronlar: string;
}

const BOS: KibleYoluGeometrisi = { bantlar: ['', '', ''], kenarlar: '', cevronlar: '' };

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

  // Kenarlar: yolun tamamı boyunca iki açık çizgi.
  const kenarParcasi = (l: number): string => {
    const n = KIBLE_YOLU.ornekSayisi * 2;
    const p: string[] = [];
    for (let i = 0; i <= n; i++) {
      const d = alt * Math.pow(ust / alt, i / n);
      const [x, y] = izdus(nokta(d, l));
      p.push(`${sayi(x)} ${sayi(y)}`);
    }
    return `M${p.join('L')}`;
  };
  const kenarlar = kenarParcasi(-w) + kenarParcasi(w);

  // Çevronlar: yer düzleminde "›" çokgenleri; ucu Kâbe yönünde (+d). Perspektif onları
  // uzakta küçültüp sıklaştırır, faz ilerledikçe Kâbe'ye doğru akarlar.
  const parcalar: string[] = [];
  const aralik = KIBLE_YOLU.cevronAraligiM;
  const boy = KIBLE_YOLU.cevronBoyuM;
  const kol = KIBLE_YOLU.cevronKoluM;
  const kal = KIBLE_YOLU.cevronKalinligiM;
  const faz = ((girdi.faz % 1) + 1) % 1;
  const sonD = Math.min(ust, KIBLE_YOLU.cevronBitisM);
  for (let k = Math.floor(alt / aralik); k * aralik <= sonD; k++) {
    const d = (k + faz) * aralik;
    if (d - kal < alt || d + boy > sonD) continue;
    const kose: Array<[number, number]> = [
      [d, -kol],
      [d + boy, 0],
      [d, kol],
      [d - kal, kol],
      [d + boy - kal, 0],
      [d - kal, -kol],
    ];
    const ekran = kose.map(([dd, l]) => izdus(nokta(dd, l)));
    const genislik2 = Math.hypot(ekran[0][0] - ekran[2][0], ekran[0][1] - ekran[2][1]);
    if (genislik2 < 3) break; // ufka yaklaştı
    parcalar.push(`M${ekran.map(([x, y]) => `${sayi(x)} ${sayi(y)}`).join('L')}Z`);
  }
  return { bantlar, kenarlar, cevronlar: parcalar.join('') };
}

/** Akış hızı: bir çevron aralığını bu sürede geçer (ms). */
export const KIBLE_YOLU_AKIS_MS = 1400;

/** Zamandan akış fazı (azaltılmış harekette sabit). */
export function kibleYoluFazi(simdiMs: number, hareketAzalt: boolean): number {
  if (hareketAzalt) return 0.5;
  return (simdiMs % KIBLE_YOLU_AKIS_MS) / KIBLE_YOLU_AKIS_MS;
}
