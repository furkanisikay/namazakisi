import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile adları Almanca konuşan Müslümanların kullandığı Arapça terimlerdir (özel ad). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Beginnt etwa 45 Minuten nach Sonnenaufgang und dauert bis 10 Minuten vor Dhuhr. Ishraq ist ihre früheste Zeit; am vorzüglichsten ist sie, nachdem das erste Viertel des Tages vergangen ist.',
    evvabin: 'Wird nach dem Maghrib-Gebet bis zur Isha-Zeit gebetet.',
    teheccud: 'Wird nach Isha gebetet, nachdem man geschlafen hat und aufgestanden ist, bis zur Fajr-Zeit. Die vorzüglichste Zeit ist das letzte Drittel der Nacht.',
  },
  bilgiBugun: '{aciklama}\n\nHeute: {bas} – {son}',
  enFaziletli: ' · am vorzüglichsten nach {saat}',
  sonUcteBir: ' · letztes Drittel ab {saat}',
  durumAktif: 'Zeit hat begonnen · endet {saat}',
  durumNafile: 'Freiwillig · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Duha-Zeit',
    kuslukSuruyor: 'Die Duha-Zeit läuft noch; Sie können bis {son} beten.',
    kuslukGirdi: 'Die Duha-Zeit hat begonnen. Ein guter Moment für zwei Rakat; sie dauert bis {son}.',
    kuslukBitiyor: cogul({
      one: 'Die Duha-Zeit endet in {n} Minute. Ein guter Moment für zwei Rakat; sie dauert bis {son}.',
      other: 'Die Duha-Zeit endet in {n} Minuten. Ein guter Moment für zwei Rakat; sie dauert bis {son}.',
    }),
    evvabinBaslik: 'Awwabin-Gebet',
    evvabinSuruyor: 'Für Awwabin ist noch Zeit. Isha beginnt um {son}.',
    evvabinGirdi: 'Nach Maghrib ein guter Moment für Awwabin. Isha beginnt um {son}.',
    evvabinKalan: cogul({ one: 'Noch {n} Minute für Awwabin. Isha beginnt um {son}.', other: 'Noch {n} Minuten für Awwabin. Isha beginnt um {son}.' }),
    teheccudBaslik: 'Tahajjud-Zeit',
    uyandirSonUcte: 'Stehen Sie auf; das letzte Drittel der Nacht hat begonnen. Fajr beginnt um {son}.',
    uyandirKalan: cogul({
      one: 'Stehen Sie auf; noch {n} Minute bis Fajr. Fajr beginnt um {son}.',
      other: 'Stehen Sie auf; noch {n} Minuten bis Fajr. Fajr beginnt um {son}.',
    }),
    sonUcteBaslik: 'Das letzte Drittel der Nacht',
    sonUcteGovde: 'Die gesegnetsten Stunden für Tahajjud. Fajr beginnt um {son}.',
    teheccudKalan: cogul({ one: 'Noch {n} Minute bis Fajr. Eine gute Zeit für Tahajjud.', other: 'Noch {n} Minuten bis Fajr. Eine gute Zeit für Tahajjud.' }),
  },
  uyandirmaKanali: 'Tahajjud-Wecker',
  uyandirmaKanaliAciklama: 'Weckt Sie für das Nachtgebet; klingelt auch im Lautlos-Modus',
};
