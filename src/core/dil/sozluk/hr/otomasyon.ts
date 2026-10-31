import type { Sozluk } from '../tr';

/** Bildirim başlığı ve rutin anahtar kelimesi; `vakitGirdiEki` başlığın sonunda geçer. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'nastupilo je vrijeme',
  vakitGirdiBasligi: '{ad}: nastupilo je vrijeme',
  herhangiVakit: 'Kad nastupi vrijeme bilo kojeg namaza',
  yalnizVakit: 'Samo kad nastupi vrijeme: {ad}',
  camide: 'Kad se prepozna da ste u džamiji (dok je uključeno „U džamiji“)',
};
