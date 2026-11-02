import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR bg (narrow): "ч", "мин", "с". Eril "час" sayıdan sonra bröyna biçim alır ("5 часа"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ч', dk: 'мин', sn: 'с' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} час', other: '{n} часа' }),
  dakika: cogul({ one: '{n} минута', other: '{n} минути' }),
  saniye: cogul({ one: '{n} секунда', other: '{n} секунди' }),
};
