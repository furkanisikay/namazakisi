// ÇEVİRİ: ja — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: '言語 · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'トルコ語', en: '英語', id: 'インドネシア語', de: 'ドイツ語', fr: 'フランス語', bs: 'ボスニア語', ru: 'ロシア語', ms: 'マレー語', ar: 'アラビア語', ur: 'ウルドゥー語', es: 'スペイン語', nl: 'オランダ語', sq: 'アルバニア語', hi: 'ヒンディー語', bn: 'ベンガル語', fa: 'ペルシア語', ps: 'パシュトゥー語', ckb: '中央クルド語', ug: 'ウイグル語', az: 'アゼルバイジャン語', uz: 'ウズベク語', kk: 'カザフ語', ky: 'キルギス語', tg: 'タジク語', sw: 'スワヒリ語', ha: 'ハウサ語', am: 'アムハラ語', om: 'オロモ語', so: 'ソマリ語', ff: 'フラ語', yo: 'ヨルバ語', zh: '簡体中国語', ta: 'タミル語', ml: 'マラヤーラム語', th: 'タイ語', ko: '韓国語', vi: 'ベトナム語', pt: 'ポルトガル語', it: 'イタリア語', sv: 'スウェーデン語', uk: 'ウクライナ語', ro: 'ルーマニア語', hr: 'クロアチア語', sr: 'セルビア語', el: 'ギリシャ語', ku: 'クルド語 (Kurmancî)', tk: 'トルクメン語', tt: 'タタール語', sd: 'シンド語', pl: 'ポーランド語', ja: '日本語', gu: 'グジャラート語', bg: 'ブルガリア語', mk: 'マケドニア語' },
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
  sihirbazBaglantisi: '言語 · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
