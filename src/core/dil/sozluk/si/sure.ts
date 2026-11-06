import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Sinhala süre birimleri CLDR'dir (පැය, මිනිත්තු, තත්පර; sayıyla biçim değişmez). Kısa biçim CLDR
 * short'tur (පැය, මිනි, තත්). CLDR birimi sayıdan ÖNCE yazar ("මිනි 5"); uygulamanın kalıp
 * sözleşmesi sayı önce olduğu için "5 මිනි" yazılır. one = 0 ve 1 (Hintçe gibi).
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'පැය', dk: 'මිනි', sn: 'තත්' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} පැය', other: '{n} පැය' }),
  dakika: cogul({ one: '{n} මිනිත්තු', other: '{n} මිනිත්තු' }),
  saniye: cogul({ one: '{n} තත්පර', other: '{n} තත්පර' }),
};
