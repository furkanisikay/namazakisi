import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Dil adları CLDR rn'den; CLDR'de Kirundi adı olmayan diller İngilizce adla kalır. */
export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ururimi · Language',
  aciklama: 'Muhitemwo ururimi rwa porogarama. Amamenyesha no gusoma n’ijwi na vyo bikoresha urwo rurimi.',
  grup: 'Ururimi rwa porogarama',
  dilAdlari: { tr: 'Igiturukiya', en: 'Icongereza', id: 'Ikinyendoziya', de: 'Ikidage', fr: 'Igifaransa', bs: 'Bosnian', ru: 'Ikirusiya', ms: 'Ikinyamaleziya', ar: 'Icarabu', ur: 'Inyeyurudu', es: 'Icesipanyolo', nl: 'Igiholandi', sq: 'Albanian', hi: 'Igihindi', bn: 'Ikibengali', fa: 'Igiperisi', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Igihawusa', am: 'Ikimuhariki', om: 'Oromo', so: 'Igisomali', ff: 'Fula', yo: 'Ikiyoruba', zh: 'Simplified Chinese', ta: 'Igitamili', ml: 'Malayalam', th: 'Ikinyatayilandi', ko: 'Ikinyakoreya', vi: 'Ikinyaviyetinamu', pt: 'Igiporutugari', it: 'Igitaliyani', sv: 'Igisuweduwa', uk: 'Ikinyayukereni', ro: 'Ikinyarumaniya', hr: 'Croatian', sr: 'Serbian', el: 'Ikigereki', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Ikinyapolonye', ja: 'Ikiyapani', gu: 'Gujarati', bg: 'Ikinyabuligariya', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Igipunjabi (Pakisitani)', as: 'Assamese', ne: 'Ikinepali', si: 'Sinhala', km: 'Igikambodiya', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Ikinyarwanda', rn: 'Ikirundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Igikani', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Ururimi rw’igikoresho',
  cihazDiliKullaniliyor: 'Ubu ni {ad}',
  cihazDiliDesteklenmiyor: 'Ururimi rw’igikoresho canyu ntiruraboneka; hakoreshwa Igiturukiya.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Ubuhinduzi bwa Beta buriko burasuzumwa; inyandiko zimwe zishobora kugira amakosa.',
    vakit: 'Ururimi ntiruhindura uko ibihe vy’isengesho biharurwa.',
    nass: 'Mu ndimi zitari Igiturukiya, herekanwa gusa ubusobanuro bwa Qor’ani; inyandiko za hadithi ziva mu isoko ry’Igiturukiya, ni co gituma zitagaragazwa.',
  },
  ozelAnons: {
    baslik: 'Inyandiko zo gusoma n’ijwi mwanditse',
    govde: cogul({
      one: 'Inyandiko {n} yo gusoma n’ijwi mwanditse iracari mu rurimi rwa mbere. Muyisubirize inyandiko itunganijwe y’ururimi rushasha?',
      other: 'Inyandiko {n} zo gusoma n’ijwi mwanditse ziracari mu rurimi rwa mbere. Muzisubirize inyandiko zitunganijwe z’ururimi rushasha?',
    }),
    degistir: 'Musubirize inyandiko itunganijwe',
    koru: 'Mubireke uko biri',
    degisti: cogul({ one: 'Inyandiko {n} yasubirijwe.', other: 'Inyandiko {n} zasubirijwe.' }),
  },
  vakitAdlari: {
    baslik: 'Amazina y’amasengesho',
    aciklama: 'Muhitemwo uko ibihe vy’isengesho vyitwa.',
    otomatik: 'Bivanye n’igihugu',
    otomatikAciklama: 'Hakoreshwa amazina amenyerewe mu gihugu c’aho muri.',
    takimlar: { temel: 'Amazina y’Icarabu', diyanetDe: 'Diyanet (Ikidage)', turkce: 'Amazina y’Igiturukiya', magrip: 'Inyandiko ya Maghreb', cezayir: 'Inyandiko ya Alijeriya', afgan: 'Amazina ya Afuganisitani' },
  },
  yazi: {
    baslik: 'Indome',
    aciklama: 'Muhitemwo indome inyandiko yandikwamwo.',
    otomatik: 'Bivanye n’igihugu',
    otomatikAciklama: 'Hakoreshwa indome zimenyerewe mu gihugu c’aho muri.',
    latin: 'Indome z’Ikilatini',
    kiril: 'Indome z’Igisirilike',
  },
  kaydedilemedi: 'Ururimi ntirwashoboye kubikwa. Mwongere mugerageze.',
  sihirbazBaglantisi: 'Ururimi · Language',
  sihirbazBaglantisiAciklama: 'Muhindure ururimi rwa porogarama',
};
