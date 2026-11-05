import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri "gexso" (türetildi), rozet "calaamat", puan "nuqta"; dua kalıpları "Allah tet dacrisay" (dacris = korumak, QE). */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Sinni gexso tatrusta',
    enUzun: cogul({ one: 'Xeer le gexso: {n} ayro', other: 'Xeer le gexso: {n} ayro' }),
    gunBuyuk: cogul({ one: 'AYRO', other: 'AYRO' }),
    sonrakiHedef: 'Lakal tan hadaf: ayro {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} ayro raqte', other: '{n} ayro raqte' }),
    tamamlandi: 'Duudume',
    paylasErisim: 'Sinni ossiyya acuwa',
    paylasBuyuk: 'SINNI OSSIYYA ACUWA',
  },

  hedefler: {
    ilk_adim: { ad: 'Naharsi Malcina Ayro', aciklama: '7 ayro xiqsinnaay salat aba', cumle: 'Naharsi malcina ayro' },
    aliskanlik_ustasi: { ad: 'Caada Abba', aciklama: '21 ayro - caada abto wakti', cumle: 'Caada abba' },
    kararlilik: { ad: 'Sabat', aciklama: '60 ayro xiqsinnaay', cumle: 'Sabat' },
    efsane: { ad: 'Kaxxa Gexso', aciklama: '90 ayro - kaxxa sabri', cumle: 'Kaxxa gexso' },
  },

  /** Klasik derece adları, Latin harf çevirisiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Taalib', 'Saalik', 'Muriid', 'Qaarif', 'Xaafiz', 'Kaamil'],

  rozetler: {
    ilk_adim: { ad: 'Naharsi Gurra', aciklama: 'Sinni naharsi malcina ayro duudusteenih.', kosul: '7 ayroh gexso' },
    aliskanlik_ustasi: {
      ad: 'Caada Abba',
      aciklama: '21 ayro - caada abto wakti duudume.',
      kosul: '21 ayroh gexso',
    },
    kararlilik: { ad: 'Sabat le', aciklama: '60 ayro xiqsinnaay salat abteenih.', kosul: '60 ayroh gexso' },
    efsane: { ad: 'Kaxxa Gexso', aciklama: '90 ayro - kaxxa sabri ubulsiteenih.', kosul: '90 ayroh gexso' },
    toparlanma_ustasi: {
      ad: 'Gacissa Abba',
      aciklama: 'Gacissa caala sidiica adda duudusteenih.',
      kosul: '3 gacissa',
    },
    mukemmeliyetci: { ad: 'Duudusa', aciklama: '30 ayro 5/5 salat abteenih.', kosul: '30 ayro 5/5 salat' },
    yuz_namaz: { ad: '100 Salat', aciklama: 'Inkih 100 salat abteenih.', kosul: '100 salat aba' },
    bin_namaz: { ad: '1000 Salat', aciklama: 'Inkih 1000 salat abteenih.', kosul: '1000 salat aba' },
  },

  rozetSeviyeleri: { bronz: 'BRONZ', gumus: 'BIRTA BOOL', altin: 'DAHAB', elmas: 'ALMAAS' },

  gunBitis: {
    erken: 'Sissikak xiinaa marah',
    varsayilan: 'Isih - maggo aracal Subcik dumak',
    gec: 'Raaqak xiinaa marah',
  },

  kutlama: {
    rozetEklendi: '🏅 Sinni calaamat kitaabal osime',
    paylasin: 'Acuwa',
    rozetBaslik: 'Allah tet dacrisay',
    rozetMesaj: '"{ad}" calaamat geyteenih.',
    hedefBaslik: cogul({ one: '{n} ayro', other: '{n} ayro' }),
    hedefMesaj: '"{ad}" hadaf duudusteenih. Allah tet dacrisay.',
    yeniRank: 'Qusba darja: {rank}',
    seviyeBaslik: 'Sinni qusba darja',
    seviyeMesaj: 'Asaakuk "{rank}" innal gexxaanam. Allah tet dacrisay.',
    toparlanmaBaslik: 'Sinni gexso gacte',
    toparlanmaMesaj: cogul({
      one: 'Sinni {n} ayroh gexso tet cabteen arackal tatrusta. Allah sabat siinih acuway.',
      other: 'Sinni {n} ayroh gexso tet cabteen arackal tatrusta. Allah sabat siinih acuway.',
    }),
    enUzunBaslik: 'Sinni xeer le gexso',
    enUzunMesaj: cogul({
      one: '{n} ayro: asaaku fanah sinni xeer le gexso. Allah tet dacrisay.',
      other: '{n} ayro: asaaku fanah sinni xeer le gexso. Allah tet dacrisay.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Sinni duma maxco asaaku ikriyime wee.',
    yenidenErisim: 'Gexsoh maxco kaadu beya',
    yenidenDeneyin: 'Kaadu mokkora',
    yukleniyor: 'Sinni gexsoh maxco beyimta...',
    gunlukSeri: 'ayroh gexso',
    rekor: 'fayya le',
    sozErisim: '{metin} Qaxxa: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Lakal tan hadaf',
    tumu: 'Calaamat inkih duudusteenih',
    kalan: cogul({ one: '{ad} calaamat: {n} ayro raqte', other: '{ad} calaamat: {n} ayro raqte' }),
    tumuErisim: 'Calaamat inkih duudusteenih: tasbiix kaxxa.',
    erisim: '{ad} calaamat: {hedef} ayrok {n} duudume.',
  },

  gok: {
    gunHarfleri: ['E', 'T', 'A', 'K', 'G', 'S', 'A'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} ayro hadaf geyte', other: '{n} ayro hadaf geyte' }),
    besVakit: cogul({ one: 'Konoy salat inkih le {n} ayro', other: 'Konoy salat inkih le {n} ayro' }),
    dondurulmus: cogul({ one: '{n} ayro xagisime', other: '{n} ayro xagisime' }),
    mevcutSeri: cogul({ one: 'Asaakuh gexso: {n} ayro.', other: 'Asaakuh gexso: {n} ayro.' }),
  },

  hedefAyar: {
    azalt: 'Dagoysa',
    deger: 'Caddo',
    artir: 'Ossa',
    esik: cogul({ one: '{n} salat', other: '{n} salat' }),
    sifirlaBaslik: 'Gexso qimbisol gacsa',
    sifirlaMesaj: 'Sinni gexsoh maxco inkih (gexso, calaamat, nuqta) qimbisol gacta. Ama ma gacimta. Gexxaanaa?',
    sifirla: 'Qimbisol gacsa',
    iptal: 'Caba',
    basarili: 'Duudume',
    sifirlandi: 'Sinni gexsoh maxco qimbisol gacsime.',
    hedefAyarlari: 'HADAF MASSOSSIYYA',
    tamGunEsigi: 'Ayro inkih caddo',
    tamGunAciklama: 'Ayro sinni gexsol loowimamkeh ayrol faxximta dagom salat loowo haysa',
    sifirlama: 'QIMBISOL GACSA',
    verileriSifirla: 'Gexsoh maxco qimbisol gacsa',
    verileriSifirlaAlt: 'Gexso, calaamat kee nuqtah maxco inkih bayisa',
  },

  rozetKarti: {
    erisim: '{ad} calaamat, {durum}',
    kazanildi: 'geyime',
    kilitli: 'alifime',
  },

  toparlanma: {
    kartBaslik: 'GACISSA CAALA',
    kartAltBaslik: 'Sinni gexso gacsaanam duddan',
    kartMesaj: 'Sinni {vurgu} gexso tet cabteen arackal tatrusam duddan.',
    oncekiGun: cogul({ one: '{n} ayroh', other: '{n} ayroh' }),
    ilerleme: '{hedef} ayrok {tamam} duudume',
    kalan: cogul({
      one: 'Kaadu {n} ayro konoy salat inkih duudusaay sinni gexso tet cabteen arackal tatrusta.',
      other: 'Kaadu {n} ayro konoy salat inkih duudusaay sinni gexso tet cabteen arackal tatrusta.',
    }),
    bugun: 'Asaaku duudusaay sinni gexso tet cabteen arackal tatrusta.',
    uyari: 'Ayyaam ittal tan tekkem faxxa; fanat inki ayro bayek, gacissa qimbisol gacta.',
    kapatErisim: 'Gacissah baxxaqqa alifa',
    anladim: 'Aaxige',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Sinni ossiyya acuwa',
    hazirDegilBaslik: 'Suura ma massoowin',
    hazirDegilMesaj: 'Suura hanna ma massoowin. Dago sekond lakal kaadu mokkora.',
    olusturulamadiBaslik: 'Suura abime wee',
    olusturulamadiMesaj: 'Suura abaanam waqdi hoxa tekke. Kaadu mokkora.',
    kullanilamiyorBaslik: 'Acuwiyya mali',
    kullanilamiyorMesaj: 'Ama aalatal acuwiyya mali.',
    kapat: 'Alifa',
    hikaye: 'Sinni story addal ossa',
    platformlar: 'Instagram, WhatsApp kee akah acuwimta.',
    tamam: 'Meqe',
    seriEnUzun: cogul({ one: 'Yi Xeer le Gexso: {n} Ayro', other: 'Yi Xeer le Gexso: {n} Ayro' }),
    seriZincir: cogul({ one: 'AYRO SILSILA MA XIQSIN', other: 'AYRO SILSILA MA XIQSIN' }),
    seriSoz: '"Ayro ayro qunxa gurra, yi nafsil kaxxa nagay. 🔥"',
    rozetYeni: 'QUSBA CALAAMAT GEYE',
    rozetSozleri: [
      'Asaaku inni yoh meqe gurra abe. 🌟',
      'Sabat luk gexa; ama calaamat yi le. 💪',
      'Saakuh barakat geye. ✨',
      'Yi nafsih meqe ama gexsol anu. ✨',
      'Qunxa gurra kaxxa nagay luk yamaate. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'QUSBA CALAAMAT GEYE',
      hedef_tamamlandi: 'YI HADAF GEYE',
      seviye_atlandi: 'QUSBA DARJA',
      toparlanma_tamamlandi: 'GITAL GACE',
      en_uzun_seri: 'QUSBA FAYYA LE',
      varsayilan: 'GEYO',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Yi Rabbi tet dacrisay. 🤲', 'Qunxa gurra kaxxa nagay luk yamaate. 🍃', 'Allah sabat inkih neh acuway. 🌱'],
      hedef_tamamlandi: ['Qunxa gurra kaxxa nagay luk yamaate. 🍃', 'Allah tet dacrisay. 🤲', 'Ayro ayro kaadu inki gurra. 🌱'],
      seviye_atlandi: [
        'Ayro ayro dago fanah; Allah sahlisay. 🍃',
        'Allah tet dacrisay. 🤲',
        'Gexso tatrusta. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Faxximtam radaanam hinna, ugutaanam kinni. 🔄',
        'Allah sabat neh acuway. 🤲',
        'Ayyu gita sabrit geximta. 🌱',
      ],
      en_uzun_seri: [
        'Ayro ayro qunxa gurra, yi lubbil kaxxa nagay. 🍃',
        'Allah tet dacrisay. 🤲',
        'Yi Rabbi sabat inkih neh acuway. 🌱',
      ],
    },
  },
};
