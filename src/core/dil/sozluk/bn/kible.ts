// ÇEVİRİ: bn — İngilizce iskelet, çevrilince bu satır silinir
import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'You are facing the Qibla',
    arkada: 'The Qibla is behind you, turn around',
    sagda: 'The Qibla is {derece}° to your right',
    solda: 'The Qibla is {derece}° to your left',
  },
  harf: { kuzey: 'N', dogu: 'E', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Compass',
    pusulaErisim: 'Compass mode',
    pusulaAciklama: 'When the Kaaba mark reaches the notch at the top, you are facing the Qibla.',
    kamera: 'Camera',
    kameraErisim: 'Camera mode',
    kameraAciklama: 'Hold the phone upright; the Kaaba mark appears in the Qibla direction.',
  },
  sayfa: {
    baslatiliyor: 'Starting the compass…',
    izinKapali: 'Location permission is off; your location is needed to find the direction.',
  },
  hata: {
    izinGerekli: 'Location permission is needed to find the Qibla direction.',
    konumServisi: "Location services can't be reached. Check your device's location settings.",
    baslatilamadi: "The Qibla service couldn't start.",
  },
  pusula: {
    ufuk: 'horizon',
    konumAliniyor: 'Getting your location…',
    hazirlaniyor: 'Preparing the compass…',
    kuzeydenAci: 'Qibla is {derece}° from north',
    kabeUzakta: 'Kaaba is {mesafe} away',
    kuzeydenSaatYonu: 'Clockwise from north',
    kuzeyden: '{derece}° from north',
    kabeUzaktaKuzeyden: 'Kaaba is {mesafe} away, {derece}° from north',
    pusulaErisim: 'Qibla compass. {cumle}',
    pusulaYok: "This device has no compass; we're showing the direction relative to north.",
    kayiyorsa: 'If the direction drifts, move your phone in a figure 8 in the air.',
    kamerayla: 'View with camera',
  },
  kamera: {
    pusulayiKullanin: 'Use the compass',
    kullanilamiyorBaslik: "Camera view isn't available on this phone",
    kullanilamiyorMetin:
      "Your phone's sensors don't give a reliable direction when held upright. The compass still shows the direction correctly.",
    izinBaslik: 'See the Qibla with your camera',
    izinMetin:
      "Hold your phone upright and look around; the Kaaba mark appears in the Qibla direction. This needs camera permission; the image isn't recorded and never leaves your phone.",
    kamerayiAcin: 'Turn on camera',
    izinKapaliBaslik: 'Camera permission is off',
    izinKapaliMetin: 'You can allow camera access in Settings for the camera view. The compass works without it.',
    ayarlariAcin: 'Open Settings',
    acilamadiBaslik: "Camera couldn't open",
    acilamadiMetin: "The camera isn't available right now. You can find the Qibla with the compass.",
    hesaplaniyor: 'Finding the direction…',
    dikTutun: 'Hold your phone upright',
  },
  kalibrasyon: {
    tesekkurErisim: 'Thanks, the direction is more accurate now',
    tesekkur: 'Thanks, the direction is more accurate now ✓',
    baslik: 'Calibrate the compass',
    sallayin: 'Move your phone in a figure 8 in the air.',
    metal: 'Move away from metal objects and magnetic cases.',
    dogruluk: 'Accuracy',
    simdiDegil: 'Not now',
  },
};
