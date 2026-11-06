import type { Sozluk } from '../tr';

/** Kanal adları "Odbrojavanje …" ile başlar (bileklik rehberi buna dayanır); "!" yok. */
export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Odbrojavanje namaza',
    kanalAciklama: 'Obavijest s odbrojavanjem prije isteka vremena namaza',
    baslik: '⏱️ Namaz: {ad}',
    govde: 'Vrijeme namaza ({ad}) uskoro istječe.',
  },
  canli: {
    vakitGovde: 'Preostalo vrijeme do isteka: {ad}',
    cumaBaslik: '🕌 Džuma-namaz',
    cumaGovde: 'Preostalo vrijeme do podne-namaza (hutbe)',
    nafileGovde: 'Preostalo vrijeme do isteka: {ad}',
  },
  iftar: {
    kanal: 'Odbrojavanje do iftara',
    kanalAciklama: 'Obavijest s odbrojavanjem do vremena iftara',
    baslik: '🌙 Odbrojavanje do iftara',
    govde: 'Ne prekidajte post prije nego što čujete ezan.',
    girdiBaslik: '🌙 Vrijeme je iftara',
    girdiGovde: 'Hajirli iftar.',
    girdiUzun: 'Hajirli iftar.\n\n⚠️ Ne prekidajte post prije nego što čujete ezan. Spomenite nas u svojim dovama :)',
  },
  sahur: {
    kanal: 'Odbrojavanje do sehura',
    kanalAciklama: 'Obavijest s odbrojavanjem do kraja sehura (sabaha)',
    baslik: '🌙 Odbrojavanje do sehura',
    govde: 'Još možete jesti i piti; post uskoro počinje.',
    girdiBaslik: '🌙 Vrijeme sehura je završilo',
    girdiGovde: 'Vrijeme je za nijet.',
    girdiUzun: 'Nastupilo je vrijeme sabaha; ne zaboravite zanijetiti post.\n\n⚠️ Sada možete klanjati sabah. Spomenite nas u svojim dovama :)',
  },
  seri: {
    kanal: 'Odbrojavanje niza',
    kanalAciklama: 'Odbrojavanje do kraja dana niza',
    baslik: '🔥 Vaš je niz u opasnosti',
    govde: 'Današnji namazi nisu potpuni; ne izgubite svoj niz.',
    girdiBaslik: '🔥 Dan niza je završio',
    girdiGovde: 'Počeo je novi dan.',
  },
};
