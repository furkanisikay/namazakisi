import { BAKIS_VEKTORU, azimut } from '../cihazYonelimi';
import { KAMERA_OPTIGI, kabeyiIzdusur } from '../kameraProjeksiyonu';
import { KIBLE_YOLU_AKIS_MS, kibleYoluFazi, kibleYoluGeometrisi } from '../kibleYolu';
import { tabanKur } from '../yonFiltresi';

const RAD = Math.PI / 180;
const W = 1080;
const H = 2000;

/** Ekranı θ eğik (90 dik), manyetik ψ'ye bakan telefonun tabanı. */
function taban(psi: number, teta: number) {
  // Cihaz ekseninde yukarı: dikken +y, düzken +z; aradaki eğimde ikisinin karışımı.
  const yukari = { x: 0, y: Math.sin(teta * RAD), z: Math.cos(teta * RAD) };
  return tabanKur(yukari, BAKIS_VEKTORU, psi)!;
}

/** "M x y L x y ..." → sayı çiftleri. */
function noktalar(d: string): Array<[number, number]> {
  const sayilar = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const cift: Array<[number, number]> = [];
  for (let i = 0; i + 1 < sayilar.length; i += 2) cift.push([sayilar[i], sayilar[i + 1]]);
  return cift;
}

const optik = KAMERA_OPTIGI.android;

describe('kibleYoluGeometrisi', () => {
  it('kıbleye dönük dik telefon: yol ekranın ortasından ufka uzanır, ufukta daralır', () => {
    const t = taban(150, 90);
    expect(azimut(t, BAKIS_VEKTORU)).toBeCloseTo(150, 6);
    const g = kibleYoluGeometrisi({ taban: t, kibleManyetik: 150, genislik: W, yukseklik: H, optik, faz: 0 });
    for (const b of g.bantlar) expect(b.length).toBeGreaterThan(0);
    // Yakın bant: geniş ve ekranın alt yarısında; uzak bant: ufka (y ≈ H/2) yakın ve dar.
    const yakin = noktalar(g.bantlar[0]);
    const uzak = noktalar(g.bantlar[2]);
    const genis = (p: Array<[number, number]>) => Math.max(...p.map((q) => q[0])) - Math.min(...p.map((q) => q[0]));
    expect(genis(uzak)).toBeLessThan(genis(yakin) / 5);
    for (const [, y] of uzak) {
      expect(y).toBeGreaterThan(H / 2);
      expect(y).toBeLessThan(H / 2 + 200);
    }
    // Simetrik: merkez çizgisi ekranın ortasında.
    const xler = uzak.map((q) => q[0]);
    expect(Math.abs((Math.max(...xler) + Math.min(...xler)) / 2 - W / 2)).toBeLessThan(2);
  });

  it('yolun ucu Kâbe işaretinin altında birleşir (aynı izdüşüm)', () => {
    const t = taban(150, 90);
    const g = kibleYoluGeometrisi({ taban: t, kibleManyetik: 160, genislik: W, yukseklik: H, optik, faz: 0 });
    const iz = kabeyiIzdusur({ taban: t, kibleManyetik: 160, fark: 10, genislik: W, yukseklik: H, optik });
    expect(iz.tur).toBe('ekranda');
    const uzak = noktalar(g.bantlar[2]);
    const enUzakX = uzak.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
    if (iz.tur === 'ekranda') expect(Math.abs(enUzakX - iz.x)).toBeLessThan(25);
  });

  it('kıble tam arkada ve telefon dik: yol yok (görüş alanında yer yok)', () => {
    const g = kibleYoluGeometrisi({ taban: taban(150, 90), kibleManyetik: 330, genislik: W, yukseklik: H, optik, faz: 0 });
    expect(g.bantlar.every((b) => b === '')).toBe(true);
    expect(g.cevronlar).toBe('');
    expect(g.kenarlar).toBe('');
  });

  it('kıble yanda ve telefon aşağı eğik: yol ayaktan yana doğru çizilir', () => {
    const g = kibleYoluGeometrisi({ taban: taban(150, 50), kibleManyetik: 230, genislik: W, yukseklik: H, optik, faz: 0 });
    const tum = noktalar(g.bantlar.join(''));
    expect(tum.length).toBeGreaterThan(0);
    // Sağa (+80°) giden yol: uzak uç sağda.
    const uzakUc = tum.reduce((a, b) => (b[1] < a[1] ? b : a));
    expect(uzakUc[0]).toBeGreaterThan(W / 2);
  });

  it('çevronlar Kâbe yönünü gösterir ve faz ile uzağa (ufka) akar', () => {
    const t = taban(150, 65);
    const g = (faz: number) => kibleYoluGeometrisi({ taban: t, kibleManyetik: 150, genislik: W, yukseklik: H, optik, faz });
    const cevronlar = (d: string) => d.split('M').filter(Boolean).map((p) => noktalar(`M${p}`));
    const a = cevronlar(g(0.4).cevronlar);
    const b = cevronlar(g(0.5).cevronlar);
    expect(a.length).toBeGreaterThan(3);
    for (const c of a) {
      expect(c).toHaveLength(6);
      // Uç (2. köşe) kolların (1. ve 3. köşe) ötesinde = ufka daha yakın (y daha küçük).
      expect(c[1][1]).toBeLessThan(Math.min(c[0][1], c[2][1]));
    }
    // Aynı çevron (en yakın) faz artınca yukarı kayar.
    expect(b[0][1][1]).toBeLessThan(a[0][1][1]);
    // Uzaktakiler küçülür (perspektif).
    const gen = (c: Array<[number, number]>) => Math.abs(c[0][0] - c[2][0]);
    expect(gen(a[a.length - 1])).toBeLessThan(gen(a[0]) / 3);
  });

  it('eğim perspektifi değiştirir: aşağı bakınca şerit ekranda daha çok yer kaplar', () => {
    const alan = (teta: number) => {
      const g = kibleYoluGeometrisi({ taban: taban(150, teta), kibleManyetik: 150, genislik: W, yukseklik: H, optik, faz: 0 });
      const ys = noktalar(g.kenarlar).map((p) => p[1]).filter((y) => y >= 0 && y <= H);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(alan(50)).toBeGreaterThan(alan(90));
  });

  it('faz: azaltılmış harekette sabit, değilse zamanla döner', () => {
    expect(kibleYoluFazi(123456, true)).toBe(0.5);
    expect(kibleYoluFazi(0, false)).toBe(0);
    expect(kibleYoluFazi(KIBLE_YOLU_AKIS_MS / 2, false)).toBeCloseTo(0.5, 6);
  });
});
