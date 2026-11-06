import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: mealin çoğul emri ("Edsambayang kanu", QE 2:45; "tindeg kanu"), kısa;
 * secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. Dakika "minutu" (sayıyla çekilmez).
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'nasama', girisindenItibaren: 'nalipus' },
  cip: { vakit: 'Ingalan nu sambayang', sure: 'Minutu', yon: 'nasama / nalipus', cuma: "Jum'at", yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Malipus den su waktu nu {vakit}, {süre} minutu pan i nasama.',
      'Di nu pakalipasa su {vakit}, {süre} minutu pan i nasama.',
      'Masiken den su kalipus, {süre} minutu pan taman sa kalipus nu {vakit}.',
    ],
    muhafizGiris: [
      'Nakawma su waktu nu {vakit}, {süre} minutu den i nalipus.',
      'Edsambayang kanu den sa {vakit}, {süre} minutu den i nalipus.',
      'Pedlipus su timpu, tindeg kanu sa {vakit}, {süre} minutu den.',
    ],
    nafile: [
      'Waktu nu {vakit}, {süre} minutu {yön}. Mapya a waktu para sa dua a rakaat.',
      'Waktu pan nu {vakit}. Mapya a timpu para makasambayang sa dua a rakaat.',
      '{süre} minutu {yön} para sa {vakit}.',
    ],
    cuma: [
      "{süre} minutu pan taman sa Jum'at. Magkahanda kanu endu lumakaw sa masjid.",
      "Masiken den su Jum'at, {süre} minutu pan i nasama.",
      "Sampayan nu su khutbah, {süre} minutu pan taman sa Jum'at.",
    ],
    camiyeGit: [
      '{süre} minutu pan taman sa {vakit}. Lumakaw kanu sa masjid.',
      'Waktu den para lumakaw sa masjid, {süre} minutu pan taman sa {vakit}.',
      'Lumakaw kanu sa masjid para sa {vakit}.',
    ],
    yatis: [
      'Edsambayang kanu sa Isha sa di pan matulug.',
      'Waktu pan nu Isha, tindeg kanu sa sambayang sa di pan matulug.',
      'Di kanu matulug sa di pan makasambayang sa Isha.',
    ],
    takvim: [
      'Isa a event sa kalendaryo nu na sa waktu nu {vakit}.',
      'Pedsugat su waktu nu {vakit} endu su event; di nu kalipatan i edsambayang pan.',
      'Sa {süre} minutu, pedsugat su waktu nu {vakit} endu su event nu; di nu kalipatan su sambayang nu.',
    ],
  },
  otomatik: {
    cuma: "{sure} pan taman sa Dhuhur para sa Jum'at. Magkahanda kanu endu lumakaw sa masjid.",
    camiyeGiris: '{sure} pan taman sa {vakit}.',
    camiyeHazirlan: 'Magkahanda kanu endu lumakaw sa masjid.',
    camiyeYola: 'Lumakaw kanu sa masjid.',
    takvimGiris: 'Isa a event sa kalendaryo nu na sa waktu nu {vakit}.',
    takvimOnce: 'Di nu kalipatan i edsambayang sa di pan su event.',
    takvimKaplar: 'Di nu kalipatan i tumagak endu edsambayang.',
    yatsi: 'Edsambayang kanu sa Isha sa di pan matulug.',
    muhasebeTek: 'Da pan natandaan su {vakit} saguna a gay.',
    muhasebeCoklu: cogul({ one: '{n} a sambayang i da pan natandaan saguna a gay.', other: '{n} a sambayang i da pan natandaan saguna a gay.' }),
    geceCapasi: 'Magpamula su manga oras a da suara sa {süre} minutu. Edsambayang kanu sa {vakit} sa di pan matulug.',
    kuslukSuruyor: 'Waktu pan nu Duha.',
    kuslukGirdi: 'Nakawma su waktu nu Duha. Mapya a waktu para sa dua a rakaat.',
    kuslukBitiyor: cogul({ one: '{n} minutu pan i nasama sa waktu nu Duha.', other: '{n} minutu pan i nasama sa waktu nu Duha.' }),
    evvabinSuruyor: 'Aden pan timpu para sa Awwabin.',
    evvabinGirdi: 'Waktu nu Awwabin. Mapya a waktu para sa dua a rakaat.',
    evvabinKalan: cogul({ one: '{n} minutu pan i nasama para sa Awwabin.', other: '{n} minutu pan i nasama para sa Awwabin.' }),
    teheccudSonUcte: 'Waktu nu Tahajjud. Nakawma su ulyanan a ikatelu nu magabi.',
    teheccudKalan: cogul({ one: 'Waktu nu Tahajjud. {n} minutu pan taman sa Subuh.', other: 'Waktu nu Tahajjud. {n} minutu pan taman sa Subuh.' }),
  },
};
