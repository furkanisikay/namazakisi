import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Jerinku yana ci',
    enUzun: cogul({ one: 'Jeri mafi tsayi: kwana {n}', other: 'Jeri mafi tsayi: kwana {n}' }),
    gunBuyuk: cogul({ one: 'KWANA', other: 'KWANAKI' }),
    sonrakiHedef: 'Buri na gaba: kwana na {hedef} ({durum})',
    kalanGun: cogul({ one: 'Kwana {n} ya rage', other: 'Kwana {n} sun rage' }),
    tamamlandi: 'An kammala',
    paylasErisim: 'Raba ci gabanku',
    paylasBuyuk: 'RABA CI GABANKU',
  },

  hedefler: {
    ilk_adim: { ad: 'Mako na Farko', aciklama: 'Yin salla na kwana 7 ba tare da tsayawa ba', cumle: 'Mako na farko' },
    aliskanlik_ustasi: { ad: 'Gwanin Ɗabiʼa', aciklama: 'Kwana 21 - lokacin gina ɗabiʼa', cumle: 'Gwanin ɗabiʼa' },
    kararlilik: { ad: 'Dagewa', aciklama: 'Kwana 60 ba tare da tsayawa ba', cumle: 'Dagewa' },
    efsane: { ad: 'Fitacce', aciklama: 'Kwana 90 - juriya ta musamman', cumle: 'Fitacce' },
  },

  /** Klasik mertebe adları, Hausa'ya uyarlanmış Arapça (çeviri değil). */
  seviyeler: ['Mubtadiʼi', 'Ɗalibi', 'Saliki', 'Muridi', 'Arifi', 'Hafizi', 'Kamili'],

  rozetler: {
    ilk_adim: { ad: 'Mataki na Farko', aciklama: 'Kun kammala makonku na farko.', kosul: 'Jerin kwana 7' },
    aliskanlik_ustasi: {
      ad: 'Gwanin Ɗabiʼa',
      aciklama: 'Kwana 21 - an kammala lokacin gina ɗabiʼa.',
      kosul: 'Jerin kwana 21',
    },
    kararlilik: { ad: 'Mai Dagewa', aciklama: 'Kun yi salla na kwana 60 ba tare da tsayawa ba.', kosul: 'Jerin kwana 60' },
    efsane: { ad: 'Fitacce', aciklama: 'Kwana 90 - kun nuna juriya ta musamman.', kosul: 'Jerin kwana 90' },
    toparlanma_ustasi: {
      ad: 'Gwanin Farfaɗowa',
      aciklama: 'Kun kammala yanayin farfaɗowa sau 3.',
      kosul: 'Farfaɗowa 3',
    },
    mukemmeliyetci: { ad: 'Mai Cikawa', aciklama: 'Kun yi salla 5/5 na kwana 30.', kosul: 'Kwana 30 na salloli 5/5' },
    yuz_namaz: { ad: 'Salloli 100', aciklama: 'Kun yi salloli 100 gaba ɗaya.', kosul: 'Yi salloli 100' },
    bin_namaz: { ad: 'Salloli 1000', aciklama: 'Kun yi salloli 1000 gaba ɗaya.', kosul: 'Yi salloli 1000' },
  },

  rozetSeviyeleri: { bronz: 'TAGULLA', gumus: 'AZURFA', altin: 'ZINARI', elmas: 'LUʼU-LUʼU' },

  gunBitis: {
    erken: 'Ga masu barci da wuri',
    varsayilan: 'Na asali - kafin Asuba a yawancin wurare',
    gec: 'Ga masu barci a makare',
  },

  kutlama: {
    rozetEklendi: '🏅 An ƙara a tarin lambobin yabonku',
    paylasin: 'Raba',
    rozetBaslik: 'Allah ya sa ya ɗore',
    rozetMesaj: 'Kun sami lambar yabo ta "{ad}".',
    hedefBaslik: cogul({ one: 'Kwana {n}', other: 'Kwana {n}' }),
    hedefMesaj: 'Kun kammala burin "{ad}". Allah ya sa ya ɗore.',
    yeniRank: 'Sabon matsayi: {rank}',
    seviyeBaslik: 'Sabon matakinku',
    seviyeMesaj: 'Yanzu kuna ci gaba a matsayin "{rank}". Allah ya sa ya ɗore.',
    toparlanmaBaslik: 'Jerinku ya dawo',
    toparlanmaMesaj: cogul({
      one: 'Jerinku na kwana {n} yana ci gaba daga inda ya tsaya. Allah ya ba da dagewa.',
      other: 'Jerinku na kwana {n} yana ci gaba daga inda ya tsaya. Allah ya ba da dagewa.',
    }),
    enUzunBaslik: 'Jerinku mafi tsayi',
    enUzunMesaj: cogul({
      one: 'Kwana {n}: jerinku mafi tsayi zuwa yanzu. Allah ya sa ya ɗore.',
      other: 'Kwana {n}: jerinku mafi tsayi zuwa yanzu. Allah ya sa ya ɗore.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Ba a iya karanta bayananku na baya a yanzu ba.',
    yenidenErisim: 'Sake gwada loda bayanan jeri',
    yenidenDeneyin: 'Sake gwadawa',
    yukleniyor: 'Ana loda bayanan jerinku...',
    gunlukSeri: 'kwanakin jeri',
    rekor: 'tarihi',
    sozErisim: '{metin} Tushe: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Buri na gaba',
    tumu: 'Kun kammala duk lambobin yabo',
    kalan: cogul({ one: 'Lambar {ad}: kwana {n} ya rage', other: 'Lambar {ad}: kwana {n} sun rage' }),
    tumuErisim: 'Kun kammala duk lambobin yabo: carbin ya cika.',
    erisim: 'Lambar {ad}: an kammala kwana {n} cikin {hedef}.',
  },

  gok: {
    gunHarfleri: ['L', 'T', 'L', 'A', 'J', 'A', 'L'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Kwana {n} ya cimma buri', other: 'Kwana {n} sun cimma buri' }),
    besVakit: cogul({ one: 'Kwana {n} da salloli biyar duka', other: 'Kwana {n} da salloli biyar duka' }),
    dondurulmus: cogul({ one: 'Kwana {n} da aka daskarar', other: 'Kwana {n} da aka daskarar' }),
    mevcutSeri: cogul({ one: 'Jerin yanzu: kwana {n}.', other: 'Jerin yanzu: kwana {n}.' }),
  },

  hedefAyar: {
    azalt: 'Rage',
    deger: 'Ƙima',
    artir: 'Ƙara',
    esik: cogul({ one: 'Salla {n}', other: 'Salloli {n}' }),
    sifirlaBaslik: 'Sake saita jeri',
    sifirlaMesaj: 'Za a sake saita duk bayanan jerinku (jeri, lambobin yabo, maki). Ba za a iya mayar da wannan ba. Kuna son ci gaba?',
    sifirla: 'Sake saita',
    iptal: 'Soke',
    basarili: 'An gama',
    sifirlandi: 'An sake saita bayanan jerinku.',
    hedefAyarlari: 'SAITUNAN BURI',
    tamGunEsigi: 'Iyakar cikakkiyar rana',
    tamGunAciklama: 'Yana saita mafi ƙarancin yawan salloli a rana da ake buƙata don wannan rana ta ƙidaya a jerinku',
    sifirlama: 'SAKE SAITA',
    verileriSifirla: 'Sake saita bayanan jeri',
    verileriSifirlaAlt: 'Yana share duk bayanan jeri, lambobin yabo da maki',
  },

  rozetKarti: {
    erisim: 'Lambar {ad}, {durum}',
    kazanildi: 'an samu',
    kilitli: 'a kulle',
  },

  toparlanma: {
    kartBaslik: 'YANAYIN FARFAƊOWA',
    kartAltBaslik: 'Kuna iya dawo da jerinku',
    kartMesaj: 'Kuna iya ci gaba da jerinku na {vurgu} daga inda kuka tsaya.',
    oncekiGun: cogul({ one: 'kwana {n}', other: 'kwana {n}' }),
    ilerleme: 'An kammala kwana {tamam}/{hedef}',
    kalan: cogul({
      one: 'Ku kammala salloli biyar duka na ƙarin kwana {n} kuma jerinku zai ci gaba daga inda ya tsaya.',
      other: 'Ku kammala salloli biyar duka na ƙarin kwana {n} kuma jerinku zai ci gaba daga inda ya tsaya.',
    }),
    bugun: 'Ku kammala yau kuma jerinku zai ci gaba daga inda ya tsaya.',
    uyari: 'Dole ne kwanakin su kasance a jere; idan aka tsallake rana a tsakani, farfaɗowa tana sake farawa.',
    kapatErisim: 'Rufe bayanin farfaɗowa',
    anladim: 'Na gane',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Raba ci gabanku',
    hazirDegilBaslik: 'Hoton bai shirya ba',
    hazirDegilMesaj: 'Hoton bai shirya ba tukuna. Ku sake gwadawa bayan ʼyan daƙiƙoƙi.',
    olusturulamadiBaslik: 'Ba a iya ƙirƙirar hoton ba',
    olusturulamadiMesaj: 'An sami matsala yayin ƙirƙirar hoton. Sake gwadawa.',
    kullanilamiyorBaslik: 'Rabawa ba ta samuwa',
    kullanilamiyorMesaj: 'Ba a iya rabawa a wannan naʼura.',
    kapat: 'Rufe',
    hikaye: 'Ƙara a labarinku',
    platformlar: 'Ana iya rabawa a Instagram, WhatsApp da sauransu.',
    tamam: 'To',
    seriEnUzun: cogul({ one: 'Jerina Mafi Tsayi: Kwana {n}', other: 'Jerina Mafi Tsayi: Kwana {n}' }),
    seriZincir: cogul({ one: 'KWANA BA TARE DA KARYA SARƘA BA', other: 'KWANAKI BA TARE DA KARYA SARƘA BA' }),
    seriSoz: '"Ɗan mataki kowace rana, babban nutsuwa a raina. 🔥"',
    rozetYeni: 'NA SAMI SABUWAR LAMBAR YABO',
    rozetSozleri: [
      'Yau na ɗauki mataki mai kyau don kaina. 🌟',
      'Ina ci gaba da azama; wannan lambar tawa ce. 💪',
      'Na riski albarkar safiya. 🌅',
      'Ina cikin wannan tafiya da ke amfanar raina. ✨',
      'Ƙananan matakai suna kawo babban nutsuwa. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NA SAMI SABUWAR LAMBAR YABO',
      hedef_tamamlandi: 'NA CIMMA BURINA',
      seviye_atlandi: 'NA HAU MATAKI',
      toparlanma_tamamlandi: 'NA DAWO KAN HANYA',
      en_uzun_seri: 'SABON TARIHI',
      varsayilan: 'NASARA',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Ubangijina ya sa ya ɗore. 🤲', 'Ƙananan matakai suna kawo babban nutsuwa. 🍃', 'Allah ya ba mu duka dagewa. 🌱'],
      hedef_tamamlandi: ['Ƙananan matakai suna kawo babban nutsuwa. 🍃', 'Allah ya sa ya ɗore. 🤲', 'Ƙarin mataki ɗaya kowace rana. 🌱'],
      seviye_atlandi: [
        'Kaɗan kaɗan kowace rana; Allah ya sauƙaƙa. 🍃',
        'Allah ya sa ya ɗore. 🤲',
        'Tafiya tana ci gaba. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Abin da ke da muhimmanci ba faɗuwa ba ne, tashi ne. 🔄',
        'Allah ya ba da dagewa. 🤲',
        'Kowace hanya da haƙuri ake bin ta. 🌱',
      ],
      en_uzun_seri: [
        'Ɗan mataki kowace rana, babban nutsuwa a zuciyata. 🍃',
        'Allah ya sa ya ɗore. 🤲',
        'Ubangijina ya ba mu duka dagewa. 🌱',
      ],
    },
  },
};
