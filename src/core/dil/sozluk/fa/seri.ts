import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = «زنجیره» (پیاپی روزها). Arap harfinde büyük harf yok; "!" yazılmaz. Seviye adları klasik terimler. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'زنجیره‌تان روشن است',
    enUzun: cogul({ one: 'طولانی‌ترین زنجیره: {n} روز', other: 'طولانی‌ترین زنجیره: {n} روز' }),
    gunBuyuk: cogul({ one: 'روز', other: 'روز' }),
    sonrakiHedef: 'هدف بعدی: روز {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} روز مانده', other: '{n} روز مانده' }),
    tamamlandi: 'کامل شد',
    paylasErisim: 'اشتراک‌گذاری پیشرفت',
    paylasBuyuk: 'اشتراک‌گذاری پیشرفت',
  },

  hedefler: {
    ilk_adim: { ad: 'هفتهٔ نخست', aciklama: '7 روز بی‌وقفه نماز بخوانید', cumle: 'هفتهٔ نخست' },
    aliskanlik_ustasi: { ad: 'استاد عادت', aciklama: '21 روز - دورهٔ عادت‌سازی', cumle: 'استاد عادت' },
    kararlilik: { ad: 'پایداری', aciklama: '60 روز بی‌وقفه', cumle: 'پایداری' },
    efsane: { ad: 'افسانه', aciklama: '90 روز - استقامتی کم‌نظیر', cumle: 'افسانه' },
  },

  seviyeler: ['مبتدی', 'طالب', 'سالک', 'مرید', 'عارف', 'حافظ', 'کامل'],

  rozetler: {
    ilk_adim: { ad: 'گام نخست', aciklama: 'نخستین هفتهٔ خود را کامل کردید.', kosul: 'زنجیرهٔ 7 روزه' },
    aliskanlik_ustasi: {
      ad: 'استاد عادت',
      aciklama: '21 روز - دورهٔ عادت‌سازی کامل شد.',
      kosul: 'زنجیرهٔ 21 روزه',
    },
    kararlilik: { ad: 'پایدار', aciklama: '60 روز بی‌وقفه نماز خواندید.', kosul: 'زنجیرهٔ 60 روزه' },
    efsane: { ad: 'افسانه', aciklama: '90 روز - استقامتی کم‌نظیر نشان دادید.', kosul: 'زنجیرهٔ 90 روزه' },
    toparlanma_ustasi: {
      ad: 'استاد بازگشت',
      aciklama: 'حالت بازگشت را 3 بار کامل کردید.',
      kosul: '3 بازگشت',
    },
    mukemmeliyetci: { ad: 'کمال‌گرا', aciklama: '30 روز هر پنج نماز را خواندید.', kosul: '30 روز با 5/5 نماز' },
    yuz_namaz: { ad: '100 نماز', aciklama: 'روی هم 100 نماز خواندید.', kosul: 'خواندن 100 نماز' },
    bin_namaz: { ad: '1000 نماز', aciklama: 'روی هم 1000 نماز خواندید.', kosul: 'خواندن 1000 نماز' },
  },

  rozetSeviyeleri: { bronz: 'برنز', gumus: 'نقره', altin: 'طلا', elmas: 'الماس' },

  gunBitis: {
    erken: 'برای کسانی که زود می‌خوابند',
    varsayilan: 'پیش‌فرض - در بیشتر جاها پیش از صبح',
    gec: 'برای کسانی که دیر می‌خوابند',
  },

  kutlama: {
    rozetEklendi: '🏅 به مجموعهٔ نشان‌های شما افزوده شد',
    paylasin: 'اشتراک‌گذاری',
    rozetBaslik: 'خداوند پایدارش بدارد',
    rozetMesaj: 'نشان «{ad}» را به دست آوردید.',
    hedefBaslik: cogul({ one: '{n} روز', other: '{n} روز' }),
    hedefMesaj: 'هدف «{ad}» را کامل کردید. خداوند پایدارش بدارد.',
    yeniRank: 'مرتبهٔ جدید: {rank}',
    seviyeBaslik: 'سطح جدید شما',
    seviyeMesaj: 'از این پس به‌عنوان «{rank}» ادامه می‌دهید. خداوند پایدارش بدارد.',
    toparlanmaBaslik: 'زنجیره‌تان برگشت',
    toparlanmaMesaj: cogul({
      one: 'زنجیرهٔ {n} روزهٔ شما از همان جا که مانده بود ادامه می‌یابد. خداوند ثابت‌قدم بدارد.',
      other: 'زنجیرهٔ {n} روزهٔ شما از همان جا که مانده بود ادامه می‌یابد. خداوند ثابت‌قدم بدارد.',
    }),
    enUzunBaslik: 'طولانی‌ترین زنجیرهٔ شما',
    enUzunMesaj: cogul({
      one: '{n} روز: طولانی‌ترین زنجیرهٔ شما تا امروز. خداوند پایدارش بدارد.',
      other: '{n} روز: طولانی‌ترین زنجیرهٔ شما تا امروز. خداوند پایدارش بدارد.',
    }),
  },

  sekme: {
    hataOkunamadi: 'سوابق گذشتهٔ شما اکنون خوانده نشد.',
    yenidenErisim: 'بارگذاری دوبارهٔ داده‌های زنجیره',
    yenidenDeneyin: 'دوباره امتحان کنید',
    yukleniyor: 'در حال بارگذاری داده‌های زنجیره...',
    gunlukSeri: 'روز پیاپی',
    rekor: 'رکورد',
    sozErisim: '{metin} منبع: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'هدف بعدی',
    tumu: 'همهٔ نشان‌ها را کامل کردید',
    kalan: cogul({ one: 'نشان {ad}: {n} روز مانده', other: 'نشان {ad}: {n} روز مانده' }),
    tumuErisim: 'همهٔ نشان‌ها را کامل کردید: تسبیح پر است.',
    erisim: 'نشان {ad}: {n} روز از {hedef} روز کامل شد.',
  },

  gok: {
    gunHarfleri: ['د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی'],
    erisim: '{ay}. {hedef}، {bes}، {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} روز به هدف رسید', other: '{n} روز به هدف رسید' }),
    besVakit: cogul({ one: '{n} روز با هر پنج نماز', other: '{n} روز با هر پنج نماز' }),
    dondurulmus: cogul({ one: '{n} روز متوقف‌شده', other: '{n} روز متوقف‌شده' }),
    mevcutSeri: cogul({ one: 'زنجیرهٔ کنونی: {n} روز.', other: 'زنجیرهٔ کنونی: {n} روز.' }),
  },

  hedefAyar: {
    azalt: 'کاهش',
    deger: 'مقدار',
    artir: 'افزایش',
    esik: cogul({ one: '{n} نماز', other: '{n} نماز' }),
    sifirlaBaslik: 'صفر کردن زنجیره',
    sifirlaMesaj: 'همهٔ داده‌های زنجیرهٔ شما (زنجیره، نشان‌ها، امتیاز) صفر می‌شود. این کار برگشت‌پذیر نیست. می‌خواهید ادامه دهید؟',
    sifirla: 'صفر کردن',
    iptal: 'لغو',
    basarili: 'انجام شد',
    sifirlandi: 'داده‌های زنجیرهٔ شما صفر شد.',
    hedefAyarlari: 'تنظیمات هدف',
    tamGunEsigi: 'آستانهٔ روز کامل',
    tamGunAciklama: 'کمترین شمار نماز در روز را تعیین می‌کند که آن روز در زنجیرهٔ شما حساب شود',
    sifirlama: 'صفر کردن',
    verileriSifirla: 'صفر کردن داده‌های زنجیره',
    verileriSifirlaAlt: 'همهٔ داده‌های زنجیره، نشان و امتیاز را پاک می‌کند',
  },

  rozetKarti: {
    erisim: 'نشان {ad}، {durum}',
    kazanildi: 'به دست آمده',
    kilitli: 'قفل',
  },

  toparlanma: {
    kartBaslik: 'حالت بازگشت',
    kartAltBaslik: 'می‌توانید زنجیره‌تان را برگردانید',
    kartMesaj: 'می‌توانید زنجیرهٔ {vurgu} خود را از همان جا که مانده بود ادامه دهید.',
    oncekiGun: cogul({ one: '{n} روزه', other: '{n} روزه' }),
    ilerleme: '{tamam}/{hedef} روز کامل شد',
    kalan: cogul({
      one: '{n} روز دیگر هر پنج نماز را کامل کنید تا زنجیره‌تان از همان جا که مانده بود ادامه یابد.',
      other: '{n} روز دیگر هر پنج نماز را کامل کنید تا زنجیره‌تان از همان جا که مانده بود ادامه یابد.',
    }),
    bugun: 'امروز را کامل کنید تا زنجیره‌تان از همان جا که مانده بود ادامه یابد.',
    uyari: 'روزها باید پیاپی باشند؛ اگر روزی در میان از دست برود، بازگشت از نو آغاز می‌شود.',
    kapatErisim: 'بستن جزئیات بازگشت',
    anladim: 'متوجه شدم',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'اشتراک‌گذاری پیشرفت',
    hazirDegilBaslik: 'تصویر آماده نیست',
    hazirDegilMesaj: 'تصویر هنوز آماده نیست. چند ثانیهٔ دیگر دوباره امتحان کنید.',
    olusturulamadiBaslik: 'تصویر ساخته نشد',
    olusturulamadiMesaj: 'هنگام ساختن تصویر مشکلی پیش آمد. دوباره امتحان کنید.',
    kullanilamiyorBaslik: 'اشتراک‌گذاری در دسترس نیست',
    kullanilamiyorMesaj: 'اشتراک‌گذاری روی این دستگاه در دسترس نیست.',
    kapat: 'بستن',
    hikaye: 'افزودن به استوری',
    platformlar: 'در Instagram، WhatsApp و جاهای دیگر می‌توان به اشتراک گذاشت.',
    tamam: 'تأیید',
    seriEnUzun: cogul({ one: 'طولانی‌ترین زنجیرهٔ من: {n} روز', other: 'طولانی‌ترین زنجیرهٔ من: {n} روز' }),
    seriZincir: cogul({ one: 'روز بی‌آنکه زنجیره بشکند', other: 'روز بی‌آنکه زنجیره بشکند' }),
    seriSoz: '«هر روز گامی کوچک، آرامشی بزرگ در جانم. 🔥»',
    rozetYeni: 'نشان تازه‌ای به دست آوردم',
    rozetSozleri: [
      'امروز گام خوبی برای خودم برداشتم. 🌟',
      'با اراده ادامه می‌دهم؛ این نشان از آنِ من است. 💪',
      'برکت صبح را دریافتم. 🌅',
      'بخشی از این روندم که جانم را آرام می‌کند. ✨',
      'گام‌های کوچک، آرامشی بزرگ می‌آورند. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'نشان تازه‌ای به دست آوردم',
      hedef_tamamlandi: 'به هدفم رسیدم',
      seviye_atlandi: 'سطح بالاتر',
      toparlanma_tamamlandi: 'دوباره در مسیر',
      en_uzun_seri: 'رکورد تازه',
      varsayilan: 'دستاورد',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['پروردگارم پایدارش بدارد. 🤲', 'گام‌های کوچک، آرامشی بزرگ می‌آورند. 🍃', 'خداوند همهٔ ما را ثابت‌قدم بدارد. 🌱'],
      hedef_tamamlandi: ['گام‌های کوچک، آرامشی بزرگ می‌آورند. 🍃', 'خداوند پایدارش بدارد. 🤲', 'هر روز یک گام بیشتر. 🌱'],
      seviye_atlandi: [
        'هر روز کمی بیشتر؛ خداوند آسان کند. 🍃',
        'خداوند پایدارش بدارد. 🤲',
        'سفر ادامه دارد. 🌱',
      ],
      toparlanma_tamamlandi: [
        'مهم افتادن نیست، برخاستن است. 🔄',
        'خداوند ثابت‌قدم بدارد. 🤲',
        'هر راهی با صبر پیموده می‌شود. 🌱',
      ],
      en_uzun_seri: [
        'هر روز گامی کوچک، آرامشی بزرگ در دلم. 🍃',
        'خداوند پایدارش بدارد. 🤲',
        'پروردگارم همهٔ ما را ثابت‌قدم بدارد. 🌱',
      ],
    },
  },
};
