import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nepalcede süre birimi kısaltılmaz (CLDR kısa biçim de tam sözcük: घण्टा, मिनेट, सेकेन्ड); sayıdan sonra çoğul eki yok. one = yalnız 1. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'घण्टा', dk: 'मिनेट', sn: 'सेकेन्ड' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} घण्टा', other: '{n} घण्टा' }),
  dakika: cogul({ one: '{n} मिनेट', other: '{n} मिनेट' }),
  saniye: cogul({ one: '{n} सेकेन्ड', other: '{n} सेकेन्ड' }),
};
