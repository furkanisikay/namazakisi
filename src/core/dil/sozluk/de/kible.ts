import type { Sozluk } from '../tr';

export const kible: Sozluk['kible'] = {
  baslik: 'Qibla',
  yon: {
    hizali: 'Sie sind zur Qibla ausgerichtet',
    arkada: 'Die Qibla ist hinter Ihnen, drehen Sie sich um',
    sagda: 'Die Qibla ist {derece}° rechts von Ihnen',
    solda: 'Die Qibla ist {derece}° links von Ihnen',
  },
  harf: { kuzey: 'N', dogu: 'O', guney: 'S', bati: 'W' },
  sekme: {
    pusula: 'Kompass',
    pusulaErisim: 'Kompassmodus',
    pusulaAciklama: 'Wenn das Kaaba-Zeichen die Kerbe oben erreicht, sind Sie zur Qibla ausgerichtet.',
    kamera: 'Kamera',
    kameraErisim: 'Kameramodus',
    kameraAciklama: 'Halten Sie das Telefon aufrecht; das Kaaba-Zeichen erscheint in Richtung der Qibla.',
  },
  sayfa: {
    baslatiliyor: 'Kompass wird gestartet…',
    izinKapali: 'Die Standortberechtigung ist aus; Ihr Standort wird benötigt, um die Richtung zu finden.',
  },
  hata: {
    izinGerekli: 'Um die Qibla-Richtung zu finden, ist die Standortberechtigung nötig.',
    konumServisi: 'Die Ortungsdienste sind nicht erreichbar. Prüfen Sie die Standorteinstellungen Ihres Geräts.',
    baslatilamadi: 'Der Qibla-Dienst konnte nicht gestartet werden.',
  },
  pusula: {
    ufuk: 'Horizont',
    konumAliniyor: 'Ihr Standort wird ermittelt…',
    hazirlaniyor: 'Kompass wird vorbereitet…',
    kuzeydenAci: 'Qibla {derece}° von Norden',
    kabeUzakta: 'Die Kaaba ist {mesafe} entfernt',
    kuzeydenSaatYonu: 'Im Uhrzeigersinn von Norden',
    kuzeyden: '{derece}° von Norden',
    kabeUzaktaKuzeyden: 'Die Kaaba ist {mesafe} entfernt, {derece}° von Norden',
    pusulaErisim: 'Qibla-Kompass. {cumle}',
    pusulaYok: 'Dieses Gerät hat keinen Kompass; wir zeigen die Richtung relativ zu Norden.',
    kayiyorsa: 'Wenn die Richtung abweicht, bewegen Sie Ihr Telefon in Form einer Acht durch die Luft.',
    kamerayla: 'Mit der Kamera ansehen',
  },
  kamera: {
    pusulayiKullanin: 'Kompass verwenden',
    kullanilamiyorBaslik: 'Die Kameraansicht ist auf diesem Telefon nicht verfügbar',
    kullanilamiyorMetin:
      'Die Sensoren Ihres Telefons liefern in aufrechter Haltung keine zuverlässige Richtung. Der Kompass zeigt die Richtung weiterhin korrekt an.',
    izinBaslik: 'Die Qibla mit der Kamera sehen',
    izinMetin:
      'Halten Sie Ihr Telefon aufrecht und schauen Sie sich um; das Kaaba-Zeichen erscheint in Richtung der Qibla. Dafür ist die Kameraberechtigung nötig; das Bild wird nicht aufgezeichnet und verlässt Ihr Telefon nicht.',
    kamerayiAcin: 'Kamera einschalten',
    izinKapaliBaslik: 'Die Kameraberechtigung ist aus',
    izinKapaliMetin: 'Für die Kameraansicht können Sie den Kamerazugriff in den Einstellungen erlauben. Der Kompass funktioniert auch ohne.',
    ayarlariAcin: 'Einstellungen öffnen',
    acilamadiBaslik: 'Die Kamera konnte nicht geöffnet werden',
    acilamadiMetin: 'Die Kamera ist gerade nicht verfügbar. Mit dem Kompass finden Sie die Qibla-Richtung.',
    hesaplaniyor: 'Richtung wird berechnet…',
    dikTutun: 'Halten Sie Ihr Telefon aufrecht',
  },
  kalibrasyon: {
    tesekkurErisim: 'Danke, die Richtung ist jetzt genauer',
    tesekkur: 'Danke, die Richtung ist jetzt genauer ✓',
    baslik: 'Kompass kalibrieren',
    sallayin: 'Bewegen Sie Ihr Telefon in Form einer Acht durch die Luft.',
    metal: 'Halten Sie Abstand zu Metallgegenständen und magnetischen Hüllen.',
    dogruluk: 'Genauigkeit',
    simdiDegil: 'Nicht jetzt',
  },
};
