import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Tayca: sayı ile birim arası ve iki süre parçası arası boşluklu ("1 ชม. 5 นาที"); çoğul yok (yalnız other). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ชม.', dk: 'นาที', sn: 'วิ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: '{n} ชั่วโมง' }),
  dakika: cogul({ other: '{n} นาที' }),
  saniye: cogul({ other: '{n} วินาที' }),
};
