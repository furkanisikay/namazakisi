// ÇEVİRİ: sv — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Språk · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Turkiska', en: 'Engelska', id: 'Indonesiska', de: 'Tyska', fr: 'Franska', bs: 'Bosniska', ru: 'Ryska', ms: 'Malajiska', ar: 'Arabiska', ur: 'Urdu', es: 'Spanska', nl: 'Nederländska', sq: 'Albanska', hi: 'Hindi', bn: 'Bengali', fa: 'Persiska', ps: 'Afghanska', ckb: 'Centralkurdiska', ug: 'Uiguriska', az: 'Azerbajdzjanska', uz: 'Uzbekiska', kk: 'Kazakiska', ky: 'Kirgiziska', tg: 'Tadzjikiska', sw: 'Swahili', ha: 'Hausa', am: 'Amhariska', om: 'Oromo', so: 'Somaliska', ff: 'Fulani', yo: 'Yoruba', zh: 'Förenklad kinesiska', ta: 'Tamil', ml: 'Malayalam', th: 'Thailändska', ko: 'Koreanska', vi: 'Vietnamesiska', pt: 'Portugisiska', it: 'Italienska', sv: 'Svenska', uk: 'Ukrainska', ro: 'Rumänska', hr: 'Kroatiska', sr: 'Serbiska', el: 'Grekiska' },
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
  sihirbazBaglantisi: 'Språk · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
