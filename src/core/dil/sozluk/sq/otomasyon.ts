import type { Sozluk } from '../tr';

/** Fjala kyçe (`vakitGirdiEki`) duhet të gjendet brenda titullit (`vakitGirdiBasligi`). */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'ka hyrë koha',
  vakitGirdiBasligi: '{ad}: ka hyrë koha',
  herhangiVakit: 'Kur hyn koha e çdo namazi',
  yalnizVakit: 'Vetëm kur hyn koha: {ad}',
  camide: 'Kur zbulohet se jeni në xhami (me "Në xhami" aktiv)',
};
