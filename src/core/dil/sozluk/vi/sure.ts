import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Vietnamcada çoğul çekim yok (CLDR yalnız `other`); birimler zaten kısa sözcüklerdir. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'giờ', dk: 'phút', sn: 'giây' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: '{n} giờ' }),
  dakika: cogul({ other: '{n} phút' }),
  saniye: cogul({ other: '{n} giây' }),
};
