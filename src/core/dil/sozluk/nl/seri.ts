import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Uw reeks brandt',
    enUzun: cogul({ one: 'Langste reeks: {n} dag', other: 'Langste reeks: {n} dagen' }),
    gunBuyuk: cogul({ one: 'DAG', other: 'DAGEN' }),
    sonrakiHedef: 'Volgend doel: dag {hedef} ({durum})',
    kalanGun: cogul({ one: 'Nog {n} dag', other: 'Nog {n} dagen' }),
    tamamlandi: 'Voltooid!',
    paylasErisim: 'Uw voortgang delen',
    paylasBuyuk: 'UW VOORTGANG DELEN',
  },

  hedefler: {
    ilk_adim: { ad: 'Eerste week', aciklama: '7 dagen zonder onderbreking bidden', cumle: 'Eerste week' },
    aliskanlik_ustasi: { ad: 'Meester in gewoonte', aciklama: '21 dagen - de tijd om een gewoonte te vormen', cumle: 'Meester in gewoonte' },
    kararlilik: { ad: 'Standvastigheid', aciklama: '60 dagen zonder onderbreking', cumle: 'Standvastigheid' },
    efsane: { ad: 'Legende', aciklama: '90 dagen - uitzonderlijke volharding', cumle: 'Legende' },
  },

  /** Klasik mertebe adları, harf çevirisiyle (çeviri değil); Felemenkçe yazımda u → oe. */
  seviyeler: ['Moebtadi', 'Talib', 'Salik', 'Moerid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Eerste stap', aciklama: 'U hebt uw eerste week voltooid!', kosul: 'Reeks van 7 dagen' },
    aliskanlik_ustasi: {
      ad: 'Meester in gewoonte',
      aciklama: '21 dagen - de tijd om een gewoonte te vormen is voltooid!',
      kosul: 'Reeks van 21 dagen',
    },
    kararlilik: { ad: 'Standvastig', aciklama: 'U hebt 60 dagen zonder onderbreking gebeden!', kosul: 'Reeks van 60 dagen' },
    efsane: { ad: 'Legende', aciklama: '90 dagen - u hebt uitzonderlijke volharding getoond!', kosul: 'Reeks van 90 dagen' },
    toparlanma_ustasi: {
      ad: 'Meester in herstel',
      aciklama: 'U hebt de herstelmodus 3 keer voltooid!',
      kosul: '3 keer herstel',
    },
    mukemmeliyetci: { ad: 'Perfectionist', aciklama: 'U hebt 30 dagen lang 5/5 gebeden verricht!', kosul: '30 dagen 5/5 gebeden' },
    yuz_namaz: { ad: '100 gebeden', aciklama: 'U hebt in totaal 100 gebeden verricht!', kosul: '100 gebeden verrichten' },
    bin_namaz: { ad: '1000 gebeden', aciklama: 'U hebt in totaal 1000 gebeden verricht!', kosul: '1000 gebeden verrichten' },
  },

  rozetSeviyeleri: { bronz: 'BRONS', gumus: 'ZILVER', altin: 'GOUD', elmas: 'DIAMANT' },

  gunBitis: {
    erken: 'Voor wie vroeg naar bed gaat',
    varsayilan: 'Standaard - op de meeste plaatsen voor Fajr',
    gec: 'Voor wie laat naar bed gaat',
  },

  kutlama: {
    rozetEklendi: '🏅 Toegevoegd aan uw badgeverzameling',
    paylasin: 'Delen',
    rozetBaslik: 'Moge Allah het bestendigen',
    rozetMesaj: 'U hebt de badge "{ad}" behaald.',
    hedefBaslik: cogul({ one: '{n} dag', other: '{n} dagen' }),
    hedefMesaj: 'U hebt het doel "{ad}" voltooid. Moge Allah het bestendigen.',
    yeniRank: 'Nieuwe rang: {rank}',
    seviyeBaslik: 'Uw nieuwe niveau',
    seviyeMesaj: 'U gaat nu verder als "{rank}". Moge Allah het bestendigen.',
    toparlanmaBaslik: 'Uw reeks is terug',
    toparlanmaMesaj: cogul({
      one: 'Uw reeks van {n} dag gaat verder waar hij was gebleven. Moge Allah u standvastigheid schenken.',
      other: 'Uw reeks van {n} dagen gaat verder waar hij was gebleven. Moge Allah u standvastigheid schenken.',
    }),
    enUzunBaslik: 'Uw langste reeks',
    enUzunMesaj: cogul({
      one: '{n} dag: uw langste reeks tot nu toe. Moge Allah het bestendigen.',
      other: '{n} dagen: uw langste reeks tot nu toe. Moge Allah het bestendigen.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Uw eerdere gegevens konden nu niet worden gelezen.',
    yenidenErisim: 'Reeksgegevens opnieuw laden',
    yenidenDeneyin: 'Opnieuw proberen',
    yukleniyor: 'Uw reeksgegevens worden geladen...',
    gunlukSeri: 'dagen reeks',
    rekor: 'record',
    sozErisim: '{metin} Bron: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Volgend doel',
    tumu: 'U hebt alle badges behaald',
    kalan: cogul({ one: 'Badge {ad}: nog {n} dag', other: 'Badge {ad}: nog {n} dagen' }),
    tumuErisim: 'U hebt alle badges behaald: de tasbih is helemaal vol.',
    erisim: 'Badge {ad}: {n} van {hedef} dagen voltooid.',
  },

  gok: {
    gunHarfleri: ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} dag doel gehaald', other: '{n} dagen doel gehaald' }),
    besVakit: cogul({ one: '{n} dag met alle vijf gebeden', other: '{n} dagen met alle vijf gebeden' }),
    dondurulmus: cogul({ one: '{n} dag bevroren', other: '{n} dagen bevroren' }),
    mevcutSeri: cogul({ one: 'Huidige reeks: {n} dag.', other: 'Huidige reeks: {n} dagen.' }),
  },

  hedefAyar: {
    azalt: 'Verlagen',
    deger: 'Waarde',
    artir: 'Verhogen',
    esik: cogul({ one: '{n} gebed', other: '{n} gebeden' }),
    sifirlaBaslik: 'Reeks resetten',
    sifirlaMesaj: 'Al uw reeksgegevens (reeks, badges, punten) worden gereset. Dit kan niet ongedaan worden gemaakt. Wilt u doorgaan?',
    sifirla: 'Resetten',
    iptal: 'Annuleren',
    basarili: 'Klaar',
    sifirlandi: 'Uw reeksgegevens zijn gereset.',
    hedefAyarlari: 'DOELINSTELLINGEN',
    tamGunEsigi: 'Drempel voor een volle dag',
    tamGunAciklama: 'Bepaalt het minimale aantal gebeden per dag dat nodig is om die dag voor uw reeks mee te tellen',
    sifirlama: 'RESETTEN',
    verileriSifirla: 'Reeksgegevens resetten',
    verileriSifirlaAlt: 'Verwijdert alle gegevens over reeks, badges en punten',
  },

  rozetKarti: {
    erisim: 'Badge {ad}, {durum}',
    kazanildi: 'behaald',
    kilitli: 'vergrendeld',
  },

  toparlanma: {
    kartBaslik: 'HERSTELMODUS',
    kartAltBaslik: 'U kunt uw reeks terugkrijgen',
    kartMesaj: 'U kunt uw reeks van {vurgu} voortzetten waar u was gebleven.',
    oncekiGun: cogul({ one: '{n} dag', other: '{n} dagen' }),
    ilerleme: '{tamam}/{hedef} dagen voltooid',
    kalan: cogul({
      one: 'Verricht nog {n} dag alle vijf gebeden en uw reeks gaat verder waar hij was gebleven.',
      other: 'Verricht nog {n} dagen alle vijf gebeden en uw reeks gaat verder waar hij was gebleven.',
    }),
    bugun: 'Maak vandaag compleet en uw reeks gaat verder waar hij was gebleven.',
    uyari: 'De dagen moeten opeenvolgend zijn; als er tussendoor een dag wordt gemist, begint het herstel opnieuw.',
    kapatErisim: 'Herstelgegevens sluiten',
    anladim: 'Begrepen',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Uw voortgang delen',
    hazirDegilBaslik: 'Afbeelding niet klaar',
    hazirDegilMesaj: 'De afbeelding is nog niet klaar. Probeer het over een paar seconden opnieuw.',
    olusturulamadiBaslik: 'Afbeelding kon niet worden gemaakt',
    olusturulamadiMesaj: 'Er is iets misgegaan bij het maken van de afbeelding. Probeer het opnieuw.',
    kullanilamiyorBaslik: 'Delen niet beschikbaar',
    kullanilamiyorMesaj: 'Delen is op dit apparaat niet beschikbaar.',
    kapat: 'Sluiten',
    hikaye: 'Aan uw verhaal toevoegen',
    platformlar: 'Te delen op Instagram, WhatsApp en meer.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Mijn langste reeks: {n} dag', other: 'Mijn langste reeks: {n} dagen' }),
    seriZincir: cogul({ one: 'DAG ZONDER DE KETTING TE BREKEN!', other: 'DAGEN ZONDER DE KETTING TE BREKEN!' }),
    seriSoz: '"Elke dag een kleine stap, een grote rust in mijn ziel. 🔥"',
    rozetYeni: 'IK HEB EEN NIEUWE BADGE BEHAALD!',
    rozetSozleri: [
      'Vandaag heb ik een mooie stap voor mezelf gezet! 🌟',
      'Ik ga vastberaden door; deze badge is van mij! 💪',
      'Ik heb de zegen van de ochtend gegrepen! 🌅',
      'Ik doe mee aan deze stroom die mijn ziel goeddoet! ✨',
      'Kleine stappen brengen grote rust. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'IK HEB EEN NIEUWE BADGE BEHAALD!',
      hedef_tamamlandi: 'IK HEB MIJN DOEL BEREIKT!',
      seviye_atlandi: 'NIVEAU OMHOOG!',
      toparlanma_tamamlandi: 'WEER OP KOERS!',
      en_uzun_seri: 'NIEUW RECORD!',
      varsayilan: 'GELUKT!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Moge mijn Heer het bestendigen. 🤲', 'Kleine stappen brengen grote rust. 🍃', 'Moge Allah ons allen standvastigheid schenken. 🌱'],
      hedef_tamamlandi: ['Kleine stappen brengen grote rust. 🍃', 'Moge Allah het bestendigen. 🤲', 'Elke dag een stap verder. 🌱'],
      seviye_atlandi: [
        'Elke dag kom ik een stukje verder; moge Allah het makkelijk maken. 🍃',
        'Moge Allah het bestendigen. 🤲',
        'De reis gaat verder. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Niet het vallen telt, maar het opstaan. 🔄',
        'Moge Allah standvastigheid schenken. 🤲',
        'Met geduld is elke weg te gaan. 🌱',
      ],
      en_uzun_seri: [
        'Elke dag een kleine stap, een grote rust in mijn hart. 🍃',
        'Moge Allah het bestendigen. 🤲',
        'Moge mijn Heer ons allen standvastigheid schenken. 🌱',
      ],
    },
  },
};
