import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Sindhçede süre birimi kısaltılmaz (CLDR sd kısa ve dar biçim de tam sözcük: ڪلاڪ، منٽ، سيڪنڊ). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ڪلاڪ', dk: 'منٽ', sn: 'سيڪنڊ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ڪلاڪ', other: '{n} ڪلاڪ' }),
  dakika: cogul({ one: '{n} منٽ', other: '{n} منٽ' }),
  saniye: cogul({ one: '{n} سيڪنڊ', other: '{n} سيڪنڊ' }),
};
