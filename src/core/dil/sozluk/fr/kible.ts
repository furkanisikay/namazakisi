import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Vous êtes face à la Qibla',
    arkada: 'La Qibla est derrière vous, retournez-vous',
    sagda: 'La Qibla est à {derece}° sur votre droite',
    solda: 'La Qibla est à {derece}° sur votre gauche',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'O' },
  sekme: {
    pusula: 'Boussole',
    pusulaErisim: 'Mode boussole',
    pusulaAciklama: 'Quand le repère de la Kaaba atteint l’encoche du haut, vous êtes face à la Qibla.',
    kamera: 'Caméra',
    kameraErisim: 'Mode caméra',
    kameraAciklama: 'Tenez le téléphone à la verticale ; le repère de la Kaaba apparaît dans la direction de la Qibla.',
  },
  sayfa: {
    baslatiliyor: 'Démarrage de la boussole…',
    izinKapali: 'L’autorisation de localisation est désactivée ; votre position est nécessaire pour trouver la direction.',
  },
  hata: {
    izinGerekli: 'L’autorisation de localisation est nécessaire pour trouver la direction de la Qibla.',
    konumServisi: 'Les services de localisation sont inaccessibles. Vérifiez les réglages de localisation de votre appareil.',
    baslatilamadi: 'Impossible de démarrer le service de Qibla.',
  },
  pusula: {
    ufuk: 'horizon',
    konumAliniyor: 'Obtention de votre position…',
    hazirlaniyor: 'Préparation de la boussole…',
    kuzeydenAci: 'Qibla à {derece}° du nord',
    kabeUzakta: 'La Kaaba est à {mesafe}',
    kuzeydenSaatYonu: 'Dans le sens horaire depuis le nord',
    kuzeyden: '{derece}° du nord',
    kabeUzaktaKuzeyden: 'La Kaaba est à {mesafe}, {derece}° du nord',
    pusulaErisim: 'Boussole de la Qibla. {cumle}',
    pusulaYok: 'Cet appareil n’a pas de boussole ; nous indiquons la direction par rapport au nord.',
    kayiyorsa: 'Si la direction dérive, déplacez votre téléphone en dessinant un 8 dans l’air.',
    kamerayla: 'Voir avec la caméra',
  },
  kamera: {
    pusulayiKullanin: 'Utiliser la boussole',
    kullanilamiyorBaslik: 'La vue caméra n’est pas disponible sur ce téléphone',
    kullanilamiyorMetin:
      'Les capteurs de votre téléphone ne donnent pas une direction fiable à la verticale. La boussole continue d’indiquer la bonne direction.',
    izinBaslik: 'Voir la Qibla avec la caméra',
    izinMetin:
      'Tenez votre téléphone à la verticale et regardez autour de vous ; le repère de la Kaaba apparaît dans la direction de la Qibla. L’autorisation de la caméra est nécessaire ; l’image n’est pas enregistrée et ne quitte jamais votre téléphone.',
    kamerayiAcin: 'Activer la caméra',
    izinKapaliBaslik: 'L’autorisation de la caméra est désactivée',
    izinKapaliMetin: 'Vous pouvez autoriser la caméra dans les Réglages pour la vue caméra. La boussole fonctionne sans cette autorisation.',
    ayarlariAcin: 'Ouvrir les réglages',
    acilamadiBaslik: 'Impossible d’ouvrir la caméra',
    acilamadiMetin: 'La caméra n’est pas disponible pour le moment. Vous pouvez trouver la Qibla avec la boussole.',
    hesaplaniyor: 'Calcul de la direction…',
    dikTutun: 'Tenez votre téléphone à la verticale',
  },
  kalibrasyon: {
    tesekkurErisim: 'Merci, la direction est maintenant plus précise',
    tesekkur: 'Merci, la direction est maintenant plus précise ✓',
    baslik: 'Calibrer la boussole',
    sallayin: 'Déplacez votre téléphone en dessinant un 8 dans l’air.',
    metal: 'Éloignez-vous des objets métalliques et des étuis magnétiques.',
    dogruluk: 'Précision',
    simdiDegil: 'Pas maintenant',
  },
};
