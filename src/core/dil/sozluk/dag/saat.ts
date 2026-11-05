import type { Sozluk } from '../tr';

/** Saat "wɔɔchi" (İngilizce kökenli, türetildi); Namaz modu "Jiŋli soli", Camideyim "N be jiŋli ni". */
export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Tilifoŋ zuɣu',
    telefonAciklama: 'Subaahi alaam mini Tahajud yiɣisibu kumdi yi tilifoŋ zuɣu.',
    saatBaslik: 'Wɔɔchi zuɣu, ka kukoli kani',
    saatAciklama:
      'Yi nuu koŋko n-nyɛɣisiri, dinzuɣu ŋun gbihiri yi sani bi yiɣisiri. Yi yi bi kpihi li wɔɔchi zuɣu, yi tilifoŋ ni kum minti {dk} nyaaŋa. Namaz Akışı yi ka yi wɔɔchi zuɣu bee di bi palli, yi tilifoŋ ni kum minti {dk} nyaaŋa asiba kam.',
    saatAciklamaIos:
      'Yi nuu koŋko n-nyɛɣisiri, dinzuɣu ŋun gbihiri yi sani bi yiɣisiri. Yi yi bi kpihi li wɔɔchi zuɣu, yi iPhone ni kum minti {dk} nyaaŋa.',
    ikisiBaslik: 'Di ayi zaa zuɣu',
    ikisiAciklama: 'Wɔɔchi mini tilifoŋ kumdi taba; yi yi kpihi li wɔɔchi zuɣu, tilifoŋ gba ni kpihi.',
    ikisiAciklamaIos: 'Wɔɔchi mini iPhone kumdi taba; yi yi kpihi li wɔɔchi zuɣu, iPhone gba ni kpihi.',
  },
  anons: {
    otomatikBaslik: 'Tilifoŋ zuɣu, wɔɔchi zuɣu tilifoŋ yi zooi',
    otomatikAciklama:
      'Yi tilifoŋ yi be yi sani, tilifoŋ n-karindi li ni kukoli ka yi wɔɔchi bi yɛliri shɛli (ka kpatuɣa ayi maa ku karim yɛtɔɣa yini maa). Yi tilifoŋ yi zooi, yi wɔɔchi n-karindi li ni kukoli.',
    saatBaslik: 'Wɔɔchi zuɣu koŋko',
    saatAciklama:
      'Yi wɔɔchi karindi li ni kukoli saha kam ka yi tilifoŋ bi yɛliri shɛli. Yi wɔɔchi yi deeri chaaji, bi laɣim ni yi tilifoŋ bee ka Namaz Akışı, bɛ bi karindi shɛli ni kukoli; yi yi bi bɔri lala, zaŋmi ya soli din daŋ maa.',
    telefonBaslik: 'Tilifoŋ zuɣu koŋko',
    telefonAciklama: 'Yi wɔɔchi bi yɛliri shɛli abada.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Namaz Akışı yi be yi Apple Watch zuɣu, di mini yi iPhone n-tumdi tuma maa. Kpe ka yi piri luɣ’ shɛli yiɣisibu ni kum.',
    giris:
      'Namaz Akışı yi be yi wɔɔchi zuɣu, di mini yi tilifoŋ n-tumdi tuma maa. Kpe ka yi piri luɣ’ shɛli yiɣisibu ni kum ka bɛ karim teebu ni kukoli.',
    uyandirmaBaslik: 'Yiɣisibu kum ya ni?',
    uyandirmaNotu:
      'Yiɣisibu nyɛla alaam shɛli yi ni yooi n-ti Subaahi “Pɔi ka saha naai” teebu ni, mini Tahajud yiɣisibu yi ni yooi Naafila jiŋa ni.',
    uyandirmaNotuIos:
      'watchOS ni tooi zali alaam din ka kukoli wɔɔchi app maa yi yooya koŋko: yoomi ya Namaz Akışı yi wɔɔchi zuɣu sahayini dabsili kam ka bɛ ni zali yiɣisibu din doli. Wɔɔchi yi deeri chaaji bee app maa yi bi yooi, yi iPhone n-ni kum.',
    uyandirmaNotuAndroid: 'Yi wɔɔchi bi kumdi di yi deeri chaaji; yi tilifoŋ n-ni kum.',
    muhafizAyarlari: 'Yoomi ya “Pɔi ka saha naai” malizali',
    nafileAyarlari: 'Yoomi ya Naafila jiŋa malizali',
    bilektenBaslik: 'Din yi ni tooi niŋ yi nuu zuɣu',
    bilektenIos: [
      'Yi iPhone yi zooi, teebu kumdi yi wɔɔchi zuɣu; di bi kumdi di ayi zaa zuɣu.',
      'Yi dalimdi jiŋa shɛŋa yi ni puhi yi nuu zuɣu; yi iPhone n-sabiri li.',
      'Yi kalindi tasbihi ni Digital Crown ka nya Alichibla yi wɔɔchi zuɣu.',
    ],
    anonsBaslik: 'Kukoli karimbu niŋ ya ni?',
    anonsNotu:
      'Teebu shɛŋa kukoli karimbu ni yooi koŋko ka bɛ karindi. Kpatuɣa ayi maa bi karindi yɛtɔɣa yini taba. Yi yi be jiŋli ni bee Jiŋli soli yi yooya, yi wɔɔchi gba bi yɛliri shɛli. Yi wɔɔchi yi ka laŋgbaŋ, kukoli karimbu tuma bee kukoli app maa balli ni, di nyɛɣisiri koŋko. Yi ni tooi lihi wɔɔchi kukoli pumpɔŋɔ ni “Lihimi ya kukoli” Namaz Akışı wɔɔchi app ni.',
    bilekten: [
      'Yi ni tooi yooi ka kpari Jiŋli soli ni wɔɔchi buttin (hali ni jiŋli saha bahigu, minti 30 n-gari).',
      'Jiŋli ni, yi wɔɔchi wuhiri yɛla maa; yi labisiri “Ŋɔ pa jiŋli” mini “Yi be jiŋli ni?” yi nuu zuɣu.',
      'Yaɣa shɛŋa bi niŋdi wɔɔchi zuɣu (Labi puhibu gbaŋ, N be jiŋli ni, malizali) yooiri yi tilifoŋ zuɣu ni “Yoomi tilifoŋ zuɣu”.',
    ],
    namazModuNotu: 'Yi yi bɔri ni yi yooi Jiŋli soli wɔɔchi zuɣu, yoomi ya li yi tilifoŋ zuɣu sahayini tooni.',
    namazModuAyarlari: 'Yoomi ya Jiŋli soli malizali',
  },
  sayfa: {
    akilliSaat: 'Wɔɔchi',
    appleWatchOzet: 'Luɣ’ shɛli yiɣisibu kumdi',
    saatOzet: 'Luɣ’ shɛli yiɣisibu kumdi ka karindi ni kukoli',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Saha kalibu din tumdi',
    geriSayim: 'Saha kalibu',
    gelismisErisim: 'Din gari. Automation nima mini app shɛŋa dalimdi N puhi jiŋli',
    gelismis: 'Din gari',
    otomasyonlar: 'Automation nima',
    otomasyonBaslik: 'Zaŋmi ya li ni automation nima',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'App shɛŋa dalimdi N puhi jiŋli',
    kildimOzet: 'App shɛŋa yi ni ti soli',
  },
};
