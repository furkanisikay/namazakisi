import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Ebandaka pene na miniti 45 nsima ya kobima ya moi mpe esilaka miniti 10 liboso ya Dhuhr. Ishraq ezali ntango na yango ya liboso; oyo eleki malamu ezali nsima ya ndambo ya minei ya liboso ya mokɔlɔ.',
    evvabin: 'Esambelamaka nsima ya Maghrib, tii ntango ya Isha.',
    teheccud: 'Esambelamaka nsima ya kolala mpe kolamuka nsima ya Isha, tii ntango ya Fajr. Ntango na yango eleki malamu ezali ndambo ya misato ya suka ya butu.',
  },
  bilgiBugun: '{aciklama}\n\nLɛlɔ: {bas} – {son}',
  enFaziletli: ' · eleki malamu nsima ya {saat}',
  sonUcteBir: ' · ndambo ya suka {saat}',
  durumAktif: 'Ntango ebandi · ekosila {saat}',
  durumNafile: 'Suna · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Ntango ya Duha',
    kuslukSuruyor: 'Ntango ya Duha ezali kokoba; bokoki kosambela tii {son}.',
    kuslukGirdi: 'Ntango ya Duha ebandi. Ntango malamu mpɔ na rakat mibale; ekoumela tii {son}.',
    kuslukBitiyor: cogul({
      one: 'Etikali miniti {n} na ntango ya Duha. Ntango malamu mpɔ na rakat mibale; ekoumela tii {son}.',
      other: 'Etikali miniti {n} na ntango ya Duha. Ntango malamu mpɔ na rakat mibale; ekoumela tii {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Ntango ezali naino mpɔ na Awwabin. Isha ekobanda na {son}.',
    evvabinGirdi: 'Nsima ya Maghrib, ntango malamu mpɔ na Awwabin. Isha ekobanda na {son}.',
    evvabinKalan: cogul({
      one: 'Etikali miniti {n} mpɔ na Awwabin. Isha ekobanda na {son}.',
      other: 'Etikali miniti {n} mpɔ na Awwabin. Isha ekobanda na {son}.',
    }),
    teheccudBaslik: 'Ntango ya Tahajjud',
    uyandirSonUcte: 'Botelema; ndambo ya misato ya suka ya butu ebandi. Fajr ekobanda na {son}.',
    uyandirKalan: cogul({
      one: 'Botelema; etikali miniti {n} tii Fajr. Fajr ekobanda na {son}.',
      other: 'Botelema; etikali miniti {n} tii Fajr. Fajr ekobanda na {son}.',
    }),
    sonUcteBaslik: 'Ndambo ya misato ya suka ya butu',
    sonUcteGovde: 'Bangonga eleki lipamboli mpɔ na Tahajjud. Fajr ekobanda na {son}.',
    teheccudKalan: cogul({
      one: 'Etikali miniti {n} tii Fajr. Ntango malamu mpɔ na Tahajjud.',
      other: 'Etikali miniti {n} tii Fajr. Ntango malamu mpɔ na Tahajjud.',
    }),
  },
  uyandirmaKanali: 'Kolamusa mpɔ na Tahajjud',
  uyandirmaKanaliAciklama: 'Elamusaka bino mpɔ na losambo ya butu; ebɛtaka ata soki telefone ezali na kimia',
};
