import type { Sozluk } from '../tr';

/** Standart Almanca gün/ay adları ve kısaltmaları; uzun tarih "24. Oktober 2026". */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  gunlerKisa: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
  aylar: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  aylarKisa: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
  haftaHarfleri: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  uzun: '{gun}. {ay} {yil}',
};
