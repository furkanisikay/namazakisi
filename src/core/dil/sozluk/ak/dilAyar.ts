// ÇEVİRİ: ak — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Kasa · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Tɛɛki kasa', en: 'Borɔfo', id: 'Indonihyia kasa', de: 'Gyaaman', fr: 'Frɛnkye', bs: 'Bosniani', ru: 'Rahyia kasa', ms: 'Malay kasa', ar: 'Arabeke', ur: 'Urdu kasa', es: 'Spain kasa', nl: 'Dɛɛkye', sq: 'Aabeniani', hi: 'Hindi', bn: 'Bengali kasa', fa: 'Pɛɛhyia kasa', ps: 'Pahyito', ckb: 'Central Kurdish', ug: 'Yugaa Kasa', az: 'Asabegyanni', uz: 'Usbɛkistan Kasa', kk: 'Kasaki kasa', ky: 'Kɛgyese kasa', tg: 'Tɛgyeke kasa', sw: 'Swahili', ha: 'Hausa', am: 'Amarik', om: 'Oromo', so: 'Somalia kasa', ff: 'Fula kasa', yo: 'Yoruba', zh: 'Kyaena kasa a emu yɛ mmrɛ', ta: 'Tamil kasa', ml: 'Malayalam kasa', th: 'Taeland kasa', ko: 'Korea kasa', vi: 'Viɛtnam kasa', pt: 'Pɔɔtugal kasa', it: 'Italy kasa', sv: 'Sweden kasa', uk: 'Ukren kasa', ro: 'Romenia kasa', hr: 'Kurowehyia kasa', sr: 'Sɛbia Kasa', el: 'Greek kasa', ku: 'Kɛɛde kasa (Kurmancî)', tk: 'Tɛkmɛnistan Kasa', tt: 'Tata kasa', sd: 'Sindi', pl: 'Pɔland kasa', ja: 'Gyapan kasa', gu: 'Gugyarata', bg: 'Bɔlgeria kasa', mk: 'Mɛsidonia kasa', fil: 'Filipin kasa', te: 'Telugu', kn: 'Kanada', mr: 'Marati', pa: 'Pungyabi kasa (Arabeke, Pakistan)', as: 'Asamese', ne: 'Nɛpal kasa', si: 'Sinhala', km: 'Kambodia kasa', he: 'Hibri kasa', ka: 'Gyɔɔgyia kasa', lt: 'Lituania kasa', mg: 'Malagasy', lg: 'Ganda', rw: 'Rewanda kasa', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Kebuano', nqo: 'Nko' },
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
  sihirbazBaglantisi: 'Kasa · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
