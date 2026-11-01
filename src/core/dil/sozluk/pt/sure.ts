import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Portekizce (pt-PT) çoğul: yalnız 1 `one` (0 çoğul); milyonlar `many` ("1 000 000 de minutos"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} hora', many: '{n} de horas', other: '{n} horas' }),
  dakika: cogul({ one: '{n} minuto', many: '{n} de minutos', other: '{n} minutos' }),
  saniye: cogul({ one: '{n} segundo', many: '{n} de segundos', other: '{n} segundos' }),
};
