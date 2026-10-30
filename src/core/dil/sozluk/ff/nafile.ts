import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları Arapça kökenli, Pular sesletimine uyarlandı (Duhaa, Awwaabiin, Tahajjudi) — doğrulanmadı. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duhaa', evvabin: 'Awwaabiin', teheccud: 'Tahajjudi' },
  kucuk: { kusluk: 'duhaa', evvabin: 'awwaabiin', teheccud: 'tahajjudi' },
  aciklamalar: {
    kusluk:
      'Fuɗɗotoo hojomaaji 45 caggal puɗal naange, haa hojomaaji 10 adii fanaa. Ishraaq ko waqutu mum arano; ɓurɗo moƴƴude ko caggal nayaɓal arano ñalawma.',
    evvabin: 'Juulirtee caggal futuroo, haa waqutu geeƴe.',
    teheccud: 'Juulirtee caggal ɗaanaade e finaade caggal geeƴe, haa waqutu subaka. Waqutu mum ɓurɗo moƴƴude ko tataɓal sakkitoral jemma.',
  },
  bilgiBugun: '{aciklama}\n\nHannde: {bas} – {son}',
  enFaziletli: ' · ɓurɗo moƴƴude caggal {saat}',
  sonUcteBir: ' · tataɓal sakkitoral {saat}',
  durumAktif: 'Waqutu on heewii · gasay {saat}',
  durumNafile: 'Sunna · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Waqutu duhaa',
    kuslukSuruyor: 'Waqutu duhaa hino jokki; a waawii juulude haa {son}.',
    kuslukGirdi: 'Waqutu duhaa heewii. Ko sahaa moƴƴo ngam raka’aaji ɗiɗi; jokkoto haa {son}.',
    kuslukBitiyor: cogul({
      one: '{n} hojom heddii e waqutu duhaa. Ko sahaa moƴƴo ngam raka’aaji ɗiɗi; jokkoto haa {son}.',
      other: '{n} hojomaaji heddii e waqutu duhaa. Ko sahaa moƴƴo ngam raka’aaji ɗiɗi; jokkoto haa {son}.',
    }),
    evvabinBaslik: 'Awwaabiin',
    evvabinSuruyor: 'Waqutu hino heddii ngam awwaabiin. Geeƴe fuɗɗoto e {son}.',
    evvabinGirdi: 'Caggal futuroo, ko sahaa moƴƴo ngam awwaabiin. Geeƴe fuɗɗoto e {son}.',
    evvabinKalan: cogul({ one: '{n} hojom heddii ngam awwaabiin. Geeƴe fuɗɗoto e {son}.', other: '{n} hojomaaji heddii ngam awwaabiin. Geeƴe fuɗɗoto e {son}.' }),
    teheccudBaslik: 'Waqutu tahajjudi',
    uyandirSonUcte: 'Ummo; tataɓal sakkitoral jemma fuɗɗii. Subaka fuɗɗoto e {son}.',
    uyandirKalan: cogul({ one: 'Ummo; {n} hojom heddii haa subaka. Subaka fuɗɗoto e {son}.', other: 'Ummo; {n} hojomaaji heddii haa subaka. Subaka fuɗɗoto e {son}.' }),
    sonUcteBaslik: 'Tataɓal sakkitoral jemma',
    sonUcteGovde: 'Saa’iiji ɓurɗi barkeede ngam tahajjudi. Subaka fuɗɗoto e {son}.',
    teheccudKalan: cogul({ one: '{n} hojom heddii haa subaka. Ko sahaa moƴƴo ngam tahajjudi.', other: '{n} hojomaaji heddii haa subaka. Ko sahaa moƴƴo ngam tahajjudi.' }),
  },
  uyandirmaKanali: 'Finninde tahajjudi',
  uyandirmaKanaliAciklama: 'Finninta on ngam juulde jemma; hino sowtoo hay so talifon ko e deƴƴere',
};
