import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: zamirsiz kısa emir; secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR
 * eşleşir. `{yön}` "natitira/lumipas" → "{süre} minuto ang {yön}" iki yönde de doğal.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'natitira', girisindenItibaren: 'lumipas' },
  cip: { vakit: 'Pangalan ng dasal', sure: 'Minuto', yon: 'natitira / lumipas', cuma: "Jumu'ah", yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Matatapos na ang oras ng {vakit}, {süre} minuto na lang.',
      'Huwag palampasin ang {vakit}, {süre} minuto na lang.',
      'Kumikitid na ang oras, {süre} minuto bago matapos ang {vakit}.',
    ],
    muhafizGiris: [
      'Pumasok na ang oras ng {vakit}, {süre} minuto na ang lumipas.',
      'Huwag ipagpaliban ang {vakit}, {süre} minuto na ang lumipas.',
      'Lumilipas ang oras, magdasal na ng {vakit}, {süre} minuto na.',
    ],
    nafile: [
      "Oras ng {vakit}, {süre} minuto ang {yön}. Magandang sandali para sa dalawang rak'ah.",
      "Oras na ng {vakit}. Magandang pagkakataon para magdasal ng dalawang rak'ah.",
      '{süre} minuto ang {yön} para sa {vakit}.',
    ],
    cuma: [
      "{süre} minuto pa bago ang Jumu'ah. Maghanda at pumunta sa masjid.",
      "Malapit na ang Jumu'ah, {süre} minuto na lang.",
      "Abutan ang sermon, {süre} minuto pa bago ang Jumu'ah.",
    ],
    camiyeGit: [
      '{süre} minuto pa bago ang {vakit}. Pumunta na sa masjid.',
      'Oras nang pumunta sa masjid, {süre} minuto pa bago ang {vakit}.',
      'Pumunta na sa masjid para sa {vakit}.',
    ],
    yatis: ['Idasal ang Isha bago matulog.', 'Hindi pa tapos ang oras ng Isha, magdasal bago matulog.', 'Huwag matulog nang hindi pa naidadasal ang Isha.'],
    takvim: [
      'May event sa inyong kalendaryo sa oras ng {vakit}.',
      'Kasabay ng isang event ang oras ng {vakit}; huwag kalimutang magdasal muna.',
      'Sa loob ng {süre} minuto, kasabay ng inyong event ang oras ng {vakit}; huwag kalimutan ang dasal.',
    ],
  },
  otomatik: {
    cuma: "{sure} pa bago ang Dhuhr para sa Jumu'ah. Maghanda at pumunta sa masjid.",
    camiyeGiris: '{sure} pa bago ang {vakit}.',
    camiyeHazirlan: 'Maghanda at pumunta sa masjid.',
    camiyeYola: 'Pumunta na sa masjid.',
    takvimGiris: 'May event sa inyong kalendaryo sa oras ng {vakit}.',
    takvimOnce: 'Huwag kalimutang magdasal bago ang event.',
    takvimKaplar: 'Huwag kalimutang magpahinga sandali at magdasal.',
    yatsi: 'Idasal ang Isha bago matulog.',
    muhasebeTek: 'Mukhang hindi pa namarkahan ang {vakit} ngayong araw.',
    muhasebeCoklu: cogul({ one: 'Mukhang hindi pa namarkahan ang {n} dasal ngayong araw.', other: 'Mukhang hindi pa namarkahan ang {n} dasal ngayong araw.' }),
    geceCapasi: 'Magsisimula ang tahimik na oras sa loob ng {süre} minuto. Idasal ang {vakit} bago matulog.',
    kuslukSuruyor: 'Oras pa ng Duha.',
    kuslukGirdi: "Pumasok na ang oras ng Duha. Magandang sandali para sa dalawang rak'ah.",
    kuslukBitiyor: cogul({ one: '{n} minuto na lang ang natitira sa oras ng Duha.', other: '{n} minuto na lang ang natitira sa oras ng Duha.' }),
    evvabinSuruyor: 'May oras pa para sa Awwabin.',
    evvabinGirdi: "Oras ng Awwabin. Magandang sandali para sa dalawang rak'ah.",
    evvabinKalan: cogul({ one: '{n} minuto na lang para sa Awwabin.', other: '{n} minuto na lang para sa Awwabin.' }),
    teheccudSonUcte: 'Oras ng Tahajjud. Nagsimula na ang huling ikatlong bahagi ng gabi.',
    teheccudKalan: cogul({ one: 'Oras ng Tahajjud. {n} minuto pa bago ang Fajr.', other: 'Oras ng Tahajjud. {n} minuto pa bago ang Fajr.' }),
  },
};
