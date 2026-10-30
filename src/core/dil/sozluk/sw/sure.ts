import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'saa', dk: 'dk', sn: 's' },
  saat: cogul({ one: 'saa {n}', other: 'saa {n}' }),
  dakika: cogul({ one: 'dakika {n}', other: 'dakika {n}' }),
  saniye: cogul({ one: 'sekunde {n}', other: 'sekunde {n}' }),
};
