// ÇEVİRİ: rn — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ururimi · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Igiturukiya', en: 'Icongereza', id: 'Ikinyendoziya', de: 'Ikidage', fr: 'Igifaransa', bs: 'Bosnian', ru: 'Ikirusiya', ms: 'Ikinyamaleziya', ar: 'Icarabu', ur: 'Inyeyurudu', es: 'Icesipanyolo', nl: 'Igiholandi', sq: 'Albanian', hi: 'Igihindi', bn: 'Ikibengali', fa: 'Igiperisi', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Igihawusa', am: 'Ikimuhariki', om: 'Oromo', so: 'Igisomali', ff: 'Fula', yo: 'Ikiyoruba', zh: 'Simplified Chinese', ta: 'Igitamili', ml: 'Malayalam', th: 'Ikinyatayilandi', ko: 'Ikinyakoreya', vi: 'Ikinyaviyetinamu', pt: 'Igiporutugari', it: 'Igitaliyani', sv: 'Igisuweduwa', uk: 'Ikinyayukereni', ro: 'Ikinyarumaniya', hr: 'Croatian', sr: 'Serbian', el: 'Ikigereki', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Ikinyapolonye', ja: 'Ikiyapani', gu: 'Gujarati', bg: 'Ikinyabuligariya', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Igipunjabi (Pakisitani)', as: 'Assamese', ne: 'Ikinepali', si: 'Sinhala', km: 'Igikambodiya', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Ikinyarwanda', rn: 'Ikirundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Igikani', ceb: 'Cebuano', nqo: 'N’Ko' },
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
  sihirbazBaglantisi: 'Ururimi · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
