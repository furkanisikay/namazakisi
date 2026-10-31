import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'La sua serie è accesa',
    enUzun: cogul({ one: 'Serie più lunga: {n} giorno', many: 'Serie più lunga: {n} di giorni', other: 'Serie più lunga: {n} giorni' }),
    gunBuyuk: cogul({ one: 'GIORNO', many: 'GIORNI', other: 'GIORNI' }),
    sonrakiHedef: 'Prossimo obiettivo: giorno {hedef} ({durum})',
    kalanGun: cogul({ one: 'Manca {n} giorno', many: 'Mancano {n} di giorni', other: 'Mancano {n} giorni' }),
    tamamlandi: 'Completato',
    paylasErisim: 'Condividere i progressi',
    paylasBuyuk: 'CONDIVIDERE I PROGRESSI',
  },

  hedefler: {
    ilk_adim: { ad: 'Prima settimana', aciklama: 'Pregare per 7 giorni senza interruzioni', cumle: 'Prima settimana' },
    aliskanlik_ustasi: { ad: 'Maestro dell’abitudine', aciklama: '21 giorni - periodo per formare un’abitudine', cumle: 'Maestro dell’abitudine' },
    kararlilik: { ad: 'Costanza', aciklama: '60 giorni senza interruzioni', cumle: 'Costanza' },
    efsane: { ad: 'Leggenda', aciklama: '90 giorni - perseveranza straordinaria', cumle: 'Leggenda' },
  },

  /** Klasik mertebe adları, harf çevirisiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Primo passo', aciklama: 'Ha completato la prima settimana!', kosul: 'Serie di 7 giorni' },
    aliskanlik_ustasi: {
      ad: 'Maestro dell’abitudine',
      aciklama: '21 giorni - periodo per formare un’abitudine completato!',
      kosul: 'Serie di 21 giorni',
    },
    kararlilik: { ad: 'Costante', aciklama: 'Ha pregato per 60 giorni senza interruzioni!', kosul: 'Serie di 60 giorni' },
    efsane: { ad: 'Leggenda', aciklama: '90 giorni - ha mostrato una perseveranza straordinaria!', kosul: 'Serie di 90 giorni' },
    toparlanma_ustasi: {
      ad: 'Maestro della ripresa',
      aciklama: 'Ha completato la modalità ripresa 3 volte!',
      kosul: '3 riprese',
    },
    mukemmeliyetci: { ad: 'Perfezionista', aciklama: 'Ha pregato 5/5 per 30 giorni!', kosul: '30 giorni di preghiere 5/5' },
    yuz_namaz: { ad: '100 preghiere', aciklama: 'Ha compiuto 100 preghiere in totale!', kosul: 'Compiere 100 preghiere' },
    bin_namaz: { ad: '1000 preghiere', aciklama: 'Ha compiuto 1000 preghiere in totale!', kosul: 'Compiere 1000 preghiere' },
  },

  rozetSeviyeleri: { bronz: 'BRONZO', gumus: 'ARGENTO', altin: 'ORO', elmas: 'DIAMANTE' },

  gunBitis: {
    erken: 'Per chi dorme presto',
    varsayilan: 'Predefinito - prima del Fajr nella maggior parte dei luoghi',
    gec: 'Per chi dorme tardi',
  },

  kutlama: {
    rozetEklendi: '🏅 Aggiunto alla sua collezione di distintivi',
    paylasin: 'Condividere',
    rozetBaslik: 'Che Allah lo renda duraturo',
    rozetMesaj: 'Ha ottenuto il distintivo «{ad}».',
    hedefBaslik: cogul({ one: '{n} giorno', many: '{n} di giorni', other: '{n} giorni' }),
    hedefMesaj: 'Ha completato l’obiettivo «{ad}». Che Allah lo renda duraturo.',
    yeniRank: 'Nuovo grado: {rank}',
    seviyeBaslik: 'Il suo nuovo livello',
    seviyeMesaj: 'Ora continua come «{rank}». Che Allah lo renda duraturo.',
    toparlanmaBaslik: 'La sua serie è tornata',
    toparlanmaMesaj: cogul({
      one: 'La sua serie di {n} giorno riprende da dove si era fermata. Che Allah conceda la costanza.',
      many: 'La sua serie di {n} di giorni riprende da dove si era fermata. Che Allah conceda la costanza.',
      other: 'La sua serie di {n} giorni riprende da dove si era fermata. Che Allah conceda la costanza.',
    }),
    enUzunBaslik: 'La sua serie più lunga',
    enUzunMesaj: cogul({
      one: '{n} giorno: la sua serie più lunga finora. Che Allah la renda duratura.',
      many: '{n} di giorni: la sua serie più lunga finora. Che Allah la renda duratura.',
      other: '{n} giorni: la sua serie più lunga finora. Che Allah la renda duratura.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Al momento non è stato possibile leggere i dati passati.',
    yenidenErisim: 'Ricaricare i dati della serie',
    yenidenDeneyin: 'Riprovare',
    yukleniyor: 'Caricamento dei dati della serie...',
    gunlukSeri: 'giorni di serie',
    rekor: 'record',
    sozErisim: '{metin} Fonte: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Prossimo obiettivo',
    tumu: 'Ha completato tutti i distintivi',
    kalan: cogul({ one: 'Distintivo {ad}: manca {n} giorno', many: 'Distintivo {ad}: mancano {n} di giorni', other: 'Distintivo {ad}: mancano {n} giorni' }),
    tumuErisim: 'Ha completato tutti i distintivi: il tasbih è completo.',
    erisim: 'Distintivo {ad}: {n} giorni completati su {hedef}.',
  },

  gok: {
    gunHarfleri: ['L', 'M', 'M', 'G', 'V', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} giorno ha raggiunto l’obiettivo', many: '{n} di giorni hanno raggiunto l’obiettivo', other: '{n} giorni hanno raggiunto l’obiettivo' }),
    besVakit: cogul({ one: '{n} giorno con tutte e cinque le preghiere', many: '{n} di giorni con tutte e cinque le preghiere', other: '{n} giorni con tutte e cinque le preghiere' }),
    dondurulmus: cogul({ one: '{n} giorno congelato', many: '{n} di giorni congelati', other: '{n} giorni congelati' }),
    mevcutSeri: cogul({ one: 'Serie attuale: {n} giorno.', many: 'Serie attuale: {n} di giorni.', other: 'Serie attuale: {n} giorni.' }),
  },

  hedefAyar: {
    azalt: 'Diminuire',
    deger: 'Valore',
    artir: 'Aumentare',
    esik: cogul({ one: '{n} preghiera', many: '{n} di preghiere', other: '{n} preghiere' }),
    sifirlaBaslik: 'Azzerare la serie',
    sifirlaMesaj: 'Tutti i dati della serie (serie, distintivi, punti) verranno azzerati. L’operazione non può essere annullata. Vuole continuare?',
    sifirla: 'Azzerare',
    iptal: 'Annullare',
    basarili: 'Fatto',
    sifirlandi: 'I dati della serie sono stati azzerati.',
    hedefAyarlari: 'IMPOSTAZIONI DELL’OBIETTIVO',
    tamGunEsigi: 'Soglia del giorno completo',
    tamGunAciklama: 'Stabilisce il numero minimo di preghiere al giorno perché quel giorno conti per la serie',
    sifirlama: 'AZZERAMENTO',
    verileriSifirla: 'Azzerare i dati della serie',
    verileriSifirlaAlt: 'Elimina tutti i dati di serie, distintivi e punti',
  },

  rozetKarti: {
    erisim: 'Distintivo {ad}, {durum}',
    kazanildi: 'ottenuto',
    kilitli: 'bloccato',
  },

  toparlanma: {
    kartBaslik: 'MODALITÀ RIPRESA',
    kartAltBaslik: 'Può recuperare la sua serie',
    kartMesaj: 'Può continuare la sua serie {vurgu} da dove si era fermata.',
    oncekiGun: cogul({ one: 'di {n} giorno', many: 'di {n} di giorni', other: 'di {n} giorni' }),
    ilerleme: '{tamam}/{hedef} giorni completati',
    kalan: cogul({
      one: 'Completi tutte e cinque le preghiere per ancora {n} giorno e la serie riprende da dove si era fermata.',
      many: 'Completi tutte e cinque le preghiere per altri {n} di giorni e la serie riprende da dove si era fermata.',
      other: 'Completi tutte e cinque le preghiere per altri {n} giorni e la serie riprende da dove si era fermata.',
    }),
    bugun: 'Completi la giornata di oggi e la serie riprende da dove si era fermata.',
    uyari: 'I giorni devono essere consecutivi; se nel mezzo manca un giorno, la ripresa ricomincia da capo.',
    kapatErisim: 'Chiudere i dettagli della ripresa',
    anladim: 'Ho capito',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Condividere i progressi',
    hazirDegilBaslik: 'Immagine non pronta',
    hazirDegilMesaj: 'L’immagine non è ancora pronta. Riprovi tra qualche secondo.',
    olusturulamadiBaslik: 'Impossibile creare l’immagine',
    olusturulamadiMesaj: 'Si è verificato un problema durante la creazione dell’immagine. Riprovi.',
    kullanilamiyorBaslik: 'Condivisione non disponibile',
    kullanilamiyorMesaj: 'La condivisione non è disponibile su questo dispositivo.',
    kapat: 'Chiudere',
    hikaye: 'Aggiungere alla storia',
    platformlar: 'Si può condividere su Instagram, WhatsApp e altro.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'La mia serie più lunga: {n} giorno', many: 'La mia serie più lunga: {n} di giorni', other: 'La mia serie più lunga: {n} giorni' }),
    seriZincir: cogul({ one: 'GIORNO SENZA SPEZZARE LA CATENA!', many: 'GIORNI SENZA SPEZZARE LA CATENA!', other: 'GIORNI SENZA SPEZZARE LA CATENA!' }),
    seriSoz: '«Un piccolo passo ogni giorno, una grande pace nell’anima. 🔥»',
    rozetYeni: 'HO OTTENUTO UN NUOVO DISTINTIVO!',
    rozetSozleri: [
      'Oggi ho fatto un bel passo per me stesso! 🌟',
      'Vado avanti con determinazione; questo distintivo è mio! 💪',
      'Ho colto la benedizione del mattino! 🌅',
      'Faccio parte di questo flusso che fa bene all’anima! ✨',
      'I piccoli passi portano una grande pace. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'HO OTTENUTO UN NUOVO DISTINTIVO!',
      hedef_tamamlandi: 'HO RAGGIUNTO IL MIO OBIETTIVO!',
      seviye_atlandi: 'LIVELLO SUPERIORE!',
      toparlanma_tamamlandi: 'DI NUOVO IN CAMMINO!',
      en_uzun_seri: 'NUOVO RECORD!',
      varsayilan: 'TRAGUARDO!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Che il mio Signore lo renda duraturo. 🤲', 'I piccoli passi portano una grande pace. 🍃', 'Che Allah conceda a tutti noi la costanza. 🌱'],
      hedef_tamamlandi: ['I piccoli passi portano una grande pace. 🍃', 'Che Allah lo renda duraturo. 🤲', 'Un passo in più ogni giorno. 🌱'],
      seviye_atlandi: [
        'Un po’ più avanti ogni giorno; che Allah lo renda facile. 🍃',
        'Che Allah lo renda duraturo. 🤲',
        'Il cammino continua. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ciò che conta non è cadere, ma rialzarsi. 🔄',
        'Che Allah conceda la costanza. 🤲',
        'Ogni strada si percorre con pazienza. 🌱',
      ],
      en_uzun_seri: [
        'Un piccolo passo ogni giorno, una grande pace nel cuore. 🍃',
        'Che Allah lo renda duraturo. 🤲',
        'Che il mio Signore conceda a tutti noi la costanza. 🌱',
      ],
    },
  },
};
