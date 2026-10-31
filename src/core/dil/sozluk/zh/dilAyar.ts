// ÇEVİRİ: zh — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Language · Dil',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: '土耳其语', en: '英语', id: '印度尼西亚语', de: '德语', fr: '法语', bs: '波斯尼亚语', ru: '俄语', ms: '马来语', ar: '阿拉伯语', ur: '乌尔都语', es: '西班牙语', nl: '荷兰语', sq: '阿尔巴尼亚语', hi: '印地语', bn: '孟加拉语', fa: '波斯语', ps: '普什图语', ckb: '中库尔德语', ug: '维吾尔语', az: '阿塞拜疆语', uz: '乌兹别克语', kk: '哈萨克语', ky: '柯尔克孜语', tg: '塔吉克语', sw: '斯瓦希里语', ha: '豪萨语', am: '阿姆哈拉语', om: '奥罗莫语', so: '索马里语', ff: '富拉语', yo: '约鲁巴语', zh: '简体中文', ta: '泰米尔语', ml: '马拉雅拉姆语', th: '泰语', ko: '韩语', vi: '越南语' },
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
