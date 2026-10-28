import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Seri = सिलसिला. Paylaşım sözleri kişinin kendi sesidir; Hintçede birinci tekil geniş/şimdiki/
 * gelecek zaman konuşanın cinsiyetine göre çekildiği için yalnız nesneye uyan geçmiş zaman
 * ("मैंने … हासिल किया") ya da isim cümlesi kullanılır. "!" yok; dua kalıpları:
 * अल्लाह क़ायम व दायम रखे · अल्लाह साबित क़दम रखे.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'आपका सिलसिला रौशन है',
    enUzun: cogul({ one: 'सबसे लंबा सिलसिला: {n} दिन', other: 'सबसे लंबा सिलसिला: {n} दिन' }),
    gunBuyuk: cogul({ one: 'दिन', other: 'दिन' }),
    sonrakiHedef: 'अगला लक्ष्य: दिन {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} दिन बाक़ी', other: '{n} दिन बाक़ी' }),
    tamamlandi: 'पूरा हुआ',
    paylasErisim: 'अपनी प्रगति शेयर करें',
    paylasBuyuk: 'अपनी प्रगति शेयर करें',
  },

  hedefler: {
    ilk_adim: { ad: 'पहला हफ़्ता', aciklama: '7 दिन बिना नाग़ा नमाज़ अदा करें', cumle: 'पहला हफ़्ता' },
    aliskanlik_ustasi: { ad: 'आदत का माहिर', aciklama: '21 दिन - आदत बनने की मुद्दत', cumle: 'आदत का माहिर' },
    kararlilik: { ad: 'साबित क़दमी', aciklama: '60 दिन बिना नाग़ा', cumle: 'साबित क़दमी' },
    efsane: { ad: 'लाजवाब', aciklama: '90 दिन - बेमिसाल इस्तिक़ामत', cumle: 'लाजवाब' },
  },

  /** Klasik tasavvuf mertebe adları, Devanagari yazısıyla. */
  seviyeler: ['मुब्तदी', 'तालिब', 'सालिक', 'मुरीद', 'आरिफ़', 'हाफ़िज़', 'कामिल'],

  rozetler: {
    ilk_adim: { ad: 'पहला क़दम', aciklama: 'आपने पहला हफ़्ता पूरा कर लिया।', kosul: '7 दिन का सिलसिला' },
    aliskanlik_ustasi: {
      ad: 'आदत का माहिर',
      aciklama: '21 दिन - आदत बनने की मुद्दत पूरी हो गई।',
      kosul: '21 दिन का सिलसिला',
    },
    kararlilik: { ad: 'साबित क़दम', aciklama: 'आपने 60 दिन बिना नाग़ा नमाज़ अदा की।', kosul: '60 दिन का सिलसिला' },
    efsane: { ad: 'लाजवाब', aciklama: '90 दिन - आपने बेमिसाल इस्तिक़ामत दिखाई।', kosul: '90 दिन का सिलसिला' },
    toparlanma_ustasi: {
      ad: 'वापसी का माहिर',
      aciklama: 'आपने 3 बार वापसी मोड पूरा किया।',
      kosul: '3 बार वापसी',
    },
    mukemmeliyetci: { ad: 'कमाल पसंद', aciklama: 'आपने 30 दिन तक 5/5 नमाज़ें अदा कीं।', kosul: '30 दिन 5/5 नमाज़ें' },
    yuz_namaz: { ad: '100 नमाज़ें', aciklama: 'आपने कुल 100 नमाज़ें अदा कीं।', kosul: '100 नमाज़ें अदा करना' },
    bin_namaz: { ad: '1000 नमाज़ें', aciklama: 'आपने कुल 1000 नमाज़ें अदा कीं।', kosul: '1000 नमाज़ें अदा करना' },
  },

  rozetSeviyeleri: { bronz: 'कांसा', gumus: 'चांदी', altin: 'सोना', elmas: 'हीरा' },

  gunBitis: {
    erken: 'जल्दी सोने वालों के लिए',
    varsayilan: 'डिफ़ॉल्ट - ज़्यादातर जगहों पर फ़ज्र से पहले',
    gec: 'देर से सोने वालों के लिए',
  },

  kutlama: {
    rozetEklendi: '🏅 आपके बैज के संग्रह में जुड़ गया',
    paylasin: 'शेयर करें',
    rozetBaslik: 'अल्लाह क़ायम व दायम रखे',
    rozetMesaj: 'आपने "{ad}" बैज हासिल किया।',
    hedefBaslik: cogul({ one: '{n} दिन', other: '{n} दिन' }),
    hedefMesaj: 'आपने "{ad}" का लक्ष्य पूरा किया। अल्लाह क़ायम व दायम रखे।',
    seviyeBaslik: 'आपका नया दर्जा',
    yeniRank: 'नया दर्जा: {rank}',
    seviyeMesaj: 'अब आपका सफ़र "{rank}" के दर्जे पर जारी है। अल्लाह क़ायम व दायम रखे।',
    toparlanmaBaslik: 'आपका सिलसिला वापस आ गया',
    toparlanmaMesaj: cogul({
      one: 'आपका {n} दिन का सिलसिला वहीं से जारी है जहाँ रुका था। अल्लाह साबित क़दम रखे।',
      other: 'आपका {n} दिन का सिलसिला वहीं से जारी है जहाँ रुका था। अल्लाह साबित क़दम रखे।',
    }),
    enUzunBaslik: 'आपका सबसे लंबा सिलसिला',
    enUzunMesaj: cogul({
      one: '{n} दिन; अब तक का सबसे लंबा सिलसिला। अल्लाह क़ायम व दायम रखे।',
      other: '{n} दिन; अब तक का सबसे लंबा सिलसिला। अल्लाह क़ायम व दायम रखे।',
    }),
  },

  sekme: {
    hataOkunamadi: 'आपका पिछला रिकॉर्ड अभी पढ़ा नहीं जा सका।',
    yenidenErisim: 'सिलसिले का डेटा दोबारा लोड करें',
    yenidenDeneyin: 'फिर से कोशिश करें',
    yukleniyor: 'आपके सिलसिले का डेटा लोड हो रहा है...',
    gunlukSeri: 'दिन का सिलसिला',
    rekor: 'रिकॉर्ड',
    sozErisim: '{metin} स्रोत: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'अगला लक्ष्य',
    tumu: 'आपने सभी बैज पूरे कर लिए',
    kalan: cogul({ one: '{ad} बैज तक {n} दिन बाक़ी', other: '{ad} बैज तक {n} दिन बाक़ी' }),
    tumuErisim: 'आपने सभी बैज पूरे कर लिए: तस्बीह पूरी भर गई।',
    erisim: '{ad} बैज: {hedef} में से {n} दिन पूरे।',
  },

  gok: {
    gunHarfleri: ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'],
    erisim: '{ay}। {hedef}, {bes}, {donmus}। {seri}',
    hedefTutuldu: cogul({ one: '{n} दिन लक्ष्य पूरा हुआ', other: '{n} दिन लक्ष्य पूरा हुआ' }),
    besVakit: cogul({ one: '{n} दिन पाँचों नमाज़ें पूरी', other: '{n} दिन पाँचों नमाज़ें पूरी' }),
    dondurulmus: cogul({ one: '{n} दिन रोका गया', other: '{n} दिन रोके गए' }),
    mevcutSeri: cogul({ one: 'मौजूदा सिलसिला {n} दिन।', other: 'मौजूदा सिलसिला {n} दिन।' }),
  },

  hedefAyar: {
    azalt: 'कम करें',
    deger: 'मान',
    artir: 'बढ़ाएं',
    esik: cogul({ one: '{n} नमाज़', other: '{n} नमाज़ें' }),
    sifirlaBaslik: 'सिलसिला रीसेट करें',
    sifirlaMesaj: 'आपका सिलसिले का सारा डेटा (सिलसिला, बैज, पॉइंट) रीसेट हो जाएगा। यह काम वापस नहीं हो सकता। क्या जारी रखें?',
    sifirla: 'रीसेट करें',
    iptal: 'रद्द करें',
    basarili: 'हो गया',
    sifirlandi: 'आपका सिलसिले का डेटा रीसेट हो गया।',
    hedefAyarlari: 'लक्ष्य की सेटिंग',
    tamGunEsigi: 'पूरे दिन की सीमा',
    tamGunAciklama: 'किसी दिन को सिलसिले में गिनने के लिए रोज़ाना अदा की जाने वाली कम से कम नमाज़ों की संख्या तय करता है',
    sifirlama: 'रीसेट',
    verileriSifirla: 'सिलसिले का डेटा रीसेट करें',
    verileriSifirlaAlt: 'सिलसिले, बैज और पॉइंट का सारा डेटा मिटा देता है',
  },

  rozetKarti: {
    erisim: '{ad} बैज, {durum}',
    kazanildi: 'हासिल किया',
    kilitli: 'लॉक है',
  },

  toparlanma: {
    kartBaslik: 'वापसी मोड',
    kartAltBaslik: 'आपका सिलसिला वापस आ सकता है',
    kartMesaj: 'आपका {vurgu} सिलसिला वहीं से जारी हो सकता है जहाँ रुका था।',
    oncekiGun: cogul({ one: '{n} दिन का', other: '{n} दिन का' }),
    ilerleme: '{tamam}/{hedef} दिन पूरे',
    kalan: cogul({
      one: 'और {n} दिन पाँचों नमाज़ें पूरी करने पर आपका सिलसिला वहीं से जारी हो जाएगा।',
      other: 'और {n} दिन पाँचों नमाज़ें पूरी करने पर आपका सिलसिला वहीं से जारी हो जाएगा।',
    }),
    bugun: 'आज का दिन पूरा करने पर आपका सिलसिला वहीं से जारी हो जाएगा।',
    uyari: 'ये दिन लगातार पूरे करना काफ़ी है; बीच में कोई दिन ख़ाली रहा तो वापसी दोबारा शुरू होगी।',
    kapatErisim: 'वापसी का विवरण बंद करें',
    anladim: 'समझ आ गई',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'अपनी प्रगति शेयर करें',
    hazirDegilBaslik: 'तस्वीर तैयार नहीं',
    hazirDegilMesaj: 'तस्वीर अभी तैयार नहीं है। कुछ सेकंड बाद फिर से कोशिश करें।',
    olusturulamadiBaslik: 'तस्वीर नहीं बन सकी',
    olusturulamadiMesaj: 'तस्वीर बनाते समय गड़बड़ी हुई। फिर से कोशिश करें।',
    kullanilamiyorBaslik: 'शेयर करना उपलब्ध नहीं',
    kullanilamiyorMesaj: 'इस डिवाइस पर शेयर करने की सुविधा उपलब्ध नहीं है।',
    kapat: 'बंद करें',
    hikaye: 'अपनी स्टोरी में जोड़ें',
    platformlar: 'Instagram, WhatsApp और दूसरी जगहों पर शेयर किया जा सकता है।',
    tamam: 'ठीक है',
    seriEnUzun: cogul({ one: 'मेरा सबसे लंबा सिलसिला: {n} दिन', other: 'मेरा सबसे लंबा सिलसिला: {n} दिन' }),
    seriZincir: cogul({ one: 'दिन से सिलसिला नहीं टूटा', other: 'दिन से सिलसिला नहीं टूटा' }),
    seriSoz: '"हर दिन एक छोटा क़दम, रूह में बड़ा सुकून। 🔥"',
    rozetYeni: 'मैंने नया बैज हासिल किया',
    rozetSozleri: [
      'आज मैंने अपने लिए एक अच्छा क़दम उठाया। 🌟',
      'इरादे के साथ सफ़र जारी है, यह बैज मेरा है। 💪',
      'मैंने सुबह की बरकत पा ली। 🌅',
      'रूह को सुकून देने वाले इस सफ़र में मैं भी शामिल हूँ। ✨',
      'छोटे क़दम बड़ा सुकून लाते हैं। 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'मैंने नया बैज हासिल किया',
      hedef_tamamlandi: 'लक्ष्य पूरा हो गया',
      seviye_atlandi: 'नया दर्जा',
      toparlanma_tamamlandi: 'फिर से राह पर',
      en_uzun_seri: 'नया रिकॉर्ड',
      varsayilan: 'कामयाबी',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['मेरा रब क़ायम व दायम रखे। 🤲', 'छोटे क़दम बड़ा सुकून लाते हैं। 🍃', 'अल्लाह हम सबको साबित क़दम रखे। 🌱'],
      hedef_tamamlandi: ['छोटे क़दम बड़ा सुकून लाते हैं। 🍃', 'अल्लाह क़ायम व दायम रखे। 🤲', 'हर दिन एक और क़दम। 🌱'],
      seviye_atlandi: [
        'हर दिन सफ़र थोड़ा और तय हो रहा है, अल्लाह आसानी दे। 🍃',
        'अल्लाह क़ायम व दायम रखे। 🤲',
        'सफ़र जारी है। 🌱',
      ],
      toparlanma_tamamlandi: [
        'गिरना नहीं, उठना अहम है। 🔄',
        'अल्लाह साबित क़दम रखे। 🤲',
        'सब्र से हर रास्ता तय होता है। 🌱',
      ],
      en_uzun_seri: [
        'हर दिन एक छोटा क़दम, दिल में बड़ा सुकून। 🍃',
        'अल्लाह क़ायम व दायम रखे। 🤲',
        'मेरा रब हम सबको साबित क़दम रखे। 🌱',
      ],
    },
  },
};
