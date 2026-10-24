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
import { en } from './sozluk/en';
import { tr, type Sozluk } from './sozluk/tr';

const SOZLUKLER: Readonly<Record<DilKodu, Sozluk>> = { tr, en };

let aktif: DilKodu = VARSAYILAN_DIL;
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
  bildir();
  return true;
}

export function aktifDilSifirla(): void {
  if (aktif === VARSAYILAN_DIL) return;
  aktif = VARSAYILAN_DIL;
  bildir();
}

/** Bir dilin sözlüğü (ekran `useMetin`, test ve önizleme için). */
export function sozluk(kod: DilKodu = aktif): Sozluk {
  return SOZLUKLER[kod];
}

/** Etkin dilin sözlüğü (headless ve servisler için). */
export function metin(): Sozluk {
  return SOZLUKLER[aktif];
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

const BINLIK: Readonly<Record<DilKodu, string>> = { tr: '.', en: ',' };
const ONDALIK: Readonly<Record<DilKodu, string>> = { tr: ',', en: '.' };

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
