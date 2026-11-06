import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * "Toparlanma" = "reprise" (kazanın "rattrapage"ından ayrı tutulur). "Allah daim etsin" →
 * "Qu’Allah vous y maintienne"; "Allah sebat versin" → "Qu’Allah vous affermisse".
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Votre série est en feu',
    enUzun: cogul({ one: 'Plus longue série : {n} jour', many: 'Plus longue série : {n} de jours', other: 'Plus longue série : {n} jours' }),
    gunBuyuk: cogul({ one: 'JOUR', many: 'DE JOURS', other: 'JOURS' }),
    sonrakiHedef: 'Prochain objectif : jour {hedef} ({durum})',
    kalanGun: cogul({ one: 'Encore {n} jour', many: 'Encore {n} de jours', other: 'Encore {n} jours' }),
    tamamlandi: 'Accompli !',
    paylasErisim: 'Partagez votre progression',
    paylasBuyuk: 'PARTAGEZ VOTRE PROGRESSION',
  },

  hedefler: {
    ilk_adim: { ad: 'Première semaine', aciklama: 'Priez 7 jours sans interruption', cumle: 'Première semaine' },
    aliskanlik_ustasi: { ad: 'Maître de l’habitude', aciklama: '21 jours - le temps de prendre une habitude', cumle: 'Maître de l’habitude' },
    kararlilik: { ad: 'Constance', aciklama: '60 jours sans interruption', cumle: 'Constance' },
    efsane: { ad: 'Légende', aciklama: '90 jours - une persévérance remarquable', cumle: 'Légende' },
  },

  /** Klasik mertebe adları, Fransız transliterasyonuyla (çeviri değil). */
  seviyeler: ['Moubtadi', 'Talib', 'Salik', 'Mourid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Premier pas', aciklama: 'Vous avez accompli votre première semaine !', kosul: 'Série de 7 jours' },
    aliskanlik_ustasi: {
      ad: 'Maître de l’habitude',
      aciklama: '21 jours - le temps de prendre une habitude est accompli !',
      kosul: 'Série de 21 jours',
    },
    kararlilik: { ad: 'Constant', aciklama: 'Vous avez prié 60 jours sans interruption !', kosul: 'Série de 60 jours' },
    efsane: { ad: 'Légende', aciklama: '90 jours - vous avez fait preuve d’une persévérance remarquable !', kosul: 'Série de 90 jours' },
    toparlanma_ustasi: {
      ad: 'Maître de la reprise',
      aciklama: 'Vous avez mené le mode reprise à terme 3 fois !',
      kosul: '3 reprises',
    },
    mukemmeliyetci: { ad: 'Perfectionniste', aciklama: 'Vous avez prié 5/5 pendant 30 jours !', kosul: '30 jours à 5/5 prières' },
    yuz_namaz: { ad: '100 prières', aciklama: 'Vous avez accompli 100 prières au total !', kosul: 'Accomplir 100 prières' },
    bin_namaz: { ad: '1000 prières', aciklama: 'Vous avez accompli 1000 prières au total !', kosul: 'Accomplir 1000 prières' },
  },

  rozetSeviyeleri: { bronz: 'BRONZE', gumus: 'ARGENT', altin: 'OR', elmas: 'DIAMANT' },

  gunBitis: {
    erken: 'Pour ceux qui se couchent tôt',
    varsayilan: 'Par défaut - avant l’Imsak dans la plupart des lieux',
    gec: 'Pour ceux qui se couchent tard',
  },

  kutlama: {
    rozetEklendi: '🏅 Ajouté à votre collection de badges',
    paylasin: 'Partager',
    rozetBaslik: 'Qu’Allah vous y maintienne',
    rozetMesaj: 'Vous avez obtenu le badge « {ad} ».',
    hedefBaslik: cogul({ one: '{n} jour', many: '{n} de jours', other: '{n} jours' }),
    hedefMesaj: 'Vous avez atteint l’objectif « {ad} ». Qu’Allah vous y maintienne.',
    yeniRank: 'Nouveau rang : {rank}',
    seviyeBaslik: 'Votre nouveau niveau',
    seviyeMesaj: 'Vous continuez désormais en tant que « {rank} ». Qu’Allah vous y maintienne.',
    toparlanmaBaslik: 'Vous avez retrouvé votre série',
    toparlanmaMesaj: cogul({
      one: 'Votre série de {n} jour reprend là où elle s’était arrêtée. Qu’Allah vous affermisse.',
      many: 'Votre série de {n} de jours reprend là où elle s’était arrêtée. Qu’Allah vous affermisse.',
      other: 'Votre série de {n} jours reprend là où elle s’était arrêtée. Qu’Allah vous affermisse.',
    }),
    enUzunBaslik: 'Votre plus longue série',
    enUzunMesaj: cogul({
      one: '{n} jour : votre plus longue série jusqu’ici. Qu’Allah vous y maintienne.',
      many: '{n} de jours : votre plus longue série jusqu’ici. Qu’Allah vous y maintienne.',
      other: '{n} jours : votre plus longue série jusqu’ici. Qu’Allah vous y maintienne.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Votre historique ne peut pas être lu pour le moment.',
    yenidenErisim: 'Recharger les données de série',
    yenidenDeneyin: 'Réessayer',
    yukleniyor: 'Chargement de vos données de série...',
    gunlukSeri: 'jours de série',
    rekor: 'record',
    sozErisim: '{metin} Source : {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Prochain objectif',
    tumu: 'Vous avez obtenu tous les badges',
    kalan: cogul({
      one: 'Badge {ad} : encore {n} jour',
      many: 'Badge {ad} : encore {n} de jours',
      other: 'Badge {ad} : encore {n} jours',
    }),
    tumuErisim: 'Vous avez obtenu tous les badges : le chapelet est entièrement rempli.',
    erisim: 'Badge {ad} : {n} jours sur {hedef} accomplis.',
  },

  gok: {
    gunHarfleri: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({
      one: '{n} jour à l’objectif',
      many: '{n} de jours à l’objectif',
      other: '{n} jours à l’objectif',
    }),
    besVakit: cogul({
      one: '{n} jour avec les cinq prières',
      many: '{n} de jours avec les cinq prières',
      other: '{n} jours avec les cinq prières',
    }),
    dondurulmus: cogul({ one: '{n} jour gelé', many: '{n} de jours gelés', other: '{n} jours gelés' }),
    mevcutSeri: cogul({ one: 'Série actuelle : {n} jour.', many: 'Série actuelle : {n} de jours.', other: 'Série actuelle : {n} jours.' }),
  },

  hedefAyar: {
    azalt: 'Diminuer',
    deger: 'Valeur',
    artir: 'Augmenter',
    esik: cogul({ one: '{n} prière', many: '{n} de prières', other: '{n} prières' }),
    sifirlaBaslik: 'Réinitialiser la série',
    sifirlaMesaj: 'Toutes vos données de série (série, badges, points) seront réinitialisées. Cette action est irréversible. Voulez-vous continuer ?',
    sifirla: 'Réinitialiser',
    iptal: 'Annuler',
    basarili: 'Terminé',
    sifirlandi: 'Vos données de série ont été réinitialisées.',
    hedefAyarlari: 'RÉGLAGES DE L’OBJECTIF',
    tamGunEsigi: 'Seuil d’une journée complète',
    tamGunAciklama: 'Définit le nombre minimal de prières par jour pour que la journée compte dans votre série',
    sifirlama: 'RÉINITIALISATION',
    verileriSifirla: 'Réinitialiser les données de série',
    verileriSifirlaAlt: 'Supprime toutes les données de série, de badges et de points',
  },

  rozetKarti: {
    erisim: 'Badge {ad}, {durum}',
    kazanildi: 'obtenu',
    kilitli: 'verrouillé',
  },

  toparlanma: {
    kartBaslik: 'MODE REPRISE',
    kartAltBaslik: 'Vous pouvez retrouver votre série',
    kartMesaj: 'Vous pouvez reprendre votre série {vurgu} là où vous l’avez laissée.',
    oncekiGun: cogul({ one: 'de {n} jour', many: 'de {n} de jours', other: 'de {n} jours' }),
    ilerleme: '{tamam}/{hedef} jours accomplis',
    kalan: cogul({
      one: 'Accomplissez les cinq prières pendant encore {n} jour et votre série reprendra là où elle s’était arrêtée.',
      many: 'Accomplissez les cinq prières pendant encore {n} de jours et votre série reprendra là où elle s’était arrêtée.',
      other: 'Accomplissez les cinq prières pendant encore {n} jours et votre série reprendra là où elle s’était arrêtée.',
    }),
    bugun: 'Accomplissez la journée d’aujourd’hui et votre série reprendra là où elle s’était arrêtée.',
    uyari: 'Il suffit que ces jours se suivent ; si un jour manque entre-temps, la reprise recommence.',
    kapatErisim: 'Fermer les détails de la reprise',
    anladim: 'Compris',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Partager votre progression',
    hazirDegilBaslik: 'Image pas prête',
    hazirDegilMesaj: 'L’image n’est pas encore prête. Réessayez dans quelques secondes.',
    olusturulamadiBaslik: 'Impossible de créer l’image',
    olusturulamadiMesaj: 'Une erreur est survenue lors de la création de l’image. Réessayez.',
    kullanilamiyorBaslik: 'Partage indisponible',
    kullanilamiyorMesaj: 'Le partage n’est pas disponible sur cet appareil.',
    kapat: 'Fermer',
    hikaye: 'Ajouter à votre story',
    platformlar: 'À partager sur Instagram, WhatsApp et ailleurs.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Ma plus longue série : {n} jour', many: 'Ma plus longue série : {n} de jours', other: 'Ma plus longue série : {n} jours' }),
    seriZincir: cogul({
      one: 'JOUR SANS BRISER LA CHAÎNE !',
      many: 'DE JOURS SANS BRISER LA CHAÎNE !',
      other: 'JOURS SANS BRISER LA CHAÎNE !',
    }),
    seriSoz: '« Un petit pas chaque jour, une grande paix dans mon âme. 🔥 »',
    rozetYeni: 'J’AI OBTENU UN NOUVEAU BADGE !',
    rozetSozleri: [
      'Aujourd’hui, j’ai fait un beau pas pour moi-même ! 🌟',
      'Je continue avec détermination, ce badge est à moi ! 💪',
      'J’ai saisi la baraka du matin ! 🌅',
      'Je fais partie de ce cheminement qui fait du bien à mon âme ! ✨',
      'Les petits pas apportent une grande paix. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'J’AI OBTENU UN NOUVEAU BADGE !',
      hedef_tamamlandi: 'OBJECTIF ATTEINT !',
      seviye_atlandi: 'NIVEAU SUPÉRIEUR !',
      toparlanma_tamamlandi: 'DE RETOUR SUR LA BONNE VOIE !',
      en_uzun_seri: 'NOUVEAU RECORD !',
      varsayilan: 'RÉUSSITE !',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Que mon Seigneur m’y maintienne. 🤲', 'Les petits pas apportent une grande paix. 🍃', 'Qu’Allah nous affermisse tous. 🌱'],
      hedef_tamamlandi: ['Les petits pas apportent une grande paix. 🍃', 'Qu’Allah m’y maintienne. 🤲', 'Un pas de plus chaque jour. 🌱'],
      seviye_atlandi: [
        'J’avance un peu plus chaque jour, qu’Allah me facilite la route. 🍃',
        'Qu’Allah m’y maintienne. 🤲',
        'Le chemin continue. 🌱',
      ],
      toparlanma_tamamlandi: [
        'L’important n’est pas de tomber, mais de se relever. 🔄',
        'Qu’Allah m’affermisse. 🤲',
        'Avec patience, on vient à bout de tout chemin. 🌱',
      ],
      en_uzun_seri: [
        'Un petit pas chaque jour, une grande paix dans mon cœur. 🍃',
        'Qu’Allah m’y maintienne. 🤲',
        'Que mon Seigneur nous affermisse tous. 🌱',
      ],
    },
  },
};
