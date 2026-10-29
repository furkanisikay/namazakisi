import type { Sozluk } from '../tr';

/**
 * Miladi ay adları İran yazımıyla (ژانویه، فوریه…); Şemsî ay adları yazılmaz (takvim miladidir).
 * Farsçada ay adı çekimsizdir (`aylar` = `aylarYalin`) ve yerleşik kısaltması yoktur: kısa
 * biçimler tam addır (CLDR fa). Haftalık panel harfleri CLDR dar biçimi (Pazartesi = د).
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  gunlerKisa: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  aylar: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  aylarYalin: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  aylarKisa: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  haftaHarfleri: ['د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی'],
  uzun: '{gun} {ay} {yil}',
};
