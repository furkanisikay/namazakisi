import type { Sozluk } from '../tr';

/**
 * Gün ve ay adları CLDR sd'den (Node ICU 77): Pazar آچر, Çarşamba اربع. Sindhçede ay adı
 * çekimsizdir (`aylar` = `aylarYalin`) ve yerleşik kısaltma yoktur: kısa biçimler tam addır.
 * Uzun tarih doğal sırayla "2 نومبر 2026" (CLDR'nin "2026 نومبر 2" sırası seçilmedi).
 * Haftalık panel harfleri adın ilk iki harfi (Pazartesi = سو).
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'],
  gunlerKisa: ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'],
  aylar: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  aylarYalin: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  aylarKisa: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  haftaHarfleri: ['سو', 'اڱ', 'ار', 'خم', 'جم', 'ڇن', 'آچ'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}، {yil}',
};
