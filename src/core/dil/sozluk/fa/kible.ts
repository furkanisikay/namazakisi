import type { Sozluk } from '../tr';

/** Pusula harfleri: ش شمال · ق شرق · ج جنوب · غ غرب (Arapçadaki kalıp; Farsça yön adları aynı sözcükler). */
export const kible: Sozluk['kible'] = {
  baslik: 'قبله',
  yon: {
    hizali: 'رو به قبله هستید',
    arkada: 'قبله پشت سر شماست، برگردید',
    sagda: 'قبله {derece}° سمت راست شماست',
    solda: 'قبله {derece}° سمت چپ شماست',
  },
  harf: { kuzey: 'ش', dogu: 'ق', guney: 'ج', bati: 'غ' },
  sekme: {
    pusula: 'قطب‌نما',
    pusulaErisim: 'حالت قطب‌نما',
    pusulaAciklama: 'وقتی نشان کعبه به شکاف بالا برسد، رو به قبله هستید.',
    kamera: 'دوربین',
    kameraErisim: 'حالت دوربین',
    kameraAciklama: 'تلفن را عمودی نگه دارید؛ نشان کعبه در جهت قبله ظاهر می‌شود.',
  },
  sayfa: {
    baslatiliyor: 'در حال راه‌اندازی قطب‌نما…',
    izinKapali: 'مجوز موقعیت خاموش است؛ برای پیدا کردن جهت به موقعیت شما نیاز است.',
  },
  hata: {
    izinGerekli: 'برای پیدا کردن جهت قبله، مجوز موقعیت لازم است.',
    konumServisi: 'به خدمات موقعیت دسترسی نیست. تنظیمات موقعیت دستگاه خود را بررسی کنید.',
    baslatilamadi: 'سرویس قبله راه‌اندازی نشد.',
  },
  pusula: {
    ufuk: 'افق',
    konumAliniyor: 'در حال گرفتن موقعیت شما…',
    hazirlaniyor: 'در حال آماده‌سازی قطب‌نما…',
    kuzeydenAci: 'قبله {derece}° از شمال',
    kabeUzakta: 'کعبه {mesafe} فاصله دارد',
    kuzeydenSaatYonu: 'از شمال در جهت عقربه‌های ساعت',
    kuzeyden: '{derece}° از شمال',
    kabeUzaktaKuzeyden: 'کعبه {mesafe} فاصله دارد، {derece}° از شمال',
    pusulaErisim: 'قطب‌نمای قبله. {cumle}',
    pusulaYok: 'این دستگاه قطب‌نما ندارد؛ جهت را نسبت به شمال نشان می‌دهیم.',
    kayiyorsa: 'اگر جهت جابه‌جا می‌شود، تلفن را در هوا به شکل عدد 8 حرکت دهید.',
    kamerayla: 'دیدن با دوربین',
  },
  kamera: {
    pusulayiKullanin: 'استفاده از قطب‌نما',
    kullanilamiyorBaslik: 'نمای دوربین روی این تلفن در دسترس نیست',
    kullanilamiyorMetin:
      'حسگرهای تلفن شما در حالت عمودی جهت قابل اعتمادی نمی‌دهند. قطب‌نما همچنان جهت را درست نشان می‌دهد.',
    izinBaslik: 'قبله را با دوربین ببینید',
    izinMetin:
      'تلفن را عمودی نگه دارید و به اطراف نگاه کنید؛ نشان کعبه در جهت قبله ظاهر می‌شود. برای این کار مجوز دوربین لازم است؛ تصویر ضبط نمی‌شود و هرگز از تلفن شما بیرون نمی‌رود.',
    kamerayiAcin: 'روشن کردن دوربین',
    izinKapaliBaslik: 'مجوز دوربین خاموش است',
    izinKapaliMetin: 'برای نمای دوربین می‌توانید مجوز دوربین را در تنظیمات روشن کنید. قطب‌نما بدون آن هم کار می‌کند.',
    ayarlariAcin: 'باز کردن تنظیمات',
    acilamadiBaslik: 'دوربین باز نشد',
    acilamadiMetin: 'دوربین اکنون در دسترس نیست. می‌توانید جهت قبله را با قطب‌نما پیدا کنید.',
    hesaplaniyor: 'در حال پیدا کردن جهت…',
    dikTutun: 'تلفن را عمودی نگه دارید',
  },
  kalibrasyon: {
    tesekkurErisim: 'سپاس، جهت اکنون دقیق‌تر است',
    tesekkur: 'سپاس، جهت اکنون دقیق‌تر است ✓',
    baslik: 'تنظیم قطب‌نما',
    sallayin: 'تلفن را در هوا به شکل عدد 8 حرکت دهید.',
    metal: 'از اشیای فلزی و قاب‌های مغناطیسی دور شوید.',
    dogruluk: 'دقت',
    simdiDegil: 'الان نه',
  },
};
