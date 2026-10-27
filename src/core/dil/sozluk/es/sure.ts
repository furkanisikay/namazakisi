// ÇEVİRİ: es — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  saat: cogul({ one: '{n} hour', other: '{n} hours', many: '{n} hours' }),
  dakika: cogul({ one: '{n} minute', other: '{n} minutes', many: '{n} minutes' }),
  saniye: cogul({ one: '{n} second', other: '{n} seconds', many: '{n} seconds' }),
};
