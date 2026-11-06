import type { Sozluk } from '../tr';

/**
 * Nepalce meal: QuranEnc `nepali_central`; künye yayımcıyı `{yayimci}` ile alır. "Meal" = अनुवाद
 * (doğrulanmadı). iPhone yol dizilerinde iOS'un menü adları (Shortcuts, Automation…) İngilizce kalır:
 * iOS'ta Nepalce sistem dili yok (Apple feature-availability; Hintçe/Urduca ile aynı karar).
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'आजको आयत',
  etiket: 'आजको आयत',
  kisaKunye: '{sure} {ref}',
  kuran: 'कुरआन',
  mealKaynagi: '{yayimci}, QuranEnc {surum}',
  sayfaKunye: 'कुरआन {ref} · अनुवाद: {yayimci}, QuranEnc {surum} · अरबी पाठ: Tanzil Project',
  arapcaKaynagi: 'अरबी: Tanzil',
  sigmiyor: 'आजको आयत यो साइजमा अटाउँदैन। पढ्न ट्याप गर्नुहोस्।',
  acin: 'खोल्नुहोस्',
  sayfa: {
    tarih: '{gunAdi}, {ay} {gun}',
    kisaTarih: '{ay} {gun}',
    metniPaylasin: 'पाठ सेयर गर्नुहोस्',
    paylasilamadi: 'यो डिभाइसमा सेयर गर्न मिल्दैन।',
    gorselPaylasin: 'तस्बिरका रूपमा सेयर गर्नुहोस्',
    widgetVeDuvar: 'विजेट र वालपेपर',
    widgetVeDuvarAciklama: 'होम स्क्रिनमा थप्नुहोस्, लक स्क्रिनमा हेर्नुहोस्',
    oncekiGunler: 'अघिल्ला दिन',
    dun: 'हिजो',
    kaynakNotu: 'अनुवादहरू QuranEnc बाट कुनै परिवर्तनबिना लिइन्छन् र नयाँ संस्करण आएपछि अपडेट हुन्छन्।',
    mealYok: 'यो भाषामा अझै अनुवाद छैन; अरबी पाठ देखाइँदै छ।',
    tanzilBaglanti: 'अरबी पाठ: Tanzil Project (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'विजेट',
    widgetEkleyin: 'होम स्क्रिनमा विजेट थप्नुहोस्',
    widgetEkleyinAciklama: 'होम स्क्रिनको खाली ठाउँमा थिचिराख्नुहोस्, विजेटहरू, Namaz Akışı, आजको आयत',
    widgetEkleyinAciklamaIos: 'होम स्क्रिनको खाली ठाउँमा थिचिराख्नुहोस्, Edit, Add Widget, Namaz Akışı',
    widgetEkleDugme: 'होम स्क्रिनमा थप्नुहोस्',
    duvarBolum: 'वालपेपर',
    duvarAnahtar: 'हरेक दिन बदल्नुहोस्',
    duvarAcikOzet: 'सक्रिय · हरेक दिन फज्रमा नयाँ हुन्छ',
    duvarKapaliOzet: 'निष्क्रिय',
    yer: 'कहाँ',
    yerler: { kilit: 'लक स्क्रिन', ana: 'होम स्क्रिन', ikisi: 'दुवै' },
    zemin: 'पृष्ठभूमि',
    zeminler: { gece: 'रात', kagit: 'कागज', palet: 'रङ' },
    arapca: 'अरबी पाठ पनि देखाउनुहोस्',
    arapcaNot: 'स्क्रिनमा आयत देखिने फोन शौचालयमा नलैजान केही विद्वानहरू सल्लाह दिन्छन्।',
    onizleyin: 'आजको तस्बिरको पूर्वावलोकन हेर्नुहोस्',
    kapatNotu: 'बन्द गरेमा अन्तिम तस्बिर स्क्रिनमै रहन्छ; अघिल्लो वालपेपर ग्यालरीबाट आफैं फेरि छान्नुहोस्।',
    kullanilamiyor: 'उपलब्ध छैन',
    engelli: 'यो डिभाइसमा वालपेपर बदल्ने सुविधा बन्द गरिएको छ (कार्यालय वा विद्यालयको व्यवस्थापन), त्यसैले यो सेटिङ सक्रिय गर्न सकिँदैन।',
    yazilamadi: 'आजको तस्बिर राख्न सकिएन। एप खोल्दा फेरि प्रयास गरिने छ।',
    yerlestirildi: 'वालपेपर राखियो',
    onizlemeErisim: 'आजको वालपेपरको पूर्वावलोकन',
  },
  onay: {
    baslik: 'तपाईंको वालपेपर बदलिने छ',
    metin:
      'हरेक दिन फज्रमा आजको आयत तपाईंको लक स्क्रिनमा आउने छ। एपले तपाईंको हालको वालपेपर जोगाएर राख्न सक्दैन: बन्द गरेमा त्यसलाई ग्यालरीबाट आफैं फेरि छान्नुहोस्।',
    acin: 'सक्रिय गर्नुहोस्',
  },
  ios: {
    aciklama:
      'iPhone मा एपहरूले आफैं वालपेपर बदल्न सक्दैनन्। Shortcuts एपले हरेक बिहान तपाईंका लागि यो काम गर्न सक्छ; सेटअप एक पटक मात्र गर्नुपर्छ।',
    ucAdim: 'तीन चरण',
    adim1:
      'Shortcuts एपमा नयाँ सर्टकट बनाउनुहोस्। पहिले "आजको आयतको तस्बिर" कार्य, त्यसपछि वालपेपर तस्बिर राख्ने कार्य थप्नुहोस् ("Wallpaper" खोज्नुहोस्)।',
    kisayollariAcin: 'Shortcuts खोल्नुहोस्',
    adim2: 'Shortcuts को Automation ट्याबमा नयाँ Time of Day अटोमेसन बनाउनुहोस् र फज्रपछिको कुनै समय छान्नुहोस् (जस्तै 07:30)।',
    adim3: 'Run Immediately छान्नुहोस् र आफूले थपेको सर्टकट जोड्नुहोस्।',
    elle: 'वा हातैले',
    gorseliKaydedin: 'आजको तस्बिर सेभ गर्नुहोस्',
    kaydetIpucu: 'खुल्ने सेयर मेनुबाट तस्बिर Photos मा सेभ गर्न सकिन्छ।',
    not: 'अटोमेसन तपाईंले छानेको निश्चित समयमा चल्छ र फज्रको समय पछ्याउन सक्दैन; फज्रअघि चलेमा हिजोको आयत राख्छ।',
  },
};
