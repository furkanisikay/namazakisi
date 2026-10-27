import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Taal · Language',
  aciklama: 'Kies de taal van de app. Meldingen en voorlezen gebruiken deze taal ook.',
  grup: 'Taal van de app',
  dilAdlari: { tr: 'Turks', en: 'Engels', id: 'Indonesisch', de: 'Duits', fr: 'Frans', bs: 'Bosnisch', ru: 'Russisch', ms: 'Maleis', ar: 'Arabisch', ur: 'Urdu', es: 'Spaans', nl: 'Nederlands', sq: 'Albanees', hi: 'Hindi', bn: 'Bengaals' },
  cihazDili: 'Taal van het apparaat',
  cihazDiliKullaniliyor: 'Nu {ad}',
  cihazDiliDesteklenmiyor: 'De taal van uw apparaat is nog niet beschikbaar; Turks wordt gebruikt.',
  beta: 'Bèta',
  betaAciklama: '{ad} · Bèta',
  notlar: {
    beta: 'Bètavertalingen worden nagekeken; sommige teksten kunnen onvolmaakt zijn.',
    vakit: 'De taal verandert niets aan de berekening van de gebedstijden.',
    nass: 'In andere talen dan het Turks worden alleen Koranvertalingen getoond; hadithteksten komen uit een Turkse bron en worden daarom niet getoond.',
  },
  ozelAnons: {
    baslik: 'Voorleesteksten die u zelf hebt geschreven',
    govde: cogul({
      one: '{n} voorleestekst die u zelf hebt geschreven, staat nog in de vorige taal. Vervangen door de kant-en-klare tekst in de nieuwe taal?',
      other: '{n} voorleesteksten die u zelf hebt geschreven, staan nog in de vorige taal. Vervangen door de kant-en-klare teksten in de nieuwe taal?',
    }),
    degistir: 'Vervangen door kant-en-klare tekst',
    koru: 'Laten zoals het is',
    degisti: cogul({ one: '{n} tekst vervangen.', other: '{n} teksten vervangen.' }),
  },
  vakitAdlari: {
    baslik: 'Namen van de gebeden',
    aciklama: 'Kies met welke namen de gebedstijden worden geschreven.',
    otomatik: 'Volgens uw land',
    otomatikAciklama: 'De namen die in het land van uw locatie gangbaar zijn, worden gebruikt.',
    takimlar: { temel: 'Arabische namen', diyanetDe: 'Diyanet (Duits)', turkce: 'Turkse namen', magrip: 'Maghrebijnse spelling', cezayir: 'Algerijnse spelling' },
  },
  kaydedilemedi: 'De taal kon niet worden opgeslagen. Probeer het opnieuw.',
  sihirbazBaglantisi: 'Taal · Language',
  sihirbazBaglantisiAciklama: 'De taal van de app wijzigen',
};
