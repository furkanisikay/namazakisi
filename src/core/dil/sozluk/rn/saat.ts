import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Kuri terefone',
    telefonAciklama: 'Inzogera ya Fajri n’ukuvyura kwa Tahajudi bisona kuri terefone yanyu.',
    saatBaslik: 'Ku isaha, mu bucece',
    saatAciklama:
      'Ukuboko kwanyu konyene ni ko gutigita, ku buryo uwo muryamanye atavyuka. Nimutayihagarika ku isaha, terefone yanyu irasona haciye iminota {dk} nk’ingoboka. Nimba Namaz Akışı itari ku isaha yanyu canke itavuguruwe, terefone yanyu irasona itevye iminota {dk} buri gitondo.',
    saatAciklamaIos:
      'Ukuboko kwanyu konyene ni ko gutigita, ku buryo uwo muryamanye atavyuka. Nimutayihagarika ku isaha, iPhone yanyu irasona haciye iminota {dk} nk’ingoboka.',
    ikisiBaslik: 'Kuri vyompi',
    ikisiAciklama: 'Isaha na terefone bisona hamwe; kuyihagarika ku isaha bicecekesha na terefone.',
    ikisiAciklamaIos: 'Isaha na iPhone bisona hamwe; kuyihagarika ku isaha bicecekesha na iPhone.',
  },
  anons: {
    otomatikBaslik: 'Kuri terefone, ku isaha iyo terefone iri kure',
    otomatikAciklama:
      'Iyo terefone yanyu iri kumwe namwe, terefone ni yo isoma n’ijwi, isaha igaceceka nkana (kugira ngo ibikoresho vyompi ntibisome interuro imwe). Iyo terefone iri kure, isaha yanyu ni yo isoma n’ijwi.',
    saatBaslik: 'Ku isaha gusa',
    saatAciklama:
      'Isaha yanyu hama isoma n’ijwi, terefone igaceceka. Igihe isaha iriko irashirwamwo umuyagankuba, itafatanye na terefone canke itarimwo Namaz Akışı, nta kintu gisomwa n’ijwi; nimba mutabishaka, mukoreshe ihitamwo rya mbere.',
    telefonBaslik: 'Kuri terefone gusa',
    telefonAciklama: 'Isaha yanyu ntivuga na rimwe.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Nimba Namaz Akışı iri kuri Apple Watch yanyu, isangira akazi na iPhone yanyu. Ngaha muhitamwo aho ukuvyura gusona.',
    giris:
      'Nimba Namaz Akışı iri ku isaha yanyu, isangira akazi na terefone yanyu. Ngaha muhitamwo aho ukuvyura gusona n’aho inyibutsa zisomwa n’ijwi.',
    uyandirmaBaslik: 'Ukuvyura gusone hehe?',
    uyandirmaNotu:
      'Ukuvyura ni inzogera nyayo mufungura kuri Fajri mu nyibutsa ”Imbere y’impera y’igihe” n’ukuvyura kwa Tahajudi mufungura mu Masengesho y’inyongera.',
    uyandirmaNotuIos:
      'watchOS ishobora gushiraho inzogera y’ubucece gusa iyo porogarama y’isaha yuguruye: mwugurure Namaz Akışı ku isaha yanyu rimwe ku musi, ukuvyura gukurikira kugashirwaho ico gihe. Igihe isaha iriko irashirwamwo umuyagankuba canke porogarama ituguruwe, ingoboka ya iPhone yanyu irasona.',
    uyandirmaNotuAndroid: 'Isaha yanyu ntisona igihe iriko irashirwamwo umuyagankuba; terefone yanyu ni yo isona.',
    muhafizAyarlari: 'Mwugurure amahitamwo ya ”Imbere y’impera y’igihe”',
    nafileAyarlari: 'Mwugurure amahitamwo y’Amasengesho y’inyongera',
    bilektenBaslik: 'Ivyo mushobora gukora ku kuboko',
    bilektenIos: [
      'Iyo iPhone yanyu iri kure, inyibutsa zisona ku isaha yanyu; ntizisona kuri vyompi.',
      'Mwemereza ku kuboko amasengesho mwasenze; iPhone yanyu irayandika.',
      'Muharura tasbih na Digital Crown kandi murabona ubutumbero ku isaha yanyu.',
    ],
    anonsBaslik: 'Gusoma n’ijwi bibe hehe?',
    anonsNotu:
      'Inyibutsa zifise gusoma n’ijwi gufunguye ni zo zonyene zisomwa. Ibikoresho bibiri ntibisoma interuro imwe hamwe. Isaha yanyu iraceceka kandi iyo muri ku musigiti canke Uburyo bw’isengesho bukora. Nimba isaha yanyu idafise indangururamajwi, porogarama yo gusoma inyandiko canke ijwi ry’ururimi rwa porogarama, iratigita gusa. Murashobora kugerageza ijwi ry’isaha ubwo nyene na ”Mugerageze ijwi” muri porogarama y’isaha ya Namaz Akışı.',
    bilekten: [
      'Murashobora gufungura no kuzimya Uburyo bw’isengesho n’akabuto k’isaha (gushika igihe c’isengesho kirangiye, iminota 30 ntarengwa).',
      'Ku musigiti, isaha yanyu yerekana uko bimeze; mwishura ”Aha si umusigiti” na ”Muri ku musigiti?” ku kuboko.',
      'Ibice bidakwiye ku isaha (Igitabo ca Qadha, Ndi ku musigiti, amahitamwo) vyuguruka kuri terefone na ”Mwugurure kuri terefone”.',
    ],
    namazModuNotu: 'Kugira mufungure Uburyo bw’isengesho ku isaha, mubanze kubufungura rimwe kuri terefone yanyu.',
    namazModuAyarlari: 'Mwugurure amahitamwo y’Uburyo bw’isengesho',
  },
  sayfa: {
    akilliSaat: 'Isaha y’ubwenge',
    appleWatchOzet: 'Aho ukuvyura gusona',
    saatOzet: 'Aho ukuvyura gusona n’aho gusoma n’ijwi biba',
    canliEtkinlikler: 'Ibikorwa vy’ako kanya',
    canliSayaclar: 'Ibihe bisigaye vy’ako kanya',
    geriSayim: 'Igihe gisigaye',
    gelismisErisim: 'Ivyisumbuye. Ibikorwa vyikora n’izindi porogarama zemeza ”Nasenze”',
    gelismis: 'Ivyisumbuye',
    otomasyonlar: 'Ibikorwa vyikora',
    otomasyonBaslik: 'Mukoreshe n’ibikorwa vyikora',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Porogarama zemeza ”Nasenze”',
    kildimOzet: 'Porogarama mwemereye',
  },
};
