import type { Sozluk } from '../tr';

/** Kaynak fetvalar Türkçedir; etiket bunu söyler. Hüküm kipi yok (bilgi aktarımı). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hanafi', safii: 'Schafii' },
  kaynaklar: {
    vatan: 'Heimatort, Wohnort und vorübergehender Aufenthalt im Hinblick auf die Reise (auf Türkisch)',
    cem: 'Dürfen Gebete zusammengelegt werden? (auf Türkisch)',
    baslangic: 'Wann beginnt die Reise? (auf Türkisch)',
    ziyaret: 'Gilt als Reisender, wer den Wohnort seiner Eltern besucht? (auf Türkisch)',
  },
  bilgiNotu:
    'Dies ist eine Information, kein Rechtsurteil. Ob Sie als Reisender gelten, hängt vom Zweck und der Dauer Ihrer Reise sowie von Ihrer Absicht ab.',
  baslik: 'Sie scheinen auf Reisen zu sein',
  mesafeSatiri: 'Sie sind Luftlinie etwa {km} km von Ihrem Wohnort entfernt. Was Diyanet zur Rechtsschule {mezhep} überliefert:',
  maddeler: {
    hanefi: [
      'In der hanafitischen Rechtsschule liegt die Reisedistanz bei etwa 90 km. Wer beabsichtigt, weniger als 15 Tage am Zielort zu bleiben, gilt als Reisender.',
      'Wer als Reisender gilt, betet die Pflichtgebete mit vier Rakat als zwei Rakat (Qasr).',
      'In der hanafitischen Rechtsschule gibt es das Zusammenlegen zweier Gebete nur während der Hadsch, in Arafat und Muzdalifa. Diyanet weist zudem darauf hin, dass man bei wichtigen Entschuldigungsgründen wie einer Reise der Ansicht der anderen Rechtsschulen folgen kann.',
    ],
    safii: [
      'Auch in der schafiitischen Rechtsschule liegt die Reisedistanz bei etwa 90 km. Bleibt man am Zielort, An- und Abreisetag nicht mitgezählt, weniger als 4 Tage, gelten weiterhin die Reisebestimmungen.',
      'Wer als Reisender gilt, betet die Pflichtgebete mit vier Rakat als zwei Rakat (Qasr).',
      'In der schafiitischen Rechtsschule gilt die Reise als gültiger Grund, Dhuhr mit Asr und Maghrib mit Isha zusammenzulegen.',
    ],
  },
  ozetAcik: 'An · {mezhep}',
  ozetKapali: 'Aus',
  baglantiAcilamadi: 'Der Link konnte nicht geöffnet werden. Prüfen Sie Ihre Internetverbindung.',
  ikametGuncellendi: 'Ihr Wohnort wurde aktualisiert',
  ikametKaydedilemedi: 'Ihr Wohnort konnte nicht gespeichert werden',
  kartiKapatin: 'Reise-Infokarte schließen',
  burasiEvimErisim: 'Hier wohne ich, als meinen Wohnort speichern',
  burasiEvim: 'Hier wohne ich',
  diyanetteOkuyunErisim: 'Die Diyanet-Fatwa im Browser lesen',
  diyanetteOkuyun: 'Bei Diyanet lesen',
  sayfa: {
    kayitliKonum: 'Gespeicherter Ort',
    henuzKaydedilmedi: 'Noch nicht gespeichert — Ihr erster Standort gilt als Wohnort',
    buradasiniz: 'Sie sind gerade hier',
    uzaktasiniz: 'Sie sind gerade Luftlinie etwa {km} km entfernt',
    konumBilinmiyor: 'Ihr Standort ist noch nicht bekannt; wählen Sie zuerst einen Standort',
    giris:
      'Wenn Sie sich etwa {km} km von Ihrem Wohnort entfernen, sehen Sie auf der Startseite eine kurze Infokarte, die die Fatwas von Diyanet zusammenfasst. Die Karte erscheint einmal pro Reise und sendet keine Benachrichtigungen.',
    bilgiKarti: 'Infokarte',
    kartBaslik: 'Reise-Infokarte',
    gosterilir: 'Wird auf der Startseite angezeigt',
    gosterilmez: 'Wird nicht angezeigt',
    mezhepNotu: 'Der Inhalt der Karte richtet sich nach Ihrer Rechtsschule; Sie können sie unter Einstellungen › Gebetszeiten wählen.',
    ikametYeri: 'Wohnort',
    ikametYapErisim: 'Ihren aktuellen Standort als Wohnort speichern',
    ikametYap: 'Aktuellen Standort als Wohnort festlegen',
    kaynaklar: 'Quellen (Hoher Rat für Religionsangelegenheiten der Diyanet)',
    kaynakErisim: '{etiket}. Öffnet sich im Browser',
    /** Türkiye'ye özgü hizmet; Türkçe dışında gösterilmez. */
    fetvaHatti: 'Bei Fragen können Sie die Diyanet-Fatwa-Hotline 190 anrufen.',
  },
};
