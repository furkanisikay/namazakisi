// ÇEVİRİ: si — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'භාෂාව · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'තුර්කි', en: 'ඉංග්‍රීසි', id: 'ඉන්දුනීසියානු', de: 'ජර්මන්', fr: 'ප්‍රංශ', bs: 'බොස්නියානු', ru: 'රුසියානු', ms: 'මැලේ', ar: 'අරාබි', ur: 'උර්දු', es: 'ස්පාඤ්ඤ', nl: 'ලන්දේසි', sq: 'ඇල්බේනියානු', hi: 'හින්දි', bn: 'බෙංගාලි', fa: 'පර්සියානු', ps: 'පෂ්ටො', ckb: 'සොරානි කුර්දිෂ්', ug: 'උයිගර්', az: 'අසර්බයිජාන්', uz: 'උස්බෙක්', kk: 'කසාඛ්', ky: 'කිර්ගිස්', tg: 'ටජික්', sw: 'ස්වාහිලි', ha: 'හෝසා', am: 'ඇම්හාරික්', om: 'ඔරොමෝ', so: 'සෝමාලි', ff: 'ෆුලාහ්', yo: 'යොරූබා', zh: 'සරල චීන', ta: 'දෙමළ', ml: 'මලයාලම්', th: 'තායි', ko: 'කොරියානු', vi: 'වියට්නාම්', pt: 'පෘතුගීසි', it: 'ඉතාලි', sv: 'ස්වීඩන්', uk: 'යුක්රේනියානු', ro: 'රොමේනියානු', hr: 'කෝඒෂියානු', sr: 'සර්බියානු', el: 'ග්‍රීක', ku: 'කුර්දි (Kurmancî)', tk: 'ටර්ක්මෙන්', tt: 'ටාටර්', sd: 'සින්ධි', pl: 'පෝලන්ත', ja: 'ජපන්', gu: 'ගුජරාටි', bg: 'බල්ගේරියානු', mk: 'මැසිඩෝනියානු', fil: 'පිලිපීන', te: 'තෙළිඟු', kn: 'කණ්ණඩ', mr: 'මරාති', pa: 'පන්ජාබි (අරාබි, පාකිස්තානය)', as: 'ඇසෑම්', ne: 'නේපාල', si: 'සිංහල', km: 'කමර්' },
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
  sihirbazBaglantisi: 'භාෂාව · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
