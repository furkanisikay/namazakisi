import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Nafile adları Arapça özel ad olarak kalır (Duha, Awwabin, Tahajjud; teheccüdün İtalyanca
 * betimi HadeethEnc "veglia notturna"). Bildirim ibadete çağrıdır: Lei + kısa emir ("Si alzi").
 */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Inizia circa 45 minuti dopo il sorgere del sole e dura fino a 10 minuti prima dello Zuhr. L’Ishraq è il suo primo momento; il più meritorio è dopo il primo quarto del giorno.',
    evvabin: 'Si compie dopo il Maghrib, fino all’orario dell’Isha.',
    teheccud: 'Si compie dopo l’Isha, dormendo e poi alzandosi, fino all’orario del Fajr. Il momento più meritorio è l’ultimo terzo della notte.',
  },
  bilgiBugun: '{aciklama}\n\nOggi: {bas} – {son}',
  enFaziletli: ' · più meritorio dopo le {saat}',
  sonUcteBir: ' · ultimo terzo {saat}',
  durumAktif: 'È iniziato · fino alle {saat}',
  durumNafile: 'Supererogatoria · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Tempo del Duha',
    kuslukSuruyor: 'Il tempo del Duha è in corso; può pregare fino alle {son}.',
    kuslukGirdi: 'È iniziato il tempo del Duha. Un buon momento per due unità di preghiera; dura fino alle {son}.',
    kuslukBitiyor: cogul({
      one: 'Manca {n} minuto alla fine del Duha. Un buon momento per due unità di preghiera; dura fino alle {son}.',
      many: 'Mancano {n} di minuti alla fine del Duha. Un buon momento per due unità di preghiera; dura fino alle {son}.',
      other: 'Mancano {n} minuti alla fine del Duha. Un buon momento per due unità di preghiera; dura fino alle {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'C’è ancora tempo per l’Awwabin. L’Isha inizia alle {son}.',
    evvabinGirdi: 'Dopo il Maghrib, un buon momento per l’Awwabin. L’Isha inizia alle {son}.',
    evvabinKalan: cogul({ one: 'Manca {n} minuto per l’Awwabin. L’Isha inizia alle {son}.', many: 'Mancano {n} di minuti per l’Awwabin. L’Isha inizia alle {son}.', other: 'Mancano {n} minuti per l’Awwabin. L’Isha inizia alle {son}.' }),
    teheccudBaslik: 'Tempo del Tahajjud',
    uyandirSonUcte: 'Si alzi; è iniziato l’ultimo terzo della notte. Il Fajr inizia alle {son}.',
    uyandirKalan: cogul({ one: 'Si alzi; manca {n} minuto al Fajr. Il Fajr inizia alle {son}.', many: 'Si alzi; mancano {n} di minuti al Fajr. Il Fajr inizia alle {son}.', other: 'Si alzi; mancano {n} minuti al Fajr. Il Fajr inizia alle {son}.' }),
    sonUcteBaslik: 'L’ultimo terzo della notte',
    sonUcteGovde: 'Le ore più benedette per il Tahajjud. Il Fajr inizia alle {son}.',
    teheccudKalan: cogul({ one: 'Manca {n} minuto al Fajr. Un buon momento per il Tahajjud.', many: 'Mancano {n} di minuti al Fajr. Un buon momento per il Tahajjud.', other: 'Mancano {n} minuti al Fajr. Un buon momento per il Tahajjud.' }),
  },
  uyandirmaKanali: 'Sveglia per il Tahajjud',
  uyandirmaKanaliAciklama: 'La sveglia per la preghiera notturna; suona anche in modalità silenziosa',
};
