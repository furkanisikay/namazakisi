// ÇEVİRİ: vi — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Language · Dil',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Tiếng Thổ Nhĩ Kỳ', en: 'Tiếng Anh', id: 'Tiếng Indonesia', de: 'Tiếng Đức', fr: 'Tiếng Pháp', bs: 'Tiếng Bosnia', ru: 'Tiếng Nga', ms: 'Tiếng Mã Lai', ar: 'Tiếng Ả Rập', ur: 'Tiếng Urdu', es: 'Tiếng Tây Ban Nha', nl: 'Tiếng Hà Lan', sq: 'Tiếng Albania', hi: 'Tiếng Hindi', bn: 'Tiếng Bangla', fa: 'Tiếng Ba Tư', ps: 'Tiếng Pashto', ckb: 'Tiếng Kurd Miền Trung', ug: 'Tiếng Uyghur', az: 'Tiếng Azerbaijan', uz: 'Tiếng Uzbek', kk: 'Tiếng Kazakh', ky: 'Tiếng Kyrgyz', tg: 'Tiếng Tajik', sw: 'Tiếng Swahili', ha: 'Tiếng Hausa', am: 'Tiếng Amharic', om: 'Tiếng Oromo', so: 'Tiếng Somali', ff: 'Tiếng Fulah', yo: 'Tiếng Yoruba', zh: 'Tiếng Trung (Giản thể)', ta: 'Tiếng Tamil', ml: 'Tiếng Malayalam', th: 'Tiếng Thái', ko: 'Tiếng Hàn', vi: 'Tiếng Việt' },
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
