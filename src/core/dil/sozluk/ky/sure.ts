import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kırgızcada sayıdan sonra ad tekil kalır ("5 мүнөт"); kısaltmalar CLDR `ky` (ст, мүн, сек). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ст', dk: 'мүн', sn: 'сек' },
  saat: cogul({ one: '{n} саат', other: '{n} саат' }),
  dakika: cogul({ one: '{n} мүнөт', other: '{n} мүнөт' }),
  saniye: cogul({ one: '{n} секунд', other: '{n} секунд' }),
};
