import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Na telefonu',
    telefonAciklama: 'Alarm za sabah i buđenje za tehedžud oglašavaju se na vašem telefonu.',
    saatBaslik: 'Na satu, nečujno',
    saatAciklama:
      'Vibrira samo vaše zapešće, pa se onaj tko spava pokraj vas ne budi. Ako ga ne odbacite na satu, vaš se telefon {dk} minuta kasnije oglašava kao pričuva. Ako Namaz Akışı nije na vašem satu ili nije ažuran, vaš se telefon svakog jutra oglašava {dk} minuta kasnije.',
    saatAciklamaIos:
      'Vibrira samo vaše zapešće, pa se onaj tko spava pokraj vas ne budi. Ako ga ne odbacite na satu, vaš se iPhone {dk} minuta kasnije oglašava kao pričuva.',
    ikisiBaslik: 'Na oba',
    ikisiAciklama: 'Sat i telefon oglašavaju se zajedno; odbacivanje na satu utišava i telefon.',
    ikisiAciklamaIos: 'Sat i iPhone oglašavaju se zajedno; odbacivanje na satu utišava i iPhone.',
  },
  anons: {
    otomatikBaslik: 'Na telefonu, na satu kad telefon nije uz vas',
    otomatikAciklama:
      'Kad je telefon uz vas, telefon čita naglas, a sat namjerno šuti (da oba uređaja ne čitaju istu rečenicu). Kad telefon nije uz vas, naglas čita sat.',
    saatBaslik: 'Samo na satu',
    saatAciklama:
      'Sat uvijek čita naglas, a telefon šuti. Dok se sat puni, nije povezan s telefonom ili nema Namaz Akışı, ništa se ne čita naglas; ako to ne želite, upotrijebite prvu mogućnost.',
    telefonBaslik: 'Samo na telefonu',
    telefonAciklama: 'Vaš sat nikad ne govori.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Ako je Namaz Akışı instaliran na vašem Apple Watchu, dijeli posao s vašim iPhoneom. Ovdje birate gdje se oglašava buđenje.',
    giris:
      'Ako je Namaz Akışı instaliran na vašem satu, dijeli posao s vašim telefonom. Ovdje birate gdje se oglašava buđenje i gdje se obavijesti čitaju naglas.',
    uyandirmaBaslik: 'Gdje bi se buđenje trebalo oglasiti?',
    uyandirmaNotu:
      'Buđenje je pravi alarm koji uključujete za sabah u podsjetniku „Prije isteka vremena“ i buđenje za tehedžud koje uključujete u Nafila-namazima.',
    uyandirmaNotuIos:
      'watchOS može postaviti nečujni alarm samo dok je aplikacija na satu otvorena: otvorite Namaz Akışı na satu jednom dnevno i tada se postavlja sljedeće buđenje. Dok se sat puni ili ako aplikacija nije otvorena, oglašava se pričuva na iPhoneu.',
    uyandirmaNotuAndroid: 'Vaš se sat ne oglašava dok se puni; umjesto njega oglašava se telefon.',
    muhafizAyarlari: 'Otvorite postavke „Prije isteka vremena“',
    nafileAyarlari: 'Otvorite postavke nafila-namaza',
    bilektenBaslik: 'Što možete učiniti sa zapešća',
    bilektenIos: [
      'Kad iPhone nije uz vas, podsjetnici se oglašavaju na satu; ne oglašavaju se na oba.',
      'Namaze koje ste klanjali označavate sa zapešća; vaš ih iPhone bilježi.',
      'Tesbih brojite krunom Digital Crown, a kiblu pronalazite na satu.',
    ],
    anonsBaslik: 'Gdje bi se trebalo čitati naglas?',
    anonsNotu:
      'Čitaju se samo podsjetnici s uključenim čitanjem naglas. Dva uređaja ne čitaju istu rečenicu zajedno. Vaš sat šuti i dok ste u džamiji ili je uključen način za namaz. Ako sat nema zvučnik, mehanizam za pretvaranje teksta u govor ili glas na jeziku aplikacije, samo vibrira. Zvuk sata možete odmah isprobati putem „Isprobajte zvuk“ u aplikaciji Namaz Akışı na satu.',
    bilekten: [
      'Način za namaz možete uključiti i isključiti gumbom na satu (do kraja vremena namaza, najviše 30 minuta).',
      'U džamiji vaš sat prikazuje stanje; na „Ovo nije džamija“ i „Jeste li u džamiji?“ odgovarate sa zapešća.',
      'Zasloni koji ne stanu na sat (evidencija kada-namaza, U džamiji, postavke) otvaraju se na telefonu putem „Otvori na telefonu“.',
    ],
    namazModuNotu: 'Da biste način za namaz uključivali sa sata, najprije ga jednom uključite na telefonu.',
    namazModuAyarlari: 'Otvorite postavke načina za namaz',
  },
  sayfa: {
    akilliSaat: 'Pametni sat',
    appleWatchOzet: 'Gdje se oglašava buđenje',
    saatOzet: 'Gdje se oglašava buđenje i čita naglas',
    canliEtkinlikler: 'Aktivnosti uživo',
    canliSayaclar: 'Odbrojavanja uživo',
    geriSayim: 'Odbrojavanje',
    gelismisErisim: 'Napredno. Automatizacije i aplikacije koje označavaju „Klanjano“',
    gelismis: 'Napredno',
    otomasyonlar: 'Automatizacije',
    otomasyonBaslik: 'Automatizacije',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Aplikacije koje označavaju „Klanjano“',
    kildimOzet: 'Aplikacije kojima ste dopustili',
  },
};
