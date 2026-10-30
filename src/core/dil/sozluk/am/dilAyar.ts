// ÇEVİRİ: am — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Language · Dil',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'ቱርክኛ', en: 'እንግሊዝኛ', id: 'ኢንዶኔዥያኛ', de: 'ጀርመንኛ', fr: 'ፈረንሳይኛ', bs: 'ቦስኒያንኛ', ru: 'ራሽያኛ', ms: 'ማላይ', ar: 'ዓረብኛ', ur: 'ኡርዱኛ', es: 'ስፓኒሽ', nl: 'ደች', sq: 'አልባንያንኛ', hi: 'ሕንድኛ', bn: 'ቤንጋሊኛ', fa: 'ፐርሺያኛ', ps: 'ፓሽቶ', ckb: 'የሶራኒ ኩርድኛ', ug: 'ኡይግሁር', az: 'አዘርባጃንኛ', uz: 'ኡዝቤክኛ', kk: 'ካዛክኛ', ky: 'ክይርግይዝ', tg: 'ታጂክ', sw: 'ስዋሂሊኛ', ha: 'ሃውሳኛ', am: 'አማርኛ', om: 'ኦሮሚኛ', so: 'ሱማልኛ', ff: 'ፉላኒኛ', yo: 'ዮሩባዊኛ' },
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
  sihirbazBaglantisi: 'Language · Dil',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
