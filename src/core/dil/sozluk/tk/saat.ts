import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Telefonda',
    telefonAciklama: 'Ertir budilnigi we tehejjüd oýarmasy telefonyňyzda jyňňyrdaýar.',
    saatBaslik: 'Sagatda, sessiz',
    saatAciklama:
      'Diňe bilegiňiz titreýär, şonuň üçin ýanyňyzda ýatan adam oýanmaýar. Sagatda öçürmeseňiz, telefonyňyz {dk} minutdan ätiýaç hökmünde jyňňyrdaýar. Namaz Akışı sagadyňyzda ýok bolsa ýa-da täzelenmedik bolsa, telefonyňyz her irden {dk} minut gijä galyp jyňňyrdaýar.',
    saatAciklamaIos:
      'Diňe bilegiňiz titreýär, şonuň üçin ýanyňyzda ýatan adam oýanmaýar. Sagatda öçürmeseňiz, iPhone-yňyz {dk} minutdan ätiýaç hökmünde jyňňyrdaýar.',
    ikisiBaslik: 'Ikisinde hem',
    ikisiAciklama: 'Sagat we telefon bilelikde jyňňyrdaýar; sagatda öçürmek telefony hem sessizleşdirýär.',
    ikisiAciklamaIos: 'Sagat we iPhone bilelikde jyňňyrdaýar; sagatda öçürmek iPhone-y hem sessizleşdirýär.',
  },
  anons: {
    otomatikBaslik: 'Telefonda, ol uzakda bolsa sagatda',
    otomatikAciklama:
      'Telefonyňyz ýanyňyzda bolanda, telefonyňyz sesli okaýar we sagadyňyz bilkastlaýyn sessiz galýar (iki enjam şol bir sözlemi okamaz ýaly). Telefonyňyz uzakda bolanda, sagadyňyz sesli okaýar.',
    saatBaslik: 'Diňe sagatda',
    saatAciklama:
      'Sagadyňyz hemişe sesli okaýar, telefonyňyz sessiz galýar. Sagadyňyz zarýad alýarka, telefonyňyza birikmedik bolsa ýa-da onda Namaz Akışı ýok bolsa, hiç zat sesli okalmaýar; muny islemeseňiz, birinji saýlawy ulanyň.',
    telefonBaslik: 'Diňe telefonda',
    telefonAciklama: 'Sagadyňyz hiç haçan gürlemeýär.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Namaz Akışı Apple Watch-yňyzda gurnalan bolsa, ol işi iPhone-yňyz bilen paýlaşýar. Bu ýerde oýarmanyň nirede jyňňyrdajakdygyny saýlaýarsyňyz.',
    giris:
      'Namaz Akışı sagadyňyzda gurnalan bolsa, ol işi telefonyňyz bilen paýlaşýar. Bu ýerde oýarmanyň nirede jyňňyrdajakdygyny we bildirişleriň nirede sesli okaljakdygyny saýlaýarsyňyz.',
    uyandirmaBaslik: 'Oýarma nirede jyňňyrdasyn?',
    uyandirmaNotu:
      'Oýarma — "Wagt çykmazdan öň" ýatlatmasynda ertir üçin açan hakyky budilnigiňiz we Nafile namazlarda açan tehejjüd oýarmaňyzdyr.',
    uyandirmaNotuIos:
      'watchOS sessiz budilnigi diňe sagat programmasy açyk wagty goýup bilýär: Namaz Akışı-ny sagadyňyzda günde bir gezek açyň, indiki oýarma şonda goýulýar. Sagat zarýad alýarka ýa-da programma açylmadyk bolsa, iPhone-yňyzyň ätiýaç budilnigi jyňňyrdaýar.',
    uyandirmaNotuAndroid: 'Sagadyňyz zarýad alýarka jyňňyrdamaýar; onuň ýerine telefonyňyz jyňňyrdaýar.',
    muhafizAyarlari: '"Wagt çykmazdan öň" sazlamalaryny açyň',
    nafileAyarlari: 'Nafile namaz sazlamalaryny açyň',
    bilektenBaslik: 'Bilegiňizden näme edip bilersiňiz',
    bilektenIos: [
      'iPhone-yňyz uzakda bolanda, ýatlatmalar sagadyňyzda jyňňyrdaýar; ikisinde birden jyňňyrdamaýar.',
      'Okan namazlaryňyzy bilegiňizden belleýärsiňiz; iPhone-yňyz olary ýazga alýar.',
      'Digital Crown bilen tesbih sanaýarsyňyz we kyblany sagadyňyzda tapýarsyňyz.',
    ],
    anonsBaslik: 'Sesli okamak nirede bolsun?',
    anonsNotu:
      'Diňe sesli okamak açyk ýatlatmalar okalýar. Iki enjam şol bir sözlemi bilelikde okamaýar. Metjitde bolanyňyzda ýa-da Namaz tertibi açyk wagty sagadyňyz hem sessiz galýar. Sagadyňyzda dinamik, sesli okamak hereketlendirijisi ýa-da programmanyň dilinde ses ýok bolsa, ol diňe titreýär. Sagadyň sesini Namaz Akışı sagat programmasyndaky "Sesi barlaň" bilen derrew barlap bilersiňiz.',
    bilekten: [
      'Namaz tertibini sagatdaky düwme bilen açyp-öçürip bilersiňiz (namaz wagtynyň ahyryna çenli, iň köp 30 minut).',
      'Metjitde sagadyňyz ýagdaýy görkezýär; "Bu metjit däl" we "Metjitdemisiňiz?" soraglaryna bilegiňizden jogap berýärsiňiz.',
      'Sagada sygmaýan ekranlar (Kaza depderi, Metjitdemen, sazlamalar) "Telefonda açyň" bilen telefonyňyzda açylýar.',
    ],
    namazModuNotu: 'Namaz tertibini sagatdan açmak üçin ilki ony telefonyňyzda bir gezek açyň.',
    namazModuAyarlari: 'Namaz tertibi sazlamalaryny açyň',
  },
  sayfa: {
    akilliSaat: 'Akylly sagat',
    appleWatchOzet: 'Oýarmanyň jyňňyrdaýan ýeri',
    saatOzet: 'Oýarmanyň jyňňyrdaýan we sesli okaýan ýeri',
    canliEtkinlikler: 'Janly işjeňlikler',
    canliSayaclar: 'Janly sanawlar',
    geriSayim: 'Yza sanaw',
    gelismisErisim: 'Giňişleýin. Okadym belleýän awtomatlaşdyrmalar we programmalar',
    gelismis: 'Giňişleýin',
    otomasyonlar: 'Awtomatlaşdyrmalar',
    otomasyonBaslik: 'Awtomatlaşdyrmalar bilen ulanyň',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Okadym belleýän programmalar',
    kildimOzet: 'Rugsat beren programmalaryňyz',
  },
};
