import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Tatarcada sayıdan sonra isim çoğul eki almaz ("5 минут"). CLDR'de `tt` çoğul kuralı yok (yalnız
 * other); Node `Intl.PluralRules('tt')` en-US'ye düştüğü için `one` da aynı metinle yazılır.
 * Kısa birimler CLDR'de yok: "сәг", "мин", "сек" (Tatar yazı geleneğinin kısaltmaları).
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'сәг', dk: 'мин', sn: 'сек' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} сәгать', other: '{n} сәгать' }),
  dakika: cogul({ one: '{n} минут', other: '{n} минут' }),
  saniye: cogul({ one: '{n} секунд', other: '{n} секунд' }),
};
