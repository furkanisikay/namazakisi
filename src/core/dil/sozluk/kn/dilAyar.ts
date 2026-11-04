// ÇEVİRİ: kn — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'ಭಾಷೆ · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'ಟರ್ಕಿಶ್', en: 'ಇಂಗ್ಲಿಷ್', id: 'ಇಂಡೋನೇಶಿಯನ್', de: 'ಜರ್ಮನ್', fr: 'ಫ್ರೆಂಚ್', bs: 'ಬೋಸ್ನಿಯನ್', ru: 'ರಷ್ಯನ್', ms: 'ಮಲಯ್', ar: 'ಅರೇಬಿಕ್', ur: 'ಉರ್ದು', es: 'ಸ್ಪ್ಯಾನಿಷ್', nl: 'ಡಚ್', sq: 'ಅಲ್ಬೇನಿಯನ್', hi: 'ಹಿಂದಿ', bn: 'ಬಾಂಗ್ಲಾ', fa: 'ಪರ್ಶಿಯನ್', ps: 'ಪಾಷ್ಟೋ', ckb: 'ಮಧ್ಯ ಕುರ್ದಿಶ್', ug: 'ಉಯಿಘರ್', az: 'ಅಜೆರ್ಬೈಜಾನಿ', uz: 'ಉಜ್ಬೇಕ್', kk: 'ಕಝಕ್', ky: 'ಕಿರ್ಗಿಜ್', tg: 'ತಾಜಿಕ್', sw: 'ಸ್ವಹಿಲಿ', ha: 'ಹೌಸಾ', am: 'ಅಂಹರಿಕ್', om: 'ಒರೊಮೊ', so: 'ಸೊಮಾಲಿ', ff: 'ಫುಲಾ', yo: 'ಯೊರುಬಾ', zh: 'ಸರಳೀಕೃತ ಚೈನೀಸ್', ta: 'ತಮಿಳು', ml: 'ಮಲಯಾಳಂ', th: 'ಥಾಯ್', ko: 'ಕೊರಿಯನ್', vi: 'ವಿಯೆಟ್ನಾಮೀಸ್', pt: 'ಪೋರ್ಚುಗೀಸ್', it: 'ಇಟಾಲಿಯನ್', sv: 'ಸ್ವೀಡಿಷ್', uk: 'ಉಕ್ರೇನಿಯನ್', ro: 'ರೊಮೇನಿಯನ್', hr: 'ಕ್ರೊಯೇಶಿಯನ್', sr: 'ಸೆರ್ಬಿಯನ್', el: 'ಗ್ರೀಕ್', ku: 'ಕುರ್ದಿಷ್ (Kurmancî)', tk: 'ಟರ್ಕ್‌ಮೆನ್', tt: 'ಟಾಟರ್', sd: 'ಸಿಂಧಿ', pl: 'ಪೊಲಿಶ್', ja: 'ಜಾಪನೀಸ್', gu: 'ಗುಜರಾತಿ', bg: 'ಬಲ್ಗೇರಿಯನ್', mk: 'ಮೆಸಿಡೋನಿಯನ್', fil: 'ಫಿಲಿಪಿನೊ', te: 'ತೆಲುಗು', kn: 'ಕನ್ನಡ', mr: 'ಮರಾಠಿ', pa: 'ಪಂಜಾಬಿ (ಅರೇಬಿಕ್, ಪಾಕಿಸ್ತಾನ)', as: 'ಅಸ್ಸಾಮೀಸ್', ne: 'ನೇಪಾಳಿ', si: 'ಸಿಂಹಳ', km: 'ಖಮೇರ್' },
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
  sihirbazBaglantisi: 'ಭಾಷೆ · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
