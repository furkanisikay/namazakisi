import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları Ballkan përdorimit: Duha, Evvabin, Tehexhud. Bildirim ibadete çağrıdır (ju + emir). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Evvabin', teheccud: 'Tehexhud' },
  kucuk: { kusluk: 'duha', evvabin: 'evvabin', teheccud: 'tehexhud' },
  aciklamalar: {
    kusluk:
      'Fillon rreth 45 minuta pas lindjes së diellit dhe zgjat deri 10 minuta para drekës. Ishraku është koha e saj më e hershme; më e vlefshmja është pasi të ketë kaluar çereku i parë i ditës.',
    evvabin: 'Falet pas akshamit, deri në kohën e jacisë.',
    teheccud: 'Falet pas jacisë, pasi të keni fjetur e të jeni zgjuar, deri në hyrjen e sabahut. Koha e saj më e vlefshme është e treta e fundit e natës.',
  },
  bilgiBugun: '{aciklama}\n\nSot: {bas} – {son}',
  enFaziletli: ' · më e vlefshmja pas {saat}',
  sonUcteBir: ' · e treta e fundit {saat}',
  durumAktif: 'Ka hyrë koha · mbaron {saat}',
  durumNafile: 'Nafile · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Koha e duhasë',
    kuslukSuruyor: 'Koha e duhasë vazhdon; mund ta falni deri në {son}.',
    kuslukGirdi: 'Hyri koha e duhasë. Moment i mirë për dy rekate; koha zgjat deri në {son}.',
    kuslukBitiyor: cogul({
      one: 'Edhe {n} minutë deri në fund të kohës së duhasë. Moment i mirë për dy rekate; koha zgjat deri në {son}.',
      other: 'Edhe {n} minuta deri në fund të kohës së duhasë. Moment i mirë për dy rekate; koha zgjat deri në {son}.',
    }),
    evvabinBaslik: 'Evvabin',
    evvabinSuruyor: 'Koha për evvabin vazhdon. Jacia hyn në {son}.',
    evvabinGirdi: 'Pas akshamit, moment i mirë për evvabin. Jacia hyn në {son}.',
    evvabinKalan: cogul({ one: 'Edhe {n} minutë për evvabin. Jacia hyn në {son}.', other: 'Edhe {n} minuta për evvabin. Jacia hyn në {son}.' }),
    teheccudBaslik: 'Koha e tehexhudit',
    uyandirSonUcte: 'Ngrihuni; hyri e treta e fundit e natës. Sabahu hyn në {son}.',
    uyandirKalan: cogul({ one: 'Ngrihuni; edhe {n} minutë deri te sabahu. Sabahu hyn në {son}.', other: 'Ngrihuni; edhe {n} minuta deri te sabahu. Sabahu hyn në {son}.' }),
    sonUcteBaslik: 'E treta e fundit e natës',
    sonUcteGovde: 'Orët më të bekuara për tehexhud. Sabahu hyn në {son}.',
    teheccudKalan: cogul({ one: 'Edhe {n} minutë deri te sabahu. Kohë e mirë për tehexhud.', other: 'Edhe {n} minuta deri te sabahu. Kohë e mirë për tehexhud.' }),
  },
  uyandirmaKanali: 'Zgjimi për tehexhud',
  uyandirmaKanaliAciklama: 'Ju zgjon për namazin e natës; bie edhe në modalitetin e heshtur',
};
