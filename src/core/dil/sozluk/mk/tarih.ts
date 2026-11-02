// `aylar` tarih içi biçim, `aylarYalin` takvim başlığı; Makedoncada ay adı çekimsiz ve küçük harfli (CLDR "2 ноември 2026 г.").
import type { Sozluk } from '../tr';

/**
 * Makedonca gün ve ay adları CLDR mk'den, küçük harf. Uzun tarih CLDR'ye uyar ("2 ноември 2026 г.");
 * ay adı tarih içinde de yalın olduğu için `aylar` = `aylarYalin`. Kısa adlar CLDR kısaltmaları
 * (sondaki nokta atıldı: takvim yaprağı dar).
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['недела', 'понеделник', 'вторник', 'среда', 'четврток', 'петок', 'сабота'],
  gunlerKisa: ['нед', 'пон', 'вто', 'сре', 'чет', 'пет', 'саб'],
  aylar: ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'],
  aylarYalin: ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'],
  aylarKisa: ['јан', 'фев', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'ное', 'дек'],
  haftaHarfleri: ['По', 'Вт', 'Ср', 'Че', 'Пе', 'Са', 'Не'],
  uzun: '{gun} {ay} {yil} г.',
  gunAdiYil: '{gunAdi}, {yil}',
};
