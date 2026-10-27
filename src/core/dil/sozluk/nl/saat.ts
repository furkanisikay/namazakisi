import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Op de telefoon',
    telefonAciklama: 'Het Fajr-alarm en de Tahajjud-wekker gaan af op uw telefoon.',
    saatBaslik: 'Op het horloge, stil',
    saatAciklama:
      'Alleen uw pols trilt, zodat wie naast u slaapt niet wakker wordt. Als u het niet op het horloge uitzet, gaat uw telefoon {dk} minuten later af als reserve. Als Namaz Akışı niet op uw horloge staat of niet is bijgewerkt, gaat uw telefoon elke ochtend {dk} minuten later af.',
    saatAciklamaIos:
      'Alleen uw pols trilt, zodat wie naast u slaapt niet wakker wordt. Als u het niet op het horloge uitzet, gaat uw iPhone {dk} minuten later af als reserve.',
    ikisiBaslik: 'Op beide',
    ikisiAciklama: 'Horloge en telefoon gaan tegelijk af; als u het op het horloge uitzet, zwijgt ook de telefoon.',
    ikisiAciklamaIos: 'Horloge en iPhone gaan tegelijk af; als u het op het horloge uitzet, zwijgt ook de iPhone.',
  },
  anons: {
    otomatikBaslik: 'Op de telefoon, op het horloge als die ver weg is',
    otomatikAciklama:
      'Als uw telefoon bij u is, leest uw telefoon voor en zwijgt uw horloge bewust (zodat niet beide apparaten dezelfde zin voorlezen). Als uw telefoon ver weg is, leest uw horloge voor.',
    saatBaslik: 'Alleen op het horloge',
    saatAciklama:
      'Uw horloge leest altijd voor en uw telefoon zwijgt. Als uw horloge oplaadt, geen verbinding met uw telefoon heeft of Namaz Akışı er niet op staat, wordt er helemaal niets voorgelezen; wilt u dat niet, kies dan de eerste optie.',
    telefonBaslik: 'Alleen op de telefoon',
    telefonAciklama: 'Uw horloge spreekt nooit.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Als Namaz Akışı op uw Apple Watch staat, verdeelt het de taken met uw iPhone. Hier kiest u waar de wekker afgaat.',
    giris:
      'Als Namaz Akışı op uw horloge staat, verdeelt het de taken met uw telefoon. Hier kiest u waar de wekker afgaat en waar wordt voorgelezen.',
    uyandirmaBaslik: 'Waar moet de wekker afgaan?',
    uyandirmaNotu:
      'De wekker is het echte alarm dat u voor Fajr aanzet in de herinnering "Voordat de tijd afloopt" en de Tahajjud-wekker die u aanzet bij Vrijwillige gebeden.',
    uyandirmaNotuIos:
      'watchOS kan een stil alarm alleen instellen terwijl de horloge-app open is: open Namaz Akışı één keer per dag op uw horloge, dan wordt de volgende wekker op dat moment ingesteld. Als het horloge oplaadt of de app niet werd geopend, gaat de reserve op uw iPhone af.',
    uyandirmaNotuAndroid: 'Uw horloge gaat niet af tijdens het opladen; dan gaat uw telefoon af.',
    muhafizAyarlari: 'Instellingen van "Voordat de tijd afloopt" openen',
    nafileAyarlari: 'Instellingen van vrijwillige gebeden openen',
    bilektenBaslik: 'Wat u vanaf uw pols kunt doen',
    bilektenIos: [
      'Als uw iPhone ver weg is, gaan herinneringen af op uw horloge; ze gaan niet op beide af.',
      'U markeert het gebed dat u hebt verricht vanaf uw pols; uw iPhone slaat het op.',
      'U telt de tasbih met de Digital Crown en vindt de qibla op uw horloge.',
    ],
    anonsBaslik: 'Waar moet worden voorgelezen?',
    anonsNotu:
      'Alleen herinneringen waarbij voorlezen aanstaat, worden voorgelezen. De twee apparaten lezen niet samen dezelfde zin voor. In de moskee of als de gebedsmodus aanstaat, zwijgt ook uw horloge. Als uw horloge geen luidspreker, geen voorleesfunctie of geen stem in de taal van de app heeft, trilt het alleen. U kunt het geluid van het horloge meteen testen met "Geluid testen" in de horloge-app van Namaz Akışı.',
    bilekten: [
      'U kunt de gebedsmodus met de knop op het horloge aan- en uitzetten (tot het einde van de gebedstijd, hooguit 30 minuten).',
      'In de moskee toont uw horloge de status; u beantwoordt "Dit is geen moskee" en "Bent u in de moskee?" vanaf uw pols.',
      'Schermen die niet op het horloge passen (Inhaallogboek, In de moskee, instellingen) opent u op uw telefoon met "Openen op telefoon".',
    ],
    namazModuNotu: 'Om de gebedsmodus vanaf het horloge aan te zetten, moet u hem eerst één keer op uw telefoon aanzetten.',
    namazModuAyarlari: 'Instellingen van de gebedsmodus openen',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Waar de wekker afgaat',
    saatOzet: 'Waar de wekker afgaat en wordt voorgelezen',
    canliEtkinlikler: 'Live-activiteiten',
    canliSayaclar: 'Live-aftellingen',
    geriSayim: 'Aftelling',
    gelismisErisim: 'Geavanceerd. Automatiseringen en apps die gebeden mogen markeren',
    gelismis: 'Geavanceerd',
    otomasyonlar: 'Automatiseringen',
    otomasyonBaslik: 'Gebruiken met automatiseringen',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Apps die gebeden mogen markeren',
    kildimOzet: 'Apps die u hebt toegestaan',
  },
};
