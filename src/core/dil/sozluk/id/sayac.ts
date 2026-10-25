import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Hitung mundur waktu salat',
    kanalAciklama: 'Notifikasi hitung mundur sebelum waktu salat berakhir',
    baslik: '⏱️ Salat {ad}',
    govde: 'Waktu salat {ad} hampir habis.',
  },
  canli: {
    vakitGovde: 'Sisa waktu hingga {ad} berakhir',
    cumaBaslik: '🕌 Salat Jumat',
    cumaGovde: 'Sisa waktu hingga Dzuhur (khotbah)',
    nafileGovde: 'Sisa waktu hingga {ad} berakhir',
  },
  iftar: {
    kanal: 'Hitung mundur berbuka',
    kanalAciklama: 'Notifikasi hitung mundur menuju waktu berbuka',
    baslik: '🌙 Hitung mundur berbuka',
    govde: 'Jangan berbuka sebelum mendengar azan.',
    girdiBaslik: '🌙 Waktu berbuka',
    girdiGovde: 'Selamat berbuka puasa.',
    girdiUzun: 'Selamat berbuka puasa.\n\n⚠️ Jangan berbuka sebelum mendengar azan. Jangan lupa doakan kami juga :)',
  },
  sahur: {
    kanal: 'Hitung mundur sahur',
    kanalAciklama: 'Notifikasi hitung mundur menuju akhir sahur (Subuh)',
    baslik: '🌙 Hitung mundur sahur',
    govde: 'Masih bisa makan dan minum; puasa segera dimulai.',
    girdiBaslik: '🌙 Waktu sahur berakhir',
    girdiGovde: 'Saatnya berniat puasa.',
    girdiUzun: 'Waktu Subuh sudah masuk; jangan lupa berniat puasa.\n\n⚠️ Anda kini dapat menunaikan salat Subuh. Jangan lupa doakan kami juga :)',
  },
  seri: {
    kanal: 'Hitung mundur runtunan',
    kanalAciklama: 'Hitung mundur hingga hari runtunan berakhir',
    baslik: '🔥 Runtunan Anda terancam',
    govde: 'Salat hari ini belum lengkap; jangan sampai runtunan Anda terputus.',
    girdiBaslik: '🔥 Hari runtunan berakhir',
    girdiGovde: 'Hari baru telah dimulai.',
  },
};
