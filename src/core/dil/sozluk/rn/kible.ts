import type { Sozluk } from '../tr';

/** Kıble QuranEnc Kirundi mealinde "ubutumbero" (2:142). Pusula harfleri Burundi'nin Fransızca normuyla (N, E, S, O). */
export const kible: Sozluk['kible'] = {
  baslik: 'Ubutumbero',
  yon: {
    hizali: 'Murerekeye ubutumbero',
    arkada: 'Ubutumbero buri inyuma yanyu, muhindukire',
    sagda: 'Ubutumbero buri {derece}° iburyo bwanyu',
    solda: 'Ubutumbero buri {derece}° ibubamfu bwanyu',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'O' },
  sekme: {
    pusula: 'Busole',
    pusulaErisim: 'Uburyo bwa busole',
    pusulaAciklama: 'Ikimenyetso ca Kaaba nigishika ku kamenyetso ko hejuru, muba murerekeye ubutumbero (Qibla).',
    kamera: 'Kamera',
    kameraErisim: 'Uburyo bwa kamera',
    kameraAciklama: 'Mufate terefone ihagaze; ikimenyetso ca Kaaba kiboneka mu butumbero.',
  },
  sayfa: {
    baslatiliyor: 'Busole iriko iratangura…',
    izinKapali: 'Uruhusha rw’ikibanza rwazimijwe; ikibanza canyu kirakenewe kugira ngo ubutumbero buboneke.',
  },
  hata: {
    izinGerekli: 'Uruhusha rw’ikibanza rurakenewe kugira ngo ubutumbero buboneke.',
    konumServisi: 'Ibikorwa vy’ikibanza ntibishikirwa. Musuzume amahitamwo y’ikibanza y’igikoresho canyu.',
    baslatilamadi: 'Igikorwa c’ubutumbero nticashoboye gutangura.',
  },
  pusula: {
    ufuk: 'impera y’ijuru',
    konumAliniyor: 'Ikibanza canyu kiriko kiraronderwa…',
    hazirlaniyor: 'Busole iriko iritegura…',
    kuzeydenAci: 'Ubutumbero buri {derece}° uhereye mu Buraruko',
    kabeUzakta: 'Kaaba iri ku ntera ya {mesafe}',
    kuzeydenSaatYonu: 'Uhereye mu Buraruko, nk’uko inkoni z’isaha zigenda',
    kuzeyden: '{derece}° uhereye mu Buraruko',
    kabeUzaktaKuzeyden: 'Kaaba iri ku ntera ya {mesafe}, {derece}° uhereye mu Buraruko',
    pusulaErisim: 'Busole y’ubutumbero. {cumle}',
    pusulaYok: 'Iki gikoresho nta busole gifise; turerekana ubutumbero uhereye mu Buraruko.',
    kayiyorsa: 'Nimba ubutumbero buhindagurika, muzungurure terefone yanyu mu kirere nk’igiharuro 8.',
    kamerayla: 'Muraraba na kamera',
  },
  kamera: {
    pusulayiKullanin: 'Mukoreshe busole',
    kullanilamiyorBaslik: 'Kwerekana na kamera ntibishoboka kuri iyi terefone',
    kullanilamiyorMetin:
      'Ibikoresho vyumva vya terefone yanyu ntibitanga ubutumbero bwizewe iyo ihagaze. Busole iracerekana ubutumbero neza.',
    izinBaslik: 'Mubone ubutumbero na kamera',
    izinMetin:
      'Mufate terefone ihagaze murabe hirya no hino; ikimenyetso ca Kaaba kiboneka mu butumbero. Ibi bikenera uruhusha rwa kamera; ishusho ntiyandikwa kandi ntiva muri terefone yanyu.',
    kamerayiAcin: 'Mufungure kamera',
    izinKapaliBaslik: 'Uruhusha rwa kamera rwazimijwe',
    izinKapaliMetin: 'Murashobora kwemerera kamera mu Mahitamwo kugira mubone ubutumbero na kamera. Busole ikora ata rwo.',
    ayarlariAcin: 'Mwugurure Amahitamwo',
    acilamadiBaslik: 'Kamera ntiyashoboye kwuguruka',
    acilamadiMetin: 'Kamera ntiboneka ubu. Murashobora kubona ubutumbero na busole.',
    hesaplaniyor: 'Ubutumbero buriko buraronderwa…',
    dikTutun: 'Mufate terefone yanyu ihagaze',
  },
  kalibrasyon: {
    tesekkurErisim: 'Murakoze, ubutumbero ubu buratomoye kuruta',
    tesekkur: 'Murakoze, ubutumbero ubu buratomoye kuruta ✓',
    baslik: 'Mutunganye busole',
    sallayin: 'Muzungurure terefone yanyu mu kirere nk’igiharuro 8.',
    metal: 'Mwigire kure y’ibintu vy’icuma n’udukingirizo turimwo rukuruzi.',
    dogruluk: 'Ukutomora',
    simdiDegil: 'Si ubu',
  },
};
