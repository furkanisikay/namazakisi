import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Kiraan detik waktu',
    kanalAciklama: 'Pemberitahuan kiraan detik sebelum waktu solat tamat',
    baslik: '⏱️ Solat {ad}',
    govde: 'Waktu {ad} hampir tamat.',
  },
  canli: {
    vakitGovde: 'Baki masa sehingga waktu {ad} tamat',
    cumaBaslik: '🕌 Solat Jumaat',
    cumaGovde: 'Baki masa sehingga Zohor (khutbah)',
    nafileGovde: 'Baki masa sehingga waktu {ad} tamat',
  },
  iftar: {
    kanal: 'Kiraan detik berbuka',
    kanalAciklama: 'Pemberitahuan kiraan detik ke waktu berbuka',
    baslik: '🌙 Kiraan detik berbuka',
    govde: 'Jangan berbuka sebelum anda mendengar azan.',
    girdiBaslik: '🌙 Waktu berbuka',
    girdiGovde: 'Selamat berbuka puasa.',
    girdiUzun: 'Selamat berbuka puasa.\n\n⚠️ Jangan berbuka sebelum anda mendengar azan. Doakan kami juga dalam doa anda :)',
  },
  sahur: {
    kanal: 'Kiraan detik sahur',
    kanalAciklama: 'Pemberitahuan kiraan detik ke waktu Imsak (tamat sahur)',
    baslik: '🌙 Kiraan detik sahur',
    govde: 'Anda masih boleh makan dan minum; Imsak semakin hampir.',
    girdiBaslik: '🌙 Waktu sahur telah tamat',
    girdiGovde: 'Sudah tiba masa untuk berniat.',
    girdiUzun: 'Telah masuk waktu Imsak; jangan lupa berniat.\n\n⚠️ Anda kini boleh menunaikan solat Subuh. Doakan kami juga dalam doa anda :)',
  },
  seri: {
    kanal: 'Kiraan detik rentetan',
    kanalAciklama: 'Kiraan detik hingga hari rentetan tamat',
    baslik: '🔥 Rentetan anda berisiko',
    govde: 'Solat hari ini belum lengkap; jangan putuskan rentetan anda.',
    girdiBaslik: '🔥 Hari rentetan telah tamat',
    girdiGovde: 'Hari baharu telah bermula.',
  },
};
