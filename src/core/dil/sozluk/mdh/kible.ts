import type { Sozluk } from '../tr';

/** Kıble "Qiblat" (QE 2:144); yön harfleri pusula kısaltması olarak evrensel N/E/S/W kalır. */
export const kible: Sozluk['kible'] = {
  baslik: 'Qiblat',
  yon: {
    hizali: 'Pedsangul kanu sa Qiblat',
    arkada: 'Lu sa talikud nu su Qiblat, lumingi kanu',
    sagda: 'Su Qiblat na {derece}° sa kawanan nu',
    solda: 'Su Qiblat na {derece}° sa biwang nu',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Mode a kompas',
    pusulaAciklama: "Amayka makasampay su tanda nu Ka'bah sa kitkit sa itaas, pedsangul kanu sa Qiblat.",
    kamera: 'Kamera',
    kameraErisim: 'Mode a kamera',
    kameraAciklama: "Pakatindega su telepono; mailay su tanda nu Ka'bah sa tampal nu Qiblat.",
  },
  sayfa: {
    baslatiliyor: 'Pedpamula su kompas…',
    izinKapali: 'Naka-off su permiso sa lokasyun; kailangan su lokasyun nu para matuntay su tampal.',
  },
  hata: {
    izinGerekli: 'Kailangan su permiso sa lokasyun para matuntay su tampal nu Qiblat.',
    konumServisi: 'Di masampay su serbisyu nu lokasyun. Ilay su manga setting nu lokasyun sa device nu.',
    baslatilamadi: 'Di nakapamula su serbisyu nu Qiblat.',
  },
  pusula: {
    ufuk: 'kilid nu langit',
    konumAliniyor: 'Pedkwaen su lokasyun nu…',
    hazirlaniyor: 'Pedhanda su kompas…',
    kuzeydenAci: 'Su Qiblat na {derece}° pabpun sa utara',
    kabeUzakta: "Su Ka'bah na {mesafe} i kawatan",
    kuzeydenSaatYonu: 'Sunud sa ikut nu orasan pabpun sa utara',
    kuzeyden: '{derece}° pabpun sa utara',
    kabeUzaktaKuzeyden: "Su Ka'bah na {mesafe} i kawatan, {derece}° pabpun sa utara",
    pusulaErisim: 'Kompas nu Qiblat. {cumle}',
    pusulaYok: 'Da kompas sa device ini; ipailay nami su tampal pabpun sa utara.',
    kayiyorsa: 'Amayka pedlalin su tampal, ilibut su telepono nu sa hangin sa bentuk a 8.',
    kamerayla: 'Ilay sa kamera',
  },
  kamera: {
    pusulayiKullanin: 'Gamiten su kompas',
    kullanilamiyorBaslik: 'Di magamit su ilay sa kamera sa telepono ini',
    kullanilamiyorMetin:
      'Su manga sensor nu telepono nu na di makaenggay sa benal a tampal amayka nakatindeg. Su kompas na pedtidtu pan i kapailay sa tampal.',
    izinBaslik: 'Ilay su Qiblat sa kamera nu',
    izinMetin:
      "Pakatindega su telepono nu endu ilay sa palibut; mailay su tanda nu Ka'bah sa tampal nu Qiblat. Kailangan sya su permiso sa kamera; di pedtagu su ladawan endu di pedlyu sa telepono nu.",
    kamerayiAcin: 'I-on su kamera',
    izinKapaliBaslik: 'Naka-off su permiso sa kamera',
    izinKapaliMetin: 'Makaenggay kanu sa permiso sa kamera kanu Manga setting para sa ilay sa kamera. Pedgalebek su kompas apiya da sya.',
    ayarlariAcin: 'Bukatan su Manga setting',
    acilamadiBaslik: 'Di nabukatan su kamera',
    acilamadiMetin: 'Di magamit su kamera saguna. Matuntay nu su Qiblat sa kompas.',
    hesaplaniyor: 'Pedtuntayen su tampal…',
    dikTutun: 'Pakatindega su telepono nu',
  },
  kalibrasyon: {
    tesekkurErisim: 'Salamat, mas benal den su tampal',
    tesekkur: 'Salamat, mas benal den su tampal ✓',
    baslik: 'I-calibrate su kompas',
    sallayin: 'Ilibut su telepono nu sa hangin sa bentuk a 8.',
    metal: 'Lumayu kanu sa manga metal endu sa magnetic a case.',
    dogruluk: 'Kabenal',
    simdiDegil: 'Di pan saguna',
  },
};
