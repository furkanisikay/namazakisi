import type { Sozluk } from '../tr';

/**
 * Bangladeşli Müslümanların namaz sonrası ve selamda kullandığı yerleşik kalıplar (çeviri
 * değil): "আল্লাহ কবুল করুন" baskın kalıp (iki yuva), "কবুল হোক", "আল্লাহ তাআলা কবুল করুন";
 * selamlar "… মোবারক" kalıbıyla (জুমা মোবারক, ঈদ মোবারক, রমজান মোবারক, শবে কদর মোবারক).
 * Kandil: Bangladeş'te Şeb-i Berat (শবে বরাত) ve Mevlid (ঈদে মিলাদুন্নবী) resmî tatildir;
 * Regaib yerleşik değildir, karşılığı tip bütünlüğü içindir. Övgü ve "!" yok.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'বরকতময় হোক।',
  kabulDualari: ['আল্লাহ কবুল করুন', 'কবুল হোক', 'আল্লাহ কবুল করুন', 'আল্লাহ তাআলা কবুল করুন'],
  kabulDuasi: 'আল্লাহ কবুল করুন',
  ekSabah: 'আপনার সকাল বরকতময় হোক',
  ekYatsi: 'আপনার রাত বরকতময় হোক',
  tamGunAna: 'আল্লাহ কবুল করুন',
  tamGunAlt: 'আজ আপনি পাঁচ ওয়াক্ত নামাজই পূর্ণ করেছেন।',
  kazaKabul: 'আপনার খাতা থেকে এক ওয়াক্ত {vakit}-এর কাযা কমানো হয়েছে। {dua}।',
  kandilGeceleri: {
    regaib: 'লাইলাতুর রাগায়েব মোবারক',
    mirac: 'শবে মেরাজ মোবারক',
    berat: 'শবে বরাত মোবারক',
    mevlid: 'ঈদে মিলাদুন্নবী মোবারক',
  },
  selamlar: {
    sahur: 'বরকতময় সাহরি',
    bayram: 'ঈদ মোবারক',
    iftar: 'বরকতময় ইফতার',
    kadir: 'শবে কদর মোবারক',
    arefe: 'ঈদের আগের দিনটি বরকতময় হোক',
    hicriYilbasi: 'হিজরি নববর্ষ মোবারক',
    cuma: 'জুমা মোবারক',
    ramazan: 'রমজান মোবারক',
    sabah: 'আপনার সকাল বরকতময় হোক',
  },
};
