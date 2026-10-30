// ÇEVİRİ: yo — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Language · Dil',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Èdè Tọọkisi', en: 'Èdè Gẹ̀ẹ́sì', id: 'Èdè Indonéṣíà', de: 'Èdè Jámánì', fr: 'Èdè Faransé', bs: 'Èdè Bosnia', ru: 'Èdè Rọ́ṣíà', ms: 'Èdè Malaya', ar: 'Èdè Lárúbáwá', ur: 'Èdè Udu', es: 'Èdè Sípáníìṣì', nl: 'Èdè Dọ́ọ̀ṣì', sq: 'Èdè Albania', hi: 'Èdè Híńdì', bn: 'Èdè Bengali', fa: 'Èdè Pasia', ps: 'Páshítò', ckb: 'Ààrin Gbùngbùn Kurdish', ug: 'Yúgọ̀', az: 'Èdè Asabaijani', uz: 'Èdè Uzbek', kk: 'Kaṣakì', ky: 'Kírígíìsì', tg: 'Èdè Tàjíìkì', sw: 'Èdè Swahili', ha: 'Èdè Hausa', am: 'Èdè Amariki', om: 'Òròmọ́', so: 'Èdè ara Somalia', ff: 'Èdè Fúlàní', yo: 'Èdè Yorùbá' },
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
