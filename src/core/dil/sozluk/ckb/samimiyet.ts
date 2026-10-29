import type { Sozluk } from '../tr';

/**
 * Soranî konuşan Müslümanların namaz sonrası ve bayram/özel gün kalıpları (çeviri değil):
 * "خوا قبوڵی بکات" (Allah kabul etsin, baskın kalıp, iki yuva), "قبوڵ بێت" (kabul olsun),
 * "خوای گەورە قبوڵی بکات" (Yüce Allah kabul etsin). Selamlar "… پیرۆز بێت" kalıbıyla
 * (جەژنتان پیرۆز بێت, ڕەمەزانتان پیرۆز بێت); sabah/gece "…تان باش". Kandil ve hicrî
 * yılbaşı selamı ülke başınadır (`selam.ts`; IQ listede yok), metinler tip bütünlüğü içindir.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'پیرۆز بێت.',
  kabulDualari: ['خوا قبوڵی بکات', 'قبوڵ بێت', 'خوا قبوڵی بکات', 'خوای گەورە قبوڵی بکات'],
  kabulDuasi: 'خوا قبوڵی بکات',
  ekSabah: 'بەیانیتان باش',
  ekYatsi: 'شەوتان باش',
  tamGunAna: 'خوا قبوڵی بکات',
  tamGunAlt: 'ئەمڕۆ ھەر پێنج نوێژەکەتان تەواو کرد.',
  kazaKabul: 'یەک قەزای {vakit} لە دەفتەرەکەتان کەم کرایەوە. {dua}.',
  kandilGeceleri: {
    regaib: 'شەوی ڕەغائیبتان پیرۆز بێت',
    mirac: 'شەوی ئیسرا و میعراجتان پیرۆز بێت',
    berat: 'شەوی بەراتتان پیرۆز بێت',
    mevlid: 'یادی لەدایکبوونی پێغەمبەرتان پیرۆز بێت',
  },
  selamlar: {
    sahur: 'پارشێوتان پیرۆز بێت',
    bayram: 'جەژنتان پیرۆز بێت',
    iftar: 'بەربانگتان پیرۆز بێت',
    kadir: 'شەوی قەدرتان پیرۆز بێت',
    arefe: 'ڕۆژی عەرەفەتان پیرۆز بێت',
    hicriYilbasi: 'ساڵی نوێی کۆچیتان پیرۆز بێت',
    cuma: 'ھەینیتان پیرۆز بێت',
    ramazan: 'ڕەمەزانتان پیرۆز بێت',
    sabah: 'بەیانیتان باش',
  },
};
