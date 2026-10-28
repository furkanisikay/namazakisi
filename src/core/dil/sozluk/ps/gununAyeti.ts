import type { Sozluk } from '../tr';

/**
 * Meal QuranEnc `pashto_rwwad` (Rowwad). iOS'un Peştuca arayüzü yoktur: iOS menü ve Kısayollar
 * adları (Edit, Add Widget, Shortcuts, Automation, Time of Day, Run Immediately, Photos) cihazda
 * göründüğü gibi İngilizce bırakılır.
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'د ورځې آیت',
  etiket: 'د ورځې آیت',
  kisaKunye: '{sure} {ref}',
  kuran: 'قرآن',
  mealKaynagi: '{yayimci}، QuranEnc {surum}',
  sayfaKunye: 'قرآن {ref} · ژباړه: {yayimci}، QuranEnc {surum} · عربي متن: د Tanzil پروژه',
  arapcaKaynagi: 'عربي: Tanzil',
  sigmiyor: 'د نن آیت په دې اندازه کې نه ځایېږي. د لوستلو لپاره یې کېکاږئ.',
  acin: 'پرانیزئ',
  sayfa: {
    tarih: '{gunAdi}، {gun} {ay}',
    kisaTarih: '{gun} {ay}',
    metniPaylasin: 'متن شریک کړئ',
    paylasilamadi: 'په دې وسیله کې شریکول ممکن نه شول.',
    gorselPaylasin: 'د انځور په توګه یې شریک کړئ',
    widgetVeDuvar: 'ویجټ او د سکرین شالید',
    widgetVeDuvarAciklama: 'اصلي سکرین ته یې اضافه کړئ، د قلف په سکرین کې یې وګورئ',
    oncekiGunler: 'تېرې ورځې',
    dun: 'پرون',
    kaynakNotu: 'ژباړې له QuranEnc څخه پرته له بدلون اخیستل کېږي او د نویو نسخو په خپرېدو تازه کېږي.',
    mealYok: 'په دې ژبه لا ژباړه نشته؛ عربي متن ښودل کېږي.',
    tanzilBaglanti: 'عربي متن: د Tanzil پروژه (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'ویجټ',
    widgetEkleyin: 'اصلي سکرین ته ویجټ اضافه کړئ',
    widgetEkleyinAciklama: 'په اصلي سکرین کې په یوه تش ځای اوږده کېکاږئ، ویجټونه، Namaz Akışı، د ورځې آیت',
    widgetEkleyinAciklamaIos: 'په اصلي سکرین کې په یوه تش ځای اوږده کېکاږئ، Edit، Add Widget، Namaz Akışı',
    widgetEkleDugme: 'اصلي سکرین ته یې اضافه کړئ',
    duvarBolum: 'د سکرین شالید',
    duvarAnahtar: 'هره ورځ یې بدل کړئ',
    duvarAcikOzet: 'فعال · هره ورځ د سهار په وخت تازه کېږي',
    duvarKapaliOzet: 'بند',
    yer: 'چېرته',
    yerler: { kilit: 'د قلف سکرین', ana: 'اصلي سکرین', ikisi: 'دواړه' },
    zemin: 'شالید',
    zeminler: { gece: 'شپه', kagit: 'کاغذ', palet: 'رنګونه' },
    arapca: 'عربي متن هم وښیئ',
    arapcaNot: 'ځینې علما سپارښتنه کوي چې له داسې موبایل سره تشناب ته ورنه شئ چې په سکرین یې آیت ښکاري.',
    onizleyin: 'د نن انځور مخکتنه وکړئ',
    kapatNotu: 'که یې بند کړئ، وروستی انځور به په سکرین پاتې شي؛ خپل پخوانی شالید به پخپله له ګالرۍ څخه وټاکئ.',
    kullanilamiyor: 'نه کارېږي',
    engelli: 'په دې وسیله کې د شالید د بدلولو اجازه بنده ده (د کار یا ښوونځي مدیریت). له همدې امله دا ترتیب نه شئ فعالولای.',
    yazilamadi: 'د نن انځور ونه ټاکل شو. کله چې اپ پرانیزئ، بیا هڅه کېږي.',
    yerlestirildi: 'د سکرین شالید وټاکل شو',
    onizlemeErisim: 'د نن شالید مخکتنه',
  },
  onay: {
    baslik: 'ستاسو د سکرین شالید به بدل شي',
    metin:
      'هره ورځ د سهار په وخت د ورځې آیت ستاسو د قلف سکرین ته راځي. اپ ستاسو اوسنی شالید نه شي ساتلای: که یې بند کړئ، هغه به پخپله له ګالرۍ څخه وټاکئ.',
    acin: 'فعال یې کړئ',
  },
  ios: {
    aciklama:
      'په iPhone کې اپونه پخپله د سکرین شالید نه شي بدلولای. د Shortcuts اپ کولای شي هر سهار دا ستاسو پر ځای وکړي؛ تاسو یې یوازې یو ځل جوړوئ.',
    ucAdim: 'درې ګامونه',
    adim1:
      'د Shortcuts په اپ کې یو نوی shortcut جوړ کړئ. لومړی د "د ورځې د آیت انځور" کړنه، بیا هغه کړنه اضافه کړئ چې د شالید عکس ټاکي ("Wallpaper" ولټوئ).',
    kisayollariAcin: 'Shortcuts پرانیزئ',
    adim2: 'په Shortcuts کې د Automation په ټب کې یو نوی Time of Day automation جوړ کړئ او له سهار وروسته یو وخت وټاکئ (د بېلګې په توګه 07:30).',
    adim3: 'Run Immediately وټاکئ او هغه shortcut ورسره وتړئ چې اضافه کړی مو دی.',
    elle: 'یا په لاس',
    gorseliKaydedin: 'د نن انځور خوندي کړئ',
    kaydetIpucu: 'د شریکولو په پرانیستل شوي مینو کې کولای شئ انځور Photos ته خوندي کړئ.',
    not: 'automation ستاسو په ټاکلي ثابت وخت چلېږي او د سهار وخت نه شي تعقیبولای؛ که له سهار مخکې وچلېږي، د پرون آیت ټاکي.',
  },
};
