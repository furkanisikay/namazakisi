import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Telefoonal',
    telefonAciklama: 'Subci alarm kee Tahajjudih ugussa sinni telefoonal xongolo yacee.',
    saatBaslik: 'Gaba saaqatal, xongolo malik',
    saatAciklama:
      'Sinni gaba sa ruqrusta, toysa sin cakkil xiinaa num ma ugutta. Gaba saaqatal ma alifinnaanik, sinni telefoon {dk} daqiiqa lakal xongolo yacee. Namaz Akışı sinni gaba saaqatal mali hinnay qusbisime wee tekkek, sinni telefoon saaku saaku {dk} daqiiqa raaqak xongolo yacee.',
    saatAciklamaIos:
      'Sinni gaba sa ruqrusta, toysa sin cakkil xiinaa num ma ugutta. Gaba saaqatal ma alifinnaanik, sinni iPhone {dk} daqiiqa lakal xongolo yacee.',
    ikisiBaslik: 'Nammayal',
    ikisiAciklama: 'Gaba saaqat kee telefoon ittal xongolo yacen; gaba saaqatal alifteenik telefoon kaadu xiqta.',
    ikisiAciklamaIos: 'Gaba saaqat kee iPhone ittal xongolo yacen; gaba saaqatal alifteenik iPhone kaadu xiqta.',
  },
  anons: {
    otomatikBaslik: 'Telefoonal, farakka tanek gaba saaqatal',
    otomatikAciklama:
      'Sinni telefoon sin luk tanek, sinni telefoon afak kawsa, gaba saaqat xiqta (namma aalat inki maxco ma kawsan). Sinni telefoon farakka tanek, gaba saaqat afak kawsa.',
    saatBaslik: 'Gaba saaqatal sa',
    saatAciklama:
      'Sinni gaba saaqat ayyu wakti afak kawsa, telefoon xiqta. Gaba saaqat baatri beytek, telefoon luk xagimte wee tekkek hinnay Namaz Akışı mali tekkek, tu ma kawsimtam; toh ma faxxinnaanik naharsi dooro taamita.',
    telefonBaslik: 'Telefoonal sa',
    telefonAciklama: 'Sinni gaba saaqat ayyu wakti ma yabta.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Namaz Akışı sinni Apple Watchal tan tekkek, sinni iPhone luk taama exxeexa. Ahal ugussa aytiyah xongolo yaceem arac doorita.',
    giris:
      'Namaz Akışı sinni gaba saaqatal tan tekkek, sinni telefoon luk taama exxeexa. Ahal ugussa xongolo yaceem arac kee afak kawsiyya yan arac doorita.',
    uyandirmaBaslik: 'Ugussa ayyiyal xongolo yacee?',
    uyandirmaNotu:
      'Ugussa usuk "Wakti gexam dumak" kassisiyyal Subcih fakteen diggah le alarm kee Sunnat salaatal fakteen Tahajjudih ugussa kinni.',
    uyandirmaNotuIos:
      'watchOS xongolo mali alarm gaba saaqatih app fakimuk sa hayisam duddu: ayro ayro inki adda Namaz Akışı gaba saaqatal faka, lakal tan ugussa toh waqdi hayisimta. Gaba saaqat baatri beytek hinnay app fakime wee tekkek, iPhonih dacrisiyya xongolo yacee.',
    uyandirmaNotuAndroid: 'Sinni gaba saaqat baatri beytek xongolo ma yacee; sinni telefoon xongolo yacee.',
    muhafizAyarlari: '"Wakti gexam dumak" massossiyya faka',
    nafileAyarlari: 'Sunnat salat massossiyya faka',
    bilektenBaslik: 'Sinni gabak abaanam duddan',
    bilektenIos: [
      'Sinni iPhone farakka tanek, kassisiyya sinni gaba saaqatal xongolo yacee; nammayal ma yacen.',
      'Abteen salat sinni gabak calaamisa; sinni iPhone tet dacrisa.',
      'Digital Crownat tasbiix loowitaanaah gaba saaqatal kiblat geytaanam duddan.',
    ],
    anonsBaslik: 'Afak kawsiyya ayyiyal yakke?',
    anonsNotu:
      'Afak kawsiyya faka le kassisiyya sa kawsimta. Namma aalat inki maxco ittal ma kawsan. Masgidil tanin waqdi hinnay Salat caala faka waqdi, gaba saaqat kaadu xiqta. Gaba saaqat xongolo yacee aalat, afak kawsiyya hinnay app afih xongolo mali tekkek, ruqrusta sa. Namaz Akışı gaba saaqat app addal "Xongolo mokkora" taamitak gaba saaqatih xongolo asaaku mokkoraanam duddan.',
    bilekten: [
      'Gaba saaqatih butunat Salat caala fakaanaah alifaanam duddan (salat wakti duddumam fanah, 30 daqiiqak dagom).',
      'Masgidil, sinni gaba saaqat caala ubulta; "Ama masgid hinna" kee "Masgidil tanaa?" sinni gabak gacisaanam duddan.',
      'Gaba saaqatal ma gexxa fooca (Qadaa kitaab, Masgidil an, massossiyya) "Telefoonal faka" luk sinni telefoonal fakta.',
    ],
    namazModuNotu: 'Gaba saaqatak Salat caala fakaanamkeh, naharat inki adda sinni telefoonal faka.',
    namazModuAyarlari: 'Salat caalah massossiyya faka',
  },
  sayfa: {
    akilliSaat: 'Gaba saaqat',
    appleWatchOzet: 'Ugussa xongolo yaceem arac',
    saatOzet: 'Ugussa xongolo yaceem kee afak kawsiyya yan arac',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Sinni loowiyya',
    geriSayim: 'Loowiyya',
    gelismisErisim: 'Kaxxa massossiyya. «Salat abe» calaamisa automation kee app',
    gelismis: 'Kaxxa massossiyya',
    otomasyonlar: 'Automation',
    otomasyonBaslik: 'Automation luk taamita',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: '«Salat abe» calaamisa app',
    kildimOzet: 'Idni acuwteen app',
  },
};
