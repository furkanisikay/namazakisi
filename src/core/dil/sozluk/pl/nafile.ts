import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Ad harf çevirisi (Lehçe kaynakta yalnız "Witr" doğrulandı; Duha, Awwabin, Tahadżud DOĞRULANMADI). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahadżud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahadżud' },
  aciklamalar: {
    kusluk:
      'Zaczyna się około 45 minut po wschodzie słońca i trwa do 10 minut przed Zuhr. Iszrak to jej najwcześniejszy czas; najlepszy jest po upływie pierwszej ćwierci dnia.',
    evvabin: 'Odprawiana po Maghrib, aż do czasu Isza.',
    teheccud: 'Odprawiana po Isza, po śnie i przebudzeniu, aż do czasu Fadżr. Najlepszy czas to ostatnia trzecia część nocy.',
  },
  bilgiBugun: '{aciklama}\n\nDziś: {bas} – {son}',
  enFaziletli: ' · najlepiej po {saat}',
  sonUcteBir: ' · ostatnia trzecia część {saat}',
  durumAktif: 'Czas nadszedł · koniec {saat}',
  durumNafile: 'Dobrowolna · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Czas Duha',
    kuslukSuruyor: 'Trwa czas Duha; możesz się modlić do {son}.',
    kuslukGirdi: 'Nadszedł czas Duha. Dobra chwila na dwa rakaty; trwa do {son}.',
    kuslukBitiyor: cogul({
      one: 'Do końca czasu Duha została {n} minuta. Dobra chwila na dwa rakaty; trwa do {son}.',
      few: 'Do końca czasu Duha zostały {n} minuty. Dobra chwila na dwa rakaty; trwa do {son}.',
      many: 'Do końca czasu Duha zostało {n} minut. Dobra chwila na dwa rakaty; trwa do {son}.',
      other: 'Do końca czasu Duha zostało {n} minuty. Dobra chwila na dwa rakaty; trwa do {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Jest jeszcze czas na Awwabin. Isza zaczyna się o {son}.',
    evvabinGirdi: 'Po Maghrib to dobra chwila na Awwabin. Isza zaczyna się o {son}.',
    evvabinKalan: cogul({
      one: 'Na Awwabin została {n} minuta. Isza zaczyna się o {son}.',
      few: 'Na Awwabin zostały {n} minuty. Isza zaczyna się o {son}.',
      many: 'Na Awwabin zostało {n} minut. Isza zaczyna się o {son}.',
      other: 'Na Awwabin zostało {n} minuty. Isza zaczyna się o {son}.',
    }),
    teheccudBaslik: 'Czas Tahadżud',
    uyandirSonUcte: 'Wstań; zaczęła się ostatnia trzecia część nocy. Fadżr zaczyna się o {son}.',
    uyandirKalan: cogul({
      one: 'Wstań; do Fadżr została {n} minuta. Fadżr zaczyna się o {son}.',
      few: 'Wstań; do Fadżr zostały {n} minuty. Fadżr zaczyna się o {son}.',
      many: 'Wstań; do Fadżr zostało {n} minut. Fadżr zaczyna się o {son}.',
      other: 'Wstań; do Fadżr zostało {n} minuty. Fadżr zaczyna się o {son}.',
    }),
    sonUcteBaslik: 'Ostatnia trzecia część nocy',
    sonUcteGovde: 'Najbardziej błogosławione godziny na Tahadżud. Fadżr zaczyna się o {son}.',
    teheccudKalan: cogul({
      one: 'Do Fadżr została {n} minuta. Dobry czas na Tahadżud.',
      few: 'Do Fadżr zostały {n} minuty. Dobry czas na Tahadżud.',
      many: 'Do Fadżr zostało {n} minut. Dobry czas na Tahadżud.',
      other: 'Do Fadżr zostało {n} minuty. Dobry czas na Tahadżud.',
    }),
  },
  uyandirmaKanali: 'Pobudka na Tahadżud',
  uyandirmaKanaliAciklama: 'Budzi na modlitwę nocną; dzwoni nawet w trybie cichym',
};
