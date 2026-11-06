import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadete çağrı kaydı: zamirsiz kısa emir; "neerknielen" yok. Sıra Türkçe şablonlarla BİREBİR
 * eşleşir. Dakika tek biçimle ("{süre} minuten") yazılır; `dakikaUyumu` 1'de "minuut"a çeker.
 */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'over', girisindenItibaren: 'voorbij' },
  cip: { vakit: 'Naam van het gebed', sure: 'Minuten', yon: 'over / voorbij', cuma: "Djoemoe'a", yatsi: 'Isha' },
  sablon: {
    muhafizCikis: [
      'De tijd van {vakit} loopt af, nog {süre} minuten.',
      'Mis {vakit} niet, nog {süre} minuten.',
      'De tijd wordt krap, nog {süre} minuten tot {vakit} eindigt.',
    ],
    muhafizGiris: [
      'De tijd van {vakit} is begonnen, {süre} minuten geleden.',
      'Stel {vakit} niet uit, er zijn {süre} minuten verstreken.',
      'De tijd verstrijkt, sta op voor {vakit}, het is {süre} minuten geleden.',
    ],
    nafile: [
      'Tijd van {vakit}, {süre} minuten {yön}. Een goed moment voor twee rak\'a.',
      'Het is nog tijd voor {vakit}. Een goede kans om twee rak\'a te bidden.',
      '{süre} minuten {yön} voor {vakit}.',
    ],
    cuma: [
      "Nog {süre} minuten tot het Djoemoe'a-gebed. Maak u klaar en ga naar de moskee.",
      "Djoemoe'a komt dichterbij, nog {süre} minuten.",
      "Wees op tijd voor de khutba, nog {süre} minuten tot Djoemoe'a.",
    ],
    camiyeGit: [
      'Nog {süre} minuten tot {vakit}. Ga naar de moskee.',
      'Tijd om naar de moskee te gaan, nog {süre} minuten tot {vakit}.',
      'Ga naar de moskee voor {vakit}.',
    ],
    yatis: ['Bid Isha voordat u naar bed gaat.', 'De tijd van Isha loopt nog, sta op voor het gebed voordat u gaat slapen.', 'Ga niet slapen voordat u Isha hebt gebeden.'],
    takvim: [
      'Een afspraak in uw agenda valt in de tijd van {vakit}.',
      'De tijd van {vakit} valt samen met een afspraak; vergeet niet eerst te bidden.',
      'Over {süre} minuten valt de tijd van {vakit} samen met uw afspraak; vergeet uw gebed niet.',
    ],
  },
  otomatik: {
    cuma: "Nog {sure} tot Dhuhr voor Djoemoe'a. Maak u klaar en ga naar de moskee.",
    camiyeGiris: 'Nog {sure} tot {vakit}.',
    camiyeHazirlan: 'Maak u klaar en ga naar de moskee.',
    camiyeYola: 'Ga naar de moskee.',
    takvimGiris: 'Een afspraak in uw agenda valt in de tijd van {vakit}.',
    takvimOnce: 'Vergeet niet te bidden vóór de afspraak.',
    takvimKaplar: 'Vergeet niet even pauze te nemen en te bidden.',
    yatsi: 'Bid Isha voordat u naar bed gaat.',
    muhasebeTek: '{vakit} lijkt vandaag niet gemarkeerd.',
    muhasebeCoklu: cogul({ one: '{n} gebed lijkt vandaag niet gemarkeerd.', other: '{n} gebeden lijken vandaag niet gemarkeerd.' }),
    geceCapasi: 'De nachtrust begint over {süre} minuten. Bid {vakit} voordat u naar bed gaat.',
    kuslukSuruyor: 'Het is nog Duha-tijd.',
    kuslukGirdi: "De Duha-tijd is begonnen. Een goed moment voor twee rak'a.",
    kuslukBitiyor: cogul({ one: 'Nog {n} minuut tot het einde van de Duha-tijd.', other: 'Nog {n} minuten tot het einde van de Duha-tijd.' }),
    evvabinSuruyor: 'Er is nog tijd voor Awwabin.',
    evvabinGirdi: "Tijd voor Awwabin. Een goed moment voor twee rak'a.",
    evvabinKalan: cogul({ one: 'Nog {n} minuut voor Awwabin.', other: 'Nog {n} minuten voor Awwabin.' }),
    teheccudSonUcte: 'Tahajjud-tijd. Het laatste derde van de nacht is begonnen.',
    teheccudKalan: cogul({ one: 'Tahajjud-tijd. Nog {n} minuut tot Fajr.', other: 'Tahajjud-tijd. Nog {n} minuten tot Fajr.' }),
  },
};
