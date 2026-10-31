import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Sesli okuma (TTS). Sıra Türkçe şablonlarla BİREBİR eşleşir. `{vakit}` yalın hâlde gelir;
 * çekim gerektirmeyen kalıplar seçildi. "{süre} minuta" doldurulduktan sonra `dakikaUyumu`
 * sayıya göre çekilir (1 minuta, 2 minute, 5 minuta). İbadete çağrı: "vi" + kısa çoğul emir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'preostalo', girisindenItibaren: 'prošlo' },
  cip: { vakit: 'Naziv namaza', sure: 'Minute', yon: 'preostalo / prošlo', cuma: 'Džuma', yatsi: 'Jacija' },
  sablon: {
    muhafizCikis: [
      '{vakit} istječe, preostalo je još {süre} minuta.',
      'Ne propustite namaz, {vakit} istječe za {süre} minuta.',
      'Vrijeme je na izmaku. {vakit}, još {süre} minuta.',
    ],
    muhafizGiris: [
      'Nastupilo je vrijeme: {vakit}. Prošlo je već {süre} minuta.',
      '{vakit}: ne odgađajte namaz, od početka je prošlo već {süre} minuta.',
      'Vrijeme odmiče, ustanite na namaz. {vakit}, već {süre} minuta.',
    ],
    nafile: [
      '{vakit}, {süre} minuta {yön}. Lijep trenutak za dva rekata.',
      '{vakit}, vrijeme traje. Lijepa prilika da klanjate dva rekata.',
      '{vakit}, {süre} minuta {yön}.',
    ],
    cuma: [
      'Do džuma-namaza još {süre} minuta. Pripremite se i krenite u džamiju.',
      'Džuma se bliži, još {süre} minuta.',
      'Stignite na hutbu, do džume još {süre} minuta.',
    ],
    camiyeGit: [
      '{vakit}, još {süre} minuta. Krenite u džamiju.',
      'Vrijeme je da krenete u džamiju, {vakit} za {süre} minuta.',
      'Krenite u džamiju na namaz, {vakit}.',
    ],
    yatis: [
      'Klanjajte jaciju prije spavanja.',
      'Vrijeme jacije još traje, ustanite na namaz prije spavanja.',
      'Ne lijegajte prije nego što klanjate jaciju.',
    ],
    takvim: [
      'Jedan događaj u vašem kalendaru pada u vrijeme namaza: {vakit}.',
      '{vakit} se preklapa s jednim događajem; ne zaboravite najprije klanjati.',
      'Za {süre} minuta {vakit} se preklapa s vašim događajem; ne zaboravite namaz.',
    ],
  },
  otomatik: {
    cuma: 'Do podne-namaza za džumu još {sure}. Pripremite se i krenite u džamiju.',
    camiyeGiris: '{vakit}, još {sure}.',
    camiyeHazirlan: 'Pripremite se i krenite u džamiju.',
    camiyeYola: 'Krenite u džamiju.',
    takvimGiris: 'Jedan događaj u vašem kalendaru pada u vrijeme namaza: {vakit}.',
    takvimOnce: 'Ne zaboravite klanjati prije događaja.',
    takvimKaplar: 'Ne zaboravite napraviti stanku i klanjati.',
    yatsi: 'Klanjajte jaciju prije spavanja.',
    muhasebeTek: 'Danas izgleda da namaz nije označen: {vakit}.',
    muhasebeCoklu: cogul({
      one: 'Danas izgleda da {n} namaz nije označen.',
      few: 'Danas izgleda da {n} namaza nisu označena.',
      other: 'Danas izgleda da {n} namaza nije označeno.',
    }),
    geceCapasi: 'Do noćne tišine još {süre} minuta. Prije spavanja klanjajte namaz: {vakit}.',
    kuslukSuruyor: 'Vrijeme duhe traje.',
    kuslukGirdi: 'Nastupilo je vrijeme duhe. Lijep trenutak za dva rekata.',
    kuslukBitiyor: cogul({
      one: 'Do kraja vremena duhe preostala je {n} minuta.',
      few: 'Do kraja vremena duhe preostale su {n} minute.',
      other: 'Do kraja vremena duhe preostalo je {n} minuta.',
    }),
    evvabinSuruyor: 'Još ima vremena za evvabin.',
    evvabinGirdi: 'Vrijeme evvabina. Lijep trenutak za dva rekata.',
    evvabinKalan: cogul({
      one: 'Za evvabin je preostala {n} minuta.',
      few: 'Za evvabin su preostale {n} minute.',
      other: 'Za evvabin je preostalo {n} minuta.',
    }),
    teheccudSonUcte: 'Vrijeme tehedžuda. Nastupila je posljednja trećina noći.',
    teheccudKalan: cogul({
      one: 'Vrijeme tehedžuda. Do sabaha je preostala {n} minuta.',
      few: 'Vrijeme tehedžuda. Do sabaha su preostale {n} minute.',
      other: 'Vrijeme tehedžuda. Do sabaha je preostalo {n} minuta.',
    }),
  },
};
