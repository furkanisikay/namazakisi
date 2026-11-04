import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Språk · Language',
  aciklama: 'Välj appens språk. Aviseringar och uppläsning använder det också.',
  grup: 'Appens språk',
  dilAdlari: { tr: 'Turkiska', en: 'Engelska', id: 'Indonesiska', de: 'Tyska', fr: 'Franska', bs: 'Bosniska', ru: 'Ryska', ms: 'Malajiska', ar: 'Arabiska', ur: 'Urdu', es: 'Spanska', nl: 'Nederländska', sq: 'Albanska', hi: 'Hindi', bn: 'Bengali', fa: 'Persiska', ps: 'Afghanska', ckb: 'Centralkurdiska', ug: 'Uiguriska', az: 'Azerbajdzjanska', uz: 'Uzbekiska', kk: 'Kazakiska', ky: 'Kirgiziska', tg: 'Tadzjikiska', sw: 'Swahili', ha: 'Hausa', am: 'Amhariska', om: 'Oromo', so: 'Somaliska', ff: 'Fulani', yo: 'Yoruba', zh: 'Förenklad kinesiska', ta: 'Tamil', ml: 'Malayalam', th: 'Thailändska', ko: 'Koreanska', vi: 'Vietnamesiska', pt: 'Portugisiska', it: 'Italienska', sv: 'Svenska', uk: 'Ukrainska', ro: 'Rumänska', hr: 'Kroatiska', sr: 'Serbiska', el: 'Grekiska', ku: 'Kurdiska (Kurmancî)', tk: 'Turkmeniska', tt: 'Tatariska', sd: 'Sindhi', pl: 'Polska', ja: 'Japanska', gu: 'Gujarati', bg: 'Bulgariska', mk: 'Makedonska', fil: 'Filippinska', te: 'Telugu', kn: 'Kannada', mr: 'Marathi', pa: 'Punjabi (arabiska, Pakistan)', as: 'Assamesiska', ne: 'Nepalesiska', si: 'Singalesiska', km: 'Kambodjanska' },
  cihazDili: 'Enhetens språk',
  cihazDiliKullaniliyor: 'För närvarande {ad}',
  cihazDiliDesteklenmiyor: 'Enhetens språk är inte tillgängligt än; turkiska används.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Betaöversättningar granskas; viss text kan vara ofullständig.',
    vakit: 'Språket ändrar inte hur bönetiderna beräknas.',
    nass: 'På andra språk än turkiska visas bara översättningar av Koranen; hadithtexterna kommer från en turkisk källa och visas därför inte.',
  },
  ozelAnons: {
    baslik: 'Uppläsningstexter du har skrivit',
    govde: cogul({
      one: '{n} uppläsningstext du har skrivit är fortfarande på det tidigare språket. Ersätta den med den färdiga texten på det nya språket?',
      other: '{n} uppläsningstexter du har skrivit är fortfarande på det tidigare språket. Ersätta dem med de färdiga texterna på det nya språket?',
    }),
    degistir: 'Ersätt med färdig text',
    koru: 'Behåll som den är',
    degisti: cogul({ one: '{n} text ersattes.', other: '{n} texter ersattes.' }),
  },
  vakitAdlari: {
    baslik: 'Bönernas namn',
    aciklama: 'Välj hur bönetiderna benämns.',
    otomatik: 'Efter land',
    otomatikAciklama: 'Använder de namn som är vanliga i landet där du befinner dig.',
    takimlar: { temel: 'Arabiska namn', diyanetDe: 'Diyanet (tyska)', turkce: 'Turkiska namn', magrip: 'Maghrebinsk stavning', cezayir: 'Algerisk stavning', afgan: 'Afghanska namn' },
  },
  yazi: {
    baslik: 'Alfabet',
    aciklama: 'Välj vilket alfabet texten skrivs med.',
    otomatik: 'Efter land',
    otomatikAciklama: 'Använder det alfabet som är vanligt i landet där du befinner dig.',
    latin: 'Latinska alfabetet',
    kiril: 'Kyrilliska alfabetet',
  },
  kaydedilemedi: 'Språket kunde inte sparas. Försök igen.',
  sihirbazBaglantisi: 'Språk · Language',
  sihirbazBaglantisiAciklama: 'Byt appens språk',
};
