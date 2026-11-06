import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Nedräkning för bönetid',
    kanalAciklama: 'Nedräkningsavisering innan en bönetid slutar',
    baslik: '⏱️ {ad}-bönen',
    govde: 'Tiden för {ad} håller på att ta slut.',
  },
  canli: {
    vakitGovde: 'Tid kvar tills {ad} slutar',
    cumaBaslik: '🕌 Fredagsbön',
    cumaGovde: 'Tid kvar till Dhuhr (khutban)',
    nafileGovde: 'Tid kvar tills {ad} slutar',
  },
  iftar: {
    kanal: 'Nedräkning till iftar',
    kanalAciklama: 'Nedräkningsavisering till iftar',
    baslik: '🌙 Nedräkning till iftar',
    govde: 'Bryt inte fastan innan du hör böneutropet.',
    girdiBaslik: '🌙 Dags för iftar',
    girdiGovde: 'En välsignad iftar.',
    girdiUzun: 'En välsignad iftar.\n\n⚠️ Bryt inte fastan innan du hör böneutropet. Glöm inte oss i dina böner :)',
  },
  sahur: {
    kanal: 'Nedräkning för suhur',
    kanalAciklama: 'Nedräkningsavisering till slutet av suhur (Fajr)',
    baslik: '🌙 Nedräkning för suhur',
    govde: 'Du kan fortfarande äta och dricka; fastan börjar snart.',
    girdiBaslik: '🌙 Suhur är över',
    girdiGovde: 'Det är dags att göra avsikten (niyya).',
    girdiUzun: 'Fajr-tiden har börjat; glöm inte att göra din avsikt (niyya).\n\n⚠️ Nu kan du be Fajr. Glöm inte oss i dina böner :)',
  },
  seri: {
    kanal: 'Nedräkning för svit',
    kanalAciklama: 'Nedräkning till slutet av svitdagen',
    baslik: '🔥 Din svit är i fara',
    govde: 'Dagens böner är inte fullständiga; förlora inte din svit.',
    girdiBaslik: '🔥 Svitdagen är slut',
    girdiGovde: 'En ny dag har börjat.',
  },
};
