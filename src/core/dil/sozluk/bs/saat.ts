import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Na telefonu',
    telefonAciklama: 'Alarm za zoru i buđenje za tehedžud zvone na Vašem telefonu.',
    saatBaslik: 'Na satu, nečujno',
    saatAciklama:
      'Vibrira samo Vaš ručni zglob, pa se onaj ko spava pored Vas ne budi. Ako ga ne ugasite na satu, telefon će kao rezerva zazvoniti {dk} min kasnije. Ako Namaz Akışı nije na Vašem satu ili nije ažuriran, telefon će svako jutro zvoniti {dk} min kasnije.',
    saatAciklamaIos:
      'Vibrira samo Vaš ručni zglob, pa se onaj ko spava pored Vas ne budi. Ako ga ne ugasite na satu, iPhone će kao rezerva zazvoniti {dk} min kasnije.',
    ikisiBaslik: 'Na oba',
    ikisiAciklama: 'Sat i telefon zvone istovremeno; gašenje na satu utišava i telefon.',
    ikisiAciklamaIos: 'Sat i iPhone zvone istovremeno; gašenje na satu utišava i iPhone.',
  },
  anons: {
    otomatikBaslik: 'Na telefonu, na satu kada je telefon daleko',
    otomatikAciklama:
      'Kada je telefon kod Vas, čita telefon, a sat namjerno šuti (da oba uređaja ne čitaju istu rečenicu). Kada je telefon daleko, čita sat.',
    saatBaslik: 'Samo na satu',
    saatAciklama:
      'Čitanje naglas uvijek obavlja sat, a telefon šuti. Dok se sat puni, dok nije povezan s telefonom ili ako na satu nema aplikacije Namaz Akışı, ništa se ne čita naglas; ako to ne želite, koristite prvu opciju.',
    telefonBaslik: 'Samo na telefonu',
    telefonAciklama: 'Vaš sat nikada ne govori.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Ako je Namaz Akışı instaliran na Vašem Apple Watchu, dijeli posao s Vašim iPhoneom. Ovdje birate gdje zvoni buđenje.',
    giris:
      'Ako je Namaz Akışı instaliran na Vašem satu, dijeli posao s Vašim telefonom. Ovdje birate gdje zvoni buđenje i gdje se čitaju obavještenja naglas.',
    uyandirmaBaslik: 'Gdje da zvoni buđenje?',
    uyandirmaNotu:
      'Buđenje je pravi alarm koji uključite za zoru u podsjetniku „Prije isteka vakta” i buđenje za tehedžud koje uključite u Nafila-namazima.',
    uyandirmaNotuIos:
      'watchOS može postaviti nečujni alarm samo dok je aplikacija na satu otvorena: otvorite Namaz Akışı na satu jednom dnevno i tada se postavlja sljedeće buđenje. Dok se sat puni ili ako aplikacija nije otvorena, zvoni rezerva na iPhoneu.',
    uyandirmaNotuAndroid: 'Sat ne zvoni dok se puni; tada zvoni telefon.',
    muhafizAyarlari: 'Otvorite postavke „Prije isteka vakta”',
    nafileAyarlari: 'Otvorite postavke nafila-namaza',
    bilektenBaslik: 'Šta možete uraditi sa zgloba',
    bilektenIos: [
      'Kada je iPhone daleko, podsjetnici zvone na satu; ne zvone na oba.',
      'Klanjane namaze označavate sa zgloba; iPhone ih bilježi.',
      'Tesbih brojite pomoću Digital Crowna, a kiblu pronalazite na satu.',
    ],
    anonsBaslik: 'Gdje da se čita naglas?',
    anonsNotu:
      'Čitaju se samo podsjetnici s uključenim čitanjem naglas. Dva uređaja ne čitaju istu rečenicu zajedno. Sat šuti i dok ste u džamiji ili dok je uključen Režim namaza. Ako sat nema zvučnik, sistem za čitanje teksta ili glas na jeziku aplikacije, samo vibrira. Zvuk sata možete odmah isprobati opcijom „Isprobajte zvuk” u aplikaciji Namaz Akışı na satu.',
    bilekten: [
      'Režim namaza možete uključiti i isključiti dugmetom na satu (do kraja vakta, najviše 30 minuta).',
      'U džamiji sat prikazuje stanje; na pitanja „Ovo nije džamija” i „Jeste li u džamiji?” odgovarate sa zgloba.',
      'Ekrane koji ne stanu na sat (Evidencija kada-namaza, U džamiji, postavke) otvarate na telefonu opcijom „Otvorite na telefonu”.',
    ],
    namazModuNotu: 'Da biste Režim namaza uključivali sa sata, prvo ga jednom uključite na telefonu.',
    namazModuAyarlari: 'Otvorite postavke Režima namaza',
  },
  sayfa: {
    akilliSaat: 'Pametni sat',
    appleWatchOzet: 'Gdje zvoni buđenje',
    saatOzet: 'Gdje zvoni buđenje i gdje se čita naglas',
    canliEtkinlikler: 'Aktivnosti uživo',
    canliSayaclar: 'Odbrojavanja uživo',
    geriSayim: 'Odbrojavanje',
    gelismisErisim: 'Napredno. Automatizacije i aplikacije koje označavaju klanjano',
    gelismis: 'Napredno',
    otomasyonlar: 'Automatizacije',
    otomasyonBaslik: 'Koristite s automatizacijama',
    otomasyonOzet: 'Samsung Rutine, Tasker, MacroDroid',
    kildimBaslik: 'Aplikacije koje označavaju klanjano',
    kildimOzet: 'Aplikacije kojima ste dali dozvolu',
  },
};
