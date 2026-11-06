import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'u', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} uur', other: '{n} uur' }),
  dakika: cogul({ one: '{n} minuut', other: '{n} minuten' }),
  saniye: cogul({ one: '{n} seconde', other: '{n} seconden' }),
};
