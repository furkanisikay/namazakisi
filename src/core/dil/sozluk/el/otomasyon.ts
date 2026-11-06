import type { Sozluk } from '../tr';

/** Otomasyon anahtar kelimesi: başlık eki içerir (rutin "ήρθε η ώρα" metnini arar). */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'ήρθε η ώρα',
  vakitGirdiBasligi: '{ad}: ήρθε η ώρα',
  herhangiVakit: 'Όταν αρχίζει οποιαδήποτε ώρα προσευχής',
  yalnizVakit: 'Μόνο όταν αρχίζει η ώρα της {ad}',
  camide: 'Όταν εντοπίζεται ότι βρίσκεστε σε τζαμί (με ενεργό το «Στο τζαμί»)',
};
