import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Malgaşçada isim çoğul eki almaz: one (0, 1) ve other aynı kalıp. Kısa birimler: ora, min (minitra), seg (segondra). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ora', dk: 'min', sn: 'seg' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ora', other: '{n} ora' }),
  dakika: cogul({ one: '{n} minitra', other: '{n} minitra' }),
  saniye: cogul({ one: '{n} segondra', other: '{n} segondra' }),
};
