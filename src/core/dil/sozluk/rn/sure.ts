import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Kirundi: sayı ile birim arası ve iki süre parçası arası boşluklu ("5 min"). Tam biçimde isim sayıdan
 * önce gelir ("iminota 5"). CLDR'de `rn` çoğul kuralı yok (hepDiger: hep `other`); Node
 * `Intl.PluralRules('rn')` en-US'ye düştüğü için `one` da yazıldı (çalışmada seçilmez).
 * Kısa birimler uluslararası simgeler (h, min, s); Burundi yazı geleneğinde (Fransızca etkisi) yaygın.
 */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'h', dk: 'min', sn: 's' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: 'isaha {n}', other: 'amasaha {n}' }),
  dakika: cogul({ one: 'umunota {n}', other: 'iminota {n}' }),
  saniye: cogul({ one: 'isegonda {n}', other: 'amasegonda {n}' }),
};
