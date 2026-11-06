import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Uruhererekane rwanyu ruraka',
    enUzun: cogul({ one: 'Uruhererekane rurerure: umusi {n}', other: 'Uruhererekane rurerure: imisi {n}' }),
    gunBuyuk: cogul({ one: 'UMUSI', other: 'IMISI' }),
    sonrakiHedef: 'Intumbero ikurikira: umusi wa {hedef} ({durum})',
    kalanGun: cogul({ one: 'Hasigaye umusi {n}', other: 'Hasigaye imisi {n}' }),
    tamamlandi: 'Vyarangiye',
    paylasErisim: 'Musangize iterambere ryanyu',
    paylasBuyuk: 'MUSANGIZE ITERAMBERE RYANYU',
  },

  hedefler: {
    ilk_adim: { ad: 'Indwi ya mbere', aciklama: 'Musenge imisi 7 ata guhagarika', cumle: 'Indwi ya mbere' },
    aliskanlik_ustasi: { ad: 'Umuhanga w’akamenyero', aciklama: 'Imisi 21 - igihe co kwubaka akamenyero', cumle: 'Umuhanga w’akamenyero' },
    kararlilik: { ad: 'Ugushikama', aciklama: 'Imisi 60 ata guhagarika', cumle: 'Ugushikama' },
    efsane: { ad: 'Icitegererezo', aciklama: 'Imisi 90 - ukwihangana kudasanzwe', cumle: 'Icitegererezo' },
  },

  /** Klasik mertebe adları, çevrilmeden harf çevirisiyle (İngilizceyle aynı). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Intambwe ya mbere', aciklama: 'Mwarangije indwi yanyu ya mbere.', kosul: 'Uruhererekane rw’imisi 7' },
    aliskanlik_ustasi: {
      ad: 'Umuhanga w’akamenyero',
      aciklama: 'Imisi 21 - igihe co kwubaka akamenyero carangiye.',
      kosul: 'Uruhererekane rw’imisi 21',
    },
    kararlilik: { ad: 'Uwushikamye', aciklama: 'Mwasenze imisi 60 ata guhagarika.', kosul: 'Uruhererekane rw’imisi 60' },
    efsane: { ad: 'Icitegererezo', aciklama: 'Imisi 90 - mwerekanye ukwihangana kudasanzwe.', kosul: 'Uruhererekane rw’imisi 90' },
    toparlanma_ustasi: {
      ad: 'Umuhanga wo gusubira ku murongo',
      aciklama: 'Mwarangije gusubira ku murongo incuro 3.',
      kosul: 'Gusubira ku murongo incuro 3',
    },
    mukemmeliyetci: { ad: 'Uwutunganye', aciklama: 'Mwasenze 5/5 imisi 30.', kosul: 'Imisi 30 y’amasengesho 5/5' },
    yuz_namaz: { ad: 'Amasengesho 100', aciklama: 'Mwasenze amasengesho 100 yose hamwe.', kosul: 'Musenge amasengesho 100' },
    bin_namaz: { ad: 'Amasengesho 1000', aciklama: 'Mwasenze amasengesho 1000 yose hamwe.', kosul: 'Musenge amasengesho 1000' },
  },

  rozetSeviyeleri: { bronz: 'UMURINGA', gumus: 'IFEZA', altin: 'INZAHABU', elmas: 'IDIYAMA' },

  gunBitis: {
    erken: 'Ku baryama kare',
    varsayilan: 'Isanzwe - imbere ya Fajri ahenshi',
    gec: 'Ku baryama bitevye',
  },

  kutlama: {
    rozetEklendi: '🏅 Wongewe mu midari yanyu',
    paylasin: 'Musangize',
    rozetBaslik: 'Allah abigumize',
    rozetMesaj: 'Mwaronse umudari ”{ad}”.',
    hedefBaslik: cogul({ one: 'Umusi {n}', other: 'Imisi {n}' }),
    hedefMesaj: 'Mwarangije intumbero ”{ad}”. Allah abigumize.',
    yeniRank: 'Intera nshasha: {rank}',
    seviyeBaslik: 'Intera yanyu nshasha',
    seviyeMesaj: 'Ubu mubandanya muri ”{rank}”. Allah abigumize.',
    toparlanmaBaslik: 'Uruhererekane rwanyu rwagarutse',
    toparlanmaMesaj: cogul({
      one: 'Uruhererekane rwanyu rw’umusi {n} rubandanya aho rwari rugeze. Allah abahe gushikama.',
      other: 'Uruhererekane rwanyu rw’imisi {n} rubandanya aho rwari rugeze. Allah abahe gushikama.',
    }),
    enUzunBaslik: 'Uruhererekane rwanyu rurerure',
    enUzunMesaj: cogul({
      one: 'Umusi {n}: uruhererekane rwanyu rurerure gushika ubu. Allah abigumize.',
      other: 'Imisi {n}: uruhererekane rwanyu rurerure gushika ubu. Allah abigumize.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Ivyanditswe vyanyu vya kera ntivyashoboye gusomwa ubu.',
    yenidenErisim: 'Mwongere muzane amakuru y’uruhererekane',
    yenidenDeneyin: 'Mwongere mugerageze',
    yukleniyor: 'Amakuru y’uruhererekane rwanyu ariko araza...',
    gunlukSeri: 'imisi y’uruhererekane',
    rekor: 'akaranga',
    sozErisim: '{metin} Isoko: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Intumbero ikurikira',
    tumu: 'Mwaronse imidari yose',
    kalan: cogul({ one: 'Umudari {ad}: hasigaye umusi {n}', other: 'Umudari {ad}: hasigaye imisi {n}' }),
    tumuErisim: 'Mwaronse imidari yose: tasbih yuzuye.',
    erisim: 'Umudari {ad}: imisi {n} kuri {hedef} yarangiye.',
  },

  gok: {
    gunHarfleri: ['M', 'K', 'G', 'K', 'G', 'G', 'I'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Umusi {n} washitse ku ntumbero', other: 'Imisi {n} yashitse ku ntumbero' }),
    besVakit: cogul({ one: 'Umusi {n} w’amasengesho yose atanu', other: 'Imisi {n} y’amasengesho yose atanu' }),
    dondurulmus: cogul({ one: 'Umusi {n} wahagaritswe', other: 'Imisi {n} yahagaritswe' }),
    mevcutSeri: cogul({ one: 'Uruhererekane rw’ubu: umusi {n}.', other: 'Uruhererekane rw’ubu: imisi {n}.' }),
  },

  hedefAyar: {
    azalt: 'Mugabanye',
    deger: 'Igitigiri',
    artir: 'Mwongere',
    esik: cogul({ one: 'isengesho {n}', other: 'amasengesho {n}' }),
    sifirlaBaslik: 'Musubize uruhererekane ku ntango',
    sifirlaMesaj: 'Amakuru yose y’uruhererekane rwanyu (uruhererekane, imidari, amanota) azosubizwa ku ntango. Ibi ntibishobora gusubizwa inyuma. Murashaka kubandanya?',
    sifirla: 'Musubize ku ntango',
    iptal: 'Mureke',
    basarili: 'Vyarangiye',
    sifirlandi: 'Amakuru y’uruhererekane rwanyu yasubijwe ku ntango.',
    hedefAyarlari: 'AMAHITAMWO Y’INTUMBERO',
    tamGunEsigi: 'Urugero rw’umusi wuzuye',
    tamGunAciklama: 'Ishiraho igitigiri gito c’amasengesho akenewe ku musi kugira uwo musi uharurwe mu ruhererekane',
    sifirlama: 'GUSUBIZA KU NTANGO',
    verileriSifirla: 'Musubize amakuru y’uruhererekane ku ntango',
    verileriSifirlaAlt: 'Bifuta amakuru yose y’uruhererekane, imidari n’amanota',
  },

  rozetKarti: {
    erisim: 'Umudari {ad}, {durum}',
    kazanildi: 'waronswe',
    kilitli: 'urugaye',
  },

  toparlanma: {
    kartBaslik: 'GUSUBIRA KU MURONGO',
    kartAltBaslik: 'Murashobora gusubiza uruhererekane rwanyu',
    kartMesaj: 'Murashobora kubandanya uruhererekane rwanyu {vurgu} aho rwari rugeze.',
    oncekiGun: cogul({ one: 'rw’umusi {n}', other: 'rw’imisi {n}' }),
    ilerleme: 'Imisi {tamam}/{hedef} yarangiye',
    kalan: cogul({
      one: 'Musenge amasengesho yose atanu mu musi {n} wiyongereye, uruhererekane rwanyu rubandanye aho rwari rugeze.',
      other: 'Musenge amasengesho yose atanu mu misi {n} yiyongereye, uruhererekane rwanyu rubandanye aho rwari rugeze.',
    }),
    bugun: 'Murangize uyu musi, uruhererekane rwanyu rubandanye aho rwari rugeze.',
    uyari: 'Imisi itegerezwa gukurikirana; nimba umusi umwe uhushije hagati, gusubira ku murongo gutangura bushasha.',
    kapatErisim: 'Mwugare ibisobanuro vyo gusubira ku murongo',
    anladim: 'Ndabitahuye',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Musangize iterambere ryanyu',
    hazirDegilBaslik: 'Ishusho ntiriteguye',
    hazirDegilMesaj: 'Ishusho ntiriteguye. Mwongere mugerageze haciye amasegonda make.',
    olusturulamadiBaslik: 'Ishusho ntiryashoboye gukorwa',
    olusturulamadiMesaj: 'Hari ikitagenze neza mu gukora ishusho. Mwongere mugerageze.',
    kullanilamiyorBaslik: 'Gusangiza ntibishoboka',
    kullanilamiyorMesaj: 'Gusangiza ntibishoboka kuri iki gikoresho.',
    kapat: 'Mwugare',
    hikaye: 'Mushire muri story yanyu',
    platformlar: 'Bishobora gusangizwa kuri Instagram, WhatsApp n’ahandi.',
    tamam: 'Sawa',
    seriEnUzun: cogul({ one: 'Uruhererekane rwanje rurerure: umusi {n}', other: 'Uruhererekane rwanje rurerure: imisi {n}' }),
    seriZincir: cogul({ one: 'UMUSI ATA GUCA URUHERERERE', other: 'IMISI ATA GUCA URUHERERERE' }),
    seriSoz: '”Intambwe ntoya buri musi, amahoro manini mu mutima wanje. 🔥”',
    rozetYeni: 'NARONSE UMUDARI MUSHASHA',
    rozetSozleri: [
      'Uyu musi nateye intambwe nziza ku bwanje. 🌟',
      'Ndabandanya n’umutima ukomeye; uyu mudari ni uwanje. 💪',
      'Nashikiriye umugisha w’igitondo. 🌅',
      'Ndi mu rugendo rugirira neza umutima wanje. ✨',
      'Intambwe ntoya zizana amahoro manini. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NARONSE UMUDARI MUSHASHA',
      hedef_tamamlandi: 'NASHITSE KU NTUMBERO YANJE',
      seviye_atlandi: 'INTERA NSHASHA',
      toparlanma_tamamlandi: 'NASUBIYE KU MURONGO',
      en_uzun_seri: 'AKARANGA GASHASHA',
      varsayilan: 'INTAMBWE NSHASHA',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Umukama wanje abigumize. 🤲', 'Intambwe ntoya zizana amahoro manini. 🍃', 'Allah aduhe twese gushikama. 🌱'],
      hedef_tamamlandi: ['Intambwe ntoya zizana amahoro manini. 🍃', 'Allah abigumize. 🤲', 'Intambwe imwe kandi buri musi. 🌱'],
      seviye_atlandi: [
        'Gato gato buri musi; Allah abyorohe. 🍃',
        'Allah abigumize. 🤲',
        'Urugendo rurabandanya. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Igihambaye si ugukorwa ahubwo ni ukuvyuka. 🔄',
        'Allah aduhe gushikama. 🤲',
        'Inzira yose igendwa n’ukwihangana. 🌱',
      ],
      en_uzun_seri: [
        'Intambwe ntoya buri musi, amahoro manini mu mutima wanje. 🍃',
        'Allah abigumize. 🤲',
        'Umukama wanje aduhe twese gushikama. 🌱',
      ],
    },
  },
};
