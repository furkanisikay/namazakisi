import { cogul } from '../../tipler';

/** Seri: ana ekran seri kartı, seri sekmesi, rozetler, seviyeler, kutlama ve paylaşım kartları. Büyük harfli metinler sabit yazılır (`toUpperCase` YASAK). */
export const seri = {
  kart: {
    baslik: 'Seri ateşiniz yanıyor',
    enUzun: cogul({ one: 'En uzun seri: {n} gün', other: 'En uzun seri: {n} gün' }),
    gunBuyuk: cogul({ one: 'GÜN', other: 'GÜN' }),
    sonrakiHedef: 'Sonraki hedef: {hedef}. Gün ({durum})',
    kalanGun: cogul({ one: '{n} gün kaldı', other: '{n} gün kaldı' }),
    tamamlandi: 'Tamamlandı!',
    paylasErisim: 'Başarınızı paylaşın',
    paylasBuyuk: 'BAŞARINIZI PAYLAŞIN',
  },

  /** Seri hedefleri (`SERI_HEDEFLERI`, rozet kimliğiyle). `cumle`: Tesbih'teki sentence case ad. */
  hedefler: {
    ilk_adim: { ad: 'İlk Hafta', aciklama: '7 gün kesintisiz namaz kıl', cumle: 'İlk hafta' },
    aliskanlik_ustasi: { ad: 'Alışkanlık Ustası', aciklama: '21 gun - alışkanlık oluşturma süresi', cumle: 'Alışkanlık ustası' },
    kararlilik: { ad: 'Kararlılık', aciklama: '60 gün kesintisiz devam', cumle: 'Kararlılık' },
    efsane: { ad: 'Efsane', aciklama: '90 gün - üstün kararlılık', cumle: 'Efsane' },
  },

  /** Seviye (rank) adları, seviye 1…7 sırasıyla (`SEVIYE_TANIMLARI`). */
  seviyeler: ['Mübtedi', 'Tâlip', 'Sâlik', 'Mürid', 'Ârif', 'Hâfız', 'Kâmil'],

  /** Rozetler (`ROZET_TANIMLARI`, kimlikle). */
  rozetler: {
    ilk_adim: { ad: 'İlk Adım', aciklama: 'İlk haftayı tamamladınız!', kosul: '7 günlük seri' },
    aliskanlik_ustasi: {
      ad: 'Alışkanlık Ustası',
      aciklama: '21 gün - alışkanlık oluşturma süresi tamamlandı!',
      kosul: '21 günlük seri',
    },
    kararlilik: { ad: 'Kararlı', aciklama: '60 gün kesintisiz namaz kıldınız!', kosul: '60 günlük seri' },
    efsane: { ad: 'Efsane', aciklama: '90 gün - üstün kararlılık gösterdiniz!', kosul: '90 günlük seri' },
    toparlanma_ustasi: {
      ad: 'Toparlanma Ustası',
      aciklama: '3 kez toparlanma modunu başarıyla tamamladınız!',
      kosul: '3 kez toparlanma',
    },
    mukemmeliyetci: { ad: 'Mükemmeliyetçi', aciklama: '30 gün boyunca 5/5 namaz kıldınız!', kosul: '30 gün 5/5 namaz' },
    yuz_namaz: { ad: '100 Namaz', aciklama: 'Toplam 100 namaz kıldınız!', kosul: '100 namaz kılmak' },
    bin_namaz: { ad: '1000 Namaz', aciklama: 'Toplam 1000 namaz kıldınız!', kosul: '1000 namaz kılmak' },
  },

  /** Rozet nadirlik etiketi (büyük harf sabit). */
  rozetSeviyeleri: { bronz: 'BRONZ', gumus: 'GUMUS', altin: 'ALTIN', elmas: 'ELMAS' },

  /** Gün bitiş saati seçeneklerinin açıklaması (`GUN_BITIS_SAATI_SECENEKLERI`). */
  gunBitis: {
    erken: 'Erken yatanlar için',
    varsayilan: 'Varsayılan - çoğu imsak vaktinden önce',
    gec: 'Geç yatanlar için',
  },

  /** Kutlama başlık ve mesajları (`RozetYoneticisiServisi`). */
  kutlama: {
    rozetBaslik: 'Allah daim etsin',
    rozetMesaj: '"{ad}" rozetini kazandınız.',
    hedefBaslik: cogul({ one: '{n} gün', other: '{n} gün' }),
    hedefMesaj: '"{ad}" hedefini tamamladınız. Allah daim etsin.',
    seviyeBaslik: 'Yeni seviyeniz',
    seviyeMesaj: 'Artık bir "{rank}" olarak devam ediyorsunuz. Allah daim etsin.',
    toparlanmaBaslik: 'Serinize yeniden kavuştunuz',
    toparlanmaMesaj: cogul({
      one: '{n} günlük seriniz kaldığı yerden sürüyor. Allah sebat versin.',
      other: '{n} günlük seriniz kaldığı yerden sürüyor. Allah sebat versin.',
    }),
    enUzunBaslik: 'En uzun seriniz',
    enUzunMesaj: cogul({
      one: '{n} gün; şimdiye kadarki en uzun seriniz. Allah daim etsin.',
      other: '{n} gün; şimdiye kadarki en uzun seriniz. Allah daim etsin.',
    }),
  },

  /** Seri sekmesi (İlerleme). */
  sekme: {
    hataOkunamadi: 'Geçmiş kayıtlarınız şu anda okunamadı.',
    yenidenErisim: 'Seri verilerini yeniden deneyin',
    yenidenDeneyin: 'Yeniden deneyin',
    yukleniyor: 'Seri verileriniz yükleniyor...',
    gunlukSeri: 'günlük seri',
    rekor: 'rekor',
    sozErisim: '{metin} Kaynak: {kaynak}',
  },

  /** Tesbih (sıradaki rozet ilerlemesi). */
  tesbih: {
    varsayilanHedef: 'Sıradaki hedef',
    tumu: 'Tüm rozetleri tamamladınız',
    kalan: cogul({ one: '{ad} rozetine {n} gün kaldı', other: '{ad} rozetine {n} gün kaldı' }),
    tumuErisim: 'Tüm rozetleri tamamladınız: tesbih tamamen dolu.',
    /** `{n}` Türkçede iyelik ekiyle gelir ("15'i", `turkceIyelikEki`); diğer dillerde yalın sayı. */
    erisim: '{ad} rozeti: {hedef} günün {n} tamamlandı.',
  },

  /** Gök paneli (aylık takımyıldızı). */
  gok: {
    /** Pazartesiden başlayan tek harfli gün başlıkları. */
    gunHarfleri: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} gün hedef tutuldu', other: '{n} gün hedef tutuldu' }),
    besVakit: cogul({ one: '{n} günde beş vakit tamamlandı', other: '{n} günde beş vakit tamamlandı' }),
    dondurulmus: cogul({ one: '{n} gün dondurulmuş', other: '{n} gün dondurulmuş' }),
    mevcutSeri: cogul({ one: 'Mevcut seri {n} gün.', other: 'Mevcut seri {n} gün.' }),
  },

  /** Seri hedefi ayar sayfası. */
  hedefAyar: {
    azalt: 'Azalt',
    deger: 'Değer',
    artir: 'Artır',
    esik: cogul({ one: '{n} vakit', other: '{n} vakit' }),
    sifirlaBaslik: 'Seri Sıfırla',
    sifirlaMesaj: 'Tüm seri verileriniz (seri, rozetler, puanlar) sıfırlanacak. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
    sifirla: 'Sıfırla',
    iptal: 'İptal',
    basarili: 'Başarılı',
    sifirlandi: 'Seri verileriniz sıfırlandı.',
    hedefAyarlari: 'HEDEF AYARLARI',
    tamGunEsigi: 'Tam Gün Eşiği',
    tamGunAciklama: 'O günün serisini tamamlandı saymak için günde kılmanız gereken minimum namaz sayısını belirler',
    sifirlama: 'SIFIRLAMA',
    verileriSifirla: 'Seri Verilerini Sıfırla',
    verileriSifirlaAlt: 'Tüm seri, rozet ve puan verilerini siler',
  },

  /** Rozet kartı. */
  rozetKarti: {
    erisim: '{ad} rozeti, {durum}',
    kazanildi: 'kazanıldı',
    kilitli: 'kilitli',
  },

  /** Toparlanma modalı. */
  toparlanma: {
    kapatErisim: 'Toparlanma modalını kapat',
    anladim: 'Anladım',
  },

  /**
   * Paylaşım kartları ve modalı. Paylaşılan söz kişinin KENDİ sesidir (ben dili): övünme
   * değil, dua ve niyet (riya kaygısı). Dizilerin uzunluğu dil başına aynı kalmalı
   * (deterministik seçim karma ile indekslenir).
   */
  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Başarını Paylaş',
    hazirDegilBaslik: 'Görsel hazır değil',
    hazirDegilMesaj: 'Görsel henüz hazır değil. Lütfen birkaç saniye sonra tekrar deneyin.',
    olusturulamadiBaslik: 'Görsel oluşturulamadı',
    olusturulamadiMesaj: 'Görsel oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
    kullanilamiyorBaslik: 'Paylaşım kullanılamıyor',
    kullanilamiyorMesaj: 'Paylaşım özelliği bu cihazda kullanılamıyor.',
    kapat: 'Kapat',
    hikaye: 'Hikâyenize ekleyin',
    platformlar: 'Instagram, WhatsApp ve diğerlerinde paylaşılabilir.',
    tamam: 'Tamam',
    seriEnUzun: cogul({ one: 'En Uzun Serim: {n} Gün', other: 'En Uzun Serim: {n} Gün' }),
    seriZincir: cogul({ one: 'GÜNDÜR ZİNCİRİ KIRMADIM!', other: 'GÜNDÜR ZİNCİRİ KIRMADIM!' }),
    seriSoz: '"Her gün küçük bir adım, ruhumda büyük bir huzur. 🔥"',
    rozetYeni: 'YENİ BİR ROZET KAZANDIM!',
    rozetSozleri: [
      'Bugün kendim için harika bir adım attım! 🌟',
      'Azimle devam ediyorum, bu rozet benim! 💪',
      'Sabahın bereketini yakaladım! 🌅',
      'Ruhuma iyi gelen bu akışta ben de varım! ✨',
      'Küçük adımlar, büyük huzur getirir. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'YENİ ROZET KAZANDIM!',
      hedef_tamamlandi: 'HEDEFE ULASTIM!',
      seviye_atlandi: 'SEVIYE ATLADI!',
      toparlanma_tamamlandi: 'TOPARLANDIM!',
      en_uzun_seri: 'YENİ REKOR!',
      varsayilan: 'BASARI!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Rabbim daim etsin. 🤲', 'Küçük adımlar, büyük huzur getirir. 🍃', 'Allah hepimize sebat versin. 🌱'],
      hedef_tamamlandi: ['Küçük adımlar, büyük huzur getirir. 🍃', 'Allah daim etsin. 🤲', 'Her gün bir adım daha. 🌱'],
      seviye_atlandi: [
        'Her gün biraz daha yol alıyorum, Allah kolaylık versin. 🍃',
        'Allah daim etsin. 🤲',
        'Yolculuk devam ediyor. 🌱',
      ],
      toparlanma_tamamlandi: ['Düşmek değil, kalkmak önemlidir. 🔄', 'Allah sebat versin. 🤲', 'Sabırla her yol yürünür. 🌱'],
      en_uzun_seri: [
        'Her gün küçük bir adım, kalbimde büyük bir huzur. 🍃',
        'Allah daim etsin. 🤲',
        'Rabbim hepimize sebat versin. 🌱',
      ],
    },
  },
} as const;
