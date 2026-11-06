import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kısa birimler CLDR `short` ("5 godz.", "5 min", "5 sek."); `other` kesirli sayı biçimidir ("1,5 godziny"). */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'godz.', dk: 'min', sn: 'sek.' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} godzina', few: '{n} godziny', many: '{n} godzin', other: '{n} godziny' }),
  dakika: cogul({ one: '{n} minuta', few: '{n} minuty', many: '{n} minut', other: '{n} minuty' }),
  saniye: cogul({ one: '{n} sekunda', few: '{n} sekundy', many: '{n} sekund', other: '{n} sekundy' }),
};
