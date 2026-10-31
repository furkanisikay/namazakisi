import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'Std.', dk: 'Min.', sn: 'Sek.' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} Stunde', other: '{n} Stunden' }),
  dakika: cogul({ one: '{n} Minute', other: '{n} Minuten' }),
  saniye: cogul({ one: '{n} Sekunde', other: '{n} Sekunden' }),
};
