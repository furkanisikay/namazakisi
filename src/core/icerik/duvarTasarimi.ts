/**
 * Günün ayeti duvar kâğıdı TASARIM SÖZLEŞMESİ (SAF) — üç çizicinin tek kaynağı.
 *
 * Android çizicisi (`duvar/DuvarKagidiCizici`), iPhone Kısayollar görseli
 * (`GununAyetiGorseliIntent`) ve uygulamadaki düzenleyici AYNI sahne verisini ve AYNI
 * kuralları kullanır:
 * - Vakit gökleri (`GOK_SAHNELERI`) VERİDİR: JS yükle native'e gönderir (`duvar.sahneler`),
 *   native sanatı yeniden tanımlamaz, yalnız ilkelleri çizer (renk geçişi, ışıma, gök cismi,
 *   yıldız, huzme, çokgen).
 * - Kurallar (gök seçimi, güvenli alan ve yazı yerleşimi, okunurluk, gök cismi yer seçimi) her
 *   platformda ayrı yazılır; eşlik `android/app/src/test/resources/duvar-tasarim-ornek.json`
 *   örnekleriyle denetlenir (JS nöbetçisi örneği bu dosyadan yeniden üretir).
 *
 * Koordinatlar: x ekran genişliğinin, y ekran yüksekliğinin kesri (0–1); yarıçap ve kalınlık
 * genişliğin kesri. Renkler `#RRGGBB`, opaklık 0–1. Tasarım tuvali 330×700 (taslak 2, sahip onaylı).
 */

export type DuvarGogu = 'imsak' | 'kusluk' | 'ikindi' | 'aksam' | 'yatsi';
export const DUVAR_GOKLERI: readonly DuvarGogu[] = ['imsak', 'kusluk', 'ikindi', 'aksam', 'yatsi'];

export interface RenkDuragi {
  konum: number;
  renk: string;
}

/** Işıma: merkezde `renk`, `r`'de saydamlaşan radyal geçiş. */
export interface Isima {
  x: number;
  y: number;
  r: number;
  renk: string;
  opaklik: number;
}

/**
 * Gök cismi. `hilal`: (x,y,r) dairesinden (x+kesX, y+kesY, kesR) dairesi çıkarılır.
 * `konumlar` sıralı adaylardır: çizici yazı kutusuyla (kenar payı dahil) kesişmeyen İLK adayı
 * seçer; hepsi kesişirse cismi (ve ışımasını) ÇİZMEZ (`cisimKonumuSec`).
 */
export interface GokCismi {
  tur: 'gunes' | 'hilal';
  konumlar: readonly (readonly [number, number])[];
  r: number;
  renk: string;
  opaklik: number;
  /** Yalnız hilal. */
  kesX?: number;
  kesY?: number;
  kesR?: number;
  /** Cisimle birlikte taşınan ışıma (merkez cismin merkezi). */
  isimaR?: number;
  isimaRenk?: string;
  isimaOpaklik?: number;
}

export interface Yildiz {
  x: number;
  y: number;
  r: number;
  opaklik: number;
}

/** Cisimden ekran dışına uzanan ışık huzmesi (uç noktası sabit, başı cismin merkezi). */
export interface Huzme {
  x: number;
  y: number;
  kalinlik: number;
  renk: string;
  opaklik: number;
}

export interface Cokgen {
  noktalar: readonly (readonly [number, number])[];
  renk: string;
  opaklik: number;
}

export interface GokSahnesi {
  gradyan: readonly RenkDuragi[];
  yildizlar: readonly Yildiz[];
  cisim: GokCismi | null;
  huzmeler: readonly Huzme[];
  /** Ufuk/zemin çokgenleri (en son, cisimden SONRA çizilir). */
  ufuk: readonly Cokgen[];
  /** Yazı rengi (zemin açıksa koyu). Künye ve atıf aynı rengin %72 ve %55 opaklığı. */
  metin: string;
}

const W = 330;
const H = 700;
const x = (v: number) => Math.round((v / W) * 10000) / 10000;
const y = (v: number) => Math.round((v / H) * 10000) / 10000;
const nokta = (a: number, b: number) => [x(a), y(b)] as const;

export const GOK_SAHNELERI: Readonly<Record<DuvarGogu, GokSahnesi>> = {
  // İnce hilal, seyrek yıldız, ufukta mor şafak.
  imsak: {
    gradyan: [
      { konum: 0, renk: '#0F1430' },
      { konum: 0.55, renk: '#3B2D57' },
      { konum: 0.82, renk: '#8E5B7A' },
      { konum: 1, renk: '#E7A27C' },
    ],
    yildizlar: [
      { x: x(40), y: y(160), r: x(1.2), opaklik: 0.8 },
      { x: x(92), y: y(210), r: x(0.9), opaklik: 0.6 },
      { x: x(276), y: y(190), r: x(1.3), opaklik: 0.8 },
      { x: x(300), y: y(250), r: x(0.8), opaklik: 0.5 },
      { x: x(60), y: y(300), r: x(0.8), opaklik: 0.5 },
      { x: x(210), y: y(140), r: x(1), opaklik: 0.7 },
    ],
    cisim: {
      tur: 'hilal',
      konumlar: [nokta(262, 444), nokta(262, 236), nokta(70, 236)],
      r: x(26),
      kesX: x(-9),
      kesY: y(-6),
      kesR: x(21),
      renk: '#F6EBD0',
      opaklik: 0.95,
    },
    huzmeler: [],
    ufuk: [
      {
        noktalar: [nokta(0, 620), nokta(50, 606), nokta(90, 614), nokta(150, 594), nokta(200, 608), nokta(260, 590), nokta(330, 606), nokta(330, 700), nokta(0, 700)],
        renk: '#1E1730',
        opaklik: 0.55,
      },
    ],
    metin: '#FFFFFF',
  },
  // Yükselmiş yumuşak güneş, açık gök.
  kusluk: {
    gradyan: [
      { konum: 0, renk: '#5E9BCB' },
      { konum: 0.6, renk: '#A9CDE6' },
      { konum: 1, renk: '#EAF3F7' },
    ],
    yildizlar: [],
    cisim: {
      tur: 'gunes',
      konumlar: [nokta(90, 250), nokta(240, 250), nokta(90, 470)],
      r: x(22),
      renk: '#FFF8E6',
      opaklik: 1,
      isimaR: x(90),
      isimaRenk: '#FFF6DA',
      isimaOpaklik: 0.9,
    },
    huzmeler: [],
    ufuk: [],
    metin: '#1F2A22',
  },
  // Alçalan güneş, uzayan ışık huzmeleri.
  ikindi: {
    gradyan: [
      { konum: 0, renk: '#B9782E' },
      { konum: 0.55, renk: '#DDA95E' },
      { konum: 1, renk: '#F3DCA8' },
    ],
    yildizlar: [],
    cisim: {
      tur: 'gunes',
      konumlar: [nokta(270, 210), nokta(60, 210)],
      r: x(20),
      renk: '#FFF3D2',
      opaklik: 1,
      isimaR: x(110),
      isimaRenk: '#FFF6DA',
      isimaOpaklik: 0.85,
    },
    huzmeler: [
      { x: x(40), y: 1, kalinlik: x(18), renk: '#FFF3D2', opaklik: 0.18 },
      { x: x(150), y: 1, kalinlik: x(18), renk: '#FFF3D2', opaklik: 0.18 },
      { x: x(330), y: 1, kalinlik: x(18), renk: '#FFF3D2', opaklik: 0.18 },
    ],
    ufuk: [],
    metin: '#3B2410',
  },
  // Güneş ufukta; sıcak kızıllık.
  aksam: {
    gradyan: [
      { konum: 0, renk: '#2A1530' },
      { konum: 0.5, renk: '#7A2E3F' },
      { konum: 0.78, renk: '#D2653F' },
      { konum: 1, renk: '#F2A65A' },
    ],
    yildizlar: [],
    cisim: {
      tur: 'gunes',
      konumlar: [nokta(165, 610)],
      r: x(34),
      renk: '#FFD9A0',
      opaklik: 1,
      isimaR: x(150),
      isimaRenk: '#F7A15C',
      isimaOpaklik: 0.7,
    },
    huzmeler: [],
    ufuk: [{ noktalar: [nokta(0, 610), nokta(330, 610), nokta(330, 700), nokta(0, 700)], renk: '#3A1A2A', opaklik: 1 }],
    metin: '#FFFFFF',
  },
  // Derin lacivert, yıldızlar, küçük hilal.
  yatsi: {
    gradyan: [
      { konum: 0, renk: '#070C18' },
      { konum: 0.7, renk: '#14223B' },
      { konum: 1, renk: '#22385A' },
    ],
    yildizlar: [
      { x: x(30), y: y(140), r: x(1.3), opaklik: 0.9 },
      { x: x(70), y: y(230), r: x(0.8), opaklik: 0.6 },
      { x: x(120), y: y(170), r: x(1), opaklik: 0.7 },
      { x: x(180), y: y(120), r: x(1.4), opaklik: 0.9 },
      { x: x(240), y: y(210), r: x(0.9), opaklik: 0.6 },
      { x: x(290), y: y(150), r: x(1.2), opaklik: 0.8 },
      { x: x(310), y: y(300), r: x(0.8), opaklik: 0.5 },
      { x: x(20), y: y(340), r: x(0.9), opaklik: 0.6 },
      { x: x(150), y: y(300), r: x(0.7), opaklik: 0.5 },
      { x: x(260), y: y(360), r: x(1), opaklik: 0.6 },
      { x: x(90), y: y(420), r: x(0.7), opaklik: 0.4 },
      { x: x(210), y: y(470), r: x(0.8), opaklik: 0.4 },
    ],
    cisim: {
      tur: 'hilal',
      konumlar: [nokta(262, 444), nokta(60, 444), nokta(262, 236)],
      r: x(14),
      kesX: x(-5),
      kesY: y(-3),
      kesR: x(11),
      renk: '#EDE6CF',
      opaklik: 0.9,
    },
    huzmeler: [],
    ufuk: [],
    metin: '#FFFFFF',
  },
};

// --- Ayar -----------------------------------------------------------------------------

export type YaziHizasi = 'bas' | 'orta' | 'son';
export type YaziTipi = 'klasik' | 'zarif' | 'sade';
export type SusTuru = 'yildiz' | 'mihrap' | 'girih' | 'yok';

export interface DuvarYaziAyari {
  /** Yazı bloğunun DİKEY MERKEZİ (ekran kesri); `null` = ekranın varsayılanı. Kilit ve ana ayrı. */
  kilitY: number | null;
  anaY: number | null;
  /** Yazı boyutu çarpanı (0,7–1,6). */
  olcek: number;
  hiza: YaziHizasi;
  tip: YaziTipi;
}

export interface DuvarSusAyari {
  tur: SusTuru;
  /** 0–1. */
  belirginlik: number;
}

export interface DuvarFotoAyari {
  /** Uygulamanın kendi kopyasının dosya adı (`duvar-foto-<özet>.jpg`); `null` = seçilmedi. */
  dosya: string | null;
  /** Siyah örtü 0–0,85. */
  karartma: number;
  /** 0–1 (çizicide yarıçap: kısa kenarın %0–%4'ü). */
  bulaniklik: number;
  /** Kırpma merkezi (görsel kesri) ve yakınlık (≥1). */
  x: number;
  y: number;
  yakinlik: number;
  /** Açıkken yazı rengi ve yazı arkası perde fotoğrafa göre seçilir (`okunurlukKarari`). */
  okunurluk: boolean;
}

export const VARSAYILAN_YAZI: DuvarYaziAyari = { kilitY: null, anaY: null, olcek: 1, hiza: 'orta', tip: 'klasik' };
export const VARSAYILAN_SUS: DuvarSusAyari = { tur: 'yildiz', belirginlik: 0.5 };
export const VARSAYILAN_FOTO: DuvarFotoAyari = { dosya: null, karartma: 0.4, bulaniklik: 0.15, x: 0.5, y: 0.5, yakinlik: 1, okunurluk: true };

const sinirla = (v: unknown, alt: number, ust: number, varsayilan: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(ust, Math.max(alt, v)) : varsayilan;

export function yaziAyariNormalize(ham: unknown): DuvarYaziAyari {
  const k = (ham && typeof ham === 'object' ? ham : {}) as Record<string, unknown>;
  const yKes = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : null);
  return {
    kilitY: yKes(k.kilitY),
    anaY: yKes(k.anaY),
    olcek: sinirla(k.olcek, 0.7, 1.6, VARSAYILAN_YAZI.olcek),
    hiza: k.hiza === 'bas' || k.hiza === 'son' || k.hiza === 'orta' ? k.hiza : VARSAYILAN_YAZI.hiza,
    tip: k.tip === 'zarif' || k.tip === 'sade' || k.tip === 'klasik' ? k.tip : VARSAYILAN_YAZI.tip,
  };
}

export function susAyariNormalize(ham: unknown): DuvarSusAyari {
  const k = (ham && typeof ham === 'object' ? ham : {}) as Record<string, unknown>;
  const tur = k.tur === 'mihrap' || k.tur === 'girih' || k.tur === 'yok' || k.tur === 'yildiz' ? k.tur : VARSAYILAN_SUS.tur;
  return { tur, belirginlik: sinirla(k.belirginlik, 0, 1, VARSAYILAN_SUS.belirginlik) };
}

export function fotoAyariNormalize(ham: unknown): DuvarFotoAyari {
  const k = (ham && typeof ham === 'object' ? ham : {}) as Record<string, unknown>;
  const dosya = typeof k.dosya === 'string' && /^duvar-foto-[0-9a-z]{4,40}\.(jpg|png)$/.test(k.dosya) ? k.dosya : null;
  return {
    dosya,
    karartma: sinirla(k.karartma, 0, 0.85, VARSAYILAN_FOTO.karartma),
    bulaniklik: sinirla(k.bulaniklik, 0, 1, VARSAYILAN_FOTO.bulaniklik),
    x: sinirla(k.x, 0, 1, VARSAYILAN_FOTO.x),
    y: sinirla(k.y, 0, 1, VARSAYILAN_FOTO.y),
    yakinlik: sinirla(k.yakinlik, 1, 4, VARSAYILAN_FOTO.yakinlik),
    okunurluk: k.okunurluk !== false,
  };
}

// --- Gök seçimi ------------------------------------------------------------------------

/** Bir namaz gününün vakitleri (epoch ms): imsak, güneş, ikindi, akşam, yatsı. */
export type GunVakitleri = readonly [number, number, number, number, number];

/**
 * O anın göğü: imsak ≤ t < güneş → imsak; güneş ≤ t < ikindi → kuşluk (öğle dahil);
 * ikindi ≤ t < akşam → ikindi; akşam ≤ t < yatsı → akşam; yatsıdan sonra ve imsaktan önce → yatsı.
 */
export function vaktinGogu(simdiMs: number, v: GunVakitleri): DuvarGogu {
  if (simdiMs >= v[0] && simdiMs < v[1]) return 'imsak';
  if (simdiMs >= v[1] && simdiMs < v[2]) return 'kusluk';
  if (simdiMs >= v[2] && simdiMs < v[3]) return 'ikindi';
  if (simdiMs >= v[3] && simdiMs < v[4]) return 'aksam';
  return 'yatsi';
}

/** `simdiMs`'den sonraki ilk gök sınırı (yoksa null): native tek alarmını buna kurar. */
export function sonrakiGokSiniri(simdiMs: number, v: GunVakitleri): number | null {
  for (const s of v) if (s > simdiMs) return s;
  return null;
}

// --- Güvenli alan ve yerleşim ----------------------------------------------------------

export type DuvarEkrani = 'kilit' | 'ana';
export type DuvarPlatformu = 'android' | 'ios';

/** Yazının girebileceği dikey bantlar [üst, alt] (ekran kesri), yukarıdan aşağı. */
export const IZINLI_BANTLAR: Readonly<Record<DuvarPlatformu, Readonly<Record<DuvarEkrani, readonly (readonly [number, number])[]>>>> = {
  // Android 14+ büyük kilit saati bildirim yokken ~%28–%62; kilit simgesi ~%84'ten başlar
  // (emülatör karesi 66). Saatin üstündeki ince şerit de kullanılabilir.
  android: { kilit: [[0.08, 0.26], [0.64, 0.84]], ana: [[0.07, 0.88]] },
  // iPhone saati üstte (~%8–%32), fener/kamera ~%86'dan başlar.
  ios: { kilit: [[0.34, 0.85]], ana: [[0.07, 0.86]] },
};

/** Ekranın varsayılan yazı merkezi (kullanıcı taşımadıysa): mevcut bant düzeni. */
export const VARSAYILAN_MERKEZ: Readonly<Record<DuvarPlatformu, Readonly<Record<DuvarEkrani, number>>>> = {
  android: { kilit: 0.73, ana: 0.215 },
  ios: { kilit: 0.58, ana: 0.25 },
};

/**
 * İstenen merkeze en yakın, bloğun SIĞDIĞI bant içi yerleşim. Döner: bloğun üst kenarı (kesir)
 * ve bant. Hiçbir banda sığmıyorsa `null` (çizici yazıyı küçültüp yeniden dener; en küçükte
 * Arapça düşer — mevcut kural).
 */
export function yaziYerlesimi(
  istenenMerkez: number,
  blokYuksekligi: number,
  bantlar: readonly (readonly [number, number])[]
): { ust: number; bant: readonly [number, number] } | null {
  let enIyi: { ust: number; bant: readonly [number, number]; fark: number } | null = null;
  for (const b of bantlar) {
    if (b[1] - b[0] < blokYuksekligi) continue;
    const ust = Math.min(b[1] - blokYuksekligi, Math.max(b[0], istenenMerkez - blokYuksekligi / 2));
    const fark = Math.abs(ust + blokYuksekligi / 2 - istenenMerkez);
    if (!enIyi || fark < enIyi.fark) enIyi = { ust, bant: b, fark };
  }
  return enIyi ? { ust: enIyi.ust, bant: enIyi.bant } : null;
}

/** Yazı kutusunun cisimle kesişme denetiminde kenar payı (genişlik kesri). */
export const CISIM_PAYI = 0.04;

/**
 * Gök cisminin adaylarından yazı kutusuna (x1,y1,x2,y2 kesir; `null` = yazı yok) değmeyen ilki;
 * hepsi değiyorsa `null` (cisim çizilmez). Kesişme: cismin ışımasız diski + pay, kutuyla.
 * `oran` = yükseklik/genişlik (y kesrini genişlik birimine çevirir).
 */
export function cisimKonumuSec(
  cisim: GokCismi,
  kutu: readonly [number, number, number, number] | null,
  oran: number
): readonly [number, number] | null {
  for (const k of cisim.konumlar) {
    if (!kutu) return k;
    const cx = k[0];
    const cy = k[1] * oran;
    const r = cisim.r + CISIM_PAYI;
    const yakX = Math.min(kutu[2], Math.max(kutu[0], cx));
    const yakY = Math.min(kutu[3] * oran, Math.max(kutu[1] * oran, cy));
    if ((cx - yakX) ** 2 + (cy - yakY) ** 2 > r * r) return k;
  }
  return null;
}

// --- Okunurluk -------------------------------------------------------------------------

/** sRGB bağıl parlaklık (WCAG). */
export function bagilParlaklik(renk: string): number {
  const n = parseInt(renk.slice(1), 16);
  const kanal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal((n >> 16) & 255) + 0.7152 * kanal((n >> 8) & 255) + 0.0722 * kanal(n & 255);
}

const kontrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export const ACIK_METIN = '#FFFFFF';
export const KOYU_METIN = '#1F2A22';

/**
 * Fotoğraf zemininde (karartma uygulanmış) yazı kutusunun ORTALAMA bağıl parlaklığına göre yazı
 * rengi ve yazı arkasına konacak perde. Hedef 4,5:1. Açık yazı → siyah perde, koyu yazı → beyaz
 * perde; perde opaklığı hedefi tutturan en küçük değer (0,05 adım, en çok 0,6).
 */
export function okunurlukKarari(ortalamaParlaklik: number): { metin: string; perde: string; perdeOpakligi: number } {
  const L = Math.min(1, Math.max(0, ortalamaParlaklik));
  const acikla = kontrast(1, L);
  const koyuL = bagilParlaklik(KOYU_METIN);
  const koyuyla = kontrast(koyuL, L);
  const acik = acikla >= koyuyla;
  const metinL = acik ? 1 : koyuL;
  const perdeL = acik ? 0 : 1;
  let opaklik = 0;
  while (opaklik < 0.6 - 1e-9) {
    const zemin = L * (1 - opaklik) + perdeL * opaklik;
    if (kontrast(metinL, zemin) >= 4.5) break;
    opaklik = Math.round((opaklik + 0.05) * 100) / 100;
  }
  return { metin: acik ? ACIK_METIN : KOYU_METIN, perde: acik ? '#000000' : '#FFFFFF', perdeOpakligi: opaklik };
}
