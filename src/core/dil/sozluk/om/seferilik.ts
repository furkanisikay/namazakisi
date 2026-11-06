import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafii', safii: "Shaafi'ii" },
  kaynaklar: {
    vatan: 'Mana, bakka jireenyaafi turtii yeroo gabaabaa imala ilaalchisee (Afaan Turkiitiin)',
    cem: "Salaata walitti qabanii (jam') salaatuun ni danda'amaa? (Afaan Turkiitiin)",
    baslangic: 'Imalli yoom jalqaba? (Afaan Turkiitiin)',
    ziyaret: 'Namni magaalaa warra isaa daawwatu imaltuu dhaa? (Afaan Turkiitiin)',
  },
  bilgiNotu:
    "Kun odeeffannoo dha, murtii miti. Imaltuu ta'uun keessan kaayyoofi dheerina imala keessaniifi niyyaa keessan irratti hundaa'a.",
  baslik: 'Imala irra kan jirtan fakkaata',
  mesafeSatiri: 'Bakka jireenya keessanii irraa sararaan km {km} fagaattu. Wanta Diyanet mazhaba {mezhep}tiif dabarsu:',
  maddeler: {
    hanefi: [
      'Mazhaba Hanafii keessatti fageenyi imalaa (safarii) gara km 90 ti. Namni bakka gahu sanatti guyyaa 15 gadi turuuf niyyate imaltuu dha.',
      "Imaltuun salaata dirqamaa raka'aa afurii raka'aa lamatti gabaabsee (qasrii) salaata.",
      "Mazhaba Hanafii keessatti salaata lama walitti qabuun (jam') Hajjii keessatti, Arafaafi Muzdalifaa qofatti. Diyanet akkasumas sababa cimaa kan akka imalaa keessatti yaada mazhabota biroo hordofuun akka danda'amu ibsa.",
    ],
    safii: [
      "Mazhaba Shaafi'ii keessattis fageenyi imalaa gara km 90 ti. Guyyoota gahaniifi ba'an osoo hin lakkaa'in turtiin bakka gahan sanatti guyyaa 4 gadi yoo ta'e, murtiin imalaa itti fufa.",
      "Imaltuun salaata dirqamaa raka'aa afurii raka'aa lamatti gabaabsee (qasrii) salaata.",
      "Mazhaba Shaafi'ii keessatti imalli Zuhrii Asrii wajjin, Maghriba Ishaa'ii wajjin walitti qabuuf (jam') sababa sirrii dha.",
    ],
  },
  ozetAcik: 'Banaa · {mezhep}',
  ozetKapali: 'Cufaa',
  baglantiAcilamadi: 'Geessituun banamuu hin dandeenye. Walqunnamtii interneetii keessanii ilaalaa.',
  ikametGuncellendi: 'Bakki jireenya keessanii haaromfameera',
  ikametKaydedilemedi: "Bakki jireenya keessanii olkaa'amuu hin dandeenye",
  kartiKapatin: 'Kaardii imalaa cufaa',
  burasiEvimErisim: "Kun mana kooti, akka bakka jireenya kootti olkaa'i",
  burasiEvim: 'Kun mana kooti',
  diyanetteOkuyunErisim: 'Fatwaa Diyanet barbaadduu keessatti dubbisaa',
  diyanetteOkuyun: 'Diyanet irratti dubbisaa',
  sayfa: {
    kayitliKonum: "Bakka olkaa'ame",
    henuzKaydedilmedi: "Ammallee hin olkaa'amne — bakki keessan inni jalqabaa akka bakka jireenyaatti lakkaa'ama",
    buradasiniz: 'Amma asitti argamtu',
    uzaktasiniz: 'Amma sararaan gara km {km} fagaattu',
    konumBilinmiyor: 'Bakki keessan ammallee hin beekamu; dura bakka filadhaa',
    giris:
      "Yeroo bakka jireenya keessanii irraa gara km {km} fagaattan, kaardiin odeeffannoo gabaabaan fatwaalee Diyanet cuunfu fuula jalqabaa irratti mul'ata. Kaardiin imala tokkoof si'a tokko mul'ata, beeksisas hin ergu.",
    bilgiKarti: 'Kaardii odeeffannoo',
    kartBaslik: 'Kaardii odeeffannoo imalaa',
    gosterilir: "Fuula jalqabaa irratti mul'ata",
    gosterilmez: "Hin mul'atu",
    mezhepNotu: "Kaardiin mazhaba keessan hordofa; Qindaa'ina › Yeroo salaataa keessatti filachuu dandeessu.",
    ikametYeri: 'Bakka jireenyaa',
    ikametYapErisim: "Bakka amma jirtan akka bakka jireenya keessaniitti olkaa'aa",
    ikametYap: 'Bakka amma jiru bakka jireenya koo godhi',
    kaynaklar: 'Maddoota (Boordii Olaanaa Dhimma Amantaa Diyanet)',
    kaynakErisim: '{etiket}. Barbaadduu keessatti banama',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Gaaffiidhaaf, sarara fatwaa Diyanet 190 bilbiluu dandeessu.',
  },
};
