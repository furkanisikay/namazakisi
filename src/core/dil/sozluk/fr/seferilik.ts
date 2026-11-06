import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'hanafite', safii: 'chaféite' },
  kaynaklar: {
    vatan: 'Domicile d’origine, lieu de résidence et séjour temporaire au regard du voyage (en turc)',
    cem: 'Peut-on regrouper les prières (jam’) ? (en turc)',
    baslangic: 'Quand commence l’état de voyageur ? (en turc)',
    ziyaret: 'La personne qui se rend dans la ville de ses parents est-elle voyageuse ? (en turc)',
  },
  bilgiNotu:
    'Ceci est une information, non un avis juridique. Le fait d’être considéré comme voyageur dépend du but et de la durée de votre voyage ainsi que de votre intention.',
  baslik: 'Vous semblez être en voyage',
  mesafeSatiri: 'Vous êtes à environ {km} km à vol d’oiseau de votre lieu de résidence. Ce que rapporte la Diyanet pour l’école {mezhep} :',
  maddeler: {
    hanefi: [
      'Dans l’école hanafite, la distance de voyage (safar) est d’environ 90 km. Celui qui a l’intention de rester moins de 15 jours à destination est considéré comme voyageur.',
      'Le voyageur prie les prières obligatoires de quatre rakats en deux rakats (qasr).',
      'Dans l’école hanafite, le regroupement de deux prières (jam’) n’a lieu que pendant le hajj, à Arafat et à Muzdalifa. La Diyanet précise aussi qu’en cas d’excuse sérieuse comme le voyage, on peut suivre l’avis des autres écoles.',
    ],
    safii: [
      'Dans l’école chaféite aussi, la distance de voyage est d’environ 90 km. Si le séjour à destination dure moins de 4 jours, sans compter les jours d’arrivée et de départ, les règles du voyage continuent de s’appliquer.',
      'Le voyageur prie les prières obligatoires de quatre rakats en deux rakats (qasr).',
      'Dans l’école chaféite, le voyage compte parmi les excuses valables pour regrouper (jam’) Dhuhr avec Asr, et Maghrib avec Isha.',
    ],
  },
  ozetAcik: 'Activé · {mezhep}',
  ozetKapali: 'Désactivé',
  baglantiAcilamadi: 'Impossible d’ouvrir le lien. Vérifiez votre connexion Internet.',
  ikametGuncellendi: 'Votre lieu de résidence a été mis à jour',
  ikametKaydedilemedi: 'Impossible d’enregistrer votre lieu de résidence',
  kartiKapatin: 'Fermer la carte d’information sur le voyage',
  burasiEvimErisim: 'C’est chez moi, enregistrer comme lieu de résidence',
  burasiEvim: 'C’est chez moi',
  diyanetteOkuyunErisim: 'Lire la fatwa de la Diyanet dans le navigateur',
  diyanetteOkuyun: 'Lire sur le site de la Diyanet',
  sayfa: {
    kayitliKonum: 'Position enregistrée',
    henuzKaydedilmedi: 'Pas encore enregistrée — votre première position compte comme lieu de résidence',
    buradasiniz: 'Vous êtes ici',
    uzaktasiniz: 'Vous êtes actuellement à environ {km} km à vol d’oiseau',
    konumBilinmiyor: 'Votre position n’est pas encore connue ; choisissez d’abord une position',
    giris:
      'Lorsque vous êtes à environ {km} km de votre lieu de résidence, une courte carte résumant les fatwas de la Diyanet apparaît sur l’écran d’accueil. Elle apparaît une fois par voyage et n’envoie aucune notification.',
    bilgiKarti: 'Carte d’information',
    kartBaslik: 'Carte d’information sur le voyage',
    gosterilir: 'Affichée sur l’écran d’accueil',
    gosterilmez: 'Non affichée',
    mezhepNotu: 'Le contenu de la carte suit votre école juridique ; vous pouvez la choisir dans Réglages › Heures de prière.',
    ikametYeri: 'Lieu de résidence',
    ikametYapErisim: 'Enregistrer votre position actuelle comme lieu de résidence',
    ikametYap: 'Définir la position actuelle comme résidence',
    kaynaklar: 'Sources (Haut Conseil des affaires religieuses de la Diyanet)',
    kaynakErisim: '{etiket}. S’ouvre dans le navigateur',
    /** Türkiye'ye özgü hizmet: Türkçe dışında gösterilmez. */
    fetvaHatti: 'Pour vos questions, vous pouvez appeler la ligne de fatwa 190 de la Diyanet.',
  },
};
