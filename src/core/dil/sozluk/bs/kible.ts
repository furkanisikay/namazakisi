import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Okrenuti ste prema kibli',
    arkada: 'Kibla je iza Vas, okrenite se',
    sagda: 'Kibla je {derece}° desno od Vas',
    solda: 'Kibla je {derece}° lijevo od Vas',
  },
  harf: { kuzey: 'S', dogu: 'I', guney: 'J', bati: 'Z' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Način kompasa',
    pusulaAciklama: 'Kada oznaka Kabe dođe do ureza na vrhu, okrenuti ste prema kibli.',
    kamera: 'Kamera',
    kameraErisim: 'Način kamere',
    kameraAciklama: 'Držite telefon uspravno; oznaka Kabe pojavljuje se u smjeru kible.',
  },
  sayfa: {
    baslatiliyor: 'Pokretanje kompasa…',
    izinKapali: 'Dozvola za lokaciju je isključena; Vaša lokacija je potrebna za određivanje smjera.',
  },
  hata: {
    izinGerekli: 'Za određivanje smjera kible potrebna je dozvola za lokaciju.',
    konumServisi: 'Usluge lokacije nisu dostupne. Provjerite postavke lokacije na uređaju.',
    baslatilamadi: 'Usluga kible nije se mogla pokrenuti.',
  },
  pusula: {
    ufuk: 'horizont',
    konumAliniyor: 'Uzimanje Vaše lokacije…',
    hazirlaniyor: 'Priprema kompasa…',
    kuzeydenAci: 'Kibla je {derece}° od sjevera',
    kabeUzakta: 'Kaba je udaljena {mesafe}',
    kuzeydenSaatYonu: 'Od sjevera u smjeru kazaljke na satu',
    kuzeyden: '{derece}° od sjevera',
    kabeUzaktaKuzeyden: 'Kaba je udaljena {mesafe}, {derece}° od sjevera',
    pusulaErisim: 'Kompas za kiblu. {cumle}',
    pusulaYok: 'Ovaj uređaj nema kompas; smjer prikazujemo u odnosu na sjever.',
    kayiyorsa: 'Ako smjer odstupa, pomjerajte telefon u zraku kao da crtate osmicu.',
    kamerayla: 'Pogledajte kamerom',
  },
  kamera: {
    pusulayiKullanin: 'Koristite kompas',
    kullanilamiyorBaslik: 'Prikaz kamerom nije dostupan na ovom telefonu',
    kullanilamiyorMetin:
      'Senzori Vašeg telefona ne daju pouzdan smjer kada se drži uspravno. Kompas i dalje tačno pokazuje smjer.',
    izinBaslik: 'Pogledajte kiblu kamerom',
    izinMetin:
      'Kada držite telefon uspravno i gledate oko sebe, oznaka Kabe pojavljuje se u smjeru kible. Za to je potrebna dozvola za kameru; slika se ne snima i ne napušta Vaš telefon.',
    kamerayiAcin: 'Uključite kameru',
    izinKapaliBaslik: 'Dozvola za kameru je isključena',
    izinKapaliMetin: 'Za prikaz kamerom dozvolu za kameru možete uključiti u Postavkama. Kompas radi i bez nje.',
    ayarlariAcin: 'Otvorite postavke',
    acilamadiBaslik: 'Kamera se nije mogla otvoriti',
    acilamadiMetin: 'Kamera trenutno nije dostupna. Smjer kible možete pronaći kompasom.',
    hesaplaniyor: 'Određivanje smjera…',
    dikTutun: 'Držite telefon uspravno',
  },
  kalibrasyon: {
    tesekkurErisim: 'Hvala, smjer je sada tačniji',
    tesekkur: 'Hvala, smjer je sada tačniji ✓',
    baslik: 'Kalibrirajte kompas',
    sallayin: 'Pomjerajte telefon u zraku kao da crtate osmicu.',
    metal: 'Udaljite se od metalnih predmeta i magnetnih futrola.',
    dogruluk: 'Tačnost',
    simdiDegil: 'Ne sada',
  },
};
