import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: "vous" + kısa emir; secde fiili yok ("allez prier"). Sıra Türkçe
 * şablonlarla BİREBİR eşleşir. Vakit adının önüne "de" konmaz (elizyon: "d’Asr").
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'restantes', girisindenItibaren: 'écoulées' },
  cip: { vakit: 'Nom de la prière', sure: 'Minutes', yon: 'restantes / écoulées', cuma: 'Joumoua', yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      '{vakit} se termine, plus que {süre} minutes.',
      'Ne manquez pas {vakit}, il reste {süre} minutes.',
      'Le temps se resserre, {vakit} se termine dans {süre} minutes.',
    ],
    muhafizGiris: [
      '{vakit} a commencé, {süre} minutes se sont écoulées.',
      'Ne retardez pas {vakit}, {süre} minutes se sont déjà écoulées.',
      'Le temps avance, allez prier {vakit}, cela fait {süre} minutes.',
    ],
    nafile: [
      '{vakit}, {süre} minutes {yön}. Un beau moment pour deux rakats.',
      '{vakit} est en cours. Une belle occasion de prier deux rakats.',
      'Pour {vakit}, {süre} minutes {yön}.',
    ],
    cuma: [
      'Joumoua dans {süre} minutes. Préparez-vous et partez à la mosquée.',
      'Joumoua approche, il reste {süre} minutes.',
      'Arrivez à temps pour le prêche, Joumoua dans {süre} minutes.',
    ],
    camiyeGit: [
      '{vakit} dans {süre} minutes. Partez à la mosquée.',
      'Il est temps d’aller à la mosquée, {vakit} dans {süre} minutes.',
      'Partez à la mosquée pour {vakit}.',
    ],
    yatis: ['Priez Isha avant d’aller vous coucher.', 'L’heure d’Isha est encore en cours, allez prier avant de dormir.', 'Ne dormez pas avant d’avoir prié Isha.'],
    takvim: [
      'Un événement de votre agenda tombe pendant {vakit}.',
      '{vakit} coïncide avec un événement ; n’oubliez pas de prier avant.',
      'Dans {süre} minutes, {vakit} coïncide avec votre événement ; n’oubliez pas votre prière.',
    ],
  },
  otomatik: {
    cuma: 'Pour Joumoua, Dhuhr est dans {sure}. Préparez-vous et partez à la mosquée.',
    camiyeGiris: '{vakit} dans {sure}.',
    camiyeHazirlan: 'Préparez-vous et partez à la mosquée.',
    camiyeYola: 'Partez à la mosquée.',
    takvimGiris: 'Un événement de votre agenda tombe pendant {vakit}.',
    takvimOnce: 'N’oubliez pas de prier avant l’événement.',
    takvimKaplar: 'N’oubliez pas de faire une pause pour prier.',
    yatsi: 'Priez Isha avant d’aller vous coucher.',
    muhasebeTek: '{vakit} ne semble pas marqué aujourd’hui.',
    muhasebeCoklu: cogul({
      one: '{n} prière ne semble pas marquée aujourd’hui.',
      many: '{n} de prières ne semblent pas marquées aujourd’hui.',
      other: '{n} prières ne semblent pas marquées aujourd’hui.',
    }),
    geceCapasi: 'Les heures calmes commencent dans {süre} minutes. Priez {vakit} avant d’aller vous coucher.',
    kuslukSuruyor: 'L’heure de Duha est en cours.',
    kuslukGirdi: 'L’heure de Duha a commencé. Un beau moment pour deux rakats.',
    kuslukBitiyor: cogul({
      one: 'Il reste {n} minute avant la fin de Duha.',
      many: 'Il reste {n} de minutes avant la fin de Duha.',
      other: 'Il reste {n} minutes avant la fin de Duha.',
    }),
    evvabinSuruyor: 'Il est encore temps pour Awwabin.',
    evvabinGirdi: 'Heure d’Awwabin. Un beau moment pour deux rakats.',
    evvabinKalan: cogul({
      one: 'Il reste {n} minute pour Awwabin.',
      many: 'Il reste {n} de minutes pour Awwabin.',
      other: 'Il reste {n} minutes pour Awwabin.',
    }),
    teheccudSonUcte: 'Heure de Tahajjud. Le dernier tiers de la nuit a commencé.',
    teheccudKalan: cogul({
      one: 'Heure de Tahajjud. Il reste {n} minute avant Fajr.',
      many: 'Heure de Tahajjud. Il reste {n} de minutes avant Fajr.',
      other: 'Heure de Tahajjud. Il reste {n} minutes avant Fajr.',
    }),
  },
};
