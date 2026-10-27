/**
 * Hazır sesli okuma şablonlarının DİLLER ARASI tablosu — SAF.
 *
 * Kullanıcı bir hazır şablonu seçince metin ayar kaydına YAZILIR (Türkçe kayıtlar birebir
 * korunur). Dil değişince bu metin yeni dilde okunmalı: çözüm anında metin herhangi bir dilin
 * aynı listesindeki bir şablonsa ETKİN dilin aynı sıradaki şablonuna çevrilir. Kullanıcının
 * kendi yazdığı metin (tabloda yok) olduğu gibi kalır (sahip kararı: dil değişince bir kez sorulur).
 */
import { aktifDil, sozluk } from '../dil/aktifDil';
import { DILLER, type DilKodu } from '../dil/diller';
import type { Sozluk } from '../dil/sozluk/tr';

export type SablonListesi = keyof Sozluk['anons']['sablon'];

/** Etkin (ya da verilen) dilin hazır şablonları. */
export function sablonlar(liste: SablonListesi, dil: DilKodu = aktifDil()): readonly string[] {
  return sozluk(dil).anons.sablon[liste];
}

/** Metin bir dilin hazır şablonu mu? Öyleyse liste ve sıra; değilse `null`. */
export function sablonKonumu(metin: string): { liste: SablonListesi; sira: number } | null {
  for (const d of DILLER) {
    const s = sozluk(d.kod).anons.sablon;
    for (const liste of Object.keys(s) as SablonListesi[]) {
      const sira = s[liste].indexOf(metin);
      if (sira >= 0) return { liste, sira };
    }
  }
  return null;
}

/** Herhangi bir dilin hazır şablonu mu (kullanıcının yazmadığı metin)? */
export const hazirSablonMu = (metin: string): boolean => sablonKonumu(metin) !== null;

/** Hazır şablonu etkin dile çevirir; kullanıcının yazdığı metin aynen döner. */
export function sablonuYerellestir(metin: string, dil: DilKodu = aktifDil()): string {
  const k = sablonKonumu(metin);
  return k ? (sablonlar(k.liste, dil)[k.sira] ?? metin) : metin;
}
