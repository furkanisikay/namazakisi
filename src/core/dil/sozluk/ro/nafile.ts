import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Nafile = rugăciune voluntară (HadeethEnc ro); adlar Duha / Awwabin / Tahajjud (Vikipedi ro "Tahajjud"). */
export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Începe la aproximativ 45 de minute după răsăritul soarelui și durează până cu 10 minute înainte de Dhuhr. Ishraq este cel mai devreme moment al ei; cel mai meritoriu este după ce a trecut primul sfert al zilei.',
    evvabin: 'Se efectuează după Maghrib, până la timpul de Ișa.',
    teheccud: 'Se efectuează după ce ați dormit și v-ați trezit după Ișa, până la timpul de Fajr. Cel mai meritoriu timp este ultima treime a nopții.',
  },
  bilgiBugun: '{aciklama}\n\nAzi: {bas} – {son}',
  enFaziletli: ' · cel mai meritoriu după {saat}',
  sonUcteBir: ' · ultima treime {saat}',
  durumAktif: 'A început timpul · se termină la {saat}',
  durumNafile: 'Voluntară · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Timpul de Duha',
    kuslukSuruyor: 'Timpul de Duha continuă; vă puteți ruga până la {son}.',
    kuslukGirdi: 'A început timpul de Duha. Un moment bun pentru două rak’ah; durează până la {son}.',
    kuslukBitiyor: cogul({
      one: 'Mai este {n} minut din timpul de Duha. Un moment bun pentru două rak’ah; durează până la {son}.',
      few: 'Mai sunt {n} minute din timpul de Duha. Un moment bun pentru două rak’ah; durează până la {son}.',
      other: 'Mai sunt {n} de minute din timpul de Duha. Un moment bun pentru două rak’ah; durează până la {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Mai este timp pentru Awwabin. Ișa începe la {son}.',
    evvabinGirdi: 'După Maghrib, un moment bun pentru Awwabin. Ișa începe la {son}.',
    evvabinKalan: cogul({
      one: 'Mai este {n} minut pentru Awwabin. Ișa începe la {son}.',
      few: 'Mai sunt {n} minute pentru Awwabin. Ișa începe la {son}.',
      other: 'Mai sunt {n} de minute pentru Awwabin. Ișa începe la {son}.',
    }),
    teheccudBaslik: 'Timpul de Tahajjud',
    uyandirSonUcte: 'Ridicați-vă; a început ultima treime a nopții. Fajr începe la {son}.',
    uyandirKalan: cogul({
      one: 'Ridicați-vă; mai este {n} minut până la Fajr. Fajr începe la {son}.',
      few: 'Ridicați-vă; mai sunt {n} minute până la Fajr. Fajr începe la {son}.',
      other: 'Ridicați-vă; mai sunt {n} de minute până la Fajr. Fajr începe la {son}.',
    }),
    sonUcteBaslik: 'Ultima treime a nopții',
    sonUcteGovde: 'Cele mai binecuvântate ore pentru Tahajjud. Fajr începe la {son}.',
    teheccudKalan: cogul({
      one: 'Mai este {n} minut până la Fajr. Un moment bun pentru Tahajjud.',
      few: 'Mai sunt {n} minute până la Fajr. Un moment bun pentru Tahajjud.',
      other: 'Mai sunt {n} de minute până la Fajr. Un moment bun pentru Tahajjud.',
    }),
  },
  uyandirmaKanali: 'Trezire pentru Tahajjud',
  uyandirmaKanaliAciklama: 'Vă trezește pentru rugăciunea de noapte; sună chiar și în modul silențios',
};
