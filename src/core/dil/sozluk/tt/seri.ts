import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Seri = "серия"; "Allah daim etsin" = "Аллаһ даими кылсын", "Allah sebat versin" = "Аллаһ ныклык
 * бирсен" (türetildi, yerli okuyucu baksın). Övgü ve "!" yok (Microsoft tt: ünlem resmî değil).
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Сериягезнең уты яна',
    enUzun: cogul({ one: 'Иң озын серия: {n} көн', other: 'Иң озын серия: {n} көн' }),
    gunBuyuk: cogul({ one: 'КӨН', other: 'КӨН' }),
    sonrakiHedef: 'Чираттагы максат: {hedef} көн ({durum})',
    kalanGun: cogul({ one: '{n} көн калды', other: '{n} көн калды' }),
    tamamlandi: 'Үтәлде',
    paylasErisim: 'Казанышыгыз белән уртаклашу',
    paylasBuyuk: 'КАЗАНЫШЫГЫЗ БЕЛӘН УРТАКЛАШЫГЫЗ',
  },

  hedefler: {
    ilk_adim: { ad: 'Беренче атна', aciklama: '7 көн өзлексез намаз укы', cumle: 'Беренче атна' },
    aliskanlik_ustasi: { ad: 'Гадәт остасы', aciklama: '21 көн — гадәт формалашу вакыты', cumle: 'Гадәт остасы' },
    kararlilik: { ad: 'Ныклык', aciklama: '60 көн өзлексез', cumle: 'Ныклык' },
    efsane: { ad: 'Легенда', aciklama: '90 көн — аерым ныклык', cumle: 'Легенда' },
  },

  /** Klasik derece adları, Tatarca yazımla (çeviri değil). */
  seviyeler: ['Мөбтәди', 'Талиб', 'Сәлик', 'Мөрид', 'Гариф', 'Хафиз', 'Камил'],

  rozetler: {
    ilk_adim: { ad: 'Беренче адым', aciklama: 'Беренче атнаны тәмамладыгыз.', kosul: '7 көнлек серия' },
    aliskanlik_ustasi: {
      ad: 'Гадәт остасы',
      aciklama: '21 көн — гадәт формалашу вакыты тәмамланды.',
      kosul: '21 көнлек серия',
    },
    kararlilik: { ad: 'Нык', aciklama: '60 көн өзлексез намаз укыдыгыз.', kosul: '60 көнлек серия' },
    efsane: { ad: 'Легенда', aciklama: '90 көн — аерым ныклык күрсәттегез.', kosul: '90 көнлек серия' },
    toparlanma_ustasi: {
      ad: 'Торгызу остасы',
      aciklama: 'Торгызу режимын 3 тапкыр уңышлы тәмамладыгыз.',
      kosul: '3 тапкыр торгызу',
    },
    mukemmeliyetci: { ad: 'Камил', aciklama: '30 көн буе 5/5 намаз укыдыгыз.', kosul: '30 көн 5/5 намаз' },
    yuz_namaz: { ad: '100 намаз', aciklama: 'Барлыгы 100 намаз укыдыгыз.', kosul: '100 намаз уку' },
    bin_namaz: { ad: '1000 намаз', aciklama: 'Барлыгы 1000 намаз укыдыгыз.', kosul: '1000 намаз уку' },
  },

  rozetSeviyeleri: { bronz: 'БРОНЗА', gumus: 'КӨМЕШ', altin: 'АЛТЫН', elmas: 'АЛМАЗ' },

  gunBitis: {
    erken: 'Иртә ятучылар өчен',
    varsayilan: 'Стандарт — күп җирдә иртәнге вакыттан алда',
    gec: 'Соң ятучылар өчен',
  },

  kutlama: {
    rozetEklendi: '🏅 Бүләкләр җыентыгыгызга өстәлде',
    paylasin: 'Уртаклашу',
    rozetBaslik: 'Аллаһ даими кылсын',
    rozetMesaj: '«{ad}» бүләген алдыгыз.',
    hedefBaslik: cogul({ one: '{n} көн', other: '{n} көн' }),
    hedefMesaj: '«{ad}» максатын үтәдегез. Аллаһ даими кылсын.',
    yeniRank: 'Яңа дәрәҗә: {rank}',
    seviyeBaslik: 'Яңа дәрәҗәгез',
    seviyeMesaj: 'Хәзер «{rank}» булып дәвам итәсез. Аллаһ даими кылсын.',
    toparlanmaBaslik: 'Сериягез кире кайтты',
    toparlanmaMesaj: cogul({
      one: '{n} көнлек сериягез калган җиреннән дәвам итә. Аллаһ ныклык бирсен.',
      other: '{n} көнлек сериягез калган җиреннән дәвам итә. Аллаһ ныклык бирсен.',
    }),
    enUzunBaslik: 'Иң озын сериягез',
    enUzunMesaj: cogul({
      one: '{n} көн; моңарчы иң озын сериягез. Аллаһ даими кылсын.',
      other: '{n} көн; моңарчы иң озын сериягез. Аллаһ даими кылсын.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Узган язмаларыгызны хәзер укып булмады.',
    yenidenErisim: 'Серия мәгълүматларын яңадан йөкләү',
    yenidenDeneyin: 'Кабатлап карагыз',
    yukleniyor: 'Серия мәгълүматларыгыз йөкләнә...',
    gunlukSeri: 'көнлек серия',
    rekor: 'рекорд',
    sozErisim: '{metin} Чыганак: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Чираттагы максат',
    tumu: 'Бөтен бүләкләрне алдыгыз',
    kalan: cogul({ one: '{ad} бүләгенә {n} көн калды', other: '{ad} бүләгенә {n} көн калды' }),
    tumuErisim: 'Бөтен бүләкләрне алдыгыз: тәсбих тулысынча тулды.',
    erisim: '{ad} бүләге: {hedef} көннең {n} көне үтәлде.',
  },

  gok: {
    gunHarfleri: ['Д', 'С', 'Ч', 'П', 'Җ', 'Ш', 'Я'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} көн максат үтәлде', other: '{n} көн максат үтәлде' }),
    besVakit: cogul({ one: '{n} көн биш вакыт тулы укылды', other: '{n} көн биш вакыт тулы укылды' }),
    dondurulmus: cogul({ one: '{n} көн туктатылган', other: '{n} көн туктатылган' }),
    mevcutSeri: cogul({ one: 'Хәзерге серия: {n} көн.', other: 'Хәзерге серия: {n} көн.' }),
  },

  hedefAyar: {
    azalt: 'Киметү',
    deger: 'Кыйммәт',
    artir: 'Арттыру',
    esik: cogul({ one: '{n} намаз', other: '{n} намаз' }),
    sifirlaBaslik: 'Серияне нульләү',
    sifirlaMesaj: 'Бөтен серия мәгълүматларыгыз (серия, бүләкләр, баллар) нульләнәчәк. Бу гамәлне кире кайтарып булмый. Дәвам итәсезме?',
    sifirla: 'Нульләү',
    iptal: 'Баш тарту',
    basarili: 'Әзер',
    sifirlandi: 'Серия мәгълүматларыгыз нульләнде.',
    hedefAyarlari: 'МАКСАТ КӨЙЛӘҮЛӘРЕ',
    tamGunEsigi: 'Тулы көн чиге',
    tamGunAciklama: 'Көннең сериясе үтәлгән дип саналсын өчен көненә укырга кирәкле иң аз намаз санын билгели',
    sifirlama: 'НУЛЬЛӘҮ',
    verileriSifirla: 'Серия мәгълүматларын нульләү',
    verileriSifirlaAlt: 'Бөтен серия, бүләк һәм балл мәгълүматларын бетерә',
  },

  rozetKarti: {
    erisim: '{ad} бүләге, {durum}',
    kazanildi: 'алынды',
    kilitli: 'бикле',
  },

  toparlanma: {
    kartBaslik: 'ТОРГЫЗУ РЕЖИМЫ',
    kartAltBaslik: 'Сериягезне кайтара аласыз',
    kartMesaj: '{vurgu} сериягезне калган җиреннән дәвам итә аласыз.',
    oncekiGun: cogul({ one: '{n} көнлек', other: '{n} көнлек' }),
    ilerleme: '{tamam}/{hedef} көн үтәлде',
    kalan: cogul({
      one: 'Тагын {n} көн биш вакытны тулы укысагыз, сериягез калган җиреннән дәвам итә.',
      other: 'Тагын {n} көн биш вакытны тулы укысагыз, сериягез калган җиреннән дәвам итә.',
    }),
    bugun: 'Бүгенне тулы тәмамласагыз, сериягез калган җиреннән дәвам итә.',
    uyari: 'Бу көннәрне рәттән тәмамлау җитә; арада буш көн калса, торгызу яңадан башлана.',
    kapatErisim: 'Торгызу тәрәзәсен ябу',
    anladim: 'Аңлашылды',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Казанышың белән уртаклаш',
    hazirDegilBaslik: 'Сурәт әзер түгел',
    hazirDegilMesaj: 'Сурәт әле әзер түгел. Берничә секундтан соң кабатлап карагыз.',
    olusturulamadiBaslik: 'Сурәт ясалмады',
    olusturulamadiMesaj: 'Сурәт ясаганда хата килеп чыкты. Кабатлап карагыз.',
    kullanilamiyorBaslik: 'Уртаклашу мөмкин түгел',
    kullanilamiyorMesaj: 'Бу җайланмада уртаклашу мөмкинлеге юк.',
    kapat: 'Ябу',
    hikaye: 'Сторисга өстәү',
    platformlar: 'Instagram, WhatsApp һәм башкаларда уртаклашырга мөмкин.',
    tamam: 'Ярый',
    seriEnUzun: cogul({ one: 'Иң озын сериям: {n} көн', other: 'Иң озын сериям: {n} көн' }),
    seriZincir: cogul({ one: 'КӨН БУЕ ЧЫЛБЫРНЫ ӨЗМӘДЕМ', other: 'КӨН БУЕ ЧЫЛБЫРНЫ ӨЗМӘДЕМ' }),
    seriSoz: '«Көн саен кечкенә адым, җанымда зур тынычлык. 🔥»',
    rozetYeni: 'ЯҢА БҮЛӘК АЛДЫМ',
    rozetSozleri: [
      'Бүген үзем өчен яхшы адым ясадым. 🌟',
      'Ныклык белән дәвам итәм, бу бүләк минеке. 💪',
      'Иртәнең бәрәкәтен таптым. 🌅',
      'Җанга яхшы тәэсир итүче бу агымда мин дә бар. ✨',
      'Кечкенә адымнар зур тынычлык китерә. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'ЯҢА БҮЛӘК АЛДЫМ',
      hedef_tamamlandi: 'МАКСАТЫМА ИРЕШТЕМ',
      seviye_atlandi: 'ЯҢА ДӘРӘҖӘ',
      toparlanma_tamamlandi: 'КИРЕ КАЙТТЫМ',
      en_uzun_seri: 'ЯҢА РЕКОРД',
      varsayilan: 'КАЗАНЫШ',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Раббым даими кылсын. 🤲', 'Кечкенә адымнар зур тынычлык китерә. 🍃', 'Аллаһ барыбызга да ныклык бирсен. 🌱'],
      hedef_tamamlandi: ['Кечкенә адымнар зур тынычлык китерә. 🍃', 'Аллаһ даими кылсын. 🤲', 'Көн саен тагын бер адым. 🌱'],
      seviye_atlandi: [
        'Көн саен бераз алга барам, Аллаһ җиңеллек бирсен. 🍃',
        'Аллаһ даими кылсын. 🤲',
        'Сәфәр дәвам итә. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Егылу түгел, кире торып басу мөһим. 🔄',
        'Аллаһ ныклык бирсен. 🤲',
        'Сабыр белән һәр юл үтелә. 🌱',
      ],
      en_uzun_seri: [
        'Көн саен кечкенә адым, йөрәгемдә зур тынычлык. 🍃',
        'Аллаһ даими кылсын. 🤲',
        'Раббым барыбызга да ныклык бирсен. 🌱',
      ],
    },
  },
};
