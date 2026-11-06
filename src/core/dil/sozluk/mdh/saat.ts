import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Sa telepono',
    telefonAciklama: 'Su alarm sa Subuh endu su kapabangun sa Tahajjud na pedtunog sa telepono nu.',
    saatBaslik: 'Sa relo, da suara',
    saatAciklama:
      'Su lima nu bu i pedkurug, na di mabangun su taw a pedtulug sa siken nu. Amayka di nu takepen sa relo, pedtunog su telepono nu sa {dk} minutu sa ulyan. Amayka da su Namaz Akışı sa relo nu atawka di pan bagu, pedtunog su telepono nu sa {dk} minutu a ulyan uman mapita.',
    saatAciklamaIos:
      'Su lima nu bu i pedkurug, na di mabangun su taw a pedtulug sa siken nu. Amayka di nu takepen sa relo, pedtunog su iPhone nu sa {dk} minutu sa ulyan.',
    ikisiBaslik: 'Sa dua',
    ikisiAciklama: 'Pedtunog su relo endu telepono sa isa a timpu; amayka takepen nu sa relo, matakep bun su telepono.',
    ikisiAciklamaIos: 'Pedtunog su relo endu iPhone sa isa a timpu; amayka takepen nu sa relo, matakep bun su iPhone.',
  },
  anons: {
    otomatikBaslik: 'Sa telepono, sa relo amayka mawatan su telepono',
    otomatikAciklama:
      'Amayka lu sa lekanu su telepono nu, su telepono i pedbatya endu di pedtalu su relo (para di batyan nu dua a device su isa bu a sulat). Amayka mawatan su telepono nu, su relo nu i pedbatya.',
    saatBaslik: 'Sa relo bu',
    saatAciklama:
      'Su relo nu i pedbatya uman timpu endu di pedtalu su telepono nu. Amayka pedcharge su relo, di nakakonekta sa telepono atawka da Namaz Akışı lun, da mabatya; amayka di nu kayugan, gamiten su paganay a pamilian.',
    telefonBaslik: 'Sa telepono bu',
    telefonAciklama: 'Di pedtalu su relo nu.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Amayka nakainstall su Namaz Akışı sa Apple Watch nu, pedtabangan nin su iPhone nu. Sya nu pamilin i endaw pedtunog su kapabangun.',
    giris:
      'Amayka nakainstall su Namaz Akışı sa relo nu, pedtabangan nin su telepono nu. Sya nu pamilin i endaw pedtunog su kapabangun endu endaw pedbatyan su manga pakatawan.',
    uyandirmaBaslik: 'Endaw pedtunog su kapabangun?',
    uyandirmaNotu:
      'Su kapabangun na su benal a alarm a i-on nu para sa Subuh sa patadem a "Sa di pan malipus su waktu" endu su kapabangun sa Tahajjud a i-on nu sa Manga sambayang a sunnat.',
    uyandirmaNotuIos:
      'Sa watchOS, makabetad bu sa alarm a da suara amayka nakabukat su app sa relo: bukatan su Namaz Akışı sa relo nu sa isa a timpu uman gay endu mabetad su kasunud a kapabangun. Amayka pedcharge su relo atawka da nabukatan su app, su iPhone nu i pedtunog.',
    uyandirmaNotuAndroid: 'Di pedtunog su relo nu amayka pedcharge; su telepono nu i pedtunog.',
    muhafizAyarlari: 'Bukatan su setting nu "Sa di pan malipus su waktu"',
    nafileAyarlari: 'Bukatan su setting nu manga sambayang a sunnat',
    bilektenBaslik: 'Su makagalebek nu sa lima nu',
    bilektenIos: [
      'Amayka mawatan su iPhone nu, sa relo nu pedtunog su manga patadem; di sya pedtunog sa dua.',
      'Tandaan nu sa lima nu su manga sambayang a nasambayang nu; i-record nu iPhone nu.',
      'Pedisapen nu su tasbih sa Digital Crown endu tuntayen nu su Qiblat sa relo nu.',
    ],
    anonsBaslik: 'Endaw su kabatya?',
    anonsNotu:
      'Su manga patadem bu a naka-on su kabatya i pedbatyan. Di batyan nu dua a device su isa bu a sulat. Di pedtalu bun su relo nu amayka lu kanu sa masjid atawka naka-on su Mode a sambayang. Amayka da speaker, text-to-speech atawka suara sa basa nu app su relo nu, pedkurug bu sya. Ma-test nu dayon su suara nu relo sa "Test the sound" sa app nu Namaz Akışı sa relo.',
    bilekten: [
      'Ma-on endu ma-off nu su Mode a sambayang sa button sa relo (taman sa kalipus nu waktu nu sambayang, 30 minutu bu i pinakamadakel).',
      'Sa masjid, pedpailay su relo nu sa kalagayan; pedsimbag kanu sa "Kena masjid ini" endu "Lu kanu ba sa masjid?" sa lima nu.',
      'Su manga screen a di masulud sa relo (Listahan nu qada, Sa masjid ako, manga setting) na pedbukat sa telepono nu sa "Bukatan sa telepono".',
    ],
    namazModuNotu: 'Para ma-on su Mode a sambayang ebpun sa relo, i-on pan sa isa a timpu sa telepono nu.',
    namazModuAyarlari: 'Bukatan su setting nu Mode a sambayang',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Endaw pedtunog su kapabangun',
    saatOzet: 'Endaw pedtunog su kapabangun endu su kabatya',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Live a countdown',
    geriSayim: 'Countdown',
    gelismisErisim: 'Advanced. Manga automation endu manga app a pedtanda sa Midsambayang ako',
    gelismis: 'Advanced',
    otomasyonlar: 'Manga automation',
    otomasyonBaslik: 'Gamiten sa automation',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Manga app a pedtanda sa Midsambayang ako',
    kildimOzet: 'Manga app a inenggan nu sa permiso',
  },
};
