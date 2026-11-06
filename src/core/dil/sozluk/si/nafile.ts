import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Kuşluk ළුහා (HE si), teheccüd තහජ්ජුද් (ACJU, QE 17:79); evvabin ve işrak Sinhala kaynakta yok (harf çevirisi, DOĞRULANMADI). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ළුහා', evvabin: 'අව්වාබීන්', teheccud: 'තහජ්ජුද්' },
  kucuk: { kusluk: 'ළුහා', evvabin: 'අව්වාබීන්', teheccud: 'තහජ්ජුද්' },
  aciklamalar: {
    kusluk:
      'හිරු උදාවෙන් මිනිත්තු 45කට පමණ පසු ආරම්භ වී ලුහර්ට මිනිත්තු 10කට පෙර දක්වා පවතී. ඉෂ්රාක් එහි මුල්ම වේලාවයි; දවසේ පළමු කාර්තුව ගත වූ පසු වේලාව වඩාත් උතුම්ය.',
    evvabin: 'මග්රිබ්ගෙන් පසු, ඉෂා වේලාව දක්වා ඉටු කෙරේ.',
    teheccud: 'ඉෂාවෙන් පසු නිදා අවදි වී, ෆජ්ර් වේලාව දක්වා ඉටු කෙරේ. වඩාත් උතුම් වේලාව රාත්‍රියේ අවසන් තුනෙන් එකයි.',
  },
  bilgiBugun: '{aciklama}\n\nඅද: {bas} – {son}',
  enFaziletli: ' · {saat}න් පසු වඩාත් උතුම්',
  sonUcteBir: ' · අවසන් තුනෙන් එක {saat}',
  durumAktif: 'වේලාව එළඹ ඇත · {saat}ට අවසන්',
  durumNafile: 'නෆ්ල් · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'ළුහා වේලාව',
    kuslukSuruyor: 'ළුහා වේලාව පවතී; {son} දක්වා ඉටු කළ හැක.',
    kuslukGirdi: 'ළුහා වේලාව එළඹ ඇත. රකආත් දෙකක් සඳහා හොඳ මොහොතකි; {son} දක්වා පවතී.',
    kuslukBitiyor: cogul({
      one: 'ළුහා වේලාවට තව මිනිත්තු {n}යි. රකආත් දෙකක් සඳහා හොඳ මොහොතකි; {son} දක්වා පවතී.',
      other: 'ළුහා වේලාවට තව මිනිත්තු {n}යි. රකආත් දෙකක් සඳහා හොඳ මොහොතකි; {son} දක්වා පවතී.',
    }),
    evvabinBaslik: 'අව්වාබීන්',
    evvabinSuruyor: 'අව්වාබීන් සඳහා තවම වේලාව ඇත. ඉෂා {son}ට ආරම්භ වේ.',
    evvabinGirdi: 'මග්රිබ්ගෙන් පසු අව්වාබීන් සඳහා හොඳ මොහොතකි. ඉෂා {son}ට ආරම්භ වේ.',
    evvabinKalan: cogul({
      one: 'අව්වාබීන් සඳහා තව මිනිත්තු {n}යි. ඉෂා {son}ට ආරම්භ වේ.',
      other: 'අව්වාබීන් සඳහා තව මිනිත්තු {n}යි. ඉෂා {son}ට ආරම්භ වේ.',
    }),
    teheccudBaslik: 'තහජ්ජුද් වේලාව',
    uyandirSonUcte: 'නැගිටින්න; රාත්‍රියේ අවසන් තුනෙන් එක ආරම්භ විය. ෆජ්ර් {son}ට ආරම්භ වේ.',
    uyandirKalan: cogul({
      one: 'නැගිටින්න; ෆජ්ර්ට තව මිනිත්තු {n}යි. ෆජ්ර් {son}ට ආරම්භ වේ.',
      other: 'නැගිටින්න; ෆජ්ර්ට තව මිනිත්තු {n}යි. ෆජ්ර් {son}ට ආරම්භ වේ.',
    }),
    sonUcteBaslik: 'රාත්‍රියේ අවසන් තුනෙන් එක',
    sonUcteGovde: 'තහජ්ජුද් සඳහා වඩාත් ආශිර්වාදිත පැය. ෆජ්ර් {son}ට ආරම්භ වේ.',
    teheccudKalan: cogul({
      one: 'ෆජ්ර්ට තව මිනිත්තු {n}යි. තහජ්ජුද් සඳහා හොඳ වේලාවකි.',
      other: 'ෆජ්ර්ට තව මිනිත්තු {n}යි. තහජ්ජුද් සඳහා හොඳ වේලාවකි.',
    }),
  },
  uyandirmaKanali: 'තහජ්ජුද් අවදි කිරීම',
  uyandirmaKanaliAciklama: 'රාත්‍රී සලාතය සඳහා ඔබව අවදි කරයි; නිහඬ ප්‍රකාරයේදී පවා නාද වේ',
};
