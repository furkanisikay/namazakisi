import type { Sozluk } from '../tr';

/** Kıble ቂብላ (QE 2:144); Kâbe ካዕባ. Pusula harfleri: ሰ(ሜን) ም(ሥራቅ) ደ(ቡብ) ም(ዕራብ) çakışmasın diye ም/ምዕ. */
export const kible: Sozluk['kible'] = {
  baslik: 'ቂብላ',
  yon: {
    hizali: 'ወደ ቂብላ ዞረዋል',
    arkada: 'ቂብላ ከኋላዎ ነው፣ ይዙሩ',
    sagda: 'ቂብላ ከቀኝዎ {derece}° ነው',
    solda: 'ቂብላ ከግራዎ {derece}° ነው',
  },
  harf: { kuzey: 'ሰ', dogu: 'ም', guney: 'ደ', bati: 'ምዕ' },
  sekme: {
    pusula: 'ኮምፓስ',
    pusulaErisim: 'የኮምፓስ ሁነታ',
    pusulaAciklama: 'የካዕባ ምልክቱ ከላይ ያለው ኖች ላይ ሲደርስ ወደ ቂብላ ዞረዋል።',
    kamera: 'ካሜራ',
    kameraErisim: 'የካሜራ ሁነታ',
    kameraAciklama: 'ስልኩን ቀጥ አድርገው ይያዙ፤ የካዕባ ምልክቱ በቂብላ አቅጣጫ ይታያል።',
  },
  sayfa: {
    baslatiliyor: 'ኮምፓሱን በማስጀመር ላይ…',
    izinKapali: 'የአካባቢ ፈቃድ ጠፍቷል፤ አቅጣጫውን ለማግኘት አካባቢዎ ያስፈልጋል።',
  },
  hata: {
    izinGerekli: 'የቂብላን አቅጣጫ ለማግኘት የአካባቢ ፈቃድ ያስፈልጋል።',
    konumServisi: 'የአካባቢ አገልግሎቶች ሊገኙ አልቻሉም። የመሣሪያዎን የአካባቢ ቅንብሮች ያረጋግጡ።',
    baslatilamadi: 'የቂብላ አገልግሎት ሊጀምር አልቻለም።',
  },
  pusula: {
    ufuk: 'አድማስ',
    konumAliniyor: 'አካባቢዎን በማግኘት ላይ…',
    hazirlaniyor: 'ኮምፓሱን በማዘጋጀት ላይ…',
    kuzeydenAci: 'ቂብላ ከሰሜን {derece}° ነው',
    kabeUzakta: 'ካዕባ {mesafe} ይርቃል',
    kuzeydenSaatYonu: 'ከሰሜን በሰዓት አቅጣጫ',
    kuzeyden: 'ከሰሜን {derece}°',
    kabeUzaktaKuzeyden: 'ካዕባ {mesafe} ይርቃል፣ ከሰሜን {derece}°',
    pusulaErisim: 'የቂብላ ኮምፓስ። {cumle}',
    pusulaYok: 'ይህ መሣሪያ ኮምፓስ የለውም፤ አቅጣጫውን ከሰሜን አንጻር እያሳየን ነው።',
    kayiyorsa: 'አቅጣጫው ከተንሸራተተ ስልክዎን በአየር ላይ በ8 ቅርጽ ያንቀሳቅሱ።',
    kamerayla: 'በካሜራ ተመልከት',
  },
  kamera: {
    pusulayiKullanin: 'ኮምፓሱን ተጠቀም',
    kullanilamiyorBaslik: 'የካሜራ እይታ በዚህ ስልክ ላይ አይገኝም',
    kullanilamiyorMetin:
      'ስልክዎ ቀጥ ብሎ ሲያዝ ዳሳሾቹ አስተማማኝ አቅጣጫ አይሰጡም። ኮምፓሱ ግን አቅጣጫውን በትክክል ያሳያል።',
    izinBaslik: 'ቂብላን በካሜራዎ ይመልከቱ',
    izinMetin:
      'ስልክዎን ቀጥ አድርገው ይያዙና ዙሪያውን ይመልከቱ፤ የካዕባ ምልክቱ በቂብላ አቅጣጫ ይታያል። ይህ የካሜራ ፈቃድ ይፈልጋል፤ ምስሉ አይቀረጽም፣ ከስልክዎም አይወጣም።',
    kamerayiAcin: 'ካሜራውን አብራ',
    izinKapaliBaslik: 'የካሜራ ፈቃድ ጠፍቷል',
    izinKapaliMetin: 'ለካሜራ እይታ በቅንብሮች ውስጥ የካሜራ መዳረሻን መፍቀድ ይችላሉ። ኮምፓሱ ያለ እሱ ይሠራል።',
    ayarlariAcin: 'ቅንብሮችን ክፈት',
    acilamadiBaslik: 'ካሜራው ሊከፈት አልቻለም',
    acilamadiMetin: 'ካሜራው አሁን አይገኝም። ቂብላን በኮምፓሱ ማግኘት ይችላሉ።',
    hesaplaniyor: 'አቅጣጫውን በማግኘት ላይ…',
    dikTutun: 'ስልክዎን ቀጥ አድርገው ይያዙ',
  },
  kalibrasyon: {
    tesekkurErisim: 'እናመሰግናለን፣ አቅጣጫው አሁን ይበልጥ ትክክለኛ ነው',
    tesekkur: 'እናመሰግናለን፣ አቅጣጫው አሁን ይበልጥ ትክክለኛ ነው ✓',
    baslik: 'ኮምፓሱን አስተካክል',
    sallayin: 'ስልክዎን በአየር ላይ በ8 ቅርጽ ያንቀሳቅሱ።',
    metal: 'ከብረት ነገሮች እና ከማግኔት ሽፋኖች ይራቁ።',
    dogruluk: 'ትክክለኛነት',
    simdiDegil: 'አሁን አይደለም',
  },
};
