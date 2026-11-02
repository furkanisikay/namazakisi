import type { Sozluk } from '../tr';

/** Anahtar kelime başlıkta geçmeli ("Zuhr — nadszedł czas"); Türkçe değer ayrıca sabittir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'nadszedł czas',
  vakitGirdiBasligi: '{ad} — nadszedł czas',
  herhangiVakit: 'Gdy nadchodzi czas dowolnej modlitwy',
  yalnizVakit: 'Tylko gdy nadchodzi czas modlitwy {ad}',
  camide: 'Gdy wykryto obecność w meczecie (przy włączonej funkcji „W meczecie”)',
};
