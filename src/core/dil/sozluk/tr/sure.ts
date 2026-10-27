import { cogul } from '../../tipler';

/** Süre birimleri: kısa (sayaç, başlık) ve uzun (cümle, ekran okuyucu). */
export const sure = {
  kisa: { sa: 'sa', dk: 'dk', sn: 'sn' },
  saat: cogul({ one: '{n} saat', other: '{n} saat' }),
  dakika: cogul({ one: '{n} dakika', other: '{n} dakika' }),
  saniye: cogul({ one: '{n} saniye', other: '{n} saniye' }),
} as const;
