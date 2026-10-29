/**
 * Hazır sesli okuma şablonlarının DİLLER ARASI tablosu — SAF.
 *
 * Kullanıcı bir hazır şablonu seçince metin ayar kaydına YAZILIR (Türkçe kayıtlar birebir
 * korunur). Dil değişince bu metin yeni dilde okunmalı: çözüm anında metin herhangi bir dilin
 * aynı listesindeki bir şablonsa ETKİN dilin aynı sıradaki şablonuna çevrilir. Kullanıcının
 * kendi yazdığı metin (tabloda yok) olduğu gibi kalır (sahip kararı: dil değişince bir kez sorulur).
 */
import { aktifDil, sozluk, yaziliSozluk } from '../dil/aktifDil';
import { DILLER, type DilKodu } from '../dil/diller';
import { YAZI_SECENEKLERI } from '../dil/yazi';
import type { Sozluk } from '../dil/sozluk/tr';

export type SablonListesi = keyof Sozluk['anons']['sablon'];

/** Etkin (ya da verilen) dilin hazır şablonları. */
export function sablonlar(liste: SablonListesi, dil: DilKodu = aktifDil()): readonly string[] {
  return sozluk(dil).anons.sablon[liste];
}

/** Dilin şablon tabloları: iki alfabeli dilde (Özbekçe, Kazakça) HER alfabedeki biçim (yazılırken seçili olan kalır). */
const dilinSablonlari = (kod: DilKodu): Sozluk['anons']['sablon'][] => {
  const yazilar = YAZI_SECENEKLERI[kod];
  return yazilar ? yazilar.map((y) => yaziliSozluk(kod, y).anons.sablon) : [sozluk(kod).anons.sablon];
};

/** Metin bir dilin hazır şablonu mu? Öyleyse liste ve sıra; değilse `null`. */
export function sablonKonumu(metin: string): { liste: SablonListesi; sira: number } | null {
  for (const d of DILLER) {
    for (const s of dilinSablonlari(d.kod)) {
      for (const liste of Object.keys(s) as SablonListesi[]) {
        const sira = s[liste].indexOf(metin);
        if (sira >= 0) return { liste, sira };
      }
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
