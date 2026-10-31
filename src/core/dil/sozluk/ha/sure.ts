import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Hausa'da sayı addan sonra gelir ("minti 5"); ad sayıyla çekilmez. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'awa', dk: 'min', sn: 'daƙ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'awa {n}', other: 'awa {n}' }),
  dakika: cogul({ one: 'minti {n}', other: 'minti {n}' }),
  saniye: cogul({ one: 'daƙiƙa {n}', other: 'daƙiƙa {n}' }),
};
