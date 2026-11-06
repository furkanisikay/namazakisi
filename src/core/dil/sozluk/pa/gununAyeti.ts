import type { Sozluk } from '../tr';

/**
 * Pencapçada (Şahmuki) QuranEnc meali yok (tek Pencapça meal `punjabi_arif` Gurmuki): ekranda
 * yalnız Arapça metin (Tanzil) ve künye görünür; `sayfa.mealYok` gerçekten çizilir. Meal künyesi
 * alanları (`mealKaynagi`, `sayfaKunye`) bu dilde kullanılmaz; yer tutucu kümesi için doğal
 * biçimde yazıldı. Meal = ترجمہ.
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'اج دی آیت',
  etiket: 'اج دی آیت',
  kisaKunye: '{sure} {ref}',
  kuran: 'قرآن',
  mealKaynagi: '{yayimci}، QuranEnc {surum}',
  sayfaKunye: 'قرآن {ref} · ترجمہ: {yayimci}، QuranEnc {surum} · عربی متن: Tanzil منصوبہ',
  arapcaKaynagi: 'عربی: Tanzil',
  sigmiyor: 'اج دی آیت ایس سائز وچ نہیں سماندی۔ پڑھن لئی ٹیپ کرو۔',
  acin: 'کھولو',
  sayfa: {
    tarih: '{gunAdi}، {gun} {ay}',
    kisaTarih: '{gun} {ay}',
    metniPaylasin: 'متن شیئر کرو',
    paylasilamadi: 'ایس ڈیوائس تے شیئر کرنا ممکن نہیں۔',
    gorselPaylasin: 'تصویر شیئر کرو',
    widgetVeDuvar: 'ویجیٹ تے وال پیپر',
    widgetVeDuvarAciklama: 'ہوم سکرین تے شامل کرو، لاک سکرین تے ویکھو',
    oncekiGunler: 'پچھلے دن',
    dun: 'کل',
    kaynakNotu: 'قرآنی متن Tanzil منصوبے توں بغیر کسے تبدیلی دے لیا گیا اے۔',
    mealYok: 'ایس بولی وچ اجے ترجمہ نہیں؛ عربی متن وکھایا جا رہیا اے۔',
    tanzilBaglanti: 'عربی متن: Tanzil منصوبہ (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'ویجیٹ',
    widgetEkleyin: 'ہوم سکرین تے ویجیٹ شامل کرو',
    widgetEkleyinAciklama: 'ہوم سکرین تے کسے خالی تھاں نوں دبا کے رکھو، ویجیٹس، Namaz Akışı، اج دی آیت',
    widgetEkleyinAciklamaIos: 'ہوم سکرین تے کسے خالی تھاں نوں دبا کے رکھو، Edit، Add Widget، Namaz Akışı',
    widgetEkleDugme: 'ہوم سکرین تے شامل کرو',
    duvarBolum: 'وال پیپر',
    duvarAnahtar: 'ہر روز بدلو',
    duvarAcikOzet: 'چالو · ہر روز فجر ویلے نواں',
    duvarKapaliOzet: 'بند',
    yer: 'کتھے',
    yerler: { kilit: 'لاک سکرین', ana: 'ہوم سکرین', ikisi: 'دونویں' },
    zemin: 'پچھوکڑ',
    zeminler: { gece: 'رات', kagit: 'کاغذ', palet: 'رنگ' },
    arapca: 'عربی متن وی وکھاؤ',
    arapcaNot: 'کجھ علماء صلاح دیندے نیں کہ جس فون دی سکرین تے آیت نظر آ رہی ہووے اونوں غسل خانے وچ نہ لے جایا جاوے۔',
    onizleyin: 'اج دی تصویر ویکھو',
    kapatNotu: 'بند کرن تے آخری تصویر سکرین تے رہندی اے؛ اپنا پچھلا وال پیپر گیلری وچوں آپ دوبارہ چُنو۔',
    kullanilamiyor: 'دستیاب نہیں',
    engelli: 'ایس ڈیوائس تے وال پیپر بدلن دی اجازت بند اے (دفتر یا سکول دا انتظام)، ایس لئی ایہہ ترتیب چالو نہیں ہو سکدی۔',
    yazilamadi: 'اج دی تصویر نہیں لگ سکی۔ ایپ کھولن تے فیر کوشش کیتی جاوے گی۔',
    yerlestirildi: 'وال پیپر لگ گیا',
    onizlemeErisim: 'اج دے وال پیپر دی جھلک',
  },
  onay: {
    baslik: 'تہاڈا وال پیپر بدل جاوے گا',
    metin:
      'ہر روز فجر ویلے اج دی آیت تہاڈی لاک سکرین تے آوے گی۔ ایپ تہاڈا موجودہ وال پیپر محفوظ نہیں رکھ سکدی: بند کرن تے اونوں گیلری وچوں آپ دوبارہ چُنو۔',
    acin: 'چالو کرو',
  },
  ios: {
    aciklama:
      'iPhone تے ایپاں آپ وال پیپر نہیں بدل سکدیاں۔ Shortcuts ایپ ایہہ کم ہر سویرے تہاڈے لئی کر سکدی اے؛ ایہنوں صرف اک وار ترتیب دینا پیندا اے۔',
    ucAdim: 'تن قدم',
    adim1:
      'Shortcuts ایپ وچ نواں شارٹ کٹ بناؤ۔ پہلاں “اج دی آیت دی تصویر” والا ایکشن، فیر وال پیپر دی تصویر لاون والا ایکشن شامل کرو (“Wallpaper” لبھو)۔',
    kisayollariAcin: 'Shortcuts کھولو',
    adim2: 'Shortcuts وچ Automation ٹیب تے نویں Time of Day آٹومیشن بناؤ تے فجر توں بعد دا کوئی وقت چُنو (جیویں 07:30)۔',
    adim3: 'Run Immediately چُنو تے اپنا شامل کیتا ہویا شارٹ کٹ جوڑو۔',
    elle: 'یا ہتھ نال',
    gorseliKaydedin: 'اج دی تصویر محفوظ کرو',
    kaydetIpucu: 'کھلن والے شیئر مینیو توں تصویر Photos وچ محفوظ کیتی جا سکدی اے۔',
    not: 'آٹومیشن تہاڈے چُنے ہوئے مقرر وقت تے چلدی اے تے فجر دا وقت نہیں ویکھ سکدی؛ جے فجر توں پہلاں چلے تاں کل دی آیت لا دیندی اے۔',
  },
};
