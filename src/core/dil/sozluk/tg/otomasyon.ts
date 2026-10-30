import type { Sozluk } from '../tr';

/** Ek, başlığın içinde birebir geçmelidir (otomasyon "bildirim şunu içeriyorsa" eşleşmesi). */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'вақти намоз расид',
  vakitGirdiBasligi: '{ad}: вақти намоз расид',
  herhangiVakit: 'Вақте ки вақти ягон намоз расад',
  yalnizVakit: 'Танҳо вақте ки вақти {ad} расад',
  camide: 'Вақте ки ҳузури Шумо дар масҷид муайян шавад (агар «Дар масҷид» фаъол бошад)',
};
