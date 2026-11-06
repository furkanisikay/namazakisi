import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kuşluk "Walaha" (Hausa'da yerleşik "Sallar Walaha"), evvâbîn "Awwabin", teheccüd "Tahajjudi" (Gummi 17:79 dipnotu "tahajjudi"). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Walaha', evvabin: 'Awwabin', teheccud: 'Tahajjudi' },
  kucuk: { kusluk: 'Walaha', evvabin: 'Awwabin', teheccud: 'Tahajjudi' },
  aciklamalar: {
    kusluk:
      'Tana farawa kusan minti 45 bayan fitowar rana kuma tana ci gaba har zuwa minti 10 kafin Azahar. Ishraƙ shi ne lokacinta na farko; mafi falala shi ne bayan kashi ɗaya cikin huɗu na yini ya wuce.',
    evvabin: 'Ana yin ta bayan Magariba, har zuwa lokacin Isha.',
    teheccud: 'Ana yin ta bayan an yi barci an farka bayan Isha, har zuwa lokacin Asuba. Lokacinta mafi falala shi ne kashi na uku na ƙarshe na dare.',
  },
  bilgiBugun: '{aciklama}\n\nYau: {bas} – {son}',
  enFaziletli: ' · mafi falala bayan {saat}',
  sonUcteBir: ' · kashi na uku na ƙarshe {saat}',
  durumAktif: 'Lokaci ya yi · zai ƙare {saat}',
  durumNafile: 'Nafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Lokacin Walaha',
    kuslukSuruyor: 'Lokacin Walaha yana nan; kana iya yin salla har zuwa {son}.',
    kuslukGirdi: 'Lokacin Walaha ya yi. Lokaci mai kyau don rakaʼa biyu; zai kai har {son}.',
    kuslukBitiyor: cogul({
      one: 'Minti {n} ya rage a lokacin Walaha. Lokaci mai kyau don rakaʼa biyu; zai kai har {son}.',
      other: 'Minti {n} sun rage a lokacin Walaha. Lokaci mai kyau don rakaʼa biyu; zai kai har {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Akwai sauran lokaci don Awwabin. Isha za ta yi da ƙarfe {son}.',
    evvabinGirdi: 'Bayan Magariba, lokaci mai kyau don Awwabin. Isha za ta yi da ƙarfe {son}.',
    evvabinKalan: cogul({
      one: 'Minti {n} ya rage don Awwabin. Isha za ta yi da ƙarfe {son}.',
      other: 'Minti {n} sun rage don Awwabin. Isha za ta yi da ƙarfe {son}.',
    }),
    teheccudBaslik: 'Lokacin Tahajjudi',
    uyandirSonUcte: 'Ka tashi; kashi na uku na ƙarshe na dare ya fara. Asuba za ta yi da ƙarfe {son}.',
    uyandirKalan: cogul({
      one: 'Ka tashi; minti {n} ya rage zuwa Asuba. Asuba za ta yi da ƙarfe {son}.',
      other: 'Ka tashi; minti {n} sun rage zuwa Asuba. Asuba za ta yi da ƙarfe {son}.',
    }),
    sonUcteBaslik: 'Kashi na uku na ƙarshe na dare',
    sonUcteGovde: 'Awowi mafi albarka don Tahajjudi. Asuba za ta yi da ƙarfe {son}.',
    teheccudKalan: cogul({
      one: 'Minti {n} ya rage zuwa Asuba. Lokaci mai kyau don Tahajjudi.',
      other: 'Minti {n} sun rage zuwa Asuba. Lokaci mai kyau don Tahajjudi.',
    }),
  },
  uyandirmaKanali: 'Tashin Tahajjudi',
  uyandirmaKanaliAciklama: 'Yana tashe ku don sallar dare; yana ƙara ko da a yanayin shiru',
};
