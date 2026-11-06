import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile namaz adları Arapça (meal yazım düzeniyle); "àṣegbọrẹ" = nafile (17:79). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Ḍuḥā', evvabin: 'Awwābīn', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Ḍuḥā', evvabin: 'Awwābīn', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Ó ń bẹ̀rẹ̀ ní nǹkan bí ìṣẹ́jú 45 lẹ́yìn yíyọ òòrùn, ó sì máa ń wà títí di ìṣẹ́jú 10 ṣáájú Ṭḥuhr. Ishrāq ni àkókò rẹ̀ tó ṣáájú jùlọ; èyí tó lọ́lá jùlọ ni lẹ́yìn tí ìdá mẹ́rin àkọ́kọ́ ọjọ́ bá kọjá.',
    evvabin: 'A máa ń kí i lẹ́yìn Mọgrib, títí di àkókò ‘Iṣā’.',
    teheccud: 'A máa ń kí i lẹ́yìn tí a bá sùn tí a sì jí lẹ́yìn ‘Iṣā’, títí di àkókò Subh. Àkókò rẹ̀ tó lọ́lá jùlọ ni ìdá mẹ́ta tó kẹ́yìn òru.',
  },
  bilgiBugun: '{aciklama}\n\nÒní: {bas} – {son}',
  enFaziletli: ' · èyí tó lọ́lá jùlọ lẹ́yìn {saat}',
  sonUcteBir: ' · ìdá mẹ́ta tó kẹ́yìn {saat}',
  durumAktif: 'Àkókò ti wọlé · yóò parí {saat}',
  durumNafile: 'Àṣegbọrẹ · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Àkókò Ḍuḥā',
    kuslukSuruyor: 'Àkókò Ḍuḥā ń lọ lọ́wọ́; o lè kírun títí di {son}.',
    kuslukGirdi: 'Àkókò Ḍuḥā ti wọlé. Àsìkò tó dára fún rak‘ah méjì; yóò wà títí di {son}.',
    kuslukBitiyor: cogul({
      other: 'Ìṣẹ́jú {n} ló kù nínú àkókò Ḍuḥā. Àsìkò tó dára fún rak‘ah méjì; yóò wà títí di {son}.',
    }),
    evvabinBaslik: 'Awwābīn',
    evvabinSuruyor: 'Àkókò ṣì wà fún Awwābīn. ‘Iṣā’ yóò wọlé ní {son}.',
    evvabinGirdi: 'Lẹ́yìn Mọgrib, àsìkò tó dára fún Awwābīn. ‘Iṣā’ yóò wọlé ní {son}.',
    evvabinKalan: cogul({ other: 'Ìṣẹ́jú {n} ló kù fún Awwābīn. ‘Iṣā’ yóò wọlé ní {son}.' }),
    teheccudBaslik: 'Àkókò Tahajjud',
    uyandirSonUcte: 'Dìde; ìdá mẹ́ta tó kẹ́yìn òru ti bẹ̀rẹ̀. Subh yóò wọlé ní {son}.',
    uyandirKalan: cogul({ other: 'Dìde; ìṣẹ́jú {n} ló kù kí Subh tó wọlé. Subh yóò wọlé ní {son}.' }),
    sonUcteBaslik: 'Ìdá mẹ́ta tó kẹ́yìn òru',
    sonUcteGovde: 'Àwọn wákàtí tó ní ìbùkún jùlọ fún Tahajjud. Subh yóò wọlé ní {son}.',
    teheccudKalan: cogul({ other: 'Ìṣẹ́jú {n} ló kù kí Subh tó wọlé. Àsìkò tó dára fún Tahajjud.' }),
  },
  uyandirmaKanali: 'Ìjíǹde Tahajjud',
  uyandirmaKanaliAciklama: 'Ó ń jí yín fún ìrun òru; ó máa ń dún kódà ní ipò ìdákẹ́jẹ́ẹ́',
};
