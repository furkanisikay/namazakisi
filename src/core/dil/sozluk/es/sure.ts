import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İspanyolca çoğul: yalnız 1 `one` (0 çoğul); milyonlar `many` ("1000000 de minutos"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  saat: cogul({ one: '{n} hora', other: '{n} horas', many: '{n} de horas' }),
  dakika: cogul({ one: '{n} minuto', other: '{n} minutos', many: '{n} de minutos' }),
  saniye: cogul({ one: '{n} segundo', other: '{n} segundos', many: '{n} de segundos' }),
};
