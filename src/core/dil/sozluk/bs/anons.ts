import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: doğrudan, kısa; "prostrate" yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'left', girisindenItibaren: 'passed' },
  cip: { vakit: 'Prayer name', sure: 'Minutes', yon: 'left / passed', cuma: "Jumu'ah", yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      '{vakit} time is ending, {süre} minutes left.',
      "Don't miss {vakit}, {süre} minutes left.",
      'Time is running short, {süre} minutes until {vakit} ends.',
    ],
    muhafizGiris: [
      '{vakit} time has begun, {süre} minutes have passed.',
      "Don't delay {vakit}, {süre} minutes have passed.",
      'Time is moving on, stand for {vakit}, it has been {süre} minutes.',
    ],
    nafile: [
      '{vakit} time, {süre} minutes {yön}. A good moment for two rakats.',
      '{vakit} time is on. A good chance to pray two rakats.',
      '{süre} minutes {yön} for {vakit}.',
    ],
    cuma: [
      "{süre} minutes left until Jumu'ah. Get ready and head to the mosque.",
      "Jumu'ah is approaching, {süre} minutes left.",
      "Catch the khutbah, {süre} minutes left until Jumu'ah.",
    ],
    camiyeGit: [
      '{süre} minutes left until {vakit}. Head to the mosque.',
      'Time to go to the mosque, {süre} minutes until {vakit}.',
      'Head to the mosque for {vakit}.',
    ],
    yatis: ['Pray Isha before you go to bed.', 'Isha time is still on, stand for prayer before you sleep.', "Don't sleep before you pray Isha."],
    takvim: [
      'An event in your calendar falls during {vakit} time.',
      "{vakit} time clashes with an event; don't forget to pray first.",
      "In {süre} minutes {vakit} time clashes with your event; don't forget your prayer.",
    ],
  },
  otomatik: {
    cuma: "{sure} until Dhuhr for Jumu'ah. Get ready and head to the mosque.",
    camiyeGiris: '{sure} until {vakit}.',
    camiyeHazirlan: 'Get ready and head to the mosque.',
    camiyeYola: 'Head to the mosque.',
    takvimGiris: 'An event in your calendar falls during {vakit} time.',
    takvimOnce: "Don't forget to pray before the event.",
    takvimKaplar: "Don't forget to take a break and pray.",
    yatsi: 'Pray Isha before you go to bed.',
    muhasebeTek: '{vakit} looks unmarked today.',
    muhasebeCoklu: cogul({ one: '{n} prayer looks unmarked today.', few: '{n} prayers look unmarked today.', other: '{n} prayers look unmarked today.' }),
    geceCapasi: 'Quiet hours start in {süre} minutes. Pray {vakit} before you go to bed.',
    kuslukSuruyor: 'Duha time is on.',
    kuslukGirdi: 'Duha time has begun. A good moment for two rakats.',
    kuslukBitiyor: cogul({ one: '{n} minute left in Duha time.', few: '{n} minutes left in Duha time.', other: '{n} minutes left in Duha time.' }),
    evvabinSuruyor: 'There is still time for Awwabin.',
    evvabinGirdi: 'Awwabin time. A good moment for two rakats.',
    evvabinKalan: cogul({ one: '{n} minute left for Awwabin.', few: '{n} minutes left for Awwabin.', other: '{n} minutes left for Awwabin.' }),
    teheccudSonUcte: 'Tahajjud time. The last third of the night has begun.',
    teheccudKalan: cogul({ one: 'Tahajjud time. {n} minute left until Fajr.', few: 'Tahajjud time. {n} minutes left until Fajr.', other: 'Tahajjud time. {n} minutes left until Fajr.' }),
  },
};
