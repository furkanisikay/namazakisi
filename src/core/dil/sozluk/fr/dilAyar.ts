import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const dilAyar: Sozluk['dilAyar'] = {
  baslik: 'Langue · Dil',
  aciklama: 'Choisissez la langue de l’application. Les notifications et la lecture à voix haute l’utilisent aussi.',
  grup: 'Langue de l’application',
  dilAdlari: { tr: 'Turc', en: 'Anglais', id: 'Indonésien', de: 'Allemand', fr: 'Français', bs: 'Bosnien', ru: 'Russe', ms: 'Malais' },
  cihazDili: 'Langue de l’appareil',
  cihazDiliKullaniliyor: 'Actuellement {ad}',
  cihazDiliDesteklenmiyor: 'La langue de votre appareil n’est pas encore disponible ; le turc est utilisé.',
  beta: 'Bêta',
  betaAciklama: '{ad} · Bêta',
  notlar: {
    beta: 'Les traductions bêta sont en cours de relecture ; certains textes peuvent être imparfaits.',
    vakit: 'La langue ne modifie pas le calcul des heures de prière.',
    nass: 'Dans les langues autres que le turc, seules les traductions du Coran sont affichées ; les hadiths proviennent d’une source turque et ne sont donc pas affichés.',
  },
  ozelAnons: {
    baslik: 'Textes de lecture à voix haute que vous avez écrits',
    govde: cogul({
      one: '{n} texte de lecture à voix haute que vous avez écrit est resté dans la langue précédente. Le remplacer par le texte prêt à l’emploi de la nouvelle langue ?',
      many: '{n} de textes de lecture à voix haute que vous avez écrits sont restés dans la langue précédente. Les remplacer par les textes prêts à l’emploi de la nouvelle langue ?',
      other: '{n} textes de lecture à voix haute que vous avez écrits sont restés dans la langue précédente. Les remplacer par les textes prêts à l’emploi de la nouvelle langue ?',
    }),
    degistir: 'Remplacer par le texte prêt',
    koru: 'Laisser tel quel',
    degisti: cogul({ one: '{n} texte remplacé.', many: '{n} de textes remplacés.', other: '{n} textes remplacés.' }),
  },
  vakitAdlari: {
    baslik: 'Noms des prières',
    aciklama: 'Choisissez comment les heures de prière sont nommées.',
    otomatik: 'Selon le pays',
    otomatikAciklama: 'Utilise les noms courants dans le pays de votre position.',
    takimlar: { temel: 'Noms arabes', diyanetDe: 'Diyanet (allemand)', turkce: 'Noms turcs', magrip: 'Graphie maghrébine', cezayir: 'Graphie algérienne' },
  },
  kaydedilemedi: 'Impossible d’enregistrer la langue. Réessayez.',
  sihirbazBaglantisi: 'Langue · Dil',
  sihirbazBaglantisiAciklama: 'Changer la langue de l’application',
};
