import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: "Sie" + kısa, doğrudan emir; "bitte" ve "niederwerfen" yok. Vakit adı
 * çekimsiz yerleşir ("bis {vakit}", "{vakit} hat begonnen"). Sıra Türkçe şablonlarla BİREBİR eşleşir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'übrig', girisindenItibaren: 'vergangen' },
  cip: { vakit: 'Gebetsname', sure: 'Minuten', yon: 'übrig / vergangen', cuma: 'Freitagsgebet', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      '{vakit} endet bald, noch {süre} Minuten.',
      'Verpassen Sie {vakit} nicht, noch {süre} Minuten.',
      'Die Zeit wird knapp, noch {süre} Minuten für {vakit}.',
    ],
    muhafizGiris: [
      '{vakit} hat begonnen, {süre} Minuten sind vergangen.',
      'Schieben Sie {vakit} nicht auf, {süre} Minuten sind schon vergangen.',
      'Die Zeit vergeht. Auf zum Gebet, {vakit} läuft seit {süre} Minuten.',
    ],
    nafile: [
      '{vakit}, {süre} Minuten {yön}. Ein guter Moment für zwei Rakat.',
      '{vakit} läuft noch. Eine gute Gelegenheit, zwei Rakat zu beten.',
      'Für {vakit}: {süre} Minuten {yön}.',
    ],
    cuma: [
      'Noch {süre} Minuten bis zum Freitagsgebet. Machen Sie sich bereit und brechen Sie zur Moschee auf.',
      'Das Freitagsgebet rückt näher, noch {süre} Minuten.',
      'Seien Sie zur Predigt da, noch {süre} Minuten bis zum Freitagsgebet.',
    ],
    camiyeGit: [
      'Noch {süre} Minuten bis {vakit}. Machen Sie sich auf den Weg zur Moschee.',
      'Zeit für die Moschee, noch {süre} Minuten bis {vakit}.',
      'Machen Sie sich für {vakit} auf den Weg zur Moschee.',
    ],
    yatis: [
      'Beten Sie Isha, bevor Sie schlafen gehen.',
      'Die Isha-Zeit läuft noch, beten Sie vor dem Einschlafen.',
      'Schlafen Sie nicht, bevor Sie Isha gebetet haben.',
    ],
    takvim: [
      'Ein Termin in Ihrem Kalender fällt in die Zeit von {vakit}.',
      'Die Zeit von {vakit} überschneidet sich mit einem Termin; vergessen Sie nicht, vorher zu beten.',
      'In {süre} Minuten überschneidet sich {vakit} mit Ihrem Termin; vergessen Sie das Gebet nicht.',
    ],
  },
  otomatik: {
    cuma: 'Noch {sure} bis zum Freitagsgebet. Machen Sie sich bereit und brechen Sie zur Moschee auf.',
    camiyeGiris: 'Noch {sure} bis {vakit}.',
    camiyeHazirlan: 'Machen Sie sich bereit und brechen Sie zur Moschee auf.',
    camiyeYola: 'Machen Sie sich auf den Weg zur Moschee.',
    takvimGiris: 'Ein Termin in Ihrem Kalender fällt in die Zeit von {vakit}.',
    takvimOnce: 'Vergessen Sie nicht, vor dem Termin zu beten.',
    takvimKaplar: 'Vergessen Sie nicht, eine Pause zu machen und zu beten.',
    yatsi: 'Beten Sie Isha, bevor Sie schlafen gehen.',
    muhasebeTek: '{vakit} ist heute offenbar nicht markiert.',
    muhasebeCoklu: cogul({ one: '{n} Gebet ist heute offenbar nicht markiert.', other: '{n} Gebete sind heute offenbar nicht markiert.' }),
    geceCapasi: 'Noch {süre} Minuten bis zur Nachtruhe. Beten Sie {vakit}, bevor Sie schlafen gehen.',
    kuslukSuruyor: 'Die Duha-Zeit läuft noch.',
    kuslukGirdi: 'Die Duha-Zeit hat begonnen. Ein guter Moment für zwei Rakat.',
    kuslukBitiyor: cogul({ one: 'Die Duha-Zeit endet in {n} Minute.', other: 'Die Duha-Zeit endet in {n} Minuten.' }),
    evvabinSuruyor: 'Für Awwabin ist noch Zeit.',
    evvabinGirdi: 'Awwabin-Zeit. Ein guter Moment für zwei Rakat.',
    evvabinKalan: cogul({ one: 'Noch {n} Minute für Awwabin.', other: 'Noch {n} Minuten für Awwabin.' }),
    teheccudSonUcte: 'Tahajjud-Zeit. Das letzte Drittel der Nacht hat begonnen.',
    teheccudKalan: cogul({ one: 'Tahajjud-Zeit. Noch {n} Minute bis Fajr.', other: 'Tahajjud-Zeit. Noch {n} Minuten bis Fajr.' }),
  },
};
