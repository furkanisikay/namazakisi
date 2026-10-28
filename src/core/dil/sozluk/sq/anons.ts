import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: "ju" + kısa çoğul emir; secde karşılığı yok ("ngrihuni për namaz").
 * Vakit adı yalın hâlde kalır (iki nokta ya da "deri te" + yalın). Dakika her yerde
 * "{süre} minuta" (`dakikaUyumu` 1 için "minutë"ye çeker). Sıra Türkçe şablonlarla BİREBİR eşleşir.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'kanë mbetur', girisindenItibaren: 'kanë kaluar' },
  cip: { vakit: 'Emri i vaktit', sure: 'Minuta', yon: 'kanë mbetur / kanë kaluar', cuma: 'Xhumaja', yatsi: 'Jacia' },
  sablon: {
    muhafizCikis: [
      '{vakit}: koha po del, edhe {süre} minuta.',
      '{vakit}: mos e humbni, kanë mbetur {süre} minuta.',
      'Koha po ngushtohet, edhe {süre} minuta derisa të dalë {vakit}.',
    ],
    muhafizGiris: [
      '{vakit}: ka hyrë koha, kanë kaluar {süre} minuta.',
      '{vakit}: mos e vononi, kanë kaluar {süre} minuta.',
      'Koha po ecën, ngrihuni për namaz: {vakit}, kanë kaluar {süre} minuta.',
    ],
    nafile: [
      '{vakit}: {yön} {süre} minuta. Moment i mirë për dy rekate.',
      '{vakit}: koha vazhdon. Rast i mirë për të falur dy rekate.',
      '{vakit}: {yön} {süre} minuta.',
    ],
    cuma: [
      'Edhe {süre} minuta deri te xhumaja. Përgatituni dhe nisuni për në xhami.',
      'Xhumaja po afron, kanë mbetur {süre} minuta.',
      'Arrini hutben, edhe {süre} minuta deri te xhumaja.',
    ],
    camiyeGit: [
      'Edhe {süre} minuta deri te {vakit}. Nisuni për në xhami.',
      'Është koha të shkoni në xhami, edhe {süre} minuta deri te {vakit}.',
      '{vakit}: nisuni për në xhami.',
    ],
    yatis: ['Falni jacinë para se të flini.', 'Koha e jacisë vazhdon, ngrihuni për namaz para se të flini.', 'Mos flini pa e falur jacinë.'],
    takvim: [
      'Një ngjarje në kalendarin tuaj bie në kohën e namazit: {vakit}.',
      '{vakit}: koha përputhet me një ngjarje; mos harroni ta falni më parë.',
      'Pas {süre} minuta, {vakit} përputhet me ngjarjen tuaj; mos e harroni namazin.',
    ],
  },
  otomatik: {
    cuma: 'Edhe {sure} deri te dreka e xhumasë. Përgatituni dhe nisuni për në xhami.',
    camiyeGiris: 'Edhe {sure} deri te {vakit}.',
    camiyeHazirlan: 'Përgatituni dhe nisuni për në xhami.',
    camiyeYola: 'Nisuni për në xhami.',
    takvimGiris: 'Një ngjarje në kalendarin tuaj bie në kohën e namazit: {vakit}.',
    takvimOnce: 'Mos harroni ta falni para ngjarjes.',
    takvimKaplar: 'Mos harroni të bëni një pushim dhe ta falni.',
    yatsi: 'Falni jacinë para se të flini.',
    muhasebeTek: '{vakit}: sot duket pa shënim.',
    muhasebeCoklu: cogul({ one: 'Sot {n} namaz duket pa shënim.', other: 'Sot {n} namaze duken pa shënim.' }),
    geceCapasi: 'Edhe {süre} minuta deri në orët e qetësisë. {vakit}: falni para se të flini.',
    kuslukSuruyor: 'Koha e duhasë vazhdon.',
    kuslukGirdi: 'Hyri koha e duhasë. Moment i mirë për dy rekate.',
    kuslukBitiyor: cogul({ one: 'Edhe {n} minutë deri në fund të kohës së duhasë.', other: 'Edhe {n} minuta deri në fund të kohës së duhasë.' }),
    evvabinSuruyor: 'Koha për evvabin vazhdon.',
    evvabinGirdi: 'Koha e evvabinit. Moment i mirë për dy rekate.',
    evvabinKalan: cogul({ one: 'Edhe {n} minutë për evvabin.', other: 'Edhe {n} minuta për evvabin.' }),
    teheccudSonUcte: 'Koha e tehexhudit. Hyri e treta e fundit e natës.',
    teheccudKalan: cogul({ one: 'Koha e tehexhudit. Edhe {n} minutë deri te sabahu.', other: 'Koha e tehexhudit. Edhe {n} minuta deri te sabahu.' }),
  },
};
