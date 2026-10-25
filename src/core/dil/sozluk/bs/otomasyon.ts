import type { Sozluk } from '../tr';

/** Bildirim başlığı ve rutin anahtar kelimesi; `vakitGirdiEki` başlığın içinde geçmelidir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'nastupilo je vrijeme',
  vakitGirdiBasligi: '{ad}: nastupilo je vrijeme',
  herhangiVakit: 'Kada nastupi bilo koje namasko vrijeme',
  yalnizVakit: 'Samo kada nastupi vrijeme: {ad}',
  camide: 'Kada se otkrije da ste u džamiji (dok je „U džamiji” uključeno)',
};
