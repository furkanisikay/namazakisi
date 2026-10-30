import type { Sozluk } from '../tr';

/** Yön harfleri: Rewo (kuzey), Fuɗnaange (doğu), Worgo (güney), Hirnaange (batı). */
export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Hiɗon ndaari qibla',
    arkada: 'Qibla hino caggal mon, yeccitee',
    sagda: 'Qibla hino {derece}° e ñaamo mon',
    solda: 'Qibla hino {derece}° e nano mon',
  },
  harf: { kuzey: 'R', dogu: 'F', guney: 'W', bati: 'H' },
  sekme: {
    pusula: 'Busol',
    pusulaErisim: 'Mode busol',
    pusulaAciklama: 'So maande Kaaba hewtii ceeɗol dow ngol, hiɗon ndaari qibla.',
    kamera: 'Kamera',
    kameraErisim: 'Mode kamera',
    kameraAciklama: 'Ñiiɓnee talifon ngon; maande Kaaba ɓannginto e baŋŋe qibla.',
  },
  sayfa: {
    baslatiliyor: 'Busol hino fuɗɗoo…',
    izinKapali: 'Jamirol nokkuure ñifaama; nokkuure mon hino haani ngam heɓde baŋŋe.',
  },
  hata: {
    izinGerekli: 'Jamirol nokkuure hino haani ngam heɓde baŋŋe qibla.',
    konumServisi: 'Carwe nokkuure heɓotaake. Ndaaree teelte nokkuure kaɓirgal mon.',
    baslatilamadi: 'Carwol qibla fuɗɗaaki.',
  },
  pusula: {
    ufuk: 'jaajeende',
    konumAliniyor: 'Nokkuure mon hino heɓee…',
    hazirlaniyor: 'Busol hino moƴƴinee…',
    kuzeydenAci: 'Qibla hino {derece}° gila rewo',
    kabeUzakta: 'Kaaba hino woɗɗi {mesafe}',
    kuzeydenSaatYonu: 'Gila rewo, e ɗowgol montoro',
    kuzeyden: '{derece}° gila rewo',
    kabeUzaktaKuzeyden: 'Kaaba hino woɗɗi {mesafe}, {derece}° gila rewo',
    pusulaErisim: 'Busol qibla. {cumle}',
    pusulaYok: 'Kaɓirgal ngal alaa busol; min kolliray baŋŋe ngal rewrude e rewo.',
    kayiyorsa: 'So baŋŋe ngal hino dilla, dillinee talifon mon e kene wa limoore 8.',
    kamerayla: 'Ndaaree e kamera',
  },
  kamera: {
    pusulayiKullanin: 'Huutoree busol',
    kullanilamiyorBaslik: 'Jiytol kamera heɓotaake e talifon ngon',
    kullanilamiyorMetin:
      'Kaɓirɗe talifon mon ndokkataa baŋŋe gooŋɗingo so ngon ñiiɓnaama. Busol ngol hino hollira baŋŋe ngal no feewi.',
    izinBaslik: 'Ndaaree qibla e kamera mon',
    izinMetin:
      'Ñiiɓnee talifon mon ndaaree sara mon; maande Kaaba ɓannginto e baŋŋe qibla. Ɗum hino haani jamirol kamera; natal ngal winndaaka, yaltataa talifon mon.',
    kamerayiAcin: 'Huɓɓinee kamera',
    izinKapaliBaslik: 'Jamirol kamera ñifaama',
    izinKapaliMetin: 'Hiɗon mbaawi jamirde kamera e Teelte ngam jiytol kamera. Busol ngol hino golla tawa ɗum alaa.',
    ayarlariAcin: 'Udditee Teelte',
    acilamadiBaslik: 'Kamera udditaaki',
    acilamadiMetin: 'Kamera heɓotaake jooni. Hiɗon mbaawi heɓde qibla e busol.',
    hesaplaniyor: 'Baŋŋe ngal hino yiylee…',
    dikTutun: 'Ñiiɓnee talifon mon',
  },
  kalibrasyon: {
    tesekkurErisim: 'On njaaraama, baŋŋe ngal ɓuri feewde jooni',
    tesekkur: 'On njaaraama, baŋŋe ngal ɓuri feewde jooni ✓',
    baslik: 'Feewnee busol',
    sallayin: 'Dillinee talifon mon e kene wa limoore 8.',
    metal: 'Woɗɗitee e kaɓirɗe njamndi e tuubaaji magneti.',
    dogruluk: 'Feewde',
    simdiDegil: 'Wonaa jooni',
  },
};
