import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Dil adları İngilizce: CLDR'de `mdh` yerel ayarı yok (`coklu-dil.md` > üç harfli kodlar). */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Basa · Language',
  aciklama: 'Pamili sa basa nu app. Gamiten bun sya nu manga notification endu kabatya.',
  grup: 'Basa nu app',
  dilAdlari: { tr: 'Turkish', en: 'English', id: 'Indonesian', de: 'German', fr: 'French', bs: 'Bosnian', ru: 'Russian', ms: 'Malay', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bangla', fa: 'Persian', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Amharic', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Yoruba', zh: 'Simplified Chinese', ta: 'Tamil', ml: 'Malayalam', th: 'Thai', ko: 'Korean', vi: 'Vietnamese', pt: 'Portuguese', it: 'Italian', sv: 'Swedish', uk: 'Ukrainian', ro: 'Romanian', hr: 'Croatian', sr: 'Serbian', el: 'Greek', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Polish', ja: 'Japanese', gu: 'Gujarati', bg: 'Bulgarian', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (Arabic, Pakistan)', as: 'Assamese', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Magindanawn', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Basa nu device',
  cihazDiliKullaniliyor: 'Saguna {ad}',
  cihazDiliDesteklenmiyor: 'Da pan su basa nu device nu; Turkish i gamiten.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Pedilayen pan su manga salin a beta; aden manga sulat a di pan mapya.',
    vakit: 'Di pedlalin su basa i kakwenta nu manga waktu nu sambayang.',
    nass: "Sa manga basa a salakaw sa Turkish, su manga salin nu Qur'an bu i ipailay; su manga hadith na ebpun sa kitab a Turkish, na di silan ipailay.",
  },
  ozelAnons: {
    baslik: 'Manga kabatya a sinulat nu',
    govde: cogul({
      one: '{n} a kabatya a sinulat nu na lu pan sa nawna a basa. Ilisan sa nakahanda a sulat sa bagu a basa?',
      other: '{n} a kabatya a sinulat nu na lu pan sa nawna a basa. Ilisan sa nakahanda a manga sulat sa bagu a basa?',
    }),
    degistir: 'Ilisan sa nakahanda a sulat',
    koru: 'Di ilisan',
    degisti: cogul({ one: '{n} a sulat i nailisan.', other: '{n} a sulat i nailisan.' }),
  },
  vakitAdlari: {
    baslik: 'Manga ingalan nu sambayang',
    aciklama: 'Pamili sa kapangingalan nu manga waktu nu sambayang.',
    otomatik: 'Sunud sa dalpa',
    otomatikAciklama: 'Gamiten su manga ingalan a pagagamit sa dalpa nu lokasyun nu.',
    takimlar: { temel: 'Manga ingalan a Arab', diyanetDe: 'Diyanet (German)', turkce: 'Manga ingalan a Turkish', magrip: 'Sulat a Maghribi', cezayir: 'Sulat a Algeria', afgan: 'Manga ingalan a Afghan' },
  },
  yazi: {
    baslik: 'Alpabeto',
    aciklama: 'Pamili sa alpabeto a gamiten sa sulat.',
    otomatik: 'Sunud sa dalpa',
    otomatikAciklama: 'Gamiten su alpabeto a pagagamit sa dalpa nu lokasyun nu.',
    latin: 'Alpabeto a Latin',
    kiril: 'Alpabeto a Cyrillic',
  },
  kaydedilemedi: 'Di natagu su basa. Ulit manem.',
  sihirbazBaglantisi: 'Basa · Language',
  sihirbazBaglantisiAciklama: 'Ilisan su basa nu app',
};
