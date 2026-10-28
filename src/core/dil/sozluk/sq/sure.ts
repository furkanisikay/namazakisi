import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** "orë" njëjës = shumës; "min", "sek" shkurtimet e zakonshme. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'orë', dk: 'min', sn: 'sek' },
  saat: cogul({ one: '{n} orë', other: '{n} orë' }),
  dakika: cogul({ one: '{n} minutë', other: '{n} minuta' }),
  saniye: cogul({ one: '{n} sekondë', other: '{n} sekonda' }),
};
