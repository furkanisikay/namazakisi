import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları Arapça kökenli (Duha, Awwabin, Tahajjud): Afarca kaynakta ad yok, türetildi. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Ayro mawqa lakal 45 daqiiqa fan culta, Dohori culam dumak 10 daqiiqa fan tan. Ishraaq kay naharsi wakti; kay meqe wakti laqoh naharsi affarayto bagu gexek lakal.',
    evvabin: 'Magrib salat lakal, Qisha wakti fanah abimta.',
    teheccud: 'Qisha lakal xiinaah ugutteenik, Subci wakti fanah abimta. Kay meqe wakti barti ellecaboh sidoc hayto bagu.',
  },
  bilgiBugun: '{aciklama}\n\nAsaaku: {bas} – {son}',
  enFaziletli: ' · {saat} lakal meqe',
  sonUcteBir: ' · barti ellecabo {saat}',
  durumAktif: 'Wakti cule · {saat} gexa',
  durumNafile: 'Sunnat · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha wakti',
    kuslukSuruyor: 'Duha wakti tan; {son} fanah salat abaanam dudda.',
    kuslukGirdi: 'Duha wakti cule. Namma rakqat abaanamah meqe wakti; {son} fanah tan.',
    kuslukBitiyor: cogul({
      one: 'Duha waktik {n} daqiiqa raqta. Namma rakqat abaanamah meqe wakti; {son} fanah tan.',
      other: 'Duha waktik {n} daqiiqa raqta. Namma rakqat abaanamah meqe wakti; {son} fanah tan.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Awwabinih wakti hanna tan. Qisha {son} culta.',
    evvabinGirdi: 'Magrib lakal, Awwabinih meqe wakti. Qisha {son} culta.',
    evvabinKalan: cogul({ one: 'Awwabinih {n} daqiiqa raqta. Qisha {son} culta.', other: 'Awwabinih {n} daqiiqa raqta. Qisha {son} culta.' }),
    teheccudBaslik: 'Tahajjud wakti',
    uyandirSonUcte: 'Ugutta; barti ellecabo cule. Subci {son} culta.',
    uyandirKalan: cogul({ one: 'Ugutta; Subci fanah {n} daqiiqa raqta. Subci {son} culta.', other: 'Ugutta; Subci fanah {n} daqiiqa raqta. Subci {son} culta.' }),
    sonUcteBaslik: 'Barti ellecabo',
    sonUcteGovde: 'Tahajjudih barakat le saaqoota. Subci {son} culta.',
    teheccudKalan: cogul({ one: 'Subci fanah {n} daqiiqa raqta. Tahajjudih meqe wakti.', other: 'Subci fanah {n} daqiiqa raqta. Tahajjudih meqe wakti.' }),
  },
  uyandirmaKanali: 'Tahajjudih ugussa',
  uyandirmaKanaliAciklama: 'Barti salaatah sin ugussa; xongolo mali caalal tanuk kaadu xongolo yacee',
};
