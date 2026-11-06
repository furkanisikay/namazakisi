import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Ihre Serie brennt',
    enUzun: cogul({ one: 'Längste Serie: {n} Tag', other: 'Längste Serie: {n} Tage' }),
    gunBuyuk: cogul({ one: 'TAG', other: 'TAGE' }),
    sonrakiHedef: 'Nächstes Ziel: Tag {hedef} ({durum})',
    kalanGun: cogul({ one: 'noch {n} Tag', other: 'noch {n} Tage' }),
    tamamlandi: 'Geschafft!',
    paylasErisim: 'Ihren Fortschritt teilen',
    paylasBuyuk: 'FORTSCHRITT TEILEN',
  },

  hedefler: {
    ilk_adim: { ad: 'Erste Woche', aciklama: 'Beten Sie 7 Tage ohne Unterbrechung', cumle: 'Erste Woche' },
    aliskanlik_ustasi: { ad: 'Meister der Gewohnheit', aciklama: '21 Tage - Zeit, um eine Gewohnheit zu bilden', cumle: 'Meister der Gewohnheit' },
    kararlilik: { ad: 'Beständigkeit', aciklama: '60 Tage ohne Unterbrechung', cumle: 'Beständigkeit' },
    efsane: { ad: 'Legende', aciklama: '90 Tage - herausragende Ausdauer', cumle: 'Legende' },
  },

  /** Klasik mertebe adları, transliterasyonla (çevrilmez). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Erster Schritt', aciklama: 'Sie haben Ihre erste Woche geschafft!', kosul: '7-Tage-Serie' },
    aliskanlik_ustasi: {
      ad: 'Meister der Gewohnheit',
      aciklama: '21 Tage - die Zeit zur Gewohnheitsbildung ist geschafft!',
      kosul: '21-Tage-Serie',
    },
    kararlilik: { ad: 'Beständig', aciklama: 'Sie haben 60 Tage ohne Unterbrechung gebetet!', kosul: '60-Tage-Serie' },
    efsane: { ad: 'Legende', aciklama: '90 Tage - Sie haben herausragende Ausdauer gezeigt!', kosul: '90-Tage-Serie' },
    toparlanma_ustasi: {
      ad: 'Meister des Aufholens',
      aciklama: 'Sie haben die Aufholphase 3-mal erfolgreich abgeschlossen!',
      kosul: '3-mal aufgeholt',
    },
    mukemmeliyetci: { ad: 'Perfektionist', aciklama: 'Sie haben 30 Tage lang 5/5 Gebete verrichtet!', kosul: '30 Tage mit 5/5 Gebeten' },
    yuz_namaz: { ad: '100 Gebete', aciklama: 'Sie haben insgesamt 100 Gebete verrichtet!', kosul: '100 Gebete verrichten' },
    bin_namaz: { ad: '1000 Gebete', aciklama: 'Sie haben insgesamt 1000 Gebete verrichtet!', kosul: '1000 Gebete verrichten' },
  },

  rozetSeviyeleri: { bronz: 'BRONZE', gumus: 'SILBER', altin: 'GOLD', elmas: 'DIAMANT' },

  gunBitis: {
    erken: 'Für Frühschläfer',
    varsayilan: 'Standard - meist vor Fajr',
    gec: 'Für Spätschläfer',
  },

  kutlama: {
    rozetEklendi: '🏅 Zu Ihrer Abzeichensammlung hinzugefügt',
    paylasin: 'Teilen',
    rozetBaslik: 'Möge Allah es beständig machen',
    rozetMesaj: 'Sie haben das Abzeichen „{ad}“ erhalten.',
    hedefBaslik: cogul({ one: '{n} Tag', other: '{n} Tage' }),
    hedefMesaj: 'Sie haben das Ziel „{ad}“ erreicht. Möge Allah es beständig machen.',
    seviyeBaslik: 'Ihre neue Stufe',
    yeniRank: 'Neuer Rang: {rank}',
    seviyeMesaj: 'Sie gehen jetzt als „{rank}“ weiter. Möge Allah es beständig machen.',
    toparlanmaBaslik: 'Ihre Serie ist zurück',
    toparlanmaMesaj: cogul({
      one: 'Ihre {n}-Tage-Serie geht dort weiter, wo sie stand. Möge Allah Standhaftigkeit schenken.',
      other: 'Ihre {n}-Tage-Serie geht dort weiter, wo sie stand. Möge Allah Standhaftigkeit schenken.',
    }),
    enUzunBaslik: 'Ihre längste Serie',
    enUzunMesaj: cogul({
      one: '{n} Tag: Ihre bisher längste Serie. Möge Allah es beständig machen.',
      other: '{n} Tage: Ihre bisher längste Serie. Möge Allah es beständig machen.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Ihre bisherigen Einträge konnten gerade nicht gelesen werden.',
    yenidenErisim: 'Seriendaten erneut laden',
    yenidenDeneyin: 'Erneut versuchen',
    yukleniyor: 'Ihre Seriendaten werden geladen...',
    gunlukSeri: 'Tage in Folge',
    rekor: 'Rekord',
    sozErisim: '{metin} Quelle: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Nächstes Ziel',
    tumu: 'Sie haben alle Abzeichen erreicht',
    kalan: cogul({ one: 'Abzeichen {ad}: noch {n} Tag', other: 'Abzeichen {ad}: noch {n} Tage' }),
    tumuErisim: 'Sie haben alle Abzeichen erreicht: Die Tasbih ist ganz gefüllt.',
    erisim: 'Abzeichen {ad}: {n} von {hedef} Tagen geschafft.',
  },

  gok: {
    gunHarfleri: ['M', 'D', 'M', 'D', 'F', 'S', 'S'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} Tag mit erreichtem Ziel', other: '{n} Tage mit erreichtem Ziel' }),
    besVakit: cogul({ one: '{n} Tag mit allen fünf Gebeten', other: '{n} Tage mit allen fünf Gebeten' }),
    dondurulmus: cogul({ one: '{n} Tag eingefroren', other: '{n} Tage eingefroren' }),
    mevcutSeri: cogul({ one: 'Aktuelle Serie: {n} Tag.', other: 'Aktuelle Serie: {n} Tage.' }),
  },

  hedefAyar: {
    azalt: 'Verringern',
    deger: 'Wert',
    artir: 'Erhöhen',
    esik: cogul({ one: '{n} Gebet', other: '{n} Gebete' }),
    sifirlaBaslik: 'Serie zurücksetzen',
    sifirlaMesaj: 'Alle Ihre Seriendaten (Serie, Abzeichen, Punkte) werden zurückgesetzt. Das kann nicht rückgängig gemacht werden. Möchten Sie fortfahren?',
    sifirla: 'Zurücksetzen',
    iptal: 'Abbrechen',
    basarili: 'Erledigt',
    sifirlandi: 'Ihre Seriendaten wurden zurückgesetzt.',
    hedefAyarlari: 'ZIELEINSTELLUNGEN',
    tamGunEsigi: 'Schwelle für einen vollen Tag',
    tamGunAciklama: 'Legt fest, wie viele Gebete Sie mindestens am Tag verrichten müssen, damit der Tag für Ihre Serie zählt',
    sifirlama: 'ZURÜCKSETZEN',
    verileriSifirla: 'Seriendaten zurücksetzen',
    verileriSifirlaAlt: 'Löscht alle Serien-, Abzeichen- und Punktedaten',
  },

  rozetKarti: {
    erisim: 'Abzeichen {ad}, {durum}',
    kazanildi: 'erhalten',
    kilitli: 'gesperrt',
  },

  toparlanma: {
    kartBaslik: 'AUFHOLPHASE',
    kartAltBaslik: 'Sie können Ihre Serie zurückgewinnen',
    kartMesaj: 'Sie können Ihre {vurgu} Serie dort fortsetzen, wo Sie aufgehört haben.',
    oncekiGun: cogul({ one: '{n}-tägige', other: '{n}-tägige' }),
    ilerleme: '{tamam}/{hedef} Tage geschafft',
    kalan: cogul({
      one: 'Verrichten Sie noch {n} Tag alle fünf Gebete, dann geht Ihre Serie dort weiter, wo sie stand.',
      other: 'Verrichten Sie noch {n} Tage alle fünf Gebete, dann geht Ihre Serie dort weiter, wo sie stand.',
    }),
    bugun: 'Wenn Sie den heutigen Tag vollständig machen, geht Ihre Serie dort weiter, wo sie stand.',
    uyari: 'Die Tage müssen aufeinander folgen; fehlt ein Tag dazwischen, beginnt die Aufholphase von vorn.',
    kapatErisim: 'Details zur Aufholphase schließen',
    anladim: 'Verstanden',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Fortschritt teilen',
    hazirDegilBaslik: 'Bild nicht bereit',
    hazirDegilMesaj: 'Das Bild ist noch nicht bereit. Versuchen Sie es in ein paar Sekunden erneut.',
    olusturulamadiBaslik: 'Bild konnte nicht erstellt werden',
    olusturulamadiMesaj: 'Beim Erstellen des Bildes ist ein Fehler aufgetreten. Versuchen Sie es erneut.',
    kullanilamiyorBaslik: 'Teilen nicht verfügbar',
    kullanilamiyorMesaj: 'Teilen ist auf diesem Gerät nicht verfügbar.',
    kapat: 'Schließen',
    hikaye: 'Zu Ihrer Story hinzufügen',
    platformlar: 'Kann auf Instagram, WhatsApp und anderen geteilt werden.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Meine längste Serie: {n} Tag', other: 'Meine längste Serie: {n} Tage' }),
    seriZincir: cogul({ one: 'TAG OHNE DIE KETTE ZU UNTERBRECHEN!', other: 'TAGE OHNE DIE KETTE ZU UNTERBRECHEN!' }),
    seriSoz: '„Jeden Tag ein kleiner Schritt, großer Frieden in meiner Seele. 🔥“',
    rozetYeni: 'ICH HABE EIN NEUES ABZEICHEN!',
    rozetSozleri: [
      'Heute habe ich einen guten Schritt für mich gemacht! 🌟',
      'Ich bleibe entschlossen dran, dieses Abzeichen gehört mir! 💪',
      'Ich habe den Segen des Morgens erreicht! 🌅',
      'Ich bin Teil dieses Flusses, der meiner Seele guttut! ✨',
      'Kleine Schritte bringen großen Frieden. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NEUES ABZEICHEN!',
      hedef_tamamlandi: 'ZIEL ERREICHT!',
      seviye_atlandi: 'NEUE STUFE!',
      toparlanma_tamamlandi: 'WIEDER AUF KURS!',
      en_uzun_seri: 'NEUER REKORD!',
      varsayilan: 'GESCHAFFT!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Möge mein Herr es beständig machen. 🤲', 'Kleine Schritte bringen großen Frieden. 🍃', 'Möge Allah uns allen Standhaftigkeit schenken. 🌱'],
      hedef_tamamlandi: ['Kleine Schritte bringen großen Frieden. 🍃', 'Möge Allah es beständig machen. 🤲', 'Jeden Tag ein Schritt mehr. 🌱'],
      seviye_atlandi: [
        'Jeden Tag komme ich ein Stück weiter; möge Allah es leicht machen. 🍃',
        'Möge Allah es beständig machen. 🤲',
        'Die Reise geht weiter. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Nicht das Fallen zählt, sondern das Aufstehen. 🔄',
        'Möge Allah Standhaftigkeit schenken. 🤲',
        'Mit Geduld lässt sich jeder Weg gehen. 🌱',
      ],
      en_uzun_seri: [
        'Jeden Tag ein kleiner Schritt, großer Frieden in meinem Herzen. 🍃',
        'Möge Allah es beständig machen. 🤲',
        'Möge mein Herr uns allen Standhaftigkeit schenken. 🌱',
      ],
    },
  },
};
