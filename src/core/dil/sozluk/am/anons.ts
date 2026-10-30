import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** İbadete çağrı kaydı: tekil emir (ስገድ, ለሶላት ቁም); secde yok. Sıra Türkçe şablonlarla BİREBİR eşleşir. */
export const anons: Sozluk['anons'] = {
  yon: { cikisaDogru: 'ቀርቷል', girisindenItibaren: 'አልፏል' },
  cip: { vakit: 'የሶላት ስም', sure: 'ደቂቃዎች', yon: 'ቀርቷል / አልፏል', cuma: 'ጁሙዓ', yatsi: 'ኢሻ' },
  sablon: {
    muhafizCikis: [
      'የ{vakit} ሰዓት እያለቀ ነው፣ {süre} ደቂቃ ቀርቷል።',
      '{vakit} እንዳያመልጥህ፣ {süre} ደቂቃ ቀርቷል።',
      'ጊዜው እያጠረ ነው፣ {vakit} እስኪያልቅ {süre} ደቂቃ ቀርቷል።',
    ],
    muhafizGiris: [
      'የ{vakit} ሰዓት ገብቷል፣ {süre} ደቂቃ አልፏል።',
      '{vakit}ን አታዘግይ፣ {süre} ደቂቃ አልፏል።',
      'ጊዜው እየሄደ ነው፣ ለ{vakit} ቁም፣ {süre} ደቂቃ ሆኗል።',
    ],
    nafile: [
      'የ{vakit} ሰዓት፣ {süre} ደቂቃ {yön}። ለሁለት ረከዓ ጥሩ ጊዜ ነው።',
      'የ{vakit} ሰዓት አለ። ሁለት ረከዓ ለመስገድ ጥሩ እድል ነው።',
      'ለ{vakit} {süre} ደቂቃ {yön}።',
    ],
    cuma: [
      'ጁሙዓ ለመድረስ {süre} ደቂቃ ቀርቷል። ተዘጋጅና ወደ መስጂድ ሂድ።',
      'ጁሙዓ እየቀረበ ነው፣ {süre} ደቂቃ ቀርቷል።',
      'ኹጥባውን አግኝ፣ ጁሙዓ ለመድረስ {süre} ደቂቃ ቀርቷል።',
    ],
    camiyeGit: [
      '{vakit} ለመግባት {süre} ደቂቃ ቀርቷል። ወደ መስጂድ ሂድ።',
      'ወደ መስጂድ የምትሄድበት ሰዓት ነው፣ {vakit} ለመግባት {süre} ደቂቃ ቀርቷል።',
      'ለ{vakit} ወደ መስጂድ ሂድ።',
    ],
    yatis: ['ከመተኛትህ በፊት ኢሻን ስገድ።', 'የኢሻ ሰዓት አሁንም አለ፣ ከመተኛትህ በፊት ለሶላት ቁም።', 'ኢሻን ሳትሰግድ አትተኛ።'],
    takvim: [
      'በቀን መቁጠሪያህ ውስጥ ያለ ክስተት በ{vakit} ሰዓት ላይ ይውላል።',
      'የ{vakit} ሰዓት ከክስተት ጋር ይጋጫል፤ መጀመሪያ መስገድን አትርሳ።',
      'በ{süre} ደቂቃ ውስጥ የ{vakit} ሰዓት ከክስተትህ ጋር ይጋጫል፤ ሶላትህን አትርሳ።',
    ],
  },
  otomatik: {
    cuma: 'ለጁሙዓ ዙህር ለመግባት {sure} ቀርቷል። ተዘጋጅና ወደ መስጂድ ሂድ።',
    camiyeGiris: '{vakit} ለመግባት {sure} ቀርቷል።',
    camiyeHazirlan: 'ተዘጋጅና ወደ መስጂድ ሂድ።',
    camiyeYola: 'ወደ መስጂድ ሂድ።',
    takvimGiris: 'በቀን መቁጠሪያህ ውስጥ ያለ ክስተት በ{vakit} ሰዓት ላይ ይውላል።',
    takvimOnce: 'ከክስተቱ በፊት መስገድን አትርሳ።',
    takvimKaplar: 'እረፍት ወስደህ መስገድን አትርሳ።',
    yatsi: 'ከመተኛትህ በፊት ኢሻን ስገድ።',
    muhasebeTek: 'ዛሬ {vakit} ምልክት ያልተደረገበት ይመስላል።',
    muhasebeCoklu: cogul({ one: 'ዛሬ {n} ሶላት ምልክት ያልተደረገበት ይመስላል።', other: 'ዛሬ {n} ሶላቶች ምልክት ያልተደረገባቸው ይመስላሉ።' }),
    geceCapasi: 'የጸጥታ ሰዓቶች በ{süre} ደቂቃ ውስጥ ይጀምራሉ። ከመተኛትህ በፊት {vakit}ን ስገድ።',
    kuslukSuruyor: 'የዱሓ ሰዓት አለ።',
    kuslukGirdi: 'የዱሓ ሰዓት ገብቷል። ለሁለት ረከዓ ጥሩ ጊዜ ነው።',
    kuslukBitiyor: cogul({ one: 'በዱሓ ሰዓት {n} ደቂቃ ቀርቷል።', other: 'በዱሓ ሰዓት {n} ደቂቃ ቀርቷል።' }),
    evvabinSuruyor: 'ለአዋቢን አሁንም ጊዜ አለ።',
    evvabinGirdi: 'የአዋቢን ሰዓት። ለሁለት ረከዓ ጥሩ ጊዜ ነው።',
    evvabinKalan: cogul({ one: 'ለአዋቢን {n} ደቂቃ ቀርቷል።', other: 'ለአዋቢን {n} ደቂቃ ቀርቷል።' }),
    teheccudSonUcte: 'የተሀጁድ ሰዓት። የሌሊቱ የመጨረሻ ሲሶ ገብቷል።',
    teheccudKalan: cogul({ one: 'የተሀጁድ ሰዓት። ፈጅር ለመግባት {n} ደቂቃ ቀርቷል።', other: 'የተሀጁድ ሰዓት። ፈጅር ለመግባት {n} ደቂቃ ቀርቷል።' }),
  },
};
