import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Marathi süre birimleri CLDR mr kısa biçimidir ("1 ता", "5 मिनि", "5 से"); uzun biçim çoğulda
 * "मिनिटे" (CLDR "5 मिनिटे"), saat ve saniye çekimsiz. one = yalnız 1.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ता', dk: 'मिनि', sn: 'से' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} तास', other: '{n} तास' }),
  dakika: cogul({ one: '{n} मिनिट', other: '{n} मिनिटे' }),
  saniye: cogul({ one: '{n} सेकंद', other: '{n} सेकंद' }),
};
