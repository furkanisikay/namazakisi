import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Urducada süre birimi kısaltılmaz; kısa biçim de tam sözcüktür. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'گھنٹے', dk: 'منٹ', sn: 'سیکنڈ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} گھنٹہ', other: '{n} گھنٹے' }),
  dakika: cogul({ one: '{n} منٹ', other: '{n} منٹ' }),
  saniye: cogul({ one: '{n} سیکنڈ', other: '{n} سیکنڈ' }),
};
