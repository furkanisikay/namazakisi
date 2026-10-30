import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: tekil emir, kısa; secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'ló kù', girisindenItibaren: 'ti kọjá' },
  cip: { vakit: 'Orúkọ ìrun', sure: 'Ìṣẹ́jú', yon: 'ló kù / ti kọjá', cuma: 'Jum‘ah', yatsi: '‘Iṣā’' },
  sablon: {
    muhafizCikis: [
      'Àkókò {vakit} ń parí, ìṣẹ́jú {süre} ló kù.',
      'Má ṣe jẹ́ kí {vakit} bọ́ lọ́wọ́ rẹ, ìṣẹ́jú {süre} ló kù.',
      'Àkókò ń kúrú, ìṣẹ́jú {süre} ló kù kí {vakit} tó parí.',
    ],
    muhafizGiris: [
      'Àkókò {vakit} ti wọlé, ìṣẹ́jú {süre} ti kọjá.',
      'Má fi {vakit} falẹ̀, ìṣẹ́jú {süre} ti kọjá.',
      'Àkókò ń lọ, dúró kí {vakit}, ìṣẹ́jú {süre} ti kọjá.',
    ],
    nafile: [
      'Àkókò {vakit}, ìṣẹ́jú {süre} {yön}. Àsìkò tó dára fún rak‘ah méjì.',
      'Àkókò {vakit} ń lọ lọ́wọ́. Àǹfààní tó dára láti kí rak‘ah méjì.',
      'Ìṣẹ́jú {süre} {yön} fún {vakit}.',
    ],
    cuma: [
      'Ìṣẹ́jú {süre} ló kù sí Jum‘ah. Múra, kí o sì lọ sí mọ́sálásí.',
      'Jum‘ah ń súnmọ́, ìṣẹ́jú {süre} ló kù.',
      'Bá khuṭbah, ìṣẹ́jú {süre} ló kù sí Jum‘ah.',
    ],
    camiyeGit: [
      'Ìṣẹ́jú {süre} ló kù sí {vakit}. Lọ sí mọ́sálásí.',
      'Àkókò láti lọ sí mọ́sálásí, ìṣẹ́jú {süre} ló kù sí {vakit}.',
      'Lọ sí mọ́sálásí fún {vakit}.',
    ],
    yatis: ['Kí ìrun ‘Iṣā’ kí o tó lọ sùn.', 'Àkókò ‘Iṣā’ ṣì wà, dúró kírun kí o tó sùn.', 'Má sùn kí o tó kí ìrun ‘Iṣā’.'],
    takvim: [
      'Ìṣẹ̀lẹ̀ kan nínú kàlẹ́ńdà rẹ bọ́ sí àkókò {vakit}.',
      'Àkókò {vakit} kọlu ìṣẹ̀lẹ̀ kan; má gbàgbé láti kọ́kọ́ kírun.',
      'Lẹ́yìn ìṣẹ́jú {süre}, àkókò {vakit} yóò kọlu ìṣẹ̀lẹ̀ rẹ; má gbàgbé ìrun rẹ.',
    ],
  },
  otomatik: {
    cuma: '{sure} ló kù sí Ṭḥuhr fún Jum‘ah. Múra, kí o sì lọ sí mọ́sálásí.',
    camiyeGiris: '{sure} ló kù sí {vakit}.',
    camiyeHazirlan: 'Múra, kí o sì lọ sí mọ́sálásí.',
    camiyeYola: 'Lọ sí mọ́sálásí.',
    takvimGiris: 'Ìṣẹ̀lẹ̀ kan nínú kàlẹ́ńdà rẹ bọ́ sí àkókò {vakit}.',
    takvimOnce: 'Má gbàgbé láti kírun ṣáájú ìṣẹ̀lẹ̀ náà.',
    takvimKaplar: 'Má gbàgbé láti sinmi díẹ̀ kí o sì kírun.',
    yatsi: 'Kí ìrun ‘Iṣā’ kí o tó lọ sùn.',
    muhasebeTek: 'Ó dà bí ẹni pé a kò sàmì sí {vakit} lónìí.',
    muhasebeCoklu: cogul({ other: 'Ó dà bí ẹni pé a kò sàmì sí ìrun {n} lónìí.' }),
    geceCapasi: 'Àkókò ìdákẹ́jẹ́ẹ́ yóò bẹ̀rẹ̀ lẹ́yìn ìṣẹ́jú {süre}. Kí {vakit} kí o tó lọ sùn.',
    kuslukSuruyor: 'Àkókò Ḍuḥā ń lọ lọ́wọ́.',
    kuslukGirdi: 'Àkókò Ḍuḥā ti wọlé. Àsìkò tó dára fún rak‘ah méjì.',
    kuslukBitiyor: cogul({ other: 'Ìṣẹ́jú {n} ló kù nínú àkókò Ḍuḥā.' }),
    evvabinSuruyor: 'Àkókò ṣì wà fún Awwābīn.',
    evvabinGirdi: 'Àkókò Awwābīn. Àsìkò tó dára fún rak‘ah méjì.',
    evvabinKalan: cogul({ other: 'Ìṣẹ́jú {n} ló kù fún Awwābīn.' }),
    teheccudSonUcte: 'Àkókò Tahajjud. Ìdá mẹ́ta tó kẹ́yìn òru ti bẹ̀rẹ̀.',
    teheccudKalan: cogul({ other: 'Àkókò Tahajjud. Ìṣẹ́jú {n} ló kù sí Subh.' }),
  },
};
