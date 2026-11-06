import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Din svit brinner',
    enUzun: cogul({ one: 'Längsta svit: {n} dag', other: 'Längsta svit: {n} dagar' }),
    gunBuyuk: cogul({ one: 'DAG', other: 'DAGAR' }),
    sonrakiHedef: 'Nästa mål: dag {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} dag kvar', other: '{n} dagar kvar' }),
    tamamlandi: 'Klart',
    paylasErisim: 'Dela dina framsteg',
    paylasBuyuk: 'DELA DINA FRAMSTEG',
  },

  hedefler: {
    ilk_adim: { ad: 'Första veckan', aciklama: 'Be i 7 dagar utan uppehåll', cumle: 'Första veckan' },
    aliskanlik_ustasi: { ad: 'Vanans mästare', aciklama: '21 dagar – tiden det tar att bygga en vana', cumle: 'Vanans mästare' },
    kararlilik: { ad: 'Ståndaktighet', aciklama: '60 dagar utan uppehåll', cumle: 'Ståndaktighet' },
    efsane: { ad: 'Legend', aciklama: '90 dagar – enastående uthållighet', cumle: 'Legend' },
  },

  /** Klasik mertebe adları, harf çevirisi (çevrilmez). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Första steget', aciklama: 'Du har fullbordat din första vecka.', kosul: 'Svit på 7 dagar' },
    aliskanlik_ustasi: {
      ad: 'Vanans mästare',
      aciklama: '21 dagar – tiden för att bygga en vana är fullbordad.',
      kosul: 'Svit på 21 dagar',
    },
    kararlilik: { ad: 'Ståndaktig', aciklama: 'Du har bett i 60 dagar utan uppehåll.', kosul: 'Svit på 60 dagar' },
    efsane: { ad: 'Legend', aciklama: '90 dagar – du har visat enastående uthållighet.', kosul: 'Svit på 90 dagar' },
    toparlanma_ustasi: {
      ad: 'Återhämtningens mästare',
      aciklama: 'Du har fullbordat återhämtningsläget 3 gånger.',
      kosul: '3 återhämtningar',
    },
    mukemmeliyetci: { ad: 'Fullständig', aciklama: 'Du har bett 5/5 i 30 dagar.', kosul: '30 dagar med 5/5 böner' },
    yuz_namaz: { ad: '100 böner', aciklama: 'Du har förrättat 100 böner totalt.', kosul: 'Förrätta 100 böner' },
    bin_namaz: { ad: '1000 böner', aciklama: 'Du har förrättat 1000 böner totalt.', kosul: 'Förrätta 1000 böner' },
  },

  rozetSeviyeleri: { bronz: 'BRONS', gumus: 'SILVER', altin: 'GULD', elmas: 'DIAMANT' },

  gunBitis: {
    erken: 'För den som somnar tidigt',
    varsayilan: 'Standard – före Fajr på de flesta platser',
    gec: 'För den som somnar sent',
  },

  kutlama: {
    rozetEklendi: '🏅 Tillagt i din märkessamling',
    paylasin: 'Dela',
    rozetBaslik: 'Må Allah låta det bestå',
    rozetMesaj: 'Du har fått märket ”{ad}”.',
    hedefBaslik: cogul({ one: '{n} dag', other: '{n} dagar' }),
    hedefMesaj: 'Du har nått målet ”{ad}”. Må Allah låta det bestå.',
    yeniRank: 'Ny rang: {rank}',
    seviyeBaslik: 'Din nya nivå',
    seviyeMesaj: 'Du fortsätter nu som ”{rank}”. Må Allah låta det bestå.',
    toparlanmaBaslik: 'Din svit är tillbaka',
    toparlanmaMesaj: cogul({
      one: 'Din svit på {n} dag fortsätter där den slutade. Må Allah ge ståndaktighet.',
      other: 'Din svit på {n} dagar fortsätter där den slutade. Må Allah ge ståndaktighet.',
    }),
    enUzunBaslik: 'Din längsta svit',
    enUzunMesaj: cogul({
      one: '{n} dag: din längsta svit hittills. Må Allah låta det bestå.',
      other: '{n} dagar: din längsta svit hittills. Må Allah låta det bestå.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Dina tidigare registreringar kunde inte läsas just nu.',
    yenidenErisim: 'Försök läsa in svitdata igen',
    yenidenDeneyin: 'Försök igen',
    yukleniyor: 'Läser in din svitdata...',
    gunlukSeri: 'dagars svit',
    rekor: 'rekord',
    sozErisim: '{metin} Källa: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Nästa mål',
    tumu: 'Du har fått alla märken',
    kalan: cogul({ one: 'Märket {ad}: {n} dag kvar', other: 'Märket {ad}: {n} dagar kvar' }),
    tumuErisim: 'Du har fått alla märken: tasbihen är full.',
    erisim: 'Märket {ad}: {n} av {hedef} dagar klara.',
  },

  gok: {
    gunHarfleri: ['M', 'T', 'O', 'T', 'F', 'L', 'S'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} dag nådde målet', other: '{n} dagar nådde målet' }),
    besVakit: cogul({ one: '{n} dag med alla fem bönerna', other: '{n} dagar med alla fem bönerna' }),
    dondurulmus: cogul({ one: '{n} dag fryst', other: '{n} dagar frysta' }),
    mevcutSeri: cogul({ one: 'Nuvarande svit: {n} dag.', other: 'Nuvarande svit: {n} dagar.' }),
  },

  hedefAyar: {
    azalt: 'Minska',
    deger: 'Värde',
    artir: 'Öka',
    esik: cogul({ one: '{n} bön', other: '{n} böner' }),
    sifirlaBaslik: 'Nollställ svit',
    sifirlaMesaj: 'All din svitdata (svit, märken, poäng) nollställs. Det går inte att ångra. Vill du fortsätta?',
    sifirla: 'Nollställ',
    iptal: 'Avbryt',
    basarili: 'Klart',
    sifirlandi: 'Din svitdata har nollställts.',
    hedefAyarlari: 'MÅLINSTÄLLNINGAR',
    tamGunEsigi: 'Gräns för hel dag',
    tamGunAciklama: 'Anger det minsta antal böner per dag som krävs för att dagen ska räknas till din svit',
    sifirlama: 'NOLLSTÄLLNING',
    verileriSifirla: 'Nollställ svitdata',
    verileriSifirlaAlt: 'Raderar all data om svit, märken och poäng',
  },

  rozetKarti: {
    erisim: 'Märket {ad}, {durum}',
    kazanildi: 'uppnått',
    kilitli: 'låst',
  },

  toparlanma: {
    kartBaslik: 'ÅTERHÄMTNINGSLÄGE',
    kartAltBaslik: 'Du kan få tillbaka din svit',
    kartMesaj: 'Du kan fortsätta din svit på {vurgu} där du slutade.',
    oncekiGun: cogul({ one: '{n} dag', other: '{n} dagar' }),
    ilerleme: '{tamam}/{hedef} dagar klara',
    kalan: cogul({
      one: 'Förrätta alla fem bönerna i {n} dag till så fortsätter din svit där den slutade.',
      other: 'Förrätta alla fem bönerna i {n} dagar till så fortsätter din svit där den slutade.',
    }),
    bugun: 'Fullborda dagen i dag så fortsätter din svit där den slutade.',
    uyari: 'Dagarna måste vara i följd; missas en dag emellan börjar återhämtningen om.',
    kapatErisim: 'Stäng detaljer om återhämtning',
    anladim: 'Uppfattat',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Dela dina framsteg',
    hazirDegilBaslik: 'Bilden är inte klar',
    hazirDegilMesaj: 'Bilden är inte klar än. Försök igen om några sekunder.',
    olusturulamadiBaslik: 'Bilden kunde inte skapas',
    olusturulamadiMesaj: 'Något gick fel när bilden skapades. Försök igen.',
    kullanilamiyorBaslik: 'Delning är inte tillgänglig',
    kullanilamiyorMesaj: 'Delning är inte tillgänglig på den här enheten.',
    kapat: 'Stäng',
    hikaye: 'Lägg till i din story',
    platformlar: 'Kan delas på Instagram, WhatsApp med flera.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Min längsta svit: {n} dag', other: 'Min längsta svit: {n} dagar' }),
    seriZincir: cogul({ one: 'DAG UTAN ATT BRYTA KEDJAN', other: 'DAGAR UTAN ATT BRYTA KEDJAN' }),
    seriSoz: '”Ett litet steg varje dag, en stor frid i min själ. 🔥”',
    rozetYeni: 'JAG HAR FÅTT ETT NYTT MÄRKE',
    rozetSozleri: [
      'I dag tog jag ett gott steg för mig själv. 🌟',
      'Jag fortsätter med beslutsamhet; det här märket är mitt. 💪',
      'Jag fick del av morgonens välsignelse. 🌅',
      'Jag är en del av det här flödet som gör min själ gott. ✨',
      'Små steg ger stor frid. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'JAG HAR FÅTT ETT NYTT MÄRKE',
      hedef_tamamlandi: 'JAG HAR NÅTT MITT MÅL',
      seviye_atlandi: 'NY NIVÅ',
      toparlanma_tamamlandi: 'TILLBAKA PÅ BANAN',
      en_uzun_seri: 'NYTT REKORD',
      varsayilan: 'FRAMSTEG',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Må min Herre låta det bestå. 🤲', 'Små steg ger stor frid. 🍃', 'Må Allah ge oss alla ståndaktighet. 🌱'],
      hedef_tamamlandi: ['Små steg ger stor frid. 🍃', 'Må Allah låta det bestå. 🤲', 'Ett steg till varje dag. 🌱'],
      seviye_atlandi: [
        'Lite längre varje dag; må Allah göra det lätt. 🍃',
        'Må Allah låta det bestå. 🤲',
        'Resan fortsätter. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Det viktiga är inte att falla utan att resa sig. 🔄',
        'Må Allah ge ståndaktighet. 🤲',
        'Varje väg vandras med tålamod. 🌱',
      ],
      en_uzun_seri: [
        'Ett litet steg varje dag, en stor frid i mitt hjärta. 🍃',
        'Må Allah låta det bestå. 🤲',
        'Må min Herre ge oss alla ståndaktighet. 🌱',
      ],
    },
  },
};
