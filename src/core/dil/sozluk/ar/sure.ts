import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Her biçim "{n} " ile başlar: `dakikaUyumu` sayıyı kesip yalnız birimi değiştirir.
 * 3–10 çoğul (دقائق), 11–99 temyiz tekil (دقيقة), 0/1/2 ve 100+ rakamla tekil.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'س', dk: 'د', sn: 'ث' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ zero: '{n} ساعة', one: '{n} ساعة', two: '{n} ساعة', few: '{n} ساعات', many: '{n} ساعة', other: '{n} ساعة' }),
  dakika: cogul({ zero: '{n} دقيقة', one: '{n} دقيقة', two: '{n} دقيقة', few: '{n} دقائق', many: '{n} دقيقة', other: '{n} دقيقة' }),
  saniye: cogul({ zero: '{n} ثانية', one: '{n} ثانية', two: '{n} ثانية', few: '{n} ثوانٍ', many: '{n} ثانية', other: '{n} ثانية' }),
};
