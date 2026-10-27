import type { Sozluk } from '../tr';

/** Anahtar kelime kullanıcı tarafından YAZILIR: kesme işareti yok (klavyede ’ zor). */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'a commencé',
  vakitGirdiBasligi: '{ad} a commencé',
  herhangiVakit: 'Quand une heure de prière commence',
  yalnizVakit: 'Seulement quand {ad} commence',
  camide: 'Quand votre présence à la mosquée est détectée (avec « À la mosquée » activé)',
};
