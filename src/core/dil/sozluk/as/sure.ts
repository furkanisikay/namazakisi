import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Assamcada sayıdan sonra isim çekimlenmez: `one` ve `other` aynı biçimdir (CLDR "5 মিনিট"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ঘ', dk: 'মি', sn: 'ছে' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ঘণ্টা', other: '{n} ঘণ্টা' }),
  dakika: cogul({ one: '{n} মিনিট', other: '{n} মিনিট' }),
  saniye: cogul({ one: '{n} ছেকেণ্ড', other: '{n} ছেকেণ্ড' }),
};
