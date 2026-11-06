import type { Sozluk } from '../tr';

/** Kıble = "Qibla" (QuranEnc `romanian_project` 2:142–145; HadeethEnc ro "qibla"); yön harfleri N E S V. */
export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Sunteți cu fața spre Qibla',
    arkada: 'Qibla este în spate, întoarceți-vă',
    sagda: 'Qibla este la {derece}° spre dreapta',
    solda: 'Qibla este la {derece}° spre stânga',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'V' },
  sekme: {
    pusula: 'Busolă',
    pusulaErisim: 'Mod busolă',
    pusulaAciklama: 'Când semnul Kaabei ajunge în crestătura de sus, sunteți cu fața spre Qibla.',
    kamera: 'Cameră',
    kameraErisim: 'Mod cameră',
    kameraAciklama: 'Țineți telefonul vertical; semnul Kaabei apare în direcția Qiblei.',
  },
  sayfa: {
    baslatiliyor: 'Se pornește busola…',
    izinKapali: 'Permisiunea de locație este dezactivată; locația este necesară pentru a găsi direcția.',
  },
  hata: {
    izinGerekli: 'Permisiunea de locație este necesară pentru a găsi direcția Qiblei.',
    konumServisi: 'Serviciile de localizare nu sunt disponibile. Verificați setările de locație ale dispozitivului.',
    baslatilamadi: 'Serviciul Qibla nu a putut porni.',
  },
  pusula: {
    ufuk: 'orizont',
    konumAliniyor: 'Se obține locația…',
    hazirlaniyor: 'Se pregătește busola…',
    kuzeydenAci: 'Qibla este la {derece}° față de nord',
    kabeUzakta: 'Kaaba este la {mesafe}',
    kuzeydenSaatYonu: 'În sensul acelor de ceasornic, de la nord',
    kuzeyden: '{derece}° față de nord',
    kabeUzaktaKuzeyden: 'Kaaba este la {mesafe}, {derece}° față de nord',
    pusulaErisim: 'Busola Qiblei. {cumle}',
    pusulaYok: 'Acest dispozitiv nu are busolă; afișăm direcția față de nord.',
    kayiyorsa: 'Dacă direcția deviază, mișcați telefonul în aer descriind cifra 8.',
    kamerayla: 'Vedeți cu camera',
  },
  kamera: {
    pusulayiKullanin: 'Folosiți busola',
    kullanilamiyorBaslik: 'Vizualizarea cu camera nu este disponibilă pe acest telefon',
    kullanilamiyorMetin:
      'Senzorii telefonului nu oferă o direcție fiabilă când îl țineți vertical. Busola arată în continuare direcția corect.',
    izinBaslik: 'Vedeți Qibla cu camera',
    izinMetin:
      'Țineți telefonul vertical și priviți în jur; semnul Kaabei apare în direcția Qiblei. Este necesară permisiunea pentru cameră; imaginea nu este înregistrată și nu părăsește telefonul.',
    kamerayiAcin: 'Porniți camera',
    izinKapaliBaslik: 'Permisiunea pentru cameră este dezactivată',
    izinKapaliMetin: 'Puteți permite accesul la cameră din Setări pentru vizualizarea cu camera. Busola funcționează și fără ea.',
    ayarlariAcin: 'Deschideți Setările',
    acilamadiBaslik: 'Camera nu a putut fi deschisă',
    acilamadiMetin: 'Camera nu este disponibilă acum. Puteți găsi Qibla cu busola.',
    hesaplaniyor: 'Se caută direcția…',
    dikTutun: 'Țineți telefonul vertical',
  },
  kalibrasyon: {
    tesekkurErisim: 'Mulțumim, direcția este acum mai precisă',
    tesekkur: 'Mulțumim, direcția este acum mai precisă ✓',
    baslik: 'Calibrați busola',
    sallayin: 'Mișcați telefonul în aer descriind cifra 8.',
    metal: 'Îndepărtați-vă de obiectele metalice și de husele magnetice.',
    dogruluk: 'Precizie',
    simdiDegil: 'Nu acum',
  },
};
