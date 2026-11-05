import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Kuri telefoni',
    telefonAciklama: 'Alarume ya Fajri n’iyo gukangurirwa Tahajudi bisona kuri telefoni yanyu.',
    saatBaslik: 'Ku isaha, bucece',
    saatAciklama:
      'Ukuboko kwanyu konyine ni ko kunyeganyega, bityo uryamye iruhande rwanyu ntakanguka. Nimutayihagarika ku isaha, telefoni yanyu isona nk’igisigura nyuma y’iminota {dk}. Niba Namaz Akışı itari ku isaha yanyu cyangwa ishaje, telefoni yanyu isona itinze iminota {dk} buri gitondo.',
    saatAciklamaIos:
      'Ukuboko kwanyu konyine ni ko kunyeganyega, bityo uryamye iruhande rwanyu ntakanguka. Nimutayihagarika ku isaha, iPhone yanyu isona nk’igisigura nyuma y’iminota {dk}.',
    ikisiBaslik: 'Kuri byombi',
    ikisiAciklama: 'Isaha na telefoni bisonera icyarimwe; kuyihagarika ku isaha bicecekesha na telefoni.',
    ikisiAciklamaIos: 'Isaha na iPhone bisonera icyarimwe; kuyihagarika ku isaha bicecekesha na iPhone.',
  },
  anons: {
    otomatikBaslik: 'Kuri telefoni, ku isaha iyo iri kure',
    otomatikAciklama:
      'Iyo telefoni yanyu muri kumwe, telefoni ni yo isoma mu ijwi kandi isaha igaceceka nkana (kugira ngo ibikoresho byombi bidasoma interuro imwe). Iyo telefoni iri kure, isaha ni yo isoma mu ijwi.',
    saatBaslik: 'Ku isaha gusa',
    saatAciklama:
      'Isaha yanyu ihora isoma mu ijwi kandi telefoni igaceceka. Igihe isaha iri ku muriro, idahujwe na telefoni cyangwa idafite Namaz Akışı, nta gisomwa mu ijwi; nimutabishaka, mukoreshe ihitamo rya mbere.',
    telefonBaslik: 'Kuri telefoni gusa',
    telefonAciklama: 'Isaha yanyu ntivuga na rimwe.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Niba Namaz Akışı iri kuri Apple Watch yanyu, isangira imirimo na iPhone yanyu. Hano muhitamo aho gukangura bisonera.',
    giris:
      'Niba Namaz Akışı iri ku isaha yanyu, isangira imirimo na telefoni yanyu. Hano muhitamo aho gukangura bisonera n’aho amatangazo asomerwa mu ijwi.',
    uyandirmaBaslik: 'Gukangura bisonere he?',
    uyandirmaNotu:
      'Gukangura ni alarume nyayo mufungura kuri Fajri mu cyibutsa cya «Mbere y’uko igihe kirangira» n’iyo gukangurirwa Tahajudi mufungura muri Iswala z’inyongera.',
    uyandirmaNotuIos:
      'watchOS ishobora gushyiraho alarume ituje gusa igihe porogaramu y’isaha ifunguye: mufungure Namaz Akışı ku isaha yanyu rimwe ku munsi maze gukangura gukurikira gushyirweho icyo gihe. Igihe isaha iri ku muriro cyangwa porogaramu itafunguwe, igisigura cya iPhone yanyu ni cyo gisona.',
    uyandirmaNotuAndroid: 'Isaha yanyu ntisona iri ku muriro; telefoni yanyu ni yo isona mu mwanya wayo.',
    muhafizAyarlari: 'Gufungura igenamiterere rya «Mbere y’uko igihe kirangira»',
    nafileAyarlari: 'Gufungura igenamiterere ry’iswala z’inyongera',
    bilektenBaslik: 'Ibyo mushobora gukora ku kuboko',
    bilektenIos: [
      'Iyo iPhone yanyu iri kure, ibyibutsa bivugira ku isaha yanyu; ntibivugira kuri byombi.',
      'Mwemeza iswala mwasali muhereye ku kuboko kwanyu; iPhone yanyu irazandika.',
      'Mubara tasbih mukoresheje Digital Crown kandi mukabona Qibla ku isaha yanyu.',
    ],
    anonsBaslik: 'Gusoma mu ijwi bibere he?',
    anonsNotu:
      'Hasomwa gusa ibyibutsa bifunguyeho gusoma mu ijwi. Ibikoresho byombi ntibisoma interuro imwe icyarimwe. Isaha yanyu nayo iraceceka igihe muri ku musigiti cyangwa Uburyo bw’iswala bufunguye. Niba isaha yanyu idafite indangururamajwi, porogaramu yo gusoma cyangwa ijwi ry’ururimi rwa porogaramu, iranyeganyega gusa. Mushobora kugerageza ijwi ry’isaha ako kanya muciye kuri «Kugerageza ijwi» muri porogaramu ya Namaz Akışı y’isaha.',
    bilekten: [
      'Mushobora gufungura no gufunga Uburyo bw’iswala mukoresheje buto iri ku isaha (kugeza igihe cy’iswala kirangiye, bitarenze iminota 30).',
      'Ku musigiti, isaha yanyu igaragaza uko bimeze; musubiza «Aha si umusigiti» na «Muri ku musigiti?» muhereye ku kuboko.',
      'Impapuro zidakwirwa ku isaha (Igitabo cyo kwishyura, Ndi ku musigiti, igenamiterere) zifungukira kuri telefoni yanyu na «Gufungura kuri telefoni».',
    ],
    namazModuNotu: 'Kugira ngo mufungure Uburyo bw’iswala ku isaha, mubanze mubufungure rimwe kuri telefoni yanyu.',
    namazModuAyarlari: 'Gufungura igenamiterere ry’Uburyo bw’iswala',
  },
  sayfa: {
    akilliSaat: 'Isaha y’ubwenge',
    appleWatchOzet: 'Aho gukangura bisonera',
    saatOzet: 'Aho gukangura bisonera n’aho bisomera mu ijwi',
    canliEtkinlikler: 'Ibikorwa bizima',
    canliSayaclar: 'Igihe gisigaye kizima',
    geriSayim: 'Kubara igihe gisigaye',
    gelismisErisim: 'Byimbitse. Ibikorwa byikora na porogaramu zemeza Nasali',
    gelismis: 'Byimbitse',
    otomasyonlar: 'Ibikorwa byikora',
    otomasyonBaslik: 'Gukoresha mu bikorwa byikora',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Porogaramu zemeza Nasali',
    kildimOzet: 'Porogaramu mwemereye',
  },
};
