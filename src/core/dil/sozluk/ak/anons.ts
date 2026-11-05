import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: yalın tekil kısa emir; secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'aka', girisindenItibaren: 'atwam' },
  cip: { vakit: 'Nyamefrɛ din', sure: 'Sima', yon: 'aka / atwam', cuma: 'Efiada', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      '{vakit} berɛ reba awieɛ, sima {süre} na aka.',
      'Mma {vakit} mfiri wo nsa, sima {süre} na aka.',
      'Berɛ resa, sima {süre} na aka ansa na {vakit} aba awieɛ.',
    ],
    muhafizGiris: [
      '{vakit} berɛ adu, sima {süre} atwam.',
      'Nntwentwɛn {vakit} nan ase, sima {süre} atwam.',
      'Berɛ rekɔ, hyɛ {vakit} Nyamefrɛ ase, sima {süre} atwam.',
    ],
    nafile: [
      '{vakit} berɛ, sima {süre} {yön}. Ɛyɛ berɛ pa ma raka mmienu.',
      '{vakit} berɛ da so wɔ hɔ. Ɛyɛ kwan pa sɛ wobɛyɛ raka mmienu.',
      'Sima {süre} {yön} ma {vakit}.',
    ],
    cuma: [
      'Sima {süre} na aka ansa na Efiada Nyamefrɛ adu. Siesie wo ho na kɔ masjid.',
      'Efiada Nyamefrɛ abɛn, sima {süre} na aka.',
      'Kɔ kotie khutbah no, sima {süre} na aka ansa na Efiada Nyamefrɛ adu.',
    ],
    camiyeGit: [
      'Sima {süre} na aka ansa na {vakit} adu. Kɔ masjid.',
      'Berɛ adu sɛ wokɔ masjid, sima {süre} na aka ansa na {vakit} adu.',
      'Kɔ masjid ma {vakit}.',
    ],
    yatis: ['Yɛ Isha ansa na woada.', 'Isha berɛ da so wɔ hɔ, hyɛ Nyamefrɛ ase ansa na woada.', 'Nnda kɔsi sɛ wobɛyɛ Isha.'],
    takvim: [
      'Dwumadie bi a ɛwɔ wo kalenda mu bɛba {vakit} berɛ mu.',
      '{vakit} berɛ ne dwumadie bi hyia; mma wo werɛ mfi sɛ wobɛdi kan ayɛ Nyamefrɛ.',
      'Sima {süre} mu no, {vakit} berɛ ne wo dwumadie bɛhyia; mma wo werɛ mfi wo Nyamefrɛ.',
    ],
  },
  otomatik: {
    cuma: '{sure} na aka ansa na Dhuhr adu ma Efiada Nyamefrɛ. Siesie wo ho na kɔ masjid.',
    camiyeGiris: '{sure} na aka ansa na {vakit} adu.',
    camiyeHazirlan: 'Siesie wo ho na kɔ masjid.',
    camiyeYola: 'Kɔ masjid.',
    takvimGiris: 'Dwumadie bi a ɛwɔ wo kalenda mu bɛba {vakit} berɛ mu.',
    takvimOnce: 'Mma wo werɛ mfi sɛ wobɛyɛ Nyamefrɛ ansa na dwumadie no ahyɛ ase.',
    takvimKaplar: 'Mma wo werɛ mfi sɛ wobɛgyae kakra ayɛ Nyamefrɛ.',
    yatsi: 'Yɛ Isha ansa na woada.',
    muhasebeTek: 'Ɛte sɛ wɔnkyerɛɛ {vakit} ɛnnɛ.',
    muhasebeCoklu: cogul({ one: 'Ɛte sɛ wɔnkyerɛɛ Nyamefrɛ {n} ɛnnɛ.', other: 'Ɛte sɛ wɔnkyerɛɛ Nyamefrɛ {n} ɛnnɛ.' }),
    geceCapasi: 'Komm berɛ bɛhyɛ ase sima {süre} mu. Yɛ {vakit} ansa na woada.',
    kuslukSuruyor: 'Duha berɛ da so wɔ hɔ.',
    kuslukGirdi: 'Duha berɛ adu. Ɛyɛ berɛ pa ma raka mmienu.',
    kuslukBitiyor: cogul({ one: 'Sima {n} na aka ma Duha berɛ.', other: 'Sima {n} na aka ma Duha berɛ.' }),
    evvabinSuruyor: 'Berɛ da so wɔ hɔ ma Awwabin.',
    evvabinGirdi: 'Awwabin berɛ. Ɛyɛ berɛ pa ma raka mmienu.',
    evvabinKalan: cogul({ one: 'Sima {n} na aka ma Awwabin.', other: 'Sima {n} na aka ma Awwabin.' }),
    teheccudSonUcte: 'Tahajud berɛ. Anadwo nkyɛmu a ɛtwa toɔ no adu.',
    teheccudKalan: cogul({ one: 'Tahajud berɛ. Sima {n} na aka ma Fajr.', other: 'Tahajud berɛ. Sima {n} na aka ma Fajr.' }),
  },
};
