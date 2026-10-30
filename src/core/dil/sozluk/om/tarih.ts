import type { Sozluk } from '../tr';

/** Ay ve gün adları CLDR `om` (kısaltmalar elle düzeltildi); sıra CLDR gibi ay-gün-yıl. */
export const tarih: Sozluk['tarih'] = {
  gunler: ['Dilbata', 'Wiixata', 'Kibxata', 'Roobii', 'Kamisa', 'Jimaata', 'Sanbata'],
  gunlerKisa: ['Dil', 'Wix', 'Kib', 'Rob', 'Kam', 'Jim', 'San'],
  aylar: ['Amajjii', 'Guraandhala', 'Bitootessa', 'Eebila', 'Caamsaa', 'Waxabajjii', 'Adoolessa', 'Hagayya', 'Fulbaana', 'Onkoloolessa', 'Sadaasa', 'Muddee'],
  aylarYalin: ['Amajjii', 'Guraandhala', 'Bitootessa', 'Eebila', 'Caamsaa', 'Waxabajjii', 'Adoolessa', 'Hagayya', 'Fulbaana', 'Onkoloolessa', 'Sadaasa', 'Muddee'],
  aylarKisa: ['Ama', 'Gur', 'Bit', 'Eeb', 'Caa', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
  haftaHarfleri: ['Wi', 'Ki', 'Ro', 'Ka', 'Ji', 'Sa', 'Di'],
  uzun: '{ay} {gun}, {yil}',
};
