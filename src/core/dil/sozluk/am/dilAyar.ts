import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'ቋንቋ · Language',
  aciklama: 'የመተግበሪያውን ቋንቋ ይምረጡ። ማሳወቂያዎች እና ጮክ ብሎ ማንበብም ይጠቀሙበታል።',
  grup: 'የመተግበሪያ ቋንቋ',
  dilAdlari: { tr: 'ቱርክኛ', en: 'እንግሊዝኛ', id: 'ኢንዶኔዥያኛ', de: 'ጀርመንኛ', fr: 'ፈረንሳይኛ', bs: 'ቦስኒያንኛ', ru: 'ራሽያኛ', ms: 'ማላይ', ar: 'ዓረብኛ', ur: 'ኡርዱኛ', es: 'ስፓኒሽ', nl: 'ደች', sq: 'አልባንያንኛ', hi: 'ሕንድኛ', bn: 'ቤንጋሊኛ', fa: 'ፐርሺያኛ', ps: 'ፓሽቶ', ckb: 'የሶራኒ ኩርድኛ', ug: 'ኡይግሁር', az: 'አዘርባጃንኛ', uz: 'ኡዝቤክኛ', kk: 'ካዛክኛ', ky: 'ክይርግይዝ', tg: 'ታጂክ', sw: 'ስዋሂሊኛ', ha: 'ሃውሳኛ', am: 'አማርኛ', om: 'ኦሮሚኛ', so: 'ሱማልኛ', ff: 'ፉላኒኛ', yo: 'ዮሩባዊኛ', zh: 'ቀለል ያለ ቻይንኛ', ta: 'ታሚል', ml: 'ማላያላም', th: 'ታይ', ko: 'ኮሪያኛ', vi: 'ቪየትናምኛ' },
  cihazDili: 'የመሣሪያ ቋንቋ',
  cihazDiliKullaniliyor: 'አሁን {ad}',
  cihazDiliDesteklenmiyor: 'የመሣሪያዎ ቋንቋ ገና አይገኝም፤ ቱርክኛ ጥቅም ላይ ይውላል።',
  beta: 'ቤታ',
  betaAciklama: '{ad} · ቤታ',
  notlar: {
    beta: 'የቤታ ትርጉሞች በመገምገም ላይ ናቸው፤ አንዳንድ ጽሑፎች ፍጹም ላይሆኑ ይችላሉ።',
    vakit: 'ቋንቋው የሶላት ሰዓቶችን አቆጣጠር አይቀይርም።',
    nass: 'ከቱርክኛ ውጪ ባሉ ቋንቋዎች የቁርኣን ትርጉሞች ብቻ ይታያሉ፤ የሐዲስ ጽሑፎች ከቱርክኛ ምንጭ ስለሆኑ አይታዩም።',
  },
  ozelAnons: {
    baslik: 'የጻፏቸው ጮክ ተነባቢ ጽሑፎች',
    govde: cogul({
      one: 'የጻፉት {n} ጮክ ተነባቢ ጽሑፍ አሁንም በቀድሞው ቋንቋ ነው። በአዲሱ ቋንቋ ባለው ዝግጁ ጽሑፍ ይተካ?',
      other: 'የጻፏቸው {n} ጮክ ተነባቢ ጽሑፎች አሁንም በቀድሞው ቋንቋ ናቸው። በአዲሱ ቋንቋ ባሉ ዝግጁ ጽሑፎች ይተኩ?',
    }),
    degistir: 'በዝግጁ ጽሑፍ ተካ',
    koru: 'እንዳለ አቆይ',
    degisti: cogul({ one: '{n} ጽሑፍ ተተክቷል።', other: '{n} ጽሑፎች ተተክተዋል።' }),
  },
  vakitAdlari: {
    baslik: 'የሶላት ስሞች',
    aciklama: 'የሶላት ሰዓቶች እንዴት እንደሚጠሩ ይምረጡ።',
    otomatik: 'በአገር',
    otomatikAciklama: 'በአካባቢዎ አገር የተለመዱት ስሞች ይጠቀማሉ።',
    takimlar: { temel: 'የዓረብኛ ስሞች', diyanetDe: 'Diyanet (ጀርመንኛ)', turkce: 'የቱርክኛ ስሞች', magrip: 'የማግሬብ አጻጻፍ', cezayir: 'የአልጄሪያ አጻጻፍ', afgan: 'የአፍጋን ስሞች' },
  },
  yazi: {
    baslik: 'ፊደል',
    aciklama: 'ጽሑፍ በየትኛው ፊደል እንደሚጻፍ ይምረጡ።',
    otomatik: 'በአገር',
    otomatikAciklama: 'በአካባቢዎ አገር የተለመደው ፊደል ይጠቀማል።',
    latin: 'የላቲን ፊደል',
    kiril: 'የሲሪሊክ ፊደል',
  },
  kaydedilemedi: 'ቋንቋው ሊቀመጥ አልቻለም። እንደገና ይሞክሩ።',
  sihirbazBaglantisi: 'ቋንቋ · Language',
  sihirbazBaglantisiAciklama: 'የመተግበሪያውን ቋንቋ ቀይር',
};
