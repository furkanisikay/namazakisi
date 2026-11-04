// ÇEVİRİ: te — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'భాష · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'టర్కిష్', en: 'ఇంగ్లీష్', id: 'ఇండోనేషియన్', de: 'జర్మన్', fr: 'ఫ్రెంచ్', bs: 'బోస్నియన్', ru: 'రష్యన్', ms: 'మలయ్', ar: 'అరబిక్', ur: 'ఉర్దూ', es: 'స్పానిష్', nl: 'డచ్', sq: 'అల్బేనియన్', hi: 'హిందీ', bn: 'బంగ్లా', fa: 'పర్షియన్', ps: 'పాష్టో', ckb: 'సెంట్రల్ కర్డిష్', ug: 'ఉయ్‌ఘర్', az: 'అజర్బైజాని', uz: 'ఉజ్బెక్', kk: 'కజఖ్', ky: 'కిర్గిజ్', tg: 'తజిక్', sw: 'స్వాహిలి', ha: 'హౌసా', am: 'అమ్హారిక్', om: 'ఒరోమో', so: 'సోమాలి', ff: 'ఫ్యుల', yo: 'యోరుబా', zh: 'సరళీకృత చైనీస్', ta: 'తమిళం', ml: 'మలయాళం', th: 'థాయ్', ko: 'కొరియన్', vi: 'వియత్నామీస్', pt: 'పోర్చుగీస్', it: 'ఇటాలియన్', sv: 'స్వీడిష్', uk: 'ఉక్రెయినియన్', ro: 'రొమేనియన్', hr: 'క్రొయేషియన్', sr: 'సెర్బియన్', el: 'గ్రీక్', ku: 'కుర్దిష్ (Kurmancî)', tk: 'తుర్క్‌మెన్', tt: 'టాటర్', sd: 'సింధీ', pl: 'పోలిష్', ja: 'జపనీస్', gu: 'గుజరాతీ', bg: 'బల్గేరియన్', mk: 'మాసిడోనియన్', fil: 'ఫిలిపినో', te: 'తెలుగు', kn: 'కన్నడ', mr: 'మరాఠీ', pa: 'పంజాబీ (అరబిక్, పాకిస్తాన్)', as: 'అస్సామీస్', ne: 'నేపాలీ', si: 'సింహళం', km: 'ఖ్మేర్' },
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
  sihirbazBaglantisi: 'భాష · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
