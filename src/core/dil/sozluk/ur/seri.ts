import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Paylaşım sözleri kişinin kendi sesidir; Urducada birinci tekil geniş/şimdiki/gelecek zaman
 * konuşanın cinsiyetine göre çekildiği için yalnız nesneye uyan geçmiş zaman ya da isim cümlesi
 * kullanılır. "!" yok; dua kalıpları: اللہ قائم و دائم رکھے · اللہ ثابت قدم رکھے.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'آپ کا تسلسل روشن ہے',
    enUzun: cogul({ one: 'سب سے طویل تسلسل: {n} دن', other: 'سب سے طویل تسلسل: {n} دن' }),
    gunBuyuk: cogul({ one: 'دن', other: 'دن' }),
    sonrakiHedef: 'اگلا ہدف: دن {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} دن باقی', other: '{n} دن باقی' }),
    tamamlandi: 'مکمل',
    paylasErisim: 'اپنی پیش رفت شیئر کریں',
    paylasBuyuk: 'اپنی پیش رفت شیئر کریں',
  },

  hedefler: {
    ilk_adim: { ad: 'پہلا ہفتہ', aciklama: '7 دن بلا ناغہ نماز ادا کریں', cumle: 'پہلا ہفتہ' },
    aliskanlik_ustasi: { ad: 'عادت کا ماہر', aciklama: '21 دن - عادت بننے کی مدت', cumle: 'عادت کا ماہر' },
    kararlilik: { ad: 'ثابت قدمی', aciklama: '60 دن بلا ناغہ', cumle: 'ثابت قدمی' },
    efsane: { ad: 'لاجواب', aciklama: '90 دن - غیر معمولی استقامت', cumle: 'لاجواب' },
  },

  /** Klasik tasavvuf mertebe adları, Urdu yazısıyla. */
  seviyeler: ['مبتدی', 'طالب', 'سالک', 'مرید', 'عارف', 'حافظ', 'کامل'],

  rozetler: {
    ilk_adim: { ad: 'پہلا قدم', aciklama: 'آپ نے پہلا ہفتہ مکمل کر لیا۔', kosul: '7 دن کا تسلسل' },
    aliskanlik_ustasi: {
      ad: 'عادت کا ماہر',
      aciklama: '21 دن - عادت بننے کی مدت مکمل ہو گئی۔',
      kosul: '21 دن کا تسلسل',
    },
    kararlilik: { ad: 'ثابت قدم', aciklama: 'آپ نے 60 دن بلا ناغہ نماز ادا کی۔', kosul: '60 دن کا تسلسل' },
    efsane: { ad: 'لاجواب', aciklama: '90 دن - آپ نے غیر معمولی استقامت دکھائی۔', kosul: '90 دن کا تسلسل' },
    toparlanma_ustasi: {
      ad: 'بحالی کا ماہر',
      aciklama: 'آپ نے 3 بار بحالی موڈ مکمل کیا۔',
      kosul: '3 بار بحالی',
    },
    mukemmeliyetci: { ad: 'کمال پسند', aciklama: 'آپ نے 30 دن تک 5/5 نمازیں ادا کیں۔', kosul: '30 دن 5/5 نمازیں' },
    yuz_namaz: { ad: '100 نمازیں', aciklama: 'آپ نے کل 100 نمازیں ادا کیں۔', kosul: '100 نمازیں ادا کرنا' },
    bin_namaz: { ad: '1000 نمازیں', aciklama: 'آپ نے کل 1000 نمازیں ادا کیں۔', kosul: '1000 نمازیں ادا کرنا' },
  },

  rozetSeviyeleri: { bronz: 'کانسی', gumus: 'چاندی', altin: 'سونا', elmas: 'ہیرا' },

  gunBitis: {
    erken: 'جلدی سونے والوں کے لیے',
    varsayilan: 'طے شدہ - اکثر جگہوں پر فجر سے پہلے',
    gec: 'دیر سے سونے والوں کے لیے',
  },

  kutlama: {
    rozetEklendi: '🏅 آپ کے بیج کے مجموعے میں شامل ہو گیا',
    paylasin: 'شیئر کریں',
    rozetBaslik: 'اللہ قائم و دائم رکھے',
    rozetMesaj: 'آپ نے "{ad}" بیج حاصل کیا۔',
    hedefBaslik: cogul({ one: '{n} دن', other: '{n} دن' }),
    hedefMesaj: 'آپ نے "{ad}" کا ہدف مکمل کیا۔ اللہ قائم و دائم رکھے۔',
    seviyeBaslik: 'آپ کا نیا درجہ',
    yeniRank: 'نیا درجہ: {rank}',
    seviyeMesaj: 'اب آپ کا سفر "{rank}" کے درجے پر جاری ہے۔ اللہ قائم و دائم رکھے۔',
    toparlanmaBaslik: 'آپ کا تسلسل واپس آ گیا',
    toparlanmaMesaj: cogul({
      one: 'آپ کا {n} دن کا تسلسل وہیں سے جاری ہے جہاں رکا تھا۔ اللہ ثابت قدم رکھے۔',
      other: 'آپ کا {n} دن کا تسلسل وہیں سے جاری ہے جہاں رکا تھا۔ اللہ ثابت قدم رکھے۔',
    }),
    enUzunBaslik: 'آپ کا سب سے طویل تسلسل',
    enUzunMesaj: cogul({
      one: '{n} دن؛ اب تک کا سب سے طویل تسلسل۔ اللہ قائم و دائم رکھے۔',
      other: '{n} دن؛ اب تک کا سب سے طویل تسلسل۔ اللہ قائم و دائم رکھے۔',
    }),
  },

  sekme: {
    hataOkunamadi: 'آپ کا پچھلا ریکارڈ اس وقت پڑھا نہیں جا سکا۔',
    yenidenErisim: 'تسلسل کا ڈیٹا دوبارہ لوڈ کریں',
    yenidenDeneyin: 'دوبارہ کوشش کریں',
    yukleniyor: 'آپ کے تسلسل کا ڈیٹا لوڈ ہو رہا ہے...',
    gunlukSeri: 'دن کا تسلسل',
    rekor: 'ریکارڈ',
    sozErisim: '{metin} ماخذ: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'اگلا ہدف',
    tumu: 'آپ نے تمام بیج مکمل کر لیے',
    kalan: cogul({ one: '{ad} بیج تک {n} دن باقی', other: '{ad} بیج تک {n} دن باقی' }),
    tumuErisim: 'آپ نے تمام بیج مکمل کر لیے: تسبیح پوری بھر گئی۔',
    erisim: '{ad} بیج: {hedef} میں سے {n} دن مکمل۔',
  },

  gok: {
    gunHarfleri: ['پ', 'م', 'ب', 'ج', 'ج', 'ہ', 'ا'],
    erisim: '{ay}۔ {hedef}، {bes}، {donmus}۔ {seri}',
    hedefTutuldu: cogul({ one: '{n} دن ہدف پورا ہوا', other: '{n} دن ہدف پورا ہوا' }),
    besVakit: cogul({ one: '{n} دن پانچوں نمازیں مکمل', other: '{n} دن پانچوں نمازیں مکمل' }),
    dondurulmus: cogul({ one: '{n} دن روکا گیا', other: '{n} دن روکے گئے' }),
    mevcutSeri: cogul({ one: 'موجودہ تسلسل {n} دن۔', other: 'موجودہ تسلسل {n} دن۔' }),
  },

  hedefAyar: {
    azalt: 'کم کریں',
    deger: 'قدر',
    artir: 'بڑھائیں',
    esik: cogul({ one: '{n} نماز', other: '{n} نمازیں' }),
    sifirlaBaslik: 'تسلسل ری سیٹ کریں',
    sifirlaMesaj: 'آپ کا تمام تسلسل کا ڈیٹا (تسلسل، بیج، پوائنٹس) ری سیٹ ہو جائے گا۔ یہ عمل واپس نہیں ہو سکتا۔ کیا جاری رکھیں؟',
    sifirla: 'ری سیٹ کریں',
    iptal: 'منسوخ',
    basarili: 'ہو گیا',
    sifirlandi: 'آپ کا تسلسل کا ڈیٹا ری سیٹ ہو گیا۔',
    hedefAyarlari: 'ہدف کی ترتیبات',
    tamGunEsigi: 'مکمل دن کی حد',
    tamGunAciklama: 'کسی دن کو تسلسل میں شمار کرنے کے لیے روزانہ ادا کی جانے والی کم از کم نمازوں کی تعداد طے کرتا ہے',
    sifirlama: 'ری سیٹ',
    verileriSifirla: 'تسلسل کا ڈیٹا ری سیٹ کریں',
    verileriSifirlaAlt: 'تمام تسلسل، بیج اور پوائنٹس کا ڈیٹا حذف کرتا ہے',
  },

  rozetKarti: {
    erisim: '{ad} بیج، {durum}',
    kazanildi: 'حاصل شدہ',
    kilitli: 'مقفل',
  },

  toparlanma: {
    kartBaslik: 'بحالی موڈ',
    kartAltBaslik: 'آپ کا تسلسل واپس آ سکتا ہے',
    kartMesaj: 'آپ کا {vurgu} تسلسل وہیں سے جاری ہو سکتا ہے جہاں رکا تھا۔',
    oncekiGun: cogul({ one: '{n} دن کا', other: '{n} دن کا' }),
    ilerleme: '{tamam}/{hedef} دن مکمل',
    kalan: cogul({
      one: 'مزید {n} دن پانچوں نمازیں مکمل کرنے پر آپ کا تسلسل وہیں سے جاری ہو جائے گا۔',
      other: 'مزید {n} دن پانچوں نمازیں مکمل کرنے پر آپ کا تسلسل وہیں سے جاری ہو جائے گا۔',
    }),
    bugun: 'آج کا دن مکمل کرنے پر آپ کا تسلسل وہیں سے جاری ہو جائے گا۔',
    uyari: 'یہ دن مسلسل مکمل کرنا کافی ہے؛ درمیان میں کوئی دن خالی رہا تو بحالی دوبارہ شروع ہوگی۔',
    kapatErisim: 'بحالی کی تفصیلات بند کریں',
    anladim: 'سمجھ آ گئی',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'اپنی پیش رفت شیئر کریں',
    hazirDegilBaslik: 'تصویر تیار نہیں',
    hazirDegilMesaj: 'تصویر ابھی تیار نہیں۔ چند سیکنڈ بعد دوبارہ کوشش کریں۔',
    olusturulamadiBaslik: 'تصویر نہیں بن سکی',
    olusturulamadiMesaj: 'تصویر بناتے وقت خرابی پیش آئی۔ دوبارہ کوشش کریں۔',
    kullanilamiyorBaslik: 'شیئر کرنا دستیاب نہیں',
    kullanilamiyorMesaj: 'اس آلے پر شیئر کرنے کی سہولت دستیاب نہیں۔',
    kapat: 'بند کریں',
    hikaye: 'اپنی اسٹوری میں شامل کریں',
    platformlar: 'Instagram، WhatsApp اور دیگر پر شیئر کیا جا سکتا ہے۔',
    tamam: 'ٹھیک ہے',
    seriEnUzun: cogul({ one: 'میرا سب سے طویل تسلسل: {n} دن', other: 'میرا سب سے طویل تسلسل: {n} دن' }),
    seriZincir: cogul({ one: 'دن سے سلسلہ نہیں ٹوٹا', other: 'دن سے سلسلہ نہیں ٹوٹا' }),
    seriSoz: '"ہر دن ایک چھوٹا قدم، روح میں بڑا سکون۔ 🔥"',
    rozetYeni: 'میں نے نیا بیج حاصل کیا',
    rozetSozleri: [
      'آج میں نے اپنے لیے ایک اچھا قدم اٹھایا۔ 🌟',
      'عزم کے ساتھ سفر جاری ہے، یہ بیج میرا ہے۔ 💪',
      'میں نے صبح کی برکت پا لی۔ 🌅',
      'روح کو سکون دینے والے اس سفر میں میں بھی شامل ہوں۔ ✨',
      'چھوٹے قدم بڑا سکون لاتے ہیں۔ 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'میں نے نیا بیج حاصل کیا',
      hedef_tamamlandi: 'ہدف پورا ہو گیا',
      seviye_atlandi: 'نیا درجہ',
      toparlanma_tamamlandi: 'دوبارہ راستے پر',
      en_uzun_seri: 'نیا ریکارڈ',
      varsayilan: 'کامیابی',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['میرا رب قائم و دائم رکھے۔ 🤲', 'چھوٹے قدم بڑا سکون لاتے ہیں۔ 🍃', 'اللہ ہم سب کو ثابت قدم رکھے۔ 🌱'],
      hedef_tamamlandi: ['چھوٹے قدم بڑا سکون لاتے ہیں۔ 🍃', 'اللہ قائم و دائم رکھے۔ 🤲', 'ہر دن ایک اور قدم۔ 🌱'],
      seviye_atlandi: [
        'ہر دن سفر تھوڑا اور طے ہو رہا ہے، اللہ آسانی دے۔ 🍃',
        'اللہ قائم و دائم رکھے۔ 🤲',
        'سفر جاری ہے۔ 🌱',
      ],
      toparlanma_tamamlandi: [
        'گرنا نہیں، اٹھنا اہم ہے۔ 🔄',
        'اللہ ثابت قدم رکھے۔ 🤲',
        'صبر سے ہر راستہ طے ہوتا ہے۔ 🌱',
      ],
      en_uzun_seri: [
        'ہر دن ایک چھوٹا قدم، دل میں بڑا سکون۔ 🍃',
        'اللہ قائم و دائم رکھے۔ 🤲',
        'میرا رب ہم سب کو ثابت قدم رکھے۔ 🌱',
      ],
    },
  },
};
