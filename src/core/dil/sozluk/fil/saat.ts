import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Sa telepono',
    telefonAciklama: 'Sa inyong telepono tumutunog ang alarm sa Fajr at ang paggising para sa Tahajjud.',
    saatBaslik: 'Sa relo, nang tahimik',
    saatAciklama:
      'Ang pulso lang ninyo ang nagba-vibrate, kaya hindi nagigising ang katabi ninyong natutulog. Kung hindi ninyo ito i-dismiss sa relo, tutunog ang inyong telepono bilang reserba pagkalipas ng {dk} minuto. Kung wala sa relo ang Namaz Akışı o hindi ito updated, tutunog ang inyong telepono nang {dk} minutong huli tuwing umaga.',
    saatAciklamaIos:
      'Ang pulso lang ninyo ang nagba-vibrate, kaya hindi nagigising ang katabi ninyong natutulog. Kung hindi ninyo ito i-dismiss sa relo, tutunog ang inyong iPhone bilang reserba pagkalipas ng {dk} minuto.',
    ikisiBaslik: 'Sa dalawa',
    ikisiAciklama: 'Sabay na tumutunog ang relo at telepono; kapag dinismiss sa relo, tatahimik din ang telepono.',
    ikisiAciklamaIos: 'Sabay na tumutunog ang relo at iPhone; kapag dinismiss sa relo, tatahimik din ang iPhone.',
  },
  anons: {
    otomatikBaslik: 'Sa telepono; sa relo kapag malayo ito',
    otomatikAciklama:
      'Kapag kasama ninyo ang telepono, ang telepono ang nagbabasa nang malakas at sadyang tahimik ang relo (para hindi basahin ng dalawang device ang iisang pangungusap). Kapag malayo ang telepono, ang relo ang nagbabasa nang malakas.',
    saatBaslik: 'Sa relo lang',
    saatAciklama:
      'Laging nagbabasa nang malakas ang relo at tahimik ang telepono. Habang nagcha-charge ang relo, hindi ito nakakonekta sa telepono o wala itong Namaz Akışı, walang binabasa nang malakas; kung ayaw ninyo nito, gamitin ang unang opsyon.',
    telefonBaslik: 'Sa telepono lang',
    telefonAciklama: 'Hindi kailanman nagsasalita ang relo.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Kung naka-install ang Namaz Akışı sa inyong Apple Watch, kahati nito sa trabaho ang inyong iPhone. Dito ninyo pipiliin kung saan tutunog ang paggising.',
    giris:
      'Kung naka-install ang Namaz Akışı sa inyong relo, kahati nito sa trabaho ang inyong telepono. Dito ninyo pipiliin kung saan tutunog ang paggising at kung saan babasahin nang malakas ang mga anunsyo.',
    uyandirmaBaslik: 'Saan tutunog ang paggising?',
    uyandirmaNotu:
      'Ang paggising ay ang tunay na alarm na ino-on ninyo para sa Fajr sa paalalang "Bago matapos ang oras" at ang paggising para sa Tahajjud na ino-on ninyo sa Mga kusang-loob na dasal.',
    uyandirmaNotuIos:
      'Nakakapagtakda lang ang watchOS ng tahimik na alarm habang bukas ang app sa relo: buksan ang Namaz Akışı sa relo nang isang beses sa isang araw at saka maitatakda ang susunod na paggising. Habang nagcha-charge ang relo o kung hindi binuksan ang app, ang reserba sa iPhone ang tutunog.',
    uyandirmaNotuAndroid: 'Hindi tumutunog ang relo habang nagcha-charge; ang telepono ang tutunog.',
    muhafizAyarlari: 'Buksan ang mga setting ng "Bago matapos ang oras"',
    nafileAyarlari: 'Buksan ang mga setting ng kusang-loob na dasal',
    bilektenBaslik: 'Ang magagawa ninyo mula sa pulso',
    bilektenIos: [
      'Kapag malayo ang inyong iPhone, sa relo tumutunog ang mga paalala; hindi sila tumutunog sa dalawa.',
      'Minamarkahan ninyo mula sa pulso ang mga dasal na naidasal ninyo; itinatala ito ng inyong iPhone.',
      'Nagbibilang kayo ng tasbih gamit ang Digital Crown at nahahanap ninyo ang Qiblah sa relo.',
    ],
    anonsBaslik: 'Saan babasahin nang malakas?',
    anonsNotu:
      'Mga paalalang naka-on ang pagbasa nang malakas lang ang binabasa. Hindi sabay na binabasa ng dalawang device ang iisang pangungusap. Tahimik din ang relo habang nasa masjid kayo o naka-on ang Mode ng dasal. Kung walang speaker, text-to-speech engine o boses sa wika ng app ang relo, nagba-vibrate lang ito. Masusubukan ninyo agad ang tunog ng relo gamit ang "Subukan ang tunog" sa app ng Namaz Akışı sa relo.',
    bilekten: [
      'Mao-on at mao-off ninyo ang Mode ng dasal gamit ang button sa relo (hanggang sa katapusan ng oras ng dasal, hanggang 30 minuto).',
      'Sa masjid, ipinapakita ng relo ang status; sinasagot ninyo ang "Hindi ito masjid" at "Nasa masjid ba kayo?" mula sa pulso.',
      'Ang mga screen na hindi kasya sa relo (Talaan ng qada, Nasa masjid, mga setting) ay bumubukas sa telepono gamit ang "Buksan sa telepono".',
    ],
    namazModuNotu: 'Para ma-on ang Mode ng dasal mula sa relo, i-on muna ito nang isang beses sa telepono.',
    namazModuAyarlari: 'Buksan ang mga setting ng Mode ng dasal',
  },
  sayfa: {
    akilliSaat: 'Smartwatch',
    appleWatchOzet: 'Kung saan tumutunog ang paggising',
    saatOzet: 'Kung saan tumutunog ang paggising at nagbabasa nang malakas',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Mga live na countdown',
    geriSayim: 'Countdown',
    gelismisErisim: 'Advanced. Mga automation at app na nagmamarka ng Nagdasal ako',
    gelismis: 'Advanced',
    otomasyonlar: 'Mga automation',
    otomasyonBaslik: 'Gamitin sa mga automation',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Mga app na nagmamarka ng Nagdasal ako',
    kildimOzet: 'Mga app na pinayagan ninyo',
  },
};
