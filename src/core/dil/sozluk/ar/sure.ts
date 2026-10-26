import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  saat: cogul({ one: '{n} hour', other: '{n} hours', zero: '{n} hours', two: '{n} hours', few: '{n} hours', many: '{n} hours' }),
  dakika: cogul({ one: '{n} minute', other: '{n} minutes', zero: '{n} minutes', two: '{n} minutes', few: '{n} minutes', many: '{n} minutes' }),
  saniye: cogul({ one: '{n} second', other: '{n} seconds', zero: '{n} seconds', two: '{n} seconds', few: '{n} seconds', many: '{n} seconds' }),
};
