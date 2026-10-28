import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Në telefon',
    telefonAciklama: 'Alarmi i sabahut dhe zgjimi për tehexhud bien në telefonin tuaj.',
    saatBaslik: 'Në orë, në heshtje',
    saatAciklama:
      'Dridhet vetëm kyçi i dorës suaj, kush fle pranë jush nuk zgjohet. Nëse nuk e fikni në orë, telefoni bie si rezervë pas {dk} minutash. Nëse Namaz Akışı nuk është në orën tuaj ose nuk është i përditësuar, telefoni bie çdo mëngjes {dk} minuta më vonë.',
    saatAciklamaIos:
      'Dridhet vetëm kyçi i dorës suaj, kush fle pranë jush nuk zgjohet. Nëse nuk e fikni në orë, iPhone-i bie si rezervë pas {dk} minutash.',
    ikisiBaslik: 'Në të dyja',
    ikisiAciklama: 'Ora dhe telefoni bien njëkohësisht; kur e fikni në orë, heshtet edhe telefoni.',
    ikisiAciklamaIos: 'Ora dhe iPhone-i bien njëkohësisht; kur e fikni në orë, heshtet edhe iPhone-i.',
  },
  anons: {
    otomatikBaslik: 'Në telefon; në orë kur telefoni është larg',
    otomatikAciklama:
      'Kur telefoni është pranë jush, lexon telefoni dhe ora qëllimisht nuk flet (që dy pajisjet të mos lexojnë të njëjtën fjali). Kur telefoni është larg, lexon ora.',
    saatBaslik: 'Vetëm në orë',
    saatAciklama:
      'Leximin me zë e bën gjithmonë ora, telefoni nuk flet. Kur ora karikohet, nuk është e lidhur me telefonin ose nuk ka Namaz Akışı, leximi nuk dëgjohet fare; nëse nuk e dëshironi këtë, përdorni opsionin e parë.',
    telefonBaslik: 'Vetëm në telefon',
    telefonAciklama: 'Ora nuk flet kurrë.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos: 'Nëse Namaz Akışı është i instaluar në Apple Watch, i ndan punët me iPhone-in. Këtu zgjidhni ku bie zgjimi.',
    giris:
      'Nëse Namaz Akışı është i instaluar në orën tuaj, i ndan punët me telefonin. Këtu zgjidhni ku bie zgjimi dhe ku dëgjohet leximi me zë.',
    uyandirmaBaslik: 'Ku të bjerë zgjimi?',
    uyandirmaNotu:
      'Zgjimi është alarmi i vërtetë që aktivizoni për sabahun te kujtesa "Para se të dalë koha" dhe zgjimi për tehexhud që aktivizoni te Namazet nafile.',
    uyandirmaNotuIos:
      'watchOS mund ta vendosë alarmin e heshtur vetëm kur aplikacioni i orës është i hapur: hapeni Namaz Akışı në orë një herë në ditë dhe zgjimi i radhës vendoset atëherë. Kur ora karikohet ose aplikacioni nuk është hapur, bie rezerva e iPhone-it.',
    uyandirmaNotuAndroid: 'Ora nuk bie kur karikohet; atëherë bie telefoni.',
    muhafizAyarlari: 'Hapni cilësimet "Para se të dalë koha"',
    nafileAyarlari: 'Hapni cilësimet e namazeve nafile',
    bilektenBaslik: 'Çfarë mund të bëni nga kyçi i dorës',
    bilektenIos: [
      'Kur iPhone-i është larg, kujtesat bien në orë; nuk bien në të dyja.',
      'Namazin që falët e shënoni nga kyçi i dorës; iPhone-i e regjistron.',
      'Tesbihatin e numëroni me Digital Crown dhe kiblen e gjeni në orë.',
    ],
    anonsBaslik: 'Ku të bëhet leximi me zë?',
    anonsNotu:
      'Lexohen vetëm kujtesat me lexim me zë të aktivizuar. Dy pajisjet nuk e lexojnë njëkohësisht të njëjtën fjali. Kur jeni në xhami ose kur Modaliteti i namazit është aktiv, edhe ora hesht. Nëse ora nuk ka altoparlant, motor leximi teksti ose zë në gjuhën e aplikacionit, ajo vetëm dridhet. Zërin e orës mund ta provoni menjëherë me "Provoni zërin" në aplikacionin Namaz Akışı të orës.',
    bilekten: [
      'Modalitetin e namazit mund ta aktivizoni dhe çaktivizoni me butonin në orë (deri në fund të vaktit, më së shumti 30 minuta).',
      'Në xhami ora tregon gjendjen; pyetjeve "Këtu nuk është xhami" dhe "A jeni në xhami?" u përgjigjeni nga kyçi i dorës.',
      'Ekranet që nuk nxënë në orë (Regjistri i kazave, Në xhami, cilësimet) i hapni në telefon me "Hapeni në telefon".',
    ],
    namazModuNotu: 'Për ta aktivizuar Modalitetin e namazit nga ora, aktivizojeni fillimisht një herë në telefon.',
    namazModuAyarlari: 'Hapni cilësimet e Modalitetit të namazit',
  },
  sayfa: {
    akilliSaat: 'Ora inteligjente',
    appleWatchOzet: 'Ku bie zgjimi',
    saatOzet: 'Ku bie zgjimi dhe ku bëhet leximi me zë',
    canliEtkinlikler: 'Aktivitetet e drejtpërdrejta',
    canliSayaclar: 'Numërimet e drejtpërdrejta',
    geriSayim: 'Numërimi mbrapsht',
    gelismisErisim: 'Të avancuara. Automatizimet dhe aplikacionet që shënojnë "E fala"',
    gelismis: 'Të avancuara',
    otomasyonlar: 'Automatizimet',
    otomasyonBaslik: 'Përdoreni me automatizime',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Aplikacionet që shënojnë "E fala"',
    kildimOzet: 'Aplikacionet që keni lejuar',
  },
};
