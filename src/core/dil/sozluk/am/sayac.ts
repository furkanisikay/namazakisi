import type { Sozluk } from '../tr';

export const sayac: Sozluk['sayac'] = {
  vakit: {
    kanal: 'የሶላት ቆጠራ',
    kanalAciklama: 'የሶላት ሰዓት ከማለቁ በፊት የቆጠራ ማሳወቂያ',
    baslik: '⏱️ የ{ad} ሶላት',
    govde: 'የ{ad} ሰዓት ሊያልቅ ነው።',
  },
  canli: {
    vakitGovde: '{ad} እስኪያልቅ የቀረው ጊዜ',
    cumaBaslik: '🕌 የጁሙዓ ሶላት',
    cumaGovde: 'ዙህር (ኹጥባ) እስኪደርስ የቀረው ጊዜ',
    nafileGovde: '{ad} እስኪያልቅ የቀረው ጊዜ',
  },
  iftar: {
    kanal: 'የኢፍጣር ቆጠራ',
    kanalAciklama: 'እስከ ኢፍጣር ሰዓት የቆጠራ ማሳወቂያ',
    baslik: '🌙 የኢፍጣር ቆጠራ',
    govde: 'አዛኑን ሳይሰሙ ጾምዎን አይፍቱ።',
    girdiBaslik: '🌙 የኢፍጣር ሰዓት ደርሷል',
    girdiGovde: 'የተባረከ ኢፍጣር ይሁንልዎ።',
    girdiUzun: 'የተባረከ ኢፍጣር ይሁንልዎ።\n\n⚠️ አዛኑን ሳይሰሙ ጾምዎን አይፍቱ። በዱዓዎ ያስታውሱን :)',
  },
  sahur: {
    kanal: 'የሱሑር ቆጠራ',
    kanalAciklama: 'እስከ ሱሑር መጨረሻ (ፈጅር) የቆጠራ ማሳወቂያ',
    baslik: '🌙 የሱሑር ቆጠራ',
    govde: 'አሁንም መብላትና መጠጣት ይችላሉ፤ ጾሙ በቅርቡ ይጀምራል።',
    girdiBaslik: '🌙 የሱሑር ሰዓት አልቋል',
    girdiGovde: 'ኒያ የሚያደርጉበት ሰዓት ነው።',
    girdiUzun: 'የፈጅር ሰዓት ገብቷል፤ ኒያ ማድረግዎን አይርሱ።\n\n⚠️ አሁን ፈጅርን መስገድ ይችላሉ። በዱዓዎ ያስታውሱን :)',
  },
  seri: {
    kanal: 'የተከታታይነት ቆጠራ',
    kanalAciklama: 'የተከታታይነት ቀኑ እስኪያልቅ ቆጠራ',
    baslik: '🔥 ተከታታይነትዎ አደጋ ላይ ነው',
    govde: 'የዛሬ ሶላቶች አልተጠናቀቁም፤ ተከታታይነትዎን አያጡ።',
    girdiBaslik: '🔥 የተከታታይነት ቀኑ አልቋል',
    girdiGovde: 'አዲስ ቀን ጀምሯል።',
  },
};
