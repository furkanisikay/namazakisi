import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Dil · Language',
  aciklama: 'Programmanyň dilini saýlaň. Habarnamalar we sesli okamak hem ony ulanýar.',
  grup: 'Programmanyň dili',
  dilAdlari: { tr: 'Türk dili', en: 'Iňlis dili', id: 'Indonez dili', de: 'Nemes dili', fr: 'Fransuz dili', bs: 'Bosniýa dili', ru: 'Rus dili', ms: 'Malaý dili', ar: 'Arap dili', ur: 'Urdu', es: 'Ispan dili', nl: 'Niderland dili', sq: 'Alban dili', hi: 'Hindi dili', bn: 'Bengal dili', fa: 'Pars dili', ps: 'Peştun dili', ckb: 'Merkezi kürt dili', ug: 'Uýgur dili', az: 'Azerbaýjan dili', uz: 'Özbek dili', kk: 'Gazak dili', ky: 'Gyrgyz dili', tg: 'Täjik dili', sw: 'Suahili dili', ha: 'Hausa dili', am: 'Amhar dili', om: 'Oromo dili', so: 'Somali dili', ff: 'Fula dili', yo: 'Ýoruba dili', zh: 'Ýönekeýleşdirilen hytaý dili', ta: 'Tamil dili', ml: 'Malaýalam dili', th: 'Taý dili', ko: 'Koreý dili', vi: 'Wýetnam dili', pt: 'Portugal dili', it: 'Italýan dili', sv: 'Şwed dili', uk: 'Ukrain dili', ro: 'Rumyn dili', hr: 'Horwat dili', sr: 'Serb dili', el: 'Grek dili', ku: 'Kürt dili (Kurmancî)', tk: 'Türkmen dili', tt: 'Tatar dili', sd: 'Sindhi dili', pl: 'Polýak dili', ja: 'Ýapon dili', gu: 'Gujarati dili', bg: 'Bolgar dili', mk: 'Makedon dili', fil: 'Filippin dili', te: 'Telugu dili', kn: 'Kannada dili', mr: 'Marathi dili', pa: 'Penjab dili (Arap elipbiýi, Pakistan)', as: 'Assam dili', ne: 'Nepal dili', si: 'Singal dili', km: 'Khmer dili', he: 'Ýewreý dili', ka: 'Gruzin dili', lt: 'Litwa dili', mg: 'Malagasiý dili', lg: 'Ganda dili', rw: 'Kinýaruanda dili', rn: 'Rundi dili', ln: 'Lingala dili', dag: 'Dagbani', mos: 'Mossi dili', aa: 'Afar dili', mdh: 'Maguindanao', ak: 'Akan dili', ceb: 'Sebuan dili', nqo: 'Nko dili' },
  cihazDili: 'Enjamyň dili',
  cihazDiliKullaniliyor: 'Häzir: {ad}',
  cihazDiliDesteklenmiyor: 'Enjamyňyzyň dili entek elýeter däl; türk dili ulanylýar.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta terjimeler barlanýar; käbir tekstler kemsiz bolmazlygy mümkin.',
    vakit: 'Dil namaz wagtlarynyň hasaplanyşyny üýtgetmeýär.',
    nass: 'Türk dilinden başga dillerde diňe Kuranyň terjimeleri görkezilýär; hadys tekstleri türk dilindäki çeşmeden alynýar, şonuň üçin görkezilmeýär.',
  },
  ozelAnons: {
    baslik: 'Özüňiz ýazan sesli okamak tekstleri',
    govde: cogul({
      one: 'Özüňiz ýazan {n} sesli okamak teksti henizem öňki dilde. Ony täze dildäki taýýar tekst bilen çalyşmalymy?',
      other: 'Özüňiz ýazan {n} sesli okamak teksti henizem öňki dilde. Olary täze dildäki taýýar tekstler bilen çalyşmalymy?',
    }),
    degistir: 'Taýýar tekst bilen çalyşyň',
    koru: 'Şeýle galsyn',
    degisti: cogul({ one: '{n} tekst çalşyldy.', other: '{n} tekst çalşyldy.' }),
  },
  vakitAdlari: {
    baslik: 'Namaz atlary',
    aciklama: 'Namaz wagtlarynyň nähili atlandyryljakdygyny saýlaň.',
    otomatik: 'Ýurda görä',
    otomatikAciklama: 'Ýerleşýän ýurduňyzda ýaýran atlary ulanýar.',
    takimlar: { temel: 'Arap atlary', diyanetDe: 'Diyanet (nemes dili)', turkce: 'Türk atlary', magrip: 'Magrip ýazylyşy', cezayir: 'Alžir ýazylyşy', afgan: 'Owgan atlary' },
  },
  yazi: {
    baslik: 'Elipbiý',
    aciklama: 'Tekstiň haýsy elipbiýde ýazyljakdygyny saýlaň.',
    otomatik: 'Ýurda görä',
    otomatikAciklama: 'Ýerleşýän ýurduňyzda ýaýran elipbiýi ulanýar.',
    latin: 'Latyn elipbiýi',
    kiril: 'Kiril elipbiýi',
  },
  kaydedilemedi: 'Dil ýatda saklanmady. Gaýtadan synanyşyň.',
  sihirbazBaglantisi: 'Dil · Language',
  sihirbazBaglantisiAciklama: 'Programmanyň dilini üýtgediň',
};
