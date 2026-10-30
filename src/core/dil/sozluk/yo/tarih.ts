import type { Sozluk } from '../tr';

/** Gün ve ay adları CLDR (yo) yazımıyla; tarih sırası "30 Oṣù Ọ̀wàrà 2024". */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Ọjọ́ Àìkú', 'Ọjọ́ Ajé', 'Ọjọ́ Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ọjọ́ Ẹtì', 'Ọjọ́ Àbámẹ́ta'],
  gunlerKisa: ['Àìkú', 'Ajé', 'Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ẹtì', 'Àbámẹ́ta'],
  aylar: ['Oṣù Ṣẹ́rẹ́', 'Oṣù Èrèlè', 'Oṣù Ẹrẹ̀nà', 'Oṣù Ìgbé', 'Oṣù Ẹ̀bibi', 'Oṣù Òkúdu', 'Oṣù Agẹmọ', 'Oṣù Ògún', 'Oṣù Owewe', 'Oṣù Ọ̀wàrà', 'Oṣù Bélú', 'Oṣù Ọ̀pẹ̀'],
  aylarYalin: ['Oṣù Ṣẹ́rẹ́', 'Oṣù Èrèlè', 'Oṣù Ẹrẹ̀nà', 'Oṣù Ìgbé', 'Oṣù Ẹ̀bibi', 'Oṣù Òkúdu', 'Oṣù Agẹmọ', 'Oṣù Ògún', 'Oṣù Owewe', 'Oṣù Ọ̀wàrà', 'Oṣù Bélú', 'Oṣù Ọ̀pẹ̀'],
  aylarKisa: ['Ṣẹ́rẹ́', 'Èrèlè', 'Ẹrẹ̀nà', 'Ìgbé', 'Ẹ̀bibi', 'Òkúdu', 'Agẹmọ', 'Ògún', 'Owewe', 'Ọ̀wàrà', 'Bélú', 'Ọ̀pẹ̀'],
  haftaHarfleri: ['A', 'Ì', 'Ọ', 'Ọ', 'Ẹ', 'À', 'À'],
  uzun: '{gun} {ay} {yil}',
};
