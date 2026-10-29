import type { Sozluk } from '../tr';

/**
 * Gün ve ay adları CLDR tg yazımıyla (ь'siz: "январ", "апрел"). Tarih içinde ay adı küçük harf
 * ("29 октябр 2026"); tek başına ay (takvim başlığı) büyük harfle başlar (`aylarYalin`).
 * Haftalık panel harfleri CLDR dar biçimi (Pazartesi = Д).
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'],
  gunlerKisa: ['Яшб', 'Дшб', 'Сшб', 'Чшб', 'Пшб', 'Ҷмъ', 'Шнб'],
  aylar: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
  aylarYalin: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
  aylarKisa: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  haftaHarfleri: ['Д', 'С', 'Ч', 'П', 'Ҷ', 'Ш', 'Я'],
  uzun: '{gun} {ay} {yil}',
};
