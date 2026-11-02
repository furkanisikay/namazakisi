// ÇEVİRİ: bg — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Език · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'Турски', en: 'Английски', id: 'Индонезийски', de: 'Немски', fr: 'Френски', bs: 'Босненски', ru: 'Руски', ms: 'Малайски', ar: 'Арабски', ur: 'Урду', es: 'Испански', nl: 'Нидерландски', sq: 'Албански', hi: 'Хинди', bn: 'Бенгалски', fa: 'Персийски', ps: 'Пущу', ckb: 'Кюрдски (централен)', ug: 'Уйгурски', az: 'Азербайджански', uz: 'Узбекски', kk: 'Казахски', ky: 'Киргизки', tg: 'Таджикски', sw: 'Суахили', ha: 'Хауса', am: 'Амхарски', om: 'Оромо', so: 'Сомалийски', ff: 'Фула', yo: 'Йоруба', zh: 'Китайски (опростен)', ta: 'Тамилски', ml: 'Малаялам', th: 'Тайски', ko: 'Корейски', vi: 'Виетнамски', pt: 'Португалски', it: 'Италиански', sv: 'Шведски', uk: 'Украински', ro: 'Румънски', hr: 'Хърватски', sr: 'Сръбски', el: 'Гръцки', ku: 'Кюрдски (Kurmancî)', tk: 'Туркменски', tt: 'Татарски', sd: 'Синдхи', pl: 'Полски', ja: 'Японски', gu: 'Гуджарати', bg: 'Български', mk: 'Македонски' },
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
  sihirbazBaglantisi: 'Език · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
