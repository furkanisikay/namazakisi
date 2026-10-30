import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = ተከታታይነት. Ge'ez'de büyük harf yok: BÜYÜK anahtarlar normal yazılır. "!" ve övgü yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'ተከታታይነትዎ እየነደደ ነው',
    enUzun: cogul({ one: 'ረጅሙ ተከታታይነት፦ {n} ቀን', other: 'ረጅሙ ተከታታይነት፦ {n} ቀናት' }),
    gunBuyuk: cogul({ one: 'ቀን', other: 'ቀናት' }),
    sonrakiHedef: 'ቀጣዩ ግብ፦ ቀን {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} ቀን ቀርቷል', other: '{n} ቀናት ቀርተዋል' }),
    tamamlandi: 'ተጠናቋል',
    paylasErisim: 'እድገትዎን ያጋሩ',
    paylasBuyuk: 'እድገትዎን ያጋሩ',
  },

  hedefler: {
    ilk_adim: { ad: 'የመጀመሪያው ሳምንት', aciklama: 'ለ7 ቀናት ሳያቋርጡ ይስገዱ', cumle: 'የመጀመሪያው ሳምንት' },
    aliskanlik_ustasi: { ad: 'የልማድ ባለሙያ', aciklama: '21 ቀናት - ልማድ የሚገነባበት ጊዜ', cumle: 'የልማድ ባለሙያ' },
    kararlilik: { ad: 'ጽናት', aciklama: 'ሳያቋርጡ 60 ቀናት', cumle: 'ጽናት' },
    efsane: { ad: 'አፈ ታሪክ', aciklama: '90 ቀናት - ልዩ ትጋት', cumle: 'አፈ ታሪክ' },
  },

  /** Klasik derece adları, Arapçadan harf çevirisi (çeviri değil); yazım doğrulanmadı. */
  seviyeler: ['ሙብተዲእ', 'ጧሊብ', 'ሳሊክ', 'ሙሪድ', 'ዓሪፍ', 'ሓፊዝ', 'ካሚል'],

  rozetler: {
    ilk_adim: { ad: 'የመጀመሪያ እርምጃ', aciklama: 'የመጀመሪያ ሳምንትዎን አጠናቀዋል።', kosul: 'የ7 ቀን ተከታታይነት' },
    aliskanlik_ustasi: {
      ad: 'የልማድ ባለሙያ',
      aciklama: '21 ቀናት - ልማድ የሚገነባበት ጊዜ ተጠናቋል።',
      kosul: 'የ21 ቀን ተከታታይነት',
    },
    kararlilik: { ad: 'ጽኑ', aciklama: 'ለ60 ቀናት ሳያቋርጡ ሰግደዋል።', kosul: 'የ60 ቀን ተከታታይነት' },
    efsane: { ad: 'አፈ ታሪክ', aciklama: '90 ቀናት - ልዩ ትጋት አሳይተዋል።', kosul: 'የ90 ቀን ተከታታይነት' },
    toparlanma_ustasi: {
      ad: 'የማገገሚያ ባለሙያ',
      aciklama: 'የማገገሚያ ሁነታን 3 ጊዜ አጠናቀዋል።',
      kosul: '3 ማገገሚያዎች',
    },
    mukemmeliyetci: { ad: 'ፍጽምናን ፈላጊ', aciklama: 'ለ30 ቀናት 5/5 ሰግደዋል።', kosul: '5/5 ሶላቶች ያሉባቸው 30 ቀናት' },
    yuz_namaz: { ad: '100 ሶላቶች', aciklama: 'በአጠቃላይ 100 ሶላቶችን ሰግደዋል።', kosul: '100 ሶላቶችን ይስገዱ' },
    bin_namaz: { ad: '1000 ሶላቶች', aciklama: 'በአጠቃላይ 1000 ሶላቶችን ሰግደዋል።', kosul: '1000 ሶላቶችን ይስገዱ' },
  },

  rozetSeviyeleri: { bronz: 'ነሐስ', gumus: 'ብር', altin: 'ወርቅ', elmas: 'አልማዝ' },

  gunBitis: {
    erken: 'ቀደም ብለው ለሚተኙ',
    varsayilan: 'ነባሪ - በአብዛኛው ቦታ ከፈጅር በፊት',
    gec: 'ዘግይተው ለሚተኙ',
  },

  kutlama: {
    rozetEklendi: '🏅 ወደ ባጅ ስብስብዎ ተጨምሯል',
    paylasin: 'አጋራ',
    rozetBaslik: 'አላህ ዘላቂ ያድርገው',
    rozetMesaj: 'የ“{ad}” ባጅን አግኝተዋል።',
    hedefBaslik: cogul({ one: '{n} ቀን', other: '{n} ቀናት' }),
    hedefMesaj: 'የ“{ad}” ግብን አጠናቀዋል። አላህ ዘላቂ ያድርገው።',
    yeniRank: 'አዲስ ደረጃ፦ {rank}',
    seviyeBaslik: 'አዲሱ ደረጃዎ',
    seviyeMesaj: 'አሁን እንደ “{rank}” ይቀጥላሉ። አላህ ዘላቂ ያድርገው።',
    toparlanmaBaslik: 'ተከታታይነትዎ ተመልሷል',
    toparlanmaMesaj: cogul({
      one: 'የ{n} ቀን ተከታታይነትዎ ካቆመበት ይቀጥላል። አላህ ጽናትን ይስጠን።',
      other: 'የ{n} ቀናት ተከታታይነትዎ ካቆመበት ይቀጥላል። አላህ ጽናትን ይስጠን።',
    }),
    enUzunBaslik: 'ረጅሙ ተከታታይነትዎ',
    enUzunMesaj: cogul({
      one: '{n} ቀን፦ እስካሁን ረጅሙ ተከታታይነትዎ። አላህ ዘላቂ ያድርገው።',
      other: '{n} ቀናት፦ እስካሁን ረጅሙ ተከታታይነትዎ። አላህ ዘላቂ ያድርገው።',
    }),
  },

  sekme: {
    hataOkunamadi: 'ያለፉ መዝገቦችዎ አሁን ሊነበቡ አልቻሉም።',
    yenidenErisim: 'የተከታታይነት መረጃን እንደገና ለመጫን ሞክር',
    yenidenDeneyin: 'እንደገና ሞክር',
    yukleniyor: 'የተከታታይነት መረጃዎን በመጫን ላይ...',
    gunlukSeri: 'ቀን ተከታታይነት',
    rekor: 'ሪከርድ',
    sozErisim: '{metin} ምንጭ፦ {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'ቀጣዩ ግብ',
    tumu: 'ሁሉንም ባጆች አጠናቀዋል',
    kalan: cogul({ one: 'የ{ad} ባጅ፦ {n} ቀን ቀርቷል', other: 'የ{ad} ባጅ፦ {n} ቀናት ቀርተዋል' }),
    tumuErisim: 'ሁሉንም ባጆች አጠናቀዋል፦ ተስቢሑ ሞልቷል።',
    erisim: 'የ{ad} ባጅ፦ ከ{hedef} ቀናት {n} ተጠናቀዋል።',
  },

  gok: {
    gunHarfleri: ['ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ', 'እ'],
    erisim: '{ay}። {hedef}፣ {bes}፣ {donmus}። {seri}',
    hedefTutuldu: cogul({ one: '{n} ቀን ግቡን አሟልቷል', other: '{n} ቀናት ግቡን አሟልተዋል' }),
    besVakit: cogul({ one: 'አምስቱም ሶላቶች የተሰገዱበት {n} ቀን', other: 'አምስቱም ሶላቶች የተሰገዱባቸው {n} ቀናት' }),
    dondurulmus: cogul({ one: '{n} ቀን ታግዷል', other: '{n} ቀናት ታግደዋል' }),
    mevcutSeri: cogul({ one: 'የአሁኑ ተከታታይነት፦ {n} ቀን።', other: 'የአሁኑ ተከታታይነት፦ {n} ቀናት።' }),
  },

  hedefAyar: {
    azalt: 'ቀንስ',
    deger: 'እሴት',
    artir: 'ጨምር',
    esik: cogul({ one: '{n} ሶላት', other: '{n} ሶላቶች' }),
    sifirlaBaslik: 'ተከታታይነትን ዳግም አስጀምር',
    sifirlaMesaj: 'ሁሉም የተከታታይነት መረጃዎ (ተከታታይነት፣ ባጆች፣ ነጥቦች) ዳግም ይጀመራል። ይህ ሊቀለበስ አይችልም። መቀጠል ይፈልጋሉ?',
    sifirla: 'ዳግም አስጀምር',
    iptal: 'ሰርዝ',
    basarili: 'ተከናውኗል',
    sifirlandi: 'የተከታታይነት መረጃዎ ዳግም ተጀምሯል።',
    hedefAyarlari: 'የግብ ቅንብሮች',
    tamGunEsigi: 'የሙሉ ቀን ገደብ',
    tamGunAciklama: 'አንድ ቀን ለተከታታይነትዎ እንዲቆጠር በቀን የሚያስፈልገውን ዝቅተኛ የሶላት ብዛት ያዘጋጃል',
    sifirlama: 'ዳግም ማስጀመር',
    verileriSifirla: 'የተከታታይነት መረጃን ዳግም አስጀምር',
    verileriSifirlaAlt: 'ሁሉንም የተከታታይነት፣ የባጅ እና የነጥብ መረጃ ይሰርዛል',
  },

  rozetKarti: {
    erisim: 'የ{ad} ባጅ፣ {durum}',
    kazanildi: 'ተገኝቷል',
    kilitli: 'ተቆልፏል',
  },

  toparlanma: {
    kartBaslik: 'የማገገሚያ ሁነታ',
    kartAltBaslik: 'ተከታታይነትዎን መመለስ ይችላሉ',
    kartMesaj: 'የ{vurgu} ተከታታይነትዎን ካቆሙበት መቀጠል ይችላሉ።',
    oncekiGun: cogul({ one: '{n} ቀን', other: '{n} ቀናት' }),
    ilerleme: '{tamam}/{hedef} ቀናት ተጠናቀዋል',
    kalan: cogul({
      one: 'ለተጨማሪ {n} ቀን አምስቱንም ሶላቶች ያጠናቅቁ፤ ተከታታይነትዎ ካቆመበት ይቀጥላል።',
      other: 'ለተጨማሪ {n} ቀናት አምስቱንም ሶላቶች ያጠናቅቁ፤ ተከታታይነትዎ ካቆመበት ይቀጥላል።',
    }),
    bugun: 'ዛሬን ያጠናቅቁ፤ ተከታታይነትዎ ካቆመበት ይቀጥላል።',
    uyari: 'ቀናቱ ተከታታይ መሆን አለባቸው፤ በመሃል አንድ ቀን ከቀረ ማገገሚያው እንደገና ይጀምራል።',
    kapatErisim: 'የማገገሚያ ዝርዝሮችን ዝጋ',
    anladim: 'ገባኝ',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'እድገትዎን ያጋሩ',
    hazirDegilBaslik: 'ምስሉ ዝግጁ አይደለም',
    hazirDegilMesaj: 'ምስሉ ገና ዝግጁ አይደለም። ከጥቂት ሰከንዶች በኋላ እንደገና ይሞክሩ።',
    olusturulamadiBaslik: 'ምስሉን መፍጠር አልተቻለም',
    olusturulamadiMesaj: 'ምስሉን በመፍጠር ላይ ችግር ተፈጥሯል። እንደገና ይሞክሩ።',
    kullanilamiyorBaslik: 'ማጋራት አይገኝም',
    kullanilamiyorMesaj: 'በዚህ መሣሪያ ላይ ማጋራት አይገኝም።',
    kapat: 'ዝጋ',
    hikaye: 'ወደ ታሪክዎ አክል',
    platformlar: 'በInstagram፣ WhatsApp እና በሌሎችም ሊጋራ ይችላል።',
    tamam: 'እሺ',
    seriEnUzun: cogul({ one: 'ረጅሙ ተከታታይነቴ፦ {n} ቀን', other: 'ረጅሙ ተከታታይነቴ፦ {n} ቀናት' }),
    seriZincir: cogul({ one: 'ቀን ሰንሰለቱን ሳልበጥስ', other: 'ቀናት ሰንሰለቱን ሳልበጥስ' }),
    seriSoz: '“በየቀኑ ትንሽ እርምጃ፣ በነፍሴ ውስጥ ታላቅ ሰላም። 🔥”',
    rozetYeni: 'አዲስ ባጅ አገኘሁ',
    rozetSozleri: [
      'ዛሬ ለራሴ ጥሩ እርምጃ ወሰድኩ። 🌟',
      'በቁርጠኝነት እቀጥላለሁ፤ ይህ ባጅ የኔ ነው። 💪',
      'የጠዋቱን በረከት አገኘሁ። 🌅',
      'ነፍሴን የሚጠቅመው የዚህ ፍሰት አካል ነኝ። ✨',
      'ትናንሽ እርምጃዎች ታላቅ ሰላም ያመጣሉ። 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'አዲስ ባጅ አገኘሁ',
      hedef_tamamlandi: 'ግቤ ላይ ደረስኩ',
      seviye_atlandi: 'ደረጃዬ ከፍ አለ',
      toparlanma_tamamlandi: 'ወደ መስመሬ ተመለስኩ',
      en_uzun_seri: 'አዲስ ሪከርድ',
      varsayilan: 'ስኬት',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['ጌታዬ ዘላቂ ያድርገው። 🤲', 'ትናንሽ እርምጃዎች ታላቅ ሰላም ያመጣሉ። 🍃', 'አላህ ለሁላችንም ጽናትን ይስጠን። 🌱'],
      hedef_tamamlandi: ['ትናንሽ እርምጃዎች ታላቅ ሰላም ያመጣሉ። 🍃', 'አላህ ዘላቂ ያድርገው። 🤲', 'በየቀኑ አንድ ተጨማሪ እርምጃ። 🌱'],
      seviye_atlandi: [
        'በየቀኑ ትንሽ ወደፊት፤ አላህ ያግራው። 🍃',
        'አላህ ዘላቂ ያድርገው። 🤲',
        'ጉዞው ይቀጥላል። 🌱',
      ],
      toparlanma_tamamlandi: [
        'ዋናው ነገር አለመውደቅ ሳይሆን መነሳት ነው። 🔄',
        'አላህ ጽናትን ይስጠን። 🤲',
        'እያንዳንዱ መንገድ በትዕግሥት ይሄዳል። 🌱',
      ],
      en_uzun_seri: [
        'በየቀኑ ትንሽ እርምጃ፣ በልቤ ውስጥ ታላቅ ሰላም። 🍃',
        'አላህ ዘላቂ ያድርገው። 🤲',
        'ጌታዬ ለሁላችንም ጽናትን ይስጠን። 🌱',
      ],
    },
  },
};
