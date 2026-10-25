import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  saat: cogul({ other: '{n} hours' }),
  dakika: cogul({ other: '{n} minutes' }),
  saniye: cogul({ other: '{n} seconds' }),
};
