import type { Sozluk } from '../tr';

/** Pusula harfleri: ش (شمال) · خ (ختیځ) · س (سوېل) · ل (لوېدیځ). */
export const kible: Sozluk['kible'] = {
  baslik: 'قبله',
  yon: {
    hizali: 'تاسو د قبلې په لور یاست',
    arkada: 'قبله ستاسو شاته ده، بېرته وګرځئ',
    sagda: 'قبله ستاسو ښي لور ته {derece}° ده',
    solda: 'قبله ستاسو کیڼ لور ته {derece}° ده',
  },
  harf: { kuzey: 'ش', dogu: 'خ', guney: 'س', bati: 'ل' },
  sekme: {
    pusula: 'قطب نما',
    pusulaErisim: 'د قطب نما حالت',
    pusulaAciklama: 'کله چې د کعبې نښه پورتنۍ کټ ته راشي، تاسو د قبلې په لور یاست.',
    kamera: 'کمره',
    kameraErisim: 'د کمرې حالت',
    kameraAciklama: 'موبایل نېغ ونیسئ؛ د کعبې نښه د قبلې په لور ښکاره کېږي.',
  },
  sayfa: {
    baslatiliyor: 'قطب نما پیلېږي…',
    izinKapali: 'د موقعیت اجازه بنده ده؛ د لوري موندلو لپاره ستاسو موقعیت ته اړتیا ده.',
  },
  hata: {
    izinGerekli: 'د قبلې د لوري موندلو لپاره د موقعیت اجازې ته اړتیا ده.',
    konumServisi: 'د موقعیت خدمتونو ته لاسرسی نشته. د خپلې وسیلې د موقعیت ترتیبات وګورئ.',
    baslatilamadi: 'د قبلې خدمت پیل نه شو.',
  },
  pusula: {
    ufuk: 'افق',
    konumAliniyor: 'ستاسو موقعیت اخیستل کېږي…',
    hazirlaniyor: 'قطب نما چمتو کېږي…',
    kuzeydenAci: 'قبله له شمال څخه {derece}°',
    kabeUzakta: 'کعبه {mesafe} لرې ده',
    kuzeydenSaatYonu: 'له شمال څخه د ساعت د ستنو په لور',
    kuzeyden: 'له شمال څخه {derece}°',
    kabeUzaktaKuzeyden: 'کعبه {mesafe} لرې ده، له شمال څخه {derece}°',
    pusulaErisim: 'د قبلې قطب نما. {cumle}',
    pusulaYok: 'په دې وسیله کې قطب نما نشته؛ لوری د شمال له مخې ښیو.',
    kayiyorsa: 'که لوری ښوییږي، خپل موبایل په هوا کې داسې وخوځوئ لکه 8 چې رسموئ.',
    kamerayla: 'په کمره یې وګورئ',
  },
  kamera: {
    pusulayiKullanin: 'قطب نما وکاروئ',
    kullanilamiyorBaslik: 'د کمرې لید په دې موبایل کې نه کار کوي',
    kullanilamiyorMetin: 'ستاسو د موبایل سینسرونه په نېغ حالت کې باوري لوری نه ورکوي. قطب نما به لوری په سمه توګه ښيي.',
    izinBaslik: 'قبله په کمره وګورئ',
    izinMetin:
      'کله چې موبایل نېغ ونیسئ او شاوخوا وګورئ، د کعبې نښه د قبلې په لور ښکاره کېږي. د دې لپاره د کمرې اجازې ته اړتیا ده؛ انځور نه ثبتېږي او له موبایل څخه نه وځي.',
    kamerayiAcin: 'کمره پرانیزئ',
    izinKapaliBaslik: 'د کمرې اجازه بنده ده',
    izinKapaliMetin: 'د کمرې د لید لپاره کولای شئ په ترتیباتو کې د کمرې اجازه فعاله کړئ. قطب نما پرته له اجازې هم کار کوي.',
    ayarlariAcin: 'ترتیبات پرانیزئ',
    acilamadiBaslik: 'کمره پرانیستل نه شوه',
    acilamadiMetin: 'کمره اوس نه کارېږي. د قطب نما په مرسته د قبلې لوری موندلای شئ.',
    hesaplaniyor: 'لوری حسابېږي…',
    dikTutun: 'خپل موبایل نېغ ونیسئ',
  },
  kalibrasyon: {
    tesekkurErisim: 'مننه، لوری اوس دقیق شو',
    tesekkur: 'مننه، لوری اوس دقیق شو ✓',
    baslik: 'قطب نما برابر کړئ',
    sallayin: 'خپل موبایل په هوا کې داسې وخوځوئ لکه 8 چې رسموئ.',
    metal: 'له فلزي شیانو او مقناطیسي پوښ څخه لرې شئ.',
    dogruluk: 'دقت',
    simdiDegil: 'اوس نه',
  },
};
