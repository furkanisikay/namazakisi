import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Korecede sayı ile birim bitişik ("5분"), ardışık süre parçaları boşluklu ("1시간 5분"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: '시간', dk: '분', sn: '초' },
  birimli: '{n}{birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: '{n}시간' }),
  dakika: cogul({ other: '{n}분' }),
  saniye: cogul({ other: '{n}초' }),
};
