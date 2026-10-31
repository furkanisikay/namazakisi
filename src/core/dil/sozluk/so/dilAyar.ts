import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Luqadda · Language',
  aciklama: 'Dooro luqadda barnaamijka. Ogeysiisyada iyo akhrinta codka ahi sidoo kale way isticmaalaan.',
  grup: 'Luqadda barnaamijka',
  dilAdlari: { tr: 'Turki', en: 'Ingiriisi', id: 'Indunusiyaan', de: 'Jarmal', fr: 'Faransiis', bs: 'Bosniyaan', ru: 'Ruush', ms: 'Malaay', ar: 'Carabi', ur: 'Urduu', es: 'Isbaanish', nl: 'Holandays', sq: 'Albeeniyaan', hi: 'Hindi', bn: 'Bangaali', fa: 'Faarisi', ps: 'Bashtuu', ckb: 'Kurdiga Dhexe', ug: 'Uighur', az: 'Asarbayjan', uz: 'Usbakis', kk: 'Kasaaq', ky: 'Kirgiis', tg: 'Taajik', sw: 'Sawaaxili', ha: 'Hawsa', am: 'Axmaar', om: 'Oromo', so: 'Soomaali', ff: 'Fuulah', yo: 'Yoruuba', zh: 'Shiinaha Rasmiga ah', ta: 'Tamiil', ml: 'Malayalam', th: 'Taaylandays', ko: 'Kuuriyaan', vi: 'Fiitnaamays' },
  cihazDili: 'Luqadda qalabka',
  cihazDiliKullaniliyor: 'Hadda {ad}',
  cihazDiliDesteklenmiyor: 'Luqadda qalabkaagu weli lama heli karo; Turkiga ayaa la isticmaalayaa.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Tarjumaadaha Beta dib ayaa loo eegayaa; qoraallada qaarkood waxaa laga yaabaa inay dhiman yihiin.',
    vakit: 'Luqaddu ma beddesho sida waqtiyada salaadda loo xisaabiyo.',
    nass: 'Luqadaha aan Turkiga ahayn, waxaa la tusaa oo kaliya tarjumaadaha Qur\'aanka; qoraallada xadiisku waxay ka yimaadaan il Turki ah, sidaas darteed lama tuso.',
  },
  ozelAnons: {
    baslik: 'Qoraallada akhrinta codka ee aad qortay',
    govde: cogul({
      one: '{n} qoraal oo akhrinta codka ah oo aad qortay ayaa weli ku jira luqaddii hore. Ma ku beddeshaa qoraalka diyaarsan ee luqadda cusub?',
      other: '{n} qoraal oo akhrinta codka ah oo aad qortay ayaa weli ku jira luqaddii hore. Ma ku beddeshaa qoraallada diyaarsan ee luqadda cusub?',
    }),
    degistir: 'Ku beddel qoraalka diyaarsan',
    koru: 'Sidiisa u daa',
    degisti: cogul({ one: '{n} qoraal ayaa la beddelay.', other: '{n} qoraal ayaa la beddelay.' }),
  },
  vakitAdlari: {
    baslik: 'Magacyada salaadda',
    aciklama: 'Dooro sida waqtiyada salaadda loo magacaabo.',
    otomatik: 'Iyadoo loo eegayo dalka',
    otomatikAciklama: 'Waxaa la isticmaalayaa magacyada caadiga ka ah dalka goobtaadu ku taal.',
    takimlar: { temel: 'Magacyada Carabiga', diyanetDe: 'Diyanet (Jarmal)', turkce: 'Magacyada Turkiga', magrip: 'Higgaadda Maghrib', cezayir: 'Higgaadda Aljeeriya', afgan: 'Magacyada Afgaanistaan' },
  },
  yazi: {
    baslik: 'Alifbeetada',
    aciklama: 'Dooro alifbeetada qoraalka lagu qoro.',
    otomatik: 'Iyadoo loo eegayo dalka',
    otomatikAciklama: 'Waxaa la isticmaalayaa alifbeetada caadiga ka ah dalka goobtaadu ku taal.',
    latin: 'Alifbeetada Laatiinka',
    kiril: 'Alifbeetada Siriliga',
  },
  kaydedilemedi: 'Luqadda lama kaydin karin. Isku day mar kale.',
  sihirbazBaglantisi: 'Luqadda · Language',
  sihirbazBaglantisiAciklama: 'Beddel luqadda barnaamijka',
};
