import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'اوهان جو تسلسل جاري آهي',
    enUzun: cogul({ one: 'سڀ کان ڊگهو تسلسل: {n} ڏينهن', other: 'سڀ کان ڊگهو تسلسل: {n} ڏينهن' }),
    gunBuyuk: cogul({ one: 'ڏينهن', other: 'ڏينهن' }),
    sonrakiHedef: 'ايندڙ مقصد: ڏينهن {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} ڏينهن باقي', other: '{n} ڏينهن باقي' }),
    tamamlandi: 'پورو ٿيو',
    paylasErisim: 'پنهنجي ترقي شيئر ڪريو',
    paylasBuyuk: 'پنهنجي ترقي شيئر ڪريو',
  },

  hedefler: {
    ilk_adim: { ad: 'پهريون هفتو', aciklama: '7 ڏينهن بنا وقفي نماز پڙهو', cumle: 'پهريون هفتو' },
    aliskanlik_ustasi: { ad: 'عادت جو ماهر', aciklama: '21 ڏينهن - عادت ٺهڻ جو عرصو', cumle: 'عادت جو ماهر' },
    kararlilik: { ad: 'ثابت قدمي', aciklama: '60 ڏينهن بنا وقفي', cumle: 'ثابت قدمي' },
    efsane: { ad: 'مثالي', aciklama: '90 ڏينهن - شاندار استقامت', cumle: 'مثالي' },
  },

  /** Klasik derece adları, Arapça kökenli (çevrilmedi, harf aktarımı). */
  seviyeler: ['مبتدي', 'طالب', 'سالڪ', 'مريد', 'عارف', 'حافظ', 'ڪامل'],

  rozetler: {
    ilk_adim: { ad: 'پهريون قدم', aciklama: 'اوهان پنهنجو پهريون هفتو پورو ڪيو.', kosul: '7 ڏينهن جو تسلسل' },
    aliskanlik_ustasi: {
      ad: 'عادت جو ماهر',
      aciklama: '21 ڏينهن - عادت ٺهڻ جو عرصو پورو ٿيو.',
      kosul: '21 ڏينهن جو تسلسل',
    },
    kararlilik: { ad: 'ثابت قدم', aciklama: 'اوهان 60 ڏينهن بنا وقفي نماز پڙهي.', kosul: '60 ڏينهن جو تسلسل' },
    efsane: { ad: 'مثالي', aciklama: '90 ڏينهن - اوهان شاندار استقامت ڏيکاري.', kosul: '90 ڏينهن جو تسلسل' },
    toparlanma_ustasi: {
      ad: 'بحاليءَ جو ماهر',
      aciklama: 'اوهان بحالي موڊ 3 ڀيرا پورو ڪيو.',
      kosul: '3 بحاليون',
    },
    mukemmeliyetci: { ad: 'مڪمل', aciklama: 'اوهان 30 ڏينهن 5/5 نماز پڙهي.', kosul: '30 ڏينهن 5/5 نمازون' },
    yuz_namaz: { ad: '100 نمازون', aciklama: 'اوهان ڪل 100 نمازون پڙهيون.', kosul: '100 نمازون پڙهو' },
    bin_namaz: { ad: '1000 نمازون', aciklama: 'اوهان ڪل 1000 نمازون پڙهيون.', kosul: '1000 نمازون پڙهو' },
  },

  rozetSeviyeleri: { bronz: 'برونز', gumus: 'چانديءَ', altin: 'سون', elmas: 'هيرو' },

  gunBitis: {
    erken: 'جلدي سمهندڙن لاءِ',
    varsayilan: 'ڊفالٽ - گهڻين جاين تي فجر کان اڳ',
    gec: 'دير سان سمهندڙن لاءِ',
  },

  kutlama: {
    rozetEklendi: '🏅 اوهان جي بيجن جي مجموعي ۾ شامل ٿيو',
    paylasin: 'شيئر ڪريو',
    rozetBaslik: 'الله ان کي قائم رکي',
    rozetMesaj: 'اوهان “{ad}” بيج حاصل ڪيو.',
    hedefBaslik: cogul({ one: '{n} ڏينهن', other: '{n} ڏينهن' }),
    hedefMesaj: 'اوهان “{ad}” مقصد پورو ڪيو. الله ان کي قائم رکي.',
    yeniRank: 'نئون درجو: {rank}',
    seviyeBaslik: 'اوهان جي نئين سطح',
    seviyeMesaj: 'هاڻي اوهان “{rank}” طور جاري آهيو. الله ان کي قائم رکي.',
    toparlanmaBaslik: 'اوهان جو تسلسل واپس آيو',
    toparlanmaMesaj: cogul({
      one: 'اوهان جو {n} ڏينهن جو تسلسل اتان ئي جاري آهي جتان رڪيو هو. الله استقامت ڏئي.',
      other: 'اوهان جو {n} ڏينهن جو تسلسل اتان ئي جاري آهي جتان رڪيو هو. الله استقامت ڏئي.',
    }),
    enUzunBaslik: 'اوهان جو سڀ کان ڊگهو تسلسل',
    enUzunMesaj: cogul({
      one: '{n} ڏينهن: هيستائين اوهان جو سڀ کان ڊگهو تسلسل. الله ان کي قائم رکي.',
      other: '{n} ڏينهن: هيستائين اوهان جو سڀ کان ڊگهو تسلسل. الله ان کي قائم رکي.',
    }),
  },

  sekme: {
    hataOkunamadi: 'اوهان جا پراڻا رڪارڊ هن وقت پڙهي نه سگهياسين.',
    yenidenErisim: 'تسلسل جي ڊيٽا ٻيهر لوڊ ڪريو',
    yenidenDeneyin: 'ٻيهر ڪوشش ڪريو',
    yukleniyor: 'اوهان جي تسلسل جي ڊيٽا لوڊ ٿي رهي آهي...',
    gunlukSeri: 'ڏينهن جو تسلسل',
    rekor: 'رڪارڊ',
    sozErisim: '{metin} ماخذ: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'ايندڙ مقصد',
    tumu: 'اوهان سڀ بيج پورا ڪيا',
    kalan: cogul({ one: '{ad} بيج: {n} ڏينهن باقي', other: '{ad} بيج: {n} ڏينهن باقي' }),
    tumuErisim: 'اوهان سڀ بيج پورا ڪيا: تسبيح مڪمل آهي.',
    erisim: '{ad} بيج: {hedef} مان {n} ڏينهن پورا.',
  },

  gok: {
    gunHarfleri: ['سو', 'اڱ', 'ار', 'خم', 'جم', 'ڇن', 'آچ'],
    erisim: '{ay}. {hedef}، {bes}، {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} ڏينهن مقصد پورو ٿيو', other: '{n} ڏينهن مقصد پورو ٿيو' }),
    besVakit: cogul({ one: 'پنجئي نمازن وارو {n} ڏينهن', other: 'پنجئي نمازن وارا {n} ڏينهن' }),
    dondurulmus: cogul({ one: '{n} ڏينهن منجمد', other: '{n} ڏينهن منجمد' }),
    mevcutSeri: cogul({ one: 'موجوده تسلسل: {n} ڏينهن.', other: 'موجوده تسلسل: {n} ڏينهن.' }),
  },

  hedefAyar: {
    azalt: 'گهٽايو',
    deger: 'قدر',
    artir: 'وڌايو',
    esik: cogul({ one: '{n} نماز', other: '{n} نمازون' }),
    sifirlaBaslik: 'تسلسل ري سيٽ ڪريو',
    sifirlaMesaj: 'اوهان جي تسلسل جي سموري ڊيٽا (تسلسل، بيج، پوائنٽ) ري سيٽ ٿي ويندي. اهو واپس نٿو ٿي سگهي. ڇا جاري رکڻ چاهيو ٿا؟',
    sifirla: 'ري سيٽ ڪريو',
    iptal: 'منسوخ ڪريو',
    basarili: 'ٿي ويو',
    sifirlandi: 'اوهان جي تسلسل جي ڊيٽا ري سيٽ ٿي وئي.',
    hedefAyarlari: 'مقصد جون سيٽنگون',
    tamGunEsigi: 'پوري ڏينهن جي حد',
    tamGunAciklama: 'ڏينهن کي تسلسل ۾ شمار ڪرڻ لاءِ روزانو گهٽ ۾ گهٽ ڪيتريون نمازون گهرجن، اهو مقرر ڪري ٿو',
    sifirlama: 'ري سيٽ',
    verileriSifirla: 'تسلسل جي ڊيٽا ري سيٽ ڪريو',
    verileriSifirlaAlt: 'تسلسل، بيج ۽ پوائنٽن جي سموري ڊيٽا ختم ڪري ٿو',
  },

  rozetKarti: {
    erisim: '{ad} بيج، {durum}',
    kazanildi: 'حاصل ڪيل',
    kilitli: 'بند',
  },

  toparlanma: {
    kartBaslik: 'بحالي موڊ',
    kartAltBaslik: 'اوهان پنهنجو تسلسل واپس آڻي سگهو ٿا',
    kartMesaj: 'اوهان پنهنجو {vurgu} تسلسل اتان ئي جاري رکي سگهو ٿا جتان رڪيو هو.',
    oncekiGun: cogul({ one: '{n} ڏينهن جو', other: '{n} ڏينهن جو' }),
    ilerleme: '{hedef} مان {tamam} ڏينهن پورا',
    kalan: cogul({
      one: 'وڌيڪ {n} ڏينهن پنجئي نمازون پوريون ڪريو ته اوهان جو تسلسل اتان ئي جاري رهندو جتان رڪيو هو.',
      other: 'وڌيڪ {n} ڏينهن پنجئي نمازون پوريون ڪريو ته اوهان جو تسلسل اتان ئي جاري رهندو جتان رڪيو هو.',
    }),
    bugun: 'اڄ پورو ڪريو ته اوهان جو تسلسل اتان ئي جاري رهندو جتان رڪيو هو.',
    uyari: 'ڏينهن لڳاتار هجڻ گهرجن؛ جيڪڏهن وچ ۾ ڪو ڏينهن رهجي ويو ته بحالي ٻيهر شروع ٿيندي.',
    kapatErisim: 'بحاليءَ جا تفصيل بند ڪريو',
    anladim: 'سمجهي ويو',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'پنهنجي ترقي شيئر ڪريو',
    hazirDegilBaslik: 'تصوير تيار ناهي',
    hazirDegilMesaj: 'تصوير اڃا تيار ناهي. ڪجهه سيڪنڊن ۾ ٻيهر ڪوشش ڪريو.',
    olusturulamadiBaslik: 'تصوير ٺهي نه سگهي',
    olusturulamadiMesaj: 'تصوير ٺاهڻ دوران ڪجهه غلط ٿي ويو. ٻيهر ڪوشش ڪريو.',
    kullanilamiyorBaslik: 'شيئر ڪرڻ دستياب ناهي',
    kullanilamiyorMesaj: 'هن ڊوائيس تي شيئر ڪرڻ دستياب ناهي.',
    kapat: 'بند ڪريو',
    hikaye: 'پنهنجي اسٽوري ۾ شامل ڪريو',
    platformlar: 'Instagram، WhatsApp ۽ ٻين تي شيئر ڪري سگهجي ٿو.',
    tamam: 'ٺيڪ',
    seriEnUzun: cogul({ one: 'منهنجو سڀ کان ڊگهو تسلسل: {n} ڏينهن', other: 'منهنجو سڀ کان ڊگهو تسلسل: {n} ڏينهن' }),
    seriZincir: cogul({ one: 'ڏينهن زنجير ٽوڙڻ کان سواءِ', other: 'ڏينهن زنجير ٽوڙڻ کان سواءِ' }),
    seriSoz: '“هر روز ننڍو قدم، منهنجي روح ۾ وڏو سڪون. 🔥”',
    rozetYeni: 'مون نئون بيج حاصل ڪيو',
    rozetSozleri: [
      'اڄ مون پنهنجي لاءِ هڪ سٺو قدم کنيو. 🌟',
      'ارادي سان سفر جاري آهي؛ هي بيج منهنجو آهي. 💪',
      'مون صبح جي برڪت ماڻي. 🌅',
      'منهنجي روح کي سڪون ڏيندڙ هن سلسلي جو حصو آهيان. ✨',
      'ننڍا قدم وڏو سڪون آڻين ٿا. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'مون نئون بيج حاصل ڪيو',
      hedef_tamamlandi: 'مون پنهنجو مقصد ماڻيو',
      seviye_atlandi: 'نئين سطح',
      toparlanma_tamamlandi: 'ٻيهر رستي تي',
      en_uzun_seri: 'نئون رڪارڊ',
      varsayilan: 'ڪاميابي',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['منهنجو رب ان کي قائم رکي. 🤲', 'ننڍا قدم وڏو سڪون آڻين ٿا. 🍃', 'الله اسان سڀني کي استقامت ڏئي. 🌱'],
      hedef_tamamlandi: ['ننڍا قدم وڏو سڪون آڻين ٿا. 🍃', 'الله ان کي قائم رکي. 🤲', 'هر روز هڪ قدم وڌيڪ. 🌱'],
      seviye_atlandi: [
        'هر روز ٿورو اڳتي؛ الله آسان ڪري. 🍃',
        'الله ان کي قائم رکي. 🤲',
        'سفر جاري آهي. 🌱',
      ],
      toparlanma_tamamlandi: [
        'اهم ڪرڻ ناهي، اهم اٿڻ آهي. 🔄',
        'الله استقامت ڏئي. 🤲',
        'هر رستو صبر سان طئي ٿئي ٿو. 🌱',
      ],
      en_uzun_seri: [
        'هر روز ننڍو قدم، منهنجي دل ۾ وڏو سڪون. 🍃',
        'الله ان کي قائم رکي. 🤲',
        'منهنجو رب اسان سڀني کي استقامت ڏئي. 🌱',
      ],
    },
  },
};
