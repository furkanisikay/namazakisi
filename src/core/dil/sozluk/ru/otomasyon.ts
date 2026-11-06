import type { Sozluk } from '../tr';

/** Anahtar kelime başlıkta geçmeli ("Зухр — время наступило"); Türkçe değer ayrıca sabittir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'время наступило',
  vakitGirdiBasligi: '{ad} — время наступило',
  herhangiVakit: 'Когда наступает время любого намаза',
  yalnizVakit: 'Только когда наступает время намаза {ad}',
  camide: 'Когда определено, что вы в мечети (при включённой функции «Я в мечети»)',
};
