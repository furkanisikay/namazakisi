import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Maguindanaoda sayıdan sonra isim çekilmez ("telu oras"). CLDR'de `mdh` yok (yalnız other);
 * `one` aynı metinle yazılır (Tatarca emsali). Birimler: "oras" (QE 7:34), "minutu", "segundu"
 * (Filipinler ortak kullanımı, türetildi); kısalar "or", "min", "seg".
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'or', dk: 'min', sn: 'seg' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} oras', other: '{n} oras' }),
  dakika: cogul({ one: '{n} minutu', other: '{n} minutu' }),
  saniye: cogul({ one: '{n} segundu', other: '{n} segundu' }),
};
