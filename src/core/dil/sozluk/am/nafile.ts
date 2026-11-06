import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile = የፈቃደኝነት ሶላት (HadeethEnc Amharca kategori adı). Duha/Awwabin/Tahajjud Arapça adların yazımı (ዱሓ, አዋቢን, ተሀጁድ) doğrulanmadı. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'ዱሓ', evvabin: 'አዋቢን', teheccud: 'ተሀጁድ' },
  kucuk: { kusluk: 'ዱሓ', evvabin: 'አዋቢን', teheccud: 'ተሀጁድ' },
  aciklamalar: {
    kusluk:
      'ፀሐይ ከወጣች ከ45 ደቂቃ ገደማ በኋላ ይጀምራል እና ከዙህር 10 ደቂቃ በፊት ያበቃል። ኢሽራቅ የመጀመሪያው ጊዜው ነው፤ በላጩ የቀኑ የመጀመሪያ ሩብ ካለፈ በኋላ ነው።',
    evvabin: 'ከመግሪብ በኋላ እስከ ኢሻ ሰዓት ድረስ ይሰገዳል።',
    teheccud: 'ከኢሻ በኋላ ተኝቶ ከተነሱ በኋላ እስከ ፈጅር ሰዓት ድረስ ይሰገዳል። በላጩ ጊዜው የሌሊቱ የመጨረሻ ሲሶ ነው።',
  },
  bilgiBugun: '{aciklama}\n\nዛሬ፦ {bas} – {son}',
  enFaziletli: ' · ከ{saat} በኋላ በላጭ',
  sonUcteBir: ' · የመጨረሻ ሲሶ {saat}',
  durumAktif: 'ሰዓቱ ገብቷል · በ{saat} ያበቃል',
  durumNafile: 'የፈቃደኝነት ሶላት · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'የዱሓ ሰዓት',
    kuslukSuruyor: 'የዱሓ ሰዓት አለ፤ እስከ {son} ድረስ መስገድ ትችላለህ።',
    kuslukGirdi: 'የዱሓ ሰዓት ገብቷል። ለሁለት ረከዓ ጥሩ ጊዜ ነው፤ እስከ {son} ይቆያል።',
    kuslukBitiyor: cogul({
      one: 'በዱሓ ሰዓት {n} ደቂቃ ቀርቷል። ለሁለት ረከዓ ጥሩ ጊዜ ነው፤ እስከ {son} ይቆያል።',
      other: 'በዱሓ ሰዓት {n} ደቂቃ ቀርቷል። ለሁለት ረከዓ ጥሩ ጊዜ ነው፤ እስከ {son} ይቆያል።',
    }),
    evvabinBaslik: 'አዋቢን',
    evvabinSuruyor: 'ለአዋቢን አሁንም ጊዜ አለ። ኢሻ በ{son} ይገባል።',
    evvabinGirdi: 'ከመግሪብ በኋላ ለአዋቢን ጥሩ ጊዜ ነው። ኢሻ በ{son} ይገባል።',
    evvabinKalan: cogul({ one: 'ለአዋቢን {n} ደቂቃ ቀርቷል። ኢሻ በ{son} ይገባል።', other: 'ለአዋቢን {n} ደቂቃ ቀርቷል። ኢሻ በ{son} ይገባል።' }),
    teheccudBaslik: 'የተሀጁድ ሰዓት',
    uyandirSonUcte: 'ተነሳ፤ የሌሊቱ የመጨረሻ ሲሶ ገብቷል። ፈጅር በ{son} ይገባል።',
    uyandirKalan: cogul({ one: 'ተነሳ፤ ፈጅር ለመግባት {n} ደቂቃ ቀርቷል። ፈጅር በ{son} ይገባል።', other: 'ተነሳ፤ ፈጅር ለመግባት {n} ደቂቃ ቀርቷል። ፈጅር በ{son} ይገባል።' }),
    sonUcteBaslik: 'የሌሊቱ የመጨረሻ ሲሶ',
    sonUcteGovde: 'ለተሀጁድ በጣም የተባረኩ ሰዓቶች። ፈጅር በ{son} ይገባል።',
    teheccudKalan: cogul({ one: 'ፈጅር ለመግባት {n} ደቂቃ ቀርቷል። ለተሀጁድ ጥሩ ጊዜ ነው።', other: 'ፈጅር ለመግባት {n} ደቂቃ ቀርቷል። ለተሀጁድ ጥሩ ጊዜ ነው።' }),
  },
  uyandirmaKanali: 'የተሀጁድ መቀስቀሻ',
  uyandirmaKanaliAciklama: 'ለሌሊት ሶላት ይቀሰቅስዎታል፤ በጸጥታ ሁነታ ላይም ይደውላል',
};
