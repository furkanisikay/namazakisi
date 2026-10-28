import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Soranîde sayıdan sonra isim tekil kalır ("5 خولەک"): one ve other aynıdır. Kısa biçim
 * Arapçadaki gibi tek harf (کاتژمێر → ک, خولەک → خ, چرکە → چ); CLDR'de ckb birim verisi yok.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ک', dk: 'خ', sn: 'چ' },
  saat: cogul({ one: '{n} کاتژمێر', other: '{n} کاتژمێر' }),
  dakika: cogul({ one: '{n} خولەک', other: '{n} خولەک' }),
  saniye: cogul({ one: '{n} چرکە', other: '{n} چرکە' }),
};
