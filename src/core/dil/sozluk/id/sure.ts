import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'j', dk: 'mnt', sn: 'dtk' },
  saat: cogul({ other: '{n} jam' }),
  dakika: cogul({ other: '{n} menit' }),
  saniye: cogul({ other: '{n} detik' }),
};
