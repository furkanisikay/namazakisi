import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Jezik · Language',
  aciklama: 'Odaberite jezik aplikacije. Obavještenja i čitanje naglas također će biti na tom jeziku.',
  grup: 'Jezik aplikacije',
  dilAdlari: { tr: 'Turski', en: 'Engleski', id: 'Indonezijski', de: 'Njemački', fr: 'Francuski', bs: 'Bosanski', ru: 'Ruski', ms: 'Malajski' },
  cihazDili: 'Jezik uređaja',
  cihazDiliKullaniliyor: 'Trenutno: {ad}',
  cihazDiliDesteklenmiyor: 'Jezik Vašeg uređaja još nije dostupan; koristi se turski.',
  beta: 'Beta',
  betaAciklama: '{ad} · Beta',
  notlar: {
    beta: 'Beta prijevodi se pregledaju; neki tekstovi mogu imati greške.',
    vakit: 'Jezik ne mijenja način izračuna namaskih vremena.',
    nass: 'Na jezicima osim turskog prikazuju se samo prijevodi značenja ajeta; hadiski tekstovi dolaze iz turskog izvora, pa se ne prikazuju.',
  },
  ozelAnons: {
    baslik: 'Tekstovi za čitanje naglas koje ste sami napisali',
    govde: cogul({
      one: '{n} tekst za čitanje naglas koji ste sami napisali ostao je na prethodnom jeziku. Zamijeniti ga gotovim tekstom na novom jeziku?',
      few: '{n} teksta za čitanje naglas koje ste sami napisali ostala su na prethodnom jeziku. Zamijeniti ih gotovim tekstovima na novom jeziku?',
      other: '{n} tekstova za čitanje naglas koje ste sami napisali ostalo je na prethodnom jeziku. Zamijeniti ih gotovim tekstovima na novom jeziku?',
    }),
    degistir: 'Zamijenite gotovim tekstom',
    koru: 'Ostavite kako jeste',
    degisti: cogul({ one: 'Zamijenjen je {n} tekst.', few: 'Zamijenjena su {n} teksta.', other: 'Zamijenjeno je {n} tekstova.' }),
  },
  kaydedilemedi: 'Jezik nije sačuvan. Pokušajte ponovo.',
  sihirbazBaglantisi: 'Jezik · Language',
  sihirbazBaglantisiAciklama: 'Promijenite jezik aplikacije',
};
