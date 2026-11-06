import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  /** Kısa birimler CLDR sr-Cyrl'den (ч, мин, с). */
  kisa: { sa: 'ч', dk: 'мин', sn: 'с' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} сат', few: '{n} сата', other: '{n} сати' }),
  dakika: cogul({ one: '{n} минут', few: '{n} минута', other: '{n} минута' }),
  saniye: cogul({ one: '{n} секунда', few: '{n} секунде', other: '{n} секунди' }),
};
