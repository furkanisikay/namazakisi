import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Kibla',
  yon: {
    hizali: 'Umeelekea Kibla',
    arkada: 'Kibla iko nyuma yako, geuka',
    sagda: 'Kibla iko {derece}° upande wako wa kulia',
    solda: 'Kibla iko {derece}° upande wako wa kushoto',
  },
  harf: { kuzey: 'Ks', dogu: 'Ms', guney: 'Ku', bati: 'Mg' },
  sekme: {
    pusula: 'Dira',
    pusulaErisim: 'Hali ya dira',
    pusulaAciklama: 'Alama ya Al-Kaaba ikifika kwenye kipenyo kilicho juu, umeelekea Kibla.',
    kamera: 'Kamera',
    kameraErisim: 'Hali ya kamera',
    kameraAciklama: 'Shika simu wima; alama ya Al-Kaaba inaonekana upande wa Kibla.',
  },
  sayfa: {
    baslatiliyor: 'Inaanzisha dira…',
    izinKapali: 'Ruhusa ya mahali imezimwa; mahali ulipo panahitajika ili kupata mwelekeo.',
  },
  hata: {
    izinGerekli: 'Ruhusa ya mahali inahitajika ili kupata mwelekeo wa Kibla.',
    konumServisi: 'Huduma za mahali hazipatikani. Angalia mipangilio ya mahali ya kifaa chako.',
    baslatilamadi: 'Huduma ya Kibla haikuweza kuanza.',
  },
  pusula: {
    ufuk: 'upeo wa macho',
    konumAliniyor: 'Inapata mahali ulipo…',
    hazirlaniyor: 'Inatayarisha dira…',
    kuzeydenAci: 'Kibla iko {derece}° kutoka kaskazini',
    kabeUzakta: 'Al-Kaaba iko umbali wa {mesafe}',
    kuzeydenSaatYonu: 'Kwa mwelekeo wa saa kutoka kaskazini',
    kuzeyden: '{derece}° kutoka kaskazini',
    kabeUzaktaKuzeyden: 'Al-Kaaba iko umbali wa {mesafe}, {derece}° kutoka kaskazini',
    pusulaErisim: 'Dira ya Kibla. {cumle}',
    pusulaYok: 'Kifaa hiki hakina dira; tunaonyesha mwelekeo kulingana na kaskazini.',
    kayiyorsa: 'Mwelekeo ukihama, sogeza simu yako hewani kwa umbo la 8.',
    kamerayla: 'Tazama kwa kamera',
  },
  kamera: {
    pusulayiKullanin: 'Tumia dira',
    kullanilamiyorBaslik: 'Mwonekano wa kamera haupatikani kwenye simu hii',
    kullanilamiyorMetin:
      'Vihisi vya simu yako havitoi mwelekeo wa kuaminika ikishikwa wima. Dira bado inaonyesha mwelekeo kwa usahihi.',
    izinBaslik: 'Ione Kibla kwa kamera yako',
    izinMetin:
      'Shika simu yako wima na utazame pande zote; alama ya Al-Kaaba inaonekana upande wa Kibla. Hii inahitaji ruhusa ya kamera; picha hairekodiwi na haitoki kwenye simu yako.',
    kamerayiAcin: 'Washa kamera',
    izinKapaliBaslik: 'Ruhusa ya kamera imezimwa',
    izinKapaliMetin: 'Unaweza kuruhusu kamera katika Mipangilio kwa mwonekano wa kamera. Dira inafanya kazi bila hiyo.',
    ayarlariAcin: 'Fungua Mipangilio',
    acilamadiBaslik: 'Kamera haikuweza kufunguka',
    acilamadiMetin: 'Kamera haipatikani kwa sasa. Unaweza kupata Kibla kwa dira.',
    hesaplaniyor: 'Inatafuta mwelekeo…',
    dikTutun: 'Shika simu yako wima',
  },
  kalibrasyon: {
    tesekkurErisim: 'Asante, mwelekeo sasa ni sahihi zaidi',
    tesekkur: 'Asante, mwelekeo sasa ni sahihi zaidi ✓',
    baslik: 'Rekebisha dira',
    sallayin: 'Sogeza simu yako hewani kwa umbo la 8.',
    metal: 'Kaa mbali na vitu vya chuma na makasha ya sumaku.',
    dogruluk: 'Usahihi',
    simdiDegil: 'Si sasa',
  },
};
