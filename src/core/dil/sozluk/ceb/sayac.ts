import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Countdown sa Salah',
    kanalAciklama: 'Pahibalo nga countdown sa dili pa matapos ang oras sa Salah',
    baslik: '⏱️ Salah sa {ad}',
    govde: 'Hapit na matapos ang oras sa {ad}.',
  },
  canli: {
    vakitGovde: 'Nahabilin nga oras hangtod matapos ang {ad}',
    cumaBaslik: "🕌 Salah sa Jum'ah",
    cumaGovde: 'Nahabilin nga oras hangtod sa Dhuhr (ang khutbah)',
    nafileGovde: 'Nahabilin nga oras hangtod matapos ang {ad}',
  },
  iftar: {
    kanal: 'Countdown sa iftar',
    kanalAciklama: 'Pahibalo nga countdown hangtod sa oras sa iftar',
    baslik: '🌙 Countdown sa iftar',
    govde: 'Ayaw pa ipahunong ang pagpuasa hangtod madungog ang adhan.',
    girdiBaslik: '🌙 Oras na sa iftar',
    girdiGovde: 'Bulahan nga iftar.',
    girdiUzun: 'Bulahan nga iftar.\n\n⚠️ Ayaw pa ipahunong ang pagpuasa hangtod madungog ang adhan. Iapil kami sa inyong mga pag-ampo :)',
  },
  sahur: {
    kanal: 'Countdown sa suhur',
    kanalAciklama: 'Pahibalo nga countdown hangtod matapos ang suhur (Fajr)',
    baslik: '🌙 Countdown sa suhur',
    govde: 'Makakaon ug makainom pa kamo; hapit na magsugod ang pagpuasa.',
    girdiBaslik: '🌙 Natapos na ang oras sa suhur',
    girdiGovde: 'Oras na sa paghimo sa inyong niyyah.',
    girdiUzun: 'Misulod na ang oras sa Fajr; ayaw kalimti ang paghimo sa inyong niyyah.\n\n⚠️ Mahimo na kamong mag-ampo sa Fajr. Iapil kami sa inyong mga pag-ampo :)',
  },
  seri: {
    kanal: 'Countdown sa sunod-sunod',
    kanalAciklama: 'Countdown hangtod matapos ang adlaw sa sunod-sunod',
    baslik: '🔥 Nameligro ang inyong sunod-sunod',
    govde: 'Wala pa makompleto ang mga Salah karong adlawa; ayaw tugoti nga maputol ang sunod-sunod.',
    girdiBaslik: '🔥 Natapos na ang adlaw sa sunod-sunod',
    girdiGovde: 'Nagsugod na ang bag-ong adlaw.',
  },
};
