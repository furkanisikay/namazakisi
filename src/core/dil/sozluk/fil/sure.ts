import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** CLDR fil: "5 minuto", kısa "5 min.", "5 seg."; saatin kısası yok ("oras"). Ad sayıyla çekilmez. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'oras', dk: 'min', sn: 'seg' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} oras', other: '{n} oras' }),
  dakika: cogul({ one: '{n} minuto', other: '{n} minuto' }),
  saniye: cogul({ one: '{n} segundo', other: '{n} segundo' }),
};
