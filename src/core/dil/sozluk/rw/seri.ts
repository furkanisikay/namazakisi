import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Uruhererekane rwanyu rurakomeje',
    enUzun: cogul({ one: 'Uruhererekane rurerure: iminsi {n}', other: 'Uruhererekane rurerure: iminsi {n}' }),
    gunBuyuk: cogul({ one: 'IMINSI', other: 'IMINSI' }),
    sonrakiHedef: 'Intego ikurikira: umunsi wa {hedef} ({durum})',
    kalanGun: cogul({ one: 'Hasigaye iminsi {n}', other: 'Hasigaye iminsi {n}' }),
    tamamlandi: 'Byarangiye',
    paylasErisim: 'Gusangiza iterambere ryanyu',
    paylasBuyuk: 'GUSANGIZA ITERAMBERE RYANYU',
  },

  hedefler: {
    ilk_adim: { ad: 'Icyumweru cya mbere', aciklama: 'Gusali iminsi 7 nta guhagarara', cumle: 'Icyumweru cya mbere' },
    aliskanlik_ustasi: { ad: 'Umuhanga mu muco', aciklama: 'Iminsi 21 - igihe cyo kubaka umuco', cumle: 'Umuhanga mu muco' },
    kararlilik: { ad: 'Gushikama', aciklama: 'Iminsi 60 nta guhagarara', cumle: 'Gushikama' },
    efsane: { ad: 'Intwari', aciklama: 'Iminsi 90 - kwihangana kudasanzwe', cumle: 'Intwari' },
  },

  /** Amazina y’inzego za kera, yanditswe uko avugwa (ntiyasobanuwe). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Intambwe ya mbere', aciklama: 'Mwarangije icyumweru cyanyu cya mbere.', kosul: 'Uruhererekane rw’iminsi 7' },
    aliskanlik_ustasi: {
      ad: 'Umuhanga mu muco',
      aciklama: 'Iminsi 21 - igihe cyo kubaka umuco cyarangiye.',
      kosul: 'Uruhererekane rw’iminsi 21',
    },
    kararlilik: { ad: 'Ushikamye', aciklama: 'Mwasali iminsi 60 nta guhagarara.', kosul: 'Uruhererekane rw’iminsi 60' },
    efsane: { ad: 'Intwari', aciklama: 'Iminsi 90 - mwagaragaje kwihangana kudasanzwe.', kosul: 'Uruhererekane rw’iminsi 90' },
    toparlanma_ustasi: {
      ad: 'Umuhanga mu kwisubiza',
      aciklama: 'Mwarangije uburyo bwo kwisubiza inshuro 3.',
      kosul: 'Kwisubiza 3',
    },
    mukemmeliyetci: { ad: 'Uwuzuza byose', aciklama: 'Mwasali 5/5 mu minsi 30.', kosul: 'Iminsi 30 y’iswala 5/5' },
    yuz_namaz: { ad: 'Iswala 100', aciklama: 'Mwasali iswala 100 zose hamwe.', kosul: 'Gusali iswala 100' },
    bin_namaz: { ad: 'Iswala 1000', aciklama: 'Mwasali iswala 1000 zose hamwe.', kosul: 'Gusali iswala 1000' },
  },

  rozetSeviyeleri: { bronz: 'UMURINGA', gumus: 'IFEZA', altin: 'ZAHABU', elmas: 'DIYAMA' },

  gunBitis: {
    erken: 'Ku baryama kare',
    varsayilan: 'Bisanzwe - mbere ya Fajri ahenshi',
    gec: 'Ku baryama bitinze',
  },

  kutlama: {
    rozetEklendi: '🏅 Byongewe mu midari yanyu',
    paylasin: 'Gusangiza',
    rozetBaslik: 'Allah abigire ibihoraho',
    rozetMesaj: 'Mwabonye umudari «{ad}».',
    hedefBaslik: cogul({ one: 'Iminsi {n}', other: 'Iminsi {n}' }),
    hedefMesaj: 'Mwageze ku ntego «{ad}». Allah abigire ibihoraho.',
    yeniRank: 'Urwego rushya: {rank}',
    seviyeBaslik: 'Urwego rwanyu rushya',
    seviyeMesaj: 'Ubu mukomeje muri «{rank}». Allah abigire ibihoraho.',
    toparlanmaBaslik: 'Uruhererekane rwanyu rwagarutse',
    toparlanmaMesaj: cogul({
      one: 'Uruhererekane rwanyu rw’iminsi {n} rukomeje aho rwari rugeze. Allah abahe gushikama.',
      other: 'Uruhererekane rwanyu rw’iminsi {n} rukomeje aho rwari rugeze. Allah abahe gushikama.',
    }),
    enUzunBaslik: 'Uruhererekane rwanyu rurerure',
    enUzunMesaj: cogul({
      one: 'Iminsi {n}: uruhererekane rwanyu rurerure kugeza ubu. Allah abigire ibihoraho.',
      other: 'Iminsi {n}: uruhererekane rwanyu rurerure kugeza ubu. Allah abigire ibihoraho.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Inyandiko zanyu zashize ntizashoboye gusomwa ubu.',
    yenidenErisim: 'Kongera gufungura amakuru y’uruhererekane',
    yenidenDeneyin: 'Kongera kugerageza',
    yukleniyor: 'Amakuru y’uruhererekane rwanyu ari gufunguka...',
    gunlukSeri: 'iminsi ikurikiranye',
    rekor: 'agahigo',
    sozErisim: '{metin} Inkomoko: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Intego ikurikira',
    tumu: 'Mwabonye imidari yose',
    kalan: cogul({ one: 'Umudari {ad}: hasigaye iminsi {n}', other: 'Umudari {ad}: hasigaye iminsi {n}' }),
    tumuErisim: 'Mwabonye imidari yose: tasbih yuzuye.',
    erisim: 'Umudari {ad}: iminsi {n} kuri {hedef} yarangiye.',
  },

  gok: {
    gunHarfleri: ['Mb', 'Kb', 'Gt', 'Kn', 'Gn', 'Gd', 'Cy'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Iminsi {n} yageze ku ntego', other: 'Iminsi {n} yageze ku ntego' }),
    besVakit: cogul({ one: 'Iminsi {n} ifite iswala zose uko ari eshanu', other: 'Iminsi {n} ifite iswala zose uko ari eshanu' }),
    dondurulmus: cogul({ one: 'Iminsi {n} yahagaritswe', other: 'Iminsi {n} yahagaritswe' }),
    mevcutSeri: cogul({ one: 'Uruhererekane rw’ubu: iminsi {n}.', other: 'Uruhererekane rw’ubu: iminsi {n}.' }),
  },

  hedefAyar: {
    azalt: 'Kugabanya',
    deger: 'Agaciro',
    artir: 'Kongera',
    esik: cogul({ one: 'Iswala {n}', other: 'Iswala {n}' }),
    sifirlaBaslik: 'Gusubiza uruhererekane kuri zeru',
    sifirlaMesaj: 'Amakuru yose y’uruhererekane rwanyu (uruhererekane, imidari, amanota) azasubizwa kuri zeru. Ibi ntibishobora gusubizwa inyuma. Murashaka gukomeza?',
    sifirla: 'Gusubiza kuri zeru',
    iptal: 'Kureka',
    basarili: 'Byarangiye',
    sifirlandi: 'Amakuru y’uruhererekane rwanyu yasubijwe kuri zeru.',
    hedefAyarlari: 'IGENAMITERERE RY’INTEGO',
    tamGunEsigi: 'Umunsi wuzuye',
    tamGunAciklama: 'Igena umubare muto w’iswala ku munsi ukenewe kugira ngo uwo munsi ubarwe mu ruhererekane rwanyu',
    sifirlama: 'GUSUBIZA KURI ZERU',
    verileriSifirla: 'Gusubiza amakuru y’uruhererekane kuri zeru',
    verileriSifirlaAlt: 'Bisiba amakuru yose y’uruhererekane, imidari n’amanota',
  },

  rozetKarti: {
    erisim: 'Umudari {ad}, {durum}',
    kazanildi: 'wabonetse',
    kilitli: 'urafunze',
  },

  toparlanma: {
    kartBaslik: 'UBURYO BWO KWISUBIZA',
    kartAltBaslik: 'Mushobora kugarura uruhererekane rwanyu',
    kartMesaj: 'Mushobora gukomeza uruhererekane rwanyu {vurgu} aho mwari mugeze.',
    oncekiGun: cogul({ one: 'rw’iminsi {n}', other: 'rw’iminsi {n}' }),
    ilerleme: 'Iminsi {tamam}/{hedef} yarangiye',
    kalan: cogul({
      one: 'Musali iswala zose uko ari eshanu mu yindi minsi {n}, uruhererekane rwanyu rukomeze aho rwari rugeze.',
      other: 'Musali iswala zose uko ari eshanu mu yindi minsi {n}, uruhererekane rwanyu rukomeze aho rwari rugeze.',
    }),
    bugun: 'Murangize uyu munsi, uruhererekane rwanyu rukomeze aho rwari rugeze.',
    uyari: 'Iminsi igomba gukurikirana; umunsi umwe nucika hagati, kwisubiza bitangira bundi bushya.',
    kapatErisim: 'Gufunga ibisobanuro byo kwisubiza',
    anladim: 'Nabyumvise',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Gusangiza iterambere ryanyu',
    hazirDegilBaslik: 'Ishusho ntiriteguye',
    hazirDegilMesaj: 'Ishusho ntiraba iteguye. Mwongere mugerageze mu masegonda make.',
    olusturulamadiBaslik: 'Ishusho ntiyashoboye gukorwa',
    olusturulamadiMesaj: 'Habaye ikibazo mu gukora ishusho. Mwongere mugerageze.',
    kullanilamiyorBaslik: 'Gusangiza ntibishoboka',
    kullanilamiyorMesaj: 'Gusangiza ntibiboneka kuri iki gikoresho.',
    kapat: 'Gufunga',
    hikaye: 'Gushyira muri story',
    platformlar: 'Bishobora gusangizwa kuri Instagram, WhatsApp n’ahandi.',
    tamam: 'Ni byo',
    seriEnUzun: cogul({ one: 'Uruhererekane Rwanjye Rurerure: Iminsi {n}', other: 'Uruhererekane Rwanjye Rurerure: Iminsi {n}' }),
    seriZincir: cogul({ one: 'IMINSI NTARACIKAGURA URUHEREREKANE', other: 'IMINSI NTARACIKAGURA URUHEREREKANE' }),
    seriSoz: '«Intambwe nto buri munsi, amahoro menshi mu mutima wanjye. 🔥»',
    rozetYeni: 'NABONYE UMUDARI MUSHYA',
    rozetSozleri: [
      'Uyu munsi nateye intambwe nziza ku bwanjye. 🌟',
      'Nkomeje nshikamye; uyu mudari ni uwanjye. 💪',
      'Nabonye umugisha wo mu gitondo. 🌅',
      'Ndi muri uru rugendo rugirira umutima wanjye akamaro. ✨',
      'Intambwe nto zizana amahoro menshi. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NABONYE UMUDARI MUSHYA',
      hedef_tamamlandi: 'NAGEZE KU NTEGO YANJYE',
      seviye_atlandi: 'URWEGO RUSHYA',
      toparlanma_tamamlandi: 'NASUBIYE MU MURONGO',
      en_uzun_seri: 'AGAHIGO GASHYA',
      varsayilan: 'IBYAGEZWEHO',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Nyagasani wanjye abigire ibihoraho. 🤲', 'Intambwe nto zizana amahoro menshi. 🍃', 'Allah aduhe twese gushikama. 🌱'],
      hedef_tamamlandi: ['Intambwe nto zizana amahoro menshi. 🍃', 'Allah abigire ibihoraho. 🤲', 'Intambwe imwe kurushaho buri munsi. 🌱'],
      seviye_atlandi: [
        'Buhoro buhoro buri munsi; Allah anyorohereze. 🍃',
        'Allah abigire ibihoraho. 🤲',
        'Urugendo rurakomeje. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Icy’ingenzi si ukugwa, ahubwo ni ukubyuka. 🔄',
        'Allah aduhe gushikama. 🤲',
        'Buri nzira igendwa mu kwihangana. 🌱',
      ],
      en_uzun_seri: [
        'Intambwe nto buri munsi, amahoro menshi mu mutima wanjye. 🍃',
        'Allah abigire ibihoraho. 🤲',
        'Nyagasani wanjye aduhe twese gushikama. 🌱',
      ],
    },
  },
};
