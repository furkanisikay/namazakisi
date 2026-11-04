// ÇEVİRİ: he — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'שפה · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'טורקית', en: 'אנגלית', id: 'אינדונזית', de: 'גרמנית', fr: 'צרפתית', bs: 'בוסנית', ru: 'רוסית', ms: 'מלאית', ar: 'ערבית', ur: 'אורדו', es: 'ספרדית', nl: 'הולנדית', sq: 'אלבנית', hi: 'הינדי', bn: 'בנגלית', fa: 'פרסית', ps: 'פאשטו', ckb: 'כורדית סוראנית', ug: 'אויגורית', az: 'אזרית', uz: 'אוזבקית', kk: 'קזחית', ky: 'קירגיזית', tg: 'טג׳יקית', sw: 'סווהילי', ha: 'האוסה', am: 'אמהרית', om: 'אורומו', so: 'סומלית', ff: 'פולה', yo: 'יורובה', zh: 'סינית פשוטה', ta: 'טמילית', ml: 'מליאלאם', th: 'תאית', ko: 'קוריאנית', vi: 'וייטנאמית', pt: 'פורטוגזית', it: 'איטלקית', sv: 'שוודית', uk: 'אוקראינית', ro: 'רומנית', hr: 'קרואטית', sr: 'סרבית', el: 'יוונית', ku: 'כורדית (Kurmancî)', tk: 'טורקמנית', tt: 'טטרית', sd: 'סינדהית', pl: 'פולנית', ja: 'יפנית', gu: 'גוג׳ארטי', bg: 'בולגרית', mk: 'מקדונית', fil: 'פיליפינית', te: 'טלוגו', kn: 'קנאדה', mr: 'מראטהית', pa: 'פנג׳אבי (ערבי, פקיסטן)', as: 'אסאמית', ne: 'נפאלית', si: 'סינהלה', km: 'חמרית', he: 'עברית', ka: 'גאורגית', lt: 'ליטאית', mg: 'מלגשית', lg: 'גאנדה', rw: 'קנירואנדית', rn: 'קירונדי', ln: 'לינגלה', dag: 'Dagbani', mos: 'מוסי', aa: 'אפארית', mdh: 'Maguindanao', ak: 'אקאן', ceb: 'סבואנו', nqo: 'נ׳קו' },
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
      two: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', two: '{n} texts replaced.', other: '{n} texts replaced.' }),
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
  sihirbazBaglantisi: 'שפה · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
