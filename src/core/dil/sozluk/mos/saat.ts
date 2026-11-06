import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Telefõnã zugu',
    telefonAciklama: 'Fagir alaarmã la Tahajjud yikrã wiida y telefõnã zugu.',
    saatBaslik: 'Nug-lɛɛrã zugu, sẽn ka koɛɛg',
    saatAciklama:
      'Y nugã bal n yẽgsdẽ, rẽ n so tɩ ned ning sẽn gãe y sɛɛgẽ pa yikd ye. Y sã n pa pag-a nug-lɛɛrã zugu ye, y telefõnã na n wiig {dk} minit poorẽ. Namaz Akışı sã n ka be y nug-lɛɛrã zugu maa a pa paalg ye, y telefõnã na n wiig {dk} minit poorẽ yibeoog fãa.',
    saatAciklamaIos:
      'Y nugã bal n yẽgsdẽ, rẽ n so tɩ ned ning sẽn gãe y sɛɛgẽ pa yikd ye. Y sã n pa pag-a nug-lɛɛrã zugu ye, y iPhone wã na n wiig {dk} minit poorẽ.',
    ikisiBaslik: 'A yiibã fãa zugu',
    ikisiAciklama: 'Nug-lɛɛrã la telefõnã wiida naoor a ye; y sã n pag-a nug-lɛɛrã zugu, telefõnã me pagda.',
    ikisiAciklamaIos: 'Nug-lɛɛrã la iPhone wã wiida naoor a ye; y sã n pag-a nug-lɛɛrã zugu, iPhone wã me pagda.',
  },
  anons: {
    otomatikBaslik: 'Telefõnã zugu, nug-lɛɛrã zugu telefõnã sã n zãrga',
    otomatikAciklama:
      'Y telefõnã sã n be ne yãmba, y telefõnã karemda ne koɛɛgo la y nug-lɛɛrã pa gomd ye (tɩ masĩn a yiibã ra karem gom-bil a ye ye). Y telefõnã sã n zãrga, y nug-lɛɛrã karemda ne koɛɛgo.',
    saatBaslik: 'Nug-lɛɛrã zugu bala',
    saatAciklama:
      'Y nug-lɛɛrã karemda ne koɛɛg wakat fãa la y telefõnã pa gomd ye. Y nug-lɛɛrã sã n be batiri kẽesgo, sã n pa lagem ne y telefõnã ye maa sã n ka tar Namaz Akışı ye, b pa karemd baa fʋɩ ye; y sã n pa dat woto ye, tũus-y sẽn deng pĩndã.',
    telefonBaslik: 'Telefõnã zugu bala',
    telefonAciklama: 'Y nug-lɛɛrã pa gomd wakat baa a ye ye.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Namaz Akışı sã n be y Apple Watch zugu, a ne y iPhone wã bʋɩta tʋʋmdã. Ka, y tũusda zĩig ning yikrã sẽn na n wiigdẽ.',
    giris:
      'Namaz Akışı sã n be y nug-lɛɛrã zugu, a ne y telefõnã bʋɩta tʋʋmdã. Ka, y tũusda zĩig ning yikrã sẽn na n wiigdẽ, la zĩig ning b sẽn na n karem ne koɛɛgo.',
    uyandirmaBaslik: 'Yikrã wiig yɛ?',
    uyandirmaNotu:
      'Yikrã yaa alaarm sɩd-sɩd ning y sẽn pakd Fagir yĩnga "Wakatã baasg taoore" tẽegrã pʋgẽ, la Tahajjud yikr ning y sẽn pakd Naafɩla pʋʋs-rãmbã pʋgẽ.',
    uyandirmaNotuIos:
      'watchOS tõe n segl alaarm sẽn ka tar koɛɛg nug-lɛɛrã aplikaasõ wã sã n pakame bala: pak-y Namaz Akışı y nug-lɛɛrã zugu noor a ye raar fãa, la yikr ning sẽn pʋgdẽ na n segl wakat-kãngã. Nug-lɛɛrã sã n be batiri kẽesgo maa y sã n pa pak aplikaasõ wã ye, y iPhone wã na n wiig.',
    uyandirmaNotuAndroid: 'Y nug-lɛɛrã pa wiid a sã n be batiri kẽesgo ye; y telefõnã n wiida.',
    muhafizAyarlari: 'Pak-y "Wakatã baasg taoore" seglgã',
    nafileAyarlari: 'Pak-y Naafɩla pʋʋsg seglgã',
    bilektenBaslik: 'Y sẽn tõe n maan ne y nug-lɛɛrã',
    bilektenIos: [
      'Y iPhone wã sã n zãrga, tẽegrã wiida y nug-lɛɛrã zugu; b pa wiid a yiibã fãa zugu ye.',
      'Y gʋlsda pʋʋs-rãmb nins y sẽn pʋʋsa ne y nug-lɛɛrã; y iPhone wã bĩngda-b.',
      'Y sõdda tasbiiha ne Digital Crown la y baoda Kiblã y nug-lɛɛrã zugu.',
    ],
    anonsBaslik: 'Karengo ne koɛɛg yɛ?',
    anonsNotu:
      'Tẽegr nins b sẽn pak karengo ne koɛɛg bala la b karemda. Masĩn a yiibã pa karemd gom-bil a ye naoor a ye ye. Y nug-lɛɛrã me pa gomd y sã n be miisrẽ maa Pʋʋsg mood sã n pakame ye. Y nug-lɛɛrã sã n ka tar koɛɛg-yiisg, karengo masĩn maa koɛɛg aplikaasõ wã goamẽ ye, a yẽgsda bala. Y tõe n mak nug-lɛɛrã koɛɛgã masã ne "Mak-y koɛɛgã" Namaz Akışı nug-lɛɛr aplikaasõ wã pʋgẽ.',
    bilekten: [
      'Y tõe n pak la y pag Pʋʋsg mood ne nug-lɛɛrã bʋtõ wã (n tãag pʋʋsg wakatã baasgo, minit 30 sẽn yɩɩd fãa).',
      'Miisrẽ, y nug-lɛɛrã wilgda yɛlã; y lebgda "Ka-kãng pa miisr ye" la "Y bee miisrẽ?" ne y nug-lɛɛrã.',
      'Ekraan nins sẽn pa sek nug-lɛɛrã zugu ye (Rolb sebre, M be miisrẽ, seglgo) pakda y telefõnã zugu ne "Pak-y telefõnã zugu".',
    ],
    namazModuNotu: 'Y sẽn na n pak Pʋʋsg mood nug-lɛɛrã zugu, pak-y-a pĩnd y telefõnã zugu noor a ye.',
    namazModuAyarlari: 'Pak-y Pʋʋsg mood seglgã',
  },
  sayfa: {
    akilliSaat: 'Nug-lɛɛre',
    appleWatchOzet: 'Zĩig ning yikrã sẽn wiigdẽ',
    saatOzet: 'Zĩig ning yikrã sẽn wiigd la b sẽn karemd ne koɛɛgo',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Sõdg sẽn vɩɩme',
    geriSayim: 'Sõdg n lebsd poorẽ',
    gelismisErisim: 'Sẽn zĩnd taoore. Automation la aplikaasõ nins sẽn gʋlsd M pʋʋsa',
    gelismis: 'Sẽn zĩnd taoore',
    otomasyonlar: 'Automation',
    otomasyonBaslik: 'Tũ-y ne automation',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Aplikaasõ nins sẽn gʋlsd M pʋʋsa',
    kildimOzet: 'Aplikaasõ nins y sẽn kõ sore',
  },
};
