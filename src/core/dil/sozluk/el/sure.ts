import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR el (`unitDisplay: 'short'`: "ώ.", "λ.", "δευτ."); sayı ile birim arasında boşluk. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ώ.', dk: 'λ.', sn: 'δευτ.' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ώρα', other: '{n} ώρες' }),
  dakika: cogul({ one: '{n} λεπτό', other: '{n} λεπτά' }),
  saniye: cogul({ one: '{n} δευτερόλεπτο', other: '{n} δευτερόλεπτα' }),
};
