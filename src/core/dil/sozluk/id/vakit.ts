import type { Sozluk } from '../tr';

/**
 * Vakit adları Kemenag yazımıyla (bimasislam.kemenag.go.id/jadwalshalat). Özel ad sayılır;
 * cümle içinde de büyük harfle başlar ("Terbit" hariç: cümle içinde "terbit").
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subuh', gunes: 'Terbit', ogle: 'Dzuhur', ikindi: 'Ashar', aksam: 'Maghrib', yatsi: 'Isya' },
  buyuk: { imsak: 'SUBUH', gunes: 'TERBIT', ogle: 'DZUHUR', ikindi: 'ASHAR', aksam: 'MAGHRIB', yatsi: 'ISYA' },
  kucuk: { imsak: 'Subuh', gunes: 'terbit', ogle: 'Dzuhur', ikindi: 'Ashar', aksam: 'Maghrib', yatsi: 'Isya' },
  imsakVakti: 'Imsak',
  cuma: 'Jumat',
  cumaKucuk: 'Jumat',
  gunesDogusu: 'Matahari terbit',
  gunesDogusuKucuk: 'matahari terbit',
  durum: { kilindi: 'Ditunaikan', vaktiGeldi: 'Sudah masuk waktu', girmedi: 'Belum masuk waktu', gecti: 'Tidak ditunaikan' },
  durumKucuk: { kilindi: 'ditunaikan', vaktiGeldi: 'sudah masuk waktu', girmedi: 'belum masuk waktu', gecti: 'tidak ditunaikan' },
  eylem: { kildim: 'Sudah salat', kilindi: 'Ditunaikan' },
  kerahatVakti: 'Waktu makruh',
  isaretle: 'Tandai sudah ditunaikan',
  geriAlEtiketi: '{durum}, ketuk untuk membatalkan',
  geriAlindi: 'Tanda dihapus',
};
