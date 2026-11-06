import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Dil adları İngilizce kalır: Afar CLDR'de yok (Intl dil adı vermez); kendi adı "Qafar". */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Qafar af · Language',
  aciklama: 'App af doorita. Warsa kee afak kawsiyya kaadu too afat yakken.',
  grup: 'App af',
  dilAdlari: { tr: 'Turkish', en: 'English', id: 'Indonesian', de: 'German', fr: 'French', bs: 'Bosnian', ru: 'Russian', ms: 'Malay', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bangla', fa: 'Persian', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Amharic', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Yoruba', zh: 'Simplified Chinese', ta: 'Tamil', ml: 'Malayalam', th: 'Thai', ko: 'Korean', vi: 'Vietnamese', pt: 'Portuguese', it: 'Italian', sv: 'Swedish', uk: 'Ukrainian', ro: 'Romanian', hr: 'Croatian', sr: 'Serbian', el: 'Greek', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Polish', ja: 'Japanese', gu: 'Gujarati', bg: 'Bulgarian', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (Arabic, Pakistan)', as: 'Assamese', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Qafar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Aalatih af',
  cihazDiliKullaniliyor: 'Asaaku {ad}',
  cihazDiliDesteklenmiyor: 'Sinni aalatih af hanna mali; Turkish af taamitta.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta korissa ublimta; tu maxco meqe hinnay yakke.',
    vakit: 'Af salat waktih cisab ma korissa.',
    nass: 'Turkish afak kalah tan afal Qhuraan aayat korissa sa ubbulla; xadiis maxco Turkish afak yamaate, toh sabbatah ma ubbullan.',
  },
  ozelAnons: {
    baslik: 'Isin uktubteen afak kawsiyya maxco',
    govde: cogul({
      one: 'Isin uktubteen {n} afak kawsiyya maxco hanna duma afal tan. Qusba afih massoysime maxcoh korisaanaa?',
      other: 'Isin uktubteen {n} afak kawsiyya maxco hanna duma afal tan. Qusba afih massoysime maxcoh korisaanaa?',
    }),
    degistir: 'Massoysime maxcoh korisa',
    koru: 'Tet cabaay',
    degisti: cogul({ one: '{n} maxco korisime.', other: '{n} maxco korisime.' }),
  },
  vakitAdlari: {
    baslik: 'Salat migaqa',
    aciklama: 'Salat wakti elle migaqoowan gurra doorita.',
    otomatik: 'Baaxo elle',
    otomatikAciklama: 'Sinni arac yan baaxol taamitaanam migaqa elle taamita.',
    takimlar: { temel: 'Qarab migaqa', diyanetDe: 'Diyanet (Jarman)', turkce: 'Turkish migaqa', magrip: 'Magrib uktubo', cezayir: 'Algeria uktubo', afgan: 'Afgaanistan migaqa' },
  },
  yazi: {
    baslik: 'Alfaabeeta',
    aciklama: 'Maxco elle uktubimtam alfaabeeta doorita.',
    otomatik: 'Baaxo elle',
    otomatikAciklama: 'Sinni arac yan baaxol taamitaanam alfaabeeta elle taamita.',
    latin: 'Latin alfaabeeta',
    kiril: 'Kiriil alfaabeeta',
  },
  kaydedilemedi: 'Af dacrisime wee. Kaadu mokkora.',
  sihirbazBaglantisi: 'Qafar af · Language',
  sihirbazBaglantisiAciklama: 'App af korisa',
};
