import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Kısa birimler CLDR `am` (ሰዓ/ደቂ/ሰከ). Uzun biçimde sayıdan sonra ad tekil kalır ("10 ደቂቃ ቀርቷል"):
 * Amharcada doğal olan budur ve `dakikaUyumu` sesli okuma şablonundaki tekil fiil uyumunu bozmaz.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ሰዓ', dk: 'ደቂ', sn: 'ሰከ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ሰዓት', other: '{n} ሰዓት' }),
  dakika: cogul({ one: '{n} ደቂቃ', other: '{n} ደቂቃ' }),
  saniye: cogul({ one: '{n} ሰከንድ', other: '{n} ሰከንድ' }),
};
