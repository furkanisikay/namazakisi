import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Hintçede süre birimi kısaltılmaz (Urduca gibi); kısa biçim de tam sözcüktür. one = 0 ve 1. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'घंटे', dk: 'मिनट', sn: 'सेकंड' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} घंटा', other: '{n} घंटे' }),
  dakika: cogul({ one: '{n} मिनट', other: '{n} मिनट' }),
  saniye: cogul({ one: '{n} सेकंड', other: '{n} सेकंड' }),
};
