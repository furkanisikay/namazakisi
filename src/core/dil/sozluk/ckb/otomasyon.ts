import type { Sozluk } from '../tr';

/** Anahtar kelime başlığın önündedir (izafe: "کاتی {ad}"), Samsung Rutinler "içerir" eşleşmesi için. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'دەستپێکی کاتی',
  vakitGirdiBasligi: 'دەستپێکی کاتی {ad}',
  herhangiVakit: 'کاتێک کاتی ھەر نوێژێک دەست پێدەکات',
  yalnizVakit: 'تەنیا کاتێک کاتی {ad} دەست پێدەکات',
  camide: 'کاتێک دەزانرێت لە مزگەوتن (کاتێک «لە مزگەوتم» چالاکە)',
};
