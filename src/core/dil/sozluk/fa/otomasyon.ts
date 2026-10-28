import type { Sozluk } from '../tr';

/** Ek, başlığın içinde birebir geçmelidir (otomasyon "bildirim şunu içeriyorsa" eşleşmesi). */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'وقت نماز رسید',
  vakitGirdiBasligi: '{ad}: وقت نماز رسید',
  herhangiVakit: 'وقتی وقت هر نمازی برسد',
  yalnizVakit: 'فقط وقتی وقت {ad} برسد',
  camide: 'وقتی حضور شما در مسجد تشخیص داده شود (با روشن بودن «در مسجدم»)',
};
