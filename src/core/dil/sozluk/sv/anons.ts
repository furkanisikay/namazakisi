import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: "du", doğrudan, kısa; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'kvar', girisindenItibaren: 'har gått' },
  cip: { vakit: 'Bönens namn', sure: 'Minuter', yon: 'kvar / har gått', cuma: 'Fredagsbön', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Tiden för {vakit} tar slut, {süre} minuter kvar.',
      'Missa inte {vakit}, {süre} minuter kvar.',
      'Tiden börjar ta slut, {süre} minuter tills {vakit} slutar.',
    ],
    muhafizGiris: [
      'Tiden för {vakit} har börjat, {süre} minuter har gått.',
      'Skjut inte upp {vakit}, {süre} minuter har gått.',
      'Tiden går, förrätta {vakit}, det har gått {süre} minuter.',
    ],
    nafile: [
      'Tid för {vakit}, {süre} minuter {yön}. Ett bra tillfälle för två rakat.',
      'Det är tid för {vakit}. Ett bra tillfälle att be två rakat.',
      '{süre} minuter {yön} för {vakit}.',
    ],
    cuma: [
      '{süre} minuter kvar till fredagsbönen. Gör dig redo och bege dig till moskén.',
      'Fredagsbönen närmar sig, {süre} minuter kvar.',
      'Hinn till khutban, {süre} minuter kvar till fredagsbönen.',
    ],
    camiyeGit: [
      '{süre} minuter kvar till {vakit}. Bege dig till moskén.',
      'Dags att gå till moskén, {süre} minuter till {vakit}.',
      'Bege dig till moskén för {vakit}.',
    ],
    yatis: ['Be Isha innan du går och lägger dig.', 'Tiden för Isha pågår fortfarande, förrätta bönen innan du sover.', 'Sov inte innan du har bett Isha.'],
    takvim: [
      'En händelse i din kalender infaller under tiden för {vakit}.',
      'Tiden för {vakit} krockar med en händelse; glöm inte att be först.',
      'Om {süre} minuter krockar tiden för {vakit} med din händelse; glöm inte din bön.',
    ],
  },
  otomatik: {
    cuma: '{sure} till Dhuhr för fredagsbönen. Gör dig redo och bege dig till moskén.',
    camiyeGiris: '{sure} till {vakit}.',
    camiyeHazirlan: 'Gör dig redo och bege dig till moskén.',
    camiyeYola: 'Bege dig till moskén.',
    takvimGiris: 'En händelse i din kalender infaller under tiden för {vakit}.',
    takvimOnce: 'Glöm inte att be före händelsen.',
    takvimKaplar: 'Glöm inte att ta en paus och be.',
    yatsi: 'Be Isha innan du går och lägger dig.',
    muhasebeTek: '{vakit} verkar inte vara markerad i dag.',
    muhasebeCoklu: cogul({ one: '{n} bön verkar inte vara markerad i dag.', other: '{n} böner verkar inte vara markerade i dag.' }),
    geceCapasi: 'Den tysta perioden börjar om {süre} minuter. Be {vakit} innan du går och lägger dig.',
    kuslukSuruyor: 'Det är tid för Duha.',
    kuslukGirdi: 'Tiden för Duha har börjat. Ett bra tillfälle för två rakat.',
    kuslukBitiyor: cogul({ one: '{n} minut kvar av tiden för Duha.', other: '{n} minuter kvar av tiden för Duha.' }),
    evvabinSuruyor: 'Det finns fortfarande tid för Awwabin.',
    evvabinGirdi: 'Tid för Awwabin. Ett bra tillfälle för två rakat.',
    evvabinKalan: cogul({ one: '{n} minut kvar för Awwabin.', other: '{n} minuter kvar för Awwabin.' }),
    teheccudSonUcte: 'Tid för Tahajjud. Nattens sista tredjedel har börjat.',
    teheccudKalan: cogul({ one: 'Tid för Tahajjud. {n} minut kvar till Fajr.', other: 'Tid för Tahajjud. {n} minuter kvar till Fajr.' }),
  },
};
