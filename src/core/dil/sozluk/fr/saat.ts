import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Sur le téléphone',
    telefonAciklama: 'L’alarme de Fajr et le réveil pour Tahajjud sonnent sur votre téléphone.',
    saatBaslik: 'Sur la montre, en silence',
    saatAciklama:
      'Seul votre poignet vibre, la personne qui dort à côté de vous n’est pas réveillée. Si vous n’arrêtez pas l’alarme sur la montre, votre téléphone sonne en secours {dk} minutes plus tard. Si Namaz Akışı n’est pas installé sur votre montre ou n’est pas à jour, votre téléphone sonne chaque matin avec {dk} minutes de retard.',
    saatAciklamaIos:
      'Seul votre poignet vibre, la personne qui dort à côté de vous n’est pas réveillée. Si vous n’arrêtez pas l’alarme sur la montre, votre iPhone sonne en secours {dk} minutes plus tard.',
    ikisiBaslik: 'Sur les deux',
    ikisiAciklama: 'La montre et le téléphone sonnent en même temps ; l’arrêter sur la montre fait aussi taire le téléphone.',
    ikisiAciklamaIos: 'La montre et l’iPhone sonnent en même temps ; l’arrêter sur la montre fait aussi taire l’iPhone.',
  },
  anons: {
    otomatikBaslik: 'Sur le téléphone, sur la montre s’il est loin',
    otomatikAciklama:
      'Quand votre téléphone est près de vous, c’est lui qui lit à voix haute et votre montre reste volontairement silencieuse (pour que les deux appareils ne lisent pas la même phrase). Quand votre téléphone est loin, c’est votre montre qui lit.',
    saatBaslik: 'Seulement sur la montre',
    saatAciklama:
      'Votre montre lit toujours à voix haute et votre téléphone reste silencieux. Quand votre montre est en charge, n’est pas connectée à votre téléphone ou n’a pas Namaz Akışı, rien n’est lu ; si vous ne le souhaitez pas, utilisez la première option.',
    telefonBaslik: 'Seulement sur le téléphone',
    telefonAciklama: 'Votre montre ne parle jamais.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Si Namaz Akışı est installé sur votre Apple Watch, elle partage le travail avec votre iPhone. Ici, vous choisissez où sonne le réveil.',
    giris:
      'Si Namaz Akışı est installé sur votre montre, elle partage le travail avec votre téléphone. Ici, vous choisissez où sonne le réveil et où les annonces sont lues à voix haute.',
    uyandirmaBaslik: 'Où le réveil doit-il sonner ?',
    uyandirmaNotu:
      'Le réveil, c’est la véritable alarme que vous activez pour Fajr dans le rappel « Avant la fin de l’heure » et le réveil pour Tahajjud que vous activez dans Prières surérogatoires.',
    uyandirmaNotuIos:
      'watchOS ne peut programmer une alarme silencieuse que lorsque l’app de la montre est ouverte : ouvrez Namaz Akışı sur votre montre une fois par jour, et le prochain réveil est programmé à ce moment-là. Si la montre est en charge ou si l’app n’a pas été ouverte, l’alarme de secours de votre iPhone sonne.',
    uyandirmaNotuAndroid: 'Votre montre ne sonne pas pendant la charge ; c’est alors votre téléphone qui sonne.',
    muhafizAyarlari: 'Ouvrir les réglages « Avant la fin de l’heure »',
    nafileAyarlari: 'Ouvrir les réglages des prières surérogatoires',
    bilektenBaslik: 'Ce que vous pouvez faire depuis votre poignet',
    bilektenIos: [
      'Quand votre iPhone est loin, les rappels sonnent sur votre montre ; les deux ne sonnent pas en même temps.',
      'Vous marquez depuis votre poignet les prières accomplies ; votre iPhone les enregistre.',
      'Vous comptez le tasbih avec la Digital Crown et trouvez la Qibla sur votre montre.',
    ],
    anonsBaslik: 'Où la lecture à voix haute doit-elle se faire ?',
    anonsNotu:
      'Seuls les rappels dont la lecture à voix haute est activée sont lus. Les deux appareils ne lisent pas la même phrase ensemble. Votre montre reste aussi silencieuse quand vous êtes à la mosquée ou que le mode prière est activé. Si votre montre n’a pas de haut-parleur, de moteur de synthèse vocale ou de voix dans la langue de l’application, elle vibre seulement. Vous pouvez tester tout de suite le son de la montre avec « Tester le son » dans l’app Namaz Akışı de la montre.',
    bilekten: [
      'Vous pouvez activer et désactiver le mode prière avec le bouton de la montre (jusqu’à la fin de l’heure de prière, 30 minutes au plus).',
      'À la mosquée, votre montre affiche l’état ; vous répondez depuis votre poignet à « Ce n’est pas une mosquée » et « Êtes-vous à la mosquée ? ».',
      'Les écrans qui ne tiennent pas sur la montre (carnet de rattrapage, À la mosquée, réglages) s’ouvrent sur votre téléphone avec « Ouvrir sur le téléphone ».',
    ],
    namazModuNotu: 'Pour activer le mode prière depuis la montre, activez-le d’abord une fois sur votre téléphone.',
    namazModuAyarlari: 'Ouvrir les réglages du mode prière',
  },
  sayfa: {
    akilliSaat: 'Montre connectée',
    appleWatchOzet: 'Où sonne le réveil',
    saatOzet: 'Où sonnent le réveil et la lecture à voix haute',
    canliEtkinlikler: 'Activités en direct',
    canliSayaclar: 'Comptes à rebours en direct',
    geriSayim: 'Compte à rebours',
    gelismisErisim: 'Avancé. Automatisations et applications qui marquent « J’ai prié »',
    gelismis: 'Avancé',
    otomasyonlar: 'Automatisations',
    otomasyonBaslik: 'Utiliser avec des automatisations',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Applications qui marquent « J’ai prié »',
    kildimOzet: 'Les applications que vous avez autorisées',
  },
};
