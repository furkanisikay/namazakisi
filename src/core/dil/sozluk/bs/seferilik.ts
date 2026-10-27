import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanefijski', safii: 'Šafijski' },
  kaynaklar: {
    vatan: 'Stalno prebivalište, boravište i privremeni boravak u pogledu putovanja (na turskom)',
    cem: 'Mogu li se namazi spajati (džem)? (na turskom)',
    baslangic: 'Kada počinje putovanje? (na turskom)',
    ziyaret: 'Da li je putnik onaj ko ide u mjesto gdje žive njegovi roditelji? (na turskom)',
  },
  bilgiNotu:
    'Ovo je informacija, a ne propis. Da li se smatrate putnikom zavisi od svrhe i trajanja putovanja te od Vašeg nijeta.',
  baslik: 'Izgleda da ste na putovanju',
  mesafeSatiri: 'Udaljeni ste oko {km} km zračne linije od mjesta prebivališta. Informacije koje prenosi Diyanet (mezheb: {mezhep}):',
  maddeler: {
    hanefi: [
      'U hanefijskom mezhebu mjera putovanja (sefera) je oko 90 km. Ko namjerava ostati u odredištu manje od 15 dana, smatra se putnikom.',
      'Putnik četiri rekata farz-namaza klanja kao dva rekata (kasr).',
      'U hanefijskom mezhebu spajanje dva namaza (džem) je samo na hadžu, na Arefatu i Muzdelifi. Diyanet navodi i da se kod ozbiljnih opravdanja, poput putovanja, može postupiti prema mišljenju drugih mezheba.',
    ],
    safii: [
      'I u šafijskom mezhebu mjera putovanja je oko 90 km. Ako se u odredištu ostaje manje od 4 dana, ne računajući dan dolaska i odlaska, propisi putovanja i dalje važe.',
      'Putnik četiri rekata farz-namaza klanja kao dva rekata (kasr).',
      'U šafijskom mezhebu putovanje je valjano opravdanje za spajanje (džem) podne-namaza s ikindijom i akšama s jacijom.',
    ],
  },
  ozetAcik: 'Uključeno · {mezhep}',
  ozetKapali: 'Isključeno',
  baglantiAcilamadi: 'Link se nije mogao otvoriti. Provjerite internetsku vezu.',
  ikametGuncellendi: 'Vaše mjesto prebivališta je ažurirano',
  ikametKaydedilemedi: 'Vaše mjesto prebivališta nije sačuvano',
  kartiKapatin: 'Zatvorite karticu o putovanju',
  burasiEvimErisim: 'Ovo je moj dom, sačuvajte ga kao mjesto prebivališta',
  burasiEvim: 'Ovo je moj dom',
  diyanetteOkuyunErisim: 'Pročitajte fetvu Diyaneta u pregledniku',
  diyanetteOkuyun: 'Pročitajte na Diyanetu',
  sayfa: {
    kayitliKonum: 'Sačuvana lokacija',
    henuzKaydedilmedi: 'Još nije sačuvano — Vaša prva lokacija smatra se mjestom prebivališta',
    buradasiniz: 'Sada ste ovdje',
    uzaktasiniz: 'Sada ste udaljeni oko {km} km zračne linije',
    konumBilinmiyor: 'Vaša lokacija još nije poznata; prvo odaberite lokaciju',
    giris:
      'Kada se udaljite oko {km} km od mjesta prebivališta, na početnom ekranu vidjet ćete kratku informativnu karticu koja sažima fetve Diyaneta. Kartica se pojavljuje jednom po putovanju i ne šalje obavještenja.',
    bilgiKarti: 'Informativna kartica',
    kartBaslik: 'Kartica o putovanju',
    gosterilir: 'Prikazuje se na početnom ekranu',
    gosterilmez: 'Ne prikazuje se',
    mezhepNotu: 'Sadržaj kartice prati Vaš mezheb; mezheb možete odabrati u Postavke › Namaska vremena.',
    ikametYeri: 'Mjesto prebivališta',
    ikametYapErisim: 'Sačuvajte trenutnu lokaciju kao mjesto prebivališta',
    ikametYap: 'Postavite trenutnu lokaciju kao prebivalište',
    kaynaklar: 'Izvori (Visoki odbor za vjerska pitanja Diyaneta)',
    kaynakErisim: '{etiket}. Otvara se u pregledniku',
    fetvaHatti: 'Za pitanja možete nazvati Diyanetovu fetva-liniju 190.',
  },
};
