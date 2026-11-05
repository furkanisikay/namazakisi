import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** CLDR ka: kısa birimler სთ / წთ / წმ, sayıdan sonra isim tekil ("5 წუთი"); sayı ile birim arası boşluk. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'სთ', dk: 'წთ', sn: 'წმ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} საათი', other: '{n} საათი' }),
  dakika: cogul({ one: '{n} წუთი', other: '{n} წუთი' }),
  saniye: cogul({ one: '{n} წამი', other: '{n} წამი' }),
};
