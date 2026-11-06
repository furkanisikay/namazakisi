import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Sesli okuma (TTS). Sıra Türkçe şablonlarla BİREBİR eşleşir. `{vakit}` yalın hâlde gelir;
 * çekim gerektirmeyen kalıplar seçildi. "{süre} minuta" her sayıyla doğrudur (1 minuta,
 * 2 minuta [eril "minut"], 5 minuta). İbadete çağrı saygılı "Vi" + kısa emir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'preostalo', girisindenItibaren: 'prošlo' },
  cip: { vakit: 'Naziv vakta', sure: 'Minute', yon: 'preostalo / prošlo', cuma: 'Džuma', yatsi: 'Jacija' },
  sablon: {
    muhafizCikis: [
      '{vakit} ističe, još {süre} minuta.',
      'Ne propustite namaz, {vakit} ističe za {süre} minuta.',
      'Vrijeme se sužava. {vakit}, još {süre} minuta.',
    ],
    muhafizGiris: [
      'Nastupio je vakat, {vakit}. Već {süre} minuta od početka.',
      '{vakit}: ne odgađajte namaz, već {süre} minuta od nastupa vakta.',
      'Vrijeme odmiče, stanite na namaz. {vakit}, već {süre} minuta.',
    ],
    nafile: [
      '{vakit}, {süre} minuta {yön}. Lijep trenutak za dva rekata.',
      '{vakit}, vrijeme traje. Lijepa prilika da klanjate dva rekata.',
      '{vakit}, {süre} minuta {yön}.',
    ],
    cuma: [
      'Do džuma-namaza još {süre} minuta. Spremite se i krenite u džamiju.',
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
      'Vrijeme jacije još traje, stanite na namaz prije spavanja.',
      'Ne lijegajte prije nego što klanjate jaciju.',
    ],
    takvim: [
      'Jedan događaj u Vašem kalendaru pada u vakat, {vakit}.',
      '{vakit} se poklapa s jednim događajem; ne zaboravite prvo klanjati.',
      'Za {süre} minuta {vakit} se poklapa s Vašim događajem; ne zaboravite namaz.',
    ],
  },
  otomatik: {
    cuma: 'Do podne-namaza za džumu još {sure}. Spremite se i krenite u džamiju.',
    camiyeGiris: '{vakit}, još {sure}.',
    camiyeHazirlan: 'Spremite se i krenite u džamiju.',
    camiyeYola: 'Krenite u džamiju.',
    takvimGiris: 'Jedan događaj u Vašem kalendaru pada u vakat, {vakit}.',
    takvimOnce: 'Ne zaboravite klanjati prije događaja.',
    takvimKaplar: 'Ne zaboravite napraviti pauzu i klanjati.',
    yatsi: 'Klanjajte jaciju prije spavanja.',
    muhasebeTek: 'Danas izgleda neoznačeno, {vakit}.',
    muhasebeCoklu: cogul({
      one: 'Danas izgleda da {n} vakat nije označen.',
      few: 'Danas izgleda da {n} vakta nisu označena.',
      other: 'Danas izgleda da {n} vakata nije označeno.',
    }),
    geceCapasi: 'Do noćne tišine još {süre} minuta. Prije spavanja klanjajte {vakit}-namaz.',
    kuslukSuruyor: 'Vrijeme duhe traje.',
    kuslukGirdi: 'Nastupilo je vrijeme duhe. Lijep trenutak za dva rekata.',
    kuslukBitiyor: cogul({
      one: 'Do kraja vremena duhe ostala je {n} minuta.',
      few: 'Do kraja vremena duhe ostale su {n} minute.',
      other: 'Do kraja vremena duhe ostalo je {n} minuta.',
    }),
    evvabinSuruyor: 'Još ima vremena za evvabin.',
    evvabinGirdi: 'Vrijeme evvabina. Lijep trenutak za dva rekata.',
    evvabinKalan: cogul({
      one: 'Za evvabin je ostala {n} minuta.',
      few: 'Za evvabin su ostale {n} minute.',
      other: 'Za evvabin je ostalo {n} minuta.',
    }),
    teheccudSonUcte: 'Vrijeme tehedžuda. Nastupila je posljednja trećina noći.',
    teheccudKalan: cogul({
      one: 'Vrijeme tehedžuda. Do zore je ostala {n} minuta.',
      few: 'Vrijeme tehedžuda. Do zore su ostale {n} minute.',
      other: 'Vrijeme tehedžuda. Do zore je ostalo {n} minuta.',
    }),
  },
};
