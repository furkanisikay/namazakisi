import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Kybla',
  yon: {
    hizali: 'Kybla tarap durupsyňyz',
    arkada: 'Kybla arkaňyzda, yzyňyza öwrüliň',
    sagda: 'Kybla sagyňyzda {derece}°',
    solda: 'Kybla çepiňizde {derece}°',
  },
  harf: { kuzey: 'D', dogu: 'Gd', guney: 'Go', bati: 'Gb' },
  sekme: {
    pusula: 'Kompas',
    pusulaErisim: 'Kompas tertibi',
    pusulaAciklama: 'Kagba belgisi ýokardaky kertige ýetende, kybla tarap durupsyňyz.',
    kamera: 'Kamera',
    kameraErisim: 'Kamera tertibi',
    kameraAciklama: 'Telefony dik tutuň; Kagba belgisi kybla tarapda görüner.',
  },
  sayfa: {
    baslatiliyor: 'Kompas açylýar…',
    izinKapali: 'Ýerleşiş rugsady öçük; ugry tapmak üçin ýerleşişiňiz gerek.',
  },
  hata: {
    izinGerekli: 'Kybla ugruny tapmak üçin ýerleşiş rugsady gerek.',
    konumServisi: 'Ýerleşiş hyzmatlaryna ýetip bolmaýar. Enjamyňyzyň ýerleşiş sazlamalaryny barlaň.',
    baslatilamadi: 'Kybla hyzmaty başlap bilmedi.',
  },
  pusula: {
    ufuk: 'gözýetim',
    konumAliniyor: 'Ýerleşişiňiz alynýar…',
    hazirlaniyor: 'Kompas taýýarlanýar…',
    kuzeydenAci: 'Kybla demirgazykdan {derece}°',
    kabeUzakta: 'Kagba {mesafe} uzaklykda',
    kuzeydenSaatYonu: 'Demirgazykdan sagat diliniň ugruna',
    kuzeyden: 'Demirgazykdan {derece}°',
    kabeUzaktaKuzeyden: 'Kagba {mesafe} uzaklykda, demirgazykdan {derece}°',
    pusulaErisim: 'Kybla kompasy. {cumle}',
    pusulaYok: 'Bu enjamda kompas ýok; ugry demirgazyga görä görkezýäris.',
    kayiyorsa: 'Ugur süýşýän bolsa, telefonyňyzy howada 8 şekilli hereketlendiriň.',
    kamerayla: 'Kamera bilen görüň',
  },
  kamera: {
    pusulayiKullanin: 'Kompasy ulanyň',
    kullanilamiyorBaslik: 'Bu telefonda kamera görnüşi elýeter däl',
    kullanilamiyorMetin:
      'Telefonyňyzyň datçikleri dik tutulanda ygtybarly ugur bermeýär. Kompas ugry dogry görkezmegini dowam edýär.',
    izinBaslik: 'Kyblany kamera bilen görüň',
    izinMetin:
      'Telefonyňyzy dik tutup töweregiňize serediň; Kagba belgisi kybla tarapda görüner. Munuň üçin kamera rugsady gerek; surat ýazgy edilmeýär we telefonyňyzdan çykmaýar.',
    kamerayiAcin: 'Kamerany açyň',
    izinKapaliBaslik: 'Kamera rugsady öçük',
    izinKapaliMetin: 'Kamera görnüşi üçin Sazlamalardan kamera rugsadyny berip bilersiňiz. Kompas onsuz hem işleýär.',
    ayarlariAcin: 'Sazlamalary açyň',
    acilamadiBaslik: 'Kamera açylmady',
    acilamadiMetin: 'Kamera häzir elýeter däl. Kyblany kompas bilen tapyp bilersiňiz.',
    hesaplaniyor: 'Ugur tapylýar…',
    dikTutun: 'Telefonyňyzy dik tutuň',
  },
  kalibrasyon: {
    tesekkurErisim: 'Sag boluň, ugur indi has takyk',
    tesekkur: 'Sag boluň, ugur indi has takyk ✓',
    baslik: 'Kompasy sazlaň',
    sallayin: 'Telefonyňyzy howada 8 şekilli hereketlendiriň.',
    metal: 'Demir zatlardan we magnitli gaplardan daşlaşyň.',
    dogruluk: 'Takyklyk',
    simdiDegil: 'Häzir däl',
  },
};
