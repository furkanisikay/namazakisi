import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Walitti fufiinsi keessan ibsaa jira',
    enUzun: cogul({ one: 'Walitti fufiinsa isa dheeraa: guyyaa {n}', other: 'Walitti fufiinsa isa dheeraa: guyyaa {n}' }),
    gunBuyuk: cogul({ one: 'GUYYAA', other: 'GUYYAA' }),
    sonrakiHedef: 'Galma itti aanu: guyyaa {hedef} ({durum})',
    kalanGun: cogul({ one: 'Guyyaan {n} hafe', other: 'Guyyoonni {n} hafan' }),
    tamamlandi: 'Xumurameera',
    paylasErisim: 'Guddina keessan qooddadhaa',
    paylasBuyuk: 'GUDDINA KEESSAN QOODDADHAA',
  },

  hedefler: {
    ilk_adim: { ad: 'Torban Jalqabaa', aciklama: 'Guyyaa 7 osoo hin addaan kutin salaataa', cumle: 'Torban jalqabaa' },
    aliskanlik_ustasi: { ad: 'Ogeessa Amalaa', aciklama: 'Guyyaa 21 - yeroo amala ijaaruu', cumle: 'Ogeessa amalaa' },
    kararlilik: { ad: 'Jabina', aciklama: 'Guyyaa 60 osoo hin addaan kutin', cumle: 'Jabina' },
    efsane: { ad: 'Goota', aciklama: 'Guyyaa 90 - obsa addaa', cumle: 'Goota' },
  },

  /** Klasik derece adları, Qubee ile harf çevirisi (çeviri değil). */
  seviyeler: ["Mubtadi'", 'Taalib', 'Saalik', 'Muriid', 'Aarif', 'Haafiz', 'Kaamil'],

  rozetler: {
    ilk_adim: { ad: 'Tarkaanfii Jalqabaa', aciklama: 'Torban jalqabaa keessan xumurtaniittu.', kosul: 'Walitti fufiinsa guyyaa 7' },
    aliskanlik_ustasi: {
      ad: 'Ogeessa Amalaa',
      aciklama: 'Guyyaa 21 - yeroon amala ijaaruu xumurameera.',
      kosul: 'Walitti fufiinsa guyyaa 21',
    },
    kararlilik: { ad: 'Kan Jabaate', aciklama: 'Guyyaa 60 osoo hin addaan kutin salaattaniittu.', kosul: 'Walitti fufiinsa guyyaa 60' },
    efsane: { ad: 'Goota', aciklama: 'Guyyaa 90 - obsa addaa agarsiiftaniittu.', kosul: 'Walitti fufiinsa guyyaa 90' },
    toparlanma_ustasi: {
      ad: "Ogeessa Deebi'ee Ka'uu",
      aciklama: "Haala deebi'ee ka'uu si'a 3 xumurtaniittu.",
      kosul: "Deebi'ee ka'uu 3",
    },
    mukemmeliyetci: { ad: 'Guutuu', aciklama: 'Guyyaa 30 5/5 salaattaniittu.', kosul: 'Guyyaa 30 salaata 5/5' },
    yuz_namaz: { ad: 'Salaata 100', aciklama: 'Walumaagalatti salaata 100 salaattaniittu.', kosul: 'Salaata 100 salaataa' },
    bin_namaz: { ad: 'Salaata 1000', aciklama: 'Walumaagalatti salaata 1000 salaattaniittu.', kosul: 'Salaata 1000 salaataa' },
  },

  rozetSeviyeleri: { bronz: 'NAASII', gumus: 'MEETII', altin: 'WARQEE', elmas: 'ALMAAZII' },

  gunBitis: {
    erken: 'Warra dafee rafuuf',
    varsayilan: "Durtii - bakka baay'eetti Subhii dura",
    gec: 'Warra turee rafuuf',
  },

  kutlama: {
    rozetEklendi: '🏅 Kuusaa mallattoolee keessanitti dabalameera',
    paylasin: 'Qooddadhaa',
    rozetBaslik: 'Rabbiin itti haa fufsiisu',
    rozetMesaj: 'Mallattoo "{ad}" argattaniittu.',
    hedefBaslik: cogul({ one: 'Guyyaa {n}', other: 'Guyyaa {n}' }),
    hedefMesaj: 'Galma "{ad}" xumurtaniittu. Rabbiin itti haa fufsiisu.',
    yeniRank: 'Sadarkaa haaraa: {rank}',
    seviyeBaslik: 'Sadarkaa keessan haaraa',
    seviyeMesaj: 'Amma akka "{rank}"tti itti fuftu. Rabbiin itti haa fufsiisu.',
    toparlanmaBaslik: "Walitti fufiinsi keessan deebi'eera",
    toparlanmaMesaj: cogul({
      one: 'Walitti fufiinsi keessan guyyaa {n} bakka dhaabbate irraa itti fufa. Rabbiin jabina haa kennu.',
      other: 'Walitti fufiinsi keessan guyyaa {n} bakka dhaabbate irraa itti fufa. Rabbiin jabina haa kennu.',
    }),
    enUzunBaslik: 'Walitti fufiinsa keessan isa dheeraa',
    enUzunMesaj: cogul({
      one: 'Guyyaa {n}: walitti fufiinsa keessan hanga ammaatti isa dheeraa. Rabbiin itti haa fufsiisu.',
      other: 'Guyyaa {n}: walitti fufiinsa keessan hanga ammaatti isa dheeraa. Rabbiin itti haa fufsiisu.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Galmeen keessan duraanii amma dubbifamuu hin dandeenye.',
    yenidenErisim: "Odeeffannoo walitti fufiinsaa irra deebi'aa fe'aa",
    yenidenDeneyin: "Irra deebi'aa yaalaa",
    yukleniyor: "Odeeffannoon walitti fufiinsa keessanii fe'amaa jira...",
    gunlukSeri: 'guyyaa walitti fufiinsaa',
    rekor: 'galmee olaanaa',
    sozErisim: '{metin} Madda: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Galma itti aanu',
    tumu: 'Mallattoolee hunda xumurtaniittu',
    kalan: cogul({ one: 'Mallattoo {ad}: guyyaan {n} hafe', other: 'Mallattoo {ad}: guyyoonni {n} hafan' }),
    tumuErisim: 'Mallattoolee hunda xumurtaniittu: tasbiihiin guuteera.',
    erisim: 'Mallattoo {ad}: guyyaa {hedef} keessaa {n} xumurameera.',
  },

  gok: {
    gunHarfleri: ['W', 'K', 'R', 'K', 'J', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Guyyaan {n} galma gaheera', other: 'Guyyoonni {n} galma gahaniiru' }),
    besVakit: cogul({ one: 'Guyyaa {n} salaata shanan hundaan', other: 'Guyyoota {n} salaata shanan hundaan' }),
    dondurulmus: cogul({ one: 'Guyyaan {n} dhaabbateera', other: 'Guyyoonni {n} dhaabbataniiru' }),
    mevcutSeri: cogul({ one: 'Walitti fufiinsa ammaa: guyyaa {n}.', other: 'Walitti fufiinsa ammaa: guyyaa {n}.' }),
  },

  hedefAyar: {
    azalt: "Hir'isaa",
    deger: 'Gatii',
    artir: 'Dabalaa',
    esik: cogul({ one: 'Salaata {n}', other: 'Salaata {n}' }),
    sifirlaBaslik: 'Walitti fufiinsa haaraa godhaa',
    sifirlaMesaj: "Odeeffannoon walitti fufiinsa keessanii hundi (walitti fufiinsa, mallattoolee, qabxii) ni haqama. Kun deebi'uu hin danda'u. Itti fufuu barbaadduu?",
    sifirla: 'Haaraa godhaa',
    iptal: 'Dhiisaa',
    basarili: 'Xumurameera',
    sifirlandi: 'Odeeffannoon walitti fufiinsa keessanii haqameera.',
    hedefAyarlari: "QINDAA'INA GALMAA",
    tamGunEsigi: 'Daangaa guyyaa guutuu',
    tamGunAciklama: "Guyyaan tokko walitti fufiinsa keessanitti akka lakkaa'amuuf baay'ina salaataa xiqqaa guyyaatti barbaachisu murteessa",
    sifirlama: 'HAARAA GOCHUU',
    verileriSifirla: 'Odeeffannoo walitti fufiinsaa haaraa godhaa',
    verileriSifirlaAlt: 'Odeeffannoo walitti fufiinsaa, mallattooleefi qabxii hunda haqa',
  },

  rozetKarti: {
    erisim: 'Mallattoo {ad}, {durum}',
    kazanildi: 'argatame',
    kilitli: 'cufaa',
  },

  toparlanma: {
    kartBaslik: "HAALA DEEBI'EE KA'UU",
    kartAltBaslik: 'Walitti fufiinsa keessan deebisuu dandeessu',
    kartMesaj: 'Walitti fufiinsa keessan {vurgu} bakka dhaabbate irraa itti fufuu dandeessu.',
    oncekiGun: cogul({ one: 'guyyaa {n}', other: 'guyyaa {n}' }),
    ilerleme: 'Guyyaa {hedef} keessaa {tamam} xumurameera',
    kalan: cogul({
      one: 'Guyyaa {n} dabalataaf salaata shanan hunda guutaa, walitti fufiinsi keessan bakka dhaabbate irraa itti fufa.',
      other: 'Guyyoota {n} dabalataaf salaata shanan hunda guutaa, walitti fufiinsi keessan bakka dhaabbate irraa itti fufa.',
    }),
    bugun: "Har'a guutaa, walitti fufiinsi keessan bakka dhaabbate irraa itti fufa.",
    uyari: "Guyyoonni walitti aanuu qabu; yoo guyyaan tokko gidduutti hafe, deebi'ee ka'uun haaraatti jalqaba.",
    kapatErisim: "Bal'ina deebi'ee ka'uu cufaa",
    anladim: 'Hubadheera',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Guddina keessan qooddadhaa',
    hazirDegilBaslik: "Suuraan qophaa'ee hin jiru",
    hazirDegilMesaj: "Suuraan ammallee qophaa'ee hin jiru. Sekondii muraasa booda irra deebi'aa yaalaa.",
    olusturulamadiBaslik: 'Suuraa uumuu hin dandeenye',
    olusturulamadiMesaj: "Yeroo suuraan uumamu wanti tokko dogoggoreera. Irra deebi'aa yaalaa.",
    kullanilamiyorBaslik: 'Qooddachuun hin jiru',
    kullanilamiyorMesaj: "Qooddachuun meeshaa kana irratti hin danda'amu.",
    kapat: 'Cufaa',
    hikaye: 'Seenaa keessanitti dabalaa',
    platformlar: "Instagram, WhatsApp fi kanneen biroo irratti qoodamuu danda'a.",
    tamam: 'Tole',
    seriEnUzun: cogul({ one: 'Walitti Fufiinsa Koo Isa Dheeraa: Guyyaa {n}', other: 'Walitti Fufiinsa Koo Isa Dheeraa: Guyyaa {n}' }),
    seriZincir: cogul({ one: 'GUYYAA SANSALATA OSOO HIN CITIN', other: 'GUYYOOTA SANSALATA OSOO HIN CITIN' }),
    seriSoz: '"Guyyaa guyyaan tarkaanfii xiqqaa, lubbuu koo keessatti nagaa guddaa. 🔥"',
    rozetYeni: 'MALLATTOO HAARAA ARGADHE',
    rozetSozleri: [
      "Har'a ofii kootiif tarkaanfii gaarii fudhadheera. 🌟",
      'Murannoon itti fufaa jira; mallattoon kun kan kooti. 💪',
      'Eebba ganamaa argadheera. 🌅',
      'Tartiiba lubbuu koo fayyadu kana keessaa qooda qaba. ✨',
      'Tarkaanfiin xiqqaan nagaa guddaa fida. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'MALLATTOO HAARAA ARGADHE',
      hedef_tamamlandi: 'GALMA KOO GAHEERA',
      seviye_atlandi: "SADARKAA OL KA'E",
      toparlanma_tamamlandi: "KARAATTI DEEBI'EERA",
      en_uzun_seri: 'GALMEE HAARAA',
      varsayilan: "MILKAA'INA",
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Gooftaan koo itti haa fufsiisu. 🤲', 'Tarkaanfiin xiqqaan nagaa guddaa fida. 🍃', 'Rabbiin hunda keenyaaf jabina haa kennu. 🌱'],
      hedef_tamamlandi: ['Tarkaanfiin xiqqaan nagaa guddaa fida. 🍃', 'Rabbiin itti haa fufsiisu. 🤲', 'Guyyaa guyyaan tarkaanfii tokko dabalataa. 🌱'],
      seviye_atlandi: [
        'Guyyaa guyyaan xiqqoo fuulduratti; Rabbiin haa salphisu. 🍃',
        'Rabbiin itti haa fufsiisu. 🤲',
        'Imalli itti fufa. 🌱',
      ],
      toparlanma_tamamlandi: [
        "Inni barbaachisaan kufuu osoo hin taane ka'uu dha. 🔄",
        'Rabbiin jabina haa kennu. 🤲',
        'Karaan hundi obsaan deemama. 🌱',
      ],
      en_uzun_seri: [
        'Guyyaa guyyaan tarkaanfii xiqqaa, onnee koo keessatti nagaa guddaa. 🍃',
        'Rabbiin itti haa fufsiisu. 🤲',
        'Gooftaan koo hunda keenyaaf jabina haa kennu. 🌱',
      ],
    },
  },
};
