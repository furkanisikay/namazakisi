import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Rakamla yazıldığında ad tekil kalır ("5 daqiiqaa"); sıra `dakikaUyumu` için sayı önce. */
export const sure: Sozluk['sure'] = {
  kisa: { sa: "sa'a", dk: 'daq', sn: 'sek' },
  birimli: '{n} {birim}',
  parcali: '{once} {sonra}',
  saat: cogul({ one: "{n} sa'aatii", other: "{n} sa'aatii" }),
  dakika: cogul({ one: '{n} daqiiqaa', other: '{n} daqiiqaa' }),
  saniye: cogul({ one: '{n} sekondii', other: '{n} sekondii' }),
};
