// ÇEVİRİ: ne — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'भाषा · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'टर्किश', en: 'अङ्ग्रेजी', id: 'इन्डोनेसियाली', de: 'जर्मन', fr: 'फ्रान्सेली', bs: 'बोस्नियाली', ru: 'रसियाली', ms: 'मलाय', ar: 'अरबी', ur: 'उर्दु', es: 'स्पेनी', nl: 'डच', sq: 'अल्बानियाली', hi: 'हिन्दी', bn: 'बंगाली', fa: 'फारसी', ps: 'पास्तो', ckb: 'मध्यवर्ती कुर्दिस', ug: 'उइघुर', az: 'अजरबैजानी', uz: 'उज्बेकी', kk: 'काजाख', ky: 'किर्गिज', tg: 'ताजिक', sw: 'स्वाहिली', ha: 'हाउसा', am: 'अम्हारिक', om: 'ओरोमो', so: 'सोमाली', ff: 'फुलाह', yo: 'योरूवा', zh: 'सरलिकृत चिनियाँ', ta: 'तामिल', ml: 'मलयालम', th: 'थाई', ko: 'कोरियाली', vi: 'भियतनामी', pt: 'पोर्तुगी', it: 'इटालेली', sv: 'स्विडिस', uk: 'युक्रेनी', ro: 'रोमानियाली', hr: 'क्रोयसियाली', sr: 'सर्बियाली', el: 'ग्रीक', ku: 'कुर्दी (Kurmancî)', tk: 'टर्कमेन', tt: 'तातार', sd: 'सिन्धी', pl: 'पोलिस', ja: 'जापानी', gu: 'गुजराती', bg: 'बुल्गेरियाली', mk: 'म्यासेडोनियन', fil: 'फिलिपिनी', te: 'तेलुगु', kn: 'कन्नाडा', mr: 'मराठी', pa: 'पंजाबी (अरबी, पाकिस्तान)', as: 'आसामी', ne: 'नेपाली', si: 'सिन्हाली', km: 'खमेर' },
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
