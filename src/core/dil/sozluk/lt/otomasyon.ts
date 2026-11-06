import type { Sozluk } from '../tr';

/** Vakit adı çekimsiz, "malda" çekilir ("Dhuhr maldos laikas"); başlık eki içerir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'maldos laikas prasidėjo',
  vakitGirdiBasligi: '{ad} maldos laikas prasidėjo',
  herhangiVakit: 'Kai prasideda bet kurios maldos laikas',
  yalnizVakit: 'Tik kai prasideda {ad} maldos laikas',
  camide: 'Kai nustatoma, kad esate mečetėje (kai įjungta „Esu mečetėje“)',
};
