import type { Sozluk } from '../tr';

/** Pusula harfleri: ش شمال · ق شرق · ج جنوب · غ غرب. */
export const kible: Sozluk['kible'] = {
  baslik: 'القبلة',
  yon: {
    hizali: 'أنت باتجاه القبلة',
    arkada: 'القبلة خلفك، الاستدارة إلى الخلف',
    sagda: 'القبلة {derece}° إلى يمينك',
    solda: 'القبلة {derece}° إلى يسارك',
  },
  harf: { kuzey: 'ش', dogu: 'ق', guney: 'ج', bati: 'غ' },
  sekme: {
    pusula: 'البوصلة',
    pusulaErisim: 'وضع البوصلة',
    pusulaAciklama: 'عندما تصل علامة الكعبة إلى الحزّ في الأعلى، تكون باتجاه القبلة.',
    kamera: 'الكاميرا',
    kameraErisim: 'وضع الكاميرا',
    kameraAciklama: 'إمساك الهاتف عموديًا؛ تظهر علامة الكعبة في اتجاه القبلة.',
  },
  sayfa: {
    baslatiliyor: 'جارٍ تشغيل البوصلة…',
    izinKapali: 'إذن الموقع معطّل؛ موقعك ضروري لتحديد الاتجاه.',
  },
  hata: {
    izinGerekli: 'إذن الموقع ضروري لتحديد اتجاه القبلة.',
    konumServisi: 'تعذّر الوصول إلى خدمات الموقع. يُرجى التحقق من إعدادات الموقع في الجهاز.',
    baslatilamadi: 'تعذّر تشغيل خدمة القبلة.',
  },
  pusula: {
    ufuk: 'الأفق',
    konumAliniyor: 'جارٍ تحديد موقعك…',
    hazirlaniyor: 'جارٍ تجهيز البوصلة…',
    kuzeydenAci: 'القبلة {derece}° من الشمال',
    kabeUzakta: 'الكعبة على بعد {mesafe}',
    kuzeydenSaatYonu: 'من الشمال باتجاه عقارب الساعة',
    kuzeyden: '{derece}° من الشمال',
    kabeUzaktaKuzeyden: 'الكعبة على بعد {mesafe}، {derece}° من الشمال',
    pusulaErisim: 'بوصلة القبلة. {cumle}',
    pusulaYok: 'لا توجد بوصلة في هذا الجهاز؛ يُعرض الاتجاه نسبةً إلى الشمال.',
    kayiyorsa: 'إن انحرف الاتجاه، يُحرَّك الهاتف في الهواء على شكل الرقم 8.',
    kamerayla: 'العرض بالكاميرا',
  },
  kamera: {
    pusulayiKullanin: 'استخدام البوصلة',
    kullanilamiyorBaslik: 'عرض الكاميرا غير متاح على هذا الهاتف',
    kullanilamiyorMetin:
      'مستشعرات هاتفك لا تعطي اتجاهًا موثوقًا عند إمساكه عموديًا. البوصلة تواصل عرض الاتجاه بدقة.',
    izinBaslik: 'رؤية القبلة بالكاميرا',
    izinMetin:
      'عند إمساك الهاتف عموديًا والنظر حولك، تظهر علامة الكعبة في اتجاه القبلة. يتطلب ذلك إذن الكاميرا؛ ولا تُسجَّل الصورة ولا تغادر هاتفك.',
    kamerayiAcin: 'تشغيل الكاميرا',
    izinKapaliBaslik: 'إذن الكاميرا معطّل',
    izinKapaliMetin: 'يمكن تفعيل إذن الكاميرا من الإعدادات لعرض الكاميرا. البوصلة تعمل دون إذن.',
    ayarlariAcin: 'فتح الإعدادات',
    acilamadiBaslik: 'تعذّر فتح الكاميرا',
    acilamadiMetin: 'الكاميرا غير متاحة الآن. يمكن تحديد القبلة بالبوصلة.',
    hesaplaniyor: 'جارٍ حساب الاتجاه…',
    dikTutun: 'إمساك الهاتف عموديًا',
  },
  kalibrasyon: {
    tesekkurErisim: 'شكرًا، أصبح الاتجاه أدق الآن',
    tesekkur: 'شكرًا، أصبح الاتجاه أدق الآن ✓',
    baslik: 'معايرة البوصلة',
    sallayin: 'تحريك الهاتف في الهواء على شكل الرقم 8.',
    metal: 'الابتعاد عن الأدوات المعدنية والأغطية المغناطيسية.',
    dogruluk: 'الدقة',
    simdiDegil: 'ليس الآن',
  },
};
