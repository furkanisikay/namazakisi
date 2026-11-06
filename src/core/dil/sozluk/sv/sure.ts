import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** CLDR sv kısa birimler: "h", "min", "s"; sayı ile birim arasında boşluk ("5 min", "1 h 5 min"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} timme', other: '{n} timmar' }),
  dakika: cogul({ one: '{n} minut', other: '{n} minuter' }),
  saniye: cogul({ one: '{n} sekund', other: '{n} sekunder' }),
};
