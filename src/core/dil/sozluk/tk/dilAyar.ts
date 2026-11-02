// ÇEVİRİ: tk — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Dil · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Türk dili', en: 'Iňlis dili', id: 'Indonez dili', de: 'Nemes dili', fr: 'Fransuz dili', bs: 'Bosniýa dili', ru: 'Rus dili', ms: 'Malaý dili', ar: 'Arap dili', ur: 'Urdu', es: 'Ispan dili', nl: 'Niderland dili', sq: 'Alban dili', hi: 'Hindi dili', bn: 'Bengal dili', fa: 'Pars dili', ps: 'Peştun dili', ckb: 'Merkezi kürt dili', ug: 'Uýgur dili', az: 'Azerbaýjan dili', uz: 'Özbek dili', kk: 'Gazak dili', ky: 'Gyrgyz dili', tg: 'Täjik dili', sw: 'Suahili dili', ha: 'Hausa dili', am: 'Amhar dili', om: 'Oromo dili', so: 'Somali dili', ff: 'Fula dili', yo: 'Ýoruba dili', zh: 'Ýönekeýleşdirilen hytaý dili', ta: 'Tamil dili', ml: 'Malaýalam dili', th: 'Taý dili', ko: 'Koreý dili', vi: 'Wýetnam dili', pt: 'Portugal dili', it: 'Italýan dili', sv: 'Şwed dili', uk: 'Ukrain dili', ro: 'Rumyn dili', hr: 'Horwat dili', sr: 'Serb dili', el: 'Grek dili', ku: 'Kürt dili (Kurmancî)', tk: 'Türkmen dili', tt: 'Tatar dili', sd: 'Sindhi dili', pl: 'Polýak dili', ja: 'Ýapon dili', gu: 'Gujarati dili', bg: 'Bolgar dili', mk: 'Makedon dili' },
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
  sihirbazBaglantisi: 'Dil · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
