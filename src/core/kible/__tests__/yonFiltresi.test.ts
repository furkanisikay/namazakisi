/**
 * Yön süzgeci — ölçüm testleri. Sentetik ama fiziksel bir sensör izi üretilir (dünya
 * vektörleri cihaz eksenine döndürülür, üstüne gürültü eklenir) ve ESKİ zincir
 * (ham `accelerationIncludingGravity` + 70 ms vektör süzgeci + 110 ms açısal süzgeç,
 * kamera işareti ham tabandan) ile YENİ `YonFiltresi` aynı izle karşılaştırılır.
 *
 * `KIBLE_OLCUM=1 npx jest yonFiltresi` ölçüm tablosunu yazdırır (raporda kullanıldı).
 * Gürültü deterministiktir (mulberry32), `Math.random` kullanılmaz.
 */
import { AcisalSuzgec, aciFarki, aciNormalize } from '../acilar';
import { BAKIS_VEKTORU, Vektor3, VektorSuzgeci, azimut, dunyaTabaniKur } from '../cihazYonelimi';
import { KAMERA_OPTIGI, kabeyiIzdusur } from '../kameraProjeksiyonu';
import {
  ALAN_UST_UT,
  BOZULMA_KARARLI_MS,
  JiroskopDenetimi,
  OneEuroAcisal,
  YonFiltresi,
  asagiVektoru,
  donusHiziCihazEkseni,
  tabanKur,
  yonHizi,
} from '../yonFiltresi';

// ---------------------------------------------------------------------------
// Sentetik dünya
// ---------------------------------------------------------------------------

function mulberry32(tohum: number) {
  let a = tohum >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalUretici(tohum: number) {
  const r = mulberry32(tohum);
  return () => {
    const u = Math.max(1e-12, r());
    const v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

const RAD = Math.PI / 180;
type V = Vektor3;
const capraz = (a: V, b: V): V => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const nokta = (a: V, b: V) => a.x * b.x + a.y * b.y + a.z * b.z;

/** Dünya (x doğu, y kuzey, z yukarı) — İstanbul civarı alan: yatay 27 µT, düşey −40 µT. */
const ALAN_DUNYA: V = { x: 0, y: 27, z: -40 };
const ASAGI_DUNYA: V = { x: 0, y: 0, z: -9.81 };

/** ψ yönüne bakan, ekranı θ kadar eğik (0 düz, 90 dik) telefonun eksenleri, dünya koordinatında. */
function cihazEksenleri(psi: number, teta: number) {
  const f: V = { x: Math.sin(psi * RAD), y: Math.cos(psi * RAD), z: 0 };
  const u: V = { x: 0, y: 0, z: 1 };
  const z: V = { x: Math.cos(teta * RAD) * u.x - Math.sin(teta * RAD) * f.x, y: Math.cos(teta * RAD) * u.y - Math.sin(teta * RAD) * f.y, z: Math.cos(teta * RAD) * u.z - Math.sin(teta * RAD) * f.z };
  const y: V = { x: Math.sin(teta * RAD) * u.x + Math.cos(teta * RAD) * f.x, y: Math.sin(teta * RAD) * u.y + Math.cos(teta * RAD) * f.y, z: Math.sin(teta * RAD) * u.z + Math.cos(teta * RAD) * f.z };
  const x = capraz(y, z);
  return { x, y, z };
}
const cihazda = (v: V, e: ReturnType<typeof cihazEksenleri>): V => ({ x: nokta(v, e.x), y: nokta(v, e.y), z: nokta(v, e.z) });

interface Ornek {
  ms: number;
  gercekYon: number;
  hamIvme: V; // accelerationIncludingGravity (aşağı + el titremesi)
  dogrusal: V; // acceleration (el titremesinin füzyonlu tahmini)
  manyetik: V;
  donus: { alpha: number; beta: number; gamma: number }; // expo rotationRate (°/sn), platform eşlemeli
}

/**
 * İz: 50 Hz. `yon(t)` gerçek yön (derece). El titremesi ~6 Hz renkli gürültü (0,35 m/s²),
 * manyetometre beyaz gürültü 0,5 µT, füzyonlu yerçekimi 0,03 m/s², jiroskop 0,3°/sn + 0,2°/sn kayma.
 */
function izUret(sureMs: number, yon: (ms: number) => number, teta: number, platform: 'android' | 'ios', tohum = 7, jiroIsaret = 1): Ornek[] {
  const n = normalUretici(tohum);
  const iz: Ornek[] = [];
  let titreme: V = { x: 0, y: 0, z: 0 };
  const aTitreme = 1 - Math.exp(-20 / (1000 / (2 * Math.PI * 6)));
  for (let ms = 0; ms <= sureMs; ms += 20) {
    const psi = yon(ms);
    const e = cihazEksenleri(psi, teta);
    const hedefTitreme = { x: n() * 0.35 * 2, y: n() * 0.35 * 2, z: n() * 0.35 * 2 };
    titreme = { x: titreme.x + aTitreme * (hedefTitreme.x - titreme.x), y: titreme.y + aTitreme * (hedefTitreme.y - titreme.y), z: titreme.z + aTitreme * (hedefTitreme.z - titreme.z) };
    const asagi = cihazda(ASAGI_DUNYA, e);
    const tit = cihazda(titreme, e);
    const hamIvme = { x: asagi.x + tit.x, y: asagi.y + tit.y, z: asagi.z + tit.z };
    // Füzyonlu yerçekimi ≈ aşağı + küçük gürültü → dogrusal = ham − füzyonlu
    const fuzyon = { x: asagi.x + n() * 0.03, y: asagi.y + n() * 0.03, z: asagi.z + n() * 0.03 };
    const dogrusal = { x: hamIvme.x - fuzyon.x, y: hamIvme.y - fuzyon.y, z: hamIvme.z - fuzyon.z };
    const m = cihazda(ALAN_DUNYA, e);
    const manyetik = { x: m.x + n() * 0.5, y: m.y + n() * 0.5, z: m.z + n() * 0.5 };
    // Gerçek yön hızı (°/sn, saat yönü) → dünya açısal hızı (yukarı ekseni etrafında ters).
    const psiHiz = aciFarki(yon(ms + 10), yon(ms - 10)) / 0.02;
    const w = cihazda({ x: 0, y: 0, z: -psiHiz * RAD * jiroIsaret }, e);
    const derece = { x: w.x / RAD + n() * 0.3 + 0.2, y: w.y / RAD + n() * 0.3 - 0.2, z: w.z / RAD + n() * 0.3 + 0.1 };
    const donus = platform === 'android' ? { alpha: derece.x, beta: derece.y, gamma: derece.z } : { alpha: derece.z, beta: derece.y, gamma: derece.x };
    iz.push({ ms, gercekYon: aciNormalize(psi), hamIvme, dogrusal, manyetik, donus });
  }
  return iz;
}

// ---------------------------------------------------------------------------
// Zincirler
// ---------------------------------------------------------------------------

interface Cikti {
  ms: number;
  yon: number;
  kameraX: number | null;
}

const GENISLIK = 1080;
const YUKSEKLIK = 2000;

function kameraX(taban: ReturnType<typeof dunyaTabaniKur>, kibleManyetik: number, fark: number): number | null {
  if (!taban) return null;
  const iz = kabeyiIzdusur({ taban, kibleManyetik, fark, genislik: GENISLIK, yukseklik: YUKSEKLIK, optik: KAMERA_OPTIGI.android });
  return iz.tur === 'ekranda' ? iz.x : null;
}

/** Eski zincir (bu değişiklikten önceki `useKible`). */
function eskiZincir(iz: Ornek[], kible: number): Cikti[] {
  const g = new VektorSuzgeci(70);
  const m = new VektorSuzgeci(70);
  const a = new AcisalSuzgec(110);
  return iz.map((o) => {
    m.ekle(o.manyetik, o.ms);
    g.ekle(o.hamIvme, o.ms);
    const taban = dunyaTabaniKur(g.deger!, m.deger!);
    const yon = a.ekle(azimut(taban!, BAKIS_VEKTORU)!, o.ms);
    return { ms: o.ms, yon, kameraX: kameraX(taban, kible, aciFarki(kible, yon)) };
  });
}

function yeniZincir(iz: Ornek[], kible: number, platform: 'android' | 'ios', filtre = new YonFiltresi()): Cikti[] {
  return iz.map((o) => {
    const c = filtre.ekle({
      asagi: asagiVektoru(o.hamIvme, o.dogrusal),
      manyetik: o.manyetik,
      donus: donusHiziCihazEkseni(o.donus, platform),
      ms: o.ms,
    })!;
    return { ms: o.ms, yon: c.manyetikYon, kameraX: kameraX(c.taban, kible, aciFarki(kible, c.manyetikYon)) };
  });
}

function stdSapma(d: number[]): number {
  const ort = d.reduce((t, v) => t + v, 0) / d.length;
  return Math.sqrt(d.reduce((t, v) => t + (v - ort) ** 2, 0) / d.length);
}

/** Duruş penceresinde yön std (derece; sarmaya dayanıklı: ortalamaya göre fark). */
function yonStd(c: Cikti[], baslaMs: number, bitisMs: number): number {
  const p = c.filter((o) => o.ms >= baslaMs && o.ms <= bitisMs);
  const ref = p[0].yon;
  return stdSapma(p.map((o) => aciFarki(o.yon, ref)));
}

function kameraStd(c: Cikti[], baslaMs: number, bitisMs: number): number {
  const p = c.filter((o) => o.ms >= baslaMs && o.ms <= bitisMs && o.kameraX !== null).map((o) => o.kameraX as number);
  return stdSapma(p);
}

/** Basamak dönüşte %90 eşiğini geçiş GECİKMESİ (ms): çıktı − gerçek. */
function gecikme(c: Cikti[], iz: Ornek[], baslangic: number, hedef: number, sonrakiMs: number): number {
  const esik = baslangic + 0.9 * aciFarki(hedef, baslangic);
  const gecti = (yon: number) => aciFarki(yon, esik) >= 0;
  const gercek = iz.find((o) => o.ms >= sonrakiMs && gecti(o.gercekYon))!.ms;
  const cikti = c.find((o) => o.ms >= sonrakiMs && gecti(o.yon))!.ms;
  return cikti - gercek;
}

// Senaryo: önce 3 sn sağa-sola salınım (jiroskop doğrulansın — kullanıcı kıbleyi ararken
// zaten döner), sonra 4 sn duruş (150°), sonra 0,5 sn'de 90° dönüş (180°/sn), sonra duruş.
const SALINIM_BITIS = 3000;
const DURUS_BITIS = 7000;
const DONUS_BITIS = 7500;
function senaryo(ms: number): number {
  if (ms < SALINIM_BITIS) return 150 + 40 * Math.sin((2 * Math.PI * ms) / 1500);
  if (ms < DURUS_BITIS) return 150;
  if (ms < DONUS_BITIS) return 150 + (90 * (ms - DURUS_BITIS)) / (DONUS_BITIS - DURUS_BITIS);
  return 240;
}
const KIBLE = 155; // manyetik; işaret ekranda (150°'ye bakarken 5° sağda)

describe('YonFiltresi — ölçüm (eski zincire karşı)', () => {
  const sonuclar: string[] = [];
  afterAll(() => {
    if (process.env.KIBLE_OLCUM) {
      // eslint-disable-next-line no-console
      console.log(sonuclar.join('\n'));
    }
  });

  for (const [teta, ad] of [[90, 'dik (kamera)'], [5, 'düz (pusula)']] as const) {
    for (const platform of ['android', 'ios'] as const) {
      it(`${ad}, ${platform}: duruş titremesi ve dönüş gecikmesi`, () => {
        const iz = izUret(10000, senaryo, teta, platform);
        const eski = eskiZincir(iz, KIBLE);
        const yeni = yeniZincir(iz, KIBLE, platform);
        const jirosuz = yeniZincir(iz, KIBLE, platform, new YonFiltresi({ jiroskop: false }));

        const durusA = SALINIM_BITIS + 1500;
        const eskiStd = yonStd(eski, durusA, DURUS_BITIS);
        const yeniStd = yonStd(yeni, durusA, DURUS_BITIS);
        const jirosuzStd = yonStd(jirosuz, durusA, DURUS_BITIS);
        const eskiGecikme = gecikme(eski, iz, 150, 240, DURUS_BITIS);
        const yeniGecikme = gecikme(yeni, iz, 150, 240, DURUS_BITIS);
        const jirosuzGecikme = gecikme(jirosuz, iz, 150, 240, DURUS_BITIS);
        let satir = `${ad.padEnd(13)} ${platform.padEnd(7)} | yön std: eski ${eskiStd.toFixed(2)}° → yeni ${yeniStd.toFixed(2)}° (jiroskopsuz ${jirosuzStd.toFixed(2)}°) | %90 gecikme: eski ${eskiGecikme} ms → yeni ${yeniGecikme} ms (jiroskopsuz ${jirosuzGecikme} ms)`;

        // Duruşta titreme en az 4 kat azalır; dönüş gecikmesi artmaz (jiroskopla azalır).
        expect(yeniStd).toBeLessThan(eskiStd / 4);
        expect(jirosuzStd).toBeLessThan(eskiStd / 2);
        expect(yeniGecikme).toBeLessThanOrEqual(eskiGecikme);
        expect(jirosuzGecikme).toBeLessThanOrEqual(eskiGecikme + 60);

        if (teta === 90) {
          const eskiKamera = kameraStd(eski, durusA, DURUS_BITIS);
          const yeniKamera = kameraStd(yeni, durusA, DURUS_BITIS);
          satir += ` | kamera işareti x std: eski ${eskiKamera.toFixed(1)} px → yeni ${yeniKamera.toFixed(1)} px`;
          expect(yeniKamera).toBeLessThan(eskiKamera / 4);
        }
        sonuclar.push(satir);
      });
    }
  }
});

describe('YonFiltresi — davranış', () => {
  it('jiroskop salınımdan sonra doğrulanır ve kullanılır', () => {
    const f = new YonFiltresi();
    const iz = izUret(4000, senaryo, 90, 'ios');
    yeniZincir(iz, KIBLE, 'ios', f);
    expect(f.teshis.jiroskop).toBe('kullaniliyor');
  });

  it('YANLIŞ jiroskop eşlemesi (ters işaret) REDDEDİLİR, yön yine doğru', () => {
    const f = new YonFiltresi();
    const iz = izUret(10000, senaryo, 90, 'android', 7, -1);
    const c = yeniZincir(iz, KIBLE, 'android', f);
    expect(f.teshis.jiroskop).toBe('reddedildi');
    expect(Math.abs(aciFarki(c[c.length - 1].yon, 240))).toBeLessThan(1.5);
  });

  it('platform eşlemesi karıştırılırsa (iOS izi Android gibi okunursa) jiroskop kullanılmaz', () => {
    // DÜZ duruşta: dik telefonda düşey eksen cihaz y'sidir ve `beta` iki platformda da y'dir
    // (eşleme farkı yalnız x↔z'dedir) → karışıklık ancak düz/eğik tutuşta görünür.
    const f = new YonFiltresi();
    const iz = izUret(6000, senaryo, 5, 'ios');
    yeniZincir(iz, KIBLE, 'android', f);
    expect(f.teshis.jiroskop).not.toBe('kullaniliyor');
  });

  it('jiroskop hiç gelmezse "yok"; süzgeç yine çalışır', () => {
    const f = new YonFiltresi();
    const iz = izUret(2000, () => 30, 90, 'android');
    let son = 0;
    for (const o of iz) son = f.ekle({ asagi: asagiVektoru(o.hamIvme, o.dogrusal), manyetik: o.manyetik, ms: o.ms })!.manyetikYon;
    expect(f.teshis.jiroskop).toBe('yok');
    expect(Math.abs(aciFarki(son, 30))).toBeLessThan(1);
  });

  it('0/360 sınırında SARMA hatası yok: 355° ↔ 5° dönüşte çıktı kısa yoldan gider', () => {
    const f = new YonFiltresi({ jiroskop: false });
    const iz = izUret(4000, (ms) => (ms < 2000 ? 355 : 5), 5, 'android');
    const c = yeniZincir(iz, 0, 'android', f);
    for (const o of c.slice(60)) expect(Math.abs(aciFarki(o.yon, 0))).toBeLessThan(8);
  });

  it('kamera tabanı süzülmüş yönden kurulur: bakış azimutu = gösterilen yön', () => {
    const f = new YonFiltresi();
    const iz = izUret(3000, () => 210, 80, 'android');
    let c = null as ReturnType<YonFiltresi['ekle']>;
    for (const o of iz) c = f.ekle({ asagi: asagiVektoru(o.hamIvme, o.dogrusal), manyetik: o.manyetik, donus: donusHiziCihazEkseni(o.donus, 'android'), ms: o.ms });
    expect(azimut(c!.taban, BAKIS_VEKTORU)).toBeCloseTo(c!.manyetikYon, 6);
  });

  it('surekli: tur atmadan birikir (350 → 10 = +20)', () => {
    const f = new YonFiltresi({ jiroskop: false });
    const iz = izUret(6000, (ms) => 350 + Math.min(20, (ms / 4000) * 20), 5, 'android');
    let ilk: number | null = null;
    let son = 0;
    for (const o of iz) {
      const c = f.ekle({ asagi: asagiVektoru(o.hamIvme, o.dogrusal), manyetik: o.manyetik, ms: o.ms })!;
      if (ilk === null) ilk = c.surekli;
      son = c.surekli;
    }
    // Ölü bölge (0,25°) + duruş gürültüsü payı.
    expect(Math.abs(son - (ilk as number) - 20)).toBeLessThan(1);
  });
});

describe('teşhis (kalibrasyon rehberi girdisi)', () => {
  const sur = (f: YonFiltresi, olcek: number, baslaMs: number, sureMs: number) => {
    const iz = izUret(sureMs, () => 100, 5, 'android', 11);
    for (const o of iz) {
      f.ekle({
        asagi: asagiVektoru(o.hamIvme, o.dogrusal),
        manyetik: { x: o.manyetik.x * olcek, y: o.manyetik.y * olcek, z: o.manyetik.z * olcek },
        ms: baslaMs + o.ms,
      });
    }
  };

  it('alan büyüklüğü aralık dışında KARARLI kalınca bozuk; anlık sıçrama uyarı açmaz', () => {
    const f = new YonFiltresi();
    sur(f, 1, 0, 2000);
    expect(f.teshis.alanBozuk).toBe(false);
    expect(f.teshis.alanUt!).toBeGreaterThan(40);
    sur(f, ALAN_UST_UT / 30, 2020, BOZULMA_KARARLI_MS - 400); // ~ 115 µT, kısa
    expect(f.teshis.alanBozuk).toBe(false);
    sur(f, 6, 4000, BOZULMA_KARARLI_MS + 400); // ~290 µT, uzun
    expect(f.teshis.alanBozuk).toBe(true);
    sur(f, 1, 8000, BOZULMA_KARARLI_MS + 400); // düzeldi
    expect(f.teshis.alanBozuk).toBe(false);
  });

  it('duruşta yön büyük sıçrıyorsa tutarsız; düzelince kapanır', () => {
    const f = new YonFiltresi({ jiroskop: false });
    const n = normalUretici(3);
    let ms = 0;
    const e = cihazEksenleri(100, 5);
    const okut = (sigma: number, sure: number) => {
      for (const son = ms + sure; ms < son; ms += 20) {
        const m = cihazda(ALAN_DUNYA, e);
        f.ekle({ asagi: cihazda(ASAGI_DUNYA, e), manyetik: { x: m.x + n() * sigma, y: m.y + n() * sigma, z: m.z + n() * sigma }, ms });
      }
    };
    okut(0.5, 3000);
    expect(f.teshis.tutarsiz).toBe(false);
    okut(9, 4000);
    expect(f.teshis.tutarsiz).toBe(true);
    okut(0.5, 5000);
    expect(f.teshis.tutarsiz).toBe(false);
  });
});

describe('yardımcılar', () => {
  it('donusHiziCihazEkseni: Android alpha=x, iOS alpha=z (expo-sensors 57)', () => {
    expect(donusHiziCihazEkseni({ alpha: 10, beta: 20, gamma: 30 }, 'android')).toEqual({ x: 10 * RAD, y: 20 * RAD, z: 30 * RAD });
    expect(donusHiziCihazEkseni({ alpha: 10, beta: 20, gamma: 30 }, 'ios')).toEqual({ x: 30 * RAD, y: 20 * RAD, z: 10 * RAD });
    expect(donusHiziCihazEkseni({ alpha: NaN, beta: 1, gamma: 1 }, 'ios')).toBeNull();
    expect(donusHiziCihazEkseni(null, 'ios')).toBeNull();
  });

  it('yonHizi: düz telefon saat yönünde dönünce pozitif', () => {
    // Düz: yukarı = +z (cihaz). Saat yönü (yukarıdan) = z etrafında negatif dönüş.
    expect(yonHizi({ x: 0, y: 0, z: -1 * RAD }, { x: 0, y: 0, z: 1 })).toBeCloseTo(1, 6);
  });

  it('asagiVektoru: füzyonlu yerçekimi; doğrusal yoksa ham; bozuk füzyon hamdır', () => {
    expect(asagiVektoru({ x: 1, y: 2, z: -9 }, { x: 1, y: 2, z: 0.5 })).toEqual({ x: 0, y: 0, z: -9.5 });
    expect(asagiVektoru({ x: 1, y: 2, z: -9 }, null)).toEqual({ x: 1, y: 2, z: -9 });
    expect(asagiVektoru({ x: 1, y: 2, z: -9 }, { x: 1, y: 2, z: -9 })).toEqual({ x: 1, y: 2, z: -9 });
    expect(asagiVektoru(null, null)).toBeNull();
  });

  it('tabanKur: dönen taban sağ elli ve bakış azimutu ψ', () => {
    for (const psi of [0, 37, 151.6, 270, 359]) {
      for (const teta of [5, 45, 90, 120]) {
        const e = cihazEksenleri(10, teta);
        const t = tabanKur(cihazda({ x: 0, y: 0, z: 1 }, e), BAKIS_VEKTORU, psi)!;
        expect(azimut(t, BAKIS_VEKTORU)).toBeCloseTo(psi, 6);
        const k = capraz(t.yukari, t.dogu);
        expect(k.x).toBeCloseTo(t.kuzey.x, 6);
        expect(k.y).toBeCloseTo(t.kuzey.y, 6);
        expect(k.z).toBeCloseTo(t.kuzey.z, 6);
      }
    }
  });

  it('OneEuroAcisal: sabit girdide sabit; sarma sınırında kısa yol', () => {
    const f = new OneEuroAcisal();
    f.ekle(359, 0);
    const v = f.ekle(1, 20);
    expect(Math.abs(aciFarki(v, 0))).toBeLessThan(1.5);
  });

  it('JiroskopDenetimi: yavaş dönüşler kanıt sayılmaz', () => {
    const d = new JiroskopDenetimi();
    for (let i = 0; i < 100; i++) d.ekle(5, 5);
    expect(d.dogrulandi).toBe(false);
    expect(d.bozuk).toBe(false);
  });
});
