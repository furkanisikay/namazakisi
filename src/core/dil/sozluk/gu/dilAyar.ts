// ÇEVİRİ: gu — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'ભાષા · Language',
  aciklama: 'Choose the app language. Notifications and read-aloud use it too.',
  grup: 'App language',
  dilAdlari: { tr: 'ટર્કિશ', en: 'અંગ્રેજી', id: 'ઇન્ડોનેશિયન', de: 'જર્મન', fr: 'ફ્રેન્ચ', bs: 'બોસ્નિયન', ru: 'રશિયન', ms: 'મલય', ar: 'અરબી', ur: 'ઉર્દૂ', es: 'સ્પેનિશ', nl: 'ડચ', sq: 'અલ્બેનિયન', hi: 'હિન્દી', bn: 'બાંગ્લા', fa: 'ફારસી', ps: 'પશ્તો', ckb: 'સેન્ટ્રલ કુર્દિશ', ug: 'ઉઇગુર', az: 'અઝરબૈજાની', uz: 'ઉઝ્બેક', kk: 'કઝાખ', ky: 'કિર્ગીઝ', tg: 'તાજીક', sw: 'સ્વાહિલી', ha: 'હૌસા', am: 'એમ્હારિક', om: 'ઓરોમો', so: 'સોમાલી', ff: 'ફુલા', yo: 'યોરૂબા', zh: 'સરળીકૃત ચાઇનીઝ', ta: 'તમિલ', ml: 'મલયાલમ', th: 'થાઈ', ko: 'કોરિયન', vi: 'વિયેતનામીસ', pt: 'પોર્ટુગીઝ', it: 'ઇટાલિયન', sv: 'સ્વીડિશ', uk: 'યુક્રેનિયન', ro: 'રોમાનિયન', hr: 'ક્રોએશિયન', sr: 'સર્બિયન', el: 'ગ્રીક', ku: 'કુર્દિશ (Kurmancî)', tk: 'તુર્કમેન', tt: 'તતાર', sd: 'સિંધી', pl: 'પોલીશ', ja: 'જાપાનીઝ', gu: 'ગુજરાતી', bg: 'બલ્ગેરિયન', mk: 'મેસેડોનિયન' },
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
  sihirbazBaglantisi: 'ભાષા · Language',
  sihirbazBaglantisiAciklama: 'Change the app language',
};
