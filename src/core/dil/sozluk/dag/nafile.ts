import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile "naafila" (QE). Teheccüd dag.wikipedia "Tahajud"; Duha ve Awwabin Arapça adlarıyla. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajud' },
  aciklamalar: {
    kusluk:
      'Di piligirila wuntaŋ puhibu nyaaŋa minti 45 ka naai pɔi ka Azafari paai minti 10. Ishraq nyɛla di saha din daŋ; din mali alibarika pam nyɛla dabsili maa pirigili yini gari nyaaŋa.',
    evvabin: 'Bɛ puhirili li Magarbi nyaaŋa, hali ni Isha’i saha.',
    teheccud: 'Bɛ puhirili li gbihibu mini yiɣisibu nyaaŋa Isha’i nyaaŋa, hali ni Subaahi saha. Di saha din mali alibarika pam nyɛla yuŋ pirigili ata puuni din bahi.',
  },
  bilgiBugun: '{aciklama}\n\nZuŋɔ: {bas} – {son}',
  enFaziletli: ' · alibarika pam {saat} nyaaŋa',
  sonUcteBir: ' · pirigili din bahi {saat}',
  durumAktif: 'Saha paaya · di naai {saat}',
  durumNafile: 'Naafila · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha saha',
    kuslukSuruyor: 'Duha saha beni; yi ni tooi puhi hali ni {son}.',
    kuslukGirdi: 'Duha saha paaya. Saha suŋ n-ti rakaa ayi; di ni naai {son}.',
    kuslukBitiyor: cogul({ one: 'Minti {n} n-kpalim Duha saha ni. Saha suŋ n-ti rakaa ayi; di ni naai {son}.', other: 'Minti {n} n-kpalim Duha saha ni. Saha suŋ n-ti rakaa ayi; di ni naai {son}.' }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Saha na be n-ti Awwabin. Isha’i ni paai {son}.',
    evvabinGirdi: 'Magarbi nyaaŋa, saha suŋ n-ti Awwabin. Isha’i ni paai {son}.',
    evvabinKalan: cogul({ one: 'Minti {n} n-kpalim n-ti Awwabin. Isha’i ni paai {son}.', other: 'Minti {n} n-kpalim n-ti Awwabin. Isha’i ni paai {son}.' }),
    teheccudBaslik: 'Tahajud saha',
    uyandirSonUcte: 'Yiɣisimi ya; yuŋ pirigili din bahi piligiya. Subaahi ni paai {son}.',
    uyandirKalan: cogul({ one: 'Yiɣisimi ya; minti {n} n-kpalim pɔi ka Subaahi paai. Subaahi ni paai {son}.', other: 'Yiɣisimi ya; minti {n} n-kpalim pɔi ka Subaahi paai. Subaahi ni paai {son}.' }),
    sonUcteBaslik: 'Yuŋ pirigili din bahi',
    sonUcteGovde: 'Hawa shɛŋa din mali alibarika pam n-ti Tahajud. Subaahi ni paai {son}.',
    teheccudKalan: cogul({ one: 'Minti {n} n-kpalim pɔi ka Subaahi paai. Saha suŋ n-ti Tahajud.', other: 'Minti {n} n-kpalim pɔi ka Subaahi paai. Saha suŋ n-ti Tahajud.' }),
  },
  uyandirmaKanali: 'Tahajud yiɣisibu',
  uyandirmaKanaliAciklama: 'Di yiɣisiri ya yuŋ jiŋli zuɣu; di kumdi hali kukoli yi kpariya',
};
