import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ч', dk: 'мин', sn: 'с' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} час', few: '{n} часа', many: '{n} часов', other: '{n} часа' }),
  dakika: cogul({ one: '{n} минута', few: '{n} минуты', many: '{n} минут', other: '{n} минуты' }),
  saniye: cogul({ one: '{n} секунда', few: '{n} секунды', many: '{n} секунд', other: '{n} секунды' }),
};
