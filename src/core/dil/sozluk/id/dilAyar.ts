import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Bahasa · Dil',
  aciklama: 'Pilih bahasa aplikasi. Notifikasi dan pembacaan suara juga menggunakan bahasa ini.',
  grup: 'Bahasa aplikasi',
  dilAdlari: {
    tr: 'Bahasa Turki',
    en: 'Bahasa Inggris',
    id: 'Bahasa Indonesia',
    de: 'Bahasa Jerman',
    fr: 'Bahasa Prancis',
    bs: 'Bahasa Bosnia',
    ru: 'Bahasa Rusia',
    ms: 'Bahasa Melayu',
    ar: 'Bahasa Arab',
    ur: 'Bahasa Urdu',
  },
  cihazDili: 'Bahasa perangkat',
  cihazDiliKullaniliyor: 'Saat ini {ad}',
  cihazDiliDesteklenmiyor: 'Bahasa perangkat Anda belum tersedia; bahasa Turki digunakan.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Terjemahan beta sedang ditinjau; sebagian teks mungkin belum sempurna.',
    vakit: 'Bahasa tidak mengubah perhitungan waktu salat.',
    nass: "Dalam bahasa selain Turki, hanya terjemahan ayat Al-Qur'an yang ditampilkan; teks hadis tidak ditampilkan karena berasal dari sumber berbahasa Turki.",
  },
  ozelAnons: {
    baslik: 'Teks pembacaan suara yang Anda tulis',
    govde: cogul({ other: '{n} teks pembacaan suara yang Anda tulis masih dalam bahasa sebelumnya. Ganti dengan teks siap pakai dalam bahasa baru?' }),
    degistir: 'Ganti dengan teks siap pakai',
    koru: 'Biarkan apa adanya',
    degisti: cogul({ other: '{n} teks telah diganti.' }),
  },
  vakitAdlari: {
    baslik: 'Nama waktu salat',
    aciklama: 'Pilih cara penamaan waktu salat.',
    otomatik: 'Sesuai negara',
    otomatikAciklama: 'Memakai nama yang umum di negara lokasi Anda.',
    takimlar: { temel: 'Nama Arab', diyanetDe: 'Diyanet (Jerman)', turkce: 'Nama Turki', magrip: 'Ejaan Maghribi', cezayir: 'Ejaan Aljazair' },
  },
  kaydedilemedi: 'Bahasa tidak dapat disimpan. Coba lagi.',
  sihirbazBaglantisi: 'Bahasa · Dil',
  sihirbazBaglantisiAciklama: 'Ubah bahasa aplikasi',
};
