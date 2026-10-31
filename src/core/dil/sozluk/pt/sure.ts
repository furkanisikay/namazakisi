// ÇEVİRİ: pt — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} hour', many: '{n} hours', other: '{n} hours' }),
  dakika: cogul({ one: '{n} minute', many: '{n} minutes', other: '{n} minutes' }),
  saniye: cogul({ one: '{n} second', many: '{n} seconds', other: '{n} seconds' }),
};
