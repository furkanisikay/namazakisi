import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Gjuha · Language',
  aciklama: 'Zgjidhni gjuhën e aplikacionit. Njoftimet dhe leximi me zë do të jenë në këtë gjuhë.',
  grup: 'Gjuha e aplikacionit',
  dilAdlari: { tr: 'Turqisht', en: 'Anglisht', id: 'Indonezisht', de: 'Gjermanisht', fr: 'Frëngjisht', bs: 'Boshnjakisht', ru: 'Rusisht', ms: 'Malajisht', ar: 'Arabisht', ur: 'Urdu', es: 'Spanjisht', nl: 'Holandisht', sq: 'Shqip', hi: 'Hindisht', bn: 'Bengalisht' },
  cihazDili: 'Gjuha e pajisjes',
  cihazDiliKullaniliyor: 'Tani: {ad}',
  cihazDiliDesteklenmiyor: 'Gjuha e pajisjes suaj nuk është ende në dispozicion; përdoret turqishtja.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Përkthimet beta po rishikohen; disa tekste mund të kenë mangësi.',
    vakit: 'Gjuha nuk e ndryshon llogaritjen e kohëve të namazit.',
    nass: 'Në gjuhët përveç turqishtes shfaqen vetëm përkthimet e ajeteve; tekstet e hadithit nuk shfaqen, sepse vijnë nga burim turqisht.',
  },
  ozelAnons: {
    baslik: 'Tekstet e leximit me zë që keni shkruar vetë',
    govde: cogul({
      one: '{n} tekst leximi me zë që keni shkruar vetë mbeti në gjuhën e mëparshme. Ta zëvendësojmë me tekstin e gatshëm të gjuhës së re?',
      other: '{n} tekste leximi me zë që keni shkruar vetë mbetën në gjuhën e mëparshme. T’i zëvendësojmë me tekstet e gatshme të gjuhës së re?',
    }),
    degistir: 'Zëvendësojeni me tekstin e gatshëm',
    koru: 'Lëreni siç është',
    degisti: cogul({ one: '{n} tekst u zëvendësua.', other: '{n} tekste u zëvendësuan.' }),
  },
  vakitAdlari: {
    baslik: 'Emrat e vakteve',
    aciklama: 'Zgjidhni me cilët emra shkruhen vaktet.',
    otomatik: 'Sipas vendit',
    otomatikAciklama: 'Përdoren emrat e zakonshëm në vendin ku ndodheni.',
    takimlar: { temel: 'Emrat arabë', diyanetDe: 'Diyanet (gjermanisht)', turkce: 'Emrat turqisht', magrip: 'Shkrimi magrebian', cezayir: 'Shkrimi algjerian' },
  },
  kaydedilemedi: 'Gjuha nuk u ruajt. Provoni sërish.',
  sihirbazBaglantisi: 'Gjuha · Language',
  sihirbazBaglantisiAciklama: 'Ndryshoni gjuhën e aplikacionit',
};
