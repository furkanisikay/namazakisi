import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Mooré: sayı ile birim arası ve iki süre parçası arası boşluklu. CLDR'de yok → çoğul yalnız
 * `other` seçilir (`hepDiger`); `one` nöbetçi bütünlüğü için aynı metni taşır.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'lɛɛr', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} lɛɛr', other: '{n} lɛɛr' }),
  dakika: cogul({ one: '{n} minit', other: '{n} minit' }),
  saniye: cogul({ one: '{n} sekõnd', other: '{n} sekõnd' }),
};
