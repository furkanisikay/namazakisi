import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** CLDR tk gysga birlikler: "5 sag", "5 min", "5 sek". San bilen at birlikde ýeke sanda galýar. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'sag', dk: 'min', sn: 'sek' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} sagat', other: '{n} sagat' }),
  dakika: cogul({ one: '{n} minut', other: '{n} minut' }),
  saniye: cogul({ one: '{n} sekunt', other: '{n} sekunt' }),
};
