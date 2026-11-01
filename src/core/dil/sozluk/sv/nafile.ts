import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile "frivillig bön" (HadeethEnc sv); adlar Arapça (Duha, Awwabin, Tahajjud — "nattbönen" yatsıyla karışır). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Börjar cirka 45 minuter efter soluppgången och varar till 10 minuter före Dhuhr. Ishraq är dess tidigaste tid; mest förtjänstfull är den när dagens första fjärdedel har passerat.',
    evvabin: 'Bes efter Maghrib, fram till tiden för Isha.',
    teheccud: 'Bes efter att man sovit och vaknat efter Isha, fram till tiden för Fajr. Den mest förtjänstfulla tiden är nattens sista tredjedel.',
  },
  bilgiBugun: '{aciklama}\n\nI dag: {bas} – {son}',
  enFaziletli: ' · mest förtjänstfull efter {saat}',
  sonUcteBir: ' · sista tredjedelen {saat}',
  durumAktif: 'Tiden har börjat · slutar {saat}',
  durumNafile: 'Frivillig bön · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Tid för Duha',
    kuslukSuruyor: 'Det är tid för Duha; du kan be fram till {son}.',
    kuslukGirdi: 'Tiden för Duha har börjat. Ett bra tillfälle för två rakat; den varar till {son}.',
    kuslukBitiyor: cogul({
      one: '{n} minut kvar av tiden för Duha. Ett bra tillfälle för två rakat; den varar till {son}.',
      other: '{n} minuter kvar av tiden för Duha. Ett bra tillfälle för två rakat; den varar till {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Det finns fortfarande tid för Awwabin. Isha börjar {son}.',
    evvabinGirdi: 'Efter Maghrib, ett bra tillfälle för Awwabin. Isha börjar {son}.',
    evvabinKalan: cogul({ one: '{n} minut kvar för Awwabin. Isha börjar {son}.', other: '{n} minuter kvar för Awwabin. Isha börjar {son}.' }),
    teheccudBaslik: 'Tid för Tahajjud',
    uyandirSonUcte: 'Stig upp; nattens sista tredjedel har börjat. Fajr börjar {son}.',
    uyandirKalan: cogul({ one: 'Stig upp; {n} minut kvar till Fajr. Fajr börjar {son}.', other: 'Stig upp; {n} minuter kvar till Fajr. Fajr börjar {son}.' }),
    sonUcteBaslik: 'Nattens sista tredjedel',
    sonUcteGovde: 'De mest välsignade timmarna för Tahajjud. Fajr börjar {son}.',
    teheccudKalan: cogul({ one: '{n} minut kvar till Fajr. En bra tid för Tahajjud.', other: '{n} minuter kvar till Fajr. En bra tid för Tahajjud.' }),
  },
  uyandirmaKanali: 'Väckning för Tahajjud',
  uyandirmaKanaliAciklama: 'Väcker dig för Tahajjud; ringer även i tyst läge',
};
