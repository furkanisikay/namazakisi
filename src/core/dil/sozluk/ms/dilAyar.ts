import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Bahasa · Language',
  aciklama: 'Pilih bahasa aplikasi. Pemberitahuan dan bacaan suara juga menggunakan bahasa ini.',
  grup: 'Bahasa aplikasi',
  dilAdlari: {
    tr: 'Bahasa Turki',
    en: 'Bahasa Inggeris',
    id: 'Bahasa Indonesia',
    de: 'Bahasa Jerman',
    fr: 'Bahasa Perancis',
    bs: 'Bahasa Bosnia',
    ru: 'Bahasa Rusia',
    ms: 'Bahasa Melayu',
  },
  cihazDili: 'Bahasa peranti',
  cihazDiliKullaniliyor: 'Kini {ad}',
  cihazDiliDesteklenmiyor: 'Bahasa peranti anda belum tersedia; bahasa Turki digunakan.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Terjemahan beta sedang disemak; sesetengah teks mungkin kurang tepat.',
    vakit: 'Bahasa tidak mengubah cara waktu solat dikira.',
    nass: 'Dalam bahasa selain bahasa Turki, hanya terjemahan ayat al-Quran dipaparkan; teks hadis tidak dipaparkan kerana ia datang daripada sumber berbahasa Turki.',
  },
  ozelAnons: {
    baslik: 'Teks bacaan suara yang anda tulis',
    govde: cogul({ other: '{n} teks bacaan suara yang anda tulis masih dalam bahasa sebelumnya. Gantikan dengan teks sedia ada dalam bahasa baharu?' }),
    degistir: 'Ganti dengan teks sedia ada',
    koru: 'Biarkan seperti asal',
    degisti: cogul({ other: '{n} teks telah diganti.' }),
  },
  kaydedilemedi: 'Bahasa tidak dapat disimpan. Cuba lagi.',
  sihirbazBaglantisi: 'Bahasa · Language',
  sihirbazBaglantisiAciklama: 'Tukar bahasa aplikasi',
};
