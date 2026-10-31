import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Azərbaycan dilində saydan sonra isim tək qalır ("5 dəqiqə"); qısa vahidlər CLDR (saat, dəq, san). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'saat', dk: 'dəq', sn: 'san' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} saat', other: '{n} saat' }),
  dakika: cogul({ one: '{n} dəqiqə', other: '{n} dəqiqə' }),
  saniye: cogul({ one: '{n} saniyə', other: '{n} saniyə' }),
};
