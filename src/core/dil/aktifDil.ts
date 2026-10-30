/**
 * Etkin dil — süreç (JS bağlamı) düzeyinde TEK durum (`aktifHesap` deseni).
 *
 * Bildirim içerikleri, sesli okuma ve headless görevler React'e erişemez; metni buradan
 * alır. Giriş noktaları vakit/metin üretmeden önce `DilServisi.hazir()`'ı bekler.
 * Ekranlar `useMetin()` ile okur (dil slice'ı değişince yeniden çizilir).
 *
 * SAF çekirdek: React/expo import ETMEZ.
 */
import { bicimle } from './bicim';
import { cogulSec } from './cogul';
import { dilKoduMu, VARSAYILAN_DIL, type DilKodu } from './diller';
import type { CogulMetin } from './tipler';
import type { VakitAdiTakimi } from './vakitTakimlari';
import { dilRakamVarsayilani, rakamSecimiGecerliMi, type RakamSistemi } from './rakam';
import { derinCevir, dilYaziVarsayilani, yaziDonusumuGerekli, yaziSecimiGecerliMi, yaziyaCevir as yaziCevirisi, type YaziSistemi } from './yazi';
import { en } from './sozluk/en';
import { id } from './sozluk/id';
import { de } from './sozluk/de';
import { fr } from './sozluk/fr';
import { bs } from './sozluk/bs';
import { ru } from './sozluk/ru';
import { ms } from './sozluk/ms';
import { ar } from './sozluk/ar';
import { ur } from './sozluk/ur';
import { es } from './sozluk/es';
import { nl } from './sozluk/nl';
import { sq } from './sozluk/sq';
import { hi } from './sozluk/hi';
import { bn } from './sozluk/bn';
import { fa } from './sozluk/fa';
import { ps } from './sozluk/ps';
import { ckb } from './sozluk/ckb';
import { ug } from './sozluk/ug';
import { az } from './sozluk/az';
import { uz } from './sozluk/uz';
import { kk } from './sozluk/kk';
import { ky } from './sozluk/ky';
import { tg } from './sozluk/tg';
import { sw } from './sozluk/sw';
import { ha } from './sozluk/ha';
import { am } from './sozluk/am';
import { om } from './sozluk/om';
import { so } from './sozluk/so';
import { ff } from './sozluk/ff';
import { yo } from './sozluk/yo';
import { tr, type Sozluk } from './sozluk/tr';

const SOZLUKLER: Readonly<Record<DilKodu, Sozluk>> = { tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn, fa, ps, ckb, ug, az, uz, kk, ky, tg, sw, ha, am, om, so, ff, yo };

let aktif: DilKodu = VARSAYILAN_DIL;
/** Etkin dilin vakit adı takımı (`null` = sözlüğün kendi adları). Dil değişince sıfırlanır. */
let aktifTakim: VakitAdiTakimi | null = null;
/**
 * Etkin dilin rakam sistemi (`core/dil/rakam`). Dil değişince dilin varsayılanına döner;
 * `DilServisi` açık seçimi ve ülkeyi okuyup yeniden çözer. Sözlüğü DEĞİŞTİRMEZ (dönüşüm
 * çizim katmanında): `metin()` önbelleği bozulmaz.
 */
let aktifRakam: RakamSistemi = dilRakamVarsayilani(VARSAYILAN_DIL);
/**
 * Etkin dilin yazısı (alfabe, `core/dil/yazi`; `null` = dilin tek yazısı). Rakamdan FARKLI olarak
 * sözlüğü DEĞİŞTİRİR (Kiril kaynak → Latin harf çevirisi): değişince `metin()` önbelleği yenilenir.
 * Dil değişince dilin varsayılanına döner; `DilServisi` açık seçimi ve ülkeyi okuyup yeniden çözer.
 */
let aktifYazi: YaziSistemi | null = dilYaziVarsayilani(VARSAYILAN_DIL);
/**
 * Etkin dilin takım uygulanmış sözlüğü. ÖNBELLEK zorunlu: `useMetin` bunu
 * `useSyncExternalStore` anlık görüntüsü olarak döndürür; her çağrıda yeni nesne React'i
 * sonsuz döngüye sokar. Yalnız dil ya da takım değişince yenilenir.
 */
let onbellek: Sozluk | null = null;
const dinleyiciler = new Set<() => void>();

/** Etkin dil değişince haber al (ekranların `useMetin` aboneliği). Aboneliği bırakan fonksiyon döner. */
export function dilDegisiminiDinle(fn: () => void): () => void {
  dinleyiciler.add(fn);
  return () => {
    dinleyiciler.delete(fn);
  };
}

function bildir(): void {
  for (const fn of [...dinleyiciler]) fn();
}

export function aktifDil(): DilKodu {
  return aktif;
}

/** Etkin dili kurar; değiştiyse `true`. Geçersiz kod varsayılana düşer. */
export function aktifDiliKur(kod: unknown): boolean {
  const yeni = dilKoduMu(kod) ? kod : VARSAYILAN_DIL;
  if (yeni === aktif) return false;
  aktif = yeni;
  aktifTakim = null;
  aktifRakam = dilRakamVarsayilani(yeni);
  aktifYazi = dilYaziVarsayilani(yeni);
  onbellek = null;
  bildir();
  return true;
}

export function aktifDilSifirla(): void {
  const rakam = dilRakamVarsayilani(VARSAYILAN_DIL);
  const yazi = dilYaziVarsayilani(VARSAYILAN_DIL);
  if (aktif === VARSAYILAN_DIL && aktifTakim === null && aktifRakam === rakam && aktifYazi === yazi) return;
  aktif = VARSAYILAN_DIL;
  aktifTakim = null;
  aktifRakam = rakam;
  aktifYazi = yazi;
  onbellek = null;
  bildir();
}

/** Etkin dilin vakit adı takımını kurar (`null` = sözlüğün adları); değiştiyse `true`. */
export function vakitTakiminiKur(takim: VakitAdiTakimi | null): boolean {
  if ((takim?.id ?? null) === (aktifTakim?.id ?? null)) return false;
  aktifTakim = takim;
  onbellek = null;
  bildir();
  return true;
}

export function aktifVakitTakimi(): VakitAdiTakimi | null {
  return aktifTakim;
}

/**
 * Etkin dilin rakam sistemini kurar; değiştiyse `true` (dinleyicilere haber verilir). Etkin
 * dilde geçersiz sistem (Bengalcede `arab`, Türkçede yerel rakam) dilin varsayılanına düşer:
 * `aktifRakamSistemi()` her zaman etkin dilin `latn`'ı ya da KENDİ yerel rakamıdır.
 */
export function rakamSisteminiKur(sistem: RakamSistemi): boolean {
  const gecerli = rakamSecimiGecerliMi(aktif, sistem) ? sistem : dilRakamVarsayilani(aktif);
  if (gecerli === aktifRakam) return false;
  aktifRakam = gecerli;
  bildir();
  return true;
}

export function aktifRakamSistemi(): RakamSistemi {
  return aktifRakam;
}

/**
 * Etkin dilin yazısını (alfabe) kurar; değiştiyse `true` (önbellek yenilenir, dinleyicilere haber
 * verilir). Etkin dilde geçersiz yazı (Türkçede `cyrl`, Kazakçada bilinmeyen değer) dilin
 * varsayılanına düşer; seçimi olmayan dilde her zaman `null`.
 */
export function yaziSisteminiKur(yazi: YaziSistemi | null): boolean {
  const gecerli = yaziSecimiGecerliMi(aktif, yazi) ? yazi : dilYaziVarsayilani(aktif);
  if (gecerli === aktifYazi) return false;
  aktifYazi = gecerli;
  onbellek = null;
  bildir();
  return true;
}

export function aktifYaziSistemi(): YaziSistemi | null {
  return aktifYazi;
}

/** Dilin GÖSTERİLEN yazısı: etkin dilde kurulmuş seçim, diğer dilde dilin varsayılanı. */
const gosterilenYazi = (kod: DilKodu): YaziSistemi | null => (kod === aktif ? aktifYazi : dilYaziVarsayilani(kod));

/**
 * Metni dilin gösterilen yazısına çevirir (Kiril kaynak → Latin). Sözlük dışından gelen Kiril
 * metin içindir: QuranEnc meali (`ayetMeali`, `gununAyetiGorunumu`). Kiril olmayan metin aynen döner.
 */
export function yaziyaCevir(metinDegeri: string, kod: DilKodu = aktif): string {
  return yaziCevirisi(kod, metinDegeri, gosterilenYazi(kod));
}

/** Yazısı uygulanmış sözlükler (dil:yazı başına bir kez çevrilir; sözlük değişmez). */
const yaziliSozlukler = new Map<string, Sozluk>();

/**
 * Dilin verilen yazıdaki (takım UYGULANMAMIŞ) sözlüğü. Yazıdan bağımsız tanıma için: kayda yazılmış
 * hazır şablon, yazılırken seçili olan alfabede kalır (`anonsSablonlari.sablonKonumu`).
 */
export function yaziliSozluk(kod: DilKodu, yazi: YaziSistemi | null): Sozluk {
  if (!yaziDonusumuGerekli(kod, yazi)) return SOZLUKLER[kod];
  const anahtar = `${kod}:${yazi}`;
  let s = yaziliSozlukler.get(anahtar);
  if (!s) {
    s = derinCevir(SOZLUKLER[kod], (t) => yaziCevirisi(kod, t, yazi));
    yaziliSozlukler.set(anahtar, s);
  }
  return s;
}

/**
 * Bir dilin sözlüğü. Etkin dil için takım uygulanmış (önbellekteki) sözlük döner; başka dil
 * için ham sözlük (önizleme, test).
 */
export function sozluk(kod: DilKodu = aktif): Sozluk {
  return kod === aktif ? metin() : yaziliSozluk(kod, dilYaziVarsayilani(kod));
}

/** Bir dilin takım UYGULANMAMIŞ sözlüğü (vakit adı seçicisinin "temel takım" örneği); yazısı gösterilen yazıdır. */
export function hamSozluk(kod: DilKodu): Sozluk {
  return yaziliSozluk(kod, gosterilenYazi(kod));
}

/** Etkin dilin sözlüğü (headless, servisler ve `useMetin`). Referansı yalnız dil/takım/yazı değişince değişir. */
export function metin(): Sozluk {
  if (!onbellek) {
    const temel = yaziliSozluk(aktif, aktifYazi);
    const adlar = aktifTakim ? derinCevir(aktifTakim.adlar, (t) => yaziCevirisi(aktif, t, aktifYazi)) : null;
    onbellek = adlar ? { ...temel, vakit: { ...temel.vakit, ...adlar } } : temel;
  }
  return onbellek;
}

/** Yer tutuculu metni doldurur: `bicim(m.kurulum.ileDevam, { ad })`. */
export function bicim(sablon: string, degerler?: Readonly<Record<string, string | number>>): string {
  return bicimle(sablon, degerler);
}

/** Sayıya göre çoğul biçim + `{n}` ve diğer yer tutucular. */
export function sayili(
  sablon: CogulMetin,
  n: number,
  degerler: Readonly<Record<string, string | number>> = {},
  kod: DilKodu = aktif,
): string {
  return bicimle(cogulSec(kod, sablon, n), { n, ...degerler });
}

// Fransızca binlik ayırıcı dar bölünmez boşluk (U+202F), Rusça, Arnavutça ve Orta Asya dilleri (uz, kk, ky, tg) ve Fula (ff) bölünmez boşluk (U+00A0) — CLDR; Afrika dalgasının geri kalanı (sw, ha, am, om, so, yo) İngilizce biçimi.
// Hintçe ve Bengalcede CLDR Hint gruplaması (1,23,456) yerine üçlü gruplama bilinçli (tek kural).
// Farsça, Peştuca ve Soranîde rakam çizimde yerelleşir, ayırıcı Latin kalır (Arapça gibi): ٬ ٫ biçimine en
// yakın ',' '.' — Peştucanın Batı rakamlı CLDR biçimi ('.' ',') bilinçli izlenmez (varsayılanı Fars rakamı).
const BINLIK: Readonly<Record<DilKodu, string>> = { tr: '.', en: ',', id: '.', de: '.', fr: '\u202f', bs: '.', ru: '\u00a0', ms: ',', ar: ',', ur: ',', es: '.', nl: '.', sq: '\u00a0', hi: ',', bn: ',', fa: ',', ps: ',', ckb: ',', ug: ',', az: '.', uz: '\u00a0', kk: '\u00a0', ky: '\u00a0', tg: '\u00a0', sw: ',', ha: ',', am: ',', om: ',', so: ',', ff: '\u00a0', yo: ',' };
const ONDALIK: Readonly<Record<DilKodu, string>> = { tr: ',', en: '.', id: ',', de: ',', fr: ',', bs: ',', ru: ',', ms: '.', ar: '.', ur: '.', es: ',', nl: ',', sq: ',', hi: '.', bn: '.', fa: '.', ps: '.', ckb: '.', ug: '.', az: ',', uz: ',', kk: ',', ky: ',', tg: ',', sw: '.', ha: '.', am: '.', om: '.', so: '.', ff: ',', yo: '.' };

/**
 * Sayıyı etkin dilin ayırıcılarıyla yazar ("12.450" / "12,450"). `Intl`'e bağlı değil
 * (Hermes'te `toLocaleString` ICU derlemesine bağlıdır; sonuç cihaza göre değişirdi).
 */
export function sayiYaz(n: number, kod: DilKodu = aktif): string {
  if (!Number.isFinite(n)) return String(n);
  const [tam, kesir] = Math.abs(n).toString().split('.');
  const gruplu = tam.replace(/\B(?=(\d{3})+(?!\d))/g, BINLIK[kod]);
  return `${n < 0 ? '-' : ''}${gruplu}${kesir ? ONDALIK[kod] + kesir : ''}`;
}

/**
 * Sözlüğün bir dalını DEĞİŞMEZ nesne gibi gösteren canlı görünüm: okunduğu an etkin dilin
 * değerini verir. Eski sabit tabloları (`DUZEY_ADLARI[d]`) çağıranları değiştirmeden
 * sözlüğe bağlamak için. Yeni kodda doğrudan `metin()`/`useMetin()` kullanın.
 */
export function canli<T extends object>(sec: (s: Sozluk) => T): Readonly<T> {
  const hedef = () => sec(metin());
  return new Proxy({} as T, {
    get: (_, k) => (hedef() as Record<string | symbol, unknown>)[k],
    has: (_, k) => k in hedef(),
    ownKeys: () => Reflect.ownKeys(hedef()),
    getOwnPropertyDescriptor: (_, k) => {
      const d = Reflect.getOwnPropertyDescriptor(hedef(), k);
      return d ? { ...d, configurable: true } : undefined;
    },
  });
}
