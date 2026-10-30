import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'ሐነፊ', safii: 'ሻፊዒ' },
  kaynaklar: {
    vatan: 'በጉዞ ረገድ መኖሪያ፣ ነዋሪነት እና ጊዜያዊ ቆይታ (በቱርክኛ)',
    cem: 'ሶላቶችን ማጣመር (ጀምዕ) ይቻላል? (በቱርክኛ)',
    baslangic: 'ጉዞ መቼ ይጀምራል? (በቱርክኛ)',
    ziyaret: 'የወላጆቹን ከተማ የሚጎበኝ ሰው መንገደኛ ነው? (በቱርክኛ)',
  },
  bilgiNotu:
    'ይህ መረጃ ነው እንጂ ብይን አይደለም። መንገደኛ መሆንዎ በጉዞዎ ዓላማ እና ርዝመት እንዲሁም በኒያዎ ላይ የተመሠረተ ነው።',
  baslik: 'እየተጓዙ ያሉ ይመስላል',
  mesafeSatiri: 'ከመኖሪያ ቦታዎ በቀጥታ መስመር {km} ኪ.ሜ ገደማ ርቀዋል። Diyanet ለ{mezhep} መዝሀብ የሚያስተላልፈው፦',
  maddeler: {
    hanefi: [
      'በሐነፊ መዝሀብ የጉዞ (ሰፈር) ርቀት 90 ኪ.ሜ ገደማ ነው። በመድረሻው ከ15 ቀን ያነሰ ለመቆየት ያሰበ ሰው መንገደኛ ይቆጠራል።',
      'መንገደኛ አራት ረከዓ ያላቸውን የግዴታ ሶላቶች ሁለት ረከዓ አድርጎ ይሰግዳል (ቀስር)።',
      'በሐነፊ መዝሀብ ሁለት ሶላቶችን ማጣመር (ጀምዕ) በሐጅ ጊዜ በዐረፋ እና በሙዝደሊፋ ብቻ ነው። Diyanet እንደ ጉዞ ባሉ ከባድ ምክንያቶች የሌሎች መዝሀቦችን አመለካከት መከተል እንደሚቻልም ይገልጻል።',
    ],
    safii: [
      'በሻፊዒ መዝሀብም የጉዞ ርቀት 90 ኪ.ሜ ገደማ ነው። የመድረሻ እና የመነሻ ቀናትን ሳይጨምር በመድረሻው ቆይታ ከ4 ቀን ያነሰ ከሆነ የጉዞ ብይኖች ይቀጥላሉ።',
      'መንገደኛ አራት ረከዓ ያላቸውን የግዴታ ሶላቶች ሁለት ረከዓ አድርጎ ይሰግዳል (ቀስር)።',
      'በሻፊዒ መዝሀብ ጉዞ ዙህርን ከአስር እና መግሪብን ከኢሻ ጋር ለማጣመር (ጀምዕ) ትክክለኛ ምክንያት ነው።',
    ],
  },
  ozetAcik: 'በርቷል · {mezhep}',
  ozetKapali: 'ጠፍቷል',
  baglantiAcilamadi: 'ማገናኛው ሊከፈት አልቻለም። የበይነመረብ ግንኙነትዎን ያረጋግጡ።',
  ikametGuncellendi: 'የመኖሪያ ቦታዎ ተዘምኗል',
  ikametKaydedilemedi: 'የመኖሪያ ቦታዎ ሊቀመጥ አልቻለም',
  kartiKapatin: 'የጉዞ ካርዱን ዝጋ',
  burasiEvimErisim: 'ይህ ቤቴ ነው፣ እንደ መኖሪያ ቦታዬ አስቀምጠው',
  burasiEvim: 'ይህ ቤቴ ነው',
  diyanetteOkuyunErisim: 'የDiyanet ፈትዋን በአሳሹ ውስጥ አንብብ',
  diyanetteOkuyun: 'በDiyanet ላይ አንብብ',
  sayfa: {
    kayitliKonum: 'የተቀመጠ አካባቢ',
    henuzKaydedilmedi: 'ገና አልተቀመጠም — የመጀመሪያው አካባቢዎ እንደ መኖሪያ ቦታዎ ይቆጠራል',
    buradasiniz: 'አሁን እዚህ ነዎት',
    uzaktasiniz: 'አሁን በቀጥታ መስመር {km} ኪ.ሜ ገደማ ርቀዋል',
    konumBilinmiyor: 'አካባቢዎ ገና አይታወቅም፤ መጀመሪያ አካባቢ ይምረጡ',
    giris:
      'ከመኖሪያ ቦታዎ {km} ኪ.ሜ ገደማ ሲርቁ የDiyanet ፈትዋዎችን የሚያጠቃልል አጭር የመረጃ ካርድ በመነሻ ገጹ ላይ ይታያል። ካርዱ በእያንዳንዱ ጉዞ አንድ ጊዜ ይታያል፤ ምንም ማሳወቂያ አይልክም።',
    bilgiKarti: 'የመረጃ ካርድ',
    kartBaslik: 'የጉዞ መረጃ ካርድ',
    gosterilir: 'በመነሻ ገጹ ላይ ይታያል',
    gosterilmez: 'አይታይም',
    mezhepNotu: 'ካርዱ መዝሀብዎን ይከተላል፤ በቅንብሮች › የሶላት ሰዓቶች ውስጥ መምረጥ ይችላሉ።',
    ikametYeri: 'የመኖሪያ ቦታ',
    ikametYapErisim: 'የአሁኑን አካባቢዎን እንደ መኖሪያ ቦታዎ ያስቀምጡ',
    ikametYap: 'የአሁኑን አካባቢዬን መኖሪያዬ አድርግ',
    kaynaklar: 'ምንጮች (የDiyanet ከፍተኛ የሃይማኖት ጉዳዮች ቦርድ)',
    kaynakErisim: '{etiket}። በአሳሹ ውስጥ ይከፈታል',
    /** Türkçe dışında gösterilmez (yalnız Türkiye hizmeti). */
    fetvaHatti: 'ለጥያቄዎች ወደ Diyanet 190 የፈትዋ መስመር መደወል ይችላሉ።',
  },
};
