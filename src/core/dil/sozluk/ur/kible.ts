import type { Sozluk } from '../tr';

/** Kadran harfleri: شمال ش · مشرق مش · جنوب ج · مغرب مغ (مشرق/مغرب ikisi de م ile başlar). */
export const kible: Sozluk['kible'] = {
  baslik: 'قبلہ',
  yon: {
    hizali: 'آپ قبلہ رخ ہیں',
    arkada: 'قبلہ آپ کے پیچھے ہے، پیچھے مڑیں',
    sagda: 'قبلہ آپ کے دائیں جانب {derece}° پر ہے',
    solda: 'قبلہ آپ کے بائیں جانب {derece}° پر ہے',
  },
  harf: { kuzey: 'ش', dogu: 'مش', guney: 'ج', bati: 'مغ' },
  sekme: {
    pusula: 'قطب نما',
    pusulaErisim: 'قطب نما موڈ',
    pusulaAciklama: 'جب کعبہ کا نشان اوپر والے نشان تک پہنچے تو آپ قبلہ رخ ہیں۔',
    kamera: 'کیمرا',
    kameraErisim: 'کیمرا موڈ',
    kameraAciklama: 'فون کو سیدھا رکھیں؛ کعبہ کا نشان قبلہ کی سمت میں ظاہر ہوگا۔',
  },
  sayfa: {
    baslatiliyor: 'قطب نما شروع ہو رہا ہے…',
    izinKapali: 'مقام کی اجازت بند ہے؛ سمت معلوم کرنے کے لیے آپ کا مقام درکار ہے۔',
  },
  hata: {
    izinGerekli: 'قبلہ کی سمت معلوم کرنے کے لیے مقام کی اجازت درکار ہے۔',
    konumServisi: 'مقام کی سروسز تک رسائی نہیں ہو سکی۔ اپنے آلے کی مقام کی ترتیبات چیک کریں۔',
    baslatilamadi: 'قبلہ سروس شروع نہیں ہو سکی۔',
  },
  pusula: {
    ufuk: 'افق',
    konumAliniyor: 'آپ کا مقام معلوم کیا جا رہا ہے…',
    hazirlaniyor: 'قطب نما تیار ہو رہا ہے…',
    kuzeydenAci: 'قبلہ شمال سے {derece}° پر ہے',
    kabeUzakta: 'کعبہ {mesafe} دور ہے',
    kuzeydenSaatYonu: 'شمال سے گھڑی کی سمت میں',
    kuzeyden: 'شمال سے {derece}°',
    kabeUzaktaKuzeyden: 'کعبہ {mesafe} دور ہے، شمال سے {derece}°',
    pusulaErisim: 'قبلہ نما۔ {cumle}',
    pusulaYok: 'اس آلے میں قطب نما نہیں؛ سمت شمال کے لحاظ سے دکھائی جا رہی ہے۔',
    kayiyorsa: 'اگر سمت ہل رہی ہو تو فون کو ہوا میں 8 کی شکل میں گھمائیں۔',
    kamerayla: 'کیمرے سے دیکھیں',
  },
  kamera: {
    pusulayiKullanin: 'قطب نما استعمال کریں',
    kullanilamiyorBaslik: 'اس فون پر کیمرا منظر دستیاب نہیں',
    kullanilamiyorMetin:
      'سیدھا پکڑنے پر آپ کے فون کے سینسر قابلِ اعتماد سمت نہیں دیتے۔ قطب نما سمت درست دکھاتا رہے گا۔',
    izinBaslik: 'قبلہ کیمرے سے دیکھیں',
    izinMetin:
      'فون سیدھا پکڑ کر اردگرد دیکھیں تو کعبہ کا نشان قبلہ کی سمت میں ظاہر ہوگا۔ اس کے لیے کیمرے کی اجازت درکار ہے؛ تصویر محفوظ نہیں ہوتی اور آپ کے فون سے باہر نہیں جاتی۔',
    kamerayiAcin: 'کیمرا آن کریں',
    izinKapaliBaslik: 'کیمرے کی اجازت بند ہے',
    izinKapaliMetin: 'کیمرا منظر کے لیے ترتیبات سے کیمرے کی اجازت دی جا سکتی ہے۔ قطب نما اجازت کے بغیر بھی کام کرتا ہے۔',
    ayarlariAcin: 'ترتیبات کھولیں',
    acilamadiBaslik: 'کیمرا نہیں کھل سکا',
    acilamadiMetin: 'کیمرا اس وقت دستیاب نہیں۔ قطب نما سے قبلہ کی سمت معلوم کی جا سکتی ہے۔',
    hesaplaniyor: 'سمت معلوم کی جا رہی ہے…',
    dikTutun: 'اپنا فون سیدھا رکھیں',
  },
  kalibrasyon: {
    tesekkurErisim: 'شکریہ، اب سمت زیادہ درست ہے',
    tesekkur: 'شکریہ، اب سمت زیادہ درست ہے ✓',
    baslik: 'قطب نما کیلیبریٹ کریں',
    sallayin: 'فون کو ہوا میں 8 کی شکل میں گھمائیں۔',
    metal: 'دھاتی اشیاء اور مقناطیسی کور سے دور رہیں۔',
    dogruluk: 'درستی',
    simdiDegil: 'ابھی نہیں',
  },
};
