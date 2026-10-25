import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const nafile: Sozluk['nafile'] = {
  adlar: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  kucuk: { kusluk: 'Duha', evvabin: 'Awwabin', teheccud: 'Tahajjud' },
  aciklamalar: {
    kusluk:
      'Commence environ 45 minutes après le lever du soleil et dure jusqu’à 10 minutes avant Dhuhr. Ishraq en est le tout début ; le moment le plus méritoire vient après le premier quart de la journée.',
    evvabin: 'Se prie après Maghrib, jusqu’à l’heure d’Isha.',
    teheccud: 'Se prie après Isha, en se levant après avoir dormi, jusqu’à l’heure de Fajr. Son moment le plus méritoire est le dernier tiers de la nuit.',
  },
  bilgiBugun: '{aciklama}\n\nAujourd’hui : {bas} – {son}',
  enFaziletli: ' · le plus méritoire après {saat}',
  sonUcteBir: ' · dernier tiers {saat}',
  durumAktif: 'L’heure est venue · fin {saat}',
  durumNafile: 'Surérogatoire · {bas}–{son}',
  bildirim: {
    kuslukBaslik: 'Heure de Duha',
    kuslukSuruyor: 'L’heure de Duha est en cours ; vous pouvez prier jusqu’à {son}.',
    kuslukGirdi: 'L’heure de Duha a commencé. Un beau moment pour deux rakats ; elle dure jusqu’à {son}.',
    kuslukBitiyor: cogul({
      one: 'Il reste {n} minute avant la fin de Duha. Un beau moment pour deux rakats ; elle dure jusqu’à {son}.',
      many: 'Il reste {n} de minutes avant la fin de Duha. Un beau moment pour deux rakats ; elle dure jusqu’à {son}.',
      other: 'Il reste {n} minutes avant la fin de Duha. Un beau moment pour deux rakats ; elle dure jusqu’à {son}.',
    }),
    evvabinBaslik: 'Awwabin',
    evvabinSuruyor: 'Il est encore temps pour Awwabin. Isha commence à {son}.',
    evvabinGirdi: 'Après Maghrib, un beau moment pour Awwabin. Isha commence à {son}.',
    evvabinKalan: cogul({
      one: 'Il reste {n} minute pour Awwabin. Isha commence à {son}.',
      many: 'Il reste {n} de minutes pour Awwabin. Isha commence à {son}.',
      other: 'Il reste {n} minutes pour Awwabin. Isha commence à {son}.',
    }),
    teheccudBaslik: 'Heure de Tahajjud',
    uyandirSonUcte: 'Levez-vous ; le dernier tiers de la nuit a commencé. Fajr commence à {son}.',
    uyandirKalan: cogul({
      one: 'Levez-vous ; il reste {n} minute avant Fajr. Fajr commence à {son}.',
      many: 'Levez-vous ; il reste {n} de minutes avant Fajr. Fajr commence à {son}.',
      other: 'Levez-vous ; il reste {n} minutes avant Fajr. Fajr commence à {son}.',
    }),
    sonUcteBaslik: 'Le dernier tiers de la nuit',
    sonUcteGovde: 'Les heures les plus bénies pour Tahajjud. Fajr commence à {son}.',
    teheccudKalan: cogul({
      one: 'Il reste {n} minute avant Fajr. Un beau moment pour Tahajjud.',
      many: 'Il reste {n} de minutes avant Fajr. Un beau moment pour Tahajjud.',
      other: 'Il reste {n} minutes avant Fajr. Un beau moment pour Tahajjud.',
    }),
  },
  uyandirmaKanali: 'Réveil pour Tahajjud',
  uyandirmaKanaliAciklama: 'Vous réveille pour la prière de nuit ; sonne même en mode silencieux',
};
