import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'U staat in de richting van de qibla',
    arkada: 'De qibla is achter u, draai u om',
    sagda: 'De qibla is {derece}° rechts van u',
    solda: 'De qibla is {derece}° links van u',
  },
  harf: { kuzey: 'N', dogu: 'O', guney: 'Z', bati: 'W' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Kompasmodus',
    pusulaAciklama: 'Wanneer het Kaaba-teken bij het streepje bovenaan staat, staat u in de richting van de qibla.',
    kamera: 'Camera',
    kameraErisim: 'Cameramodus',
    kameraAciklama: 'Houd de telefoon rechtop; het Kaaba-teken verschijnt in de richting van de qibla.',
  },
  sayfa: {
    baslatiliyor: 'Kompas wordt gestart…',
    izinKapali: 'Locatietoestemming staat uit; uw locatie is nodig om de richting te vinden.',
  },
  hata: {
    izinGerekli: 'Locatietoestemming is nodig om de richting van de qibla te vinden.',
    konumServisi: 'Locatievoorzieningen zijn niet bereikbaar. Controleer de locatie-instellingen van uw apparaat.',
    baslatilamadi: 'De qibla-dienst kon niet worden gestart.',
  },
  pusula: {
    ufuk: 'horizon',
    konumAliniyor: 'Uw locatie wordt opgehaald…',
    hazirlaniyor: 'Kompas wordt voorbereid…',
    kuzeydenAci: 'Qibla {derece}° vanaf het noorden',
    kabeUzakta: 'Kaaba op {mesafe} afstand',
    kuzeydenSaatYonu: 'Met de klok mee vanaf het noorden',
    kuzeyden: '{derece}° vanaf het noorden',
    kabeUzaktaKuzeyden: 'Kaaba op {mesafe} afstand, {derece}° vanaf het noorden',
    pusulaErisim: 'Qibla-kompas. {cumle}',
    pusulaYok: 'Dit apparaat heeft geen kompas; we tonen de richting ten opzichte van het noorden.',
    kayiyorsa: 'Verschuift de richting, beweeg uw telefoon dan in de lucht alsof u een 8 tekent.',
    kamerayla: 'Bekijken met de camera',
  },
  kamera: {
    pusulayiKullanin: 'Het kompas gebruiken',
    kullanilamiyorBaslik: 'Cameraweergave is op deze telefoon niet beschikbaar',
    kullanilamiyorMetin:
      'De sensoren van uw telefoon geven rechtop geen betrouwbare richting. Het kompas blijft de richting correct tonen.',
    izinBaslik: 'Bekijk de qibla met de camera',
    izinMetin:
      'Houd uw telefoon rechtop en kijk om u heen; het Kaaba-teken verschijnt in de richting van de qibla. Hiervoor is cameratoestemming nodig; het beeld wordt niet opgenomen en verlaat uw telefoon niet.',
    kamerayiAcin: 'Camera aanzetten',
    izinKapaliBaslik: 'Cameratoestemming staat uit',
    izinKapaliMetin: 'Voor de cameraweergave kunt u cameratoegang toestaan in Instellingen. Het kompas werkt ook zonder.',
    ayarlariAcin: 'Instellingen openen',
    acilamadiBaslik: 'De camera kon niet worden geopend',
    acilamadiMetin: 'De camera is nu niet beschikbaar. U kunt de qibla vinden met het kompas.',
    hesaplaniyor: 'Richting wordt bepaald…',
    dikTutun: 'Houd uw telefoon rechtop',
  },
  kalibrasyon: {
    tesekkurErisim: 'Bedankt, de richting is nu nauwkeuriger',
    tesekkur: 'Bedankt, de richting is nu nauwkeuriger ✓',
    baslik: 'Kalibreer het kompas',
    sallayin: 'Beweeg uw telefoon in de lucht alsof u een 8 tekent.',
    metal: 'Ga weg van metalen voorwerpen en magnetische hoesjes.',
    dogruluk: 'Nauwkeurigheid',
    simdiDegil: 'Niet nu',
  },
};
