import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Ƙiblah',
  yon: {
    hizali: 'Ẹ dojú kọ Ƙiblah',
    arkada: 'Ƙiblah wà lẹ́yìn yín, ẹ yí padà',
    sagda: 'Ƙiblah wà ní {derece}° sí ọ̀tún yín',
    solda: 'Ƙiblah wà ní {derece}° sí òsì yín',
  },
  harf: { kuzey: 'Àr', dogu: 'Ìl', guney: 'Gú', bati: 'Ìw' },
  sekme: {
    pusula: 'Kọ́ńpáàsì',
    pusulaErisim: 'Ipò kọ́ńpáàsì',
    pusulaAciklama: 'Nígbà tí àmì Ka‘bah bá dé ojú àmì lókè, ẹ ti dojú kọ Ƙiblah.',
    kamera: 'Kámẹ́rà',
    kameraErisim: 'Ipò kámẹ́rà',
    kameraAciklama: 'Ẹ di fóònù mú ní ìdúró; àmì Ka‘bah yóò hàn ní ìhà Ƙiblah.',
  },
  sayfa: {
    baslatiliyor: 'À ń bẹ̀rẹ̀ kọ́ńpáàsì…',
    izinKapali: 'Àṣẹ ibùdó ti wà ní pípa; a nílò ibùdó yín láti rí ìhà náà.',
  },
  hata: {
    izinGerekli: 'A nílò àṣẹ ibùdó láti rí ìhà Ƙiblah.',
    konumServisi: 'A kò lè dé iṣẹ́ ibùdó. Ẹ ṣàyẹ̀wò ètò ibùdó ẹ̀rọ yín.',
    baslatilamadi: 'Iṣẹ́ Ƙiblah kò lè bẹ̀rẹ̀.',
  },
  pusula: {
    ufuk: 'ojú ọ̀run',
    konumAliniyor: 'À ń gba ibùdó yín…',
    hazirlaniyor: 'À ń pèsè kọ́ńpáàsì…',
    kuzeydenAci: 'Ƙiblah wà ní {derece}° láti àríwá',
    kabeUzakta: 'Ka‘bah jìnnà ní {mesafe}',
    kuzeydenSaatYonu: 'Bí aago ṣe ń yí, láti àríwá',
    kuzeyden: '{derece}° láti àríwá',
    kabeUzaktaKuzeyden: 'Ka‘bah jìnnà ní {mesafe}, {derece}° láti àríwá',
    pusulaErisim: 'Kọ́ńpáàsì Ƙiblah. {cumle}',
    pusulaYok: 'Ẹ̀rọ yìí kò ní kọ́ńpáàsì; à ń fi ìhà náà hàn ní ìbámu pẹ̀lú àríwá.',
    kayiyorsa: 'Tí ìhà náà bá ń yẹ̀, ẹ fi fóònù yín ṣe àmì 8 nínú afẹ́fẹ́.',
    kamerayla: 'Wò ó pẹ̀lú kámẹ́rà',
  },
  kamera: {
    pusulayiKullanin: 'Lo kọ́ńpáàsì',
    kullanilamiyorBaslik: 'Ìfihàn kámẹ́rà kò sí lórí fóònù yìí',
    kullanilamiyorMetin:
      'Àwọn sẹ́ńsọ̀ fóònù yín kò fún ni ní ìhà tó ṣeé gbẹ́kẹ̀lé nígbà tí a bá dì í mú ní ìdúró. Kọ́ńpáàsì ṣì ń fi ìhà náà hàn dáadáa.',
    izinBaslik: 'Ẹ wo Ƙiblah pẹ̀lú kámẹ́rà yín',
    izinMetin:
      'Ẹ di fóònù yín mú ní ìdúró kí ẹ sì wò yíká; àmì Ka‘bah yóò hàn ní ìhà Ƙiblah. Èyí nílò àṣẹ kámẹ́rà; a kò ní gba àwòrán sílẹ̀, kò sì ní kúrò lórí fóònù yín láéláé.',
    kamerayiAcin: 'Tan kámẹ́rà',
    izinKapaliBaslik: 'Àṣẹ kámẹ́rà ti wà ní pípa',
    izinKapaliMetin: 'Ẹ lè gba kámẹ́rà láàyè nínú Ètò fún ìfihàn kámẹ́rà. Kọ́ńpáàsì ń ṣiṣẹ́ láìsí i.',
    ayarlariAcin: 'Ṣí Ètò',
    acilamadiBaslik: 'Kámẹ́rà kò lè ṣí',
    acilamadiMetin: 'Kámẹ́rà kò sí ní báyìí. Ẹ lè rí Ƙiblah pẹ̀lú kọ́ńpáàsì.',
    hesaplaniyor: 'À ń wá ìhà náà…',
    dikTutun: 'Ẹ di fóònù yín mú ní ìdúró',
  },
  kalibrasyon: {
    tesekkurErisim: 'Ẹ ṣé, ìhà náà ti péye sí i báyìí',
    tesekkur: 'Ẹ ṣé, ìhà náà ti péye sí i báyìí ✓',
    baslik: 'Ṣe àtúnṣe kọ́ńpáàsì',
    sallayin: 'Ẹ fi fóònù yín ṣe àmì 8 nínú afẹ́fẹ́.',
    metal: 'Ẹ jìnnà sí àwọn ohun irin àti àpò olóòfà.',
    dogruluk: 'Ìpéye',
    simdiDegil: 'Kì í ṣe báyìí',
  },
};
