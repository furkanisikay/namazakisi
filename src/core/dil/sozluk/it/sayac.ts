import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Conto alla rovescia',
    kanalAciklama: 'Notifica con conto alla rovescia prima della fine di un orario di preghiera',
    baslik: '⏱️ Preghiera di {ad}',
    govde: 'Il tempo di {ad} sta per finire.',
  },
  canli: {
    vakitGovde: 'Tempo rimasto alla fine di {ad}',
    cumaBaslik: '🕌 Preghiera del venerdì',
    cumaGovde: 'Tempo rimasto allo Zuhr (al sermone)',
    nafileGovde: 'Tempo rimasto alla fine di {ad}',
  },
  iftar: {
    kanal: 'Conto alla rovescia iftar',
    kanalAciklama: 'Notifica con conto alla rovescia all’iftar',
    baslik: '🌙 Conto alla rovescia iftar',
    govde: 'Non rompa il digiuno prima di aver sentito l’adhan.',
    girdiBaslik: '🌙 È l’ora dell’iftar',
    girdiGovde: 'Iftar benedetto.',
    girdiUzun: 'Iftar benedetto.\n\n⚠️ Non rompa il digiuno prima di aver sentito l’adhan. Si ricordi di noi nelle sue preghiere :)',
  },
  sahur: {
    kanal: 'Conto alla rovescia suhur',
    kanalAciklama: 'Notifica con conto alla rovescia alla fine del suhur (Fajr)',
    baslik: '🌙 Conto alla rovescia suhur',
    govde: 'Può ancora mangiare e bere; il digiuno inizia presto.',
    girdiBaslik: '🌙 Il suhur è finito',
    girdiGovde: 'È il momento di formulare l’intenzione.',
    girdiUzun: 'È iniziato il Fajr; non dimentichi di formulare l’intenzione.\n\n⚠️ Ora può compiere la preghiera del Fajr. Si ricordi di noi nelle sue preghiere :)',
  },
  seri: {
    kanal: 'Conto alla rovescia serie',
    kanalAciklama: 'Conto alla rovescia alla fine del giorno della serie',
    baslik: '🔥 La sua serie è a rischio',
    govde: 'Le preghiere di oggi non sono complete; non perda la serie.',
    girdiBaslik: '🔥 Il giorno della serie è finito',
    girdiGovde: 'È iniziato un nuovo giorno.',
  },
};
