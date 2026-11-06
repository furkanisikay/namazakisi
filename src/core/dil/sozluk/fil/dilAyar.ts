import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** `dilAdlari` CLDR fil'den (çoğu İngilizce ad, CLDR'nin kendi seçimi); elle çevrilmedi. */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Wika · Language',
  aciklama: 'Piliin ang wika ng app. Ginagamit din ito sa mga notification at sa pagbasa nang malakas.',
  grup: 'Wika ng app',
  dilAdlari: { tr: 'Turkish', en: 'Ingles', id: 'Indonesian', de: 'German', fr: 'French', bs: 'Bosnian', ru: 'Russian', ms: 'Malay', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bangla', fa: 'Persian', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kirghiz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Amharic', om: 'Oromo', so: 'Somali', ff: 'Fulah', yo: 'Yoruba', zh: 'Pinasimpleng Chinese', ta: 'Tamil', ml: 'Malayalam', th: 'Thai', ko: 'Korean', vi: 'Vietnamese', pt: 'Portuguese', it: 'Italian', sv: 'Swedish', uk: 'Ukranian', ro: 'Romanian', hr: 'Croatian', sr: 'Serbian', el: 'Greek', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Polish', ja: 'Japanese', gu: 'Gujarati', bg: 'Bulgarian', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (Arabic, Pakistan)', as: 'Assamese', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Wika ng device',
  cihazDiliKullaniliyor: 'Kasalukuyang {ad}',
  cihazDiliDesteklenmiyor: 'Hindi pa available ang wika ng inyong device; Turkish ang ginagamit.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Sinusuri pa ang mga beta na salin; maaaring may hindi perpektong teksto.',
    vakit: 'Hindi binabago ng wika ang pagkalkula ng mga oras ng dasal.',
    nass: "Sa mga wikang hindi Turkish, mga salin ng Qur'an lang ang ipinapakita; galing sa Turkish na sanggunian ang mga teksto ng hadith, kaya hindi ipinapakita ang mga ito.",
  },
  ozelAnons: {
    baslik: 'Mga isinulat ninyong teksto para sa pagbasa nang malakas',
    govde: cogul({
      one: 'Nasa dating wika pa ang {n} isinulat ninyong teksto para sa pagbasa nang malakas. Palitan ng handang teksto sa bagong wika?',
      other: 'Nasa dating wika pa ang {n} isinulat ninyong teksto para sa pagbasa nang malakas. Palitan ng mga handang teksto sa bagong wika?',
    }),
    degistir: 'Palitan ng handang teksto',
    koru: 'Panatilihin',
    degisti: cogul({ one: 'Napalitan ang {n} teksto.', other: 'Napalitan ang {n} teksto.' }),
  },
  vakitAdlari: {
    baslik: 'Mga pangalan ng dasal',
    aciklama: 'Piliin kung paano papangalanan ang mga oras ng dasal.',
    otomatik: 'Ayon sa bansa',
    otomatikAciklama: 'Ginagamit ang mga pangalang karaniwan sa bansa ng inyong lokasyon.',
    takimlar: { temel: 'Mga pangalang Arabe', diyanetDe: 'Diyanet (German)', turkce: 'Mga pangalang Turkish', magrip: 'Baybay sa Maghreb', cezayir: 'Baybay sa Algeria', afgan: 'Mga pangalang Afghan' },
  },
  yazi: {
    baslik: 'Alpabeto',
    aciklama: 'Piliin kung anong alpabeto ang gagamitin sa teksto.',
    otomatik: 'Ayon sa bansa',
    otomatikAciklama: 'Ginagamit ang alpabetong karaniwan sa bansa ng inyong lokasyon.',
    latin: 'Alpabetong Latin',
    kiril: 'Alpabetong Cyrillic',
  },
  kaydedilemedi: 'Hindi ma-save ang wika. Subukang muli.',
  sihirbazBaglantisi: 'Wika · Language',
  sihirbazBaglantisiAciklama: 'Palitan ang wika ng app',
};
