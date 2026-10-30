import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'Bilbila irratti',
    telefonAciklama: 'Alaarmiin Subhiifi dammaqsi Tahajjudii bilbila keessan irratti bilbilu.',
    saatBaslik: "Sa'aatii irratti, callisaan",
    saatAciklama:
      "Harki keessan qofti raafama, kanaaf namni cinaa keessan rafu hin dammaqu. Yoo sa'aatii irratti hin cufne, bilbilli keessan akka kaa'imaatti daqiiqaa {dk} booda bilbila. Yoo Namaz Akışı sa'aatii keessan irra hin jirre ykn haaromfamaa hin taane, bilbilli keessan ganama ganama daqiiqaa {dk} turee bilbila.",
    saatAciklamaIos:
      "Harki keessan qofti raafama, kanaaf namni cinaa keessan rafu hin dammaqu. Yoo sa'aatii irratti hin cufne, iPhone-n keessan akka kaa'imaatti daqiiqaa {dk} booda bilbila.",
    ikisiBaslik: 'Lachuu irratti',
    ikisiAciklama: "Sa'aatiinifi bilbilli wajjin bilbilu; sa'aatii irratti cufuun bilbilas ni callisa.",
    ikisiAciklamaIos: "Sa'aatiinifi iPhone-n wajjin bilbilu; sa'aatii irratti cufuun iPhone-s ni callisa.",
  },
  anons: {
    otomatikBaslik: "Bilbila irratti, yeroo inni fagaatu sa'aatii irratti",
    otomatikAciklama:
      "Yeroo bilbilli keessan isin bira jiru, bilbilli sagaleen dubbisa, sa'aatiin keessan immoo beekumsaan callisa (akka meeshaaleen lamaan himaa tokko hin dubbisneef). Yeroo bilbilli keessan fagaatu, sa'aatiin keessan sagaleen dubbisa.",
    saatBaslik: "Sa'aatii irratti qofa",
    saatAciklama:
      "Sa'aatiin keessan yeroo hunda sagaleen dubbisa, bilbilli keessan immoo callisa. Yeroo sa'aatiin keessan chaarjii irra jiru, bilbila wajjin hin walqabanne ykn Namaz Akışı hin qabne, homtuu sagaleen hin dubbifamu; yoo kana hin barbaanne, filannoo jalqabaa fayyadamaa.",
    telefonBaslik: 'Bilbila irratti qofa',
    telefonAciklama: "Sa'aatiin keessan gonkumaa hin dubbatu.",
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      "Yoo Namaz Akışı Apple Watch keessan irratti fe'ame, hojii iPhone keessan wajjin qooddata. Asitti dammaqsi eessatti akka bilbilu filattu.",
    giris:
      "Yoo Namaz Akışı sa'aatii keessan irratti fe'ame, hojii bilbila keessan wajjin qooddata. Asitti dammaqsi eessatti akka bilbiluufi beeksisni eessatti sagaleen akka dubbifamu filattu.",
    uyandirmaBaslik: 'Dammaqsi eessatti haa bilbilu?',
    uyandirmaNotu:
      'Dammaqsi alaarmii dhugaa yaadachiisa "Osoo yeroon hin xumuramin" keessatti Subhiif bantaniifi dammaqsa Tahajjudii salaata dabalataa keessatti bantani dha.',
    uyandirmaNotuIos:
      "watchOS alaarmii callisaa kan kaa'u yeroo appiin sa'aatii banamee jiru qofa: guyyaatti si'a tokko sa'aatii keessan irratti Namaz Akışı banaa, dammaqsi itti aanu yeroo sanatti kaa'ama. Yeroo sa'aatiin chaarjii irra jiru ykn appiin hin banamne, kaa'imni iPhone keessanii bilbila.",
    uyandirmaNotuAndroid: "Sa'aatiin keessan yeroo chaarjii irra jiru hin bilbilu; bakka isaa bilbilli keessan bilbila.",
    muhafizAyarlari: "Qindaa'ina \"Osoo yeroon hin xumuramin\" banaa",
    nafileAyarlari: "Qindaa'ina salaata dabalataa banaa",
    bilektenBaslik: 'Harka keessan irraa maal gochuu dandeessu',
    bilektenIos: [
      "Yeroo iPhone-n keessan fagaatu, yaadachiisni sa'aatii keessan irratti bilbila; lachuu irratti hin bilbilu.",
      'Salaata salaattan harka keessan irraa mallatteessitu; iPhone-n keessan galmeessa.',
      "Digital Crown-n tasbiihii lakkooftu, sa'aatii keessan irratti qiblaa argattu.",
    ],
    anonsBaslik: "Sagaleen dubbisuun eessatti haa ta'u?",
    anonsNotu:
      "Yaadachiisa sagaleen dubbisuun irratti banamee qofatu dubbifama. Meeshaaleen lamaan himaa tokko wajjin hin dubbisan. Sa'aatiin keessan yeroo masjiida keessa jirtan ykn Haalli salaataa banaa ta'es ni callisa. Yoo sa'aatiin keessan sagalee baasaa, meeshaa barreeffama sagaleetti jijjiiru ykn sagalee afaan appichaa hin qabne, raafama qofa. Appii sa'aatii Namaz Akışı keessatti \"Sagalee yaalaa\"n sagalee sa'aatii hatattamaan yaaluu dandeessu.",
    bilekten: [
      "Qabduu sa'aatii irraatiin Haala salaataa banuufi cufuu dandeessu (hanga dhuma yeroo salaataatti, yoo baay'ate daqiiqaa 30).",
      "Masjiida keessatti sa'aatiin keessan haala agarsiisa; \"Kun masjiida miti\"fi \"Masjiida keessa jirtuu?\" harka keessan irraa deebiftu.",
      "Fuulonni sa'aatii irratti hin gahne (Galmee qadaa, Masjiida keessa jira, qindaa'ina) \"Bilbila irratti bani\"n bilbila keessan irratti banamu.",
    ],
    namazModuNotu: "Haala salaataa sa'aatii irraa banuuf, dura si'a tokko bilbila keessan irratti banaa.",
    namazModuAyarlari: "Qindaa'ina Haala salaataa banaa",
  },
  sayfa: {
    akilliSaat: "Sa'aatii ismaartii",
    appleWatchOzet: 'Dammaqsi eessatti akka bilbilu',
    saatOzet: 'Dammaqsi eessatti akka bilbiluufi sagaleen akka dubbisu',
    canliEtkinlikler: 'Sochiiwwan kallattii (Live Activities)',
    canliSayaclar: 'Lakkoofsa duubaa kallattii',
    geriSayim: 'Lakkoofsa duubaa',
    gelismisErisim: 'Olaanaa. Hojiiwwan ofumaafi appiiwwan "Ani salaateera" mallatteessan',
    gelismis: 'Olaanaa',
    otomasyonlar: 'Hojiiwwan ofumaa',
    otomasyonBaslik: 'Hojiiwwan ofumaa wajjin fayyadamaa',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Appiiwwan "Ani salaateera" mallatteessan',
    kildimOzet: 'Appiiwwan isin hayyamtan',
  },
};
