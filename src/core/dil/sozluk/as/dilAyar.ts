// ÇEVİRİ: as — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'ভাষা · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'তুৰ্কী', en: 'ইংৰাজী', id: 'ইণ্ডোনেচিয়', de: 'জাৰ্মান', fr: 'ফ্ৰেন্স', bs: 'বছনীয়', ru: 'ৰাছিয়ান', ms: 'মালয়', ar: 'আৰবী', ur: 'উৰ্দু', es: 'স্পেনিচ', nl: 'ডাচ', sq: 'আলবেনীয়', hi: 'হিন্দী', bn: 'বাংলা', fa: 'ফাৰ্ছী', ps: 'পুস্ত', ckb: 'চেণ্ট্ৰেল কুৰ্ডিচ', ug: 'উইঘুৰ', az: 'আজেৰবাইজানী', uz: 'উজবেক', kk: 'কাজাখ', ky: 'কিৰ্গিজ', tg: 'তাজিক', sw: 'স্বাহিলি', ha: 'হাউছা', am: 'আমহাৰিক', om: 'ওৰোমো', so: 'ছোমালি', ff: 'ফুলাহ', yo: 'ইউৰুবা', zh: 'সৰলীকৃত চীনা', ta: 'তামিল', ml: 'মালায়ালম', th: 'থাই', ko: 'কোৰিয়ান', vi: 'ভিয়েটনামী', pt: 'পৰ্তুগীজ', it: 'ইটালিয়ান', sv: 'ছুইডিচ', uk: 'ইউক্ৰেইনীয়', ro: 'ৰোমানীয়', hr: 'ক্ৰোৱেচিয়ান', sr: 'ছাৰ্বিয়ান', el: 'গ্ৰীক', ku: 'কুৰ্ডিচ (Kurmancî)', tk: 'তুৰ্কমেন', tt: 'তাতাৰ', sd: 'সিন্ধী', pl: 'প’লিচ', ja: 'জাপানী', gu: 'গুজৰাটী', bg: 'বুলগেৰীয়', mk: 'মেচিডোনীয়', fil: 'ফিলিপিনো', te: 'তেলুগু', kn: 'কানাড়া', mr: 'মাৰাঠী', pa: 'পাঞ্জাবী (আৰবী, পাকিস্তান)', as: 'অসমীয়া', ne: 'নেপালী', si: 'সিংহলা', km: 'খমেৰ' },
  cihazDili: 'Device language',
  cihazDiliKullaniliyor: 'Currently {ad}',
  cihazDiliDesteklenmiyor: "Your device language isn't available yet; Turkish is used.",
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta translations are being reviewed; some text may be imperfect.',
    vakit: "The language doesn't change how prayer times are calculated.",
    nass: 'In languages other than Turkish, only Quran translations are shown; hadith texts come from a Turkish source, so they are not shown.',
  },
  ozelAnons: {
    baslik: 'Read-aloud texts you wrote',
    govde: cogul({
      one: '{n} read-aloud text you wrote is still in the previous language. Replace it with the ready-made text in the new language?',
      other: '{n} read-aloud texts you wrote are still in the previous language. Replace them with the ready-made texts in the new language?',
    }),
    degistir: 'Replace with ready-made text',
    koru: 'Keep as is',
    degisti: cogul({ one: '{n} text replaced.', other: '{n} texts replaced.' }),
  },
  vakitAdlari: {
    baslik: 'Prayer names',
    aciklama: 'Choose how prayer times are named.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the names common in the country of your location.',
    takimlar: { temel: 'Arabic names', diyanetDe: 'Diyanet (German)', turkce: 'Turkish names', magrip: 'Maghrebi spelling', cezayir: 'Algerian spelling', afgan: 'Afghan names' },
  },
  yazi: {
    baslik: 'Alphabet',
    aciklama: 'Choose which alphabet text is written in.',
    otomatik: 'By country',
    otomatikAciklama: 'Uses the alphabet common in the country of your location.',
    latin: 'Latin alphabet',
    kiril: 'Cyrillic alphabet',
  },
  kaydedilemedi: "The language couldn't be saved. Try again.",
  sihirbazBaglantisi: 'ভাষা · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
