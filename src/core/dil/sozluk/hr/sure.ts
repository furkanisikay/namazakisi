import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR hr (h, min, s); çoğul one/few/other (1 minuta, 2 minute, 5 minuta). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} sat', few: '{n} sata', other: '{n} sati' }),
  dakika: cogul({ one: '{n} minuta', few: '{n} minute', other: '{n} minuta' }),
  saniye: cogul({ one: '{n} sekunda', few: '{n} sekunde', other: '{n} sekundi' }),
};
