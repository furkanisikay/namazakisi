import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR lt `short` ("5 val.", "5 min.", "5 sek."); uzun biçim yalın hâl, `many` kesirli ("1,5 valandos"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'val.', dk: 'min.', sn: 'sek.' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} valanda', few: '{n} valandos', many: '{n} valandos', other: '{n} valandų' }),
  dakika: cogul({ one: '{n} minutė', few: '{n} minutės', many: '{n} minutės', other: '{n} minučių' }),
  saniye: cogul({ one: '{n} sekundė', few: '{n} sekundės', many: '{n} sekundės', other: '{n} sekundžių' }),
};
