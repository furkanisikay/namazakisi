import type { Sozluk } from '../tr';

/** Uygurcada yerel rakam yok (CLDR `latn`); seçici görünmez, anahtarlar tip için doludur. */
export const rakam: Sozluk['rakam'] = {
  baslik: 'رەقەملەر',
  aciklama: 'ۋاقىت، چېسلا ۋە سانلاردا قايسى رەقەملەرنىڭ ئىشلىتىلىشىنى تاللاڭ.',
  otomatik: 'دۆلەتكە قاراپ',
  otomatikAciklama: 'ئورنىڭىز تۇرغان دۆلەتتە كەڭ قوللىنىلىدىغان رەقەملەرنى ئىشلىتىدۇ.',
  dogu: 'شەرقىي ئەرەب رەقەملىرى',
  bati: 'غەربىي رەقەملەر',
};
