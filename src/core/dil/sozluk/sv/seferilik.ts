import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: "Shafi'i" },
  kaynaklar: {
    vatan: 'Hem, bostad och tillfällig vistelse i fråga om resa (på turkiska)',
    cem: "Får böner slås samman (jam')? (på turkiska)",
    baslangic: 'När börjar resan? (på turkiska)',
    ziyaret: 'Räknas den som besöker sina föräldrars ort som resenär? (på turkiska)',
  },
  bilgiNotu:
    'Det här är information, inte ett avgörande. Om du räknas som resenär beror på resans syfte och längd och på din avsikt.',
  baslik: 'Det ser ut som att du är på resa',
  mesafeSatiri: 'Du är cirka {km} km fågelvägen från din bostadsort. Vad Diyanet förmedlar för {mezhep}-skolan:',
  maddeler: {
    hanefi: [
      'Inom Hanafi-skolan är resavståndet (safar) cirka 90 km. Den som avser att stanna kortare än 15 dagar på resmålet räknas som resenär.',
      'En resenär ber de obligatoriska bönerna med fyra rakat som två rakat (qasr).',
      "Inom Hanafi-skolan sker sammanslagning av två böner (jam') bara under hajj, vid Arafat och Muzdalifa. Diyanet påpekar också att man vid allvarliga skäl som resa kan följa de andra skolornas uppfattning.",
    ],
    safii: [
      "Även inom Shafi'i-skolan är resavståndet cirka 90 km. Om vistelsen på resmålet är kortare än 4 dagar, ankomst- och avresedagarna oräknade, fortsätter reglerna för resa att gälla.",
      'En resenär ber de obligatoriska bönerna med fyra rakat som två rakat (qasr).',
      "Inom Shafi'i-skolan är resa ett giltigt skäl att slå samman (jam') Dhuhr med Asr och Maghrib med Isha.",
    ],
  },
  ozetAcik: 'På · {mezhep}',
  ozetKapali: 'Av',
  baglantiAcilamadi: 'Länken kunde inte öppnas. Kontrollera din internetanslutning.',
  ikametGuncellendi: 'Din bostadsort har uppdaterats',
  ikametKaydedilemedi: 'Din bostadsort kunde inte sparas',
  kartiKapatin: 'Stäng resekortet',
  burasiEvimErisim: 'Här bor jag, spara det som min bostadsort',
  burasiEvim: 'Här bor jag',
  diyanetteOkuyunErisim: 'Läs Diyanets fatwa i webbläsaren',
  diyanetteOkuyun: 'Läs hos Diyanet',
  sayfa: {
    kayitliKonum: 'Sparad plats',
    henuzKaydedilmedi: 'Inte sparad än – din första plats räknas som din bostadsort',
    buradasiniz: 'Du är här nu',
    uzaktasiniz: 'Du är nu cirka {km} km bort fågelvägen',
    konumBilinmiyor: 'Din plats är inte känd än; välj en plats först',
    giris:
      'När du är cirka {km} km från din bostadsort visas ett kort informationskort på startskärmen som sammanfattar Diyanets fatwor. Kortet visas en gång per resa och skickar inga aviseringar.',
    bilgiKarti: 'Informationskort',
    kartBaslik: 'Reseinformationskort',
    gosterilir: 'Visas på startskärmen',
    gosterilmez: 'Visas inte',
    mezhepNotu: 'Kortet följer din rättsskola; du kan välja den i Inställningar › Bönetider.',
    ikametYeri: 'Bostadsort',
    ikametYapErisim: 'Spara din nuvarande plats som din bostadsort',
    ikametYap: 'Gör min plats till bostadsort',
    kaynaklar: 'Källor (Diyanets högsta råd för religiösa frågor)',
    kaynakErisim: '{etiket}. Öppnas i webbläsaren',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'För frågor kan du ringa Diyanets fatwalinje 190.',
  },
};
