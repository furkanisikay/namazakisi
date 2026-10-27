import type { Sozluk } from '../tr';

/** Bosna standardı: gün ve ay adları küçük harf; uzun tarih "24. oktobar 2026.". */
export const tarih: Sozluk['tarih'] = {
  gunler: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  gunlerKisa: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
  aylar: ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'],
  aylarYalin: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  aylarKisa: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  haftaHarfleri: ['Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su', 'Ne'],
  uzun: '{gun}. {ay} {yil}.',
};
