import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** CLDR ceb: "5 ka minuto", "2 ka oras", "2 ka segundo" (bağlayıcı "ka"); kısa biçim "min", "seg". Ad sayıyla çekilmez. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'oras', dk: 'min', sn: 'seg' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ka oras', other: '{n} ka oras' }),
  dakika: cogul({ one: '{n} ka minuto', other: '{n} ka minuto' }),
  saniye: cogul({ one: '{n} ka segundo', other: '{n} ka segundo' }),
};
