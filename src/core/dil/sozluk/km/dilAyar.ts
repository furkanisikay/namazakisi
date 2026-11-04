// ÇEVİRİ: km — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'ភាសា · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'ទួរគី', en: 'អង់គ្លេស', id: 'ឥណ្ឌូណេស៊ី', de: 'អាល្លឺម៉ង់', fr: 'បារាំង', bs: 'បូស្ន៊ី', ru: 'រុស្ស៊ី', ms: 'ម៉ាឡេ', ar: 'អារ៉ាប់', ur: 'អ៊ូរឌូ', es: 'អេស្ប៉ាញ', nl: 'ហូឡង់', sq: 'អាល់បានី', hi: 'ហិណ្ឌី', bn: 'បង់ក្លាដែស', fa: 'ភឺសៀន', ps: 'បាស្តូ', ckb: 'ឃើដភាគកណ្តាល', ug: 'អ៊ុយហ្គឺរ', az: 'អាស៊ែបៃហ្សង់', uz: 'អ៊ូសបេគ', kk: 'កាហ្សាក់', ky: '​កៀហ្ស៊ីស', tg: 'តាហ្ស៊ីគ', sw: 'ស្វាហ៊ីលី', ha: 'ហូសា', am: 'អាំហារិក', om: 'អូរ៉ូម៉ូ', so: 'សូម៉ាលី', ff: 'ហ្វ៊ូឡា', yo: 'យរូបា', zh: 'ចិន​អក្សរ​កាត់', ta: 'តាមីល', ml: 'ម៉ាឡាយ៉ាឡាម', th: 'ថៃ', ko: 'កូរ៉េ', vi: 'វៀតណាម', pt: 'ព័រទុយហ្គាល់', it: 'អ៊ីតាលី', sv: 'ស៊ុយអែត', uk: 'អ៊ុយក្រែន', ro: 'រូម៉ានី', hr: 'ក្រូអាត', sr: 'ស៊ែប', el: 'ក្រិក', ku: 'ឃឺដ (Kurmancî)', tk: 'តួកម៉េន', tt: 'តាតា', sd: 'ស៊ីនឌី', pl: 'ប៉ូឡូញ', ja: 'ជប៉ុន', gu: 'ហ្គុយ៉ារ៉ាទី', bg: 'ប៊ុលហ្ការី', mk: 'ម៉ាសេដូនី', fil: 'ហ្វ៊ីលីពីន', te: 'តេលុគុ', kn: 'ខាណាដា', mr: 'ម៉ារ៉ាធី', pa: 'បឹនជាពិ (អារ៉ាប់, ប៉ាគីស្ថាន)', as: 'អាសាមីស', ne: 'នេប៉ាល់', si: 'ស្រីលង្កា', km: 'ខ្មែរ' },
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
  sihirbazBaglantisi: 'ភាសា · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
