import type { Sozluk } from '../tr';

/**
 * Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). Seferîlik = călătorie,
 * kasr = scurtarea rugăciunii (QuranEnc `romanian_project` 4:101 "veți scurta Rugăciunea"), cem = combinare.
 */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafită', safii: 'Șafiită' },
  kaynaklar: {
    vatan: 'Domiciliu, reședință și ședere temporară în privința călătoriei (în turcă)',
    cem: 'Se pot combina rugăciunile (jam’)? (în turcă)',
    baslangic: 'Când începe călătoria? (în turcă)',
    ziyaret: 'Este călător cel care își vizitează părinții în orașul lor? (în turcă)',
  },
  bilgiNotu:
    'Aceasta este o informație, nu o hotărâre religioasă. Statutul de călător depinde de scopul și durata călătoriei și de intenția cu care călătoriți.',
  baslik: 'Se pare că sunteți în călătorie',
  mesafeSatiri: 'Vă aflați la aproximativ {km} km în linie dreaptă de locul de reședință. Ce transmite Diyanet pentru școala {mezhep}:',
  maddeler: {
    hanefi: [
      'În școala hanafită, distanța de călătorie (safar) este de aproximativ 90 km. Cine intenționează să rămână mai puțin de 15 zile la destinație este considerat călător.',
      'Călătorul efectuează rugăciunile obligatorii de patru rak’ah ca două rak’ah (qasr).',
      'În școala hanafită, combinarea a două rugăciuni (jam’) are loc doar în timpul Hajj-ului, la Arafat și Muzdalifa. Diyanet arată și că, în scuze serioase precum călătoria, se poate urma opinia celorlalte școli.',
    ],
    safii: [
      'Și în școala șafiită, distanța de călătorie este de aproximativ 90 km. Dacă șederea la destinație este mai scurtă de 4 zile, fără zilele de sosire și de plecare, regulile călătoriei continuă.',
      'Călătorul efectuează rugăciunile obligatorii de patru rak’ah ca două rak’ah (qasr).',
      'În școala șafiită, călătoria este o scuză valabilă pentru combinarea (jam’) lui Dhuhr cu Asr și a lui Maghrib cu Ișa.',
    ],
  },
  ozetAcik: 'Activat · {mezhep}',
  ozetKapali: 'Dezactivat',
  baglantiAcilamadi: 'Linkul nu a putut fi deschis. Verificați conexiunea la internet.',
  ikametGuncellendi: 'Locul de reședință a fost actualizat',
  ikametKaydedilemedi: 'Locul de reședință nu a putut fi salvat',
  kartiKapatin: 'Închideți cardul de călătorie',
  burasiEvimErisim: 'Aici este casa mea, salvați ca loc de reședință',
  burasiEvim: 'Aici e acasă',
  diyanetteOkuyunErisim: 'Citiți fatwa Diyanet în browser',
  diyanetteOkuyun: 'Citiți pe Diyanet',
  sayfa: {
    kayitliKonum: 'Locație salvată',
    henuzKaydedilmedi: 'Nesalvată încă — prima locație contează ca loc de reședință',
    buradasiniz: 'Sunteți aici acum',
    uzaktasiniz: 'Acum vă aflați la aproximativ {km} km în linie dreaptă',
    konumBilinmiyor: 'Locația nu este cunoscută încă; alegeți mai întâi o locație',
    giris:
      'Când vă aflați la aproximativ {km} km de locul de reședință, pe ecranul principal apare un scurt card informativ care rezumă fatwalele Diyanet. Cardul apare o dată pe călătorie și nu trimite notificări.',
    bilgiKarti: 'Card informativ',
    kartBaslik: 'Card informativ de călătorie',
    gosterilir: 'Afișat pe ecranul principal',
    gosterilmez: 'Nu este afișat',
    mezhepNotu: 'Cardul urmează școala juridică aleasă; o puteți alege în Setări › Orele de rugăciune.',
    ikametYeri: 'Loc de reședință',
    ikametYapErisim: 'Salvați locația curentă ca loc de reședință',
    ikametYap: 'Faceți din locația curentă reședința',
    kaynaklar: 'Surse (Înaltul Consiliu pentru Afaceri Religioase al Diyanet)',
    kaynakErisim: '{etiket}. Se deschide în browser',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'Pentru întrebări, puteți suna la linia de fatwa 190 a Diyanet.',
  },
};
