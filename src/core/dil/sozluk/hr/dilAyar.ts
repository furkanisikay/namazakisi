import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Jezik · Language',
  aciklama: 'Odaberite jezik aplikacije. Koristi se i za obavijesti i čitanje naglas.',
  grup: 'Jezik aplikacije',
  dilAdlari: { tr: 'Turski', en: 'Engleski', id: 'Indonezijski', de: 'Njemački', fr: 'Francuski', bs: 'Bosanski', ru: 'Ruski', ms: 'Malajski', ar: 'Arapski', ur: 'Urdski', es: 'Španjolski', nl: 'Nizozemski', sq: 'Albanski', hi: 'Hindski', bn: 'Bangla', fa: 'Perzijski', ps: 'Paštunski', ckb: 'Soranski kurdski', ug: 'Ujgurski', az: 'Azerbajdžanski', uz: 'Uzbečki', kk: 'Kazaški', ky: 'Kirgiski', tg: 'Tadžički', sw: 'Svahili', ha: 'Hausa', am: 'Amharski', om: 'Oromski', so: 'Somalski', ff: 'Fula', yo: 'Jorupski', zh: 'Kineski (pojednostavljeni)', ta: 'Tamilski', ml: 'Malajalamski', th: 'Tajlandski', ko: 'Korejski', vi: 'Vijetnamski', pt: 'Portugalski', it: 'Talijanski', sv: 'Švedski', uk: 'Ukrajinski', ro: 'Rumunjski', hr: 'Hrvatski', sr: 'Srpski', el: 'Grčki' },
  cihazDili: 'Jezik uređaja',
  cihazDiliKullaniliyor: 'Trenutačno: {ad}',
  cihazDiliDesteklenmiyor: 'Jezik vašeg uređaja još nije dostupan; koristi se turski.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta prijevodi se pregledavaju; neki tekstovi možda nisu savršeni.',
    vakit: 'Jezik ne mijenja način izračuna vremena namaza.',
    nass: "Na jezicima osim turskog prikazuju se samo prijevodi značenja Kur'ana; tekstovi hadisa dolaze iz turskog izvora, pa se ne prikazuju.",
  },
  ozelAnons: {
    baslik: 'Tekstovi za čitanje naglas koje ste napisali',
    govde: cogul({
      one: '{n} tekst za čitanje naglas koji ste napisali još je na prethodnom jeziku. Želite li ga zamijeniti gotovim tekstom na novom jeziku?',
      few: '{n} teksta za čitanje naglas koja ste napisali još su na prethodnom jeziku. Želite li ih zamijeniti gotovim tekstovima na novom jeziku?',
      other: '{n} tekstova za čitanje naglas koje ste napisali još je na prethodnom jeziku. Želite li ih zamijeniti gotovim tekstovima na novom jeziku?',
    }),
    degistir: 'Zamijenite gotovim tekstom',
    koru: 'Zadržite',
    degisti: cogul({ one: 'Zamijenjen je {n} tekst.', few: 'Zamijenjena su {n} teksta.', other: 'Zamijenjeno je {n} tekstova.' }),
  },
  vakitAdlari: {
    baslik: 'Nazivi namaza',
    aciklama: 'Odaberite kako se nazivaju vremena namaza.',
    otomatik: 'Prema zemlji',
    otomatikAciklama: 'Koriste se nazivi uobičajeni u zemlji u kojoj se nalazite.',
    takimlar: { temel: 'Arapski nazivi', diyanetDe: 'Diyanet (njemački)', turkce: 'Turski nazivi', magrip: 'Magrepski pravopis', cezayir: 'Alžirski pravopis', afgan: 'Afganistanski nazivi' },
  },
  yazi: {
    baslik: 'Pismo',
    aciklama: 'Odaberite kojim se pismom piše tekst.',
    otomatik: 'Prema zemlji',
    otomatikAciklama: 'Koristi se pismo uobičajeno u zemlji u kojoj se nalazite.',
    latin: 'Latinica',
    kiril: 'Ćirilica',
  },
  kaydedilemedi: 'Jezik nije moguće spremiti. Pokušajte ponovno.',
  sihirbazBaglantisi: 'Jezik · Language',
  sihirbazBaglantisiAciklama: 'Promijenite jezik aplikacije',
};
