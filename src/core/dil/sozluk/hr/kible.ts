import type { Sozluk } from '../tr';

/** Kıble = "kibla" (QuranEnc croatian_rwwad 2:144), Kâbe = "Kaba". Yön harfleri S I J Z (sjever, istok, jug, zapad). */
export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Okrenuti ste prema kibli',
    arkada: 'Kibla je iza vas, okrenite se',
    sagda: 'Kibla je {derece}° udesno od vas',
    solda: 'Kibla je {derece}° ulijevo od vas',
  },
  harf: { kuzey: 'S', dogu: 'I', guney: 'J', bati: 'Z' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Način rada s kompasom',
    pusulaAciklama: 'Kad oznaka Kabe dođe do ureza na vrhu, okrenuti ste prema kibli.',
    kamera: 'Kamera',
    kameraErisim: 'Način rada s kamerom',
    kameraAciklama: 'Držite telefon uspravno; oznaka Kabe pojavljuje se u smjeru kible.',
  },
  sayfa: {
    baslatiliyor: 'Pokretanje kompasa…',
    izinKapali: 'Dopuštenje za lokaciju je isključeno; vaša je lokacija potrebna za određivanje smjera.',
  },
  hata: {
    izinGerekli: 'Za određivanje smjera kible potrebno je dopuštenje za lokaciju.',
    konumServisi: 'Usluge lokacije nisu dostupne. Provjerite postavke lokacije na uređaju.',
    baslatilamadi: 'Usluga kible nije se mogla pokrenuti.',
  },
  pusula: {
    ufuk: 'obzor',
    konumAliniyor: 'Dohvaćanje lokacije…',
    hazirlaniyor: 'Priprema kompasa…',
    kuzeydenAci: 'Kibla je {derece}° od sjevera',
    kabeUzakta: 'Kaba je udaljena {mesafe}',
    kuzeydenSaatYonu: 'U smjeru kazaljke na satu od sjevera',
    kuzeyden: '{derece}° od sjevera',
    kabeUzaktaKuzeyden: 'Kaba je udaljena {mesafe}, {derece}° od sjevera',
    pusulaErisim: 'Kompas za kiblu. {cumle}',
    pusulaYok: 'Ovaj uređaj nema kompas; smjer prikazujemo u odnosu na sjever.',
    kayiyorsa: 'Ako smjer odstupa, pomičite telefon u zraku u obliku osmice.',
    kamerayla: 'Prikaz kamerom',
  },
  kamera: {
    pusulayiKullanin: 'Upotrijebite kompas',
    kullanilamiyorBaslik: 'Prikaz kamerom nije dostupan na ovom telefonu',
    kullanilamiyorMetin:
      'Senzori vašeg telefona ne daju pouzdan smjer kad se telefon drži uspravno. Kompas i dalje točno prikazuje smjer.',
    izinBaslik: 'Pronađite kiblu kamerom',
    izinMetin:
      'Držite telefon uspravno i pogledajte oko sebe; oznaka Kabe pojavljuje se u smjeru kible. Za to je potrebno dopuštenje za kameru; slika se ne snima i nikad ne napušta vaš telefon.',
    kamerayiAcin: 'Uključite kameru',
    izinKapaliBaslik: 'Dopuštenje za kameru je isključeno',
    izinKapaliMetin: 'Za prikaz kamerom pristup kameri možete dopustiti u Postavkama. Kompas radi i bez toga.',
    ayarlariAcin: 'Otvorite Postavke',
    acilamadiBaslik: 'Kamera se nije mogla otvoriti',
    acilamadiMetin: 'Kamera trenutačno nije dostupna. Kiblu možete pronaći kompasom.',
    hesaplaniyor: 'Određivanje smjera…',
    dikTutun: 'Držite telefon uspravno',
  },
  kalibrasyon: {
    tesekkurErisim: 'Hvala, smjer je sada precizniji',
    tesekkur: 'Hvala, smjer je sada precizniji ✓',
    baslik: 'Kalibrirajte kompas',
    sallayin: 'Pomičite telefon u zraku u obliku osmice.',
    metal: 'Udaljite se od metalnih predmeta i magnetskih maski.',
    dogruluk: 'Točnost',
    simdiDegil: 'Ne sada',
  },
};
