import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: zamirsiz kısa emir, secde yok, kısaltma yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'nahabilin', girisindenItibaren: 'milabay' },
  cip: { vakit: 'Ngalan sa Salah', sure: 'Minuto', yon: 'nahabilin / milabay', cuma: "Jum'ah", yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Hapit na matapos ang oras sa {vakit}, {süre} ka minuto na lang ang nahabilin.',
      'Ayaw palabya ang {vakit}, {süre} ka minuto na lang ang nahabilin.',
      'Nagkadiyot na ang oras, {süre} ka minuto na lang una matapos ang {vakit}.',
    ],
    muhafizGiris: [
      'Misulod na ang oras sa {vakit}, {süre} ka minuto na ang milabay.',
      'Ayaw langana ang {vakit}, {süre} ka minuto na ang milabay.',
      'Nagpadayon ang oras, barog alang sa {vakit}, {süre} ka minuto na.',
    ],
    nafile: [
      'Oras sa {vakit}, {süre} ka minuto ang {yön}. Maayong higayon alang sa duha ka rak\'ah.',
      'Nagpadayon ang oras sa {vakit}. Maayong higayon sa pag-ampo og duha ka rak\'ah.',
      '{süre} ka minuto ang {yön} alang sa {vakit}.',
    ],
    cuma: [
      "{süre} ka minuto na lang hangtod sa Jum'ah. Pangandam ug adto sa masjid.",
      "Hapit na ang Jum'ah, {süre} ka minuto na lang ang nahabilin.",
      "Abti ang khutbah, {süre} ka minuto na lang hangtod sa Jum'ah.",
    ],
    camiyeGit: [
      '{süre} ka minuto na lang hangtod sa {vakit}. Adto na sa masjid.',
      'Oras na sa pag-adto sa masjid, {süre} ka minuto hangtod sa {vakit}.',
      'Adto sa masjid alang sa {vakit}.',
    ],
    yatis: ['Mag-ampo sa Isha una matulog.', 'Nagpadayon pa ang oras sa Isha, barog alang sa Salah una matulog.', 'Ayaw pagkatulog nga wala pa makaampo sa Isha.'],
    takvim: [
      'Usa ka kalihokan sa inyong kalendaryo nahitabo sa oras sa {vakit}.',
      'Nagsumpaki ang oras sa {vakit} ug usa ka kalihokan; ayaw kalimti nga mag-ampo una.',
      'Sulod sa {süre} ka minuto, magsumpaki ang oras sa {vakit} ug ang inyong kalihokan; ayaw kalimti ang inyong Salah.',
    ],
  },
  otomatik: {
    cuma: "{sure} hangtod sa Dhuhr alang sa Jum'ah. Pangandam ug adto sa masjid.",
    camiyeGiris: '{sure} hangtod sa {vakit}.',
    camiyeHazirlan: 'Pangandam ug adto sa masjid.',
    camiyeYola: 'Adto na sa masjid.',
    takvimGiris: 'Usa ka kalihokan sa inyong kalendaryo nahitabo sa oras sa {vakit}.',
    takvimOnce: 'Ayaw kalimti nga mag-ampo una sa kalihokan.',
    takvimKaplar: 'Ayaw kalimti nga mopahulay kadiyot ug mag-ampo.',
    yatsi: 'Mag-ampo sa Isha una matulog.',
    muhasebeTek: 'Ang {vakit} morag wala pa mamarkahi karong adlawa.',
    muhasebeCoklu: cogul({ one: '{n} ka Salah morag wala pa mamarkahi karong adlawa.', other: '{n} ka Salah morag wala pa mamarkahi karong adlawa.' }),
    geceCapasi: 'Magsugod ang hilom nga oras sulod sa {süre} ka minuto. Mag-ampo sa {vakit} una matulog.',
    kuslukSuruyor: 'Nagpadayon ang oras sa Duha.',
    kuslukGirdi: "Misulod na ang oras sa Duha. Maayong higayon alang sa duha ka rak'ah.",
    kuslukBitiyor: cogul({ one: '{n} ka minuto na lang ang nahabilin sa oras sa Duha.', other: '{n} ka minuto na lang ang nahabilin sa oras sa Duha.' }),
    evvabinSuruyor: 'Aduna pay oras alang sa Awwabin.',
    evvabinGirdi: "Oras sa Awwabin. Maayong higayon alang sa duha ka rak'ah.",
    evvabinKalan: cogul({ one: '{n} ka minuto na lang ang nahabilin alang sa Awwabin.', other: '{n} ka minuto na lang ang nahabilin alang sa Awwabin.' }),
    teheccudSonUcte: 'Oras sa Tahajjud. Nagsugod na ang katapusang ikatulo sa gabii.',
    teheccudKalan: cogul({ one: 'Oras sa Tahajjud. {n} ka minuto na lang hangtod sa Fajr.', other: 'Oras sa Tahajjud. {n} ka minuto na lang hangtod sa Fajr.' }),
  },
};
