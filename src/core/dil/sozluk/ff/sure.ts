import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Sayı önce yazılır ("5 hojomaaji"; dakikaUyumu sayıya göre çeker). hojom: dakika (sözlük), saa’i: saat. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'sa', dk: 'hj', sn: 'mj' },
  saat: cogul({ one: '{n} saa’i', other: '{n} saa’iiji' }),
  dakika: cogul({ one: '{n} hojom', other: '{n} hojomaaji' }),
  saniye: cogul({ one: '{n} majaango', other: '{n} majaaɗe' }),
};
