import type { Sozluk } from '../tr';

export const saat: Sozluk['saat'] = {
  uyandirma: {
    telefonBaslik: 'A waya',
    telefonAciklama: 'Ƙararrawar Asuba da tashin Tahajjudi suna ƙara a wayarku.',
    saatBaslik: 'A agogo, a shiru',
    saatAciklama:
      'Hannunku kaɗai ke girgiza, don haka wanda ke barci kusa da ku ba zai farka ba. Idan ba ku kashe shi a agogo ba, wayarku za ta ƙara a matsayin madadi bayan minti {dk}. Idan Namaz Akışı ba ta kan agogonku ko ba a sabunta ta ba, wayarku za ta ƙara da jinkirin minti {dk} kowace safiya.',
    saatAciklamaIos:
      'Hannunku kaɗai ke girgiza, don haka wanda ke barci kusa da ku ba zai farka ba. Idan ba ku kashe shi a agogo ba, iPhone ɗinku zai ƙara a matsayin madadi bayan minti {dk}.',
    ikisiBaslik: 'A duka biyun',
    ikisiAciklama: 'Agogo da waya suna ƙara tare; kashe shi a agogo yana kuma kashe wayar.',
    ikisiAciklamaIos: 'Agogo da iPhone suna ƙara tare; kashe shi a agogo yana kuma kashe iPhone.',
  },
  anons: {
    otomatikBaslik: 'A waya, a agogo idan wayar ba ta kusa',
    otomatikAciklama:
      'Idan wayarku tana tare da ku, wayar ce ke karantawa da murya, agogonku kuma yana yin shiru da gangan (don kada naʼurori biyu su karanta jumla ɗaya). Idan wayarku ba ta kusa, agogonku ne ke karantawa.',
    saatBaslik: 'A agogo kaɗai',
    saatAciklama:
      'Agogonku yana karantawa da murya kullum, wayarku kuma tana yin shiru. Lokacin da agogonku ke caji, ko ba a haɗa shi da wayarku ba, ko ba shi da Namaz Akışı, ba za a karanta komai ba; idan ba ku son haka, ku yi amfani da zaɓi na farko.',
    telefonBaslik: 'A waya kaɗai',
    telefonAciklama: 'Agogonku ba zai taɓa yin magana ba.',
  },
  ayarlar: {
    secenekErisim: '{baslik}. {aciklama}',
    girisIos:
      'Idan an saka Namaz Akışı a Apple Watch ɗinku, tana raba aiki da iPhone ɗinku. A nan za ku zaɓi inda tashin zai ƙara.',
    giris:
      'Idan an saka Namaz Akışı a agogonku, tana raba aiki da wayarku. A nan za ku zaɓi inda tashin zai ƙara da inda za a karanta sanarwa da murya.',
    uyandirmaBaslik: 'Ina tashin zai ƙara?',
    uyandirmaNotu:
      'Tashin shi ne ainihin ƙararrawar da kuke kunnawa don Asuba a tunatarwar "Kafin lokaci ya fita" da tashin Tahajjudi da kuke kunnawa a Sallolin nafila.',
    uyandirmaNotuIos:
      'watchOS yana iya saita ƙararrawa ta shiru ne kawai lokacin da manhajar agogo ke buɗe: ku buɗe Namaz Akışı a agogonku sau ɗaya a rana, sai a saita tashi na gaba a lokacin. Lokacin da agogo ke caji ko ba a buɗe manhajar ba, madadin iPhone ɗinku zai ƙara.',
    uyandirmaNotuAndroid: 'Agogonku ba ya ƙara lokacin da yake caji; wayarku ce za ta ƙara maimakon haka.',
    muhafizAyarlari: 'Buɗe saitunan "Kafin lokaci ya fita"',
    nafileAyarlari: 'Buɗe saitunan sallolin nafila',
    bilektenBaslik: 'Abin da za ku iya yi daga hannunku',
    bilektenIos: [
      'Idan iPhone ɗinku ba ya kusa, tunatarwa suna ƙara a agogonku; ba sa ƙara a duka biyun.',
      'Kuna yin alamar sallolin da kuka yi daga hannunku; iPhone ɗinku yana adana su.',
      'Kuna ƙirga tasbihi da Digital Crown kuma kuna gano Alƙibla a agogonku.',
    ],
    anonsBaslik: 'Ina za a yi karatu da murya?',
    anonsNotu:
      'Tunatarwar da aka kunna karatu da murya kaɗai ake karantawa. Naʼurorin biyu ba sa karanta jumla ɗaya tare. Agogonku kuma yana yin shiru lokacin da kuke masallaci ko Yanayin salla ke kunne. Idan agogonku ba shi da lasifika, injin karatu da murya ko murya a harshen manhajar, girgiza kawai yake yi. Kuna iya gwada sautin agogo nan take da "Gwada sauti" a manhajar Namaz Akışı ta agogo.',
    bilekten: [
      'Kuna iya kunnawa da kashe Yanayin salla da maɓallin agogo (har zuwa ƙarshen lokacin salla, mafi yawa minti 30).',
      'A masallaci, agogonku yana nuna halin da ake ciki; kuna amsa "Wannan ba masallaci ba ne" da "Kuna masallaci?" daga hannunku.',
      'Shafukan da ba su dace da agogo ba (Littafin ramuwa, A masallaci, saituna) suna buɗewa a wayarku da "Buɗe a waya".',
    ],
    namazModuNotu: 'Don kunna Yanayin salla daga agogo, ku fara kunna shi sau ɗaya a wayarku.',
    namazModuAyarlari: 'Buɗe saitunan Yanayin salla',
  },
  sayfa: {
    akilliSaat: 'Agogo mai wayo',
    appleWatchOzet: 'Inda tashin ke ƙara',
    saatOzet: 'Inda tashin ke ƙara da karatu da murya',
    canliEtkinlikler: 'Live Activities',
    canliSayaclar: 'Ƙidaya kai tsaye',
    geriSayim: 'Ƙidaya',
    gelismisErisim: 'Na ci gaba. Ayyukan atomatik da manhajojin da ke yin alamar Na yi salla',
    gelismis: 'Na ci gaba',
    otomasyonlar: 'Ayyukan atomatik',
    otomasyonBaslik: 'Yi amfani da ayyukan atomatik',
    otomasyonOzet: 'Samsung Routines, Tasker, MacroDroid',
    kildimBaslik: 'Manhajojin da ke yin alamar Na yi salla',
    kildimOzet: 'Manhajojin da kuka ba da izini',
  },
};
