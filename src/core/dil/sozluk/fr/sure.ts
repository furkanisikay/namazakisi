import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Fransızca çoğul: 0 ve 1 `one`; milyonlar `many` ("1 000 000 de minutes"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  saat: cogul({ one: '{n} heure', many: '{n} d’heures', other: '{n} heures' }),
  dakika: cogul({ one: '{n} minute', many: '{n} de minutes', other: '{n} minutes' }),
  saniye: cogul({ one: '{n} seconde', many: '{n} de secondes', other: '{n} secondes' }),
};
