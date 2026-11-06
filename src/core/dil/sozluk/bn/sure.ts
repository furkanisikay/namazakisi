import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Bengalcede sayıdan sonra isim çekimlenmez: `one` ve `other` aynı biçimdir. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ঘ', dk: 'মি', sn: 'সে' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ঘণ্টা', other: '{n} ঘণ্টা' }),
  dakika: cogul({ one: '{n} মিনিট', other: '{n} মিনিট' }),
  saniye: cogul({ one: '{n} সেকেন্ড', other: '{n} সেকেন্ড' }),
};
