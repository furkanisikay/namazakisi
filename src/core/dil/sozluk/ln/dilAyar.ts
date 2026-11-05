import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Lokóta · Language',
  aciklama: 'Bopona lokota ya aplikasiɔ. Mayebisi mpe kotanga na mongongo esalelaka yango mpe.',
  grup: 'Lokota ya aplikasiɔ',
  dilAdlari: { tr: 'Litiliki', en: 'Lingɛlɛ́sa', id: 'Lindonezi', de: 'Lialemá', fr: 'Lifalansɛ́', bs: 'Bosnian', ru: 'Lirisí', ms: 'Limalezi', ar: 'Lialabo', ur: 'Liurdu', es: 'Lisipanye', nl: 'Lifalamá', sq: 'Albanian', hi: 'Lihindi', bn: 'Libengali', fa: 'Lipelésanɛ', ps: 'Pashto', ckb: 'Central Kurdish', ug: 'Uyghur', az: 'Azerbaijani', uz: 'Uzbek', kk: 'Kazakh', ky: 'Kyrgyz', tg: 'Tajik', sw: 'Swahili', ha: 'Hausa', am: 'Liamariki', om: 'Oromo', so: 'Lisomali', ff: 'Fula', yo: 'Yoruba', zh: 'Simplified Chinese', ta: 'Litamuli', ml: 'Malayalam', th: 'Litaye', ko: 'Likoreya', vi: 'Liviyetinámi', pt: 'Lipulutugɛ́si', it: 'Litaliano', sv: 'Lisuwedɛ', uk: 'Likrɛni', ro: 'Liromani', hr: 'Croatian', sr: 'Serbian', el: 'Ligeleki', ku: 'Kurdish (Kurmancî)', tk: 'Turkmen', tt: 'Tatar', sd: 'Sindhi', pl: 'Lipolonɛ', ja: 'Lizapɔ', gu: 'Gujarati', bg: 'Libiligali', mk: 'Macedonian', fil: 'Filipino', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Lipendzabi (Pakisitá)', as: 'Assamese', ne: 'Linepalɛ', si: 'Sinhala', km: 'Likambodza', he: 'Hebrew', ka: 'Georgian', lt: 'Lithuanian', mg: 'Malagasy', lg: 'Ganda', rw: 'Kinyarwanda', rn: 'Rundi', ln: 'Lingála', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Lokota ya telefone',
  cihazDiliKullaniliyor: 'Sikoyo {ad}',
  cihazDiliDesteklenmiyor: 'Lokota ya telefone na bino ezali naino te; Litiliki nde esalelami.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Babongoli ya Beta bazali kotalelama; maloba mosusu ekoki kozala na mabunga.',
    vakit: 'Lokota ebongolaka te ndɛngɛ bangonga ya losambo etangamaka.',
    nass: 'Na minoko mosusu longola Litiliki, kaka babongoli ya Kurani nde emonanaka; maloba ya hadith euti na mokanda ya Litiliki, yango wana emonanaka te.',
  },
  ozelAnons: {
    baslik: 'Maloba ya kotanga na mongongo oyo bokomaki',
    govde: cogul({
      one: 'Maloba {n} ya kotanga na mongongo oyo bokomaki ezali naino na lokota ya kala. Bobongola yango na maloba oyo ebongisami na lokota ya sika?',
      other: 'Maloba {n} ya kotanga na mongongo oyo bokomaki ezali naino na lokota ya kala. Bobongola yango na maloba oyo ebongisami na lokota ya sika?',
    }),
    degistir: 'Bobongola na maloba ebongisami',
    koru: 'Botika ndɛngɛ ezali',
    degisti: cogul({ one: 'Maloba {n} ebongwani.', other: 'Maloba {n} ebongwani.' }),
  },
  vakitAdlari: {
    baslik: 'Bankombo ya losambo',
    aciklama: 'Bopona ndɛngɛ bangonga ya losambo ekobengama.',
    otomatik: 'Na kolanda mboka',
    otomatikAciklama: 'Esalelaka bankombo oyo bato basalelaka mingi na mboka ya esika bozali.',
    takimlar: {
      temel: 'Bankombo ya Arabe',
      diyanetDe: 'Diyanet (Lialemá)',
      turkce: 'Bankombo ya Litiliki',
      magrip: 'Ndɛngɛ ya kokoma ya Maghreb',
      cezayir: 'Ndɛngɛ ya kokoma ya Aljeri',
      afgan: 'Bankombo ya Afganistáni',
    },
  },
  yazi: {
    baslik: 'Alfabɛ',
    aciklama: 'Bopona alfabɛ oyo maloba ekokomama na yango.',
    otomatik: 'Na kolanda mboka',
    otomatikAciklama: 'Esalelaka alfabɛ oyo bato basalelaka mingi na mboka ya esika bozali.',
    latin: 'Alfabɛ ya Latin',
    kiril: 'Alfabɛ ya Kiriliki',
  },
  kaydedilemedi: 'Lokota ebombami te. Bomeka lisusu.',
  sihirbazBaglantisi: 'Lokóta · Language',
  sihirbazBaglantisiAciklama: 'Bobongola lokota ya aplikasiɔ',
};
