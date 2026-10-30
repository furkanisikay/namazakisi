import type { Sozluk } from '../tr';

/** Yön harfleri: Arewa (kuzey), Gabas (doğu), Kudu (güney), Yamma (batı). */
export const kible: Sozluk['kible'] = {
  baslik: 'Alƙibla',
  yon: {
    hizali: 'Kuna fuskantar Alƙibla',
    arkada: 'Alƙibla tana bayanku, ku juya',
    sagda: 'Alƙibla tana dama da ku da {derece}°',
    solda: 'Alƙibla tana hagu da ku da {derece}°',
  },
  harf: { kuzey: 'A', dogu: 'G', guney: 'K', bati: 'Y' },
  sekme: {
    pusula: 'Kamfas',
    pusulaErisim: 'Yanayin kamfas',
    pusulaAciklama: 'Idan alamar Kaʼaba ta kai ga ƙwarin da ke sama, kuna fuskantar Alƙibla.',
    kamera: 'Kyamara',
    kameraErisim: 'Yanayin kyamara',
    kameraAciklama: 'Ku riƙe wayar a tsaye; alamar Kaʼaba za ta bayyana a hanyar Alƙibla.',
  },
  sayfa: {
    baslatiliyor: 'Ana fara kamfas…',
    izinKapali: 'Izinin wuri a kashe yake; ana buƙatar wurinku don a gano hanya.',
  },
  hata: {
    izinGerekli: 'Ana buƙatar izinin wuri don a gano hanyar Alƙibla.',
    konumServisi: 'Ba a iya kaiwa ga ayyukan wuri ba. Ku duba saitunan wurin naʼurarku.',
    baslatilamadi: 'Ayyukan Alƙibla ba su iya farawa ba.',
  },
  pusula: {
    ufuk: 'sararin sama',
    konumAliniyor: 'Ana samo wurinku…',
    hazirlaniyor: 'Ana shirya kamfas…',
    kuzeydenAci: 'Alƙibla tana {derece}° daga arewa',
    kabeUzakta: 'Kaʼaba tana nesa da {mesafe}',
    kuzeydenSaatYonu: 'Bisa ga hanyar agogo daga arewa',
    kuzeyden: '{derece}° daga arewa',
    kabeUzaktaKuzeyden: 'Kaʼaba tana nesa da {mesafe}, {derece}° daga arewa',
    pusulaErisim: 'Kamfas na Alƙibla. {cumle}',
    pusulaYok: 'Wannan naʼura ba ta da kamfas; muna nuna hanyar ne bisa ga arewa.',
    kayiyorsa: 'Idan hanyar tana kaucewa, ku zagaya wayarku a sama kamar lamba 8.',
    kamerayla: 'Duba da kyamara',
  },
  kamera: {
    pusulayiKullanin: 'Yi amfani da kamfas',
    kullanilamiyorBaslik: 'Kallon kyamara ba ya samuwa a wannan waya',
    kullanilamiyorMetin:
      'Naʼurorin ji na wayarku ba sa ba da hanya mai inganci idan aka riƙe ta a tsaye. Kamfas har yanzu yana nuna hanyar daidai.',
    izinBaslik: 'Ku ga Alƙibla da kyamararku',
    izinMetin:
      'Ku riƙe wayarku a tsaye ku duba kewaye; alamar Kaʼaba za ta bayyana a hanyar Alƙibla. Wannan yana buƙatar izinin kyamara; ba a naɗar hoton kuma ba ya barin wayarku.',
    kamerayiAcin: 'Kunna kyamara',
    izinKapaliBaslik: 'Izinin kyamara a kashe yake',
    izinKapaliMetin: 'Kuna iya ba da izinin kyamara a Saituna don kallon kyamara. Kamfas yana aiki ba tare da shi ba.',
    ayarlariAcin: 'Buɗe Saituna',
    acilamadiBaslik: 'Kyamara ba ta buɗe ba',
    acilamadiMetin: 'Kyamara ba ta samuwa a yanzu. Kuna iya gano Alƙibla da kamfas.',
    hesaplaniyor: 'Ana gano hanya…',
    dikTutun: 'Ku riƙe wayarku a tsaye',
  },
  kalibrasyon: {
    tesekkurErisim: 'Na gode, yanzu hanyar ta fi daidai',
    tesekkur: 'Na gode, yanzu hanyar ta fi daidai ✓',
    baslik: 'Daidaita kamfas',
    sallayin: 'Ku zagaya wayarku a sama kamar lamba 8.',
    metal: 'Ku nisanta daga abubuwan ƙarfe da murfin maganaɗisu.',
    dogruluk: 'Daidaito',
    simdiDegil: 'Ba yanzu ba',
  },
};
