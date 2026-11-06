import type { Sozluk } from '../tr';

/**
 * Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Seferî = "putnik
 * (musafir)", kasr = skraćivanje (4:101 "molitvu skratiti"), cem = spajanje (džem'); terimler DOĞRULANMADI.
 */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'hanefijski', safii: 'šafijski' },
  kaynaklar: {
    vatan: 'Domovina, boravište i privremeni boravak u pogledu putovanja (na turskom)',
    cem: "Mogu li se namazi spajati (džem')? (na turskom)",
    baslangic: 'Kada počinje putovanje? (na turskom)',
    ziyaret: 'Je li putnik onaj tko posjećuje roditeljski grad? (na turskom)',
  },
  bilgiNotu:
    'Ovo je informacija, a ne fetva. Računate li se kao putnik, ovisi o svrsi i trajanju putovanja te o vašem nijetu.',
  baslik: 'Čini se da ste na putovanju',
  mesafeSatiri: 'Od mjesta boravka udaljeni ste oko {km} km zračne linije. Što Diyanet prenosi za {mezhep} mezheb:',
  maddeler: {
    hanefi: [
      'U hanefijskom mezhebu putna udaljenost (sefer) iznosi oko 90 km. Tko na odredištu namjerava ostati kraće od 15 dana, računa se kao putnik (musafir).',
      'Putnik farzove od četiri rekata klanja kao dva rekata (kasr).',
      "U hanefijskom mezhebu spajanje dvaju namaza (džem') dopušteno je samo tijekom hadža, na Arefatu i Muzdelifi. Diyanet također navodi da se kod ozbiljnih opravdanja poput putovanja može slijediti mišljenje drugih mezheba.",
    ],
    safii: [
      'I u šafijskom mezhebu putna udaljenost iznosi oko 90 km. Ako boravak na odredištu, ne računajući dane dolaska i odlaska, traje kraće od 4 dana, propisi o putovanju i dalje vrijede.',
      'Putnik farzove od četiri rekata klanja kao dva rekata (kasr).',
      "U šafijskom mezhebu putovanje je valjano opravdanje za spajanje (džem') podne-namaza s ikindijom te akšama s jacijom.",
    ],
  },
  ozetAcik: 'Uključeno · {mezhep}',
  ozetKapali: 'Isključeno',
  baglantiAcilamadi: 'Poveznicu nije bilo moguće otvoriti. Provjerite internetsku vezu.',
  ikametGuncellendi: 'Vaše je mjesto boravka ažurirano',
  ikametKaydedilemedi: 'Vaše mjesto boravka nije bilo moguće spremiti',
  kartiKapatin: 'Zatvorite karticu o putovanju',
  burasiEvimErisim: 'Ovo je moj dom, spremi ga kao moje mjesto boravka',
  burasiEvim: 'Ovo je moj dom',
  diyanetteOkuyunErisim: 'Pročitajte Diyanetovu fetvu u pregledniku',
  diyanetteOkuyun: 'Pročitajte na Diyanetu',
  sayfa: {
    kayitliKonum: 'Spremljena lokacija',
    henuzKaydedilmedi: 'Još nije spremljeno — vaša prva lokacija računa se kao mjesto boravka',
    buradasiniz: 'Sada ste ovdje',
    uzaktasiniz: 'Sada ste udaljeni oko {km} km zračne linije',
    konumBilinmiyor: 'Vaša lokacija još nije poznata; najprije odaberite lokaciju',
    giris:
      'Kad ste oko {km} km udaljeni od mjesta boravka, na početnom se zaslonu pojavljuje kratka kartica s informacijama koja sažima Diyanetove fetve. Kartica se pojavljuje jednom po putovanju i ne šalje obavijesti.',
    bilgiKarti: 'Kartica s informacijama',
    kartBaslik: 'Kartica s informacijama o putovanju',
    gosterilir: 'Prikazuje se na početnom zaslonu',
    gosterilmez: 'Ne prikazuje se',
    mezhepNotu: 'Kartica slijedi vaš mezheb; možete ga odabrati u Postavke › Vremena namaza.',
    ikametYeri: 'Mjesto boravka',
    ikametYapErisim: 'Spremite trenutačnu lokaciju kao mjesto boravka',
    ikametYap: 'Trenutačna lokacija kao boravište',
    kaynaklar: 'Izvori (Vrhovno vijeće za vjerska pitanja Diyaneta)',
    kaynakErisim: '{etiket}. Otvara se u pregledniku',
    /** Türkçe dışında gösterilmez (yalnız Türkiye'de geçerli hizmet). */
    fetvaHatti: 'Za pitanja možete nazvati Diyanetovu liniju za fetve 190.',
  },
};
