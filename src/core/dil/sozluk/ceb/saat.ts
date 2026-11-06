import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Sa telepono',
    telefonAciklama: 'Ang alarm sa Fajr ug ang pagmata sa Tahajjud motingog sa inyong telepono.',
    saatBaslik: 'Sa relo, hilom',
    saatAciklama:
      'Ang inyong pulso lang ang mokurog, busa dili mapukaw ang natulog tupad ninyo. Kon dili ninyo kini isira sa relo, motingog ang inyong telepono isip reserba {dk} ka minuto human. Kon wala ang Namaz Akışı sa inyong relo o dili kini updated, motingog ang inyong telepono nga {dk} ka minuto nga ulahi matag buntag.',
    saatAciklamaIos:
      'Ang inyong pulso lang ang mokurog, busa dili mapukaw ang natulog tupad ninyo. Kon dili ninyo kini isira sa relo, motingog ang inyong iPhone isip reserba {dk} ka minuto human.',
    ikisiBaslik: 'Sa duha',
    ikisiAciklama: 'Dungan nga motingog ang relo ug telepono; ang pagsira sa relo mopahilom usab sa telepono.',
    ikisiAciklamaIos: 'Dungan nga motingog ang relo ug iPhone; ang pagsira sa relo mopahilom usab sa iPhone.',
  },
  anons: {
    otomatikBaslik: 'Sa telepono, sa relo kon layo ang telepono',
    otomatikAciklama:
      'Kon uban ninyo ang telepono, ang telepono ang mobasa og kusog ug tinuyo nga mohilom ang relo (aron dili parehas basahon sa duha ka device ang samang sentence). Kon layo ang telepono, ang relo ang mobasa og kusog.',
    saatBaslik: 'Sa relo lang',
    saatAciklama:
      'Kanunay mobasa og kusog ang inyong relo ug mohilom ang telepono. Samtang gi-charge ang relo, dili konektado sa telepono o walay Namaz Akışı, walay basahon og kusog; kon dili ninyo kana gusto, gamita ang unang kapilian.',
    telefonBaslik: 'Sa telepono lang',
    telefonAciklama: 'Dili gayod mosulti ang inyong relo.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Kon naka-install ang Namaz Akışı sa inyong Apple Watch, makig-ambit kini sa buluhaton uban sa iPhone. Dinhi ninyo pilion kung asa motingog ang pagmata.',
    giris:
      'Kon naka-install ang Namaz Akışı sa inyong relo, makig-ambit kini sa buluhaton uban sa telepono. Dinhi ninyo pilion kung asa motingog ang pagmata ug asa basahon og kusog ang mga anunsyo.',
    uyandirmaBaslik: 'Asa motingog ang pagmata?',
    uyandirmaNotu:
      'Ang pagmata mao ang tinuod nga alarm nga inyong gi-on alang sa Fajr sa pahinumdom nga "Una matapos ang oras" ug ang pagmata sa Tahajjud nga inyong gi-on sa Dugang nga Salah.',
    uyandirmaNotuIos:
      'Ang watchOS maka-set lang og hilom nga alarm samtang abli ang app sa relo: ablihi ang Namaz Akışı sa relo kausa matag adlaw ug ma-set ang sunod nga pagmata. Samtang gi-charge ang relo o kon wala maablihi ang app, ang reserba sa iPhone ang motingog.',
    uyandirmaNotuAndroid: 'Dili motingog ang relo samtang gi-charge; ang telepono ang motingog.',
    muhafizAyarlari: 'Ablihi ang mga setting sa "Una matapos ang oras"',
    nafileAyarlari: 'Ablihi ang mga setting sa Dugang nga Salah',
    bilektenBaslik: 'Unsay mahimo ninyo gikan sa pulso',
    bilektenIos: [
      'Kon layo ang iPhone, motingog ang mga pahinumdom sa relo; dili sila motingog sa duha.',
      'Markahan ninyo gikan sa pulso ang mga Salah nga inyong nahimo; ang iPhone ang morekord niini.',
      'Mag-ihap kamo og tasbih gamit ang Digital Crown ug pangitaon ang Qibla sa relo.',
    ],
    anonsBaslik: 'Asa mahitabo ang pagbasa og kusog?',
    anonsNotu:
      'Ang mga pahinumdom nga naka-on ang pagbasa og kusog lang ang basahon. Dili dungan nga basahon sa duha ka device ang samang sentence. Mohilom usab ang relo samtang anaa kamo sa masjid o naka-on ang Mode sa Salah. Kon walay speaker ang relo, walay text-to-speech o walay tingog sa pinulongan sa app, mokurog lang kini. Masulayan dayon ninyo ang tingog sa relo pinaagi sa "Sulayi ang tingog" sa Namaz Akışı nga app sa relo.',
    bilekten: [
      'Ma-on ug ma-off ninyo ang Mode sa Salah gamit ang buton sa relo (hangtod matapos ang oras sa Salah, labing dugay 30 ka minuto).',
      'Sa masjid, ipakita sa relo ang kahimtang; tubagon ninyo gikan sa pulso ang "Dili kini masjid" ug "Anaa ba kamo sa masjid?".',
      'Ang mga screen nga dili mohaom sa relo (Listahan sa qada, Anaa sa masjid, mga setting) maabli sa telepono pinaagi sa "Ablihi sa telepono".',
    ],
    namazModuNotu: 'Aron ma-on ang Mode sa Salah gikan sa relo, i-on una kini kausa sa telepono.',
    namazModuAyarlari: 'Ablihi ang mga setting sa Mode sa Salah',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Asa motingog ang pagmata',
    saatOzet: 'Asa motingog ang pagmata ug asa basahon og kusog',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Mga live nga countdown',
    geriSayim: 'Countdown',
    gelismisErisim: 'Abante. Mga automation ug app nga mumarka sa Nag-ampo ko',
    gelismis: 'Abante',
    otomasyonlar: 'Mga automation',
    otomasyonBaslik: 'Gamita sa mga automation',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Mga app nga mumarka sa Nag-ampo ko',
    kildimOzet: 'Mga app nga inyong gitugotan',
  },
};
