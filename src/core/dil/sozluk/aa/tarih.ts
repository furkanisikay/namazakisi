import type { Sozluk } from '../tr';

/**
 * Gün ve ay adları glibc `aa_ET` LC_TIME'dan (day/abday/mon/abmon): Afar CLDR'de yok, `Intl`
 * İngilizceye düşer. Hafta harfleri Pazartesi başlar (Etleeni).
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Acaada', 'Etleeni', 'Talaata', 'Arbaqa', 'Kamiisi', 'Gumqata', 'Sabti'],
  gunlerKisa: ['Aca', 'Etl', 'Tal', 'Arb', 'Kam', 'Gum', 'Sab'],
  aylar: ['Qunxa Garablu', 'Naharsi Kudo', 'Ciggilta Kudo', 'Agda Baxis', 'Caxah Alsa', 'Qasa Dirri', 'Qado Dirri', 'Liiqen', 'Waysu', 'Diteli', 'Ximoli', 'Kaxxa Garablu'],
  aylarYalin: ['Qunxa Garablu', 'Naharsi Kudo', 'Ciggilta Kudo', 'Agda Baxis', 'Caxah Alsa', 'Qasa Dirri', 'Qado Dirri', 'Liiqen', 'Waysu', 'Diteli', 'Ximoli', 'Kaxxa Garablu'],
  aylarKisa: ['Qun', 'Nah', 'Cig', 'Agd', 'Cax', 'Qas', 'Qad', 'Leq', 'Way', 'Dit', 'Xim', 'Kax'],
  haftaHarfleri: ['Et', 'Ta', 'Ar', 'Ka', 'Gu', 'Sa', 'Ac'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
