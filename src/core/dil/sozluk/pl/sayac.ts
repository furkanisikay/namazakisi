import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'Odliczanie modlitwy',
    kanalAciklama: 'Powiadomienie z odliczaniem przed końcem czasu modlitwy',
    baslik: '⏱️ Modlitwa {ad}',
    govde: 'Czas modlitwy {ad} zaraz się skończy.',
  },
  canli: {
    vakitGovde: 'Pozostało do końca czasu {ad}',
    cumaBaslik: '🕌 Modlitwa piątkowa',
    cumaGovde: 'Pozostało do Zuhr (chutby)',
    nafileGovde: 'Pozostało do końca czasu {ad}',
  },
  iftar: {
    kanal: 'Odliczanie do iftaru',
    kanalAciklama: 'Powiadomienie z odliczaniem do czasu iftaru',
    baslik: '🌙 Odliczanie do iftaru',
    govde: 'Nie przerywaj postu, zanim usłyszysz adhan.',
    girdiBaslik: '🌙 Czas iftaru',
    girdiGovde: 'Błogosławionego iftaru.',
    girdiUzun: 'Błogosławionego iftaru.\n\n⚠️ Nie przerywaj postu, zanim usłyszysz adhan. Pamiętaj o nas w swoich modlitwach :)',
  },
  sahur: {
    kanal: 'Odliczanie suhur',
    kanalAciklama: 'Powiadomienie z odliczaniem do końca suhur (Fadżr)',
    baslik: '🌙 Odliczanie suhur',
    govde: 'Możesz jeszcze jeść i pić; post wkrótce się zacznie.',
    girdiBaslik: '🌙 Czas suhur minął',
    girdiGovde: 'Czas na intencję postu.',
    girdiUzun: 'Nadszedł czas Fadżr; nie zapomnij o intencji postu.\n\n⚠️ Możesz już odprawić modlitwę Fadżr. Pamiętaj o nas w swoich modlitwach :)',
  },
  seri: {
    kanal: 'Odliczanie serii',
    kanalAciklama: 'Odliczanie do końca dnia serii',
    baslik: '🔥 Seria jest zagrożona',
    govde: 'Dzisiejsze modlitwy nie są pełne; nie trać serii.',
    girdiBaslik: '🔥 Dzień serii dobiegł końca',
    girdiGovde: 'Zaczął się nowy dzień.',
  },
};
