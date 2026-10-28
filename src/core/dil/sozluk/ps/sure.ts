import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Peştucada süre birimi kısaltılmaz; kısa biçim de tam sözcüktür (sayıyla kullanılan çoğul biçim). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ساعته', dk: 'دقیقې', sn: 'ثانیې' },
  saat: cogul({ one: '{n} ساعت', other: '{n} ساعته' }),
  dakika: cogul({ one: '{n} دقیقه', other: '{n} دقیقې' }),
  saniye: cogul({ one: '{n} ثانیه', other: '{n} ثانیې' }),
};
