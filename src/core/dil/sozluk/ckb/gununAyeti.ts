import type { Sozluk } from '../tr';

/**
 * Soranî meal: Muhammad Salih Bamoki (QuranEnc `kurdish_bamoki`); künye yayımcıyı `{yayimci}`
 * ile alır. iPhone'da Kestirmeler uygulamasının arayüz adları (Shortcuts, Automation…) Soranî
 * sistem dili olmadığından Latin harfle kalır.
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'ئایەتی ڕۆژ',
  etiket: 'ئایەتی ڕۆژ',
  kisaKunye: '{sure} {ref}',
  kuran: 'قورئان',
  mealKaynagi: '{yayimci}، QuranEnc {surum}',
  sayfaKunye: 'قورئان {ref} · وەرگێڕان: {yayimci}، QuranEnc {surum} · دەقی عەرەبی: پرۆژەی Tanzil',
  arapcaKaynagi: 'عەرەبی: Tanzil',
  sigmiyor: 'ئایەتی ئەمڕۆ لەم قەبارەیەدا جێی نابێتەوە. بۆ خوێندنەوە دەستی لێ بدەن.',
  acin: 'کردنەوە',
  sayfa: {
    tarih: '{gunAdi}، {gun}ی {ay}',
    kisaTarih: '{gun}ی {ay}',
    metniPaylasin: 'ھاوبەشکردنی دەق',
    paylasilamadi: 'ھاوبەشکردن لەم ئامێرەدا بەردەست نییە.',
    gorselPaylasin: 'ھاوبەشکردن وەک وێنە',
    widgetVeDuvar: 'ویجێت و وێنەی پاشبنەما',
    widgetVeDuvarAciklama: 'بیخەنە سەر شاشەی سەرەکی، لە شاشەی قوفڵدا بیبینن',
    oncekiGunler: 'ڕۆژانی پێشوو',
    dun: 'دوێنێ',
    kaynakNotu: 'وەرگێڕانەکان بێ گۆڕانکاری لە QuranEnc وەردەگیرێن و کاتێک وەشانی نوێ بڵاو دەبێتەوە نوێ دەکرێنەوە.',
    mealYok: 'ھێشتا وەرگێڕان بەم زمانە نییە؛ دەقی عەرەبی پیشان دەدرێت.',
    tanzilBaglanti: 'دەقی عەرەبی: پرۆژەی Tanzil (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'ویجێت',
    widgetEkleyin: 'ویجێتێک بخەنە سەر شاشەی سەرەکی',
    widgetEkleyinAciklama: 'پەنجە لەسەر شوێنێکی بەتاڵی شاشەی سەرەکی ڕابگرن، ویجێتەکان، Namaz Akışı، ئایەتی ڕۆژ',
    widgetEkleyinAciklamaIos: 'پەنجە لەسەر شوێنێکی بەتاڵی شاشەی سەرەکی ڕابگرن، Edit، Add Widget، Namaz Akışı',
    widgetEkleDugme: 'زیادکردن بۆ شاشەی سەرەکی',
    duvarBolum: 'وێنەی پاشبنەما',
    duvarAnahtar: 'ھەموو ڕۆژێک بگۆڕدرێت',
    duvarAcikOzet: 'چالاک · ھەموو ڕۆژێک لە کاتی بەیانیدا نوێ دەبێتەوە',
    duvarKapaliOzet: 'ناچالاک',
    yer: 'شوێن',
    yerler: { kilit: 'شاشەی قوفڵ', ana: 'شاشەی سەرەکی', ikisi: 'ھەردووکیان' },
    zemin: 'پاشبنەما',
    zeminler: { gece: 'شەو', kagit: 'کاغەز', palet: 'ڕەنگدان' },
    arapca: 'دەقی عەرەبیش پیشان بدرێت',
    arapcaNot: 'ھەندێک زانا ئامۆژگاری دەکەن کە مۆبایلێک کە ئایەتێک لەسەر شاشەکەیەتی نەبرێتە ناو ئاودەست.',
    onizleyin: 'پێشبینینی وێنەی ئەمڕۆ',
    kapatNotu: 'ئەگەر بیکوژێننەوە، دوا وێنە لەسەر شاشە دەمێنێتەوە؛ وێنەی پاشبنەمای پێشووتان دووبارە لە گەلەرییەکەتان ھەڵبژێرنەوە.',
    kullanilamiyor: 'بەردەست نییە',
    engelli: 'گۆڕینی وێنەی پاشبنەما لەم ئامێرەدا ناچالاک کراوە (بەڕێوەبردنی کار یان قوتابخانە)، بۆیە ئەم ڕێکخستنە چالاک ناکرێت.',
    yazilamadi: 'وێنەی ئەمڕۆ دانەنرا. کاتێک ئەپەکە دەکەنەوە دووبارە ھەوڵ دەدرێتەوە.',
    yerlestirildi: 'وێنەی پاشبنەما دانرا',
    onizlemeErisim: 'پێشبینینی وێنەی پاشبنەمای ئەمڕۆ',
  },
  onay: {
    baslik: 'وێنەی پاشبنەماکەتان دەگۆڕێت',
    metin:
      'ھەموو ڕۆژێک لە کاتی بەیانیدا ئایەتی ڕۆژ دێتە سەر شاشەی قوفڵەکەتان. ئەپەکە ناتوانێت وێنەی پاشبنەمای ئێستاتان بپارێزێت: ئەگەر ئەمە بکوژێننەوە، دووبارە لە گەلەرییەکەتان ھەڵیبژێرنەوە.',
    acin: 'چالاککردن',
  },
  ios: {
    aciklama:
      'لە iPhone، ئەپەکان ناتوانن خۆیان وێنەی پاشبنەما بگۆڕن. ئەپی Shortcuts دەتوانێت ھەموو بەیانییەک ئەمەتان بۆ بکات؛ تەنیا یەک جار ڕێکی دەخەن.',
    ucAdim: 'سێ ھەنگاو',
    adim1:
      'لە ئەپی Shortcuts کورتەڕێیەکی نوێ دروست بکەن. سەرەتا کرداری «وێنەی ئایەتی ڕۆژ» زیاد بکەن، پاشان ئەو کردارەی وێنەی پاشبنەما دادەنێت (بگەڕێن بۆ «Wallpaper»).',
    kisayollariAcin: 'Shortcuts بکەنەوە',
    adim2: 'لە Shortcuts، لە تابی Automation، ئۆتۆماتیکێکی نوێی Time of Day دروست بکەن و کاتێک دوای بەیانی ھەڵبژێرن (بۆ نموونە 07:30).',
    adim3: 'Run Immediately ھەڵبژێرن و ئەو کورتەڕێیەی زیادتان کرد پێوەی ببەستن.',
    elle: 'یان بە دەست',
    gorseliKaydedin: 'وێنەی ئەمڕۆ پاشەکەوت بکەن',
    kaydetIpucu: 'لە لیستی ھاوبەشکردندا کە دەکرێتەوە، دەتوانن وێنەکە لە Photos پاشەکەوت بکەن.',
    not: 'ئۆتۆماتیکەکە لەو کاتە جێگیرەدا کار دەکات کە ھەڵیدەبژێرن و ناتوانێت کاتی بەیانی پەیڕەو بکات؛ ئەگەر پێش بەیانی کار بکات، ئایەتی دوێنێ دادەنێت.',
  },
};
