import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Woonplaats, verblijfplaats en tijdelijk verblijf met betrekking tot reizen (in het Turks)',
    cem: "Mogen gebeden worden samengevoegd (jam')? (in het Turks)",
    baslangic: 'Wanneer begint het reizen? (in het Turks)',
    ziyaret: 'Is iemand die de woonplaats van zijn ouders bezoekt een reiziger? (in het Turks)',
  },
  bilgiNotu:
    'Dit is informatie, geen uitspraak. Of u als reiziger geldt, hangt af van het doel en de duur van uw reis en van uw intentie.',
  baslik: 'Het lijkt erop dat u op reis bent',
  mesafeSatiri: 'U bent hemelsbreed ongeveer {km} km van uw woonplaats. Wat Diyanet voor de {mezhep}-school weergeeft:',
  maddeler: {
    hanefi: [
      'In de Hanafi-school is de reisafstand (safar) ongeveer 90 km. Wie van plan is minder dan 15 dagen op de bestemming te blijven, geldt als reiziger.',
      "Een reiziger bidt de verplichte gebeden van vier rak'a als twee rak'a (qasr).",
      "In de Hanafi-school is het samenvoegen van twee gebeden (jam') alleen tijdens de hadj, in Arafat en Muzdalifa. Diyanet merkt ook op dat men bij een belangrijke reden zoals reizen de opvatting van de andere scholen mag volgen.",
    ],
    safii: [
      "Ook in de Shafi'i-school is de reisafstand ongeveer 90 km. Als het verblijf op de bestemming korter is dan 4 dagen, de dagen van aankomst en vertrek niet meegerekend, blijven de regels voor reizigers gelden.",
      "Een reiziger bidt de verplichte gebeden van vier rak'a als twee rak'a (qasr).",
      "In de Shafi'i-school geldt reizen als een geldige reden om Dhuhr met Asr en Maghrib met Isha samen te voegen (jam').",
    ],
  },
  ozetAcik: 'Aan · {mezhep}',
  ozetKapali: 'Uit',
  baglantiAcilamadi: 'De link kon niet worden geopend. Controleer uw internetverbinding.',
  ikametGuncellendi: 'Uw woonplaats is bijgewerkt',
  ikametKaydedilemedi: 'Uw woonplaats kon niet worden opgeslagen',
  kartiKapatin: 'De reiskaart sluiten',
  burasiEvimErisim: 'Dit is mijn thuis, als mijn woonplaats opslaan',
  burasiEvim: 'Dit is thuis',
  diyanetteOkuyunErisim: 'De fatwa van Diyanet in de browser lezen',
  diyanetteOkuyun: 'Lezen bij Diyanet',
  sayfa: {
    kayitliKonum: 'Opgeslagen locatie',
    henuzKaydedilmedi: 'Nog niet opgeslagen — uw eerste locatie geldt als woonplaats',
    buradasiniz: 'U bent nu hier',
    uzaktasiniz: 'U bent nu hemelsbreed ongeveer {km} km verwijderd',
    konumBilinmiyor: 'Uw locatie is nog niet bekend; kies eerst een locatie',
    giris:
      'Wanneer u ongeveer {km} km van uw woonplaats bent, ziet u op het startscherm een korte infokaart die de fatwa’s van Diyanet samenvat. De kaart verschijnt één keer per reis en stuurt geen meldingen.',
    bilgiKarti: 'Infokaart',
    kartBaslik: 'Infokaart voor reizen',
    gosterilir: 'Getoond op het startscherm',
    gosterilmez: 'Niet getoond',
    mezhepNotu: 'De inhoud van de kaart volgt uw rechtsschool; u kunt die kiezen bij Instellingen › Gebedstijden.',
    ikametYeri: 'Woonplaats',
    ikametYapErisim: 'Uw huidige locatie als woonplaats opslaan',
    ikametYap: 'Huidige locatie als woonplaats instellen',
    kaynaklar: 'Bronnen (Hoge Raad voor Religieuze Zaken van Diyanet)',
    kaynakErisim: '{etiket}. Opent in de browser',
    /** Türkiye'ye özgü hizmet: Türkçe dışında gösterilmez. */
    fetvaHatti: 'Voor vragen kunt u de fatwalijn 190 van Diyanet bellen.',
  },
};
