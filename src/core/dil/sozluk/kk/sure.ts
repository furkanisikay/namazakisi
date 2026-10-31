import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kazakçada sayıdan sonra isim çoğul eki almaz ("5 минут"): one ve other aynı. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'сағ', dk: 'мин', sn: 'с' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} сағат', other: '{n} сағат' }),
  dakika: cogul({ one: '{n} минут', other: '{n} минут' }),
  saniye: cogul({ one: '{n} секунд', other: '{n} секунд' }),
};
