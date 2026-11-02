import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'st', dk: 'd', sn: 'sn' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} saet', other: '{n} saet' }),
  dakika: cogul({ one: '{n} deqîqe', other: '{n} deqîqe' }),
  saniye: cogul({ one: '{n} çirke', other: '{n} çirke' }),
};
