import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Countdown sa dasal',
    kanalAciklama: 'Notification ng countdown bago matapos ang oras ng dasal',
    baslik: '⏱️ Dasal na {ad}',
    govde: 'Malapit nang matapos ang oras ng {ad}.',
  },
  canli: {
    vakitGovde: 'Natitirang oras bago matapos ang {ad}',
    cumaBaslik: "🕌 Dasal na Jumu'ah",
    cumaGovde: 'Natitirang oras bago ang Dhuhr (ang sermon)',
    nafileGovde: 'Natitirang oras bago matapos ang {ad}',
  },
  iftar: {
    kanal: 'Countdown sa iftar',
    kanalAciklama: 'Notification ng countdown hanggang sa oras ng iftar',
    baslik: '🌙 Countdown sa iftar',
    govde: "Huwag magbukas ng ayuno hangga't hindi naririnig ang adhan.",
    girdiBaslik: '🌙 Oras na ng iftar',
    girdiGovde: 'Mapagpalang iftar.',
    girdiUzun: "Mapagpalang iftar.\n\n⚠️ Huwag magbukas ng ayuno hangga't hindi naririnig ang adhan. Isama kami sa inyong mga panalangin :)",
  },
  sahur: {
    kanal: 'Countdown sa sahur',
    kanalAciklama: 'Notification ng countdown hanggang sa katapusan ng sahur (Fajr)',
    baslik: '🌙 Countdown sa sahur',
    govde: 'Makakakain at makakainom pa kayo; malapit nang magsimula ang ayuno.',
    girdiBaslik: '🌙 Tapos na ang oras ng sahur',
    girdiGovde: 'Oras na para gawin ang inyong niyyah.',
    girdiUzun: 'Pumasok na ang oras ng Fajr; huwag kalimutang gawin ang inyong niyyah.\n\n⚠️ Maaari na ninyong idasal ang Fajr. Isama kami sa inyong mga panalangin :)',
  },
  seri: {
    kanal: 'Countdown sa sunod-sunod',
    kanalAciklama: 'Countdown hanggang sa katapusan ng araw ng sunod-sunod',
    baslik: '🔥 Nanganganib ang inyong sunod-sunod',
    govde: 'Hindi pa kumpleto ang mga dasal ngayon; huwag mawala ang inyong sunod-sunod.',
    girdiBaslik: '🔥 Tapos na ang araw ng sunod-sunod',
    girdiGovde: 'Nagsimula na ang bagong araw.',
  },
};
