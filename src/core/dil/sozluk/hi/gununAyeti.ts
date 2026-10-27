import type { Sozluk } from '../tr';

/**
 * Hintçe meal: Azizul Haq Al-Omari (QuranEnc `hindi_omari`); künye yayımcıyı `{yayimci}` ile alır.
 * iPhone yol dizilerinde iOS'un menü adları (Shortcuts, Automation…) İngilizce kalır: Hindistan'da
 * iPhone arayüzü çoğunlukla İngilizcedir (cihazda doğrulanmadı; Urduca ile aynı karar).
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'आज की आयत',
  etiket: 'आज की आयत',
  kisaKunye: '{sure} {ref}',
  kuran: 'क़ुरआन',
  mealKaynagi: '{yayimci}, QuranEnc {surum}',
  sayfaKunye: 'क़ुरआन {ref} · तर्जुमा: {yayimci}, QuranEnc {surum} · अरबी टेक्स्ट: Tanzil प्रोजेक्ट',
  arapcaKaynagi: 'अरबी: Tanzil',
  sigmiyor: 'आज की आयत इस साइज़ में नहीं समाती। पढ़ने के लिए टैप करें।',
  acin: 'खोलें',
  sayfa: {
    tarih: '{gunAdi}, {gun} {ay}',
    kisaTarih: '{gun} {ay}',
    metniPaylasin: 'टेक्स्ट शेयर करें',
    paylasilamadi: 'इस डिवाइस पर शेयर करना मुमकिन नहीं है।',
    gorselPaylasin: 'तस्वीर शेयर करें',
    widgetVeDuvar: 'विजेट और वॉलपेपर',
    widgetVeDuvarAciklama: 'होम स्क्रीन पर जोड़ें, लॉक स्क्रीन पर देखें',
    oncekiGunler: 'पिछले दिन',
    dun: 'कल',
    kaynakNotu: 'तर्जुमे QuranEnc से बिना बदलाव के लिए जाते हैं और नया वर्ज़न आने पर अपडेट होते हैं।',
    mealYok: 'इस भाषा में अभी तर्जुमा नहीं है; अरबी टेक्स्ट दिखाया जा रहा है।',
    tanzilBaglanti: 'अरबी टेक्स्ट: Tanzil प्रोजेक्ट (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'विजेट',
    widgetEkleyin: 'होम स्क्रीन पर विजेट जोड़ें',
    widgetEkleyinAciklama: 'होम स्क्रीन पर किसी ख़ाली जगह को दबाकर रखें, विजेट, Namaz Akışı, आज की आयत',
    widgetEkleyinAciklamaIos: 'होम स्क्रीन पर किसी ख़ाली जगह को दबाकर रखें, Edit, Add Widget, Namaz Akışı',
    widgetEkleDugme: 'होम स्क्रीन पर जोड़ें',
    duvarBolum: 'वॉलपेपर',
    duvarAnahtar: 'हर दिन बदलें',
    duvarAcikOzet: 'चालू · हर दिन फ़ज्र के वक़्त नया होता है',
    duvarKapaliOzet: 'बंद',
    yer: 'कहाँ',
    yerler: { kilit: 'लॉक स्क्रीन', ana: 'होम स्क्रीन', ikisi: 'दोनों' },
    zemin: 'बैकग्राउंड',
    zeminler: { gece: 'रात', kagit: 'काग़ज़', palet: 'रंग' },
    arapca: 'अरबी टेक्स्ट भी दिखाएं',
    arapcaNot: 'कुछ उलमा सलाह देते हैं कि जिस फ़ोन की स्क्रीन पर आयत दिख रही हो, उसे बैतुल-ख़ला (टॉयलेट) में न ले जाया जाए।',
    onizleyin: 'आज की तस्वीर का प्रीव्यू देखें',
    kapatNotu: 'बंद करने पर आख़िरी तस्वीर स्क्रीन पर रहती है; पिछला वॉलपेपर गैलरी से ख़ुद दोबारा चुनें।',
    kullanilamiyor: 'उपलब्ध नहीं',
    engelli: 'इस डिवाइस पर वॉलपेपर बदलने की अनुमति बंद है (दफ़्तर या स्कूल का प्रबंधन), इसलिए यह सेटिंग चालू नहीं हो सकती।',
    yazilamadi: 'आज की तस्वीर नहीं लग सकी। ऐप खोलने पर फिर से कोशिश की जाएगी।',
    yerlestirildi: 'वॉलपेपर लग गया',
    onizlemeErisim: 'आज के वॉलपेपर का प्रीव्यू',
  },
  onay: {
    baslik: 'आपका वॉलपेपर बदल जाएगा',
    metin:
      'हर दिन फ़ज्र के वक़्त आज की आयत आपकी लॉक स्क्रीन पर आएगी। ऐप आपका मौजूदा वॉलपेपर संभालकर नहीं रख सकता: बंद करने पर उसे गैलरी से ख़ुद दोबारा चुनें।',
    acin: 'चालू करें',
  },
  ios: {
    aciklama:
      'iPhone पर ऐप ख़ुद वॉलपेपर नहीं बदल सकते। Shortcuts ऐप यह काम हर सुबह आपके लिए कर सकता है; सेटअप सिर्फ़ एक बार करना होता है।',
    ucAdim: 'तीन क़दम',
    adim1:
      'Shortcuts ऐप में नया शॉर्टकट बनाएं। पहले "आज की आयत की तस्वीर" वाला ऐक्शन, फिर वॉलपेपर की तस्वीर लगाने वाला ऐक्शन जोड़ें ("Wallpaper" खोजें)।',
    kisayollariAcin: 'Shortcuts खोलें',
    adim2: 'Shortcuts में Automation टैब पर नया Time of Day ऑटोमेशन बनाएं और फ़ज्र के बाद का कोई समय चुनें (जैसे 07:30)।',
    adim3: 'Run Immediately चुनें और अपना जोड़ा हुआ शॉर्टकट जोड़ें।',
    elle: 'या हाथ से',
    gorseliKaydedin: 'आज की तस्वीर सेव करें',
    kaydetIpucu: 'खुलने वाले शेयर मेनू से तस्वीर Photos में सेव की जा सकती है।',
    not: 'ऑटोमेशन आपके चुने हुए तय समय पर चलता है और फ़ज्र का वक़्त नहीं देख सकता; अगर फ़ज्र से पहले चले तो कल की आयत लगा देता है।',
  },
};
