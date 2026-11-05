import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: 2. çoğul kısa emir; secde karşılığı yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'etikali', girisindenItibaren: 'eleki' },
  cip: { vakit: 'Nkombo ya losambo', sure: 'Miniti', yon: 'etikali / eleki', cuma: "Jumu'a", yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'Ntango ya {vakit} ezali kosila, etikali miniti {süre}.',
      'Bobungisa {vakit} te, etikali miniti {süre}.',
      'Ntango ezali kosila, miniti {süre} tii {vakit} esila.',
    ],
    muhafizGiris: [
      'Ntango ya {vakit} ebandi, miniti {süre} eleki.',
      'Bowumisa {vakit} te, miniti {süre} eleki.',
      'Ntango ezali koleka, botelema mpɔ na {vakit}, miniti {süre} eleki.',
    ],
    nafile: [
      'Ntango ya {vakit}, miniti {süre} {yön}. Ntango malamu mpɔ na rakat mibale.',
      'Ntango ya {vakit} ezali kokoba. Libaku malamu ya kosambela rakat mibale.',
      'Miniti {süre} {yön} mpɔ na {vakit}.',
    ],
    cuma: [
      "Etikali miniti {süre} tii Jumu'a. Bomibongisa mpe bokende na moskeye.",
      "Jumu'a ekomi pene, etikali miniti {süre}.",
      "Bokuta khutba, etikali miniti {süre} tii Jumu'a.",
    ],
    camiyeGit: [
      'Etikali miniti {süre} tii {vakit}. Bokende na moskeye.',
      'Ntango ya kokende na moskeye, miniti {süre} tii {vakit}.',
      'Bokende na moskeye mpɔ na {vakit}.',
    ],
    yatis: [
      'Bosambela Isha liboso ya kolala.',
      'Ntango ya Isha ezali naino, botelema mpɔ na losambo liboso ya kolala.',
      'Bolala te liboso ya kosambela Isha.',
    ],
    takvim: [
      'Likambo mɔkɔ na manaka na bino ekokwela na ntango ya {vakit}.',
      'Ntango ya {vakit} ekutani na likambo; bobosana te kosambela liboso.',
      'Na miniti {süre} ntango ya {vakit} ekokutana na likambo na bino; bobosana losambo na bino te.',
    ],
  },
  otomatik: {
    cuma: "Etikali {sure} tii Dhuhr mpɔ na Jumu'a. Bomibongisa mpe bokende na moskeye.",
    camiyeGiris: 'Etikali {sure} tii {vakit}.',
    camiyeHazirlan: 'Bomibongisa mpe bokende na moskeye.',
    camiyeYola: 'Bokende na moskeye.',
    takvimGiris: 'Likambo mɔkɔ na manaka na bino ekokwela na ntango ya {vakit}.',
    takvimOnce: 'Bobosana te kosambela liboso ya likambo.',
    takvimKaplar: 'Bobosana te kopema mwa moke mpe kosambela.',
    yatsi: 'Bosambela Isha liboso ya kolala.',
    muhasebeTek: '{vakit} emonani na elembo te lɛlɔ.',
    muhasebeCoklu: cogul({ one: 'Losambo {n} emonani na elembo te lɛlɔ.', other: 'Losambo {n} emonani na elembo te lɛlɔ.' }),
    geceCapasi: 'Bangonga ya kimia ekobanda na miniti {süre}. Bosambela {vakit} liboso ya kolala.',
    kuslukSuruyor: 'Ntango ya Duha ezali kokoba.',
    kuslukGirdi: 'Ntango ya Duha ebandi. Ntango malamu mpɔ na rakat mibale.',
    kuslukBitiyor: cogul({ one: 'Etikali miniti {n} na ntango ya Duha.', other: 'Etikali miniti {n} na ntango ya Duha.' }),
    evvabinSuruyor: 'Ntango ezali naino mpɔ na Awwabin.',
    evvabinGirdi: 'Ntango ya Awwabin. Ntango malamu mpɔ na rakat mibale.',
    evvabinKalan: cogul({ one: 'Etikali miniti {n} mpɔ na Awwabin.', other: 'Etikali miniti {n} mpɔ na Awwabin.' }),
    teheccudSonUcte: 'Ntango ya Tahajjud. Ndambo ya misato ya suka ya butu ebandi.',
    teheccudKalan: cogul({
      one: 'Ntango ya Tahajjud. Etikali miniti {n} tii Fajr.',
      other: 'Ntango ya Tahajjud. Etikali miniti {n} tii Fajr.',
    }),
  },
};
