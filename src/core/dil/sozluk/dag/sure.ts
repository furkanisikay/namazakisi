import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Dagbani CLDR çoğul tablosunda yok → `hepDiger`; `one` aynı metinle (Tatarca emsali). Sayı ismin
 * ARDINDAN gelir ("minti 5"); birim adları MediaWiki Dagbani çevirisinden (Minti, Hawa). Kısa
 * kalıp sözleşmesi sayı önce (`birimli`): "5 min", "1 hw 5 min".
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'hw', dk: 'min', sn: 'sk' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'hawa {n}', other: 'hawa {n}' }),
  dakika: cogul({ one: 'minti {n}', other: 'minti {n}' }),
  saniye: cogul({ one: 'sɛkɛnti {n}', other: 'sɛkɛnti {n}' }),
};
