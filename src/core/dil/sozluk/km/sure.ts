import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Khmerce: sayı ile birim arası ve iki süre parçası arası boşluklu (CLDR "5 នាទី"); çoğul yok (yalnız other). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ម៉ោង', dk: 'នាទី', sn: 'វិនាទី' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: '{n} ម៉ោង' }),
  dakika: cogul({ other: '{n} នាទី' }),
  saniye: cogul({ other: '{n} វិនាទី' }),
};
