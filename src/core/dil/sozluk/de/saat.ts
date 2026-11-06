import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Auf dem Telefon',
    telefonAciklama: 'Der Fajr-Wecker und das Tahajjud-Wecken klingeln auf Ihrem Telefon.',
    saatBaslik: 'Auf der Uhr, lautlos',
    saatAciklama:
      'Nur Ihr Handgelenk vibriert, wer neben Ihnen schläft, wird nicht geweckt. Wenn Sie es auf der Uhr nicht beenden, klingelt Ihr Telefon {dk} Minuten später als Absicherung. Ist Namaz Akışı nicht auf Ihrer Uhr oder nicht aktuell, klingelt Ihr Telefon jeden Morgen {dk} Minuten später.',
    saatAciklamaIos:
      'Nur Ihr Handgelenk vibriert, wer neben Ihnen schläft, wird nicht geweckt. Wenn Sie es auf der Uhr nicht beenden, klingelt Ihr iPhone {dk} Minuten später als Absicherung.',
    ikisiBaslik: 'Auf beiden',
    ikisiAciklama: 'Uhr und Telefon klingeln gleichzeitig; wenn Sie es auf der Uhr beenden, verstummt auch das Telefon.',
    ikisiAciklamaIos: 'Uhr und iPhone klingeln gleichzeitig; wenn Sie es auf der Uhr beenden, verstummt auch das iPhone.',
  },
  anons: {
    otomatikBaslik: 'Auf dem Telefon, auf der Uhr, wenn es entfernt ist',
    otomatikAciklama:
      'Wenn Ihr Telefon bei Ihnen ist, liest das Telefon vor und Ihre Uhr schweigt bewusst (damit nicht beide Geräte denselben Satz vorlesen). Ist Ihr Telefon entfernt, liest Ihre Uhr vor.',
    saatBaslik: 'Nur auf der Uhr',
    saatAciklama:
      'Ihre Uhr liest immer vor, Ihr Telefon schweigt. Lädt Ihre Uhr, ist sie nicht mit Ihrem Telefon verbunden oder ist Namaz Akışı nicht auf der Uhr, ist gar nichts zu hören; wenn Sie das nicht möchten, nutzen Sie die erste Option.',
    telefonBaslik: 'Nur auf dem Telefon',
    telefonAciklama: 'Ihre Uhr spricht nie.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Wenn Namaz Akışı auf Ihrer Apple Watch installiert ist, teilt sie sich die Aufgaben mit Ihrem iPhone. Hier wählen Sie, wo das Wecken klingelt.',
    giris:
      'Wenn Namaz Akışı auf Ihrer Uhr installiert ist, teilt sie sich die Aufgaben mit Ihrem Telefon. Hier wählen Sie, wo das Wecken klingelt und wo vorgelesen wird.',
    uyandirmaBaslik: 'Wo soll das Wecken klingeln?',
    uyandirmaNotu:
      'Das Wecken ist der echte Alarm, den Sie in der Erinnerung „Bevor die Zeit endet“ für Fajr einschalten, und das Tahajjud-Wecken, das Sie unter „Freiwillige Gebete“ einschalten.',
    uyandirmaNotuIos:
      'watchOS kann einen lautlosen Alarm nur stellen, während die Uhr-App geöffnet ist: Öffnen Sie Namaz Akışı einmal täglich auf Ihrer Uhr, dann wird das nächste Wecken gestellt. Lädt die Uhr oder wurde die App nicht geöffnet, klingelt die Absicherung auf Ihrem iPhone.',
    uyandirmaNotuAndroid: 'Ihre Uhr klingelt nicht, während sie lädt; dann klingelt Ihr Telefon.',
    muhafizAyarlari: 'Einstellungen für „Bevor die Zeit endet“ öffnen',
    nafileAyarlari: 'Einstellungen für freiwillige Gebete öffnen',
    bilektenBaslik: 'Was Sie am Handgelenk erledigen können',
    bilektenIos: [
      'Ist Ihr iPhone entfernt, klingeln die Erinnerungen auf Ihrer Uhr; nie auf beiden zugleich.',
      'Sie markieren verrichtete Gebete am Handgelenk; Ihr iPhone speichert sie.',
      'Sie zählen Tasbih mit der Digital Crown und finden die Qibla auf Ihrer Uhr.',
    ],
    anonsBaslik: 'Wo soll vorgelesen werden?',
    anonsNotu:
      'Nur Erinnerungen mit eingeschaltetem Vorlesen werden vorgelesen. Beide Geräte lesen nicht denselben Satz gleichzeitig. In der Moschee oder bei eingeschaltetem Gebetsmodus schweigt auch Ihre Uhr. Hat Ihre Uhr keinen Lautsprecher, keine Sprachausgabe oder keine Stimme in der Sprache der App, vibriert sie nur. Den Ton der Uhr können Sie in der Uhr-App von Namaz Akışı mit „Ton testen“ sofort ausprobieren.',
    bilekten: [
      'Sie können den Gebetsmodus mit der Taste auf der Uhr ein- und ausschalten (bis zum Ende der Gebetszeit, höchstens 30 Minuten).',
      'In der Moschee zeigt Ihre Uhr den Status an; „Das ist keine Moschee“ und „Sind Sie in der Moschee?“ beantworten Sie am Handgelenk.',
      'Bildschirme, die nicht auf die Uhr passen (Nachholbuch, In der Moschee, Einstellungen), öffnen Sie mit „Auf dem Telefon öffnen“ auf Ihrem Telefon.',
    ],
    namazModuNotu: 'Um den Gebetsmodus von der Uhr aus einzuschalten, schalten Sie ihn zuerst einmal auf Ihrem Telefon ein.',
    namazModuAyarlari: 'Einstellungen für den Gebetsmodus öffnen',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Wo das Wecken klingelt',
    saatOzet: 'Wo geweckt und vorgelesen wird',
    canliEtkinlikler: 'Live-Aktivitäten',
    canliSayaclar: 'Live-Countdowns',
    geriSayim: 'Countdown',
    gelismisErisim: 'Erweitert. Automationen und Apps, die Gebete als gebetet markieren',
    gelismis: 'Erweitert',
    otomasyonlar: 'Automationen',
    otomasyonBaslik: 'Mit Automationen verwenden',
    otomasyonOzet: 'Samsung Routinen, Tasker, MacroDroid',
    kildimBaslik: 'Apps, die Gebete als gebetet markieren',
    kildimOzet: 'Von Ihnen erlaubte Apps',
  },
};
