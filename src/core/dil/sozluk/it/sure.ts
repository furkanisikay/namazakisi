import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İtalyanca çoğul: yalnız 1 `one` (0 çoğul); milyonlar `many` ("1000000 di minuti"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ora', many: '{n} di ore', other: '{n} ore' }),
  dakika: cogul({ one: '{n} minuto', many: '{n} di minuti', other: '{n} minuti' }),
  saniye: cogul({ one: '{n} secondo', many: '{n} di secondi', other: '{n} secondi' }),
};
