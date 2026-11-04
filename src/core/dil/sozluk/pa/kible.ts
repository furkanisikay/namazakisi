import type { Sozluk } from '../tr';

/** Kadran harfleri Urduca gibi: شمال ش · مشرق مش · جنوب ج · مغرب مغ (مشرق/مغرب ikisi de م ile başlar). */
export const kible: Sozluk['kible'] = {
  baslik: 'قبلہ',
  yon: {
    hizali: 'تسیں قبلہ رُخ او',
    arkada: 'قبلہ تہاڈے پچھے اے، پچھے مُڑو',
    sagda: 'قبلہ تہاڈے سجے پاسے {derece}° تے اے',
    solda: 'قبلہ تہاڈے کھبے پاسے {derece}° تے اے',
  },
  harf: { kuzey: 'ش', dogu: 'مش', guney: 'ج', bati: 'مغ' },
  sekme: {
    pusula: 'قطب نما',
    pusulaErisim: 'قطب نما موڈ',
    pusulaAciklama: 'جدوں کعبہ دا نشان اُتلے نشان تک اپڑے تاں تسیں قبلہ رُخ او۔',
    kamera: 'کیمرا',
    kameraErisim: 'کیمرا موڈ',
    kameraAciklama: 'فون نوں سدھا رکھو؛ کعبہ دا نشان قبلہ دی سمت وچ نظر آوے گا۔',
  },
  sayfa: {
    baslatiliyor: 'قطب نما شروع ہو رہیا اے…',
    izinKapali: 'مقام دی اجازت بند اے؛ سمت لبھن لئی تہاڈا مقام چاہیدا اے۔',
  },
  hata: {
    izinGerekli: 'قبلہ دی سمت لبھن لئی مقام دی اجازت چاہیدی اے۔',
    konumServisi: 'مقام دیاں سروساں تک رسائی نہیں ہو سکی۔ اپنی ڈیوائس دیاں مقام والیاں ترتیباں ویکھو۔',
    baslatilamadi: 'قبلہ سروس شروع نہیں ہو سکی۔',
  },
  pusula: {
    ufuk: 'افق',
    konumAliniyor: 'تہاڈا مقام لبھیا جا رہیا اے…',
    hazirlaniyor: 'قطب نما تیار ہو رہیا اے…',
    kuzeydenAci: 'قبلہ شمال توں {derece}° تے اے',
    kabeUzakta: 'کعبہ {mesafe} دور اے',
    kuzeydenSaatYonu: 'شمال توں گھڑی دی سمت وچ',
    kuzeyden: 'شمال توں {derece}°',
    kabeUzaktaKuzeyden: 'کعبہ {mesafe} دور اے، شمال توں {derece}°',
    pusulaErisim: 'قبلہ نما۔ {cumle}',
    pusulaYok: 'ایس ڈیوائس وچ قطب نما نہیں؛ سمت شمال دے لحاظ نال وکھائی جا رہی اے۔',
    kayiyorsa: 'جے سمت ہلدی ہووے تاں فون نوں ہوا وچ 8 دی شکل وچ گھماؤ۔',
    kamerayla: 'کیمرے نال ویکھو',
  },
  kamera: {
    pusulayiKullanin: 'قطب نما ورتو',
    kullanilamiyorBaslik: 'ایس فون تے کیمرا منظر دستیاب نہیں',
    kullanilamiyorMetin:
      'سدھا پھڑن تے تہاڈے فون دے سینسر بھروسے والی سمت نہیں دیندے۔ قطب نما سمت ٹھیک وکھاندا رہوے گا۔',
    izinBaslik: 'قبلہ کیمرے نال ویکھو',
    izinMetin:
      'فون سدھا پھڑ کے آلے دوالے ویکھو تاں کعبہ دا نشان قبلہ دی سمت وچ نظر آوے گا۔ ایہدے لئی کیمرے دی اجازت چاہیدی اے؛ تصویر محفوظ نہیں ہوندی تے تہاڈے فون توں باہر نہیں جاندی۔',
    kamerayiAcin: 'کیمرا چالو کرو',
    izinKapaliBaslik: 'کیمرے دی اجازت بند اے',
    izinKapaliMetin: 'کیمرا منظر لئی ترتیباں توں کیمرے دی اجازت دتی جا سکدی اے۔ قطب نما اجازت توں بغیر وی کم کردا اے۔',
    ayarlariAcin: 'ترتیباں کھولو',
    acilamadiBaslik: 'کیمرا نہیں کھل سکیا',
    acilamadiMetin: 'کیمرا ایس ویلے دستیاب نہیں۔ قطب نما نال قبلہ دی سمت لبھی جا سکدی اے۔',
    hesaplaniyor: 'سمت لبھی جا رہی اے…',
    dikTutun: 'اپنا فون سدھا رکھو',
  },
  kalibrasyon: {
    tesekkurErisim: 'شکریہ، ہن سمت ہور ٹھیک اے',
    tesekkur: 'شکریہ، ہن سمت ہور ٹھیک اے ✓',
    baslik: 'قطب نما کیلیبریٹ کرو',
    sallayin: 'فون نوں ہوا وچ 8 دی شکل وچ گھماؤ۔',
    metal: 'دھات دیاں چیزاں تے مقناطیسی کور توں دور رہو۔',
    dogruluk: 'درستی',
    simdiDegil: 'ہن نہیں',
  },
};
