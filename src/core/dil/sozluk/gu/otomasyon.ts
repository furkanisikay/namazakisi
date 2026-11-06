import type { Sozluk } from '../tr';

/** Anahtar kelime ({ad}'dan ayrı sözcükle başlar): bildirim başlığı "ઝોહર નમાઝનો સમય થઈ ગયો". */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'નમાઝનો સમય થઈ ગયો',
  vakitGirdiBasligi: '{ad} નમાઝનો સમય થઈ ગયો',
  herhangiVakit: 'કોઈ પણ નમાઝનો સમય થાય ત્યારે',
  yalnizVakit: 'ફક્ત {ad} નમાઝનો સમય થાય ત્યારે',
  camide: 'તમે મસ્જિદમાં છો એવું જણાય ત્યારે ("મસ્જિદમાં છું" ચાલુ હોય ત્યારે)',
};
