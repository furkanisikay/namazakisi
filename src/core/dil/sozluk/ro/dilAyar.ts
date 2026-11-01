import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Limbă · Language',
  aciklama: 'Alegeți limba aplicației. Notificările și citirea cu voce tare o folosesc și ele.',
  grup: 'Limba aplicației',
  dilAdlari: { tr: 'Turcă', en: 'Engleză', id: 'Indoneziană', de: 'Germană', fr: 'Franceză', bs: 'Bosniacă', ru: 'Rusă', ms: 'Malaeză', ar: 'Arabă', ur: 'Urdu', es: 'Spaniolă', nl: 'Neerlandeză', sq: 'Albaneză', hi: 'Hindi', bn: 'Bengaleză', fa: 'Persană', ps: 'Paștună', ckb: 'Kurdă centrală', ug: 'Uigură', az: 'Azeră', uz: 'Uzbecă', kk: 'Kazahă', ky: 'Kârgâză', tg: 'Tadjică', sw: 'Swahili', ha: 'Hausa', am: 'Amharică', om: 'Oromo', so: 'Somaleză', ff: 'Fulah', yo: 'Yoruba', zh: 'Chineză simplificată', ta: 'Tamilă', ml: 'Malayalam', th: 'Thailandeză', ko: 'Coreeană', vi: 'Vietnameză', pt: 'Portugheză', it: 'Italiană', sv: 'Suedeză', uk: 'Ucraineană', ro: 'Română', hr: 'Croată', sr: 'Sârbă', el: 'Greacă' },
  cihazDili: 'Limba dispozitivului',
  cihazDiliKullaniliyor: 'Acum {ad}',
  cihazDiliDesteklenmiyor: 'Limba dispozitivului nu este încă disponibilă; se folosește turca.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Traducerile beta sunt în curs de revizuire; unele texte pot fi imperfecte.',
    vakit: 'Limba nu schimbă modul de calcul al orelor de rugăciune.',
    nass: 'În alte limbi decât turca se afișează doar traduceri ale Coranului; textele de hadis provin dintr-o sursă în turcă, așa că nu sunt afișate.',
  },
  ozelAnons: {
    baslik: 'Texte de citire scrise manual',
    govde: cogul({
      one: '{n} text de citire cu voce tare scris manual este încă în limba anterioară. Îl înlocuiți cu textul gata făcut în noua limbă?',
      few: '{n} texte de citire cu voce tare scrise manual sunt încă în limba anterioară. Le înlocuiți cu textele gata făcute în noua limbă?',
      other: '{n} de texte de citire cu voce tare scrise manual sunt încă în limba anterioară. Le înlocuiți cu textele gata făcute în noua limbă?',
    }),
    degistir: 'Înlocuiți cu textul gata făcut',
    koru: 'Păstrați așa',
    degisti: cogul({ one: '{n} text înlocuit.', few: '{n} texte înlocuite.', other: '{n} de texte înlocuite.' }),
  },
  vakitAdlari: {
    baslik: 'Numele rugăciunilor',
    aciklama: 'Alegeți cum sunt numite orele de rugăciune.',
    otomatik: 'După țară',
    otomatikAciklama: 'Folosește numele obișnuite în țara în care vă aflați.',
    takimlar: { temel: 'Nume arabe', diyanetDe: 'Diyanet (germană)', turkce: 'Nume turcești', magrip: 'Grafie magrebină', cezayir: 'Grafie algeriană', afgan: 'Nume afgane' },
  },
  yazi: {
    baslik: 'Alfabet',
    aciklama: 'Alegeți alfabetul în care este scris textul.',
    otomatik: 'După țară',
    otomatikAciklama: 'Folosește alfabetul obișnuit în țara în care vă aflați.',
    latin: 'Alfabetul latin',
    kiril: 'Alfabetul chirilic',
  },
  kaydedilemedi: 'Limba nu a putut fi salvată. Încercați din nou.',
  sihirbazBaglantisi: 'Limbă · Language',
  sihirbazBaglantisiAciklama: 'Schimbați limba aplicației',
};
