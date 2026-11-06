import { cogul } from '../../tipler';

/** Süre birimleri: kısa (sayaç, başlık) ve uzun (cümle, ekran okuyucu). */
export const sure = {
  kisa: { sa: 'sa', dk: 'dk', sn: 'sn' },
  /**
   * Sayı + kısa birim ("5 dk"). Boşluk DİLİN kararıdır: boşluksuz yazan dil `'{n}{birim}'`
   * yazar (Çince "5分钟"). Sırası da buradan: `{birim}` önce gelebilir.
   */
  birimli: '{n} {birim}',
  /** Ardışık iki süre parçası ("1 sa" + "5 dk", "1 saat" + "5 dakika"); Çince `'{once}{sonra}'`. */
  parcali: '{once} {sonra}',
  saat: cogul({ one: '{n} saat', other: '{n} saat' }),
  dakika: cogul({ one: '{n} dakika', other: '{n} dakika' }),
  saniye: cogul({ one: '{n} saniye', other: '{n} saniye' }),
} as const;
