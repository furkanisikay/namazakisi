// ÇEVİRİ: mr — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'भाषा · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'तुर्की', en: 'इंग्रजी', id: 'इंडोनेशियन', de: 'जर्मन', fr: 'फ्रेंच', bs: 'बोस्नियन', ru: 'रशियन', ms: 'मलय', ar: 'अरबी', ur: 'उर्दू', es: 'स्पॅनिश', nl: 'डच', sq: 'अल्बानियन', hi: 'हिंदी', bn: 'बंगाली', fa: 'फारसी', ps: 'पश्तो', ckb: 'मध्य कुर्दिश', ug: 'उइगुर', az: 'अझरबैजानी', uz: 'उझ्बेक', kk: 'कझाक', ky: 'किरगीझ', tg: 'ताजिक', sw: 'स्वाहिली', ha: 'हौसा', am: 'अम्हारिक', om: 'ओरोमो', so: 'सोमाली', ff: 'फुलाह', yo: 'योरुबा', zh: 'सरलीकृत चीनी', ta: 'तामिळ', ml: 'मल्याळम', th: 'थाई', ko: 'कोरियन', vi: 'व्हिएतनामी', pt: 'पोर्तुगीज', it: 'इटालियन', sv: 'स्वीडिश', uk: 'युक्रेनियन', ro: 'रोमानियन', hr: 'क्रोएशियन', sr: 'सर्बियन', el: 'ग्रीक', ku: 'कुर्दिश (Kurmancî)', tk: 'तुर्कमेन', tt: 'तातर', sd: 'सिंधी', pl: 'पोलिश', ja: 'जपानी', gu: 'गुजराती', bg: 'बल्गेरियन', mk: 'मॅसेडोनियन', fil: 'फिलिपिनो', te: 'तेलगू', kn: 'कन्नड', mr: 'मराठी', pa: 'पंजाबी (अरबी, पाकिस्तान)', as: 'आसामी', ne: 'नेपाळी', si: 'सिंहला', km: 'ख्मेर' },
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
  sihirbazBaglantisi: 'भाषा · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
