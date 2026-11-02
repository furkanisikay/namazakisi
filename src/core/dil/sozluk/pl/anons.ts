import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: zamirsiz 2. tekil kısa emir; secde karşılığı yok. Sıra Türkçe şablonlarla
 * BİREBİR eşleşir. Dakika tek biçimle ("{süre} minut") yazılır, `dakikaUyumu` sayıya göre çeker;
 * fiil uyumu gerektirmesin diye "zostało/minęło" yerine "jeszcze …" / "… od początku" kalıbı.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'do końca', girisindenItibaren: 'od początku' },
  cip: { vakit: 'Nazwa modlitwy', sure: 'Minuty', yon: 'do końca / od początku', cuma: 'Dżumu’a', yatsi: 'Isza' },
  sablon: {
    muhafizCikis: [
      'Czas modlitwy {vakit} się kończy, jeszcze {süre} minut.',
      'Nie przegap modlitwy {vakit}, jeszcze {süre} minut.',
      'Czasu coraz mniej, {süre} minut do końca modlitwy {vakit}.',
    ],
    muhafizGiris: [
      'Nadszedł czas modlitwy {vakit}, już {süre} minut od początku.',
      'Nie odkładaj modlitwy {vakit}, już {süre} minut od początku.',
      'Czas płynie, stań do modlitwy {vakit}, to już {süre} minut.',
    ],
    nafile: [
      'Czas {vakit}, {süre} minut {yön}. Dobra chwila na dwa rakaty.',
      'Trwa czas {vakit}. Dobra okazja, by odprawić dwa rakaty.',
      '{süre} minut {yön} czasu {vakit}.',
    ],
    cuma: [
      'Do modlitwy piątkowej jeszcze {süre} minut. Przygotuj się i idź do meczetu.',
      'Zbliża się modlitwa piątkowa, jeszcze {süre} minut.',
      'Zdąż na chutbę, do modlitwy piątkowej jeszcze {süre} minut.',
    ],
    camiyeGit: [
      'Do modlitwy {vakit} jeszcze {süre} minut. Idź do meczetu.',
      'Czas iść do meczetu, {süre} minut do modlitwy {vakit}.',
      'Idź do meczetu na modlitwę {vakit}.',
    ],
    yatis: ['Odpraw Isza, zanim pójdziesz spać.', 'Czas Isza wciąż trwa, stań do modlitwy przed snem.', 'Nie kładź się spać przed odprawieniem Isza.'],
    takvim: [
      'Wydarzenie w kalendarzu przypada na czas modlitwy {vakit}.',
      'Czas modlitwy {vakit} koliduje z wydarzeniem; nie zapomnij najpierw się pomodlić.',
      'Za {süre} minut czas modlitwy {vakit} koliduje z wydarzeniem; nie zapomnij o modlitwie.',
    ],
  },
  otomatik: {
    cuma: 'Do Zuhr i modlitwy piątkowej jeszcze {sure}. Przygotuj się i idź do meczetu.',
    camiyeGiris: 'Do modlitwy {vakit} jeszcze {sure}.',
    camiyeHazirlan: 'Przygotuj się i idź do meczetu.',
    camiyeYola: 'Idź do meczetu.',
    takvimGiris: 'Wydarzenie w kalendarzu przypada na czas modlitwy {vakit}.',
    takvimOnce: 'Nie zapomnij pomodlić się przed wydarzeniem.',
    takvimKaplar: 'Nie zapomnij zrobić przerwy na modlitwę.',
    yatsi: 'Odpraw Isza, zanim pójdziesz spać.',
    muhasebeTek: 'Modlitwa {vakit} wydaje się dziś nieoznaczona.',
    muhasebeCoklu: cogul({
      one: '{n} modlitwa wydaje się dziś nieoznaczona.',
      few: '{n} modlitwy wydają się dziś nieoznaczone.',
      many: '{n} modlitw wydaje się dziś nieoznaczonych.',
      other: '{n} modlitwy wydaje się dziś nieoznaczone.',
    }),
    geceCapasi: 'Cisza nocna zaczyna się za {süre} minut. Odpraw modlitwę {vakit}, zanim pójdziesz spać.',
    kuslukSuruyor: 'Trwa czas Duha.',
    kuslukGirdi: 'Nadszedł czas Duha. Dobra chwila na dwa rakaty.',
    kuslukBitiyor: cogul({
      one: 'Do końca czasu Duha została {n} minuta.',
      few: 'Do końca czasu Duha zostały {n} minuty.',
      many: 'Do końca czasu Duha zostało {n} minut.',
      other: 'Do końca czasu Duha zostało {n} minuty.',
    }),
    evvabinSuruyor: 'Jest jeszcze czas na Awwabin.',
    evvabinGirdi: 'Czas Awwabin. Dobra chwila na dwa rakaty.',
    evvabinKalan: cogul({
      one: 'Na Awwabin została {n} minuta.',
      few: 'Na Awwabin zostały {n} minuty.',
      many: 'Na Awwabin zostało {n} minut.',
      other: 'Na Awwabin zostało {n} minuty.',
    }),
    teheccudSonUcte: 'Czas Tahadżud. Zaczęła się ostatnia trzecia część nocy.',
    teheccudKalan: cogul({
      one: 'Czas Tahadżud. Do Fadżr została {n} minuta.',
      few: 'Czas Tahadżud. Do Fadżr zostały {n} minuty.',
      many: 'Czas Tahadżud. Do Fadżr zostało {n} minut.',
      other: 'Czas Tahadżud. Do Fadżr zostało {n} minuty.',
    }),
  },
};
