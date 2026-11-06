import type { Sozluk } from '../tr';

/** Vakit adları JAKIM (e-Solat) yazımıyla; özel ad sayılır, cümle içinde de büyük harfle başlar. */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Subuh', gunes: 'Syuruk', ogle: 'Zohor', ikindi: 'Asar', aksam: 'Maghrib', yatsi: 'Isyak' },
  buyuk: { imsak: 'SUBUH', gunes: 'SYURUK', ogle: 'ZOHOR', ikindi: 'ASAR', aksam: 'MAGHRIB', yatsi: 'ISYAK' },
  kucuk: { imsak: 'Subuh', gunes: 'Syuruk', ogle: 'Zohor', ikindi: 'Asar', aksam: 'Maghrib', yatsi: 'Isyak' },
  /** Kemenag/JAKIM'de "Imsak" Subuh'tan ~10 dk önceki ihtiyat saatidir; bizim imsak saatimiz fecirdir (Subuh). */
  imsakVakti: 'Subuh',
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
