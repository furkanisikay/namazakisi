import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Yzygiderlik (seri): baş ekran kartasy, bölüm, nyşanlar, derejeler, gutlag we paýlaşmak kartlary. Uly harply tekstler elde ýazylýar. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Yzygiderligiňiz dowam edýär',
    enUzun: cogul({ one: 'Iň uzyn yzygiderlik: {n} gün', other: 'Iň uzyn yzygiderlik: {n} gün' }),
    gunBuyuk: cogul({ one: 'GÜN', other: 'GÜN' }),
    sonrakiHedef: 'Indiki maksat: {hedef} gün ({durum})',
    kalanGun: cogul({ one: '{n} gün galdy', other: '{n} gün galdy' }),
    tamamlandi: 'Tamamlandy!',
    paylasErisim: 'Ösüşiňizi paýlaşyň',
    paylasBuyuk: 'ÖSÜŞIŇIZI PAÝLAŞYŇ',
  },

  hedefler: {
    ilk_adim: { ad: 'Ilkinji hepde', aciklama: '7 gün arakesmesiz namaz oka', cumle: 'Ilkinji hepde' },
    aliskanlik_ustasi: { ad: 'Endik ussady', aciklama: '21 gün - endik emele gelýän döwür', cumle: 'Endik ussady' },
    kararlilik: { ad: 'Berklik', aciklama: '60 gün arakesmesiz', cumle: 'Berklik' },
    efsane: { ad: 'Rowaýat', aciklama: '90 gün - ajaýyp sabyrlylyk', cumle: 'Rowaýat' },
  },

  /** Klassyky dereje atlary, türkmen ýazuwyna geçirildi (terjime däl). */
  seviyeler: ['Mübtedi', 'Talyp', 'Salyk', 'Mürit', 'Arif', 'Hafyz', 'Kämil'],

  rozetler: {
    ilk_adim: { ad: 'Ilkinji ädim', aciklama: 'Ilkinji hepdäňizi tamamladyňyz!', kosul: '7 günlük yzygiderlik' },
    aliskanlik_ustasi: {
      ad: 'Endik ussady',
      aciklama: '21 gün - endik emele gelýän döwür tamamlandy!',
      kosul: '21 günlük yzygiderlik',
    },
    kararlilik: { ad: 'Berk', aciklama: '60 gün arakesmesiz namaz okadyňyz!', kosul: '60 günlük yzygiderlik' },
    efsane: { ad: 'Rowaýat', aciklama: '90 gün - ajaýyp sabyrlylyk görkezdiňiz!', kosul: '90 günlük yzygiderlik' },
    toparlanma_ustasi: {
      ad: 'Dikeliş ussady',
      aciklama: 'Dikeliş tertibini 3 gezek tamamladyňyz!',
      kosul: '3 dikeliş',
    },
    mukemmeliyetci: { ad: 'Kämillik', aciklama: '30 gün 5/5 namaz okadyňyz!', kosul: '30 gün 5/5 namaz' },
    yuz_namaz: { ad: '100 namaz', aciklama: 'Jemi 100 namaz okadyňyz!', kosul: '100 namaz okaň' },
    bin_namaz: { ad: '1000 namaz', aciklama: 'Jemi 1000 namaz okadyňyz!', kosul: '1000 namaz okaň' },
  },

  rozetSeviyeleri: { bronz: 'BÜRÜNÇ', gumus: 'KÜMÜŞ', altin: 'ALTYN', elmas: 'ALMAZ' },

  gunBitis: {
    erken: 'Ir ýatýanlar üçin',
    varsayilan: 'Adaty - köp ýerde ertir wagtyndan öň',
    gec: 'Giç ýatýanlar üçin',
  },

  kutlama: {
    rozetEklendi: '🏅 Nyşan ýygyndyňyza goşuldy',
    paylasin: 'Paýlaşyň',
    rozetBaslik: 'Alla dowamly etsin',
    rozetMesaj: '"{ad}" nyşanyny gazandyňyz.',
    hedefBaslik: cogul({ one: '{n} gün', other: '{n} gün' }),
    hedefMesaj: '"{ad}" maksadyny tamamladyňyz. Alla dowamly etsin.',
    yeniRank: 'Täze dereje: {rank}',
    seviyeBaslik: 'Täze derejäňiz',
    seviyeMesaj: 'Indi "{rank}" hökmünde dowam edýärsiňiz. Alla dowamly etsin.',
    toparlanmaBaslik: 'Yzygiderligiňiz gaýdyp geldi',
    toparlanmaMesaj: cogul({
      one: '{n} günlük yzygiderligiňiz galan ýerinden dowam edýär. Alla berklik bersin.',
      other: '{n} günlük yzygiderligiňiz galan ýerinden dowam edýär. Alla berklik bersin.',
    }),
    enUzunBaslik: 'Iň uzyn yzygiderligiňiz',
    enUzunMesaj: cogul({
      one: '{n} gün: şu wagta çenli iň uzyn yzygiderligiňiz. Alla dowamly etsin.',
      other: '{n} gün: şu wagta çenli iň uzyn yzygiderligiňiz. Alla dowamly etsin.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Öňki ýazgylaryňyzy häzir okap bolmady.',
    yenidenErisim: 'Yzygiderlik maglumatlaryny gaýtadan ýükläň',
    yenidenDeneyin: 'Gaýtadan synanyşyň',
    yukleniyor: 'Yzygiderlik maglumatlaryňyz ýüklenýär...',
    gunlukSeri: 'günlük yzygiderlik',
    rekor: 'rekord',
    sozErisim: '{metin} Çeşme: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Indiki maksat',
    tumu: 'Ähli nyşanlary tamamladyňyz',
    kalan: cogul({ one: '{ad} nyşany: {n} gün galdy', other: '{ad} nyşany: {n} gün galdy' }),
    tumuErisim: 'Ähli nyşanlary tamamladyňyz: tesbih doldy.',
    erisim: '{ad} nyşany: {hedef} günden {n} gün tamamlandy.',
  },

  gok: {
    gunHarfleri: ['D', 'S', 'Ç', 'P', 'A', 'Ş', 'Ý'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} gün maksada ýetdi', other: '{n} gün maksada ýetdi' }),
    besVakit: cogul({ one: 'Bäş wagt namaz okalan {n} gün', other: 'Bäş wagt namaz okalan {n} gün' }),
    dondurulmus: cogul({ one: '{n} gün doňduryldy', other: '{n} gün doňduryldy' }),
    mevcutSeri: cogul({ one: 'Häzirki yzygiderlik: {n} gün.', other: 'Häzirki yzygiderlik: {n} gün.' }),
  },

  hedefAyar: {
    azalt: 'Azalt',
    deger: 'Baha',
    artir: 'Artdyr',
    esik: cogul({ one: '{n} namaz', other: '{n} namaz' }),
    sifirlaBaslik: 'Yzygiderligi nola düşüriň',
    sifirlaMesaj: 'Ähli yzygiderlik maglumatlaryňyz (yzygiderlik, nyşanlar, ballar) nola düşüriler. Muny yzyna alyp bolmaýar. Dowam etmek isleýärsiňizmi?',
    sifirla: 'Nola düşüriň',
    iptal: 'Ýatyryň',
    basarili: 'Taýýar',
    sifirlandi: 'Yzygiderlik maglumatlaryňyz nola düşürildi.',
    hedefAyarlari: 'MAKSAT SAZLAMALARY',
    tamGunEsigi: 'Doly gün çägi',
    tamGunAciklama: 'Günüň yzygiderlige goşulmagy üçin günde gerek bolan iň az namaz sanyny kesgitleýär',
    sifirlama: 'NOLA DÜŞÜRMEK',
    verileriSifirla: 'Yzygiderlik maglumatlaryny nola düşüriň',
    verileriSifirlaAlt: 'Ähli yzygiderlik, nyşan we bal maglumatlaryny pozýar',
  },

  rozetKarti: {
    erisim: '{ad} nyşany, {durum}',
    kazanildi: 'gazanyldy',
    kilitli: 'gulply',
  },

  toparlanma: {
    kartBaslik: 'DIKELIŞ TERTIBI',
    kartAltBaslik: 'Yzygiderligiňizi gaýtaryp bilersiňiz',
    kartMesaj: '{vurgu} yzygiderligiňizi galan ýeriňizden dowam etdirip bilersiňiz.',
    oncekiGun: cogul({ one: '{n} günlük', other: '{n} günlük' }),
    ilerleme: '{tamam}/{hedef} gün tamamlandy',
    kalan: cogul({
      one: 'Ýene {n} gün bäş wagty doly okaň, yzygiderligiňiz galan ýerinden dowam eder.',
      other: 'Ýene {n} gün bäş wagty doly okaň, yzygiderligiňiz galan ýerinden dowam eder.',
    }),
    bugun: 'Şu güni tamamlaň, yzygiderligiňiz galan ýerinden dowam eder.',
    uyari: 'Günler yzly-yzyna bolmaly; arada bir gün galdyrylsa, dikeliş täzeden başlaýar.',
    kapatErisim: 'Dikeliş jikme-jikliklerini ýapyň',
    anladim: 'Düşündim',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Ösüşiňizi paýlaşyň',
    hazirDegilBaslik: 'Surat taýýar däl',
    hazirDegilMesaj: 'Surat entek taýýar däl. Birnäçe sekuntdan gaýtadan synanyşyň.',
    olusturulamadiBaslik: 'Surat döredilmedi',
    olusturulamadiMesaj: 'Surat döredilende bir näsazlyk ýüze çykdy. Gaýtadan synanyşyň.',
    kullanilamiyorBaslik: 'Paýlaşmak elýeter däl',
    kullanilamiyorMesaj: 'Bu enjamda paýlaşmak elýeter däl.',
    kapat: 'Ýapyň',
    hikaye: 'Hekaýaňyza goşuň',
    platformlar: 'Instagram, WhatsApp we beýlekilerde paýlaşyp bolýar.',
    tamam: 'Bolýar',
    seriEnUzun: cogul({ one: 'Iň uzyn yzygiderligim: {n} gün', other: 'Iň uzyn yzygiderligim: {n} gün' }),
    seriZincir: cogul({ one: 'GÜN ZYNJYRY ÜZMÄN!', other: 'GÜN ZYNJYRY ÜZMÄN!' }),
    seriSoz: '"Her gün kiçijik ädim, kalbymda uly rahatlyk. 🔥"',
    rozetYeni: 'TÄZE NYŞAN GAZANDYM!',
    rozetSozleri: [
      'Şu gün özüm üçin gowy ädim ätdim! 🌟',
      'Berk niýet bilen dowam edýärin; bu nyşan meniňki! 💪',
      'Ertiriň beregetine ýetişdim! 🌅',
      'Kalbyma rahatlyk berýän bu akymyň bir bölegi! ✨',
      'Kiçijik ädimler uly rahatlyk getirýär. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'TÄZE NYŞAN GAZANDYM!',
      hedef_tamamlandi: 'MAKSADYMA ÝETDIM!',
      seviye_atlandi: 'DEREJE ÝOKARLANDY!',
      toparlanma_tamamlandi: 'ÝENE ÝOLDA!',
      en_uzun_seri: 'TÄZE REKORD!',
      varsayilan: 'ÜSTÜNLIK!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Rebbim dowamly etsin. 🤲', 'Kiçijik ädimler uly rahatlyk getirýär. 🍃', 'Alla hemmämize berklik bersin. 🌱'],
      hedef_tamamlandi: ['Kiçijik ädimler uly rahatlyk getirýär. 🍃', 'Alla dowamly etsin. 🤲', 'Her gün ýene bir ädim. 🌱'],
      seviye_atlandi: [
        'Her gün birneme öňe; Alla aňsat etsin. 🍃',
        'Alla dowamly etsin. 🤲',
        'Ýol dowam edýär. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Möhüm zat ýykylmak däl, turmakdyr. 🔄',
        'Alla berklik bersin. 🤲',
        'Her ýol sabyr bilen geçilýär. 🌱',
      ],
      en_uzun_seri: [
        'Her gün kiçijik ädim, kalbymda uly rahatlyk. 🍃',
        'Alla dowamly etsin. 🤲',
        'Rebbim hemmämize berklik bersin. 🌱',
      ],
    },
  },
};
