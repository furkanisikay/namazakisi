/**
 * Ülkeye göre namaz vakti hesap profilleri — SAF tablo ve parametre kurucusu.
 *
 * Türkiye (Diyanet) profili `turkiyeHesapParametreleri()`'nin KENDİSİNİ döndürür;
 * kullanıcı ince ayar yapmadıkça bayt bayt aynı nesnedir (nöbetçi
 * `hesapProfilleri.test.ts`). Diğer profiller kaynak notuyla birlikte: tasarım ve
 * ampirik uydurma tablosu `docs/superpowers/specs/2026-10-24-cok-dil-dunya-konum-design.md` §6.2.
 *
 * `guven`:
 *  - `olculdu`: otoritenin yayımladığı 2026 tablosu adhan'a uyduruldu (±2 dk).
 *  - `kaynakli`: otoritenin kendi metni ya da yöntemin resmî tanımı var, tabloyla ölçülmedi.
 *  - `genel`: ülke için doğrulanmış kaynak yok; genel yöntem — ekran "camiyle karşılaştırın" der.
 *
 * İkindi profilin VARSAYILANIDIR (yerel camilerin okuduğu); kullanıcı `HesapAyari.ikindi`
 * ile değiştirir. Mezhep ayarından (`core/mezhep`) TÜRETİLMEZ.
 */
import {
  CalculationMethod,
  HighLatitudeRule,
  Madhab,
  type CalculationParameters,
} from 'adhan';
import { turkiyeHesapParametreleri } from './hesapParametreleri';

export type HesapProfiliKimligi =
  | 'diyanet'
  | 'mwl'
  | 'ummulKura'
  | 'misir'
  | 'karachi'
  | 'isna'
  | 'kanada'
  | 'moonsighting'
  | 'dubai'
  | 'katar'
  | 'kuveyt'
  | 'jakim'
  | 'muis'
  | 'kemenag'
  | 'urdun'
  | 'bosna'
  | 'fas'
  | 'tunus'
  | 'tahran'
  | 'caferi';

export type IkindiYontemi = 'evvel' | 'sani';
export type ProfilGuveni = 'olculdu' | 'kaynakli' | 'genel';
export type VakitOfsetAnahtari = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export interface HesapProfili {
  kimlik: HesapProfiliKimligi;
  /** Kurumun kısa adı (çip ve listede; özel ad, çevrilmez). */
  kisaAd: string;
  /** Kaynak bağlantısı (otoritenin kendi sayfası ya da yöntemin resmî tanımı). */
  kaynakUrl: string;
  ikindi: IkindiYontemi;
  /** Ramazan'da yatsıya eklenen dakika (Ümmü'l-Kurâ: 90 → 120). */
  ramazanYatsiEkDk?: number;
  /** Elle seçilebilir ama hiçbir ülkenin varsayılanı olamaz (Caferî). */
  yalnizElle?: boolean;
  /** Profilin ham parametreleri (madhab Şâfiî; ikindi ayrıca uygulanır). */
  parametre: () => CalculationParameters;
}

function diger(
  fecr: number,
  yatsi: number,
  ofset: Partial<CalculationParameters['methodAdjustments']> = {},
  ek?: (p: CalculationParameters) => void,
): () => CalculationParameters {
  return () => {
    const p = CalculationMethod.Other();
    p.fajrAngle = fecr;
    p.ishaAngle = yatsi;
    p.methodAdjustments = { ...p.methodAdjustments, ...ofset };
    ek?.(p);
    return p;
  };
}

export const HESAP_PROFILLERI: Readonly<Record<HesapProfiliKimligi, HesapProfili>> = {
  diyanet: {
    kimlik: 'diyanet', kisaAd: 'Diyanet', ikindi: 'evvel',
    kaynakUrl: 'https://namazvakitleri.diyanet.gov.tr',
    parametre: turkiyeHesapParametreleri,
  },
  mwl: {
    kimlik: 'mwl', kisaAd: 'MWL', ikindi: 'evvel',
    kaynakUrl: 'https://github.com/batoulapps/adhan-js/blob/master/METHODS.md',
    parametre: () => CalculationMethod.MuslimWorldLeague(),
  },
  ummulKura: {
    kimlik: 'ummulKura', kisaAd: 'Umm al-Qura', ikindi: 'evvel', ramazanYatsiEkDk: 30,
    kaynakUrl: 'https://www.ummulqura.org.sa',
    parametre: () => CalculationMethod.UmmAlQura(),
  },
  misir: {
    kimlik: 'misir', kisaAd: 'Egyptian', ikindi: 'evvel',
    kaynakUrl: 'https://github.com/batoulapps/adhan-js/blob/master/METHODS.md',
    parametre: () => CalculationMethod.Egyptian(),
  },
  karachi: {
    kimlik: 'karachi', kisaAd: 'Karachi', ikindi: 'sani',
    kaynakUrl: 'https://fiqhcouncil.org/the-suggested-calculation-method-for-fajr-and-isha/',
    parametre: () => CalculationMethod.Karachi(),
  },
  isna: {
    kimlik: 'isna', kisaAd: 'ISNA', ikindi: 'evvel',
    kaynakUrl: 'https://fiqhcouncil.org/the-suggested-calculation-method-for-fajr-and-isha/',
    parametre: () => CalculationMethod.NorthAmerica(),
  },
  kanada: {
    kimlik: 'kanada', kisaAd: 'FCNA', ikindi: 'evvel',
    kaynakUrl: 'https://fiqhcouncil.org/the-suggested-calculation-method-for-fajr-and-isha/',
    parametre: diger(13, 13),
  },
  moonsighting: {
    kimlik: 'moonsighting', kisaAd: 'Moonsighting', ikindi: 'evvel',
    kaynakUrl: 'https://londonsalahtimes.com/technical',
    parametre: () => CalculationMethod.MoonsightingCommittee(),
  },
  dubai: {
    kimlik: 'dubai', kisaAd: 'Awqaf UAE', ikindi: 'evvel',
    kaynakUrl: 'https://www.awqaf.gov.ae',
    parametre: () => CalculationMethod.Dubai(),
  },
  katar: {
    kimlik: 'katar', kisaAd: 'Qatar', ikindi: 'evvel',
    kaynakUrl: 'https://github.com/batoulapps/adhan-js/blob/master/METHODS.md',
    parametre: () => CalculationMethod.Qatar(),
  },
  kuveyt: {
    kimlik: 'kuveyt', kisaAd: 'Kuwait', ikindi: 'evvel',
    kaynakUrl: 'https://github.com/batoulapps/adhan-js/blob/master/METHODS.md',
    parametre: () => CalculationMethod.Kuwait(),
  },
  // JAKIM: MKİ 116 (Kasım 2019) sabahı 18°'ye aldı; adhan'ın Singapore hazırı (20°) Malezya'ya UYMAZ.
  jakim: {
    kimlik: 'jakim', kisaAd: 'JAKIM', ikindi: 'evvel',
    kaynakUrl: 'https://www.e-solat.gov.my',
    parametre: diger(18, 18, { fajr: 2, sunrise: -2, dhuhr: 2, asr: 1, maghrib: 2, isha: 2 }),
  },
  muis: {
    kimlik: 'muis', kisaAd: 'MUIS', ikindi: 'evvel',
    kaynakUrl: 'https://www.muis.gov.sg',
    parametre: () => CalculationMethod.Singapore(),
  },
  kemenag: {
    kimlik: 'kemenag', kisaAd: 'Kemenag', ikindi: 'evvel',
    kaynakUrl: 'https://bimasislam.kemenag.go.id',
    parametre: diger(20, 18, { fajr: 3, sunrise: -3, dhuhr: 3, asr: 2, maghrib: 3, isha: 2 }),
  },
  urdun: {
    kimlik: 'urdun', kisaAd: 'Awqaf Jordan', ikindi: 'evvel',
    kaynakUrl: 'https://www.awqaf.gov.jo/ar/Pages/PrayerTime',
    parametre: diger(18, 18, { sunrise: -6, maghrib: 6 }),
  },
  bosna: {
    kimlik: 'bosna', kisaAd: 'IZ BiH', ikindi: 'evvel',
    kaynakUrl: 'https://islamskazajednica.ba/281-vaktija-kalendar-takvim',
    parametre: diger(18, 16, { sunrise: -6, dhuhr: 1, maghrib: 6 }),
  },
  fas: {
    kimlik: 'fas', kisaAd: 'Habous', ikindi: 'evvel',
    kaynakUrl: 'https://www.habous.gov.ma',
    parametre: diger(19, 17),
  },
  tunus: {
    kimlik: 'tunus', kisaAd: 'Tunisia', ikindi: 'evvel',
    kaynakUrl: 'https://api.aladhan.com/v1/methods',
    parametre: diger(18, 18),
  },
  tahran: {
    // İran'ın resmî otoritesi (Tahran Üniversitesi Jeofizik Enstitüsü); yalnız İran'ın varsayılanı.
    kimlik: 'tahran', kisaAd: 'Tehran', ikindi: 'evvel',
    kaynakUrl: 'https://github.com/batoulapps/adhan-js/blob/master/METHODS.md',
    parametre: () => CalculationMethod.Tehran(),
  },
  // Caferî (Leva Enstitüsü, Kum): akşam güneş batışı değil 4° irtifa altı.
  caferi: {
    kimlik: 'caferi', kisaAd: 'Ja\'fari', ikindi: 'evvel', yalnizElle: true,
    kaynakUrl: 'https://api.aladhan.com/v1/methods',
    parametre: diger(16, 14, {}, (p) => { p.maghribAngle = 4; }),
  },
};

/** Ümmü'l-Kurâ takviminde Ramazan (miladi, kapsayıcı). Üretim: Intl `islamic-umalqura`, 2026-10-24. */
export const UMMUL_KURA_RAMAZAN: readonly (readonly [string, string])[] = [
  ['2026-02-18', '2026-03-19'], ['2027-02-08', '2027-03-08'], ['2028-01-28', '2028-02-25'],
  ['2029-01-16', '2029-02-13'], ['2030-01-05', '2030-02-03'], ['2030-12-26', '2031-01-23'],
  ['2031-12-16', '2032-01-13'], ['2032-12-04', '2033-01-02'], ['2033-11-23', '2033-12-22'],
  ['2034-11-12', '2034-12-11'], ['2035-11-01', '2035-11-30'],
];

function isoGun(tarih: Date): string {
  const a = tarih.getMonth() + 1;
  const g = tarih.getDate();
  return `${tarih.getFullYear()}-${a < 10 ? '0' : ''}${a}-${g < 10 ? '0' : ''}${g}`;
}

export function ummulKuraRamazanMi(tarih: Date): boolean {
  const gun = isoGun(tarih);
  return UMMUL_KURA_RAMAZAN.some(([bas, son]) => gun >= bas && gun <= son);
}

/** Kullanıcının kalıcı hesap ayarı (`DEPOLAMA_ANAHTARLARI.HESAP_AYARI`). Yokluğu = Diyanet. */
export interface HesapAyari {
  profil: HesapProfiliKimligi;
  /** Profil varsayılanını ezer. */
  ikindi?: IkindiYontemi;
  /** Vakit başına kalıcı dakika düzeltmesi (camiye göre). */
  ofsetler?: Partial<Record<VakitOfsetAnahtari, number>>;
  /** Özel sabah/yatsı açısı (gelişmiş). */
  aci?: { fecr?: number; yatsi?: number };
  /** Kullanıcı ekrandan bilinçli seçti mi (ülke kartı bir daha bu yüzden sormaz). */
  secildi?: boolean;
  /** "Bölgenizin takvimi" kartının sorulduğu ülkeler (ISO 3166-1 alfa-2). */
  sorulanUlkeler?: string[];
}

export const VARSAYILAN_HESAP_AYARI: HesapAyari = { profil: 'diyanet' };

const OFSET_SINIRI = 30;
const ACI_ALT = 10;
const ACI_UST = 22;

function sinirla(deger: unknown, alt: number, ust: number): number | undefined {
  if (typeof deger !== 'number' || !Number.isFinite(deger)) return undefined;
  return Math.min(ust, Math.max(alt, Math.round(deger * 10) / 10));
}

/** Ham depolama değerini güvenli ayara çevirir; tanınmayan her şey Diyanet'e düşer. */
export function hesapAyariNormalize(ham: unknown): HesapAyari {
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return { ...VARSAYILAN_HESAP_AYARI };
  const k = ham as Record<string, unknown>;
  const profil = typeof k.profil === 'string' && k.profil in HESAP_PROFILLERI
    ? (k.profil as HesapProfiliKimligi)
    : 'diyanet';
  const sonuc: HesapAyari = { profil };
  if (k.ikindi === 'evvel' || k.ikindi === 'sani') sonuc.ikindi = k.ikindi;
  if (k.ofsetler && typeof k.ofsetler === 'object') {
    const o: Partial<Record<VakitOfsetAnahtari, number>> = {};
    for (const anahtar of ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
      const d = sinirla((k.ofsetler as Record<string, unknown>)[anahtar], -OFSET_SINIRI, OFSET_SINIRI);
      if (d !== undefined && d !== 0) o[anahtar] = Math.round(d);
    }
    if (Object.keys(o).length) sonuc.ofsetler = o;
  }
  if (k.aci && typeof k.aci === 'object') {
    const fecr = sinirla((k.aci as Record<string, unknown>).fecr, ACI_ALT, ACI_UST);
    const yatsi = sinirla((k.aci as Record<string, unknown>).yatsi, ACI_ALT, ACI_UST);
    if (fecr !== undefined || yatsi !== undefined) {
      sonuc.aci = {};
      if (fecr !== undefined) sonuc.aci.fecr = fecr;
      if (yatsi !== undefined) sonuc.aci.yatsi = yatsi;
    }
  }
  if (k.secildi === true) sonuc.secildi = true;
  if (Array.isArray(k.sorulanUlkeler)) {
    const ulkeler = k.sorulanUlkeler.filter((u): u is string => typeof u === 'string' && /^[A-Z]{2}$/.test(u));
    if (ulkeler.length) sonuc.sorulanUlkeler = [...new Set(ulkeler)];
  }
  return sonuc;
}

/** Ayar Diyanet'in DOKUNULMAMIŞ hâli mi (hesap `turkiyeHesapParametreleri()`'ye eşit)? */
export function diyanetDokunulmamisMi(ayar: HesapAyari): boolean {
  return ayar.profil === 'diyanet' && !ayar.ikindi && !ayar.ofsetler && !ayar.aci;
}

export interface HesapBaglami {
  /** PrayerTimes'ın hesaplanacağı gün (Ramazan yatsı kuralı için). */
  tarih?: Date;
  /** Enlem (yüksek enlem kuralı için). */
  enlem?: number;
}

/** Yüksek enlem eşiği: bu enlemin üstünde Diyanet dışı profillerde 1/7 gece kuralı. */
export const YUKSEK_ENLEM_ESIGI = 48;

export function yuksekEnlemMi(enlem: number | undefined): boolean {
  return typeof enlem === 'number' && Math.abs(enlem) > YUKSEK_ENLEM_ESIGI;
}

/**
 * Ayardan adhan parametresi kurar. Her çağrı YENİ nesne döndürür.
 * Diyanet + ince ayar yoksa `turkiyeHesapParametreleri()` döner (bayt bayt aynı).
 */
export function hesapParametreleriOlustur(ayar: HesapAyari, baglam: HesapBaglami = {}): CalculationParameters {
  if (diyanetDokunulmamisMi(ayar)) return turkiyeHesapParametreleri();
  const profil = HESAP_PROFILLERI[ayar.profil] ?? HESAP_PROFILLERI.diyanet;
  const p = profil.parametre();
  const ikindi = ayar.ikindi ?? profil.ikindi;
  if (ikindi === 'sani') p.madhab = Madhab.Hanafi;
  if (ayar.aci?.fecr !== undefined) p.fajrAngle = ayar.aci.fecr;
  if (ayar.aci?.yatsi !== undefined) {
    p.ishaAngle = ayar.aci.yatsi;
    p.ishaInterval = 0;
  }
  if (profil.kimlik !== 'diyanet' && yuksekEnlemMi(baglam.enlem)) {
    p.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  }
  if (profil.ramazanYatsiEkDk && baglam.tarih && p.ishaInterval > 0 && ummulKuraRamazanMi(baglam.tarih)) {
    p.ishaInterval += profil.ramazanYatsiEkDk;
  }
  const o = ayar.ofsetler;
  if (o) {
    p.adjustments = {
      fajr: o.imsak ?? 0,
      sunrise: o.gunes ?? 0,
      dhuhr: o.ogle ?? 0,
      asr: o.ikindi ?? 0,
      maghrib: o.aksam ?? 0,
      isha: o.yatsi ?? 0,
    };
  }
  return p;
}
