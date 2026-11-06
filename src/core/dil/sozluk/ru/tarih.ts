import type { Sozluk } from '../tr';

/**
 * Ay adları İLGİ hâlinde (родительный падеж: "24 октября 2026 г."): tarih kalıplarının çoğu
 * gün + ay biçimindedir. Tek başına ay adı (takvim başlığı "Октябрь 2026") için sözlükte ayrı
 * yalın hâl anahtarı yok; o yüzeyler şimdilik ilgi hâlini gösterir.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  gunlerKisa: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  aylar: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  aylarYalin: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  aylarKisa: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  haftaHarfleri: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  uzun: '{gun} {ay} {yil} г.',
  gunAdiYil: '{gunAdi}, {yil}',
};
