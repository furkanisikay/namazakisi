import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** N'Ko (CLDR `nqo`): CLDR'de birim sayıdan önce gelir; süre kalıpları native tablolarla ortak olduğu için sayı önce (nöbetçi sure.test); çoğul yok (yalnız other). Kısa birimler CLDR short. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ߕ', dk: 'ߡߌ߬ߛ', sn: 'ߝ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ other: '{n} ߕߎ߬ߡߊ߬ߙߋ߲' }),
  dakika: cogul({ other: '{n} ߡߌ߬ߛߍ߲' }),
  saniye: cogul({ other: '{n} ߝߌ߬ߟߊ߲' }),
};
