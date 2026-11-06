import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Pinulongan · Language',
  aciklama: 'Pilia ang pinulongan sa app. Gamiton usab kini sa mga pahibalo ug sa pagbasa og kusog.',
  grup: 'Pinulongan sa app',
  dilAdlari: { tr: 'Turkish', en: 'English', id: 'Indonesian', de: 'German', fr: 'Pranses', bs: 'Bosnian', ru: 'Russian', ms: 'Malay', ar: 'Arabic', ur: 'Urdu', es: 'Espanyol', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bangla', fa: 'Persian', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Amharic', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Yoruba', zh: 'Pinasimple nga Chinese', ta: 'Tamil', ml: 'Malayalam', th: 'Thai', ko: 'Korean', vi: 'Vietnamese', pt: 'Portuguese', it: 'Italyano', sv: 'Swedish', uk: 'Ukrainian', ro: 'Romanian', hr: 'Croatian', sr: 'Serbian', el: 'Greek', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Polish', ja: 'Hinapon', gu: 'Gujarati', bg: 'Bulgarian', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (Arabic, Pakistan)', as: 'Assamese', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Pinulongan sa device',
  cihazDiliKullaniliyor: 'Karon {ad}',
  cihazDiliDesteklenmiyor: 'Wala pa magamit ang pinulongan sa inyong device; Turkish ang gigamit.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Gisusi pa ang mga beta nga hubad; ang ubang teksto mahimong dili pa hingpit.',
    vakit: 'Dili mausab sa pinulongan ang pagkuwenta sa mga oras sa Salah.',
    nass: "Sa mga pinulongan gawas sa Turkish, ang mga hubad sa Qur'an lang ang gipakita; ang mga teksto sa hadith gikan sa Turkish nga tinubdan, busa dili kini ipakita.",
  },
  ozelAnons: {
    baslik: 'Mga teksto sa pagbasa og kusog nga inyong gisulat',
    govde: cogul({
      one: '{n} ka teksto sa pagbasa og kusog nga inyong gisulat anaa pa sa kanhing pinulongan. Ilisan ba sa andam nga teksto sa bag-ong pinulongan?',
      other: '{n} ka teksto sa pagbasa og kusog nga inyong gisulat anaa pa sa kanhing pinulongan. Ilisan ba sa andam nga mga teksto sa bag-ong pinulongan?',
    }),
    degistir: 'Ilisan sa andam nga teksto',
    koru: 'Ipabilin',
    degisti: cogul({ one: '{n} ka teksto ang gipulihan.', other: '{n} ka teksto ang gipulihan.' }),
  },
  vakitAdlari: {
    baslik: 'Mga ngalan sa Salah',
    aciklama: 'Pilia kung giunsa pagngalan ang mga oras sa Salah.',
    otomatik: 'Sumala sa nasud',
    otomatikAciklama: 'Gamiton ang mga ngalan nga naandan sa nasud sa inyong lokasyon.',
    takimlar: { temel: 'Arabikong mga ngalan', diyanetDe: 'Diyanet (German)', turkce: 'Turkish nga mga ngalan', magrip: 'Maghrebi nga espeling', cezayir: 'Algerian nga espeling', afgan: 'Afghan nga mga ngalan' },
  },
  yazi: {
    baslik: 'Alpabeto',
    aciklama: 'Pilia kung unsang alpabeto ang gamiton sa teksto.',
    otomatik: 'Sumala sa nasud',
    otomatikAciklama: 'Gamiton ang alpabeto nga naandan sa nasud sa inyong lokasyon.',
    latin: 'Latin nga alpabeto',
    kiril: 'Cyrillic nga alpabeto',
  },
  kaydedilemedi: 'Dili ma-save ang pinulongan. Sulayi pag-usab.',
  sihirbazBaglantisi: 'Pinulongan · Language',
  sihirbazBaglantisiAciklama: 'Usba ang pinulongan sa app',
};
