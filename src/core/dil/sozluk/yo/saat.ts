import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Lórí fóònù',
    telefonAciklama: 'Aago ìdágìrì Subh àti ìjíǹde Tahajjud ń dún lórí fóònù yín.',
    saatBaslik: 'Lórí aago ọwọ́, láìsí ariwo',
    saatAciklama:
      'Ọrùn ọwọ́ yín nìkan ni yóò gbọ̀n, kí ẹni tó sùn lẹ́gbẹ̀ẹ́ yín má baà jí. Tí ẹ kò bá pa á lórí aago ọwọ́, fóònù yín yóò dún gẹ́gẹ́ bí àfidípò lẹ́yìn ìṣẹ́jú {dk}. Tí Namaz Akışı kò bá sí lórí aago ọwọ́ yín tàbí tí kò bá jẹ́ ẹ̀dà tuntun, fóònù yín yóò máa pẹ́ ní ìṣẹ́jú {dk} ní àràárọ̀.',
    saatAciklamaIos:
      'Ọrùn ọwọ́ yín nìkan ni yóò gbọ̀n, kí ẹni tó sùn lẹ́gbẹ̀ẹ́ yín má baà jí. Tí ẹ kò bá pa á lórí aago ọwọ́, iPhone yín yóò dún gẹ́gẹ́ bí àfidípò lẹ́yìn ìṣẹ́jú {dk}.',
    ikisiBaslik: 'Lórí méjèèjì',
    ikisiAciklama: 'Aago ọwọ́ àti fóònù ń dún pọ̀; pípa á lórí aago ọwọ́ yóò pa fóònù lẹ́nu mọ́ pẹ̀lú.',
    ikisiAciklamaIos: 'Aago ọwọ́ àti iPhone ń dún pọ̀; pípa á lórí aago ọwọ́ yóò pa iPhone lẹ́nu mọ́ pẹ̀lú.',
  },
  anons: {
    otomatikBaslik: 'Lórí fóònù, lórí aago ọwọ́ nígbà tí fóònù bá jìnnà',
    otomatikAciklama:
      'Nígbà tí fóònù yín bá wà lọ́dọ̀ yín, fóònù ni yóò kà á sókè, aago ọwọ́ yín yóò sì dákẹ́ mọ̀ọ́mọ̀ (kí ẹ̀rọ méjèèjì má baà ka gbólóhùn kan náà). Nígbà tí fóònù yín bá jìnnà, aago ọwọ́ yín ni yóò kà á sókè.',
    saatBaslik: 'Lórí aago ọwọ́ nìkan',
    saatAciklama:
      'Aago ọwọ́ yín ni yóò máa kà á sókè nígbà gbogbo, fóònù yín yóò sì dákẹ́. Nígbà tí aago ọwọ́ yín bá ń gba agbára, tí kò so mọ́ fóònù yín tàbí tí kò ní Namaz Akışı, a kò ní ka nǹkankan sókè; tí ẹ kò bá fẹ́ èyí, ẹ lo àṣàyàn àkọ́kọ́.',
    telefonBaslik: 'Lórí fóònù nìkan',
    telefonAciklama: 'Aago ọwọ́ yín kì í sọ̀rọ̀ láéláé.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Tí Namaz Akışı bá wà lórí Apple Watch yín, yóò pín iṣẹ́ pẹ̀lú iPhone yín. Níbí ni ẹ ti ń yan ibi tí ìjíǹde yóò ti dún.',
    giris:
      'Tí Namaz Akışı bá wà lórí aago ọwọ́ yín, yóò pín iṣẹ́ pẹ̀lú fóònù yín. Níbí ni ẹ ti ń yan ibi tí ìjíǹde yóò ti dún àti ibi tí a ó ti ka ìkéde sókè.',
    uyandirmaBaslik: 'Níbo ni kí ìjíǹde ti dún?',
    uyandirmaNotu:
      'Ìjíǹde ni aago ìdágìrì gidi tí ẹ tàn fún Subh nínú ìránnilétí "Kí àkókò tó parí" àti ìjíǹde Tahajjud tí ẹ tàn nínú Ìrun àṣegbọrẹ.',
    uyandirmaNotuIos:
      'watchOS lè ṣètò aago ìdágìrì aláìláriwo kìkì nígbà tí ìṣàfilọ́lẹ̀ aago ọwọ́ bá ṣí: ẹ ṣí Namaz Akışı lórí aago ọwọ́ yín lẹ́ẹ̀kan lójúmọ́, a ó sì ṣètò ìjíǹde tó kàn nígbà náà. Nígbà tí aago ọwọ́ bá ń gba agbára tàbí tí a kò ṣí ìṣàfilọ́lẹ̀, àfidípò iPhone yín ni yóò dún.',
    uyandirmaNotuAndroid: 'Aago ọwọ́ yín kì í dún nígbà tí ó bá ń gba agbára; fóònù yín ni yóò dún dípò rẹ̀.',
    muhafizAyarlari: 'Ṣí ètò "Kí àkókò tó parí"',
    nafileAyarlari: 'Ṣí ètò Ìrun àṣegbọrẹ',
    bilektenBaslik: 'Ohun tí ẹ lè ṣe láti ọrùn ọwọ́ yín',
    bilektenIos: [
      'Nígbà tí iPhone yín bá jìnnà, àwọn ìránnilétí ń dún lórí aago ọwọ́ yín; wọn kì í dún lórí méjèèjì.',
      'Ẹ ń sàmì sí àwọn ìrun tí ẹ ti kí láti ọrùn ọwọ́ yín; iPhone yín ni yóò kọ wọ́n sílẹ̀.',
      'Ẹ ń ka tasbīḥ pẹ̀lú Digital Crown, ẹ sì ń rí Ƙiblah lórí aago ọwọ́ yín.',
    ],
    anonsBaslik: 'Níbo ni kí kíkà sókè ti wáyé?',
    anonsNotu:
      'Àwọn ìránnilétí tí kíkà sókè wà ní títàn nìkan ni a ń kà. Ẹ̀rọ méjèèjì kì í ka gbólóhùn kan náà pọ̀. Aago ọwọ́ yín yóò tún dákẹ́ nígbà tí ẹ bá wà ní mọ́sálásí tàbí tí Ipò ìrun bá wà ní títàn. Tí aago ọwọ́ yín kò bá ní agbọ́hùnsáfẹ́fẹ́, ẹ̀rọ kíkà sókè tàbí ohùn ní èdè ìṣàfilọ́lẹ̀, yóò kàn gbọ̀n ni. Ẹ lè dán ohùn aago ọwọ́ wò lẹ́sẹ̀kẹsẹ̀ pẹ̀lú "Dán ohùn wò" nínú ìṣàfilọ́lẹ̀ aago ọwọ́ Namaz Akışı.',
    bilekten: [
      'Ẹ lè tan Ipò ìrun kí ẹ sì pa á pẹ̀lú bọ́tìnnì lórí aago ọwọ́ (títí di òpin àkókò ìrun, ìṣẹ́jú 30 ní púpọ̀ jùlọ).',
      'Ní mọ́sálásí, aago ọwọ́ yín ń fi ipò hàn; ẹ ń dáhùn "Èyí kì í ṣe mọ́sálásí" àti "Ṣé ẹ wà ní mọ́sálásí?" láti ọrùn ọwọ́ yín.',
      'Àwọn ojú-ìwé tí kò bá aago ọwọ́ mu (Àkọsílẹ̀ Ƙaḍā’, Ní mọ́sálásí, ètò) ń ṣí lórí fóònù yín pẹ̀lú "Ṣí i lórí fóònù".',
    ],
    namazModuNotu: 'Láti tan Ipò ìrun láti aago ọwọ́, ẹ kọ́kọ́ tàn án lẹ́ẹ̀kan lórí fóònù yín.',
    namazModuAyarlari: 'Ṣí ètò Ipò ìrun',
  },
  sayfa: {
    akilliSaat: 'Aago ọwọ́ olóye',
    appleWatchOzet: 'Ibi tí ìjíǹde ti ń dún',
    saatOzet: 'Ibi tí ìjíǹde ti ń dún àti ibi tí a ti ń kà á sókè',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Ìkàsẹ̀yìn láàyè',
    geriSayim: 'Ìkàsẹ̀yìn',
    gelismisErisim: 'Ìlọsíwájú. Àwọn ìṣe aládàáṣe àti ìṣàfilọ́lẹ̀ tí ń sàmì sí Mo ti kírun',
    gelismis: 'Ìlọsíwájú',
    otomasyonlar: 'Àwọn ìṣe aládàáṣe',
    otomasyonBaslik: 'Lò ó pẹ̀lú ìṣe aládàáṣe',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Àwọn ìṣàfilọ́lẹ̀ tí ń sàmì sí Mo ti kírun',
    kildimOzet: 'Àwọn ìṣàfilọ́lẹ̀ tí ẹ ti gbà láàyè',
  },
};
