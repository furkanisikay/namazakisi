import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Dil adları İngilizce kalır: CLDR'de Dagbani yerel ayarı yok (`Intl.DisplayNames('dag')` İngilizceye
 * düşer, coklu-dil.md > üç harfli kodlar). "Balli" = dil (MediaWiki Dagbani `loginlanguagelabel`).
 */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Balli · Language',
  aciklama: 'Piimi ya app maa balli. Lahabaya mini kukoli karimbu gba zaŋdi li.',
  grup: 'App balli',
  dilAdlari: { tr: 'Turkish', en: 'English', id: 'Indonesian', de: 'German', fr: 'French', bs: 'Bosnian', ru: 'Russian', ms: 'Malay', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', nl: 'Dutch', sq: 'Albanian', hi: 'Hindi', bn: 'Bangla', fa: 'Persian', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Amharic', om: 'Oromo', so: 'Somali', ff: 'Fula', yo: 'Yoruba', zh: 'Simplified Chinese', ta: 'Tamil', ml: 'Malayalam', th: 'Thai', ko: 'Korean', vi: 'Vietnamese', pt: 'Portuguese', it: 'Italian', sv: 'Swedish', uk: 'Ukrainian', ro: 'Romanian', hr: 'Croatian', sr: 'Serbian', el: 'Greek', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Polish', ja: 'Japanese', gu: 'Gujarati', bg: 'Bulgarian', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (Arabic, Pakistan)', as: 'Assamese', ne: 'Nepali', si: 'Sinhala', km: 'Khmer', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbanli', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Tilifoŋ balli',
  cihazDiliKullaniliyor: 'Pumpɔŋɔ {ad}',
  cihazDiliDesteklenmiyor: 'Yi tilifoŋ balli na kani; bɛ zaŋdi Turkish.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Bɛ na lihiri Beta balli maa; sabbu shɛŋa ni tooi bi niŋ viɛnyɛla.',
    vakit: 'Balli bi taɣiri jiŋli saha kalibu.',
    nass: 'Balli din pa Turkish ni, Alkur’aani gbinni koŋko ka bɛ wuhiri; hadisi sabbu yila Turkish kundi ni, dinzuɣu bɛ bi wuhiri li.',
  },
  ozelAnons: {
    baslik: 'Kukoli karimbu sabbu shɛŋa yi ni sabi',
    govde: cogul({ one: 'Kukoli karimbu sabbu {n} yi ni sabi na be balli din gari maa ni. Yi bɔri ni yi taɣi li ni sabbu din kpaŋsi balli palli maa ni?', other: 'Kukoli karimbu sabbu {n} yi ni sabi na be balli din gari maa ni. Yi bɔri ni yi taɣi li ni sabbu din kpaŋsi balli palli maa ni?' }),
    degistir: 'Taɣimi ya ni sabbu din kpaŋsi',
    koru: 'Chɛmi ya li lala',
    degisti: cogul({ one: 'Bɛ taɣi sabbu {n}.', other: 'Bɛ taɣi sabbu {n}.' }),
  },
  vakitAdlari: {
    baslik: 'Jiŋli yuya',
    aciklama: 'Piimi ya yuya shɛŋa bɛ ni booni jiŋli saha.',
    otomatik: 'Tiŋgbani zuɣu',
    otomatikAciklama: 'Di zaŋdi yuya shɛŋa bɛ ni booni tiŋgbani shɛli yi ni be ni.',
    takimlar: { temel: 'Larabanim’ yuya', diyanetDe: 'Diyanet (German)', turkce: 'Turkinim’ yuya', magrip: 'Maghrib sabbu', cezayir: 'Algeria sabbu', afgan: 'Afghanistan yuya' },
  },
  yazi: {
    baslik: 'Sabbu bachinima',
    aciklama: 'Piimi ya sabbu bachinima shɛŋa bɛ ni sabiri.',
    otomatik: 'Tiŋgbani zuɣu',
    otomatikAciklama: 'Di zaŋdi sabbu bachinima shɛŋa bɛ ni sabiri tiŋgbani shɛli yi ni be ni.',
    latin: 'Latin bachinima',
    kiril: 'Cyrillic bachinima',
  },
  kaydedilemedi: 'Bɛ bi tooi zali balli maa. Lahi niŋmi ya.',
  sihirbazBaglantisi: 'Balli · Language',
  sihirbazBaglantisiAciklama: 'Taɣimi ya app maa balli',
};
