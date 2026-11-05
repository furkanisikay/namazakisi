import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile karşılığı "dugang nga Salah" (QE 17:79 "dugang" = ek); ad olarak DOĞRULANMADI. */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Magsugod mga 45 ka minuto human sa pagsubang sa adlaw ug molungtad hangtod 10 ka minuto una sa Dhuhr. Ang Ishraq mao ang pinakasayo niining oras; ang labing maayo human molabay ang unang ikaupat sa adlaw.',
    evvabin: 'Himoon human sa Maghrib, hangtod sa oras sa Isha.',
    teheccud: 'Himoon human sa pagkatulog ug pagmata human sa Isha, hangtod sa oras sa Fajr. Ang labing maayong oras niini mao ang katapusang ikatulo sa gabii.',
  },
  bilgiBugun: '{aciklama}\n\nKaron: {bas} – {son}',
  enFaziletli: ' · labing maayo human sa {saat}',
  sonUcteBir: ' · katapusang ikatulo {saat}',
  durumAktif: 'Misulod na ang oras · matapos {saat}',
  durumNafile: 'Dugang nga Salah · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Oras sa Duha',
    kuslukSuruyor: 'Nagpadayon ang oras sa Duha; makaampo kamo hangtod {son}.',
    kuslukGirdi: "Misulod na ang oras sa Duha. Maayong higayon alang sa duha ka rak'ah; molungtad kini hangtod {son}.",
    kuslukBitiyor: cogul({
      one: "{n} ka minuto na lang ang nahabilin sa oras sa Duha. Maayong higayon alang sa duha ka rak'ah; molungtad kini hangtod {son}.",
      other: "{n} ka minuto na lang ang nahabilin sa oras sa Duha. Maayong higayon alang sa duha ka rak'ah; molungtad kini hangtod {son}.",
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Aduna pay oras alang sa Awwabin. Magsugod ang Isha sa {son}.',
    evvabinGirdi: 'Human sa Maghrib, maayong higayon alang sa Awwabin. Magsugod ang Isha sa {son}.',
    evvabinKalan: cogul({
      one: '{n} ka minuto na lang alang sa Awwabin. Magsugod ang Isha sa {son}.',
      other: '{n} ka minuto na lang alang sa Awwabin. Magsugod ang Isha sa {son}.',
    }),
    teheccudBaslik: 'Oras sa Tahajjud',
    uyandirSonUcte: 'Bangon na; nagsugod na ang katapusang ikatulo sa gabii. Magsugod ang Fajr sa {son}.',
    uyandirKalan: cogul({
      one: 'Bangon na; {n} ka minuto na lang hangtod sa Fajr. Magsugod ang Fajr sa {son}.',
      other: 'Bangon na; {n} ka minuto na lang hangtod sa Fajr. Magsugod ang Fajr sa {son}.',
    }),
    sonUcteBaslik: 'Ang katapusang ikatulo sa gabii',
    sonUcteGovde: 'Ang labing bulahan nga mga oras alang sa Tahajjud. Magsugod ang Fajr sa {son}.',
    teheccudKalan: cogul({
      one: '{n} ka minuto na lang hangtod sa Fajr. Maayong oras alang sa Tahajjud.',
      other: '{n} ka minuto na lang hangtod sa Fajr. Maayong oras alang sa Tahajjud.',
    }),
  },
  uyandirmaKanali: 'Pagmata alang sa Tahajjud',
  uyandirmaKanaliAciklama: 'Pukawon kamo alang sa Salah sa gabii; motingog bisan naka-silent',
};
