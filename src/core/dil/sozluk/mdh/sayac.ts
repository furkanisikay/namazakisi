import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Countdown nu sambayang',
    kanalAciklama: 'Notification a countdown sa unaan nu kalipus nu waktu nu sambayang',
    baslik: '⏱️ Sambayang a {ad}',
    govde: 'Malipus den su waktu nu {ad}.',
  },
  canli: {
    vakitGovde: 'Nasama a timpu taman sa kalipus nu {ad}',
    cumaBaslik: "🕌 Sambayang sa Jum'at",
    cumaGovde: 'Nasama a timpu taman sa Dhuhur (su khutbah)',
    nafileGovde: 'Nasama a timpu taman sa kalipus nu {ad}',
  },
  iftar: {
    kanal: 'Countdown nu iftar',
    kanalAciklama: 'Notification a countdown taman sa waktu nu iftar',
    baslik: '🌙 Countdown nu iftar',
    govde: 'Di nu ibuka su puwasa nu sa di pan makineg su bang.',
    girdiBaslik: '🌙 Waktu den nu iftar',
    girdiGovde: 'Mabarakat a iftar.',
    girdiUzun: 'Mabarakat a iftar.\n\n⚠️ Di nu ibuka su puwasa nu sa di pan makineg su bang. Tademi kami kanu manga duwa nu :)',
  },
  sahur: {
    kanal: 'Countdown nu sahur',
    kanalAciklama: 'Notification a countdown taman sa kalipus nu sahur (Subuh)',
    baslik: '🌙 Countdown nu sahur',
    govde: 'Makakan kanu pan endu makainum; masiken den su kapuwasa.',
    girdiBaslik: '🌙 Nalipus den su waktu nu sahur',
    girdiGovde: 'Waktu den nu kaniyat.',
    girdiUzun: 'Nakawma den su waktu nu Subuh; di nu kalipatan su niyat nu.\n\n⚠️ Makasambayang kanu den sa Subuh. Tademi kami kanu manga duwa nu :)',
  },
  seri: {
    kanal: 'Countdown nu kasunud-sunud',
    kanalAciklama: 'Countdown taman sa kalipus nu gay nu kasunud-sunud',
    baslik: '🔥 Mawala su kasunud-sunud nu',
    govde: 'Da pan nasampay su manga sambayang saguna a gay; di nu pakawalaa su kasunud-sunud nu.',
    girdiBaslik: '🔥 Nalipus su gay nu kasunud-sunud',
    girdiGovde: 'Nakawma su bagu a gay.',
  },
};
