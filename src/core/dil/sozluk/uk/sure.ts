import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR `short` ("5 год", "5 хв", "5 с"); `other` kesirli sayı biçimidir ("1,5 години"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'год', dk: 'хв', sn: 'с' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} година', few: '{n} години', many: '{n} годин', other: '{n} години' }),
  dakika: cogul({ one: '{n} хвилина', few: '{n} хвилини', many: '{n} хвилин', other: '{n} хвилини' }),
  saniye: cogul({ one: '{n} секунда', few: '{n} секунди', many: '{n} секунд', other: '{n} секунди' }),
};
