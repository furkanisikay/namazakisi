import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'På telefonen',
    telefonAciklama: 'Fajr-alarmet och väckningen för Tahajjud ringer på din telefon.',
    saatBaslik: 'På klockan, tyst',
    saatAciklama:
      'Bara din handled vibrerar, så den som sover bredvid dig väcks inte. Om du inte stänger av den på klockan ringer din telefon som reserv {dk} minuter senare. Om Namaz Akışı inte finns på klockan eller inte är uppdaterad ringer telefonen {dk} minuter för sent varje morgon.',
    saatAciklamaIos:
      'Bara din handled vibrerar, så den som sover bredvid dig väcks inte. Om du inte stänger av den på klockan ringer din iPhone som reserv {dk} minuter senare.',
    ikisiBaslik: 'På båda',
    ikisiAciklama: 'Klockan och telefonen ringer samtidigt; när du stänger av den på klockan tystnar även telefonen.',
    ikisiAciklamaIos: 'Klockan och iPhone ringer samtidigt; när du stänger av den på klockan tystnar även iPhone.',
  },
  anons: {
    otomatikBaslik: 'På telefonen, på klockan när telefonen är borta',
    otomatikAciklama:
      'När telefonen är med dig läser telefonen upp och klockan är medvetet tyst (så att inte båda enheterna läser samma mening). När telefonen är borta läser klockan upp.',
    saatBaslik: 'Bara på klockan',
    saatAciklama:
      'Klockan läser alltid upp och telefonen är tyst. Medan klockan laddas, inte är ansluten till telefonen eller saknar Namaz Akışı läses ingenting upp; vill du inte det, använd det första alternativet.',
    telefonBaslik: 'Bara på telefonen',
    telefonAciklama: 'Klockan talar aldrig.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Om Namaz Akışı är installerad på din Apple Watch delar den arbetet med din iPhone. Här väljer du var väckningen ringer.',
    giris:
      'Om Namaz Akışı är installerad på din klocka delar den arbetet med din telefon. Här väljer du var väckningen ringer och var uppläsningar sker.',
    uyandirmaBaslik: 'Var ska väckningen ringa?',
    uyandirmaNotu:
      'Väckningen är det riktiga alarmet du slår på för Fajr i påminnelsen ”Innan tiden slutar” och väckningen för Tahajjud som du slår på i Frivilliga böner.',
    uyandirmaNotuIos:
      'watchOS kan bara ställa in ett tyst alarm medan klockappen är öppen: öppna Namaz Akışı på klockan en gång om dagen så ställs nästa väckning in då. Medan klockan laddas eller om appen inte öppnades ringer reserven på din iPhone.',
    uyandirmaNotuAndroid: 'Klockan ringer inte medan den laddas; telefonen ringer i stället.',
    muhafizAyarlari: 'Öppna inställningarna för ”Innan tiden slutar”',
    nafileAyarlari: 'Öppna inställningarna för frivilliga böner',
    bilektenBaslik: 'Det här kan du göra från handleden',
    bilektenIos: [
      'När din iPhone är borta ringer påminnelserna på klockan; de ringer inte på båda.',
      'Du markerar bönerna du har bett från handleden; din iPhone registrerar dem.',
      'Du räknar tasbih med Digital Crown och hittar Qibla på klockan.',
    ],
    anonsBaslik: 'Var ska uppläsningen ske?',
    anonsNotu:
      'Bara påminnelser med uppläsning påslagen läses upp. De två enheterna läser inte samma mening samtidigt. Klockan är också tyst medan du är i moskén eller Böneläge är på. Saknar klockan högtalare, talsyntes eller en röst på appens språk vibrerar den bara. Du kan testa klockans ljud direkt med ”Testa ljudet” i Namaz Akışı på klockan.',
    bilekten: [
      'Du kan slå på och av Böneläge med knappen på klockan (till slutet av bönetiden, högst 30 minuter).',
      'I moskén visar klockan statusen; du svarar på ”Det här är ingen moské” och ”Är du i moskén?” från handleden.',
      'Skärmar som inte får plats på klockan (Qada-logg, I moskén, inställningar) öppnas på telefonen med ”Öppna på telefonen”.',
    ],
    namazModuNotu: 'För att slå på Böneläge från klockan, slå först på det en gång på telefonen.',
    namazModuAyarlari: 'Öppna inställningarna för Böneläge',
  },
  sayfa: {
    akilliSaat: 'Smartklocka',
    appleWatchOzet: 'Var väckningen ringer',
    saatOzet: 'Var väckningen ringer och uppläsningen sker',
    canliEtkinlikler: 'Live-aktiviteter',
    canliSayaclar: 'Live-nedräkningar',
    geriSayim: 'Nedräkning',
    gelismisErisim: 'Avancerat. Automationer och appar som markerar Jag har bett',
    gelismis: 'Avancerat',
    otomasyonlar: 'Automationer',
    otomasyonBaslik: 'Använd med automationer',
    otomasyonOzet: 'Samsung Rutiner, Tasker, MacroDroid',
    kildimBaslik: 'Appar som markerar Jag har bett',
    kildimOzet: 'Appar som du har tillåtit',
  },
};
