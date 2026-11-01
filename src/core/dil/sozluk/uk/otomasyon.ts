import type { Sozluk } from '../tr';

/** Anahtar kelime başlıkta geçmeli ("Зугр — настав час"); Türkçe değer ayrıca sabittir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'настав час',
  vakitGirdiBasligi: '{ad} — настав час',
  herhangiVakit: 'Коли настає час будь-якої молитви',
  yalnizVakit: 'Лише коли настає час молитви {ad}',
  camide: 'Коли визначено, що ви в мечеті (з увімкненою функцією «Я в мечеті»)',
};
