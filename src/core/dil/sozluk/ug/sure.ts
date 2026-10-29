import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Uygurcada sayıdan sonra ad çoğul eki almaz: `one` ve `other` aynı biçimdir. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'سائەت', dk: 'مىنۇت', sn: 'سېكۇنت' },
  saat: cogul({ one: '{n} سائەت', other: '{n} سائەت' }),
  dakika: cogul({ one: '{n} مىنۇت', other: '{n} مىنۇت' }),
  saniye: cogul({ one: '{n} سېكۇنت', other: '{n} سېكۇنت' }),
};
