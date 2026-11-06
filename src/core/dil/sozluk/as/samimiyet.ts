import type { Sozluk } from '../tr';

/**
 * Assamlı Müslümanların namaz sonrası ve selamda kullandığı kalıplar (çeviri değil). Kök:
 * "কবুল কৰা" (QE 2:127), "বৰকতময়" (HadeethEnc as); "আল্লাহে কবুল কৰক" saygılı dilek
 * kipiyle türetildi, yerli okuyucu onaylamalı. Bayram, cuma ve Ramazan "… মোবাৰক" kalıbıyla.
 * Kandil karşılıkları tip bütünlüğü içindir. Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'বৰকতময় হওক।',
  kabulDualari: ['আল্লাহে কবুল কৰক', 'কবুল হওক', 'আল্লাহে কবুল কৰক', 'আল্লাহ তাআলাই কবুল কৰক'],
  kabulDuasi: 'আল্লাহে কবুল কৰক',
  ekSabah: 'আপোনাৰ পুৱা বৰকতময় হওক',
  ekYatsi: 'আপোনাৰ ৰাতি বৰকতময় হওক',
  tamGunAna: 'আল্লাহে কবুল কৰক',
  tamGunAlt: 'আজি আপুনি পাঁচো ওৱাক্ত নামাজ সম্পূৰ্ণ কৰিলে।',
  kazaKabul: 'আপোনাৰ খাতাৰ পৰা {vakit}ৰ এটা কাজা কমোৱা হ’ল। {dua}।',
  kandilGeceleri: {
    regaib: 'লাইলাতুৰ ৰাগাইব বৰকতময় হওক',
    mirac: 'শবে মিৰাজ বৰকতময় হওক',
    berat: 'শবে বৰাত বৰকতময় হওক',
    mevlid: 'ঈদে মিলাদুন্নবী বৰকতময় হওক',
  },
  selamlar: {
    sahur: 'বৰকতময় ছাহৰী',
    bayram: 'ঈদ মোবাৰক',
    iftar: 'বৰকতময় ইফতাৰ',
    kadir: 'লাইলাতুল কদৰ বৰকতময় হওক',
    arefe: 'ঈদৰ আগদিনটো বৰকতময় হওক',
    hicriYilbasi: 'হিজৰী নৱবৰ্ষ বৰকতময় হওক',
    cuma: 'জুমুআ মোবাৰক',
    ramazan: 'ৰমজান মোবাৰক',
    sabah: 'আপোনাৰ পুৱা বৰকতময় হওক',
  },
};
