import type { Sozluk } from '../tr';

/**
 * Arapça arayüzde günün ayeti YALNIZ Kur'an metnidir (Tanzil, künyeli; meal/tefsir yok — sahip
 * kararı). Meal künyesi alanları (`mealKaynagi`, `sayfaKunye`) Arapçada kullanılmaz; yer tutucu
 * kümesi için "ترجمة" sözü geçmeden yazıldı. Meal yokluğunu anlatan metinler Kur'an metnini anlatır.
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'آية اليوم',
  etiket: 'آية اليوم',
  kisaKunye: '{sure} {ref}',
  kuran: 'القرآن الكريم',
  mealKaynagi: '{yayimci}، QuranEnc {surum}',
  sayfaKunye: 'القرآن الكريم {ref} · {yayimci}، QuranEnc {surum} · النص القرآني: مشروع تنزيل',
  arapcaKaynagi: 'النص القرآني: تنزيل',
  sigmiyor: 'آية اليوم لا تتسع في هذا الحجم. انقر لقراءتها.',
  acin: 'فتح',
  sayfa: {
    tarih: '{gunAdi}، {gun} {ay}',
    kisaTarih: '{gun} {ay}',
    metniPaylasin: 'مشاركة النص',
    paylasilamadi: 'المشاركة غير متاحة على هذا الجهاز.',
    gorselPaylasin: 'مشاركة كصورة',
    widgetVeDuvar: 'الأداة والخلفية',
    widgetVeDuvarAciklama: 'إضافتها إلى الشاشة الرئيسية، ورؤيتها على شاشة القفل',
    oncekiGunler: 'الأيام السابقة',
    dun: 'أمس',
    kaynakNotu: 'النص القرآني مأخوذ من مشروع تنزيل دون تغيير.',
    mealYok: 'تُعرض الآية بنصّها القرآني.',
    tanzilBaglanti: 'النص القرآني: مشروع تنزيل (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'الأداة',
    widgetEkleyin: 'إضافة أداة إلى الشاشة الرئيسية',
    widgetEkleyinAciklama: 'ضغطة مطوّلة على مكان فارغ في الشاشة الرئيسية، ثم الأدوات، ثم Namaz Akışı، ثم آية اليوم',
    widgetEkleyinAciklamaIos: 'ضغطة مطوّلة على مكان فارغ في الشاشة الرئيسية، ثم تحرير، ثم إضافة أداة، ثم Namaz Akışı',
    widgetEkleDugme: 'إضافة إلى الشاشة الرئيسية',
    duvarBolum: 'الخلفية',
    duvarAnahtar: 'تغييرها كل يوم',
    duvarAcikOzet: 'مفعّل · تتجدد كل يوم عند الفجر',
    duvarKapaliOzet: 'معطّل',
    yer: 'المكان',
    yerler: { kilit: 'شاشة القفل', ana: 'الشاشة الرئيسية', ikisi: 'كلتاهما' },
    zemin: 'الخلفية اللونية',
    zeminler: { gece: 'ليلي', kagit: 'ورقي', palet: 'لوحة ألوان' },
    arapca: 'عرض النص القرآني أيضًا',
    arapcaNot: 'ينصح بعض العلماء بعدم الدخول إلى الخلاء بهاتف تظهر على شاشته آية.',
    onizleyin: 'معاينة صورة اليوم',
    kapatNotu: 'عند الإيقاف تبقى الصورة الأخيرة على الشاشة؛ ويُختار الخلفية السابقة يدويًا من المعرض.',
    kullanilamiyor: 'غير متاح',
    engelli: 'تغيير الخلفية معطّل على هذا الجهاز (من إدارة العمل أو المدرسة)، لذلك لا يمكن تفعيل هذا الإعداد.',
    yazilamadi: 'تعذّر تعيين صورة اليوم. ستُعاد المحاولة عند فتح التطبيق.',
    yerlestirildi: 'تم تعيين الخلفية',
    onizlemeErisim: 'معاينة خلفية اليوم',
  },
  onay: {
    baslik: 'ستتغير خلفيتك',
    metin:
      'كل يوم عند الفجر تظهر آية اليوم على شاشة القفل. لا يستطيع التطبيق حفظ خلفيتك الحالية: عند الإيقاف تُختار من المعرض يدويًا.',
    acin: 'تفعيل',
  },
  ios: {
    aciklama:
      'على iPhone لا تستطيع التطبيقات تغيير الخلفية بنفسها. تطبيق الاختصارات يمكنه فعل ذلك كل صباح نيابةً عنك؛ والإعداد مرة واحدة فقط.',
    ucAdim: 'ثلاث خطوات',
    adim1:
      'إنشاء اختصار جديد في تطبيق الاختصارات. إضافة إجراء «صورة آية اليوم» أولًا، ثم الإجراء الذي يعيّن صورة الخلفية (البحث عن «الخلفية»).',
    kisayollariAcin: 'فتح الاختصارات',
    adim2: 'في الاختصارات، في علامة تبويب الأتمتة، إنشاء أتمتة جديدة من نوع «وقت من اليوم» واختيار وقت بعد الفجر (مثلًا 07:30).',
    adim3: 'اختيار «تشغيل فورًا» وربط الاختصار الذي أُضيف.',
    elle: 'أو يدويًا',
    gorseliKaydedin: 'حفظ صورة اليوم',
    kaydetIpucu: 'من قائمة المشاركة التي تُفتح يمكن حفظ الصورة في الصور.',
    not: 'تعمل الأتمتة في الوقت الثابت المختار ولا تتبع وقت الفجر؛ فإن عملت قبل الفجر وضعت آية الأمس.',
  },
};
