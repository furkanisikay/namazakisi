import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Mirehitra ny tohinao',
    enUzun: cogul({ one: 'Tohy lava indrindra: {n} andro', other: 'Tohy lava indrindra: {n} andro' }),
    gunBuyuk: cogul({ one: 'ANDRO', other: 'ANDRO' }),
    sonrakiHedef: 'Tanjona manaraka: andro {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} andro sisa', other: '{n} andro sisa' }),
    tamamlandi: 'Vita!',
    paylasErisim: 'Zarao ny fandrosoanao',
    paylasBuyuk: 'ZARAO NY FANDROSOANAO',
  },

  hedefler: {
    ilk_adim: { ad: 'Herinandro voalohany', aciklama: 'Mivavaha mandritra ny 7 andro tsy misy tapaka', cumle: 'Herinandro voalohany' },
    aliskanlik_ustasi: { ad: "Tompon'ny fahazarana", aciklama: '21 andro - vanim-potoana hananganana fahazarana', cumle: "Tompon'ny fahazarana" },
    kararlilik: { ad: 'Faharetana', aciklama: '60 andro tsy misy tapaka', cumle: 'Faharetana' },
    efsane: { ad: 'Mahery fo', aciklama: '90 andro - faharetana miavaka', cumle: 'Mahery fo' },
  },

  /** Klasik mertebe adları, harf çevirisiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Dingana voalohany', aciklama: 'Vitanao ny herinandro voalohany!', kosul: 'Tohy 7 andro' },
    aliskanlik_ustasi: {
      ad: "Tompon'ny fahazarana",
      aciklama: '21 andro - vita ny vanim-potoana hananganana fahazarana!',
      kosul: 'Tohy 21 andro',
    },
    kararlilik: { ad: 'Maharitra', aciklama: 'Nivavaka nandritra ny 60 andro tsy nisy tapaka ianao!', kosul: 'Tohy 60 andro' },
    efsane: { ad: 'Mahery fo', aciklama: '90 andro - naneho faharetana miavaka ianao!', kosul: 'Tohy 90 andro' },
    toparlanma_ustasi: {
      ad: "Tompon'ny fiverenana",
      aciklama: 'Vitanao intelo ny fomba fiverenana!',
      kosul: 'Fiverenana 3',
    },
    mukemmeliyetci: { ad: 'Mitady ny lavorary', aciklama: 'Nivavaka 5/5 nandritra ny 30 andro ianao!', kosul: '30 andro soalat 5/5' },
    yuz_namaz: { ad: 'Soalat 100', aciklama: 'Soalat 100 raha atambatra no vitanao!', kosul: 'Manaova soalat 100' },
    bin_namaz: { ad: 'Soalat 1000', aciklama: 'Soalat 1000 raha atambatra no vitanao!', kosul: 'Manaova soalat 1000' },
  },

  rozetSeviyeleri: { bronz: 'VARAHINA', gumus: 'VOLAFOTSY', altin: 'VOLAMENA', elmas: 'DIAMANTA' },

  gunBitis: {
    erken: "Ho an'ireo matory aloha",
    varsayilan: "Mahazatra - alohan'ny Fajr amin'ny ankamaroan'ny toerana",
    gec: "Ho an'ireo matory tara",
  },

  kutlama: {
    rozetEklendi: "🏅 Nampidirina tao amin'ny fitambaran'ny medalinao",
    paylasin: 'Zarao',
    rozetBaslik: "Ataon'Allah maharitra anie",
    rozetMesaj: 'Nahazo ny medaly « {ad} » ianao.',
    hedefBaslik: cogul({ one: '{n} andro', other: '{n} andro' }),
    hedefMesaj: "Vitanao ny tanjona « {ad} ». Ataon'Allah maharitra anie.",
    yeniRank: 'Laharana vaovao: {rank}',
    seviyeBaslik: 'Ny ambaratonga vaovaonao',
    seviyeMesaj: "Mitohy amin'ny maha « {rank} » ianao izao. Ataon'Allah maharitra anie.",
    toparlanmaBaslik: 'Niverina ny tohinao',
    toparlanmaMesaj: cogul({
      one: "Mitohy amin'ny toerana nijanonany ny tohinao {n} andro. Omen'Allah faharetana anie ianao.",
      other: "Mitohy amin'ny toerana nijanonany ny tohinao {n} andro. Omen'Allah faharetana anie ianao.",
    }),
    enUzunBaslik: 'Ny tohy lava indrindra anananao',
    enUzunMesaj: cogul({
      one: "{n} andro: ny tohy lava indrindra hatramin'izao. Ataon'Allah maharitra anie.",
      other: "{n} andro: ny tohy lava indrindra hatramin'izao. Ataon'Allah maharitra anie.",
    }),
  },

  sekme: {
    hataOkunamadi: "Tsy voavaky amin'izao ny firaketanao taloha.",
    yenidenErisim: 'Andramo indray ny fampidirana ny angon-drakitry ny tohy',
    yenidenDeneyin: 'Andramo indray',
    yukleniyor: 'Ampidirina ny angon-drakitry ny tohinao...',
    gunlukSeri: 'andro tohy',
    rekor: 'rekaody',
    sozErisim: '{metin} Loharano: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Tanjona manaraka',
    tumu: 'Vitanao ny medaly rehetra',
    kalan: cogul({ one: 'Medaly {ad}: {n} andro sisa', other: 'Medaly {ad}: {n} andro sisa' }),
    tumuErisim: 'Vitanao ny medaly rehetra: feno ny tasbih.',
    erisim: "Medaly {ad}: andro {n} amin'ny {hedef} no vita.",
  },

  gok: {
    gunHarfleri: ['A', 'T', 'A', 'A', 'Z', 'A', 'A'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Andro {n} nahatratra ny tanjona', other: 'Andro {n} nahatratra ny tanjona' }),
    besVakit: cogul({ one: 'Andro {n} nisy ny soalat dimy rehetra', other: 'Andro {n} nisy ny soalat dimy rehetra' }),
    dondurulmus: cogul({ one: 'Andro {n} nampiatoina', other: 'Andro {n} nampiatoina' }),
    mevcutSeri: cogul({ one: 'Tohy ankehitriny: {n} andro.', other: 'Tohy ankehitriny: {n} andro.' }),
  },

  hedefAyar: {
    azalt: 'Ahena',
    deger: 'Sanda',
    artir: 'Ampitomboy',
    esik: cogul({ one: 'Soalat {n}', other: 'Soalat {n}' }),
    sifirlaBaslik: 'Avereno ho aotra ny tohy',
    sifirlaMesaj: 'Haverina ho aotra ny angon-drakitry ny tohinao rehetra (tohy, medaly, isa). Tsy azo foanana izany. Hanohy ve ianao?',
    sifirla: 'Avereno ho aotra',
    iptal: 'Foano',
    basarili: 'Vita',
    sifirlandi: 'Naverina ho aotra ny angon-drakitry ny tohinao.',
    hedefAyarlari: 'FIKIRANA TANJONA',
    tamGunEsigi: "Fetran'ny andro feno",
    tamGunAciklama: "Mametraka ny isan'ny soalat farafahakeliny isan'andro ilaina mba hisian'io andro io amin'ny tohinao",
    sifirlama: 'FAMERENANA HO AOTRA',
    verileriSifirla: 'Avereno ho aotra ny angon-drakitry ny tohy',
    verileriSifirlaAlt: 'Mamafa ny angon-drakitra rehetra momba ny tohy, medaly ary isa',
  },

  rozetKarti: {
    erisim: 'Medaly {ad}, {durum}',
    kazanildi: 'azo',
    kilitli: 'mihidy',
  },

  toparlanma: {
    kartBaslik: 'FOMBA FIVERENANA',
    kartAltBaslik: 'Azonao averina ny tohinao',
    kartMesaj: "Azonao tohizana amin'ny toerana nijanonany ny tohinao {vurgu}.",
    oncekiGun: cogul({ one: '{n} andro', other: '{n} andro' }),
    ilerleme: '{tamam}/{hedef} andro vita',
    kalan: cogul({
      one: "Ataovy feno ny soalat dimy mandritra ny {n} andro fanampiny dia hitohy amin'ny toerana nijanonany ny tohinao.",
      other: "Ataovy feno ny soalat dimy mandritra ny {n} andro fanampiny dia hitohy amin'ny toerana nijanonany ny tohinao.",
    }),
    bugun: "Ataovy feno ny androany dia hitohy amin'ny toerana nijanonany ny tohinao.",
    uyari: 'Tsy maintsy misesy ny andro; raha misy andro tsy tratra eo anelanelany, manomboka indray ny fiverenana.',
    kapatErisim: "Hidio ny antsipirian'ny fiverenana",
    anladim: 'Azoko',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Zarao ny fandrosoanao',
    hazirDegilBaslik: 'Tsy mbola vonona ny sary',
    hazirDegilMesaj: 'Mbola tsy vonona ny sary. Andramo indray afaka segondra vitsy.',
    olusturulamadiBaslik: 'Tsy voaforona ny sary',
    olusturulamadiMesaj: 'Nisy zavatra tsy nety nandritra ny famoronana ny sary. Andramo indray.',
    kullanilamiyorBaslik: 'Tsy azo atao ny fizarana',
    kullanilamiyorMesaj: "Tsy azo atao amin'ity fitaovana ity ny fizarana.",
    kapat: 'Hidio',
    hikaye: "Ampio amin'ny tantaranao",
    platformlar: "Azo zaraina amin'ny Instagram, WhatsApp sy ny maro hafa.",
    tamam: 'Ekena',
    seriEnUzun: cogul({ one: 'Ny tohy lava indrindra nananako: {n} andro', other: 'Ny tohy lava indrindra nananako: {n} andro' }),
    seriZincir: cogul({ one: 'ANDRO TSY NANAPAHAKO NY ROJO!', other: 'ANDRO TSY NANAPAHAKO NY ROJO!' }),
    seriSoz: "« Dingana kely isan'andro, fiadanana lehibe ao amin'ny fanahiko. 🔥 »",
    rozetYeni: 'NAHAZO MEDALY VAOVAO AHO!',
    rozetSozleri: [
      "Nandray dingana tsara ho an'ny tenako aho androany! 🌟",
      "Manohy amin'ny fahavononana aho; ahy ity medaly ity! 💪",
      "Tratrako ny fitahian'ny maraina! 🌅",
      "Anisan'ity fikorianana mahasoa ny fanahiko ity aho! ✨",
      'Dingana kely no mitondra fiadanana lehibe. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NAHAZO MEDALY VAOVAO AHO!',
      hedef_tamamlandi: 'TRATRAKO NY TANJONA!',
      seviye_atlandi: 'NIAKATRA AMBARATONGA!',
      toparlanma_tamamlandi: "NIVERINA TAMIN'NY LALANA AHO!",
      en_uzun_seri: 'REKAODY VAOVAO!',
      varsayilan: 'FAHOMBIAZANA!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ["Ataon'ny Tompoko maharitra anie. 🤲", 'Dingana kely no mitondra fiadanana lehibe. 🍃', "Omen'Allah faharetana anie isika rehetra. 🌱"],
      hedef_tamamlandi: ['Dingana kely no mitondra fiadanana lehibe. 🍃', "Ataon'Allah maharitra anie. 🤲", "Dingana iray hafa isan'andro. 🌱"],
      seviye_atlandi: [
        "Lavitra kely kokoa isan'andro; ataon'Allah mora anie. 🍃",
        "Ataon'Allah maharitra anie. 🤲",
        'Mitohy ny dia. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Tsy ny fianjerana no zava-dehibe fa ny fitsanganana. 🔄',
        "Omen'Allah faharetana anie. 🤲",
        "Amin'ny faharetana no andehanana ny lalana rehetra. 🌱",
      ],
      en_uzun_seri: [
        "Dingana kely isan'andro, fiadanana lehibe ao am-poko. 🍃",
        "Ataon'Allah maharitra anie. 🤲",
        "Omen'ny Tompoko faharetana anie isika rehetra. 🌱",
      ],
    },
  },
};
