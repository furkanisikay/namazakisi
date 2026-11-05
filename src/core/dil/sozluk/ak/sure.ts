import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR `ak`'tan (h, min, s); uzun biçimde isim önce gelir ("sima 5"), CLDR ak ve Akan söz dizimi. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'dɔnhwere {n}', other: 'dɔnhwere {n}' }),
  dakika: cogul({ one: 'sima {n}', other: 'sima {n}' }),
  saniye: cogul({ one: 'sima sini {n}', other: 'sima sini {n}' }),
};
