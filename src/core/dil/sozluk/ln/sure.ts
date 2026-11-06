import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR `ln`'den (h, min, s); uzun biçimde isim önce gelir ("miniti 5"), Lingala söz dizimi. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'ngonga {n}', other: 'ngonga {n}' }),
  dakika: cogul({ one: 'miniti {n}', other: 'miniti {n}' }),
  saniye: cogul({ one: 'sekondi {n}', other: 'sekondi {n}' }),
};
