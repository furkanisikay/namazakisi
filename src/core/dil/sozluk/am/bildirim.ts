import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Çağrı (cuma, camiye git, takvim, yatsı) tekil emir; yönetim metni (yatış özeti, gün sonu) kibar እርስዎ. */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ ሰገድኩ', kazayaEkle: 'ወደ ቀዷእ ጨምር', inceleyin: 'ገምግም' },
  kanal: {
    genel: 'አጠቃላይ ማሳወቂያዎች',
    muhafiz: 'የሶላት ጠባቂ',
    muhafizAciklama: 'የሶላት ሰዓት አስታዋሾች',
    acil: 'አስቸኳይ የሶላት አስታዋሽ',
    acilAciklama: 'የሶላት ሰዓት ሊያልቅ ነው - አስቸኳይ አስታዋሾች',
    vakit: 'የሶላት ሰዓቶች',
    vakitAciklama: 'የሶላት ሰዓት ሲገባ የሚላኩ አስታዋሾች',
    muhafizSes: 'የሶላት ጠባቂ · {ses}',
    acilSes: 'አስቸኳይ አስታዋሽ · {ses}',
    acilSesAciklama: 'የሶላት ሰዓት ሊያልቅ ነው — አስቸኳይ አስታዋሾች',
    titresimli: '{kanal} · በንዝረት',
    alarm: 'የሶላት ማንቂያ',
    alarmSes: 'የሶላት ማንቂያ · {ses}',
    uygulamaSesi: 'የመተግበሪያ ድምፅ',
    seciliSes: 'የመረጡት ድምፅ',
  },
  cuma: {
    baslik: 'ጁሙዓ · {sure} ቀርቷል · ሶላቱ ቀርቧል',
    govdeIlk: 'ዙህር ለመግባት {sure} ቀርቷል። ተዘጋጅና ወደ መስጂድ ሂድ።',
    govde: 'ዙህር ለመግባት {sure} ቀርቷል። ወደ መስጂድ ሂድ።',
  },
  camiye: {
    hazirlanBaslik: '{ad} · ለአዛን {dk} ደቂ · ለመስጂድ ተዘጋጅ',
    hazirlanGovde: '{ad}ን በመስጂድ ለማግኘት ተዘጋጅ፤ በ{sonra} ደቂቃ ውስጥ ውጣ — አዛን በ{dk} ደቂቃ ውስጥ።',
    yolaCikBaslik: '{ad} · ለአዛን {dk} ደቂ · ወደ መስጂድ ሂድ',
    yolaCikGovde: '{ad}ን ለማግኘት ወደ መስጂድ ሂድ — አዛን በ{dk} ደቂቃ ውስጥ።',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'በቀን መቁጠሪያዎ ውስጥ {n} ክስተት', other: 'በቀን መቁጠሪያዎ ውስጥ {n} ተከታታይ ክስተቶች' }),
    etkinlikBir: 'በቀን መቁጠሪያዎ ውስጥ ያለ ክስተት',
    sonAnIkindi: 'ለአስር የመጨረሻው ተስማሚ ጊዜ {saat} ነው (ከዚያ በኋላ ሶላት ክልክል የሆነበት ወቅት ነው)',
    sonAnVakit: 'የ{kucuk} ሰዓት በ{saat} ያበቃል',
    onceBaslik: '{ad} · ክስተት በ{saat} · መጀመሪያ ስገድ',
    onceGovde: '{etkinlik} {aralik} ይቆያል፤ {sonAn}። ክስተቱ ከመጀመሩ በፊት {kucuk}ን ስገድ።',
    kaplarBaslik: '{ad} · ክስተት የሶላቱን ሰዓት ይሸፍናል',
    kaplarGovde:
      '{etkinlik} {aralik} ይቆያል እና የ{kucuk} ሰዓትን ({giris}–{son}) ይሸፍናል። አጭር እረፍት ወስደህ {kucuk}ን ለመስገድ አሁኑኑ አቅድ።',
  },
  yatis: {
    yatsiBaslik: '{ad} · ከመተኛትህ በፊት ስገድ 🌙',
    yatsiGovde: 'የ{ad} ሰዓት አሁንም አለ፤ ከመተኛትህ በፊት ለሶላት ቁም።',
    ozet: 'ዛሬ {kilinan}/5 · {liste} ምልክት አልተደረገባቸውም',
    tekOto: 'ከሰገዱት ምልክት ያድርጉበት። {oto}',
    tekKaza: 'ከሰገዱት ምልክት ያድርጉበት፤ ካልቻሉ ወደ ቀዷእ መዝገብዎ ያክሉት።',
    tekSuruyor: 'ከሰገዱት ምልክት ያድርጉበት። የሶላቱ ሰዓት አሁንም አለ።',
    cokluOto: 'የሰገዷቸውን ሶላቶች ለመገምገምና ምልክት ለማድረግ መተግበሪያውን ይክፈቱ። {oto}',
    coklu: 'የሰገዷቸውን ሶላቶች ለመገምገምና ምልክት ለማድረግ መተግበሪያውን ይክፈቱ።',
    otoSor: 'ምልክት ካላደረጉባቸው ስለዚህ ቀን በቀዷእ መዝገብ ውስጥ ይጠየቃሉ።',
    otoEkle: 'ምልክት ካላደረጉባቸው የሶላት ቀኑ ሲያልቅ ወደ ቀዷእ ይጨመራሉ።',
  },
  gunSonu: {
    baslik: 'ዛሬ አልተጠናቀቀም · ተከታታይነት',
    govde: 'ቀኑ ከማለቁ በፊት የሰገዷቸውን ሶላቶች ምልክት ካደረጉ ተከታታይነትዎ ይቀጥላል።',
  },
};
