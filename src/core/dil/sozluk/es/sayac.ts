import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Cuenta atrás del rezo',
    kanalAciklama: 'Notificación de cuenta atrás antes de que termine una hora de rezo',
    baslik: '⏱️ Rezo · {ad}',
    govde: '{ad} está a punto de terminar.',
  },
  canli: {
    vakitGovde: 'Tiempo restante de {ad}',
    cumaBaslik: '🕌 Rezo de Yumu’a',
    cumaGovde: 'Tiempo restante hasta Dhuhr (el sermón)',
    nafileGovde: 'Tiempo restante de {ad}',
  },
  iftar: {
    kanal: 'Cuenta atrás del iftar',
    kanalAciklama: 'Notificación de cuenta atrás hasta el iftar',
    baslik: '🌙 Cuenta atrás del iftar',
    govde: 'No rompa su ayuno antes de oír el adhan.',
    girdiBaslik: '🌙 Es la hora del iftar',
    girdiGovde: 'Bendito iftar.',
    girdiUzun: 'Bendito iftar.\n\n⚠️ No rompa su ayuno antes de oír el adhan. No olvide incluirnos en sus súplicas :)',
  },
  sahur: {
    kanal: 'Cuenta atrás del suhur',
    kanalAciklama: 'Notificación de cuenta atrás hasta el final del suhur (Imsak)',
    baslik: '🌙 Cuenta atrás del suhur',
    govde: 'Aún puede comer y beber; se acerca el Imsak.',
    girdiBaslik: '🌙 El suhur ha terminado',
    girdiGovde: 'Es el momento de formular su intención.',
    girdiUzun: 'Ha llegado la hora del Imsak; no olvide formular su intención.\n\n⚠️ Ya puede rezar Fajr. No olvide incluirnos en sus súplicas :)',
  },
  seri: {
    kanal: 'Cuenta atrás de la racha',
    kanalAciklama: 'Cuenta atrás hasta el final del día de racha',
    baslik: '🔥 Su racha está en peligro',
    govde: 'Los rezos de hoy están incompletos; no pierda su racha.',
    girdiBaslik: '🔥 El día de racha ha terminado',
    girdiGovde: 'Ha comenzado un nuevo día.',
  },
};
