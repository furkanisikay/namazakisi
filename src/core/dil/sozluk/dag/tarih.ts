import type { Sozluk } from '../tr';

/**
 * CLDR'de Dagbani yok. Gün adları Arapça kökenli Dagbani adları (Alizumma QE 62:9, Asibri QE;
 * öteki beşi yerli okuyucuyla DOĞRULANMADI). Miladi ay adları için Dagbani kaynağı bulunamadı;
 * Gana'da Miladi aylar İngilizce adlarıyla anılır, bilinçli olarak İngilizce kalır.
 */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Alahari', 'Atani', 'Atalaata', 'Alaaba', 'Alaamishi', 'Alizumma', 'Asibri'],
  gunlerKisa: ['Ala', 'Ata', 'Atl', 'Alb', 'Alm', 'Alz', 'Asi'],
  aylar: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  aylarYalin: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  aylarKisa: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  haftaHarfleri: ['At', 'Tl', 'Lb', 'Lm', 'Zm', 'Sb', 'Lh'],
  uzun: '{gun} {ay} {yil}',
  gunAdiYil: '{gunAdi}, {yil}',
};
