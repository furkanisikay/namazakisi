import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Seri "dolibu" (ardı ardına gelme; türetildi), toparlanma "labi yiɣisibu", rozet "baaji" (İngilizce
 * kökenli). Dua kalıpları "Allah ni chɛ ka di kpalim" (kalıcı kılsın), "Allah ni kpaŋsi ti" (sebat
 * versin; "kpaŋsi" QuranEnc'te tanıklı); türetildi. "!" ve övgü yok.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Yi dolibu buɣim nyɔri',
    enUzun: cogul({ one: 'Dolibu din waɣi gari: dabsa {n}', other: 'Dolibu din waɣi gari: dabsa {n}' }),
    gunBuyuk: cogul({ one: 'DABSA', other: 'DABSA' }),
    sonrakiHedef: 'Yɛltɔɣa din doli: dabsili {hedef} ({durum})',
    kalanGun: cogul({ one: 'Dabsa {n} n-kpalim', other: 'Dabsa {n} n-kpalim' }),
    tamamlandi: 'Di naaya',
    paylasErisim: 'Talimi ya yi tooni chaŋbu',
    paylasBuyuk: 'TALIMI YA YI TOONI CHAŊBU',
  },

  hedefler: {
    ilk_adim: { ad: 'Dabsa ayopɔin din daŋ', aciklama: 'Puhimi ya dabsa 7 ka di bi kɔhi', cumle: 'Dabsa ayopɔin din daŋ' },
    aliskanlik_ustasi: { ad: 'Malibu Lana', aciklama: 'Dabsa 21 - malibu zaligu saha', cumle: 'Malibu lana' },
    kararlilik: { ad: 'Kpiɛŋ', aciklama: 'Dabsa 60 ka di bi kɔhi', cumle: 'Kpiɛŋ' },
    efsane: { ad: 'Kpɛma', aciklama: 'Dabsa 90 - suɣulo din gari', cumle: 'Kpɛma' },
  },

  /** Klasik rütbe adları, harf çevirisiyle (çeviri değil). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Kpalinli din daŋ', aciklama: 'Yi naai yi dabsa ayopɔin din daŋ.', kosul: 'Dabsa 7 dolibu' },
    aliskanlik_ustasi: {
      ad: 'Malibu Lana',
      aciklama: 'Dabsa 21 - malibu zaligu saha naaya.',
      kosul: 'Dabsa 21 dolibu',
    },
    kararlilik: { ad: 'Kpiɛŋ', aciklama: 'Yi puhi dabsa 60 ka di bi kɔhi.', kosul: 'Dabsa 60 dolibu' },
    efsane: { ad: 'Kpɛma', aciklama: 'Dabsa 90 - yi wuhi suɣulo din gari.', kosul: 'Dabsa 90 dolibu' },
    toparlanma_ustasi: {
      ad: 'Labi yiɣisibu Lana',
      aciklama: 'Yi naai labi yiɣisibu soli buta.',
      kosul: 'Labi yiɣisibu 3',
    },
    mukemmeliyetci: { ad: 'Din naai zaa', aciklama: 'Yi puhi 5/5 dabsa 30.', kosul: 'Dabsa 30 jiŋa 5/5' },
    yuz_namaz: { ad: 'Jiŋa 100', aciklama: 'Yi puhi jiŋa 100 zaa.', kosul: 'Puhimi ya jiŋa 100' },
    bin_namaz: { ad: 'Jiŋa 1000', aciklama: 'Yi puhi jiŋa 1000 zaa.', kosul: 'Puhimi ya jiŋa 1000' },
  },

  rozetSeviyeleri: { bronz: 'BRONZI', gumus: 'ANZINFA', altin: 'SALIMA', elmas: 'DAYAMAN' },

  gunBitis: {
    erken: 'Ban gbihiri tooni zuɣu',
    varsayilan: 'Din be - pɔi ka Subaahi paai luɣa pam ni',
    gec: 'Ban gbihiri yuuni zuɣu',
  },

  kutlama: {
    rozetEklendi: '🏅 Bɛ pahi li yi baajinima ni',
    paylasin: 'Talimi ya',
    rozetBaslik: 'Allah ni chɛ ka di kpalim',
    rozetMesaj: 'Yi nya “{ad}” baaji.',
    hedefBaslik: cogul({ one: 'Dabsa {n}', other: 'Dabsa {n}' }),
    hedefMesaj: 'Yi naai “{ad}” yɛltɔɣa. Allah ni chɛ ka di kpalim.',
    yeniRank: 'Daraja palli: {rank}',
    seviyeBaslik: 'Yi daraja palli',
    seviyeMesaj: 'Pumpɔŋɔ yi chaŋdi tooni kamani “{rank}”. Allah ni chɛ ka di kpalim.',
    toparlanmaBaslik: 'Yi dolibu labiya',
    toparlanmaMesaj: cogul({ one: 'Yi dabsa {n} dolibu chaŋdi tooni luɣ’ shɛli di ni daa chɛ. Allah ni kpaŋsi ti.', other: 'Yi dabsa {n} dolibu chaŋdi tooni luɣ’ shɛli di ni daa chɛ. Allah ni kpaŋsi ti.' }),
    enUzunBaslik: 'Yi dolibu din waɣi gari',
    enUzunMesaj: cogul({ one: 'Dabsa {n}: yi dolibu din waɣi gari hali ni pumpɔŋɔ. Allah ni chɛ ka di kpalim.', other: 'Dabsa {n}: yi dolibu din waɣi gari hali ni pumpɔŋɔ. Allah ni chɛ ka di kpalim.' }),
  },

  sekme: {
    hataOkunamadi: 'Bɛ bi tooi karim yi sabbu din gari pumpɔŋɔ.',
    yenidenErisim: 'Lahi kpɛhimi ya dolibu lahabali',
    yenidenDeneyin: 'Lahi niŋmi ya',
    yukleniyor: 'Yi dolibu lahabali kpɛri...',
    gunlukSeri: 'dabsa dolibu',
    rekor: 'din gari zaa',
    sozErisim: '{metin} Yibu shee: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Yɛltɔɣa din doli',
    tumu: 'Yi naai baajinima zaa',
    kalan: cogul({ one: '{ad} baaji: dabsa {n} n-kpalim', other: '{ad} baaji: dabsa {n} n-kpalim' }),
    tumuErisim: 'Yi naai baajinima zaa: tasbihi maa paliya.',
    erisim: '{ad} baaji: dabsa {n} naaya {hedef} puuni.',
  },

  gok: {
    gunHarfleri: ['At', 'Tl', 'Lb', 'Lm', 'Zm', 'Sb', 'Lh'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Dabsa {n} paai yɛltɔɣa', other: 'Dabsa {n} paai yɛltɔɣa' }),
    besVakit: cogul({ one: 'Dabsa {n} ni jiŋa anu maa zaa', other: 'Dabsa {n} ni jiŋa anu maa zaa' }),
    dondurulmus: cogul({ one: 'Dabsa {n} bɛ ni gu', other: 'Dabsa {n} bɛ ni gu' }),
    mevcutSeri: cogul({ one: 'Pumpɔŋɔ dolibu: dabsa {n}.', other: 'Pumpɔŋɔ dolibu: dabsa {n}.' }),
  },

  hedefAyar: {
    azalt: 'Bɔrigimi ya',
    deger: 'Kalinli',
    artir: 'Pahimi ya',
    esik: cogul({ one: 'Jiŋa {n}', other: 'Jiŋa {n}' }),
    sifirlaBaslik: 'Labi pilimi ya dolibu',
    sifirlaMesaj: 'Yi dolibu lahabali zaa (dolibu, baajinima, maaki) ni labi pili. Bɛ ku tooi labi li. Yi bɔri ni yi chaŋ tooni?',
    sifirla: 'Labi pilimi ya',
    iptal: 'Nyahimi ya',
    basarili: 'Di naaya',
    sifirlandi: 'Yi dolibu lahabali labi piliya.',
    hedefAyarlari: 'YƐLTƆƔA MALIZALI',
    tamGunEsigi: 'Dabsili zaa jiŋa kalinli',
    tamGunAciklama: 'Di zaliri jiŋa kalinli shɛli din bi tu ni di bɔrigi dabsili kam, ka dabsili maa kali yi dolibu ni',
    sifirlama: 'LABI PILIBU',
    verileriSifirla: 'Labi pilimi ya dolibu lahabali',
    verileriSifirlaAlt: 'Di yihiri dolibu, baajinima mini maaki lahabali zaa',
  },

  rozetKarti: {
    erisim: '{ad} baaji, {durum}',
    kazanildi: 'yi nya li',
    kilitli: 'kpariya',
  },

  toparlanma: {
    kartBaslik: 'LABI YIƔISIBU SOLI',
    kartAltBaslik: 'Yi ni tooi labi nya yi dolibu',
    kartMesaj: 'Yi ni tooi chaŋ yi {vurgu} dolibu tooni luɣ’ shɛli yi ni daa chɛ.',
    oncekiGun: cogul({ one: 'dabsa {n}', other: 'dabsa {n}' }),
    ilerleme: 'Dabsa {tamam}/{hedef} naaya',
    kalan: cogul({ one: 'Naami ya jiŋa anu maa zaa dabsa {n} din pahi ka yi dolibu ni chaŋ tooni luɣ’ shɛli di ni daa chɛ.', other: 'Naami ya jiŋa anu maa zaa dabsa {n} din pahi ka yi dolibu ni chaŋ tooni luɣ’ shɛli di ni daa chɛ.' }),
    bugun: 'Naami ya zuŋɔ ka yi dolibu ni chaŋ tooni luɣ’ shɛli di ni daa chɛ.',
    uyari: 'Dabsa maa tu ni di doli taba; dabsili yini yi gari di sunsuuni, labi yiɣisibu labi piligirila.',
    kapatErisim: 'Kpihimi ya labi yiɣisibu kahigibu',
    anladim: 'N wum',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Talimi ya yi tooni chaŋbu',
    hazirDegilBaslik: 'Foto na bi naai',
    hazirDegilMesaj: 'Foto maa na bi naai. Lahi niŋmi ya sɛkɛnti biɛla nyaaŋa.',
    olusturulamadiBaslik: 'Bɛ bi tooi nam foto maa',
    olusturulamadiMesaj: 'Chirimbu niŋ foto maa nambu ni. Lahi niŋmi ya.',
    kullanilamiyorBaslik: 'Talibu kani',
    kullanilamiyorMesaj: 'Talibu kani tilifoŋ ŋɔ zuɣu.',
    kapat: 'Kpihimi ya',
    hikaye: 'Pahimi ya yi story ni',
    platformlar: 'Yi ni tooi talim li Instagram, WhatsApp mini din pahi.',
    tamam: 'Di saɣiya',
    seriEnUzun: cogul({ one: 'N Dolibu Din Waɣi Gari: Dabsa {n}', other: 'N Dolibu Din Waɣi Gari: Dabsa {n}' }),
    seriZincir: cogul({ one: 'DABSA KA N BI KƆHI DOLIBU', other: 'DABSA KA N BI KƆHI DOLIBU' }),
    seriSoz: '“Kpalinli biɛla dabsili kam, suhudoo kpeeni n suhu ni. 🔥”',
    rozetYeni: 'N NYA BAAJI PALLI',
    rozetSozleri: [
      'Zuŋɔ n chaŋ kpalinli suŋ n maŋ zuɣu. 🌟',
      'N chaŋdi tooni ni kpiɛmbu; baaji ŋɔ nyɛla n dini. 💪',
      'N nya asiba alibarika. 🌅',
      'N be soli ŋɔ din viɛla n suhu ni puuni. ✨',
      'Kpalinsi biɛla kanaa ni suhudoo kpeeni. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'N NYA BAAJI PALLI',
      hedef_tamamlandi: 'N PAAI N YƐLTƆƔA',
      seviye_atlandi: 'DARAJA PALLI',
      toparlanma_tamamlandi: 'N LABI SOLI ZUƔU',
      en_uzun_seri: 'DIN GARI ZAA PALLI',
      varsayilan: 'TOONI CHAŊBU',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['N Duuma ni chɛ ka di kpalim. 🤲', 'Kpalinsi biɛla kanaa ni suhudoo kpeeni. 🍃', 'Allah ni kpaŋsi ti zaa. 🌱'],
      hedef_tamamlandi: ['Kpalinsi biɛla kanaa ni suhudoo kpeeni. 🍃', 'Allah ni chɛ ka di kpalim. 🤲', 'Kpalinli yini din pahi dabsili kam. 🌱'],
      seviye_atlandi: [
        'Biɛla din pahi dabsili kam; Allah ni chɛ ka di bɔrigi. 🍃',
        'Allah ni chɛ ka di kpalim. 🤲',
        'Soli maa chani tooni. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Din mali bukaata pa lubu, amaa yiɣisibu. 🔄',
        'Allah ni kpaŋsi ti. 🤲',
        'Soli kam chaŋbu nyɛla ni suɣulo. 🌱',
      ],
      en_uzun_seri: [
        'Kpalinli biɛla dabsili kam, suhudoo kpeeni n suhu ni. 🍃',
        'Allah ni chɛ ka di kpalim. 🤲',
        'N Duuma ni kpaŋsi ti zaa. 🌱',
      ],
    },
  },
};
