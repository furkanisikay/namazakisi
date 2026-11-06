import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Ururimi · Language',
  aciklama: 'Muhitemo ururimi rwa porogaramu. Amamenyesha no gusoma mu ijwi na byo birarukoresha.',
  grup: 'Ururimi rwa porogaramu',
  dilAdlari: { tr: 'Igiturukiya', en: 'Icyongereza', id: 'Ikinyendoziya', de: 'Ikidage', fr: 'Igifaransa', bs: 'Inyebosiniya', ru: 'Ikirusiya', ms: 'Ikimalayi', ar: 'Icyarabu', ur: 'Inyeyurudu', es: 'Icyesipanyolo', nl: 'Ikinerilande', sq: 'Icyalubaniya', hi: 'Igihindi', bn: 'Ikibengali', fa: 'Inyeperisi', ps: 'Impashito', ckb: 'Central Kurdish', ug: 'Ikiwiguri', az: 'Inyazeribayijani', uz: 'Inyeyuzubeki', kk: 'Kazakh', ky: 'Inkerigizi', tg: 'Tajik', sw: 'Igiswahili', ha: 'Hausa', am: 'Inyamuhariki', om: 'Oromo', so: 'Igisomali', ff: 'Fula', yo: 'Yoruba', zh: 'Simplified Chinese', ta: 'Igitamili', ml: 'Ikimalayalami', th: 'Igitayi', ko: 'Igikoreya', vi: 'Ikinyaviyetinamu', pt: 'Igiporutugali', it: 'Igitaliyani', sv: 'Igisuweduwa', uk: 'Ikinyayukereni', ro: 'Ikinyarumaniya', hr: 'Igikorowasiya', sr: 'Igiseribe', el: 'Ikigereki', ku: 'Inyekuridishi (Kurmancî)', tk: 'Inyeturukimeni', tt: 'Tatar', sd: 'Igisindi', pl: 'Igipolone', ja: 'Ikiyapani', gu: 'Inyegujarati', bg: 'Urunyabuligariya', mk: 'Ikimasedoniya', fil: 'Ikinyafilipine', te: 'Igitelugu', kn: 'Igikanada', mr: 'Ikimarati', pa: 'Punjabi (Arabic, Pakistan)', as: 'Icyasamizi', ne: 'Ikinepali', si: 'Inyesimpaleze', km: 'Igikambodiya', he: 'Igiheburayo', ka: 'Inyejeworujiya', lt: 'Ikilituwaniya', mg: 'Malagasy', lg: 'Ganda', rw: 'Ikinyarwanda', rn: 'Rundi', ln: 'Ilingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Cebuano', nqo: 'N’Ko' },
  cihazDili: 'Ururimi rw’igikoresho',
  cihazDiliKullaniliyor: 'Ubu ni {ad}',
  cihazDiliDesteklenmiyor: 'Ururimi rw’igikoresho cyanyu ntiruraboneka; hakoreshwa Igiturukiya.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Ubusemuzi bwa Beta buri gusuzumwa; inyandiko zimwe zishobora kutaba nziza neza.',
    vakit: 'Ururimi ntiruhindura uko ibihe by’iswala bibarwa.',
    nass: 'Mu ndimi zitari Igiturukiya, hagaragazwa gusa ibisobanuro bya Qur’an; inyandiko za Hadithi ziva mu nkomoko y’Igiturukiya, bityo ntizigaragazwa.',
  },
  ozelAnons: {
    baslik: 'Inyandiko zo gusoma mu ijwi mwanditse',
    govde: cogul({
      one: 'Inyandiko {n} zo gusoma mu ijwi mwanditse ziracyari mu rurimi rwa mbere. Kuzisimbuza inyandiko ziteguye mu rurimi rushya?',
      other: 'Inyandiko {n} zo gusoma mu ijwi mwanditse ziracyari mu rurimi rwa mbere. Kuzisimbuza inyandiko ziteguye mu rurimi rushya?',
    }),
    degistir: 'Gusimbuza inyandiko iteguye',
    koru: 'Kubireka uko biri',
    degisti: cogul({ one: 'Inyandiko {n} zasimbujwe.', other: 'Inyandiko {n} zasimbujwe.' }),
  },
  vakitAdlari: {
    baslik: 'Amazina y’iswala',
    aciklama: 'Muhitemo uko ibihe by’iswala byitwa.',
    otomatik: 'Hakurikijwe igihugu',
    otomatikAciklama: 'Hakoreshwa amazina amenyerewe mu gihugu muherereyemo.',
    takimlar: { temel: 'Amazina y’Icyarabu', diyanetDe: 'Diyanet (Ikidage)', turkce: 'Amazina y’Igiturukiya', magrip: 'Imyandikire ya Magreb', cezayir: 'Imyandikire ya Alijeriya', afgan: 'Amazina yo muri Afuganisitani' },
  },
  yazi: {
    baslik: 'Inyuguti',
    aciklama: 'Muhitemo inyuguti inyandiko zandikwamo.',
    otomatik: 'Hakurikijwe igihugu',
    otomatikAciklama: 'Hakoreshwa inyuguti zimenyerewe mu gihugu muherereyemo.',
    latin: 'Inyuguti z’Ikilatini',
    kiril: 'Inyuguti z’Igisirilike',
  },
  kaydedilemedi: 'Ururimi ntirwashoboye kubikwa. Mwongere mugerageze.',
  sihirbazBaglantisi: 'Ururimi · Language',
  sihirbazBaglantisiAciklama: 'Guhindura ururimi rwa porogaramu',
};
