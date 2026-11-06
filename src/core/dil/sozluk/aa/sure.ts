import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Afar CLDR'de yok → hepDiger; `one` = `other` (nöbetçi Intl köküyle one ister). Sayıdan sonra isim tekil. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: 'saq', dk: 'daq', sn: 'sek' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} saaqat', other: '{n} saaqat' }),
  dakika: cogul({ one: '{n} daqiiqa', other: '{n} daqiiqa' }),
  saniye: cogul({ one: '{n} sekond', other: '{n} sekond' }),
};
