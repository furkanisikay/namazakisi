import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Kasa · Language',
  aciklama: 'Paw app no kasa. Amaneɛbɔ ne nne kenkan nso de bedi dwuma.',
  grup: 'App kasa',
  dilAdlari: { tr: 'Tɛɛki kasa', en: 'Borɔfo', id: 'Indonihyia kasa', de: 'Gyaaman', fr: 'Frɛnkye', bs: 'Bosniani', ru: 'Rahyia kasa', ms: 'Malay kasa', ar: 'Arabeke', ur: 'Urdu kasa', es: 'Spain kasa', nl: 'Dɛɛkye', sq: 'Aabeniani', hi: 'Hindi', bn: 'Bengali kasa', fa: 'Pɛɛhyia kasa', ps: 'Pahyito', ckb: 'Kɛɛde kasa (Soranî)', ug: 'Yugaa Kasa', az: 'Asabegyanni', uz: 'Usbɛkistan Kasa', kk: 'Kasaki kasa', ky: 'Kɛgyese kasa', tg: 'Tɛgyeke kasa', sw: 'Swahili', ha: 'Hausa', am: 'Amarik', om: 'Oromo', so: 'Somalia kasa', ff: 'Fula kasa', yo: 'Yoruba', zh: 'Kyaena kasa a emu yɛ mmrɛ', ta: 'Tamil kasa', ml: 'Malayalam kasa', th: 'Taeland kasa', ko: 'Korea kasa', vi: 'Viɛtnam kasa', pt: 'Pɔɔtugal kasa', it: 'Italy kasa', sv: 'Sweden kasa', uk: 'Ukren kasa', ro: 'Romenia kasa', hr: 'Kurowehyia kasa', sr: 'Sɛbia Kasa', el: 'Greek kasa', ku: 'Kɛɛde kasa (Kurmancî)', tk: 'Tɛkmɛnistan Kasa', tt: 'Tata kasa', sd: 'Sindi', pl: 'Pɔland kasa', ja: 'Gyapan kasa', gu: 'Gugyarata', bg: 'Bɔlgeria kasa', mk: 'Mɛsidonia kasa', fil: 'Filipin kasa', te: 'Telugu', kn: 'Kanada', mr: 'Marati', pa: 'Pungyabi kasa (Arabeke, Pakistan)', as: 'Asamese', ne: 'Nɛpal kasa', si: 'Sinhala', km: 'Kambodia kasa', he: 'Hibri kasa', ka: 'Gyɔɔgyia kasa', lt: 'Lituania kasa', mg: 'Malagasy', lg: 'Ganda', rw: 'Rewanda kasa', rn: 'Rundi', ln: 'Lingala', dag: 'Dagbani', mos: 'Mossi', aa: 'Afar', mdh: 'Maguindanao', ak: 'Akan', ceb: 'Kebuano', nqo: 'Nko' },
  cihazDili: 'Afidie no kasa',
  cihazDiliKullaniliyor: 'Seesei {ad}',
  cihazDiliDesteklenmiyor: 'Wo afidie kasa nni hɔ mprempren; wɔde Tɛɛki kasa redi dwuma.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Wɔrehwɛ Beta nkyerɛaseɛ no mu; nsɛm bi betumi anyɛ pɛpɛɛpɛ.',
    vakit: 'Kasa no nsesa sɛdeɛ wɔbu Nyamefrɛ mmerɛ.',
    nass: 'Kasa biara a ɛnyɛ Tɛɛki kasa mu no, Qur’aan nkyerɛaseɛ nko ara na wɔkyerɛ; Hadiis nsɛm no firi Tɛɛki kasa mu, enti wɔnkyerɛ.',
  },
  ozelAnons: {
    baslik: 'Nsɛm a wokyerɛwee maa nne kenkan',
    govde: cogul({
      one: 'Nsɛm {n} a wokyerɛwee maa nne kenkan da so wɔ kasa a edi kan no mu. Wopɛ sɛ wode nsɛm a wɔasiesie wɔ kasa foforo no mu si ananmu?',
      other: 'Nsɛm {n} a wokyerɛwee maa nne kenkan da so wɔ kasa a edi kan no mu. Wopɛ sɛ wode nsɛm a wɔasiesie wɔ kasa foforo no mu si ananmu?',
    }),
    degistir: 'Fa nsɛm a wɔasiesie si ananmu',
    koru: 'Gyae no saa',
    degisti: cogul({ one: 'Wɔasesa nsɛm {n}.', other: 'Wɔasesa nsɛm {n}.' }),
  },
  vakitAdlari: {
    baslik: 'Nyamefrɛ din',
    aciklama: 'Paw sɛdeɛ wɔbɛfrɛ Nyamefrɛ mmerɛ no.',
    otomatik: 'Sɛdeɛ ɔman no te',
    otomatikAciklama: 'Ɛde din a wɔtaa de di dwuma wɔ ɔman a wowɔ mu no bedi dwuma.',
    takimlar: { temel: 'Arabeke din', diyanetDe: 'Diyanet (Gyaaman)', turkce: 'Tɛɛki din', magrip: 'Maghreb nkyerɛwee', cezayir: 'Algeria nkyerɛwee', afgan: 'Afghanistan din' },
  },
  yazi: {
    baslik: 'Nkyerɛwee',
    aciklama: 'Paw nkyerɛwee a wɔde bɛkyerɛw nsɛm no.',
    otomatik: 'Sɛdeɛ ɔman no te',
    otomatikAciklama: 'Ɛde nkyerɛwee a wɔtaa de di dwuma wɔ ɔman a wowɔ mu no bedi dwuma.',
    latin: 'Latin nkyerɛwee',
    kiril: 'Cyril nkyerɛwee',
  },
  kaydedilemedi: 'Wɔantumi ansie kasa no. San bɔ mmɔden.',
  sihirbazBaglantisi: 'Kasa · Language',
  sihirbazBaglantisiAciklama: 'Sesa app no kasa',
};
