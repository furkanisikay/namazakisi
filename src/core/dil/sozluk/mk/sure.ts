import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Kısa birimler CLDR mk'den (ч, мин, с; sondaki nokta atıldı, native tablolar da noktasız).
 * Çoğul one = son hanesi 1 (11 hariç): "21 час", "21 минута". Eril tek heceli "час" sayıdan
 * sonra sayma biçimi alır ("5 часа", CLDR).
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ч', dk: 'мин', sn: 'с' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} час', other: '{n} часа' }),
  dakika: cogul({ one: '{n} минута', other: '{n} минути' }),
  saniye: cogul({ one: '{n} секунда', other: '{n} секунди' }),
};
