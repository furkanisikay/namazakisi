// ÇEVİRİ: ko — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Language · Dil',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: '튀르키예어', en: '영어', id: '인도네시아어', de: '독일어', fr: '프랑스어', bs: '보스니아어', ru: '러시아어', ms: '말레이어', ar: '아랍어', ur: '우르두어', es: '스페인어', nl: '네덜란드어', sq: '알바니아어', hi: '힌디어', bn: '벵골어', fa: '페르시아어', ps: '파슈토어', ckb: '소라니 쿠르드어', ug: '위구르어', az: '아제르바이잔어', uz: '우즈베크어', kk: '카자흐어', ky: '키르기스어', tg: '타지크어', sw: '스와힐리어', ha: '하우사어', am: '암하라어', om: '오로모어', so: '소말리아어', ff: '풀라어', yo: '요루바어', zh: '중국어(간체)', ta: '타밀어', ml: '말라얄람어', th: '태국어', ko: '한국어', vi: '베트남어' },
  cihazDili: 'Device language',
  cihazDiliKullaniliyor: 'Currently {ad}',
  cihazDiliDesteklenmiyor: "Your device language isn't available yet; Turkish is used.",
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta translations are being reviewed; some text may be imperfect.',
    vakit: "The language doesn't change how prayer times are calculated.",
    nass: 'In languages other than Turkish, only Quran translations are shown; hadith texts come from a Turkish source, so they are not shown.',
  },
  ozelAnons: {
    baslik: 'Read-aloud texts you wrote',
    govde: cogul({
      one: '{n} read-aloud text you wrote is still in the previous language. Replace it with the ready-made text in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', other: '{n} texts replaced.' }),
  },
  vakitAdlari: {
    baslik: 'Prayer names',
    aciklama: 'Choose how prayer times are named.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the names common in the country of your location.',
    takimlar: { temel: 'Arabic names', diyanetDe: 'Diyanet (German)', turkce: 'Turkish names', magrip: 'Maghrebi spelling', cezayir: 'Algerian spelling', afgan: 'Afghan names' },
  },
  yazi: {
    baslik: 'Alphabet',
    aciklama: 'Choose which alphabet text is written in.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the alphabet common in the country of your location.',
    latin: 'Latin alphabet',
    kiril: 'Cyrillic alphabet',
  },
  kaydedilemedi: "The language couldn't be saved. Try again.",
  sihirbazBaglantisi: 'Language · Dil',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
