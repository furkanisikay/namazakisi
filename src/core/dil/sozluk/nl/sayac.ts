import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Aftelling gebedstijd',
    kanalAciklama: 'Aftelmelding voordat een gebedstijd eindigt',
    baslik: '⏱️ {ad}-gebed',
    govde: 'De {ad}-tijd loopt bijna af!',
  },
  canli: {
    vakitGovde: 'Resterende tijd tot {ad} eindigt',
    cumaBaslik: "🕌 Djoemoe'a-gebed",
    cumaGovde: 'Resterende tijd tot Dhuhr (de khutba)',
    nafileGovde: 'Resterende tijd tot {ad} eindigt',
  },
  iftar: {
    kanal: 'Aftelling iftar',
    kanalAciklama: 'Aftelmelding tot de iftartijd',
    baslik: '🌙 Aftelling iftar',
    govde: 'Verbreek uw vasten niet voordat u de adhan hoort!',
    girdiBaslik: '🌙 Iftartijd',
    girdiGovde: 'Een gezegende iftar.',
    girdiUzun: 'Een gezegende iftar.\n\n⚠️ Verbreek uw vasten niet voordat u de adhan hoort! Vergeet ons niet in uw smeekbeden :)',
  },
  sahur: {
    kanal: 'Aftelling suhoor',
    kanalAciklama: 'Aftelmelding tot het einde van de suhoor (Fajr)',
    baslik: '🌙 Aftelling suhoor',
    govde: 'U kunt nog eten en drinken; het vasten begint zo!',
    girdiBaslik: '🌙 De suhoor is voorbij',
    girdiGovde: 'Het is tijd om uw intentie te maken.',
    girdiUzun: 'De tijd van Fajr is begonnen; vergeet niet uw intentie te maken!\n\n⚠️ U kunt nu Fajr bidden. Vergeet ons niet in uw smeekbeden :)',
  },
  seri: {
    kanal: 'Aftelling reeks',
    kanalAciklama: 'Aftelling tot het einde van de reeksdag',
    baslik: '🔥 Uw reeks loopt gevaar',
    govde: 'De gebeden van vandaag zijn niet compleet; verlies uw reeks niet.',
    girdiBaslik: '🔥 De reeksdag is voorbij',
    girdiGovde: 'Een nieuwe dag is begonnen.',
  },
};
