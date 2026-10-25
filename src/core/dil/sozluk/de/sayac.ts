import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Gebets-Countdown',
    kanalAciklama: 'Countdown-Benachrichtigung, bevor eine Gebetszeit endet',
    baslik: '⏱️ {ad}',
    govde: 'Die Zeit für {ad} endet gleich.',
  },
  canli: {
    vakitGovde: 'Verbleibende Zeit bis zum Ende von {ad}',
    cumaBaslik: '🕌 Freitagsgebet',
    cumaGovde: 'Verbleibende Zeit bis Dhuhr (Freitagspredigt)',
    nafileGovde: 'Verbleibende Zeit bis zum Ende von {ad}',
  },
  iftar: {
    kanal: 'Iftar-Countdown',
    kanalAciklama: 'Countdown-Benachrichtigung bis zur Iftar-Zeit',
    baslik: '🌙 Iftar-Countdown',
    govde: 'Brechen Sie Ihr Fasten nicht, bevor Sie den Adhan hören.',
    girdiBaslik: '🌙 Iftar-Zeit',
    girdiGovde: 'Ein gesegnetes Iftar.',
    girdiUzun: 'Ein gesegnetes Iftar.\n\n⚠️ Brechen Sie Ihr Fasten nicht, bevor Sie den Adhan hören. Denken Sie in Ihren Bittgebeten auch an uns :)',
  },
  sahur: {
    kanal: 'Suhur-Countdown',
    kanalAciklama: 'Countdown-Benachrichtigung bis Imsak (Ende des Suhur)',
    baslik: '🌙 Suhur-Countdown',
    govde: 'Sie können noch essen und trinken, Imsak rückt näher.',
    girdiBaslik: '🌙 Suhur-Zeit ist vorbei',
    girdiGovde: 'Es ist Zeit, die Absicht zu fassen.',
    girdiUzun: 'Imsak hat begonnen; vergessen Sie nicht, die Absicht zu fassen.\n\n⚠️ Sie können nun das Fajr-Gebet verrichten. Denken Sie in Ihren Bittgebeten auch an uns :)',
  },
  seri: {
    kanal: 'Serien-Countdown',
    kanalAciklama: 'Countdown bis zum Ende des Serientages',
    baslik: '🔥 Ihre Serie ist in Gefahr',
    govde: 'Ihre heutigen Gebete sind unvollständig; verlieren Sie Ihre Serie nicht.',
    girdiBaslik: '🔥 Serientag vorbei',
    girdiGovde: 'Ein neuer Tag hat begonnen.',
  },
};
