import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Kullanıcıya dönük 2. ve 1. tekil geçmiş zaman Lehçede cinsiyetlidir ("ukończyłeś/-łaś",
 * "zdobyłem/-łam"): kişisiz ya da isim kalıbıyla yazılır. Övgü ve "!" yok.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Seria trwa',
    enUzun: cogul({
      one: 'Najdłuższa seria: {n} dzień',
      few: 'Najdłuższa seria: {n} dni',
      many: 'Najdłuższa seria: {n} dni',
      other: 'Najdłuższa seria: {n} dnia',
    }),
    gunBuyuk: cogul({ one: 'DZIEŃ', few: 'DNI', many: 'DNI', other: 'DNIA' }),
    sonrakiHedef: 'Następny cel: dzień {hedef} ({durum})',
    kalanGun: cogul({ one: 'Został {n} dzień', few: 'Zostały {n} dni', many: 'Zostało {n} dni', other: 'Zostało {n} dnia' }),
    tamamlandi: 'Ukończono',
    paylasErisim: 'Udostępnij postępy',
    paylasBuyuk: 'UDOSTĘPNIJ POSTĘPY',
  },

  hedefler: {
    ilk_adim: { ad: 'Pierwszy tydzień', aciklama: 'Modlitwa przez 7 dni bez przerwy', cumle: 'Pierwszy tydzień' },
    aliskanlik_ustasi: { ad: 'Mistrz nawyku', aciklama: '21 dni - okres budowania nawyku', cumle: 'Mistrz nawyku' },
    kararlilik: { ad: 'Wytrwałość', aciklama: '60 dni bez przerwy', cumle: 'Wytrwałość' },
    efsane: { ad: 'Legenda', aciklama: '90 dni - wyjątkowa wytrwałość', cumle: 'Legenda' },
  },

  /** Klasyczne nazwy stopni, w transliteracji (nie tłumaczone). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Pierwszy krok', aciklama: 'Pierwszy tydzień ukończony', kosul: 'Seria 7 dni' },
    aliskanlik_ustasi: {
      ad: 'Mistrz nawyku',
      aciklama: '21 dni - okres budowania nawyku ukończony',
      kosul: 'Seria 21 dni',
    },
    kararlilik: { ad: 'Wytrwały krok', aciklama: '60 dni modlitwy bez przerwy', kosul: 'Seria 60 dni' },
    efsane: { ad: 'Legenda', aciklama: '90 dni - wyjątkowa wytrwałość', kosul: 'Seria 90 dni' },
    toparlanma_ustasi: {
      ad: 'Mistrz powrotu',
      aciklama: 'Tryb powrotu ukończony 3 razy',
      kosul: '3 powroty',
    },
    mukemmeliyetci: { ad: 'Perfekcjonista', aciklama: '5/5 modlitw przez 30 dni', kosul: '30 dni z 5/5 modlitw' },
    yuz_namaz: { ad: '100 modlitw', aciklama: 'Łącznie 100 odprawionych modlitw', kosul: 'Odpraw 100 modlitw' },
    bin_namaz: { ad: '1000 modlitw', aciklama: 'Łącznie 1000 odprawionych modlitw', kosul: 'Odpraw 1000 modlitw' },
  },

  rozetSeviyeleri: { bronz: 'BRĄZ', gumus: 'SREBRO', altin: 'ZŁOTO', elmas: 'DIAMENT' },

  gunBitis: {
    erken: 'Dla wcześnie zasypiających',
    varsayilan: 'Domyślnie - w większości miejsc przed Fadżr',
    gec: 'Dla późno zasypiających',
  },

  kutlama: {
    rozetEklendi: '🏅 Dodano do kolekcji odznak',
    paylasin: 'Udostępnij',
    rozetBaslik: 'Niech Allah uczyni to trwałym',
    rozetMesaj: 'Zdobyta odznaka: „{ad}”.',
    hedefBaslik: cogul({ one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' }),
    hedefMesaj: 'Cel „{ad}” osiągnięty. Niech Allah uczyni to trwałym.',
    yeniRank: 'Nowy stopień: {rank}',
    seviyeBaslik: 'Nowy poziom',
    seviyeMesaj: 'Teraz dalej jako „{rank}”. Niech Allah uczyni to trwałym.',
    toparlanmaBaslik: 'Seria wróciła',
    toparlanmaMesaj: cogul({
      one: 'Seria {n}-dniowa trwa dalej od miejsca przerwania. Niech Allah da wytrwałość.',
      few: 'Seria {n}-dniowa trwa dalej od miejsca przerwania. Niech Allah da wytrwałość.',
      many: 'Seria {n}-dniowa trwa dalej od miejsca przerwania. Niech Allah da wytrwałość.',
      other: 'Seria {n}-dniowa trwa dalej od miejsca przerwania. Niech Allah da wytrwałość.',
    }),
    enUzunBaslik: 'Najdłuższa seria',
    enUzunMesaj: cogul({
      one: '{n} dzień: najdłuższa seria do tej pory. Niech Allah uczyni to trwałym.',
      few: '{n} dni: najdłuższa seria do tej pory. Niech Allah uczyni to trwałym.',
      many: '{n} dni: najdłuższa seria do tej pory. Niech Allah uczyni to trwałym.',
      other: '{n} dnia: najdłuższa seria do tej pory. Niech Allah uczyni to trwałym.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Nie udało się teraz odczytać wcześniejszych zapisów.',
    yenidenErisim: 'Ponów wczytywanie danych serii',
    yenidenDeneyin: 'Spróbuj ponownie',
    yukleniyor: 'Wczytywanie danych serii...',
    gunlukSeri: 'dni serii',
    rekor: 'rekord',
    sozErisim: '{metin} Źródło: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Następny cel',
    tumu: 'Wszystkie odznaki zdobyte',
    kalan: cogul({
      one: 'Odznaka {ad}: został {n} dzień',
      few: 'Odznaka {ad}: zostały {n} dni',
      many: 'Odznaka {ad}: zostało {n} dni',
      other: 'Odznaka {ad}: zostało {n} dnia',
    }),
    tumuErisim: 'Wszystkie odznaki zdobyte: tasbih jest pełny.',
    erisim: 'Odznaka {ad}: ukończono {n} z {hedef} dni.',
  },

  gok: {
    gunHarfleri: ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({
      one: '{n} dzień z osiągniętym celem',
      few: '{n} dni z osiągniętym celem',
      many: '{n} dni z osiągniętym celem',
      other: '{n} dnia z osiągniętym celem',
    }),
    besVakit: cogul({
      one: '{n} dzień ze wszystkimi pięcioma modlitwami',
      few: '{n} dni ze wszystkimi pięcioma modlitwami',
      many: '{n} dni ze wszystkimi pięcioma modlitwami',
      other: '{n} dnia ze wszystkimi pięcioma modlitwami',
    }),
    dondurulmus: cogul({ one: '{n} dzień zamrożony', few: '{n} dni zamrożone', many: '{n} dni zamrożonych', other: '{n} dnia zamrożonego' }),
    mevcutSeri: cogul({
      one: 'Obecna seria: {n} dzień.',
      few: 'Obecna seria: {n} dni.',
      many: 'Obecna seria: {n} dni.',
      other: 'Obecna seria: {n} dnia.',
    }),
  },

  hedefAyar: {
    azalt: 'Zmniejsz',
    deger: 'Wartość',
    artir: 'Zwiększ',
    esik: cogul({ one: '{n} modlitwa', few: '{n} modlitwy', many: '{n} modlitw', other: '{n} modlitwy' }),
    sifirlaBaslik: 'Wyzeruj serię',
    sifirlaMesaj: 'Wszystkie dane serii (seria, odznaki, punkty) zostaną wyzerowane. Tego nie można cofnąć. Kontynuować?',
    sifirla: 'Wyzeruj',
    iptal: 'Anuluj',
    basarili: 'Gotowe',
    sifirlandi: 'Dane serii zostały wyzerowane.',
    hedefAyarlari: 'USTAWIENIA CELU',
    tamGunEsigi: 'Próg pełnego dnia',
    tamGunAciklama: 'Określa najmniejszą liczbę modlitw dziennie, przy której dzień liczy się do serii',
    sifirlama: 'ZEROWANIE',
    verileriSifirla: 'Wyzeruj dane serii',
    verileriSifirlaAlt: 'Usuwa wszystkie dane serii, odznak i punktów',
  },

  rozetKarti: {
    erisim: 'Odznaka {ad}, {durum}',
    kazanildi: 'zdobyta',
    kilitli: 'zablokowana',
  },

  toparlanma: {
    kartBaslik: 'TRYB POWROTU',
    kartAltBaslik: 'Serię można odzyskać',
    kartMesaj: 'Możesz kontynuować {vurgu} serię od miejsca przerwania.',
    oncekiGun: cogul({ one: '{n}-dniową', few: '{n}-dniową', many: '{n}-dniową', other: '{n}-dniową' }),
    ilerleme: 'Ukończono {tamam}/{hedef} dni',
    kalan: cogul({
      one: 'Odpraw wszystkie pięć modlitw jeszcze przez {n} dzień, a seria będzie trwać od miejsca przerwania.',
      few: 'Odpraw wszystkie pięć modlitw jeszcze przez {n} dni, a seria będzie trwać od miejsca przerwania.',
      many: 'Odpraw wszystkie pięć modlitw jeszcze przez {n} dni, a seria będzie trwać od miejsca przerwania.',
      other: 'Odpraw wszystkie pięć modlitw jeszcze przez {n} dnia, a seria będzie trwać od miejsca przerwania.',
    }),
    bugun: 'Dokończ dzisiejszy dzień, a seria będzie trwać od miejsca przerwania.',
    uyari: 'Dni muszą następować po sobie; jeśli w międzyczasie zabraknie dnia, powrót zaczyna się od nowa.',
    kapatErisim: 'Zamknij szczegóły powrotu',
    anladim: 'Rozumiem',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Udostępnij postępy',
    hazirDegilBaslik: 'Obraz nie jest gotowy',
    hazirDegilMesaj: 'Obraz nie jest jeszcze gotowy. Spróbuj ponownie za kilka sekund.',
    olusturulamadiBaslik: 'Nie udało się utworzyć obrazu',
    olusturulamadiMesaj: 'Podczas tworzenia obrazu coś poszło nie tak. Spróbuj ponownie.',
    kullanilamiyorBaslik: 'Udostępnianie niedostępne',
    kullanilamiyorMesaj: 'Udostępnianie jest niedostępne na tym urządzeniu.',
    kapat: 'Zamknij',
    hikaye: 'Dodaj do relacji',
    platformlar: 'Można udostępnić na Instagramie, WhatsAppie i nie tylko.',
    tamam: 'OK',
    seriEnUzun: cogul({
      one: 'Moja najdłuższa seria: {n} dzień',
      few: 'Moja najdłuższa seria: {n} dni',
      many: 'Moja najdłuższa seria: {n} dni',
      other: 'Moja najdłuższa seria: {n} dnia',
    }),
    seriZincir: cogul({
      one: 'DZIEŃ BEZ PRZERWANIA ŁAŃCUCHA',
      few: 'DNI BEZ PRZERWANIA ŁAŃCUCHA',
      many: 'DNI BEZ PRZERWANIA ŁAŃCUCHA',
      other: 'DNIA BEZ PRZERWANIA ŁAŃCUCHA',
    }),
    seriSoz: '„Każdego dnia mały krok, w duszy wielki spokój. 🔥”',
    rozetYeni: 'NOWA ODZNAKA',
    rozetSozleri: [
      'Dziś dobry krok dla siebie. 🌟',
      'Idę dalej z determinacją; ta odznaka jest moja. 💪',
      'Poranne błogosławieństwo złapane. 🌅',
      'Jestem częścią nurtu, który dobrze robi duszy. ✨',
      'Małe kroki przynoszą wielki spokój. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NOWA ODZNAKA',
      hedef_tamamlandi: 'CEL OSIĄGNIĘTY',
      seviye_atlandi: 'NOWY POZIOM',
      toparlanma_tamamlandi: 'ZNÓW NA DRODZE',
      en_uzun_seri: 'NOWY REKORD',
      varsayilan: 'OSIĄGNIĘCIE',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Niech mój Pan uczyni to trwałym. 🤲', 'Małe kroki przynoszą wielki spokój. 🍃', 'Niech Allah da nam wszystkim wytrwałość. 🌱'],
      hedef_tamamlandi: ['Małe kroki przynoszą wielki spokój. 🍃', 'Niech Allah uczyni to trwałym. 🤲', 'Każdego dnia o krok dalej. 🌱'],
      seviye_atlandi: [
        'Każdego dnia trochę dalej; niech Allah to ułatwi. 🍃',
        'Niech Allah uczyni to trwałym. 🤲',
        'Droga trwa. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Liczy się nie upadek, lecz powstanie. 🔄',
        'Niech Allah da wytrwałość. 🤲',
        'Każdą drogę przechodzi się cierpliwie. 🌱',
      ],
      en_uzun_seri: [
        'Każdego dnia mały krok, w sercu wielki spokój. 🍃',
        'Niech Allah uczyni to trwałym. 🤲',
        'Niech mój Pan da nam wszystkim wytrwałość. 🌱',
      ],
    },
  },
};
