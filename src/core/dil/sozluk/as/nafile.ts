import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları HadeethEnc/IslamHouse as: চাশত, আওৱাবীন, তাহাজ্জুদ; rekât ৰাকাত. İşrak (ইশৰাক) kaynakta yok. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'চাশত', evvabin: 'আওৱাবীন', teheccud: 'তাহাজ্জুদ' },
  kucuk: { kusluk: 'চাশত', evvabin: 'আওৱাবীন', teheccud: 'তাহাজ্জুদ' },
  aciklamalar: {
    kusluk:
      'সূৰ্যোদয়ৰ প্ৰায় 45 মিনিট পিছত আৰম্ভ হয় আৰু জোহৰৰ 10 মিনিট আগলৈকে থাকে। ইশৰাক ইয়াৰ আটাইতকৈ আগৰ সময়; দিনৰ প্ৰথম চতুৰ্থাংশ পাৰ হোৱাৰ পিছৰ সময় আটাইতকৈ উত্তম।',
    evvabin: 'মাগৰিবৰ পিছত ঈশ্বাৰ ওৱাক্তলৈকে পঢ়া হয়।',
    teheccud: 'ঈশ্বাৰ পিছত শুই উঠি ফজৰৰ ওৱাক্তলৈকে পঢ়া হয়। ইয়াৰ আটাইতকৈ উত্তম সময় ৰাতিৰ শেষ তৃতীয়াংশ।',
  },
  bilgiBugun: '{aciklama}\n\nআজি: {bas} – {son}',
  enFaziletli: ' · {saat} বজাৰ পিছত আটাইতকৈ উত্তম',
  sonUcteBir: ' · শেষ তৃতীয়াংশ {saat}',
  durumAktif: 'সময় আৰম্ভ হ’ল · {saat} বজাত শেষ',
  durumNafile: 'নফল · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'চাশতৰ সময়',
    kuslukSuruyor: 'চাশতৰ সময় চলি আছে; {son} বজালৈ পঢ়িব পাৰে।',
    kuslukGirdi: 'চাশতৰ সময় আৰম্ভ হ’ল। দুই ৰাকাতৰ বাবে ভাল সময়; {son} বজালৈ থাকিব।',
    kuslukBitiyor: cogul({
      one: 'চাশতৰ সময়ৰ {n} মিনিট বাকী। দুই ৰাকাতৰ বাবে ভাল সময়; {son} বজালৈ থাকিব।',
      other: 'চাশতৰ সময়ৰ {n} মিনিট বাকী। দুই ৰাকাতৰ বাবে ভাল সময়; {son} বজালৈ থাকিব।',
    }),
    evvabinBaslik: 'আওৱাবীন',
    evvabinSuruyor: 'আওৱাবীনৰ বাবে এতিয়াও সময় আছে। ঈশ্বা {son} বজাত আৰম্ভ হ’ব।',
    evvabinGirdi: 'মাগৰিবৰ পিছত আওৱাবীনৰ বাবে ভাল সময়। ঈশ্বা {son} বজাত আৰম্ভ হ’ব।',
    evvabinKalan: cogul({ one: 'আওৱাবীনৰ বাবে {n} মিনিট বাকী। ঈশ্বা {son} বজাত আৰম্ভ হ’ব।', other: 'আওৱাবীনৰ বাবে {n} মিনিট বাকী। ঈশ্বা {son} বজাত আৰম্ভ হ’ব।' }),
    teheccudBaslik: 'তাহাজ্জুদৰ সময়',
    uyandirSonUcte: 'উঠক; ৰাতিৰ শেষ তৃতীয়াংশ আৰম্ভ হ’ল। ফজৰ {son} বজাত আৰম্ভ হ’ব।',
    uyandirKalan: cogul({ one: 'উঠক; ফজৰলৈ {n} মিনিট বাকী। ফজৰ {son} বজাত আৰম্ভ হ’ব।', other: 'উঠক; ফজৰলৈ {n} মিনিট বাকী। ফজৰ {son} বজাত আৰম্ভ হ’ব।' }),
    sonUcteBaslik: 'ৰাতিৰ শেষ তৃতীয়াংশ',
    sonUcteGovde: 'তাহাজ্জুদৰ বাবে আটাইতকৈ বৰকতময় সময়। ফজৰ {son} বজাত আৰম্ভ হ’ব।',
    teheccudKalan: cogul({ one: 'ফজৰলৈ {n} মিনিট বাকী। তাহাজ্জুদৰ বাবে ভাল সময়।', other: 'ফজৰলৈ {n} মিনিট বাকী। তাহাজ্জুদৰ বাবে ভাল সময়।' }),
  },
  uyandirmaKanali: 'তাহাজ্জুদৰ বাবে জগোৱা',
  uyandirmaKanaliAciklama: 'ৰাতিৰ নামাজৰ বাবে আপোনাক জগায়; নীৰৱ ম’ডতো বাজে',
};
