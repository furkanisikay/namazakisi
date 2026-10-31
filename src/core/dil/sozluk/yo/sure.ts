import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Yorubada çoğul yalnız `other` (CLDR). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'wkt', dk: 'ìṣj', sn: 'ìṣ-àá' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: 'wákàtí {n}' }),
  dakika: cogul({ other: 'ìṣẹ́jú {n}' }),
  saniye: cogul({ other: 'ìṣẹ́jú-àáyá {n}' }),
};
