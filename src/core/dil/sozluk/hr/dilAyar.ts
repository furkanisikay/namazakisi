// ÇEVİRİ: hr — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Jezik · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Turski', en: 'Engleski', id: 'Indonezijski', de: 'Njemački', fr: 'Francuski', bs: 'Bosanski', ru: 'Ruski', ms: 'Malajski', ar: 'Arapski', ur: 'Urdski', es: 'Španjolski', nl: 'Nizozemski', sq: 'Albanski', hi: 'Hindski', bn: 'Bangla', fa: 'Perzijski', ps: 'Paštunski', ckb: 'Soranski kurdski', ug: 'Ujgurski', az: 'Azerbajdžanski', uz: 'Uzbečki', kk: 'Kazaški', ky: 'Kirgiski', tg: 'Tadžički', sw: 'Svahili', ha: 'Hausa', am: 'Amharski', om: 'Oromski', so: 'Somalski', ff: 'Fula', yo: 'Jorupski', zh: 'Kineski (pojednostavljeni)', ta: 'Tamilski', ml: 'Malajalamski', th: 'Tajlandski', ko: 'Korejski', vi: 'Vijetnamski', pt: 'Portugalski', it: 'Talijanski', sv: 'Švedski', uk: 'Ukrajinski', ro: 'Rumunjski', hr: 'Hrvatski', sr: 'Srpski', el: 'Grčki' },
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
      few: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', few: '{n} texts replaced.', other: '{n} texts replaced.' }),
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
  sihirbazBaglantisi: 'Jezik · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
