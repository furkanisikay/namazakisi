import type { Sozluk } from '../tr';

/** Başlık eke BİTER (`vakitGirdiBasligi(v).endsWith(vakitGirdiEki())`). */
export const otomasyon: Sozluk['otomasyon'] = {
  vakitGirdiEki: 'telah tiba',
  vakitGirdiBasligi: 'Waktu {ad} telah tiba',
  herhangiVakit: 'Saat waktu salat mana pun tiba',
  yalnizVakit: 'Hanya saat waktu {ad} tiba',
  camide: 'Saat Anda terdeteksi di masjid (dengan Di masjid aktif)',
};
