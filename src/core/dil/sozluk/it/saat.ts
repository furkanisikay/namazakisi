import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Sul telefono',
    telefonAciklama: 'La sveglia del Fajr e la sveglia per il Tahajjud suonano sul telefono.',
    saatBaslik: 'Sull’orologio, in silenzio',
    saatAciklama:
      'Vibra solo il polso, così chi dorme accanto a lei non si sveglia. Se non la spegne sull’orologio, il telefono suona come riserva {dk} minuti dopo. Se Namaz Akışı non è sull’orologio o non è aggiornata, il telefono suona ogni mattina con {dk} minuti di ritardo.',
    saatAciklamaIos:
      'Vibra solo il polso, così chi dorme accanto a lei non si sveglia. Se non la spegne sull’orologio, l’iPhone suona come riserva {dk} minuti dopo.',
    ikisiBaslik: 'Su entrambi',
    ikisiAciklama: 'Orologio e telefono suonano insieme; spegnendola sull’orologio si silenzia anche il telefono.',
    ikisiAciklamaIos: 'Orologio e iPhone suonano insieme; spegnendola sull’orologio si silenzia anche l’iPhone.',
  },
  anons: {
    otomatikBaslik: 'Sul telefono, sull’orologio quando il telefono è lontano',
    otomatikAciklama:
      'Quando il telefono è con lei, legge il telefono e l’orologio resta volutamente in silenzio (così i due dispositivi non leggono la stessa frase). Quando il telefono è lontano, legge l’orologio.',
    saatBaslik: 'Solo sull’orologio',
    saatAciklama:
      'L’orologio legge sempre ad alta voce e il telefono resta in silenzio. Mentre l’orologio è in carica, non è collegato al telefono o non ha Namaz Akışı, non viene letto nulla; se non lo desidera, usi la prima opzione.',
    telefonBaslik: 'Solo sul telefono',
    telefonAciklama: 'L’orologio non parla mai.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Se Namaz Akışı è installata sull’Apple Watch, divide il lavoro con l’iPhone. Qui sceglie dove suona la sveglia.',
    giris:
      'Se Namaz Akışı è installata sull’orologio, divide il lavoro con il telefono. Qui sceglie dove suona la sveglia e dove vengono letti ad alta voce gli annunci.',
    uyandirmaBaslik: 'Dove deve suonare la sveglia?',
    uyandirmaNotu:
      'La sveglia è la vera sveglia che attiva per il Fajr nel promemoria «Prima della fine» e la sveglia per il Tahajjud che attiva in Preghiere supererogatorie.',
    uyandirmaNotuIos:
      'watchOS può impostare una sveglia silenziosa solo mentre l’app dell’orologio è aperta: apra Namaz Akışı sull’orologio una volta al giorno e la sveglia successiva viene impostata in quel momento. Mentre l’orologio è in carica o se l’app non è stata aperta, suona la riserva dell’iPhone.',
    uyandirmaNotuAndroid: 'L’orologio non suona mentre è in carica; suona invece il telefono.',
    muhafizAyarlari: 'Aprire le impostazioni di «Prima della fine»',
    nafileAyarlari: 'Aprire le impostazioni delle preghiere supererogatorie',
    bilektenBaslik: 'Cosa può fare dal polso',
    bilektenIos: [
      'Quando l’iPhone è lontano, i promemoria suonano sull’orologio; non suonano su entrambi.',
      'Segna dal polso le preghiere compiute; l’iPhone le registra.',
      'Conta il tasbih con la Digital Crown e trova la qibla sull’orologio.',
    ],
    anonsBaslik: 'Dove deve avvenire la lettura ad alta voce?',
    anonsNotu:
      'Vengono letti solo i promemoria con la lettura ad alta voce attiva. I due dispositivi non leggono insieme la stessa frase. L’orologio resta in silenzio anche quando lei è in moschea o la modalità preghiera è attiva. Se l’orologio non ha altoparlante, motore di sintesi vocale o una voce nella lingua dell’app, vibra soltanto. Può provare subito il suono dell’orologio con «Provare il suono» nell’app Namaz Akışı per orologio.',
    bilekten: [
      'Può attivare e disattivare la modalità preghiera con il pulsante dell’orologio (fino alla fine dell’orario, al massimo 30 minuti).',
      'In moschea l’orologio mostra lo stato; risponde dal polso a «Non è una moschea» e «È in moschea?».',
      'Le schermate che non entrano nell’orologio (registro dei recuperi, In moschea, impostazioni) si aprono sul telefono con «Aprire sul telefono».',
    ],
    namazModuNotu: 'Per attivare la modalità preghiera dall’orologio, la attivi prima una volta sul telefono.',
    namazModuAyarlari: 'Aprire le impostazioni della modalità preghiera',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Dove suona la sveglia',
    saatOzet: 'Dove suona la sveglia e dove si legge ad alta voce',
    canliEtkinlikler: 'Attività in tempo reale',
    canliSayaclar: 'Conti alla rovescia',
    geriSayim: 'Conto alla rovescia',
    gelismisErisim: 'Avanzate. Automazioni e app che segnano Ho pregato',
    gelismis: 'Avanzate',
    otomasyonlar: 'Automazioni',
    otomasyonBaslik: 'Uso con le automazioni',
    otomasyonOzet: 'Routine Samsung, Tasker, MacroDroid',
    kildimBaslik: 'App che segnano Ho pregato',
    kildimOzet: 'App che ha autorizzato',
  },
};
