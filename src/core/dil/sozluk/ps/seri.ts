import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = "لړۍ", rozet = "نښان", seviye = "کچه", toparlanma = "بیا رغونه". Paylaşım sözü kişinin kendi sesidir; övünme yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'ستاسو د لړۍ اور بل دی',
    enUzun: cogul({ one: 'تر ټولو اوږده لړۍ: {n} ورځ', other: 'تر ټولو اوږده لړۍ: {n} ورځې' }),
    gunBuyuk: cogul({ one: 'ورځ', other: 'ورځې' }),
    sonrakiHedef: 'بل هدف: {hedef}مه ورځ ({durum})',
    kalanGun: cogul({ one: '{n} ورځ پاتې ده', other: '{n} ورځې پاتې دي' }),
    tamamlandi: 'بشپړ شو',
    paylasErisim: 'خپل پرمختګ شریک کړئ',
    paylasBuyuk: 'خپل پرمختګ شریک کړئ',
  },

  hedefler: {
    ilk_adim: { ad: 'لومړۍ اونۍ', aciklama: '7 ورځې پرله پسې لمونځ وکړئ', cumle: 'لومړۍ اونۍ' },
    aliskanlik_ustasi: { ad: 'د عادت استاد', aciklama: '21 ورځې - د عادت جوړېدو موده', cumle: 'د عادت استاد' },
    kararlilik: { ad: 'استقامت', aciklama: '60 ورځې پرله پسې دوام', cumle: 'استقامت' },
    efsane: { ad: 'افسانه', aciklama: '90 ورځې - لوړ استقامت', cumle: 'افسانه' },
  },

  /** Klasik mertebe adları (çeviri değil, yazım). */
  seviyeler: ['مبتدي', 'طالب', 'سالک', 'مرید', 'عارف', 'حافظ', 'کامل'],

  rozetler: {
    ilk_adim: { ad: 'لومړی ګام', aciklama: 'تاسو لومړۍ اونۍ بشپړه کړه.', kosul: 'د 7 ورځو لړۍ' },
    aliskanlik_ustasi: {
      ad: 'د عادت استاد',
      aciklama: '21 ورځې - د عادت جوړېدو موده بشپړه شوه.',
      kosul: 'د 21 ورځو لړۍ',
    },
    kararlilik: { ad: 'ثابت قدم', aciklama: 'تاسو 60 ورځې پرله پسې لمونځ وکړ.', kosul: 'د 60 ورځو لړۍ' },
    efsane: { ad: 'افسانه', aciklama: '90 ورځې - تاسو لوړ استقامت وښود.', kosul: 'د 90 ورځو لړۍ' },
    toparlanma_ustasi: {
      ad: 'د بیا رغونې استاد',
      aciklama: 'تاسو 3 ځله د بیا رغونې حالت بشپړ کړ.',
      kosul: '3 ځله بیا رغونه',
    },
    mukemmeliyetci: { ad: 'بشپړتیا غوښتونکی', aciklama: 'تاسو 30 ورځې 5/5 لمونځونه وکړل.', kosul: '30 ورځې 5/5 لمونځونه' },
    yuz_namaz: { ad: '100 لمونځونه', aciklama: 'تاسو ټول 100 لمونځونه وکړل.', kosul: '100 لمونځونه کول' },
    bin_namaz: { ad: '1000 لمونځونه', aciklama: 'تاسو ټول 1000 لمونځونه وکړل.', kosul: '1000 لمونځونه کول' },
  },

  rozetSeviyeleri: { bronz: 'برونز', gumus: 'سپین زر', altin: 'سره زر', elmas: 'الماس' },

  gunBitis: {
    erken: 'د هغو لپاره چې وختي ویده کېږي',
    varsayilan: 'ډیفالټ - په ډېرو ځایونو کې د سهار له وخت مخکې',
    gec: 'د هغو لپاره چې ناوخته ویده کېږي',
  },

  kutlama: {
    rozetEklendi: '🏅 ستاسو د نښانونو ټولګې ته اضافه شو',
    paylasin: 'شریک یې کړئ',
    rozetBaslik: 'الله دې دایمي کړي',
    rozetMesaj: 'تاسو د «{ad}» نښان وګاټه.',
    hedefBaslik: cogul({ one: '{n} ورځ', other: '{n} ورځې' }),
    hedefMesaj: 'تاسو د «{ad}» هدف بشپړ کړ. الله دې دایمي کړي.',
    seviyeBaslik: 'ستاسو نوې کچه',
    yeniRank: 'نوې مرتبه: {rank}',
    seviyeMesaj: 'تاسو اوس د «{rank}» په توګه دوام ورکوئ. الله دې دایمي کړي.',
    toparlanmaBaslik: 'تاسو خپله لړۍ بېرته ترلاسه کړه',
    toparlanmaMesaj: cogul({
      one: 'ستاسو د {n} ورځې لړۍ له هماغه ځایه دوام کوي. الله دې ثابت قدم لرئ.',
      other: 'ستاسو د {n} ورځو لړۍ له هماغه ځایه دوام کوي. الله دې ثابت قدم لرئ.',
    }),
    enUzunBaslik: 'ستاسو تر ټولو اوږده لړۍ',
    enUzunMesaj: cogul({
      one: '{n} ورځ؛ تر اوسه ستاسو تر ټولو اوږده لړۍ. الله دې دایمي کړي.',
      other: '{n} ورځې؛ تر اوسه ستاسو تر ټولو اوږده لړۍ. الله دې دایمي کړي.',
    }),
  },

  sekme: {
    hataOkunamadi: 'ستاسو تېر ریکارډونه اوس نه شي لوستل کېدای.',
    yenidenErisim: 'د لړۍ معلومات بیا وازمویئ',
    yenidenDeneyin: 'بیا هڅه وکړئ',
    yukleniyor: 'د لړۍ معلومات راوړل کېږي...',
    gunlukSeri: 'ورځنۍ لړۍ',
    rekor: 'ریکارډ',
    sozErisim: '{metin} سرچینه: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'بل هدف',
    tumu: 'تاسو ټول نښانونه بشپړ کړل',
    kalan: cogul({ one: 'د {ad} نښان ته {n} ورځ پاتې ده', other: 'د {ad} نښان ته {n} ورځې پاتې دي' }),
    tumuErisim: 'تاسو ټول نښانونه بشپړ کړل: تسبیح بشپړه ډکه ده.',
    erisim: 'د {ad} نښان: له {hedef} ورځو څخه {n} بشپړې شوې.',
  },

  gok: {
    gunHarfleri: ['د', 'د', 'څ', 'پ', 'ج', 'ا', 'ي'],
    erisim: '{ay}. {hedef}، {bes}، {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} ورځ هدف ترلاسه شو', other: '{n} ورځې هدف ترلاسه شو' }),
    besVakit: cogul({ one: 'په {n} ورځ کې پنځه واړه وختونه بشپړ شول', other: 'په {n} ورځو کې پنځه واړه وختونه بشپړ شول' }),
    dondurulmus: cogul({ one: '{n} ورځ کنګل شوې', other: '{n} ورځې کنګل شوې' }),
    mevcutSeri: cogul({ one: 'اوسنۍ لړۍ {n} ورځ.', other: 'اوسنۍ لړۍ {n} ورځې.' }),
  },

  hedefAyar: {
    azalt: 'کم یې کړئ',
    deger: 'ارزښت',
    artir: 'زیات یې کړئ',
    esik: cogul({ one: '{n} وخت', other: '{n} وختونه' }),
    sifirlaBaslik: 'لړۍ له سره پیل کړئ',
    sifirlaMesaj: 'ستاسو د لړۍ ټول معلومات (لړۍ، نښانونه، نمرې) به پاک شي. دا کار بېرته نه راګرځي. ایا غواړئ ادامه ورکړئ؟',
    sifirla: 'له سره یې پیل کړئ',
    iptal: 'لغوه',
    basarili: 'بشپړ شو',
    sifirlandi: 'ستاسو د لړۍ معلومات پاک شول.',
    hedefAyarlari: 'د هدف ترتیبات',
    tamGunEsigi: 'د بشپړې ورځې پوله',
    tamGunAciklama: 'دا ټاکي چې د یوې ورځې لړۍ بشپړه وګڼل شي، په ورځ کې باید لږ تر لږه څو لمونځونه وکړئ',
    sifirlama: 'له سره پیلول',
    verileriSifirla: 'د لړۍ معلومات پاک کړئ',
    verileriSifirlaAlt: 'د لړۍ، نښانونو او نمرو ټول معلومات ړنګوي',
  },

  rozetKarti: {
    erisim: 'د {ad} نښان، {durum}',
    kazanildi: 'ګټل شوی',
    kilitli: 'تړلی',
  },

  toparlanma: {
    kartBaslik: 'د بیا رغونې حالت',
    kartAltBaslik: 'خپله لړۍ بېرته ترلاسه کولای شئ',
    kartMesaj: 'خپلې {vurgu} لړۍ ته له هماغه ځایه دوام ورکولای شئ.',
    oncekiGun: cogul({ one: 'د {n} ورځې', other: 'د {n} ورځو' }),
    ilerleme: '{tamam}/{hedef} ورځې بشپړې شوې',
    kalan: cogul({
      one: 'که {n} ورځ نور پنځه واړه وختونه بشپړ کړئ، ستاسو لړۍ له هماغه ځایه دوام کوي.',
      other: 'که {n} ورځې نور پنځه واړه وختونه بشپړ کړئ، ستاسو لړۍ له هماغه ځایه دوام کوي.',
    }),
    bugun: 'کله چې نن بشپړ کړئ، ستاسو لړۍ له هماغه ځایه دوام کوي.',
    uyari: 'بس دا ورځې پرله پسې بشپړې کړئ؛ که په منځ کې یوه تشه ورځ پاتې شي، بیا رغونه له سره پیلېږي.',
    kapatErisim: 'د بیا رغونې کړکۍ وتړئ',
    anladim: 'پوه شوم',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'خپل پرمختګ شریک کړئ',
    hazirDegilBaslik: 'انځور چمتو نه دی',
    hazirDegilMesaj: 'انځور لا چمتو نه دی. څو ثانیې وروسته بیا هڅه وکړئ.',
    olusturulamadiBaslik: 'انځور جوړ نه شو',
    olusturulamadiMesaj: 'د انځور د جوړولو پر مهال تېروتنه وشوه. بیا هڅه وکړئ.',
    kullanilamiyorBaslik: 'شریکول نه کارېږي',
    kullanilamiyorMesaj: 'په دې وسیله کې شریکول نه کارېږي.',
    kapat: 'وتړئ',
    hikaye: 'خپلې کیسې ته یې اضافه کړئ',
    platformlar: 'په Instagram، WhatsApp او نورو کې شریکېدای شي.',
    tamam: 'سمه ده',
    seriEnUzun: cogul({ one: 'زما تر ټولو اوږده لړۍ: {n} ورځ', other: 'زما تر ټولو اوږده لړۍ: {n} ورځې' }),
    seriZincir: cogul({ one: 'ورځ مې لړۍ نه ده ماته کړې', other: 'ورځې مې لړۍ نه ده ماته کړې' }),
    seriSoz: '"هره ورځ یو کوچنی ګام، زما په روح کې لویه ارامي. 🔥"',
    rozetYeni: 'یو نوی نښان مې وګاټه',
    rozetSozleri: [
      'نن مې د ځان لپاره یو ښه ګام پورته کړ. 🌟',
      'په هوډ سره دوام ورکوم؛ الله دې دوام راکړي. 💪',
      'د سهار برکت مې ترلاسه کړ. 🌅',
      'زه هم په دې بهیر کې یم چې زما روح ته ښه دی. ✨',
      'کوچني ګامونه لویه ارامي راوړي. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'نوی نښان مې وګاټه',
      hedef_tamamlandi: 'خپل هدف ته ورسېدم',
      seviye_atlandi: 'نوې کچه',
      toparlanma_tamamlandi: 'بېرته په لار شوم',
      en_uzun_seri: 'نوی ریکارډ',
      varsayilan: 'لاسته راوړنه',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['زما رب دې دایمي کړي. 🤲', 'کوچني ګامونه لویه ارامي راوړي. 🍃', 'الله دې موږ ټول ثابت قدم لري. 🌱'],
      hedef_tamamlandi: ['کوچني ګامونه لویه ارامي راوړي. 🍃', 'الله دې دایمي کړي. 🤲', 'هره ورځ یو بل ګام. 🌱'],
      seviye_atlandi: [
        'هره ورځ لږ نور مخکې ځم، الله دې اسانه کړي. 🍃',
        'الله دې دایمي کړي. 🤲',
        'سفر دوام لري. 🌱',
      ],
      toparlanma_tamamlandi: ['مهمه دا نه ده چې ولوېږې، مهمه دا ده چې پاڅېږې. 🔄', 'الله دې ثابت قدم لري. 🤲', 'په صبر هره لار وهل کېږي. 🌱'],
      en_uzun_seri: [
        'هره ورځ یو کوچنی ګام، زما په زړه کې لویه ارامي. 🍃',
        'الله دې دایمي کړي. 🤲',
        'زما رب دې موږ ټول ثابت قدم لري. 🌱',
      ],
    },
  },
};
