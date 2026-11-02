import type { Sozluk } from '../tr';

/** Bildirim başlığı ve rutin anahtar kelimesi; `vakitGirdiEki` başlığın içinde geçmelidir. */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'настапи времето',
  vakitGirdiBasligi: '{ad}: настапи времето',
  herhangiVakit: 'Кога ќе настапи кое било време за намаз',
  yalnizVakit: 'Само кога ќе настапи времето: {ad}',
  camide: 'Кога ќе се открие дека сте во џамија (додека „Во џамија“ е вклучено)',
};
