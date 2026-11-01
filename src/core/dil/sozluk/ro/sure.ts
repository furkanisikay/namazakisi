import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Rumence çoğul: 1 one; 0, 2–19 (101–119…) few; 20 ve üstü other "{n} de …" (CLDR "25 de minute"). Kısa birimler CLDR narrow. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} oră', few: '{n} ore', other: '{n} de ore' }),
  dakika: cogul({ one: '{n} minut', few: '{n} minute', other: '{n} de minute' }),
  saniye: cogul({ one: '{n} secundă', few: '{n} secunde', other: '{n} de secunde' }),
};
