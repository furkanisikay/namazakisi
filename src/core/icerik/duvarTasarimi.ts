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

// --- Kilit ekranı saat alanı -------------------------------------------------------------
// Saatin yerini veren genel API YOK (Android'de yerel renk alanları `@hide`, iOS'ta hiç yok;
// Pixel'de bildirimle küçülür, Samsung'da taşınır, iOS 26'da boyutlanır). Varsayılan tahmindir;
// kullanıcı kilit ekranı görüntüsünden ölçebilir (`saatAlaniBul`) ya da kenarları elle ayarlar.

/** Kilit ekranında saatin (tarihle birlikte) kapladığı dikey aralık [üst, alt], ekran kesri. */
export type SaatAlani = readonly [number, number];

/**
 * Saat alanının nereden geldiği: görüntüden ölçüldü mü, kenarları elle mi ayarlandı. Yalnız
 * düzenleyicinin durum satırı içindir (yük ve `DuvarKagidiAyari` taşımaz, cihaza özgü ayrı anahtar).
 */
export type SaatAlaniKaynagi = 'olcum' | 'elle';

/** Ölçülmemişse: Android 14+ büyük saat (emülatör karesi 66), iPhone saati üstte. */
export const VARSAYILAN_SAAT_ALANI: Readonly<Record<DuvarPlatformu, SaatAlani>> = {
  android: [0.26, 0.64],
  ios: [0.08, 0.34],
};

/** Kilit ekranında yazının dış sınırları (üstte durum çubuğu/tarih, altta kilit simgesi/fener). */
export const KILIT_DIS_SINIR: Readonly<Record<DuvarPlatformu, SaatAlani>> = {
  android: [0.08, 0.84],
  ios: [0.08, 0.85],
};

/** Saatin üstünde/altında kalan şerit bundan inceyse yazıya bant sayılmaz. */
export const EN_DAR_BANT = 0.05;
/** Saat alanının en az ve en çok yüksekliği (ölçüm ve elle ayar bununla sınırlanır). */
export const SAAT_ALANI_EN_AZ = 0.04;
export const SAAT_ALANI_EN_COK = 0.6;

const dort = (v: number) => Math.round(v * 10000) / 10000;

/** Bozuk saat alanı `null` (varsayılan kullanılır); geçerliyse sınırlanır ve 4 haneye yuvarlanır. */
export function saatAlaniNormalize(ham: unknown): SaatAlani | null {
  if (!Array.isArray(ham) || ham.length !== 2) return null;
  const [u, a] = ham as unknown[];
  if (typeof u !== 'number' || typeof a !== 'number' || !Number.isFinite(u) || !Number.isFinite(a)) return null;
  const ust = Math.min(0.9 - SAAT_ALANI_EN_AZ, Math.max(0, u));
  const alt = Math.min(Math.min(0.95, ust + SAAT_ALANI_EN_COK), Math.max(ust + SAAT_ALANI_EN_AZ, a));
  return [dort(ust), dort(alt)];
}

/**
 * Yazının girebileceği bantlar. Ana ekran sabit (`IZINLI_BANTLAR`); kilit ekranı = dış sınır eksi
 * saat alanı (ölçülmemişse platform varsayılanı → `IZINLI_BANTLAR` ile birebir aynı). En az bir
 * bant döner: iki şerit de dar kalırsa büyüğü.
 */
export function izinliBantlar(
  platform: DuvarPlatformu,
  ekran: DuvarEkrani,
  saatAlani: SaatAlani | null
): readonly (readonly [number, number])[] {
  if (ekran === 'ana') return IZINLI_BANTLAR[platform].ana;
  const [du, da] = KILIT_DIS_SINIR[platform];
  const [su, sa] = saatAlani ?? VARSAYILAN_SAAT_ALANI[platform];
  const ustSerit: readonly [number, number] = [du, Math.max(du, Math.min(su, da))];
  const altSerit: readonly [number, number] = [Math.min(da, Math.max(sa, du)), da];
  const bantlar = [ustSerit, altSerit].filter((b) => b[1] - b[0] >= EN_DAR_BANT);
  if (bantlar.length) return bantlar;
  return [ustSerit[1] - ustSerit[0] >= altSerit[1] - altSerit[0] ? ustSerit : altSerit];
}

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

/** Cisim diski (+ pay) yazı kutusuna değiyor mu? (y kesri `oran` ile genişlik birimine çevrilir.) */
function kutuyaDeger(k: readonly [number, number], r: number, kutu: readonly [number, number, number, number] | null, oran: number): boolean {
  if (!kutu) return false;
  const cx = k[0];
  const cy = k[1] * oran;
  const yakX = Math.min(kutu[2], Math.max(kutu[0], cx));
  const yakY = Math.min(kutu[3] * oran, Math.max(kutu[1] * oran, cy));
  return (cx - yakX) ** 2 + (cy - yakY) ** 2 <= r * r;
}

/**
 * Gök cisminin yeri. Sırayla: (1) yazı kutusuna (x1,y1,x2,y2 kesir; `null` = yazı yok) ve saat
 * alanına (tam genişlik dikey aralık; `null` = yok, ör. ana ekran) değmeyen ilk aday; (2) yoksa
 * kutuya değmeyen ilk adayın x'inde, saat alanının hemen ÜSTÜNE (sığmazsa hemen altına) kaydırılmış
 * konum (yine kutuya değmemeli, ekrandan taşmamalı); (3) hiçbiri olmazsa `null` (cisim çizilmez).
 * Kesişme: cismin ışımasız diski + `CISIM_PAYI`. `oran` = yükseklik/genişlik.
 */
export function cisimKonumuSec(
  cisim: GokCismi,
  kutu: readonly [number, number, number, number] | null,
  oran: number,
  saatAlani: SaatAlani | null = null
): readonly [number, number] | null {
  const r = cisim.r + CISIM_PAYI;
  const ry = r / oran;
  const saateDeger = (y: number) => !!saatAlani && y + ry > saatAlani[0] && y - ry < saatAlani[1];
  for (const k of cisim.konumlar) {
    if (!kutuyaDeger(k, r, kutu, oran) && !saateDeger(k[1])) return k;
  }
  if (!saatAlani) return null;
  const temel = cisim.konumlar.find((k) => !kutuyaDeger(k, r, kutu, oran));
  if (!temel) return null;
  for (const y of [saatAlani[0] - ry, saatAlani[1] + ry]) {
    const aday: readonly [number, number] = [temel[0], dort(y)];
    if (y - ry >= 0 && y + ry <= 1 && !kutuyaDeger(aday, r, kutu, oran)) return aday;
  }
  return null;
}

/**
 * Süsün saat alanında görünürlüğü (0–1): alanın içinde `SOLMA_IC` derinlikten sonra 0, alanın
 * dışına `SOLMA_DIS` çıkınca 1, arası doğrusal. Mihrap kemeri saate girerken bununla solar;
 * saat alanı yoksa (ana ekran) her yerde 1.
 */
export const SOLMA_IC = 0.05;
export const SOLMA_DIS = 0.0125;
export function saatSolmasi(y: number, saatAlani: SaatAlani | null): number {
  if (!saatAlani) return 1;
  const disarida = y < saatAlani[0] ? saatAlani[0] - y : y > saatAlani[1] ? y - saatAlani[1] : -Math.min(y - saatAlani[0], saatAlani[1] - y);
  return Math.min(1, Math.max(0, (disarida + SOLMA_IC) / (SOLMA_IC + SOLMA_DIS)));
}

/** [y1, y2] dikey aralığı (ekran kesri) saat alanına değiyor mu? (Mihrap yıldızı değiyorsa çizilmez.) */
export function saateDegiyor(y1: number, y2: number, saatAlani: SaatAlani | null): boolean {
  return !!saatAlani && y2 > saatAlani[0] && y1 < saatAlani[1];
}

// --- Saat alanını kilit ekranı görüntüsünden ölçme ----------------------------------------
// Native, kullanıcının seçtiği kilit ekranı görüntüsünü SON uygulanan kilit görseliyle (aynı
// boyuta küçültülmüş) karşılaştırır: parlaklık kazanç/kaymayla eşlenir (kilit ekranı karartır),
// eşiği aşan pikseller "üstte çizilmiş" sayılır ve her satır için oranı döner (`profil`). Karar
// burada, tek yerde verilir.

/** Bir satır, piksellerinin en az bu oranı farklıysa "dolu" sayılır. */
export const OLCUM_SATIR_ESIGI = 0.02;
/** Arası bu kadar (ekran kesri) olan dolu bölgeler birleşir (tarih + saat tek alan). */
export const OLCUM_BIRLESTIRME = 0.015;
/** Bundan kısa dolu bölge saat sayılmaz (tek satır bildirim/simge). */
export const OLCUM_EN_KISA = 0.03;
/** Satırların bundan fazlası doluysa görüntü bu duvar kâğıdına ait değildir. */
export const OLCUM_EN_COK_DOLU = 0.6;
/** Bulunan alana her iki yandan eklenen pay. */
export const OLCUM_PAY = 0.01;

export type SaatOlcumu = { sonuc: 'tamam'; alan: SaatAlani } | { sonuc: 'uyusmadi' } | { sonuc: 'bulunamadi' };

/**
 * Satır profilinden saat alanı: dolu satırlar bölgelere ayrılır (yakınlar birleşir), ekranın
 * %5–%80 arasında ortalanan en yüksek bölge saattir (durum çubuğu ve alttaki kilit/fener dışarıda
 * kalır). Çok dolu profil = başka bir duvar kâğıdının görüntüsü.
 */
export function saatAlaniBul(profil: readonly number[]): SaatOlcumu {
  const n = profil.length;
  if (n < 20) return { sonuc: 'bulunamadi' };
  const dolu = profil.map((v) => Number.isFinite(v) && v >= OLCUM_SATIR_ESIGI);
  if (dolu.filter(Boolean).length / n > OLCUM_EN_COK_DOLU) return { sonuc: 'uyusmadi' };
  const bolgeler: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    if (!dolu[i]) continue;
    const son = bolgeler[bolgeler.length - 1];
    if (son && i - son[1] - 1 <= OLCUM_BIRLESTIRME * n) son[1] = i;
    else bolgeler.push([i, i]);
  }
  let enIyi: [number, number] | null = null;
  for (const [b, s] of bolgeler) {
    const ust = b / n;
    const alt = (s + 1) / n;
    const orta = (ust + alt) / 2;
    if (alt - ust < OLCUM_EN_KISA || orta < 0.05 || orta > 0.8) continue;
    if (!enIyi || alt - ust > enIyi[1] - enIyi[0]) enIyi = [ust, alt];
  }
  if (!enIyi) return { sonuc: 'bulunamadi' };
  const alan = saatAlaniNormalize([enIyi[0] - OLCUM_PAY, enIyi[1] + OLCUM_PAY]);
  return alan ? { sonuc: 'tamam', alan } : { sonuc: 'bulunamadi' };
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
