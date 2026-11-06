import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Telugu süre birimleri. Kısa biçim CLDR kısaltmasının noktasız hâli (గం, నిమి, సె; Tamil
 * emsali); sayı ile birim ve iki süre parçası arasında boşluk (CLDR short "5 నిమి."). one =
 * yalnız 1 (`birDiger`), 0 çoğul.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'గం', dk: 'నిమి', sn: 'సె' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} గంట', other: '{n} గంటలు' }),
  dakika: cogul({ one: '{n} నిమిషం', other: '{n} నిమిషాలు' }),
  saniye: cogul({ one: '{n} సెకను', other: '{n} సెకన్లు' }),
};
