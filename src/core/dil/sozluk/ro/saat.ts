import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Pe telefon',
    telefonAciklama: 'Alarma de Fajr și trezirea pentru Tahajjud sună pe telefon.',
    saatBaslik: 'Pe ceas, silențios',
    saatAciklama:
      'Vibrează doar încheietura, așa că cel care doarme alături nu se trezește. Dacă nu o opriți pe ceas, telefonul sună ca rezervă după {dk} minute. Dacă Namaz Akışı nu este pe ceas sau nu este actualizată, telefonul sună în fiecare dimineață cu {dk} minute întârziere.',
    saatAciklamaIos:
      'Vibrează doar încheietura, așa că cel care doarme alături nu se trezește. Dacă nu o opriți pe ceas, iPhone-ul sună ca rezervă după {dk} minute.',
    ikisiBaslik: 'Pe amândouă',
    ikisiAciklama: 'Ceasul și telefonul sună împreună; oprirea pe ceas oprește și telefonul.',
    ikisiAciklamaIos: 'Ceasul și iPhone-ul sună împreună; oprirea pe ceas oprește și iPhone-ul.',
  },
  anons: {
    otomatikBaslik: 'Pe telefon, pe ceas când telefonul e departe',
    otomatikAciklama:
      'Când telefonul este aproape, el citește cu voce tare, iar ceasul tace intenționat (ca să nu citească ambele dispozitive aceeași frază). Când telefonul este departe, citește ceasul.',
    saatBaslik: 'Doar pe ceas',
    saatAciklama:
      'Ceasul citește întotdeauna cu voce tare, iar telefonul tace. Cât timp ceasul se încarcă, nu este conectat la telefon sau nu are Namaz Akışı, nu se citește nimic; dacă nu doriți asta, folosiți prima opțiune.',
    telefonBaslik: 'Doar pe telefon',
    telefonAciklama: 'Ceasul nu vorbește niciodată.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Dacă Namaz Akışı este instalată pe Apple Watch, împarte sarcinile cu iPhone-ul. Aici alegeți unde sună trezirea.',
    giris:
      'Dacă Namaz Akışı este instalată pe ceas, împarte sarcinile cu telefonul. Aici alegeți unde sună trezirea și unde se citesc anunțurile cu voce tare.',
    uyandirmaBaslik: 'Unde să sune trezirea?',
    uyandirmaNotu:
      'Trezirea este alarma reală pe care o activați pentru Fajr în mementoul „Înainte de sfârșitul timpului” și trezirea pentru Tahajjud pe care o activați în Rugăciuni voluntare.',
    uyandirmaNotuIos:
      'watchOS poate seta o alarmă silențioasă doar cât aplicația de pe ceas este deschisă: deschideți Namaz Akışı pe ceas o dată pe zi și atunci se setează următoarea trezire. Cât ceasul se încarcă sau dacă aplicația nu a fost deschisă, sună rezerva de pe iPhone.',
    uyandirmaNotuAndroid: 'Ceasul nu sună în timpul încărcării; sună telefonul în locul lui.',
    muhafizAyarlari: 'Deschideți setările „Înainte de sfârșitul timpului”',
    nafileAyarlari: 'Deschideți setările Rugăciunilor voluntare',
    bilektenBaslik: 'Ce puteți face de la încheietură',
    bilektenIos: [
      'Când iPhone-ul este departe, mementourile sună pe ceas; nu sună pe amândouă.',
      'Marcați de la încheietură rugăciunile efectuate; iPhone-ul le înregistrează.',
      'Numărați tasbih cu Digital Crown și găsiți Qibla pe ceas.',
    ],
    anonsBaslik: 'Unde să se facă citirea cu voce tare?',
    anonsNotu:
      'Se citesc doar mementourile cu citirea cu voce tare activată. Cele două dispozitive nu citesc aceeași frază împreună. Ceasul tace și cât sunteți la moschee sau când Modul rugăciune este activat. Dacă ceasul nu are difuzor, motor de sinteză vocală sau o voce în limba aplicației, doar vibrează. Puteți testa imediat sunetul ceasului cu „Testați sunetul” în aplicația Namaz Akışı de pe ceas.',
    bilekten: [
      'Puteți activa și dezactiva Modul rugăciune cu butonul de pe ceas (până la sfârșitul timpului rugăciunii, cel mult 30 de minute).',
      'La moschee, ceasul arată starea; răspundeți de la încheietură la „Aici nu e o moschee” și „Sunteți la moschee?”.',
      'Ecranele care nu încap pe ceas (Registrul de recuperare, La moschee, setările) se deschid pe telefon cu „Deschideți pe telefon”.',
    ],
    namazModuNotu: 'Pentru a activa Modul rugăciune de pe ceas, activați-l mai întâi o dată pe telefon.',
    namazModuAyarlari: 'Deschideți setările Modului rugăciune',
  },
  sayfa: {
    akilliSaat: 'Ceas inteligent',
    appleWatchOzet: 'Unde sună trezirea',
    saatOzet: 'Unde sună trezirea și unde se citește cu voce tare',
    canliEtkinlikler: 'Activități live',
    canliSayaclar: 'Numărători live',
    geriSayim: 'Numărătoare inversă',
    gelismisErisim: 'Avansat. Automatizări și aplicații care marchează M-am rugat',
    gelismis: 'Avansat',
    otomasyonlar: 'Automatizări',
    otomasyonBaslik: 'Folosire cu automatizări',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Aplicații care marchează M-am rugat',
    kildimOzet: 'Aplicațiile permise',
  },
};
