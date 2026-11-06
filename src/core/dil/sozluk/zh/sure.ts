import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** 数字与单位之间不加空格（"5分钟"、"1小时5分钟"）。 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: '小时', dk: '分钟', sn: '秒' },
  birimli: '{n}{birim}',
  parcali: '{once}{sonra}',
  saat: cogul({ other: '{n}小时' }),
  dakika: cogul({ other: '{n}分钟' }),
  saniye: cogul({ other: '{n}秒' }),
};
