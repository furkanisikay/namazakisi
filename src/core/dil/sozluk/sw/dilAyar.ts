import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Lugha · Language',
  aciklama: 'Chagua lugha ya programu. Arifa na usomaji kwa sauti huitumia pia.',
  grup: 'Lugha ya programu',
  dilAdlari: { tr: 'Kituruki', en: 'Kiingereza', id: 'Kiindonesia', de: 'Kijerumani', fr: 'Kifaransa', bs: 'Kibosnia', ru: 'Kirusi', ms: 'Kimalei', ar: 'Kiarabu', ur: 'Kiurdu', es: 'Kihispania', nl: 'Kiholanzi', sq: 'Kialbania', hi: 'Kihindi', bn: 'Kibengali', fa: 'Kiajemi', ps: 'Kipashto', ckb: 'Kikurdi cha Sorani', ug: 'Kiuyghur', az: 'Kiazerbaijani', uz: 'Kiuzbeki', kk: 'Kikazakh', ky: 'Kikyrgyz', tg: 'Kitajiki', sw: 'Kiswahili', ha: 'Kihausa', am: 'Kiamhari', om: 'Kioromo', so: 'Kisomali', ff: 'Kifulani', yo: 'Kiyoruba', zh: 'Kichina (Kilichorahisishwa)', ta: 'Kitamili', ml: 'Kimalayalamu', th: 'Kithai', ko: 'Kikorea', vi: 'Kivietinamu' },
  cihazDili: 'Lugha ya kifaa',
  cihazDiliKullaniliyor: 'Kwa sasa {ad}',
  cihazDiliDesteklenmiyor: 'Lugha ya kifaa chako bado haipatikani; Kituruki kinatumika.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Tafsiri za beta zinakaguliwa; baadhi ya maandishi huenda yasiwe kamili.',
    vakit: 'Lugha haibadilishi jinsi nyakati za Swala zinavyokokotolewa.',
    nass: 'Katika lugha zisizo Kituruki, tafsiri za Qur’ani tu ndizo zinazoonyeshwa; maandishi ya hadithi yanatoka kwenye chanzo cha Kituruki, kwa hivyo hayaonyeshwi.',
  },
  ozelAnons: {
    baslik: 'Maandishi ya kusomwa kwa sauti uliyoandika',
    govde: cogul({
      one: 'Maandishi {n} ya kusomwa kwa sauti uliyoandika bado yako katika lugha ya awali. Yabadilishwe kwa maandishi tayari ya lugha mpya?',
      other: 'Maandishi {n} ya kusomwa kwa sauti uliyoandika bado yako katika lugha ya awali. Yabadilishwe kwa maandishi tayari ya lugha mpya?',
    }),
    degistir: 'Badilisha kwa maandishi tayari',
    koru: 'Acha yalivyo',
    degisti: cogul({ one: 'Maandishi {n} yamebadilishwa.', other: 'Maandishi {n} yamebadilishwa.' }),
  },
  vakitAdlari: {
    baslik: 'Majina ya Swala',
    aciklama: 'Chagua jinsi nyakati za Swala zinavyoitwa.',
    otomatik: 'Kulingana na nchi',
    otomatikAciklama: 'Hutumia majina yanayotumika katika nchi ya mahali ulipo.',
    takimlar: { temel: 'Majina ya Kiarabu', diyanetDe: 'Diyanet (Kijerumani)', turkce: 'Majina ya Kituruki', magrip: 'Tahajia ya Maghrib', cezayir: 'Tahajia ya Algeria', afgan: 'Majina ya Kiafghani' },
  },
  yazi: {
    baslik: 'Alfabeti',
    aciklama: 'Chagua alfabeti ya kuandika maandishi.',
    otomatik: 'Kulingana na nchi',
    otomatikAciklama: 'Hutumia alfabeti inayotumika katika nchi ya mahali ulipo.',
    latin: 'Alfabeti ya Kilatini',
    kiril: 'Alfabeti ya Kisiriliki',
  },
  kaydedilemedi: 'Lugha haikuweza kuhifadhiwa. Jaribu tena.',
  sihirbazBaglantisi: 'Lugha · Language',
  sihirbazBaglantisiAciklama: 'Badilisha lugha ya programu',
};
