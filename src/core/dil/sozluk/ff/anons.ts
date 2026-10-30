import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: tekil emir, kısa; "secde" yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'heddii', girisindenItibaren: 'ɓenii' },
  cip: { vakit: 'Innde juulde', sure: 'Hojomaaji', yon: 'heddii / ɓenii', cuma: 'Juma', yatsi: 'Geeƴe' },
  sablon: {
    muhafizCikis: [
      'Waqutu {vakit} hino gasa, {süre} hojomaaji heddii.',
      'Wota a majjin {vakit}, {süre} hojomaaji heddii.',
      'Waqutu hino raɓɓina, {süre} hojomaaji heddii haa {vakit} gasa.',
    ],
    muhafizGiris: [
      'Waqutu {vakit} heewii, {süre} hojomaaji ɓenii.',
      'Wota a leelin {vakit}, {süre} hojomaaji ɓenii.',
      'Waqutu hino yaha, ñiiɓu juulde {vakit}, {süre} hojomaaji ɓenii.',
    ],
    nafile: [
      'Waqutu {vakit}, {süre} hojomaaji {yön}. Ko sahaa moƴƴo ngam raka’aaji ɗiɗi.',
      'Waqutu {vakit} hino jokki. Ko sahaa moƴƴo juulude raka’aaji ɗiɗi.',
      '{süre} hojomaaji {yön} ngam {vakit}.',
    ],
    cuma: [
      '{süre} hojomaaji heddii haa Juma. Moƴƴin hoore maa, yah juulirde.',
      'Juma hino ɓadoo, {süre} hojomaaji heddii.',
      'Hewtu hutba, {süre} hojomaaji heddii haa Juma.',
    ],
    camiyeGit: [
      '{süre} hojomaaji heddii haa {vakit}. Yah juulirde.',
      'Ko waqutu yahugol juulirde, {süre} hojomaaji haa {vakit}.',
      'Yah juulirde ngam {vakit}.',
    ],
    yatis: ['Juulu geeƴe adii lelaade.', 'Waqutu geeƴe hino jokki, ñiiɓu juulde adii ɗaanaade.', 'Wota a ɗaano adii juulude geeƴe.'],
    takvim: [
      'Golle e kalandar maa hino hawri e waqutu {vakit}.',
      'Waqutu {vakit} hino hawri e golle; wota a yejjit juulude adii.',
      'Caggal {süre} hojomaaji waqutu {vakit} hawray e golle maa; wota a yejjit juulde maa.',
    ],
  },
  otomatik: {
    cuma: '{sure} heddii haa fanaa ngam Juma. Moƴƴin hoore maa, yah juulirde.',
    camiyeGiris: '{sure} heddii haa {vakit}.',
    camiyeHazirlan: 'Moƴƴin hoore maa, yah juulirde.',
    camiyeYola: 'Yah juulirde.',
    takvimGiris: 'Golle e kalandar maa hino hawri e waqutu {vakit}.',
    takvimOnce: 'Wota a yejjit juulude adii golle ɗen.',
    takvimKaplar: 'Wota a yejjit accude golle seeɗa ngam juulude.',
    yatsi: 'Juulu geeƴe adii lelaade.',
    muhasebeTek: '{vakit} maandinaaka hannde.',
    muhasebeCoklu: cogul({ one: '{n} juulde maandinaaka hannde.', other: '{n} juulɗe maandinaaka hannde.' }),
    geceCapasi: 'Saa’iiji deƴƴere fuɗɗoto caggal {süre} hojomaaji. Juulu {vakit} adii lelaade.',
    kuslukSuruyor: 'Waqutu duhaa hino jokki.',
    kuslukGirdi: 'Waqutu duhaa heewii. Ko sahaa moƴƴo ngam raka’aaji ɗiɗi.',
    kuslukBitiyor: cogul({ one: '{n} hojom heddii e waqutu duhaa.', other: '{n} hojomaaji heddii e waqutu duhaa.' }),
    evvabinSuruyor: 'Waqutu hino heddii ngam awwaabiin.',
    evvabinGirdi: 'Waqutu awwaabiin. Ko sahaa moƴƴo ngam raka’aaji ɗiɗi.',
    evvabinKalan: cogul({ one: '{n} hojom heddii ngam awwaabiin.', other: '{n} hojomaaji heddii ngam awwaabiin.' }),
    teheccudSonUcte: 'Waqutu tahajjudi. Tataɓal sakkitoral jemma fuɗɗii.',
    teheccudKalan: cogul({ one: 'Waqutu tahajjudi. {n} hojom heddii haa subaka.', other: 'Waqutu tahajjudi. {n} hojomaaji heddii haa subaka.' }),
  },
};
