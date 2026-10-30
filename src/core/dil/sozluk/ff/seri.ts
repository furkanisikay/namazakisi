import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = jokkondiral, toparlanma = ƴellitaare; dua kalıpları "Yo Alla duumin ɗum" / "Yo Alla tabbitin en". Övgü ve "!" yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Jokkondiral mon hino huɓɓi',
    enUzun: cogul({ one: 'Jokkondiral ɓurngol juutde: {n} ñalawma', other: 'Jokkondiral ɓurngol juutde: {n} ñalɗe' }),
    gunBuyuk: cogul({ one: 'ÑALAWMA', other: 'ÑALƊE' }),
    sonrakiHedef: 'Faandaare garoore: ñalawma {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} ñalawma heddii', other: '{n} ñalɗe heddii' }),
    tamamlandi: 'Timmii',
    paylasErisim: 'Lollinee ɓeydoral mon',
    paylasBuyuk: 'LOLLINEE ƁEYDORAL MON',
  },

  hedefler: {
    ilk_adim: { ad: 'Yontere Arannde', aciklama: 'Juulee ñalɗe 7 tawa taƴaaki', cumle: 'Yontere arannde' },
    aliskanlik_ustasi: { ad: 'Jom Ngonka', aciklama: 'Ñalɗe 21 - sahaa mahgol ngonka', cumle: 'Jom ngonka' },
    kararlilik: { ad: 'Tabital', aciklama: 'Ñalɗe 60 tawa taƴaaki', cumle: 'Tabital' },
    efsane: { ad: 'Jaŋde Mawnde', aciklama: 'Ñalɗe 90 - muñal teeŋtungal', cumle: 'Jaŋde mawnde' },
  },

  /** Klasik rütbe adları, Pular sesletimiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Taalib', 'Saalik', 'Muriid', 'Aarif', 'Haafiz', 'Kaamil'],

  rozetler: {
    ilk_adim: { ad: 'Taaɓe Arano', aciklama: 'On timminii yontere mon arannde.', kosul: 'Jokkondiral ñalɗe 7' },
    aliskanlik_ustasi: {
      ad: 'Jom Ngonka',
      aciklama: 'Ñalɗe 21 - sahaa mahgol ngonka timmii.',
      kosul: 'Jokkondiral ñalɗe 21',
    },
    kararlilik: { ad: 'Tabiɗo', aciklama: 'On juulii ñalɗe 60 tawa taƴaaki.', kosul: 'Jokkondiral ñalɗe 60' },
    efsane: { ad: 'Jaŋde Mawnde', aciklama: 'Ñalɗe 90 - on kolliri muñal teeŋtungal.', kosul: 'Jokkondiral ñalɗe 90' },
    toparlanma_ustasi: {
      ad: 'Jom Ƴellitaare',
      aciklama: 'On timminii mode ƴellitaare laabi 3.',
      kosul: 'Ƴellitaare 3',
    },
    mukemmeliyetci: { ad: 'Timmuɗo', aciklama: 'On juulii 5/5 ñalɗe 30.', kosul: 'Ñalɗe 30 juulɗe 5/5' },
    yuz_namaz: { ad: 'Juulɗe 100', aciklama: 'On juulii juulɗe 100 fow e fow.', kosul: 'Juulee juulɗe 100' },
    bin_namaz: { ad: 'Juulɗe 1000', aciklama: 'On juulii juulɗe 1000 fow e fow.', kosul: 'Juulee juulɗe 1000' },
  },

  rozetSeviyeleri: { bronz: 'BRONS', gumus: 'KAALIS', altin: 'KAŊŊE', elmas: 'DIYAMAA' },

  gunBitis: {
    erken: 'Ngam ɓeen ɗaanoowo law',
    varsayilan: 'Ko woowaa - adii subaka e nokkuuje ɓurɗe heewde',
    gec: 'Ngam ɓeen ɗaanoowo leeltii',
  },

  kutlama: {
    rozetEklendi: '🏅 Ɓeydaama e maanɗe mon',
    paylasin: 'Lollinee',
    rozetBaslik: 'Yo Alla duumin ɗum',
    rozetMesaj: 'On keɓii maande "{ad}".',
    hedefBaslik: cogul({ one: '{n} ñalawma', other: '{n} ñalɗe' }),
    hedefMesaj: 'On timminii faandaare "{ad}". Yo Alla duumin ɗum.',
    yeniRank: 'Daraja hesere: {rank}',
    seviyeBaslik: 'Daraja mon hesere',
    seviyeMesaj: 'Jooni on jokkii wa "{rank}". Yo Alla duumin ɗum.',
    toparlanmaBaslik: 'Jokkondiral mon artii',
    toparlanmaMesaj: cogul({
      one: 'Jokkondiral mon {n} ñalawma hino jokkoo ɗo ngol daraniino. Yo Alla tabbitin en.',
      other: 'Jokkondiral mon {n} ñalɗe hino jokkoo ɗo ngol daraniino. Yo Alla tabbitin en.',
    }),
    enUzunBaslik: 'Jokkondiral mon ɓurngol juutde',
    enUzunMesaj: cogul({
      one: '{n} ñalawma: jokkondiral mon ɓurngol juutde haa jooni. Yo Alla duumin ɗum.',
      other: '{n} ñalɗe: jokkondiral mon ɓurngol juutde haa jooni. Yo Alla duumin ɗum.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Winndannde mon ɓennuɗe njanngaaka jooni.',
    yenidenErisim: 'Etee kadi loowde keɓe jokkondiral',
    yenidenDeneyin: 'Etee kadi',
    yukleniyor: 'Keɓe jokkondiral mon hino loowee...',
    gunlukSeri: 'ñalɗe jokkondiral',
    rekor: 'rekor',
    sozErisim: '{metin} Iwdi: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Faandaare garoore',
    tumu: 'On timminii maanɗe ɗen fow',
    kalan: cogul({ one: 'Maande {ad}: {n} ñalawma heddii', other: 'Maande {ad}: {n} ñalɗe heddii' }),
    tumuErisim: 'On timminii maanɗe ɗen fow: tasbiihu ngu heewii.',
    erisim: 'Maande {ad}: {n} e ñalɗe {hedef} timmii.',
  },

  gok: {
    gunHarfleri: ['Ti', 'Ta', 'Ar', 'Ka', 'Ju', 'Se', 'At'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} ñalawma hewtii faandaare', other: '{n} ñalɗe hewtii faandaare' }),
    besVakit: cogul({ one: '{n} ñalawma e juulɗe njoy ɗen fow', other: '{n} ñalɗe e juulɗe njoy ɗen fow' }),
    dondurulmus: cogul({ one: '{n} ñalawma dartinaama', other: '{n} ñalɗe dartinaama' }),
    mevcutSeri: cogul({ one: 'Jokkondiral jooni: {n} ñalawma.', other: 'Jokkondiral jooni: {n} ñalɗe.' }),
  },

  hedefAyar: {
    azalt: 'Ustee',
    deger: 'Limoore',
    artir: 'Ɓeydee',
    esik: cogul({ one: '{n} juulde', other: '{n} juulɗe' }),
    sifirlaBaslik: 'Fuɗɗitee jokkondiral',
    sifirlaMesaj: 'Keɓe jokkondiral mon fow (jokkondiral, maanɗe, poenji) momtoto. Ɗum waawaa firteede. Hiɗon njiɗi jokkude?',
    sifirla: 'Fuɗɗitee',
    iptal: 'Haaytee',
    basarili: 'Gasii',
    sifirlandi: 'Keɓe jokkondiral mon momtaama.',
    hedefAyarlari: 'TEELTE FAANDAARE',
    tamGunEsigi: 'Tolno ñalawma timmuɗo',
    tamGunAciklama: 'Hino teelta limoore juulɗe famɗunde ñalawma ngam ñalawma oo limteede e jokkondiral mon',
    sifirlama: 'FUƊƊITGOL',
    verileriSifirla: 'Fuɗɗitee keɓe jokkondiral',
    verileriSifirlaAlt: 'Hino momta keɓe jokkondiral, maanɗe e poenji fow',
  },

  rozetKarti: {
    erisim: 'Maande {ad}, {durum}',
    kazanildi: 'heɓaama',
    kilitli: 'uddaama',
  },

  toparlanma: {
    kartBaslik: 'MODE ƳELLITAARE',
    kartAltBaslik: 'Hiɗon mbaawi heɓtude jokkondiral mon',
    kartMesaj: 'Hiɗon mbaawi jokkude jokkondiral mon {vurgu} ɗo on daraniino.',
    oncekiGun: cogul({ one: '{n} ñalawma', other: '{n} ñalɗe' }),
    ilerleme: 'Ñalɗe {tamam}/{hedef} timmii',
    kalan: cogul({
      one: 'Timminee juulɗe njoy ɗen fow {n} ñalawma kadi, jokkondiral mon jokkoto ɗo ngol daraniino.',
      other: 'Timminee juulɗe njoy ɗen fow {n} ñalɗe kadi, jokkondiral mon jokkoto ɗo ngol daraniino.',
    }),
    bugun: 'Timminee hannde, jokkondiral mon jokkoto ɗo ngol daraniino.',
    uyari: 'Ñalɗe ɗen hino haani jokkondirde; so ñalawma gooto taƴii hakkunde, ƴellitaare fuɗɗitoto.',
    kapatErisim: 'Uddee cikkitte ƴellitaare',
    anladim: 'Mi faamii',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Lollinee ɓeydoral mon',
    hazirDegilBaslik: 'Natal ngal moƴƴaani',
    hazirDegilMesaj: 'Natal ngal moƴƴaani tawo. Etee kadi caggal majaaɗe seeɗa.',
    olusturulamadiBaslik: 'Natal ngal waɗaaki',
    olusturulamadiMesaj: 'Huunde bonii tuma waɗugol natal ngal. Etee kadi.',
    kullanilamiyorBaslik: 'Lollingol heɓotaake',
    kullanilamiyorMesaj: 'Lollingol heɓotaake e kaɓirgal ngal.',
    kapat: 'Uddee',
    hikaye: 'Ɓeydee e taariya mon',
    platformlar: 'Hino waawi lolleede e Instagram, WhatsApp e goɗɗe.',
    tamam: 'Awa',
    seriEnUzun: cogul({ one: 'Jokkondiral Am Ɓurngol Juutde: {n} Ñalawma', other: 'Jokkondiral Am Ɓurngol Juutde: {n} Ñalɗe' }),
    seriZincir: cogul({ one: 'ÑALAWMA TAWA CEŊOL NGOL TAƳAAKI', other: 'ÑALƊE TAWA CEŊOL NGOL TAƳAAKI' }),
    seriSoz: '"Taaɓe famɗuɗo ñalawma kala, deeƴre mawnde e ɓernde am. 🔥"',
    rozetYeni: 'MI HEƁII MAANDE HESERE',
    rozetSozleri: [
      'Hannde mi taaɓii taaɓe moƴƴo ngam hoore am. 🌟',
      'Mi jokkii e tabital; maande ndee ko am. 💪',
      'Mi heɓii barki bimmbi. 🌅',
      'Mi woni e nder dawrugol ngol moƴƴingol ɓernde am. ✨',
      'Taaɓe famɗuɗe hino addana deeƴre mawnde. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'MI HEƁII MAANDE HESERE',
      hedef_tamamlandi: 'MI HEWTII FAANDAARE AM',
      seviye_atlandi: 'DARAJA HESERE',
      toparlanma_tamamlandi: 'MI ARTII E LAAWOL',
      en_uzun_seri: 'REKOR HESERE',
      varsayilan: 'KO HEƁAA',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Yo Joomiraaɗo duumin ɗum. 🤲', 'Taaɓe famɗuɗe hino addana deeƴre mawnde. 🍃', 'Yo Alla tabbitin en fow. 🌱'],
      hedef_tamamlandi: ['Taaɓe famɗuɗe hino addana deeƴre mawnde. 🍃', 'Yo Alla duumin ɗum. 🤲', 'Taaɓe gooto kadi ñalawma kala. 🌱'],
      seviye_atlandi: [
        'Seeɗa kadi ñalawma kala; yo Alla newnu ɗum. 🍃',
        'Yo Alla duumin ɗum. 🤲',
        'Laawol ngol hino jokki. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ko tiiɗi wonaa yanugol, ko ummaade. 🔄',
        'Yo Alla tabbitin en. 🤲',
        'Laawol kala hino yahiree muñal. 🌱',
      ],
      en_uzun_seri: [
        'Taaɓe famɗuɗo ñalawma kala, deeƴre mawnde e ɓernde am. 🍃',
        'Yo Alla duumin ɗum. 🤲',
        'Yo Joomiraaɗo tabbitin en fow. 🌱',
      ],
    },
  },
};
