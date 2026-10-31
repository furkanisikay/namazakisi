import type { Sozluk } from '../tr';

/**
 * Miladi aylar Mısır/Körfez biçimiyle (يناير…; Levant/Irak كانون… biçimi seçilmedi).
 * Arapçada yerleşik gün/ay kısaltması yoktur → kısa biçimler tam addır (yalnız dizi uzunluğu bağlayıcı).
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  gunlerKisa: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  aylar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  aylarYalin: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  aylarKisa: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  haftaHarfleri: ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}، {yil}',
};
