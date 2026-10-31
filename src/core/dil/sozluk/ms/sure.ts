import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Bahasa Melayu: "saat" = detik, "jam" = jam. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'j', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: '{n} jam' }),
  dakika: cogul({ other: '{n} minit' }),
  saniye: cogul({ other: '{n} saat' }),
};
