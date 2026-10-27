import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Odbrojavanje vakta',
    kanalAciklama: 'Obavještenje s odbrojavanjem prije isteka vakta',
    baslik: '⏱️ {ad}',
    govde: 'Vakat {ad} uskoro ističe.',
  },
  canli: {
    vakitGovde: 'Preostalo vrijeme do isteka vakta: {ad}',
    cumaBaslik: '🕌 Džuma-namaz',
    cumaGovde: 'Preostalo vrijeme do podne-namaza (hutbe)',
    nafileGovde: 'Preostalo vrijeme do kraja: {ad}',
  },
  iftar: {
    kanal: 'Odbrojavanje do iftara',
    kanalAciklama: 'Obavještenje s odbrojavanjem do iftara',
    baslik: '🌙 Do iftara',
    govde: 'Ne prekidajte post prije nego što čujete ezan.',
    girdiBaslik: '🌙 Vrijeme je iftara',
    girdiGovde: 'Hajirli iftar.',
    girdiUzun: 'Hajirli iftar.\n\n⚠️ Ne prekidajte post prije nego što čujete ezan. Spomenite i nas u svojim dovama :)',
  },
  sahur: {
    kanal: 'Odbrojavanje do kraja sehura',
    kanalAciklama: 'Obavještenje s odbrojavanjem do kraja sehura (zora)',
    baslik: '🌙 Do kraja sehura',
    govde: 'Još možete jesti i piti; zora se približava.',
    girdiBaslik: '🌙 Vrijeme sehura je prošlo',
    girdiGovde: 'Vrijeme je za nijet.',
    girdiUzun: 'Nastupila je zora; ne zaboravite zanijetiti post.\n\n⚠️ Sada možete klanjati sabah-namaz. Spomenite i nas u svojim dovama :)',
  },
  seri: {
    kanal: 'Odbrojavanje niza',
    kanalAciklama: 'Odbrojavanje do kraja dana u nizu',
    baslik: '🔥 Vaš niz je u opasnosti',
    govde: 'Današnji namazi nisu potpuni; ne izgubite svoj niz.',
    girdiBaslik: '🔥 Dan niza je završen',
    girdiGovde: 'Počeo je novi dan.',
  },
};
