import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ssa', dk: 'dk', sn: 'tk' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'essaawa {n}', other: 'essaawa {n}' }),
  dakika: cogul({ one: 'eddakiika {n}', other: 'eddakiika {n}' }),
  saniye: cogul({ one: 'akatikitiki {n}', other: 'obutikitiki {n}' }),
};
