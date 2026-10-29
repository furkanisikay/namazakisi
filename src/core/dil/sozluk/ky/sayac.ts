// ÇEVİRİ: ky — İngilizce iskelet, çevrilince bu satır silinir
import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Prayer countdown',
    kanalAciklama: 'Countdown notification before a prayer time ends',
    baslik: '⏱️ {ad} prayer',
    govde: '{ad} time is about to end!',
  },
  canli: {
    vakitGovde: 'Time left until {ad} ends',
    cumaBaslik: "🕌 Jumu'ah prayer",
    cumaGovde: 'Time left until Dhuhr (the khutbah)',
    nafileGovde: 'Time left until {ad} ends',
  },
  iftar: {
    kanal: 'Iftar countdown',
    kanalAciklama: 'Countdown notification to iftar time',
    baslik: '🌙 Iftar countdown',
    govde: "Don't break your fast before you hear the adhan!",
    girdiBaslik: '🌙 Iftar time!',
    girdiGovde: 'Have a blessed iftar.',
    girdiUzun: "Have a blessed iftar.\n\n⚠️ Don't break your fast before you hear the adhan! Remember us in your prayers :)",
  },
  sahur: {
    kanal: 'Suhoor countdown',
    kanalAciklama: 'Countdown notification to the end of suhoor (Fajr)',
    baslik: '🌙 Suhoor countdown',
    govde: 'You can still eat and drink; the fast begins soon!',
    girdiBaslik: '🌙 Suhoor time is over!',
    girdiGovde: "It's time to make your intention.",
    girdiUzun: "Fajr time has begun; don't forget to make your intention!\n\n⚠️ You can now pray Fajr. Remember us in your prayers :)",
  },
  seri: {
    kanal: 'Streak countdown',
    kanalAciklama: 'Countdown to the end of the streak day',
    baslik: '🔥 Your streak is at risk',
    govde: "Today's prayers aren't complete; don't lose your streak.",
    girdiBaslik: '🔥 Streak day is over',
    girdiGovde: 'A new day has begun.',
  },
};
