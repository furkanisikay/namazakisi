import type { Sozluk } from '../tr';

/** Bildirim başlığı ve rutin anahtar kelimesi; `vakitGirdiEki` başlığın içinde geçmelidir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'наступило је време',
  vakitGirdiBasligi: '{ad}: наступило је време',
  herhangiVakit: 'Када наступи било које време намаза',
  yalnizVakit: 'Само када наступи време: {ad}',
  camide: 'Када се открије да сте у џамији (док је „У џамији” укључено)',
};
