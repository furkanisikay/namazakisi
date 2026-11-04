import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile "kusang-loob na dasal" (QE 76:26); Duha HE "ḍuḥā" → sade, Tahajjud HE/QE, rekât HE "rak`ah" → "rak'ah". */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Nagsisimula mga 45 minuto pagkatapos ng pagsikat ng araw at tumatagal hanggang 10 minuto bago ang Dhuhr. Ang Ishraq ang pinakamaagang oras nito; ang pinakamainam ay pagkalipas ng unang kapat ng araw.',
    evvabin: 'Idinadasal pagkatapos ng Maghrib, hanggang sa oras ng Isha.',
    teheccud: 'Idinadasal pagkatapos matulog at gumising matapos ang Isha, hanggang sa oras ng Fajr. Ang pinakamainam na oras nito ay ang huling ikatlong bahagi ng gabi.',
  },
  bilgiBugun: '{aciklama}\n\nNgayon: {bas} – {son}',
  enFaziletli: ' · pinakamainam pagkalipas ng {saat}',
  sonUcteBir: ' · huling ikatlo {saat}',
  durumAktif: 'Pumasok na ang oras · matatapos {saat}',
  durumNafile: 'Kusang-loob · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Oras ng Duha',
    kuslukSuruyor: 'Oras pa ng Duha; makapagdadasal kayo hanggang {son}.',
    kuslukGirdi: "Pumasok na ang oras ng Duha. Magandang sandali para sa dalawang rak'ah; tatagal ito hanggang {son}.",
    kuslukBitiyor: cogul({
      one: "{n} minuto na lang sa oras ng Duha. Magandang sandali para sa dalawang rak'ah; tatagal ito hanggang {son}.",
      other: "{n} minuto na lang sa oras ng Duha. Magandang sandali para sa dalawang rak'ah; tatagal ito hanggang {son}.",
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'May oras pa para sa Awwabin. Magsisimula ang Isha sa {son}.',
    evvabinGirdi: 'Pagkatapos ng Maghrib, magandang sandali para sa Awwabin. Magsisimula ang Isha sa {son}.',
    evvabinKalan: cogul({ one: '{n} minuto na lang para sa Awwabin. Magsisimula ang Isha sa {son}.', other: '{n} minuto na lang para sa Awwabin. Magsisimula ang Isha sa {son}.' }),
    teheccudBaslik: 'Oras ng Tahajjud',
    uyandirSonUcte: 'Bumangon na; nagsimula na ang huling ikatlong bahagi ng gabi. Magsisimula ang Fajr sa {son}.',
    uyandirKalan: cogul({ one: 'Bumangon na; {n} minuto pa bago ang Fajr. Magsisimula ang Fajr sa {son}.', other: 'Bumangon na; {n} minuto pa bago ang Fajr. Magsisimula ang Fajr sa {son}.' }),
    sonUcteBaslik: 'Ang huling ikatlong bahagi ng gabi',
    sonUcteGovde: 'Ang pinakapinagpalang oras para sa Tahajjud. Magsisimula ang Fajr sa {son}.',
    teheccudKalan: cogul({ one: '{n} minuto pa bago ang Fajr. Magandang oras para sa Tahajjud.', other: '{n} minuto pa bago ang Fajr. Magandang oras para sa Tahajjud.' }),
  },
  uyandirmaKanali: 'Paggising para sa Tahajjud',
  uyandirmaKanaliAciklama: 'Ginigising kayo para sa dasal sa gabi; tumutunog kahit naka-silent',
};
