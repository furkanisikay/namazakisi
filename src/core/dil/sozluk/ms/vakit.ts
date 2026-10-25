import type { Sozluk } from '../tr';

/** Nama waktu mengikut JAKIM (e-Solat); dalam ayat tetap bermula dengan huruf besar (kata nama khas). */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subuh', gunes: 'Syuruk', ogle: 'Zohor', ikindi: 'Asar', aksam: 'Maghrib', yatsi: 'Isyak' },
  buyuk: { imsak: 'SUBUH', gunes: 'SYURUK', ogle: 'ZOHOR', ikindi: 'ASAR', aksam: 'MAGHRIB', yatsi: 'ISYAK' },
  kucuk: { imsak: 'Subuh', gunes: 'Syuruk', ogle: 'Zohor', ikindi: 'Asar', aksam: 'Maghrib', yatsi: 'Isyak' },
  imsakVakti: 'Imsak',
  cuma: 'Jumaat',
  cumaKucuk: 'Jumaat',
  gunesDogusu: 'Matahari terbit',
  gunesDogusuKucuk: 'matahari terbit',
  durum: { kilindi: 'Ditunaikan', vaktiGeldi: 'Sudah masuk waktu', girmedi: 'Belum masuk waktu', gecti: 'Belum ditunaikan' },
  durumKucuk: { kilindi: 'ditunaikan', vaktiGeldi: 'sudah masuk waktu', girmedi: 'belum masuk waktu', gecti: 'belum ditunaikan' },
  eylem: { kildim: 'Sudah solat', kilindi: 'Ditunaikan' },
  kerahatVakti: 'Waktu makruh',
  isaretle: 'Tandakan sebagai ditunaikan',
  geriAlEtiketi: '{durum}, ketik untuk membatalkan',
  geriAlindi: 'Tanda dibuang',
};
