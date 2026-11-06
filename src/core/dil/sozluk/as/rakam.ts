import type { Sozluk } from '../tr';

/** Assamcada `dogu` yerel rakam (CLDR `beng`) etiketidir; Assam'da bu rakamlar "অসমীয়া" diye anılır. */
export const rakam: Sozluk['rakam'] = {
  baslik: 'সংখ্যা',
  aciklama: 'সময়, তাৰিখ আৰু সংখ্যাত কোনবিধ অংক ব্যৱহাৰ হ’ব বাছনি কৰক।',
  otomatik: 'দেশ অনুসৰি',
  otomatikAciklama: 'আপোনাৰ অৱস্থানৰ দেশত প্ৰচলিত অংক ব্যৱহাৰ কৰা হয়।',
  dogu: 'অসমীয়া অংক',
  bati: 'ইংৰাজী অংক',
};
