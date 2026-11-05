import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Maldos laiko skaitiklis',
    kanalAciklama: 'Atgalinės atskaitos pranešimas prieš baigiantis maldos laikui',
    baslik: '⏱️ {ad} malda',
    govde: '{ad} maldos laikas tuoj baigsis.',
  },
  canli: {
    vakitGovde: 'Iki {ad} maldos laiko pabaigos',
    cumaBaslik: '🕌 Džumua malda',
    cumaGovde: 'Iki Dhuhr laiko (pamokslo)',
    nafileGovde: 'Iki {ad} laiko pabaigos',
  },
  iftar: {
    kanal: 'Iftaro skaitiklis',
    kanalAciklama: 'Atgalinės atskaitos iki iftaro pranešimas',
    baslik: '🌙 Iftaro skaitiklis',
    govde: 'Nenutraukite pasninko, kol neišgirdote azano.',
    girdiBaslik: '🌙 Iftaro metas',
    girdiGovde: 'Palaimingo iftaro.',
    girdiUzun: 'Palaimingo iftaro.\n\n⚠️ Nenutraukite pasninko, kol neišgirdote azano. Prisiminkite mus savo maldose :)',
  },
  sahur: {
    kanal: 'Sahuro skaitiklis',
    kanalAciklama: 'Atgalinės atskaitos iki sahuro pabaigos (Fajr) pranešimas',
    baslik: '🌙 Sahuro skaitiklis',
    govde: 'Dar galite valgyti ir gerti; pasninkas netrukus prasidės.',
    girdiBaslik: '🌙 Sahuro laikas baigėsi',
    girdiGovde: 'Metas pareikšti ketinimą.',
    girdiUzun: 'Prasidėjo Fajr laikas; nepamirškite pareikšti ketinimo.\n\n⚠️ Dabar galite atlikti Fajr maldą. Prisiminkite mus savo maldose :)',
  },
  seri: {
    kanal: 'Serijos skaitiklis',
    kanalAciklama: 'Atgalinė atskaita iki serijos dienos pabaigos',
    baslik: '🔥 Jūsų serijai gresia pavojus',
    govde: 'Šiandienos maldos neužbaigtos; nepraraskite serijos.',
    girdiBaslik: '🔥 Serijos diena baigėsi',
    girdiGovde: 'Prasidėjo nauja diena.',
  },
};
