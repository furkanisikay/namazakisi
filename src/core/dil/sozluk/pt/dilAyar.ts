// ÇEVİRİ: pt — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Idioma · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Turco', en: 'Inglês', id: 'Indonésio', de: 'Alemão', fr: 'Francês', bs: 'Bósnio', ru: 'Russo', ms: 'Malaio', ar: 'Árabe', ur: 'Urdu', es: 'Espanhol', nl: 'Neerlandês', sq: 'Albanês', hi: 'Hindi', bn: 'Bengalês', fa: 'Persa', ps: 'Pastó', ckb: 'Curdo central', ug: 'Uigur', az: 'Azerbaijano', uz: 'Usbeque', kk: 'Cazaque', ky: 'Quirguiz', tg: 'Tajique', sw: 'Suaíli', ha: 'Haúça', am: 'Amárico', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Ioruba', zh: 'Chinês simplificado', ta: 'Tâmil', ml: 'Malaiala', th: 'Tailandês', ko: 'Coreano', vi: 'Vietnamita', pt: 'Português', it: 'Italiano', sv: 'Sueco', uk: 'Ucraniano', ro: 'Romeno', hr: 'Croata', sr: 'Sérvio', el: 'Grego' },
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
      many: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', many: '{n} texts replaced.', other: '{n} texts replaced.' }),
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
  sihirbazBaglantisi: 'Idioma · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
