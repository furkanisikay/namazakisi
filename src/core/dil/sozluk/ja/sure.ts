import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** 数字と単位の間に空白を入れない（"5分"、"1時間5分"）。Japoncada çoğul yalnız other. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: '時間', dk: '分', sn: '秒' },
  birimli: '{n}{birim}',
  parcali: '{once}{sonra}',
  saat: cogul({ other: '{n}時間' }),
  dakika: cogul({ other: '{n}分' }),
  saniye: cogul({ other: '{n}秒' }),
};
