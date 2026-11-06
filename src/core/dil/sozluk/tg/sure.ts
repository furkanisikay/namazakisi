import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Tacikçede sayıdan sonra ad tekildir ("5 дақиқа"); kısa birimler "соат", "дақ", "сон". */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'соат', dk: 'дақ', sn: 'сон' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} соат', other: '{n} соат' }),
  dakika: cogul({ one: '{n} дақиқа', other: '{n} дақиқа' }),
  saniye: cogul({ one: '{n} сония', other: '{n} сония' }),
};
