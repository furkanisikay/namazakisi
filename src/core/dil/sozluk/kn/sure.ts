import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Kannada süre birimleri CLDR gövdesidir (ಗಂಟೆ, ನಿಮಿಷ, ಸೆಕೆಂಡ್); CLDR'nin hâl ekli "ಗಂಟೆಯು/ಗಂಟೆಗಳು"
 * biçimi cümle içinde ("… ಮೊದಲು") bozulduğu için sayıdan sonra yalın gövde yazılır, one = other.
 * Kısa biçim CLDR short'tan, noktasız (ಗಂ, ನಿಮಿ, ಸೆ). one = 0 ve 1 (Hintçe gibi).
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'ಗಂ', dk: 'ನಿಮಿ', sn: 'ಸೆ' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} ಗಂಟೆ', other: '{n} ಗಂಟೆ' }),
  dakika: cogul({ one: '{n} ನಿಮಿಷ', other: '{n} ನಿಮಿಷ' }),
  saniye: cogul({ one: '{n} ಸೆಕೆಂಡ್', other: '{n} ಸೆಕೆಂಡ್' }),
};
