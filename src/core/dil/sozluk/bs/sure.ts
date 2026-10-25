import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  /** Standart kısaltmalar (h, min, s) Boşnakçada da aynıdır. */
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  saat: cogul({ one: '{n} sat', few: '{n} sata', other: '{n} sati' }),
  dakika: cogul({ one: '{n} minuta', few: '{n} minute', other: '{n} minuta' }),
  saniye: cogul({ one: '{n} sekunda', few: '{n} sekunde', other: '{n} sekundi' }),
};
