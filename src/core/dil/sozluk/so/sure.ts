import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 's', dk: 'daq', sn: 'ilb' },
  saat: cogul({ one: '{n} saac', other: '{n} saacadood' }),
  dakika: cogul({ one: '{n} daqiiqo', other: '{n} daqiiqo' }),
  saniye: cogul({ one: '{n} ilbiriqsi', other: '{n} ilbiriqsi' }),
};
