import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** "Allah daim etsin" → "Allah ardını gətirsin", "Allah sebat versin" → "Allah səbat versin". Böyük hərflər əllə yazılır. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Seriya alovunuz yanır',
    enUzun: cogul({ one: 'Ən uzun seriya: {n} gün', other: 'Ən uzun seriya: {n} gün' }),
    gunBuyuk: cogul({ one: 'GÜN', other: 'GÜN' }),
    sonrakiHedef: 'Növbəti hədəf: {hedef} gün ({durum})',
    kalanGun: cogul({ one: '{n} gün qaldı', other: '{n} gün qaldı' }),
    tamamlandi: 'Tamamlandı!',
    paylasErisim: 'Uğurunuzu paylaşın',
    paylasBuyuk: 'UĞURUNUZU PAYLAŞIN',
  },

  hedefler: {
    ilk_adim: { ad: 'İlk həftə', aciklama: '7 gün fasiləsiz namaz qıl', cumle: 'İlk həftə' },
    aliskanlik_ustasi: { ad: 'Vərdiş ustası', aciklama: '21 gün - vərdiş yaratma müddəti', cumle: 'Vərdiş ustası' },
    kararlilik: { ad: 'Qətiyyət', aciklama: '60 gün fasiləsiz davam', cumle: 'Qətiyyət' },
    efsane: { ad: 'Əfsanə', aciklama: '90 gün - üstün qətiyyət', cumle: 'Əfsanə' },
  },

  /** Klassik dərəcə adları, Azərbaycan yazılışı ilə (tərcümə deyil). */
  seviyeler: ['Mübtədi', 'Talib', 'Salik', 'Mürid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'İlk addım', aciklama: 'İlk həftəni tamamladınız!', kosul: '7 günlük seriya' },
    aliskanlik_ustasi: {
      ad: 'Vərdiş ustası',
      aciklama: '21 gün - vərdiş yaratma müddəti tamamlandı!',
      kosul: '21 günlük seriya',
    },
    kararlilik: { ad: 'Qətiyyətli', aciklama: '60 gün fasiləsiz namaz qıldınız!', kosul: '60 günlük seriya' },
    efsane: { ad: 'Əfsanə', aciklama: '90 gün - üstün qətiyyət göstərdiniz!', kosul: '90 günlük seriya' },
    toparlanma_ustasi: {
      ad: 'Bərpa ustası',
      aciklama: 'Bərpa rejimini 3 dəfə uğurla tamamladınız!',
      kosul: '3 dəfə bərpa',
    },
    mukemmeliyetci: { ad: 'Mükəmməliyyətçi', aciklama: '30 gün ərzində 5/5 namaz qıldınız!', kosul: '30 gün 5/5 namaz' },
    yuz_namaz: { ad: '100 namaz', aciklama: 'Cəmi 100 namaz qıldınız!', kosul: '100 namaz qılmaq' },
    bin_namaz: { ad: '1000 namaz', aciklama: 'Cəmi 1000 namaz qıldınız!', kosul: '1000 namaz qılmaq' },
  },

  rozetSeviyeleri: { bronz: 'BÜRÜNC', gumus: 'GÜMÜŞ', altin: 'QIZIL', elmas: 'ALMAZ' },

  gunBitis: {
    erken: 'Erkən yatanlar üçün',
    varsayilan: 'Standart - əksər hallarda sübh vaxtından əvvəl',
    gec: 'Gec yatanlar üçün',
  },

  kutlama: {
    rozetEklendi: '🏅 Nişan kolleksiyanıza əlavə olundu',
    paylasin: 'Paylaşın',
    rozetBaslik: 'Allah ardını gətirsin',
    rozetMesaj: '"{ad}" nişanını qazandınız.',
    hedefBaslik: cogul({ one: '{n} gün', other: '{n} gün' }),
    hedefMesaj: '"{ad}" hədəfini tamamladınız. Allah ardını gətirsin.',
    seviyeBaslik: 'Yeni səviyyəniz',
    yeniRank: 'Yeni dərəcə: {rank}',
    seviyeMesaj: 'Artıq "{rank}" kimi davam edirsiniz. Allah ardını gətirsin.',
    toparlanmaBaslik: 'Seriyanız bərpa olundu',
    toparlanmaMesaj: cogul({
      one: '{n} günlük seriyanız qaldığı yerdən davam edir. Allah səbat versin.',
      other: '{n} günlük seriyanız qaldığı yerdən davam edir. Allah səbat versin.',
    }),
    enUzunBaslik: 'Ən uzun seriyanız',
    enUzunMesaj: cogul({
      one: '{n} gün; indiyədək ən uzun seriyanız. Allah ardını gətirsin.',
      other: '{n} gün; indiyədək ən uzun seriyanız. Allah ardını gətirsin.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Keçmiş qeydləriniz hazırda oxunmadı.',
    yenidenErisim: 'Seriya məlumatlarını yenidən yükləyin',
    yenidenDeneyin: 'Yenidən cəhd edin',
    yukleniyor: 'Seriya məlumatlarınız yüklənir...',
    gunlukSeri: 'günlük seriya',
    rekor: 'rekord',
    sozErisim: '{metin} Mənbə: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Növbəti hədəf',
    tumu: 'Bütün nişanları tamamladınız',
    kalan: cogul({ one: '{ad} nişanına {n} gün qaldı', other: '{ad} nişanına {n} gün qaldı' }),
    tumuErisim: 'Bütün nişanları tamamladınız: təsbeh tam doludur.',
    erisim: '{ad} nişanı: {hedef} gündən {n} tamamlandı.',
  },

  gok: {
    /** Bazar ertəsi başlayır: B · Ç · Ç · C · C · Ş · B. */
    gunHarfleri: ['B', 'Ç', 'Ç', 'C', 'C', 'Ş', 'B'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} gün hədəfə çatıldı', other: '{n} gün hədəfə çatıldı' }),
    besVakit: cogul({ one: '{n} gündə beş vaxt tamamlandı', other: '{n} gündə beş vaxt tamamlandı' }),
    dondurulmus: cogul({ one: '{n} gün donduruldu', other: '{n} gün donduruldu' }),
    mevcutSeri: cogul({ one: 'Hazırkı seriya {n} gün.', other: 'Hazırkı seriya {n} gün.' }),
  },

  hedefAyar: {
    azalt: 'Azalt',
    deger: 'Dəyər',
    artir: 'Artır',
    esik: cogul({ one: '{n} vaxt', other: '{n} vaxt' }),
    sifirlaBaslik: 'Seriyanı sıfırla',
    sifirlaMesaj: 'Bütün seriya məlumatlarınız (seriya, nişanlar, xallar) sıfırlanacaq. Bu əməliyyat geri qaytarıla bilməz. Davam etmək istəyirsiniz?',
    sifirla: 'Sıfırla',
    iptal: 'Ləğv et',
    basarili: 'Hazırdır',
    sifirlandi: 'Seriya məlumatlarınız sıfırlandı.',
    hedefAyarlari: 'HƏDƏF PARAMETRLƏRİ',
    tamGunEsigi: 'Tam gün həddi',
    tamGunAciklama: 'Həmin günün seriyasını tamamlanmış saymaq üçün gündə qılmalı olduğunuz minimum namaz sayını müəyyən edir',
    sifirlama: 'SIFIRLAMA',
    verileriSifirla: 'Seriya məlumatlarını sıfırla',
    verileriSifirlaAlt: 'Bütün seriya, nişan və xal məlumatlarını silir',
  },

  rozetKarti: {
    erisim: '{ad} nişanı, {durum}',
    kazanildi: 'qazanılıb',
    kilitli: 'kilidlidir',
  },

  toparlanma: {
    kartBaslik: 'BƏRPA REJİMİ',
    kartAltBaslik: 'Seriyanızı bərpa edə bilərsiniz',
    kartMesaj: '{vurgu} seriyanıza qaldığınız yerdən davam edə bilərsiniz.',
    oncekiGun: cogul({ one: '{n} günlük', other: '{n} günlük' }),
    ilerleme: '{tamam}/{hedef} gün tamamlandı',
    kalan: cogul({
      one: 'Daha {n} gün beş vaxtı tamamladıqda seriyanız qaldığı yerdən davam edəcək.',
      other: 'Daha {n} gün beş vaxtı tamamladıqda seriyanız qaldığı yerdən davam edəcək.',
    }),
    bugun: 'Bu günü tamamladıqda seriyanız qaldığı yerdən davam edəcək.',
    uyari: 'Bu günləri ardıcıl tamamlamağınız kifayətdir; arada boş gün qalsa, bərpa yenidən başlayır.',
    kapatErisim: 'Bərpa pəncərəsini bağla',
    anladim: 'Başa düşdüm',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Uğurunu paylaş',
    hazirDegilBaslik: 'Şəkil hazır deyil',
    hazirDegilMesaj: 'Şəkil hələ hazır deyil. Bir neçə saniyədən sonra yenidən cəhd edin.',
    olusturulamadiBaslik: 'Şəkil yaradılmadı',
    olusturulamadiMesaj: 'Şəkil yaradılarkən xəta baş verdi. Yenidən cəhd edin.',
    kullanilamiyorBaslik: 'Paylaşmaq mümkün deyil',
    kullanilamiyorMesaj: 'Bu cihazda paylaşma funksiyası mövcud deyil.',
    kapat: 'Bağla',
    hikaye: 'Hekayənizə əlavə edin',
    platformlar: 'Instagram, WhatsApp və digərlərində paylaşıla bilər.',
    tamam: 'Oldu',
    seriEnUzun: cogul({ one: 'Ən uzun seriyam: {n} gün', other: 'Ən uzun seriyam: {n} gün' }),
    seriZincir: cogul({ one: 'GÜNDÜR ZƏNCİRİ QIRMAMIŞAM!', other: 'GÜNDÜR ZƏNCİRİ QIRMAMIŞAM!' }),
    seriSoz: '"Hər gün kiçik bir addım, ruhumda böyük bir rahatlıq. 🔥"',
    rozetYeni: 'YENİ NİŞAN QAZANDIM!',
    rozetSozleri: [
      'Bu gün özüm üçün gözəl bir addım atdım! 🌟',
      'Əzmlə davam edirəm, bu nişan mənimdir! 💪',
      'Səhərin bərəkətini yaxaladım! 🌅',
      'Ruhuma xeyir verən bu axında mən də varam! ✨',
      'Kiçik addımlar böyük rahatlıq gətirir. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'YENİ NİŞAN QAZANDIM!',
      hedef_tamamlandi: 'HƏDƏFƏ ÇATDIM!',
      seviye_atlandi: 'YENİ SƏVİYYƏ!',
      toparlanma_tamamlandi: 'YENİDƏN YOLDAYAM!',
      en_uzun_seri: 'YENİ REKORD!',
      varsayilan: 'UĞUR!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Rəbbim ardını gətirsin. 🤲', 'Kiçik addımlar böyük rahatlıq gətirir. 🍃', 'Allah hamımıza səbat versin. 🌱'],
      hedef_tamamlandi: ['Kiçik addımlar böyük rahatlıq gətirir. 🍃', 'Allah ardını gətirsin. 🤲', 'Hər gün bir addım daha. 🌱'],
      seviye_atlandi: [
        'Hər gün bir az da yol gedirəm, Allah asan etsin. 🍃',
        'Allah ardını gətirsin. 🤲',
        'Səfər davam edir. 🌱',
      ],
      toparlanma_tamamlandi: ['Əsas olan yıxılmamaq yox, ayağa qalxmaqdır. 🔄', 'Allah səbat versin. 🤲', 'Səbirlə hər yol gedilir. 🌱'],
      en_uzun_seri: [
        'Hər gün kiçik bir addım, qəlbimdə böyük bir rahatlıq. 🍃',
        'Allah ardını gətirsin. 🤲',
        'Rəbbim hamımıza səbat versin. 🌱',
      ],
    },
  },
};
