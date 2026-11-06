import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Gucaratça süre birimleri CLDR'dir (કલાક, મિનિટ, સેકંડ; çoğulda biçim değişmez). Kısa biçim
 * CLDR narrow'dur (ક, મિ, સે). one = 0 ve 1 (Hintçe gibi).
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ક', dk: 'મિ', sn: 'સે' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} કલાક', other: '{n} કલાક' }),
  dakika: cogul({ one: '{n} મિનિટ', other: '{n} મિનિટ' }),
  saniye: cogul({ one: '{n} સેકંડ', other: '{n} સેકંડ' }),
};
