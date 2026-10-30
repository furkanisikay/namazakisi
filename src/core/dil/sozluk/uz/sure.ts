import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Özbekçede sayıdan sonra isim çoğul eki almaz ("5 дақиқа"); iki kategori de aynı. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'соат', dk: 'дақ', sn: 'с' },
  saat: cogul({ one: '{n} соат', other: '{n} соат' }),
  dakika: cogul({ one: '{n} дақиқа', other: '{n} дақиқа' }),
  saniye: cogul({ one: '{n} сония', other: '{n} сония' }),
};
