// CLDR he: kısa birimler "שע׳ / דק׳ / שנ׳"; saat ve saniyede `two` ikilik/sayı sözcüğüyle ("שעתיים", "שתי שניות").
// Dakikanın HER biçimi "{n}" ile başlar: `dakikaUyumu` sesli okuma cümlesinde sayıyı keserek eşler
// ("שתי דקות" "2 תי דקות" olurdu).
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const sure: Sozluk['sure'] = {
  kisa: { sa: 'שע׳', dk: 'דק׳', sn: 'שנ׳' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} שעה', two: 'שעתיים', other: '{n} שעות' }),
  dakika: cogul({ one: '{n} דקה', two: '{n} דקות', other: '{n} דקות' }),
  saniye: cogul({ one: '{n} שנייה', two: 'שתי שניות', other: '{n} שניות' }),
};
