import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Na telefonie',
    telefonAciklama: 'Alarm na Fadżr i pobudka na Tahadżud dzwonią na telefonie.',
    saatBaslik: 'Na zegarku, po cichu',
    saatAciklama:
      'Wibruje tylko nadgarstek, więc osoba śpiąca obok się nie budzi. Jeśli nie wyłączysz alarmu na zegarku, telefon zadzwoni zapasowo {dk} minut później. Jeśli Namaz Akışı nie ma na zegarku lub nie jest aktualna, telefon będzie dzwonić co rano {dk} minut później.',
    saatAciklamaIos:
      'Wibruje tylko nadgarstek, więc osoba śpiąca obok się nie budzi. Jeśli nie wyłączysz alarmu na zegarku, iPhone zadzwoni zapasowo {dk} minut później.',
    ikisiBaslik: 'Na obu',
    ikisiAciklama: 'Zegarek i telefon dzwonią razem; wyłączenie na zegarku wycisza też telefon.',
    ikisiAciklamaIos: 'Zegarek i iPhone dzwonią razem; wyłączenie na zegarku wycisza też iPhone’a.',
  },
  anons: {
    otomatikBaslik: 'Na telefonie, na zegarku, gdy telefon jest daleko',
    otomatikAciklama:
      'Gdy telefon jest przy Tobie, czyta on, a zegarek celowo milczy (żeby oba urządzenia nie czytały tego samego zdania). Gdy telefon jest daleko, czyta zegarek.',
    saatBaslik: 'Tylko na zegarku',
    saatAciklama:
      'Zegarek zawsze czyta na głos, a telefon milczy. Gdy zegarek się ładuje, nie jest połączony z telefonem lub nie ma Namaz Akışı, nic nie jest czytane; jeśli tego nie chcesz, użyj pierwszej opcji.',
    telefonBaslik: 'Tylko na telefonie',
    telefonAciklama: 'Zegarek nigdy nie mówi.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Jeśli Namaz Akışı jest zainstalowana na Apple Watch, dzieli pracę z iPhone’em. Tutaj wybierasz, gdzie dzwoni pobudka.',
    giris:
      'Jeśli Namaz Akışı jest zainstalowana na zegarku, dzieli pracę z telefonem. Tutaj wybierasz, gdzie dzwoni pobudka i gdzie odczytywane są komunikaty.',
    uyandirmaBaslik: 'Gdzie ma dzwonić pobudka?',
    uyandirmaNotu:
      'Pobudka to prawdziwy alarm włączany dla Fadżr w przypomnieniu „Przed końcem czasu” oraz pobudka na Tahadżud włączana w modlitwach dobrowolnych.',
    uyandirmaNotuIos:
      'watchOS może ustawić cichy alarm tylko wtedy, gdy aplikacja na zegarku jest otwarta: otwórz Namaz Akışı na zegarku raz dziennie, a następna pobudka zostanie wtedy ustawiona. Gdy zegarek się ładuje lub aplikacja nie była otwarta, dzwoni zapasowo iPhone.',
    uyandirmaNotuAndroid: 'Zegarek nie dzwoni podczas ładowania; zamiast niego dzwoni telefon.',
    muhafizAyarlari: 'Otwórz ustawienia „Przed końcem czasu”',
    nafileAyarlari: 'Otwórz ustawienia modlitw dobrowolnych',
    bilektenBaslik: 'Co możesz zrobić z nadgarstka',
    bilektenIos: [
      'Gdy iPhone jest daleko, przypomnienia dzwonią na zegarku; nie dzwonią na obu naraz.',
      'Odprawione modlitwy oznaczasz z nadgarstka; iPhone je zapisuje.',
      'Liczysz tasbih koronką Digital Crown i znajdujesz kiblę na zegarku.',
    ],
    anonsBaslik: 'Gdzie odczytywać na głos?',
    anonsNotu:
      'Czytane są tylko przypomnienia z włączonym odczytem na głos. Dwa urządzenia nie czytają razem tego samego zdania. Zegarek milczy też, gdy jesteś w meczecie lub włączony jest Tryb modlitwy. Jeśli zegarek nie ma głośnika, syntezatora mowy lub głosu w języku aplikacji, tylko wibruje. Dźwięk zegarka możesz od razu sprawdzić przyciskiem „Test dźwięku” w aplikacji Namaz Akışı na zegarku.',
    bilekten: [
      'Tryb modlitwy włączasz i wyłączasz przyciskiem na zegarku (do końca czasu modlitwy, najwyżej 30 minut).',
      'W meczecie zegarek pokazuje stan; na pytania „To nie meczet” i „Czy jesteś w meczecie?” odpowiadasz z nadgarstka.',
      'Ekrany, które nie mieszczą się na zegarku (zaległe modlitwy, W meczecie, ustawienia), otwierają się na telefonie przyciskiem „Otwórz na telefonie”.',
    ],
    namazModuNotu: 'Aby włączać Tryb modlitwy z zegarka, najpierw włącz go raz na telefonie.',
    namazModuAyarlari: 'Otwórz ustawienia Trybu modlitwy',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Gdzie dzwoni pobudka',
    saatOzet: 'Gdzie dzwoni pobudka i odczyt na głos',
    canliEtkinlikler: 'Aktywności na żywo',
    canliSayaclar: 'Odliczanie na żywo',
    geriSayim: 'Odliczanie',
    gelismisErisim: 'Zaawansowane. Automatyzacje i aplikacje oznaczające „Odprawiono”',
    gelismis: 'Zaawansowane',
    otomasyonlar: 'Automatyzacje',
    otomasyonBaslik: 'Użyj z automatyzacjami',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Aplikacje oznaczające „Odprawiono”',
    kildimOzet: 'Aplikacje, którym dano zgodę',
  },
};
