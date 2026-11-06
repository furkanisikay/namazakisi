import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Tamilce süre birimleri. Kısa biçim noktasız kısaltma (மணி, நிமி, வி); sayı ile birim ve iki
 * süre parçası arasında boşluk (dalga 9 kararı). one = yalnız 1, 0 çoğul.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'மணி', dk: 'நிமி', sn: 'வி' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} மணிநேரம்', other: '{n} மணிநேரம்' }),
  dakika: cogul({ one: '{n} நிமிடம்', other: '{n} நிமிடங்கள்' }),
  saniye: cogul({ one: '{n} வினாடி', other: '{n} வினாடிகள்' }),
};
