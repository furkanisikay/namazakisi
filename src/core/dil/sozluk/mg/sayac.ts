import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: "Fanisana mihemotra ho an'ny soalat",
    kanalAciklama: "Fampandrenesana fanisana mihemotra alohan'ny hifaranan'ny fotoanan'ny soalat",
    baslik: '⏱️ Soalat {ad}',
    govde: "Efa ho tapitra ny fotoanan'ny {ad}.",
  },
  canli: {
    vakitGovde: "Fotoana sisa mandra-pifaranan'ny {ad}",
    cumaBaslik: '🕌 Soalat Zoma',
    cumaGovde: "Fotoana sisa mankany amin'ny Zohr (ny khotba)",
    nafileGovde: "Fotoana sisa mandra-pifaranan'ny {ad}",
  },
  iftar: {
    kanal: "Fanisana mihemotra ho an'ny iftar",
    kanalAciklama: "Fampandrenesana fanisana mihemotra mankany amin'ny fotoanan'ny iftar",
    baslik: "🌙 Fanisana mihemotra ho an'ny iftar",
    govde: 'Aza mamarana ny fifadian-kanina raha tsy efa nandre ny Azan.',
    girdiBaslik: "🌙 Fotoanan'ny iftar",
    girdiGovde: 'Iftar feno fitahiana anie.',
    girdiUzun:
      "Iftar feno fitahiana anie.\n\n⚠️ Aza mamarana ny fifadian-kanina raha tsy efa nandre ny Azan. Tsarovy izahay ao amin'ny vavakao :)",
  },
  sahur: {
    kanal: "Fanisana mihemotra ho an'ny Sohor",
    kanalAciklama: "Fampandrenesana fanisana mihemotra mankany amin'ny fiafaran'ny Sohor (Fajr)",
    baslik: "🌙 Fanisana mihemotra ho an'ny Sohor",
    govde: 'Mbola afaka mihinana sy misotro ianao; manomboka tsy ho ela ny fifadian-kanina.',
    girdiBaslik: "🌙 Tapitra ny fotoanan'ny Sohor",
    girdiGovde: 'Fotoana hanaovanao ny fikasana izao.',
    girdiUzun:
      "Tonga ny fotoanan'ny Fajr; aza adino ny manao ny fikasana.\n\n⚠️ Afaka manao ny soalat Fajr ianao izao. Tsarovy izahay ao amin'ny vavakao :)",
  },
  seri: {
    kanal: "Fanisana mihemotra ho an'ny tohy",
    kanalAciklama: "Fanisana mihemotra mankany amin'ny fiafaran'ny andron'ny tohy",
    baslik: '🔥 Atahorana ny tohinao',
    govde: 'Mbola tsy feno ny soalat androany; aza avela ho tapaka ny tohinao.',
    girdiBaslik: "🔥 Tapitra ny andron'ny tohy",
    girdiGovde: 'Nanomboka ny andro vaovao.',
  },
};
