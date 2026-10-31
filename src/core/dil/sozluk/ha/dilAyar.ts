import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Dil adları CLDR (Hausa, `Intl.DisplayNames(['ha'])`). */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Harshe · Language',
  aciklama: 'Ku zaɓi harshen manhaja. Sanarwa da karatu da murya ma suna amfani da shi.',
  grup: 'Harshen manhaja',
  dilAdlari: { tr: 'Harshen Turkiyya', en: 'Turanci', id: 'Harshen Indunusiya', de: 'Jamusanci', fr: 'Faransanci', bs: 'Bosniyanci', ru: 'Rashanci', ms: 'Harshen Malay', ar: 'Larabci', ur: 'Urdanci', es: 'Sifaniyanci', nl: 'Holanci', sq: 'Albaniyanci', hi: 'Harshen Hindi', bn: 'Bengali', fa: 'Farisanci', ps: 'Pashtanci', ckb: 'Kurdawa ta Tsakiya', ug: 'Ugiranci', az: 'Azerbaijanci', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kirgizanci', tg: 'Tajik', sw: 'Harshen Suwahili', ha: 'Hausa', am: 'Amharik', om: 'Oromo', so: 'Somalianci', ff: 'Fula', yo: 'Yarbanci', zh: 'Sauƙaƙaƙƙen Sinanci', ta: 'Tamil', ml: 'Malayalamci', th: 'Thai', ko: 'Harshen Koriya', vi: 'Harshen Biyetinam' },
  cihazDili: 'Harshen naʼura',
  cihazDiliKullaniliyor: 'A yanzu {ad}',
  cihazDiliDesteklenmiyor: 'Harshen naʼurarku ba ya samuwa tukuna; ana amfani da Harshen Turkiyya.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Ana duba fassarorin Beta; wasu rubutu na iya zama ba cikakke ba.',
    vakit: 'Harshe ba ya canja yadda ake lissafa lokutan salla.',
    nass: 'A harsunan da ba Harshen Turkiyya ba, fassarar Alƙurʼani kaɗai ake nunawa; rubutun hadisi daga tushen Turkiyya suke, don haka ba a nuna su.',
  },
  ozelAnons: {
    baslik: 'Rubutun karatu da murya da kuka rubuta',
    govde: cogul({
      one: 'Rubutun karatu da murya {n} da kuka rubuta yana nan a harshen baya. A maye gurbinsa da rubutun da aka shirya a sabon harshe?',
      other: 'Rubutun karatu da murya {n} da kuka rubuta suna nan a harshen baya. A maye gurbinsu da rubutun da aka shirya a sabon harshe?',
    }),
    degistir: 'Maye da rubutun da aka shirya',
    koru: 'Bar shi yadda yake',
    degisti: cogul({ one: 'An maye rubutu {n}.', other: 'An maye rubutu {n}.' }),
  },
  vakitAdlari: {
    baslik: 'Sunayen salloli',
    aciklama: 'Ku zaɓi yadda ake kiran lokutan salla.',
    otomatik: 'Bisa ga ƙasa',
    otomatikAciklama: 'Yana amfani da sunayen da suka saba a ƙasar wurinku.',
    takimlar: { temel: 'Sunayen Larabci', diyanetDe: 'Diyanet (Jamusanci)', turkce: 'Sunayen Turkiyya', magrip: 'Rubutun Magrib', cezayir: 'Rubutun Aljeriya', afgan: 'Sunayen Afghanistan' },
  },
  yazi: {
    baslik: 'Haruffa',
    aciklama: 'Ku zaɓi haruffan da ake rubuta rubutu da su.',
    otomatik: 'Bisa ga ƙasa',
    otomatikAciklama: 'Yana amfani da haruffan da suka saba a ƙasar wurinku.',
    latin: 'Haruffan Latin',
    kiril: 'Haruffan Cyrillic',
  },
  kaydedilemedi: 'Ba a iya ajiye harshe ba. Sake gwadawa.',
  sihirbazBaglantisi: 'Harshe · Language',
  sihirbazBaglantisiAciklama: 'Canja harshen manhaja',
};
