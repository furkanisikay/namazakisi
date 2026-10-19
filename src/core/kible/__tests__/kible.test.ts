import {
  AcisalSuzgec,
  HIZA_CIKIS_ESIGI,
  HIZA_GIRIS_ESIGI,
  aciFarki,
  aciNormalize,
  hizalandiMi,
  kabeyeMesafeKm,
  mesafeMetni,
  yonCumlesi,
} from '../acilar';
import {
  BAKIS_VEKTORU,
  EksenDenetimi,
  VektorSuzgeci,
  Vektor3,
  azimut,
  dikOrani,
  dunyaTabaniKur,
  egimDerece,
} from '../cihazYonelimi';
import { KAMERA_OPTIGI, kabeyiIzdusur, odakUzakligiPx } from '../kameraProjeksiyonu';

/**
 * Cihaz duruşundan sensör okumaları üretir (dünya ekseni: doğu, kuzey, yukarı).
 * Cihaz eksenleri dünyada verilir; okuma = dünya vektörünün cihaz eksenlerine izdüşümü.
 * Yerçekimi okuması AŞAĞIYI gösterir (expo-sensors iki platformda da), alan kuzey yarımküre.
 */
const ALAN = { e: 0, n: 27, u: -40 }; // İstanbul civarı: yatay ~27 μT, aşağı ~40 μT
type Dunya = { e: number; n: number; u: number };
const d = (a: Dunya, b: Dunya) => a.e * b.e + a.n * b.n + a.u * b.u;
function okuma(eksenler: { x: Dunya; y: Dunya; z: Dunya }): { asagi: Vektor3; manyetik: Vektor3 } {
  const asagiD = { e: 0, n: 0, u: -9.81 };
  return {
    asagi: { x: d(asagiD, eksenler.x), y: d(asagiD, eksenler.y), z: d(asagiD, eksenler.z) },
    manyetik: { x: d(ALAN, eksenler.x), y: d(ALAN, eksenler.y), z: d(ALAN, eksenler.z) },
  };
}
const rad = (g: number) => (g * Math.PI) / 180;
/** Düz, ekran yukarı, üst kenar `h` azimutunda. */
function duz(h: number) {
  const s = Math.sin(rad(h));
  const c = Math.cos(rad(h));
  return okuma({ x: { e: c, n: -s, u: 0 }, y: { e: s, n: c, u: 0 }, z: { e: 0, n: 0, u: 1 } });
}
/** Dik (portre), arka kamera `h` azimutunda, `yukari` derece göğe eğik. */
function dik(h: number, yukari = 0) {
  const s = Math.sin(rad(h));
  const c = Math.cos(rad(h));
  const p = rad(yukari);
  // kamera ileri f = (s cosp, c cosp, sinp); cihaz z = −f; cihaz y = (−s sinp, −c sinp, cosp)
  return okuma({
    x: { e: c, n: -s, u: 0 },
    y: { e: -s * Math.sin(p), n: -c * Math.sin(p), u: Math.cos(p) },
    z: { e: -s * Math.cos(p), n: -c * Math.cos(p), u: -Math.sin(p) },
  });
}
function bakisAzimutu(o: { asagi: Vektor3; manyetik: Vektor3 }): number | null {
  const t = dunyaTabaniKur(o.asagi, o.manyetik);
  return t ? azimut(t, BAKIS_VEKTORU) : null;
}

describe('açı yardımcıları', () => {
  it('normalize ve en kısa fark 359↔0 sınırında sarar', () => {
    expect(aciNormalize(-10)).toBe(350);
    expect(aciNormalize(720)).toBe(0);
    expect(aciNormalize(NaN)).toBe(0);
    expect(aciFarki(10, 350)).toBe(20);
    expect(aciFarki(350, 10)).toBe(-20);
    expect(aciFarki(180, 0)).toBe(180);
    expect(aciFarki(0, 180)).toBe(180);
  });

  it('hizalanma histerezisli: girişte < 10, çıkışta > 15', () => {
    expect(HIZA_GIRIS_ESIGI).toBe(10);
    expect(HIZA_CIKIS_ESIGI).toBe(15);
    expect(hizalandiMi(false, 9.9)).toBe(true);
    expect(hizalandiMi(false, 12)).toBe(false);
    expect(hizalandiMi(true, 12)).toBe(true);
    expect(hizalandiMi(true, -14.9)).toBe(true);
    expect(hizalandiMi(true, 15.1)).toBe(false);
    expect(hizalandiMi(true, NaN)).toBe(false);
  });

  it("açısal süzgeç 350° ile 10°'yi 180° değil 0° yapar; sürekli değer tur atmaz", () => {
    const s = new AcisalSuzgec(0); // τ=0 → doğrudan geçiş
    s.ekle(350, 0);
    s.ekle(10, 16);
    expect(s.deger).toBeCloseTo(10, 6);
    expect(s.surekli).toBeCloseTo(370, 6);

    const yavas = new AcisalSuzgec(100);
    yavas.ekle(350, 0);
    const v = yavas.ekle(10, 16);
    expect(Math.abs(aciFarki(v, 0))).toBeLessThan(10);
    // 359 → 1 geçişinde sürekli değer 2° ileri gider
    const t = new AcisalSuzgec(0);
    t.ekle(359, 0);
    t.ekle(1, 10);
    expect(t.surekli).toBeCloseTo(361, 6);
  });

  it('süzgeç dt\'ye göre: aynı sürede iki küçük adım ≈ bir büyük adım', () => {
    const a = new AcisalSuzgec(100);
    a.ekle(0, 0);
    a.ekle(40, 20);
    const ikiAdim = a.ekle(40, 40);
    const b = new AcisalSuzgec(100);
    b.ekle(0, 0);
    const birAdim = b.ekle(40, 40);
    expect(Math.abs(ikiAdim - birAdim)).toBeLessThan(0.5);
  });

  it("Kâbe'ye mesafe (İstanbul ≈ 2.400 km) ve Türkçe metin", () => {
    const km = kabeyeMesafeKm(41.0082, 28.9784)!;
    expect(km).toBeGreaterThan(2350);
    expect(km).toBeLessThan(2450);
    expect(mesafeMetni(2402.4)).toBe('2.402 km');
    expect(mesafeMetni(0.42)).toBe('420 m');
    expect(mesafeMetni(null)).toBeNull();
  });

  it('yön cümlesi kibar ve yönlü', () => {
    expect(yonCumlesi(30.4, false)).toBe('Kıble 30° sağınızda');
    expect(yonCumlesi(-45, false)).toBe('Kıble 45° solunuzda');
    expect(yonCumlesi(175, false)).toBe('Kıble arkanızda, geri dönün');
    expect(yonCumlesi(3, true)).toBe('Kıble yönündesiniz');
  });
});

describe('cihaz yönelimi (kanonik duruşlar)', () => {
  it.each([0, 45, 90, 152, 270, 359])('düz telefon, üst kenar %d° → bakış azimutu aynı', (h) => {
    expect(aciFarki(bakisAzimutu(duz(h))!, h)).toBeCloseTo(0, 6);
  });

  it.each([0, 90, 152, 300])('DİK telefon, kamera %d° → bakış azimutu aynı (Euler tekilliği yok)', (h) => {
    expect(aciFarki(bakisAzimutu(dik(h))!, h)).toBeCloseTo(0, 6);
  });

  it('düz → dik geçişte azimut sıçramaz (her eğimde aynı yön)', () => {
    for (const egim of [0, 20, 45, 70, 89]) {
      const o = dik(152, -(90 - egim)); // −90 = ekran göğe (düz), 0 = dik
      expect(aciFarki(bakisAzimutu(o)!, 152)).toBeCloseTo(0, 6);
    }
  });

  it('göğe eğik kamerada da azimut korunur', () => {
    expect(aciFarki(bakisAzimutu(dik(60, 30))!, 60)).toBeCloseTo(0, 6);
  });

  it('eğim ve dik oranı', () => {
    expect(egimDerece(duz(10).asagi)).toBeCloseTo(0, 6);
    expect(egimDerece(dik(10).asagi)).toBeCloseTo(90, 6);
    expect(dikOrani(0)).toBe(0);
    expect(dikOrani(20)).toBe(0);
    expect(dikOrani(90)).toBe(1);
    expect(dikOrani(110)).toBe(1); // göğe bakan telefon da dik sayılır
    expect(dikOrani(45)).toBeCloseTo(0.5, 6);
    expect(dikOrani(null)).toBe(0);
  });

  it('alan yoksa ya da dikeyse taban kurulmaz', () => {
    expect(dunyaTabaniKur({ x: 0, y: 0, z: -9.8 }, { x: 0, y: 0, z: -40 })).toBeNull();
    expect(dunyaTabaniKur({ x: 0, y: 0, z: 0 }, { x: 0, y: 20, z: -40 })).toBeNull();
    expect(dunyaTabaniKur({ x: NaN, y: 0, z: -9.8 }, { x: 0, y: 20, z: -40 })).toBeNull();
  });

  it('vektör süzgeci gürültüyü yumuşatır', () => {
    const s = new VektorSuzgeci(80);
    s.ekle({ x: 0, y: 0, z: -9.8 }, 0);
    const v = s.ekle({ x: 5, y: 0, z: -9.8 }, 16)!;
    expect(v.x).toBeGreaterThan(0);
    expect(v.x).toBeLessThan(2);
  });

  it('eksen denetimi: sürekli büyük fark bozuk, küçük fark doğrulandı', () => {
    const iyi = new EksenDenetimi();
    for (let i = 0; i < 50; i++) iyi.ekle(4);
    expect(iyi.dogrulandi).toBe(true);
    expect(iyi.bozuk).toBe(false);
    const kotu = new EksenDenetimi();
    for (let i = 0; i < 50; i++) kotu.ekle(170);
    expect(kotu.bozuk).toBe(true);
    const az = new EksenDenetimi();
    for (let i = 0; i < 5; i++) az.ekle(170);
    expect(az.bozuk).toBe(false); // yetersiz kanıt
  });
});

describe('kamera izdüşümü', () => {
  const W = 400;
  const H = 800;
  const optik = KAMERA_OPTIGI.android;

  function izdusur(kameraAz: number, kible: number, yukari = 0) {
    const o = dik(kameraAz, yukari);
    const taban = dunyaTabaniKur(o.asagi, o.manyetik)!;
    return kabeyiIzdusur({ taban, kibleManyetik: kible, fark: aciFarki(kible, kameraAz), genislik: W, yukseklik: H, optik });
  }

  it('odak uzaklığı: kapla ölçeklemesinde uzun kenardan', () => {
    // 400×800 alan, 4:3 önizleme: yükseklik eşleşir → uzun kenar 800 px
    expect(odakUzakligiPx(W, H, optik)).toBeCloseTo(400 / Math.tan(rad(33)), 6);
    // basık alan: genişlik eşleşir → uzun kenar 400·4/3
    expect(odakUzakligiPx(400, 300, optik)).toBeCloseTo((400 * (4 / 3)) / 2 / Math.tan(rad(33)), 6);
    expect(odakUzakligiPx(0, 300, optik)).toBe(0);
  });

  it('kıbleye bakan dik telefonda Kâbe ekranın tam ortasında, ufukta', () => {
    const i = izdusur(152, 152);
    expect(i.tur).toBe('ekranda');
    if (i.tur !== 'ekranda') return;
    expect(i.x).toBeCloseTo(W / 2, 6);
    expect(i.y).toBeCloseTo(H / 2, 6);
  });

  it('kıble 15° sağdaysa işaret ortanın sağında, göğe bakınca ufuk aşağı iner', () => {
    const i = izdusur(152, 167);
    expect(i.tur).toBe('ekranda');
    if (i.tur === 'ekranda') {
      expect(i.x).toBeGreaterThan(W / 2 + 50);
      expect(i.y).toBeCloseTo(H / 2, 6);
    }
    const yukari = izdusur(152, 152, 20);
    expect(yukari.tur).toBe('ekranda');
    if (yukari.tur === 'ekranda') expect(yukari.y).toBeGreaterThan(H / 2 + 50);
  });

  it('görüş dışında ve arkada: dönülecek yan farkın işaretinden', () => {
    expect(izdusur(0, 120)).toMatchObject({ tur: 'disarida', yon: 'sag' });
    expect(izdusur(0, 240)).toMatchObject({ tur: 'disarida', yon: 'sol' });
    expect(izdusur(0, 170)).toMatchObject({ tur: 'disarida', yon: 'sag' }); // arkada
  });
});
