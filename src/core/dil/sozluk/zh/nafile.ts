// ÇEVİRİ: zh — İngilizce iskelet, çevrilince bu satır silinir
import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Starts about 45 minutes after sunrise and lasts until 10 minutes before Dhuhr. Ishraq is its earliest time; the most virtuous is after the first quarter of the day has passed.',
    evvabin: 'Prayed after Maghrib, until Isha time.',
    teheccud: 'Prayed after sleeping and waking following Isha, until Fajr time. Its most virtuous time is the last third of the night.',
  },
  bilgiBugun: '{aciklama}\n\nToday: {bas} – {son}',
  enFaziletli: ' · most virtuous after {saat}',
  sonUcteBir: ' · last third {saat}',
  durumAktif: 'Time has begun · ends {saat}',
  durumNafile: 'Nafl · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha time',
    kuslukSuruyor: 'Duha time is on; you can pray until {son}.',
    kuslukGirdi: 'Duha time has begun. A good moment for two rakats; it lasts until {son}.',
    kuslukBitiyor: cogul({
      one: '{n} minute left in Duha time. A good moment for two rakats; it lasts until {son}.',
      other: '{n} minutes left in Duha time. A good moment for two rakats; it lasts until {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'There is still time for Awwabin. Isha begins at {son}.',
    evvabinGirdi: 'After Maghrib, a good moment for Awwabin. Isha begins at {son}.',
    evvabinKalan: cogul({ one: '{n} minute left for Awwabin. Isha begins at {son}.', other: '{n} minutes left for Awwabin. Isha begins at {son}.' }),
    teheccudBaslik: 'Tahajjud time',
    uyandirSonUcte: 'Get up; the last third of the night has begun. Fajr begins at {son}.',
    uyandirKalan: cogul({ one: 'Get up; {n} minute left until Fajr. Fajr begins at {son}.', other: 'Get up; {n} minutes left until Fajr. Fajr begins at {son}.' }),
    sonUcteBaslik: 'The last third of the night',
    sonUcteGovde: 'The most blessed hours for Tahajjud. Fajr begins at {son}.',
    teheccudKalan: cogul({ one: '{n} minute left until Fajr. A good time for Tahajjud.', other: '{n} minutes left until Fajr. A good time for Tahajjud.' }),
  },
  uyandirmaKanali: 'Tahajjud wake-up',
  uyandirmaKanaliAciklama: 'Wakes you for the night prayer; rings even in silent mode',
};
