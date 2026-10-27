import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Compte à rebours de prière',
    kanalAciklama: 'Notification de compte à rebours avant la fin d’une heure de prière',
    baslik: '⏱️ Prière · {ad}',
    govde: '{ad} va bientôt se terminer.',
  },
  canli: {
    vakitGovde: 'Temps restant pour {ad}',
    cumaBaslik: '🕌 Prière de Joumoua',
    cumaGovde: 'Temps restant avant Dhuhr (le prêche)',
    nafileGovde: 'Temps restant pour {ad}',
  },
  iftar: {
    kanal: 'Compte à rebours de l’iftar',
    kanalAciklama: 'Notification de compte à rebours jusqu’à l’iftar',
    baslik: '🌙 Compte à rebours de l’iftar',
    govde: 'Ne rompez pas votre jeûne avant d’entendre l’adhan.',
    girdiBaslik: '🌙 C’est l’heure de l’iftar',
    girdiGovde: 'Bon iftar.',
    girdiUzun: 'Bon iftar.\n\n⚠️ Ne rompez pas votre jeûne avant d’entendre l’adhan. N’oubliez pas de nous inclure dans vos invocations :)',
  },
  sahur: {
    kanal: 'Compte à rebours du souhour',
    kanalAciklama: 'Notification de compte à rebours jusqu’à la fin du souhour (Imsak)',
    baslik: '🌙 Compte à rebours du souhour',
    govde: 'Vous pouvez encore manger et boire ; l’Imsak approche.',
    girdiBaslik: '🌙 Le souhour est terminé',
    girdiGovde: 'C’est le moment de formuler votre intention.',
    girdiUzun: 'L’heure de l’Imsak est arrivée ; n’oubliez pas de formuler votre intention.\n\n⚠️ Vous pouvez prier Fajr. N’oubliez pas de nous inclure dans vos invocations :)',
  },
  seri: {
    kanal: 'Compte à rebours de la série',
    kanalAciklama: 'Compte à rebours jusqu’à la fin du jour de série',
    baslik: '🔥 Votre série est menacée',
    govde: 'Les prières d’aujourd’hui sont incomplètes ; ne perdez pas votre série.',
    girdiBaslik: '🔥 Le jour de série est terminé',
    girdiGovde: 'Une nouvelle journée a commencé.',
  },
};
