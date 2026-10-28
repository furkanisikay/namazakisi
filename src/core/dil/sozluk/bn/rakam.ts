import type { Sozluk } from '../tr';

/** Bengalcede `dogu` yerel rakam (বাংলা সংখ্যা) etiketidir, Doğu Arap rakamı değil. */
export const rakam: Sozluk['rakam'] = {
  baslik: 'সংখ্যা',
  aciklama: 'সময়, তারিখ ও সংখ্যা কোন অঙ্কে লেখা হবে তা বেছে নিন।',
  otomatik: 'দেশ অনুযায়ী',
  otomatikAciklama: 'আপনার অবস্থানের দেশে প্রচলিত অঙ্ক ব্যবহার করা হয়।',
  dogu: 'বাংলা সংখ্যা',
  bati: 'ইংরেজি সংখ্যা',
};
