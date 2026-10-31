import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Èdè · Dil',
  aciklama: 'Ẹ yan èdè ìṣàfilọ́lẹ̀. Àwọn ìfitónilétí àti kíkà sókè náà ń lò ó.',
  grup: 'Èdè ìṣàfilọ́lẹ̀',
  dilAdlari: { tr: 'Èdè Tọọkisi', en: 'Èdè Gẹ̀ẹ́sì', id: 'Èdè Indonéṣíà', de: 'Èdè Jámánì', fr: 'Èdè Faransé', bs: 'Èdè Bosnia', ru: 'Èdè Rọ́ṣíà', ms: 'Èdè Malaya', ar: 'Èdè Lárúbáwá', ur: 'Èdè Udu', es: 'Èdè Sípáníìṣì', nl: 'Èdè Dọ́ọ̀ṣì', sq: 'Èdè Albania', hi: 'Èdè Híńdì', bn: 'Èdè Bengali', fa: 'Èdè Pasia', ps: 'Páshítò', ckb: 'Ààrin Gbùngbùn Kurdish', ug: 'Yúgọ̀', az: 'Èdè Asabaijani', uz: 'Èdè Uzbek', kk: 'Kaṣakì', ky: 'Kírígíìsì', tg: 'Èdè Tàjíìkì', sw: 'Èdè Swahili', ha: 'Èdè Hausa', am: 'Èdè Amariki', om: 'Òròmọ́', so: 'Èdè ara Somalia', ff: 'Èdè Fúlàní', yo: 'Èdè Yorùbá', zh: 'Ẹdè Ṣáínà Onírọ̀rùn', ta: 'Èdè Tamili', ml: 'Málàyálámù', th: 'Èdè Tai', ko: 'Èdè Kòríà', vi: 'Èdè Jetinamu' },
  cihazDili: 'Èdè ẹ̀rọ',
  cihazDiliKullaniliyor: 'Lọ́wọ́lọ́wọ́: {ad}',
  cihazDiliDesteklenmiyor: 'Èdè ẹ̀rọ yín kò tíì sí; à ń lo Èdè Tọọkisi.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'À ń ṣàyẹ̀wò àwọn ìtumọ̀ Beta; àwọn ọ̀rọ̀ kan lè má pé.',
    vakit: 'Èdè kò yí bí a ṣe ń ṣírò àwọn àkókò ìrun padà.',
    nass: 'Ní àwọn èdè yàtọ̀ sí Èdè Tọọkisi, ìtumọ̀ Al-Ƙur’ān nìkan ni a ń fi hàn; orísun Tọọkisi ni àwọn ọ̀rọ̀ hadīth ti wá, nítorí náà a kò fi wọ́n hàn.',
  },
  ozelAnons: {
    baslik: 'Àwọn ọ̀rọ̀ kíkà sókè tí ẹ kọ',
    govde: cogul({
      other: 'Ọ̀rọ̀ kíkà sókè {n} tí ẹ kọ ṣì wà ní èdè ti tẹ́lẹ̀. Ṣé kí a fi ọ̀rọ̀ tí a ti pèsè ní èdè tuntun rọ́pò wọn?',
    }),
    degistir: 'Fi ọ̀rọ̀ tí a ti pèsè rọ́pò',
    koru: 'Fi sílẹ̀ bí ó ti wà',
    degisti: cogul({ other: 'A ti rọ́pò ọ̀rọ̀ {n}.' }),
  },
  vakitAdlari: {
    baslik: 'Orúkọ àwọn ìrun',
    aciklama: 'Ẹ yan bí a ṣe ń pe orúkọ àwọn àkókò ìrun.',
    otomatik: 'Gẹ́gẹ́ bí orílẹ̀-èdè',
    otomatikAciklama: 'Ó ń lo àwọn orúkọ tí ó wọ́pọ̀ ní orílẹ̀-èdè ibùdó yín.',
    takimlar: { temel: 'Orúkọ Lárúbáwá', diyanetDe: 'Diyanet (Jámánì)', turkce: 'Orúkọ Tọọkisi', magrip: 'Àkọtọ́ Maghreb', cezayir: 'Àkọtọ́ Algeria', afgan: 'Orúkọ Afghanistan' },
  },
  yazi: {
    baslik: 'Álífábẹ́ẹ̀tì',
    aciklama: 'Ẹ yan álífábẹ́ẹ̀tì tí a ó fi kọ ọ̀rọ̀.',
    otomatik: 'Gẹ́gẹ́ bí orílẹ̀-èdè',
    otomatikAciklama: 'Ó ń lo álífábẹ́ẹ̀tì tí ó wọ́pọ̀ ní orílẹ̀-èdè ibùdó yín.',
    latin: 'Álífábẹ́ẹ̀tì Látìn',
    kiril: 'Álífábẹ́ẹ̀tì Sìrílíìkì',
  },
  kaydedilemedi: 'A kò lè fi èdè náà pamọ́. Ẹ gbìyànjú lẹ́ẹ̀kan sí i.',
  sihirbazBaglantisi: 'Èdè · Dil',
  sihirbazBaglantisiAciklama: 'Yí èdè ìṣàfilọ́lẹ̀ padà',
};
