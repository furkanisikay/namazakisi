import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Moore · Language',
  aciklama: 'Tũus-y aplikaasõ wã goamã. Kibarã la karengo ne koɛɛgo me tũuda-a.',
  grup: 'Aplikaasõ goama',
  dilAdlari: { tr: 'Turkish', en: 'English', id: 'Indonesian', de: 'German', fr: 'French', bs: 'Bosnian', ru: 'Russian', ms: 'Malay', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bangla', fa: 'Persian', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Amharic', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Yoruba', zh: 'Simplified Chinese', ta: 'Tamil', ml: 'Malayalam', th: 'Thai', ko: 'Korean', vi: 'Vietnamese', pt: 'Portuguese', it: 'Italian', sv: 'Swedish', uk: 'Ukrainian', ro: 'Romanian', hr: 'Croatian', sr: 'Serbian', el: 'Greek', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Polish', ja: 'Japanese', gu: 'Gujarati', bg: 'Bulgarian', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (Arabic, Pakistan)', as: 'Assamese', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Moore', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Telefõnã goama',
  cihazDiliKullaniliyor: 'Masã: {ad}',
  cihazDiliDesteklenmiyor: 'Y telefõnã goamã nan ka be ka ye; b tũuda Turki goama.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'B ges-n-gẽesda Beta lebgrã; gom-biis kẽer tõe n tar tudgri.',
    vakit: 'Goamã pa teegd pʋʋsg wakatã sõdg ye.',
    nass: 'Goam nins sẽn pa Turki pʋgẽ, b wilgda Kʋrãana lebgr bala; hadiis gom-biisã yita Turki gʋlsg pʋgẽ, rẽ n so tɩ b pa wilgd-b ye.',
  },
  ozelAnons: {
    baslik: 'Karengo ne koɛɛg gom-biis y sẽn gʋlsa',
    govde: cogul({
      one: '{n} karengo ne koɛɛg gom-biis y sẽn gʋlsa nan bee goam ning sẽn deng pʋgẽ. Y rata tɩ b teeg-b ne gom-biis sẽn segl goam-paalgã pʋgẽ?',
      other: '{n} karengo ne koɛɛg gom-biis y sẽn gʋlsa nan bee goam ning sẽn deng pʋgẽ. Y rata tɩ b teeg-b ne gom-biis sẽn segl goam-paalgã pʋgẽ?',
    }),
    degistir: 'Teeg-y ne sẽn segla',
    koru: 'Bas-y woto',
    degisti: cogul({ one: 'B teega gom-biis {n}.', other: 'B teega gom-biis {n}.' }),
  },
  vakitAdlari: {
    baslik: 'Pʋʋs-rãmbã yʋʋra',
    aciklama: 'Tũus-y yʋʋr nins b sẽn na n bool pʋʋsg wakatã.',
    otomatik: 'Tẽngã sẽn tũudã',
    otomatikAciklama: 'A tũuda yʋʋr nins sẽn yaa wʋsg y zĩigã tẽngã pʋgẽ.',
    takimlar: { temel: 'Arab yʋʋra', diyanetDe: 'Diyanet (Allemaaŋ)', turkce: 'Turki yʋʋra', magrip: 'Magreb gʋlsgo', cezayir: 'Alzeri gʋlsgo', afgan: 'Afgaan yʋʋra' },
  },
  yazi: {
    baslik: 'Gʋlsg sebgo',
    aciklama: 'Tũus-y gʋlsg sebg ning b sẽn na n gʋls ne.',
    otomatik: 'Tẽngã sẽn tũudã',
    otomatikAciklama: 'A tũuda gʋlsg sebg ning sẽn yaa wʋsg y zĩigã tẽngã pʋgẽ.',
    latin: 'Latẽ gʋlsgo',
    kiril: 'Siril gʋlsgo',
  },
  kaydedilemedi: 'B pa tõog n bĩng goamã ye. Leb-y n maan.',
  sihirbazBaglantisi: 'Moore · Language',
  sihirbazBaglantisiAciklama: 'Teeg-y aplikaasõ wã goamã',
};
