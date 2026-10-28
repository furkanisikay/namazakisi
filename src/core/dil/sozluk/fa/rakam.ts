// ÇEVİRİ: fa — İngilizce iskelet, çevrilince bu satır silinir
import type { Sozluk } from '../tr';

/** `dogu` yerel rakam etiketidir: bu dilde Fars rakamı (CLDR `arabext`), Doğu Arap rakamı değil. */
export const rakam: Sozluk['rakam'] = {
  baslik: 'Numerals',
  aciklama: 'Choose which numerals are used for times, dates and numbers.',
  otomatik: 'By country',
  otomatikAciklama: 'Uses the numerals common in the country of your location.',
  dogu: 'Persian numerals',
  bati: 'Western numerals',
};
