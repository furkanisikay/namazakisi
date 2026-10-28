import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Farsçada süre birimi kısaltılmaz (kısa biçim de tam sözcük); sayıdan sonra ad tekildir. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ساعت', dk: 'دقیقه', sn: 'ثانیه' },
  saat: cogul({ one: '{n} ساعت', other: '{n} ساعت' }),
  dakika: cogul({ one: '{n} دقیقه', other: '{n} دقیقه' }),
  saniye: cogul({ one: '{n} ثانیه', other: '{n} ثانیه' }),
};
