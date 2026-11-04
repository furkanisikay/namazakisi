import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Paylaşım sözleri kişinin kendi sesidir; Pencapçada birinci tekil şimdiki/gelecek zaman
 * konuşanın cinsiyetine göre çekildiği için yalnız nesneye uyan geçmiş zaman, isim cümlesi ya da
 * cinsiyetsiz "آں" kullanılır. "!" yok; dua kalıpları (Urducayla ortak, türetildi): اللہ قائم دائم
 * رکھے · اللہ ثابت قدم رکھے.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'تہاڈا تسلسل روشن اے',
    enUzun: cogul({ one: 'سب توں لما تسلسل: {n} دن', other: 'سب توں لما تسلسل: {n} دن' }),
    gunBuyuk: cogul({ one: 'دن', other: 'دن' }),
    sonrakiHedef: 'اگلا ہدف: دن {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} دن باقی', other: '{n} دن باقی' }),
    tamamlandi: 'پورا',
    paylasErisim: 'اپنی پیش رفت شیئر کرو',
    paylasBuyuk: 'اپنی پیش رفت شیئر کرو',
  },

  hedefler: {
    ilk_adim: { ad: 'پہلا ہفتہ', aciklama: '7 دن بغیر ناغے نماز ادا کرو', cumle: 'پہلا ہفتہ' },
    aliskanlik_ustasi: { ad: 'عادت دا ماہر', aciklama: '21 دن - عادت بنن دی مدت', cumle: 'عادت دا ماہر' },
    kararlilik: { ad: 'ثابت قدمی', aciklama: '60 دن بغیر ناغے', cumle: 'ثابت قدمی' },
    efsane: { ad: 'لاجواب', aciklama: '90 دن - انوکھی استقامت', cumle: 'لاجواب' },
  },

  /** Klasik tasavvuf mertebe adları (Urducayla ortak), Şahmuki yazısıyla. */
  seviyeler: ['مبتدی', 'طالب', 'سالک', 'مرید', 'عارف', 'حافظ', 'کامل'],

  rozetler: {
    ilk_adim: { ad: 'پہلا قدم', aciklama: 'تسیں پہلا ہفتہ پورا کر لیا۔', kosul: '7 دن دا تسلسل' },
    aliskanlik_ustasi: {
      ad: 'عادت دا ماہر',
      aciklama: '21 دن - عادت بنن دی مدت پوری ہو گئی۔',
      kosul: '21 دن دا تسلسل',
    },
    kararlilik: { ad: 'ثابت قدم', aciklama: 'تسیں 60 دن بغیر ناغے نماز ادا کیتی۔', kosul: '60 دن دا تسلسل' },
    efsane: { ad: 'لاجواب', aciklama: '90 دن - تسیں انوکھی استقامت وکھائی۔', kosul: '90 دن دا تسلسل' },
    toparlanma_ustasi: {
      ad: 'بحالی دا ماہر',
      aciklama: 'تسیں 3 وار بحالی موڈ پورا کیتا۔',
      kosul: '3 وار بحالی',
    },
    mukemmeliyetci: { ad: 'کمال پسند', aciklama: 'تسیں 30 دن تک 5/5 نمازاں ادا کیتیاں۔', kosul: '30 دن 5/5 نمازاں' },
    yuz_namaz: { ad: '100 نمازاں', aciklama: 'تسیں کُل 100 نمازاں ادا کیتیاں۔', kosul: '100 نمازاں ادا کرنا' },
    bin_namaz: { ad: '1000 نمازاں', aciklama: 'تسیں کُل 1000 نمازاں ادا کیتیاں۔', kosul: '1000 نمازاں ادا کرنا' },
  },

  rozetSeviyeleri: { bronz: 'کانسی', gumus: 'چاندی', altin: 'سونا', elmas: 'ہیرا' },

  gunBitis: {
    erken: 'چھیتی سون والیاں لئی',
    varsayilan: 'طے شدہ - بہتیاں تھاواں تے فجر توں پہلاں',
    gec: 'دیر نال سون والیاں لئی',
  },

  kutlama: {
    rozetEklendi: '🏅 تہاڈے بیجاں دے مجموعے وچ شامل ہو گیا',
    paylasin: 'شیئر کرو',
    rozetBaslik: 'اللہ قائم دائم رکھے',
    rozetMesaj: 'تسیں “{ad}” بیج حاصل کیتا۔',
    hedefBaslik: cogul({ one: '{n} دن', other: '{n} دن' }),
    hedefMesaj: 'تسیں “{ad}” دا ہدف پورا کیتا۔ اللہ قائم دائم رکھے۔',
    seviyeBaslik: 'تہاڈا نواں درجہ',
    yeniRank: 'نواں درجہ: {rank}',
    seviyeMesaj: 'ہن تہاڈا سفر “{rank}” دے درجے تے جاری اے۔ اللہ قائم دائم رکھے۔',
    toparlanmaBaslik: 'تہاڈا تسلسل واپس آ گیا',
    toparlanmaMesaj: cogul({
      one: 'تہاڈا {n} دن دا تسلسل اوتھوں ای جاری اے جتھے رُکیا سی۔ اللہ ثابت قدم رکھے۔',
      other: 'تہاڈا {n} دناں دا تسلسل اوتھوں ای جاری اے جتھے رُکیا سی۔ اللہ ثابت قدم رکھے۔',
    }),
    enUzunBaslik: 'تہاڈا سب توں لما تسلسل',
    enUzunMesaj: cogul({
      one: '{n} دن؛ ہن تک دا سب توں لما تسلسل۔ اللہ قائم دائم رکھے۔',
      other: '{n} دن؛ ہن تک دا سب توں لما تسلسل۔ اللہ قائم دائم رکھے۔',
    }),
  },

  sekme: {
    hataOkunamadi: 'تہاڈا پچھلا ریکارڈ ایس ویلے پڑھیا نہیں جا سکیا۔',
    yenidenErisim: 'تسلسل دا ڈیٹا دوبارہ لوڈ کرو',
    yenidenDeneyin: 'فیر کوشش کرو',
    yukleniyor: 'تہاڈے تسلسل دا ڈیٹا لوڈ ہو رہیا اے...',
    gunlukSeri: 'دن دا تسلسل',
    rekor: 'ریکارڈ',
    sozErisim: '{metin} ماخذ: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'اگلا ہدف',
    tumu: 'تسیں سارے بیج پورے کر لئے',
    kalan: cogul({ one: '{ad} بیج تک {n} دن باقی', other: '{ad} بیج تک {n} دن باقی' }),
    tumuErisim: 'تسیں سارے بیج پورے کر لئے: تسبیح پوری بھر گئی۔',
    erisim: '{ad} بیج: {hedef} وچوں {n} دن پورے۔',
  },

  gok: {
    gunHarfleri: ['پ', 'م', 'ب', 'ج', 'ج', 'ہ', 'ا'],
    erisim: '{ay}۔ {hedef}، {bes}، {donmus}۔ {seri}',
    hedefTutuldu: cogul({ one: '{n} دن ہدف پورا ہویا', other: '{n} دن ہدف پورا ہویا' }),
    besVakit: cogul({ one: '{n} دن پنجے نمازاں پوریاں', other: '{n} دن پنجے نمازاں پوریاں' }),
    dondurulmus: cogul({ one: '{n} دن روکیا گیا', other: '{n} دن روکے گئے' }),
    mevcutSeri: cogul({ one: 'موجودہ تسلسل {n} دن۔', other: 'موجودہ تسلسل {n} دن۔' }),
  },

  hedefAyar: {
    azalt: 'گھٹاؤ',
    deger: 'قدر',
    artir: 'ودھاؤ',
    esik: cogul({ one: '{n} نماز', other: '{n} نمازاں' }),
    sifirlaBaslik: 'تسلسل ری سیٹ کرو',
    sifirlaMesaj: 'تہاڈا سارا تسلسل دا ڈیٹا (تسلسل، بیج، پوائنٹ) ری سیٹ ہو جاوے گا۔ ایہہ کم واپس نہیں ہو سکدا۔ کیہ جاری رکھو گے؟',
    sifirla: 'ری سیٹ کرو',
    iptal: 'منسوخ',
    basarili: 'ہو گیا',
    sifirlandi: 'تہاڈا تسلسل دا ڈیٹا ری سیٹ ہو گیا۔',
    hedefAyarlari: 'ہدف دیاں ترتیباں',
    tamGunEsigi: 'پورے دن دی حد',
    tamGunAciklama: 'کسے دن نوں تسلسل وچ گنن لئی روزانہ ادا کیتیاں جان والیاں گھٹ توں گھٹ نمازاں دی گنتی طے کردا اے',
    sifirlama: 'ری سیٹ',
    verileriSifirla: 'تسلسل دا ڈیٹا ری سیٹ کرو',
    verileriSifirlaAlt: 'سارا تسلسل، بیج تے پوائنٹاں دا ڈیٹا مٹا دیندا اے',
  },

  rozetKarti: {
    erisim: '{ad} بیج، {durum}',
    kazanildi: 'حاصل کیتا',
    kilitli: 'بند',
  },

  toparlanma: {
    kartBaslik: 'بحالی موڈ',
    kartAltBaslik: 'تہاڈا تسلسل واپس آ سکدا اے',
    kartMesaj: 'تہاڈا {vurgu} تسلسل اوتھوں ای جاری ہو سکدا اے جتھے رُکیا سی۔',
    oncekiGun: cogul({ one: '{n} دن دا', other: '{n} دناں دا' }),
    ilerleme: '{tamam}/{hedef} دن پورے',
    kalan: cogul({
      one: 'ہور {n} دن پنجے نمازاں پوریاں کرن تے تہاڈا تسلسل اوتھوں ای جاری ہو جاوے گا۔',
      other: 'ہور {n} دن پنجے نمازاں پوریاں کرن تے تہاڈا تسلسل اوتھوں ای جاری ہو جاوے گا۔',
    }),
    bugun: 'اج دا دن پورا کرن تے تہاڈا تسلسل اوتھوں ای جاری ہو جاوے گا۔',
    uyari: 'ایہہ دن لگاتار پورے کرنا کافی اے؛ وچکار کوئی دن خالی رہیا تاں بحالی فیر شروع ہووے گی۔',
    kapatErisim: 'بحالی دی تفصیل بند کرو',
    anladim: 'سمجھ آ گئی',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'اپنی پیش رفت شیئر کرو',
    hazirDegilBaslik: 'تصویر تیار نہیں',
    hazirDegilMesaj: 'تصویر اجے تیار نہیں۔ کجھ سیکنڈ بعد فیر کوشش کرو۔',
    olusturulamadiBaslik: 'تصویر نہیں بن سکی',
    olusturulamadiMesaj: 'تصویر بناؤندیاں خرابی ہوئی۔ فیر کوشش کرو۔',
    kullanilamiyorBaslik: 'شیئر کرنا دستیاب نہیں',
    kullanilamiyorMesaj: 'ایس ڈیوائس تے شیئر کرن دی سہولت دستیاب نہیں۔',
    kapat: 'بند کرو',
    hikaye: 'اپنی سٹوری وچ پاؤ',
    platformlar: 'Instagram، WhatsApp تے دوجیاں تھاواں تے شیئر کیتا جا سکدا اے۔',
    tamam: 'ٹھیک اے',
    seriEnUzun: cogul({ one: 'میرا سب توں لما تسلسل: {n} دن', other: 'میرا سب توں لما تسلسل: {n} دن' }),
    seriZincir: cogul({ one: 'دن توں سلسلہ نہیں ٹُٹیا', other: 'دناں توں سلسلہ نہیں ٹُٹیا' }),
    seriSoz: '“ہر دن اک نکا قدم، روح وچ وڈا سکون۔ 🔥”',
    rozetYeni: 'میں نواں بیج حاصل کیتا',
    rozetSozleri: [
      'اج میں اپنے لئی اک چنگا قدم چُکیا۔ 🌟',
      'پکے ارادے نال سفر جاری اے، ایہہ بیج میرا اے۔ 💪',
      'میں سویر دی برکت پا لئی۔ 🌅',
      'روح نوں سکون دین والے ایس سفر وچ میں وی شامل آں۔ ✨',
      'نکے قدم وڈا سکون لیاؤندے نیں۔ 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'میں نواں بیج حاصل کیتا',
      hedef_tamamlandi: 'ہدف پورا ہو گیا',
      seviye_atlandi: 'نواں درجہ',
      toparlanma_tamamlandi: 'فیر راہ تے',
      en_uzun_seri: 'نواں ریکارڈ',
      varsayilan: 'کامیابی',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['میرا رب قائم دائم رکھے۔ 🤲', 'نکے قدم وڈا سکون لیاؤندے نیں۔ 🍃', 'اللہ ساہنوں سبھ نوں ثابت قدم رکھے۔ 🌱'],
      hedef_tamamlandi: ['نکے قدم وڈا سکون لیاؤندے نیں۔ 🍃', 'اللہ قائم دائم رکھے۔ 🤲', 'ہر دن اک ہور قدم۔ 🌱'],
      seviye_atlandi: [
        'ہر دن سفر تھوڑا ہور طے ہو رہیا اے، اللہ سوکھ دیوے۔ 🍃',
        'اللہ قائم دائم رکھے۔ 🤲',
        'سفر جاری اے۔ 🌱',
      ],
      toparlanma_tamamlandi: [
        'ڈِگنا نہیں، اُٹھنا ضروری اے۔ 🔄',
        'اللہ ثابت قدم رکھے۔ 🤲',
        'صبر نال ہر راہ طے ہوندا اے۔ 🌱',
      ],
      en_uzun_seri: [
        'ہر دن اک نکا قدم، دل وچ وڈا سکون۔ 🍃',
        'اللہ قائم دائم رکھے۔ 🤲',
        'میرا رب ساہنوں سبھ نوں ثابت قدم رکھے۔ 🌱',
      ],
    },
  },
};
