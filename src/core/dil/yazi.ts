/**
 * Yazı sistemi (alfabe) — iki alfabeyle yazılan dillerde Latin (`latn`) ya da Kiril (`cyrl`)
 * seçimi (CLDR yazı adları). `rakam.ts` deseninin ikizi.
 *
 * Sahip kararı 2026-10-27: alfabe ülkeye göre varsayılan, kullanıcı değiştirebilir — Özbekçe
 * Latin varsayılan (Kiril seçilebilir), Kazakça Kiril varsayılan (Latin seçilebilir). QuranEnc
 * mealleri yalnız Kiril.
 *
 * KAYNAK YAZI KİRİL: `sozluk/uz` ve `sozluk/kk` Kiril yazılır, Latin biçim ÇALIŞMA ANINDA bu
 * dosyadaki deterministik harf çevirisiyle (`kirildenLatine`) üretilir. Gerekçe: Kiril → Latin
 * çevirisi Kiril olmayan her şeye (Latin harfli marka ve ürün adları: Namaz Akışı, Google Drive,
 * QuranEnc, JAKIM; `{yer_tutucu}`lar, rakam, noktalama) DOKUNMAZ; ters yön bunları bozardı.
 *
 * Çözüm sırası (`rakamSistemiCoz` deseni): açık seçim → ülke varsayılanı → dil varsayılanı
 * (`YAZI_SECENEKLERI`'nin ilk öğesi). Seçimi olmayan dilde `null` (dilin tek yazısı, dönüşüm yok).
 *
 * Büyük/küçük harf `toUpperCase`/`toLowerCase` İLE YAPILMAZ (AGENTS.md; Hermes ICU, Türkçe/Kazakça
 * noktalı İ): açık tablolar. SAF çekirdek.
 */
import type { DilKodu } from './diller';

export type YaziSistemi = 'latn' | 'cyrl';

/** Alfabe seçimi olan diller ve seçenekleri; İLK öğe dilin varsayılanıdır. */
export const YAZI_SECENEKLERI: Partial<Record<DilKodu, readonly YaziSistemi[]>> = {
  uz: ['latn', 'cyrl'],
  kk: ['cyrl', 'latn'],
};

/** Sözlüğün (ve QuranEnc mealinin) yazıldığı kaynak yazı. */
const KAYNAK_YAZI: YaziSistemi = 'cyrl';

/**
 * Dil başına ülke (ISO 3166-1 alfa-2) → yazı. Şimdilik boş: ülke istisnası doğrulanınca buraya
 * yazılır (ör. Afganistan'daki Özbekler Arap harfi kullanır, Çin'deki Kazaklar da; o yazılar
 * desteklenmediği için eşleme yok).
 */
export const YAZI_ULKE_VARSAYILANLARI: Partial<Record<DilKodu, Readonly<Record<string, YaziSistemi>>>> = {};

export function yaziSistemiMi(x: unknown): x is YaziSistemi {
  return x === 'latn' || x === 'cyrl';
}

/** Dilde alfabe seçimi sunulur mu (Ayarlar > Dil > "Alfabe")? */
export function yaziSecilebilir(dil: DilKodu): boolean {
  return (YAZI_SECENEKLERI[dil]?.length ?? 0) > 1;
}

/** `secim` bu dil için geçerli mi (yalnız dilin seçeneklerinden biri). */
export function yaziSecimiGecerliMi(dil: DilKodu, secim: unknown): secim is YaziSistemi {
  return yaziSistemiMi(secim) && (YAZI_SECENEKLERI[dil]?.includes(secim) ?? false);
}

/** Dilin (ülkeden bağımsız) varsayılan yazısı; seçimi olmayan dilde `null`. */
export function dilYaziVarsayilani(dil: DilKodu): YaziSistemi | null {
  return YAZI_SECENEKLERI[dil]?.[0] ?? null;
}

/** Etkin yazıyı çözer: geçerli açık seçim → ülke varsayılanı → dil varsayılanı. */
export function yaziSistemiCoz(dil: DilKodu, secim: unknown, ulke: string | null): YaziSistemi | null {
  if (!yaziSecilebilir(dil)) return null;
  if (yaziSecimiGecerliMi(dil, secim)) return secim;
  const ulkeninki = ulke ? YAZI_ULKE_VARSAYILANLARI[dil]?.[ulke] : undefined;
  return ulkeninki && yaziSecimiGecerliMi(dil, ulkeninki) ? ulkeninki : dilYaziVarsayilani(dil);
}

/** Bu dil + yazıda metin dönüştürülür mü (kaynak Kiril, istenen Latin)? */
export function yaziDonusumuGerekli(dil: DilKodu, yazi: YaziSistemi | null): boolean {
  return yazi !== null && yazi !== KAYNAK_YAZI && yaziSecilebilir(dil);
}

/** Metni istenen yazıya çevirir; dönüşüm gerekmiyorsa aynen döner. */
export function yaziyaCevir(dil: DilKodu, metin: string, yazi: YaziSistemi | null): string {
  return yaziDonusumuGerekli(dil, yazi) ? kirildenLatine(dil, metin) : metin;
}

/**
 * Sözlük ağacını DERİN çevirir: dize yaprakları çevrilir, dizi ve düz nesne gezilir (çoğul
 * metnin `__cogul: true`'su gibi dize olmayan yapraklar aynen), fonksiyon yaprağın ÇIKTISI çevrilir.
 */
export function derinCevir<T>(deger: T, cevir: (s: string) => string): T {
  if (typeof deger === 'string') return cevir(deger) as T;
  if (Array.isArray(deger)) return deger.map((x: unknown) => derinCevir(x, cevir)) as T;
  if (typeof deger === 'function') {
    const fn = deger as (...a: unknown[]) => unknown;
    return ((...a: unknown[]) => derinCevir(fn(...a), cevir)) as T;
  }
  if (deger && typeof deger === 'object') {
    const cikti: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(deger)) cikti[k] = derinCevir(v, cevir);
    return cikti as T;
  }
  return deger;
}

// ---------------------------------------------------------------------------------------------
// Harf çevirisi
// ---------------------------------------------------------------------------------------------

const KIRIL_BUYUK = 'АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯЎҲ';
const KIRIL_KUCUK = 'аәбвгғдеёжзийкқлмнңоөпрстуұүфхһцчшщъыіьэюяўҳ';
/** Kiril büyük harf → küçük (açık tablo). */
const KIRIL_KUCUGE: Readonly<Record<string, string>> = Object.fromEntries([...KIRIL_BUYUK].map((b, i) => [b, KIRIL_KUCUK[i]]));
const KIRIL_HARFLER = new Set([...KIRIL_KUCUK]);

const LATIN_KUCUK = 'abcdefghjklmnopqrstuvwxyz';
const LATIN_BUYUK = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

/** Özbek Latin (1995) küçük → büyük; ʻ (U+02BB) ve ʼ (U+02BC) harf değildir, aynen kalır. */
const UZ_BUYUGE: Readonly<Record<string, string>> = {
  ...Object.fromEntries([...LATIN_KUCUK].map((k, i) => [k, LATIN_BUYUK[i]])),
  i: 'I',
};
/** Kazak Latin (2021) küçük → büyük: i → İ (и, й), ı → I (і). */
const KK_BUYUGE: Readonly<Record<string, string>> = {
  ...Object.fromEntries([...LATIN_KUCUK].map((k, i) => [k, LATIN_BUYUK[i]])),
  i: 'İ',
  ı: 'I',
  ä: 'Ä',
  ğ: 'Ğ',
  ñ: 'Ñ',
  ş: 'Ş',
  ū: 'Ū',
  ü: 'Ü',
  ö: 'Ö',
};

const UZ_UNLULER = new Set([...'аеёиоуўэюяы']);

/** Özbekçe (1995 resmî Latin, ʻ = U+02BB, ʼ = U+02BC). Bağlama bağlı е ve ц `uzHarf`'te. */
const UZ: Readonly<Record<string, string>> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'gʻ', д: 'd', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', қ: 'q',
  л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ў: 'oʻ', ф: 'f', х: 'x', ҳ: 'h',
  ч: 'ch', ш: 'sh', щ: 'sh', ъ: 'ʼ', ь: '', э: 'e', ю: 'yu', я: 'ya', ы: 'i',
};

/** Kazakça (2021 Latin). */
const KK: Readonly<Record<string, string>> = {
  а: 'a', ә: 'ä', б: 'b', в: 'v', г: 'g', ғ: 'ğ', д: 'd', е: 'e', ё: 'io', ж: 'j', з: 'z', и: 'i', й: 'i',
  к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', ң: 'ñ', о: 'o', ө: 'ö', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ұ: 'ū', ү: 'ü', ф: 'f', х: 'h', һ: 'h', ц: 'ts', ч: 'ch', ш: 'ş', щ: 'şş', ъ: '', ы: 'y', і: 'ı', ь: '',
  э: 'e', ю: 'iu', я: 'ia',
};

const kucukKiril = (c: string | undefined): string | undefined => (c === undefined ? undefined : (KIRIL_KUCUGE[c] ?? c));
const kirilHarfMi = (c: string | undefined): boolean => c !== undefined && KIRIL_HARFLER.has(kucukKiril(c) as string);
const buyukKirilMi = (c: string | undefined): boolean => c !== undefined && KIRIL_KUCUGE[c] !== undefined;

/** Özbekçe tek harf: е ve ц bağlama (ÖNCEKİ KAYNAK harfe) bağlıdır; kelime başı = önceki karakter Kiril harf değil. */
function uzHarf(harf: string, onceki: string | undefined): string {
  const kelimeBasi = !kirilHarfMi(onceki);
  const o = kucukKiril(onceki);
  if (harf === 'е') return kelimeBasi || (o !== undefined && (UZ_UNLULER.has(o) || o === 'ъ' || o === 'ь')) ? 'ye' : 'e';
  if (harf === 'ц') return !kelimeBasi && o !== undefined && UZ_UNLULER.has(o) ? 'ts' : 's';
  return UZ[harf] ?? harf;
}

/**
 * Kiril metni dilin Latin alfabesine çevirir (Özbekçe 1995, Kazakça 2021); diğer dillerde metin
 * aynen döner. Kiril olmayan her karakter (Latin, rakam, `{...}`, noktalama) AYNEN kalır. Büyük
 * harf: tek büyük harf → "Sh", komşu harf de büyükse (önce sonraki, yoksa önceki Kiril harfe bakılır)
 * "SH".
 */
/**
 * Özbekçe resmî Latin yazımı harf harf çeviriden ayrılan sözcükler (ay adları "sentabr",
 * "oktabr"; harf çevirisi "sentyabr" verirdi). Kök değişir, ek aynen çevrilir.
 */
const UZ_ISTISNALAR: ReadonlyArray<readonly [RegExp, string]> = [
  [/СЕНТЯБР/g, 'SENTABR'], [/Сентябр/g, 'Sentabr'], [/сентябр/g, 'sentabr'],
  [/ОКТЯБР/g, 'OKTABR'], [/Октябр/g, 'Oktabr'], [/октябр/g, 'oktabr'],
];

export function kirildenLatine(dil: DilKodu, metin: string): string {
  if (dil !== 'uz' && dil !== 'kk') return metin;
  if (dil === 'uz') for (const [desen, latin] of UZ_ISTISNALAR) metin = metin.replace(desen, latin);
  const buyuge = dil === 'uz' ? UZ_BUYUGE : KK_BUYUGE;
  let cikti = '';
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (!kirilHarfMi(c)) {
      cikti += c;
      continue;
    }
    const harf = kucukKiril(c) as string;
    const latin = dil === 'uz' ? uzHarf(harf, metin[i - 1]) : (KK[harf] ?? harf);
    if (!buyukKirilMi(c) || latin === '') {
      cikti += latin;
      continue;
    }
    const sonraki = metin[i + 1];
    const komsuBuyuk = kirilHarfMi(sonraki) ? buyukKirilMi(sonraki) : buyukKirilMi(metin[i - 1]);
    let parca = '';
    for (let j = 0; j < latin.length; j++) {
      const l = latin[j];
      parca += j === 0 || komsuBuyuk ? (buyuge[l] ?? l) : l;
    }
    cikti += parca;
  }
  return cikti;
}
