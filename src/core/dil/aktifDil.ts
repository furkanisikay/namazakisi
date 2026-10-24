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

export function aktifDil(): DilKodu {
  return aktif;
}

/** Etkin dili kurar; değiştiyse `true`. Geçersiz kod varsayılana düşer. */
export function aktifDiliKur(kod: unknown): boolean {
  const yeni = dilKoduMu(kod) ? kod : VARSAYILAN_DIL;
  if (yeni === aktif) return false;
  aktif = yeni;
  return true;
}

export function aktifDilSifirla(): void {
  aktif = VARSAYILAN_DIL;
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
