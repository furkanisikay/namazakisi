// ÇEVİRİ: ku — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ziman · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Tirkî', en: 'Îngilîzî', id: 'Endonezyayî', de: 'Almanî', fr: 'Fransizî', bs: 'Bosnî', ru: 'Rûsî', ms: 'Malezî', ar: 'Erebî', ur: 'Urdûyî', es: 'Spanî', nl: 'Holendî', sq: 'Arnawidî', hi: 'Hindî', bn: 'Bengalî', fa: 'Farisî', ps: 'Peştûyî', ckb: 'Kurdî (Soranî)', ug: 'Oygurî', az: 'Azerî', uz: 'Ozbekî', kk: 'Qazaxî', ky: 'Kirgizî', tg: 'Tacikî', sw: 'Swahîlî', ha: 'Hawsayî', am: 'Amharî', om: 'Oromoyî', so: 'Somalî', ff: 'Fulahî', yo: 'Yorubayî', zh: 'Çînîya sadekirî', ta: 'Tamîlî', ml: 'Malayalamî', th: 'Tayî', ko: 'Koreyî', vi: 'Vîetnamî', pt: 'Portugalî', it: 'Îtalî', sv: 'Swêdî', uk: 'Ukraynî', ro: 'Romanî', hr: 'Xirwatî', sr: 'Sirbî', el: 'Yûnanî', ku: 'Kurdî (Kurmancî)', tk: 'Tirkmenî', tt: 'Teterî', sd: 'Sindhî', pl: 'Polonî', ja: 'Japonî', gu: 'Gujaratî', bg: 'Bulgarî', mk: 'Makedonî' },
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
  sihirbazBaglantisi: 'Ziman · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
