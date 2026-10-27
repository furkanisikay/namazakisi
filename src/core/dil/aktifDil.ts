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
import { dilRakamVarsayilani, type RakamSistemi } from './rakam';
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
import { tr, type Sozluk } from './sozluk/tr';

const SOZLUKLER: Readonly<Record<DilKodu, Sozluk>> = { tr, en, id, de, fr, bs, ru, ms, ar, ur, es, nl, sq, hi, bn };

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
  onbellek = null;
  bildir();
  return true;
}

export function aktifDilSifirla(): void {
  const rakam = dilRakamVarsayilani(VARSAYILAN_DIL);
  if (aktif === VARSAYILAN_DIL && aktifTakim === null && aktifRakam === rakam) return;
  aktif = VARSAYILAN_DIL;
  aktifTakim = null;
  aktifRakam = rakam;
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

/** Etkin dilin rakam sistemini kurar; değiştiyse `true` (dinleyicilere haber verilir). */
export function rakamSisteminiKur(sistem: RakamSistemi): boolean {
  if (sistem === aktifRakam) return false;
  aktifRakam = sistem;
  bildir();
  return true;
}

export function aktifRakamSistemi(): RakamSistemi {
  return aktifRakam;
}

/**
 * Bir dilin sözlüğü. Etkin dil için takım uygulanmış (önbellekteki) sözlük döner; başka dil
 * için ham sözlük (önizleme, test).
 */
export function sozluk(kod: DilKodu = aktif): Sozluk {
  return kod === aktif ? metin() : SOZLUKLER[kod];
}

/** Bir dilin takım UYGULANMAMIŞ sözlüğü (vakit adı seçicisinin "temel takım" örneği). */
export function hamSozluk(kod: DilKodu): Sozluk {
  return SOZLUKLER[kod];
}

/** Etkin dilin sözlüğü (headless, servisler ve `useMetin`). Referansı yalnız dil/takım değişince değişir. */
export function metin(): Sozluk {
  if (!onbellek) {
    const temel = SOZLUKLER[aktif];
    onbellek = aktifTakim ? { ...temel, vakit: { ...temel.vakit, ...aktifTakim.adlar } } : temel;
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

// Fransızca binlik ayırıcı dar bölünmez boşluk (U+202F), Rusça ve Arnavutça bölünmez boşluk (U+00A0) — CLDR.
// Hintçe ve Bengalcede CLDR Hint gruplaması (1,23,456) yerine üçlü gruplama bilinçli (tek kural).
const BINLIK: Readonly<Record<DilKodu, string>> = { tr: '.', en: ',', id: '.', de: '.', fr: '\u202f', bs: '.', ru: '\u00a0', ms: ',', ar: ',', ur: ',', es: '.', nl: '.', sq: '\u00a0', hi: ',', bn: ',' };
const ONDALIK: Readonly<Record<DilKodu, string>> = { tr: ',', en: '.', id: ',', de: ',', fr: ',', bs: ',', ru: ',', ms: '.', ar: '.', ur: '.', es: ',', nl: ',', sq: ',', hi: '.', bn: '.' };

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
