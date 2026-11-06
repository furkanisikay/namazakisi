import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Ikinyarwanda nticyanditswe muri CLDR plurals → `other` gusa; izina riza mbere y’umubare («iminota 5»).
 * `one` ni kopi ya `other` (Node ICU ntizi rw, `aktifDil.test` isaba one/other; `cogul.ts > hepDiger`).
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'amasaha {n}', other: 'amasaha {n}' }),
  dakika: cogul({ one: 'iminota {n}', other: 'iminota {n}' }),
  saniye: cogul({ one: 'amasegonda {n}', other: 'amasegonda {n}' }),
};
