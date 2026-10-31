// ÇEVİRİ: it — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Lingua · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Turco', en: 'Inglese', id: 'Indonesiano', de: 'Tedesco', fr: 'Francese', bs: 'Bosniaco', ru: 'Russo', ms: 'Malese', ar: 'Arabo', ur: 'Urdu', es: 'Spagnolo', nl: 'Olandese', sq: 'Albanese', hi: 'Hindi', bn: 'Bengalese', fa: 'Persiano', ps: 'Pashto', ckb: 'Curdo centrale', ug: 'Uiguro', az: 'Azerbaigiano', uz: 'Uzbeco', kk: 'Kazako', ky: 'Kirghiso', tg: 'Tagico', sw: 'Swahili', ha: 'Hausa', am: 'Amarico', om: 'Oromo', so: 'Somalo', ff: 'Fulah', yo: 'Yoruba', zh: 'Cinese semplificato', ta: 'Tamil', ml: 'Malayalam', th: 'Thailandese', ko: 'Coreano', vi: 'Vietnamita', pt: 'Portoghese', it: 'Italiano', sv: 'Svedese', uk: 'Ucraino', ro: 'Rumeno', hr: 'Croato', sr: 'Serbo', el: 'Greco' },
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
  sihirbazBaglantisi: 'Lingua · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
