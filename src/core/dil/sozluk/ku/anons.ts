import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: "tu" + tekil emir, kısa; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'ma', girisindenItibaren: 'derbas bû' },
  cip: { vakit: 'Navê nimêjê', sure: 'Deqîqe', yon: 'ma / derbas bû', cuma: 'Înî', yatsi: 'Eşa' },
  sablon: {
    muhafizCikis: [
      'Dema {vakit} diqede, {süre} deqîqe ma.',
      '{vakit} ji dest nede, {süre} deqîqe ma.',
      'Dem kurt dibe, heta dawiya {vakit} {süre} deqîqe ma.',
    ],
    muhafizGiris: [
      'Dema {vakit} dest pê kir, {süre} deqîqe derbas bûn.',
      '{vakit} dereng nexe, {süre} deqîqe derbas bûn.',
      'Dem diçe, rabe nimêja {vakit}, {süre} deqîqe derbas bûn.',
    ],
    nafile: [
      'Dema {vakit}, {süre} deqîqe {yön}. Ji bo du riketan demeke baş e.',
      'Dema {vakit} didome. Ji bo kirina du riketan derfeteke baş e.',
      'Ji bo {vakit} {süre} deqîqe {yön}.',
    ],
    cuma: [
      'Heta înê {süre} deqîqe ma. Xwe amade bike û here mizgeftê.',
      'Înî nêz dibe, {süre} deqîqe ma.',
      'Xwe bigihîne xutbeyê, heta înê {süre} deqîqe ma.',
    ],
    camiyeGit: [
      'Heta {vakit} {süre} deqîqe ma. Here mizgeftê.',
      'Dema çûna mizgeftê ye, heta {vakit} {süre} deqîqe ma.',
      'Ji bo {vakit} here mizgeftê.',
    ],
    yatis: ['Berî ku tu razêyî nimêja Eşayê bike.', 'Dema Eşayê hîn didome, berî razanê rabe nimêjê.', 'Berî ku tu nimêja Eşayê bikî, raneze.'],
    takvim: [
      'Bûyereke di salnameya te de dikeve dema {vakit}.',
      'Dema {vakit} bi bûyerekê re li hev dikeve; ji bîr neke ku pêşî nimêja xwe bikî.',
      'Piştî {süre} deqîqe dema {vakit} bi bûyera te re li hev dikeve; nimêja xwe ji bîr neke.',
    ],
  },
  otomatik: {
    cuma: 'Ji bo înê heta Nîvro {sure} ma. Xwe amade bike û here mizgeftê.',
    camiyeGiris: 'Heta {vakit} {sure} ma.',
    camiyeHazirlan: 'Xwe amade bike û here mizgeftê.',
    camiyeYola: 'Here mizgeftê.',
    takvimGiris: 'Bûyereke di salnameya te de dikeve dema {vakit}.',
    takvimOnce: 'Ji bîr neke ku berî bûyerê nimêja xwe bikî.',
    takvimKaplar: 'Ji bîr neke ku navberekê bidî û nimêja xwe bikî.',
    yatsi: 'Berî ku tu razêyî nimêja Eşayê bike.',
    muhasebeTek: '{vakit} îro wekî nenîşankirî xuya dike.',
    muhasebeCoklu: cogul({ one: '{n} nimêj îro wekî nenîşankirî xuya dike.', other: '{n} nimêj îro wekî nenîşankirî xuya dikin.' }),
    geceCapasi: 'Piştî {süre} deqîqe demên bêdeng dest pê dikin. Berî ku tu razêyî nimêja {vakit} bike.',
    kuslukSuruyor: 'Dema Duha didome.',
    kuslukGirdi: 'Dema Duha dest pê kir. Ji bo du riketan demeke baş e.',
    kuslukBitiyor: cogul({ one: 'Ji dema Duha {n} deqîqe ma.', other: 'Ji dema Duha {n} deqîqe man.' }),
    evvabinSuruyor: 'Ji bo Ewwabînê hîn dem heye.',
    evvabinGirdi: 'Dema Ewwabînê ye. Ji bo du riketan demeke baş e.',
    evvabinKalan: cogul({ one: 'Ji bo Ewwabînê {n} deqîqe ma.', other: 'Ji bo Ewwabînê {n} deqîqe man.' }),
    teheccudSonUcte: 'Dema Teheccudê ye. Sêyeka dawî ya şevê dest pê kir.',
    teheccudKalan: cogul({ one: 'Dema Teheccudê ye. Heta Sibê {n} deqîqe ma.', other: 'Dema Teheccudê ye. Heta Sibê {n} deqîqe man.' }),
  },
};
