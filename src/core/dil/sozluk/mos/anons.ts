import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: mealin çoğul emri (‑y), kısa; secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'n kell', girisindenItibaren: 'loogame' },
  cip: { vakit: 'Pʋʋsg yʋʋre', sure: 'Minit', yon: 'n kell / loogame', cuma: 'Arzũma', yatsi: 'Sãanfo' },
  sablon: {
    muhafizCikis: [
      '{vakit} wakatã saada, {süre} minit n kell.',
      'Ra bas-y tɩ {vakit} põs-y ye, {süre} minit n kell.',
      'Wakatã kʋɩɩda, {süre} minit n kell tɩ {vakit} sa.',
    ],
    muhafizGiris: [
      '{vakit} wakatã ta, {süre} minit loogame.',
      'Ra yaool-y {vakit} ye, {süre} minit loogame.',
      'Wakatã kẽnda, yik-y n pʋʋs {vakit}, {süre} minit loogame.',
    ],
    nafile: [
      '{vakit} wakato, {süre} minit {yön}. Yaa wakat sõng rakaa a yiibu yĩnga.',
      '{vakit} wakatã be. Yaa sor sõng n pʋʋs rakaa a yiibu.',
      '{süre} minit {yön} {vakit} yĩnga.',
    ],
    cuma: [
      '{süre} minit n kell n tãag Arzũma. Segl-y n kẽng miisrẽ.',
      'Arzũma pẽnegame, {süre} minit n kell.',
      'Paam-y kʋʋtbã, {süre} minit n kell n tãag Arzũma.',
    ],
    camiyeGit: [
      '{süre} minit n kell n tãag {vakit}. Kẽng-y miisrẽ.',
      'Wakatã ta n kẽng miisrẽ, {süre} minit n tãag {vakit}.',
      'Kẽng-y miisrẽ {vakit} yĩnga.',
    ],
    yatis: ['Pʋʋs-y Sãanfo y sẽn na n gãand taoore.', 'Sãanfo wakatã nan be, yik-y n pʋʋs y gõeem taoore.', 'Ra gõe-y y sẽn nan ka pʋʋs Sãanfo ye.'],
    takvim: [
      'Y kalẽndiyẽ wã yell a ye bee {vakit} wakatã pʋgẽ.',
      '{vakit} wakatã ne yell a ye n tũud taaba; ra yĩm-y n pʋʋs pĩnda ye.',
      '{süre} minit poorẽ, {vakit} wakatã ne y yellã na n tũud taaba; ra yĩm-y y pʋʋsgã ye.',
    ],
  },
  otomatik: {
    cuma: '{sure} n kell n tãag Zafar, Arzũma yĩnga. Segl-y n kẽng miisrẽ.',
    camiyeGiris: '{sure} n kell n tãag {vakit}.',
    camiyeHazirlan: 'Segl-y n kẽng miisrẽ.',
    camiyeYola: 'Kẽng-y miisrẽ.',
    takvimGiris: 'Y kalẽndiyẽ wã yell a ye bee {vakit} wakatã pʋgẽ.',
    takvimOnce: 'Ra yĩm-y n pʋʋs yellã taoore ye.',
    takvimKaplar: 'Ra yĩm-y n vʋʋs bilf n pʋʋs ye.',
    yatsi: 'Pʋʋs-y Sãanfo y sẽn na n gãand taoore.',
    muhasebeTek: 'Rũndã, b pa gʋls {vakit} ye.',
    muhasebeCoklu: cogul({ one: 'Rũndã, b pa gʋls {n} pʋʋsg ye.', other: 'Rũndã, b pa gʋls {n} pʋʋsg ye.' }),
    geceCapasi: 'Wakat ning kibar sẽn pa wat ye na n sɩng {süre} minit poorẽ. Pʋʋs-y {vakit} y sẽn na n gãand taoore.',
    kuslukSuruyor: 'Duhaa wakatã be.',
    kuslukGirdi: 'Duhaa wakatã ta. Yaa wakat sõng rakaa a yiibu yĩnga.',
    kuslukBitiyor: cogul({ one: '{n} minit n kell Duhaa wakatã pʋgẽ.', other: '{n} minit n kell Duhaa wakatã pʋgẽ.' }),
    evvabinSuruyor: 'Wakat nan be Awaabiin yĩnga.',
    evvabinGirdi: 'Awaabiin wakato. Yaa wakat sõng rakaa a yiibu yĩnga.',
    evvabinKalan: cogul({ one: '{n} minit n kell Awaabiin yĩnga.', other: '{n} minit n kell Awaabiin yĩnga.' }),
    teheccudSonUcte: 'Tahajjud wakato. Yʋngã tãab-n-yembr sẽn kõnsã sɩnga.',
    teheccudKalan: cogul({ one: 'Tahajjud wakato. {n} minit n kell n tãag Fagir.', other: 'Tahajjud wakato. {n} minit n kell n tãag Fagir.' }),
  },
};
