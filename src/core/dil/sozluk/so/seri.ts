import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Taxanahaagu wuu socdaa',
    enUzun: cogul({ one: 'Taxanaha ugu dheer: {n} maalin', other: 'Taxanaha ugu dheer: {n} maalmood' }),
    gunBuyuk: cogul({ one: 'MAALIN', other: 'MAALMOOD' }),
    sonrakiHedef: 'Hadafka xiga: maalinta {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} maalin ayaa haray', other: '{n} maalmood ayaa haray' }),
    tamamlandi: 'Waa la dhammaystiray',
    paylasErisim: 'La wadaag horumarkaaga',
    paylasBuyuk: 'LA WADAAG HORUMARKAAGA',
  },

  hedefler: {
    ilk_adim: { ad: 'Toddobaadka Koowaad', aciklama: 'Tuko 7 maalmood adigoon kala joojin', cumle: 'Toddobaadka koowaad' },
    aliskanlik_ustasi: { ad: 'Xirfadlaha Caadada', aciklama: '21 maalmood - muddada dhisidda caadada', cumle: 'Xirfadlaha caadada' },
    kararlilik: { ad: 'Adkaysi', aciklama: '60 maalmood oo aan kala go\'in', cumle: 'Adkaysi' },
    efsane: { ad: 'Halyey', aciklama: '90 maalmood - dulqaad gaar ah', cumle: 'Halyey' },
  },

  /** Magacyada heerarka caadiga ah, la qoray (lama tarjumin). */
  seviyeler: ["Mubtadi'", 'Daalib', 'Saalik', 'Muriid', 'Caarif', 'Xaafid', 'Kaamil'],

  rozetler: {
    ilk_adim: { ad: 'Tallaabada Koowaad', aciklama: 'Waxaad dhammaystirtay toddobaadkaagii koowaad.', kosul: 'Taxane 7 maalmood ah' },
    aliskanlik_ustasi: {
      ad: 'Xirfadlaha Caadada',
      aciklama: '21 maalmood - muddada dhisidda caadada waa la dhammaystiray.',
      kosul: 'Taxane 21 maalmood ah',
    },
    kararlilik: { ad: 'Adkaysi', aciklama: 'Waxaad tukatay 60 maalmood adigoon kala joojin.', kosul: 'Taxane 60 maalmood ah' },
    efsane: { ad: 'Halyey', aciklama: '90 maalmood - waxaad muujisay dulqaad gaar ah.', kosul: 'Taxane 90 maalmood ah' },
    toparlanma_ustasi: {
      ad: 'Xirfadlaha Soo Kabashada',
      aciklama: 'Waxaad dhammaystirtay qaabka soo kabashada 3 jeer.',
      kosul: '3 soo kabasho',
    },
    mukemmeliyetci: { ad: 'Dhammaystire', aciklama: 'Waxaad tukatay 5/5 muddo 30 maalmood ah.', kosul: '30 maalmood oo salaadaha 5/5 ah' },
    yuz_namaz: { ad: '100 Salaadood', aciklama: 'Waxaad tukatay 100 salaadood wadar ahaan.', kosul: 'Tuko 100 salaadood' },
    bin_namaz: { ad: '1000 Salaadood', aciklama: 'Waxaad tukatay 1000 salaadood wadar ahaan.', kosul: 'Tuko 1000 salaadood' },
  },

  rozetSeviyeleri: { bronz: 'NAXAAS', gumus: 'LACAG', altin: 'DAHAB', elmas: 'DHEEMAN' },

  gunBitis: {
    erken: 'Kuwa hore u seexda',
    varsayilan: 'Caadiga - ka hor Subax meelaha badankood',
    gec: 'Kuwa goor dambe seexda',
  },

  kutlama: {
    rozetEklendi: '🏅 Waxaa lagu daray calaamadahaaga',
    paylasin: 'La wadaag',
    rozetBaslik: 'Alle ha sii waariyo',
    rozetMesaj: 'Waxaad heshay calaamadda "{ad}".',
    hedefBaslik: cogul({ one: '{n} maalin', other: '{n} maalmood' }),
    hedefMesaj: 'Waxaad dhammaystirtay hadafka "{ad}". Alle ha sii waariyo.',
    yeniRank: 'Heer cusub: {rank}',
    seviyeBaslik: 'Heerkaaga cusub',
    seviyeMesaj: 'Hadda waxaad ku sii socotaa "{rank}". Alle ha sii waariyo.',
    toparlanmaBaslik: 'Taxanahaagii wuu soo noqday',
    toparlanmaMesaj: cogul({
      one: 'Taxanahaaga {n} maalin ah wuxuu ka sii socdaa meeshii uu ka joogsaday. Alle ha ku sugo.',
      other: 'Taxanahaaga {n} maalmood ah wuxuu ka sii socdaa meeshii uu ka joogsaday. Alle ha ku sugo.',
    }),
    enUzunBaslik: 'Taxanahaaga ugu dheer',
    enUzunMesaj: cogul({
      one: '{n} maalin: taxanahaaga ugu dheer ilaa hadda. Alle ha sii waariyo.',
      other: '{n} maalmood: taxanahaaga ugu dheer ilaa hadda. Alle ha sii waariyo.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Diiwaannadaada hore hadda lama akhrin karin.',
    yenidenErisim: 'Mar kale isku day soo rarista xogta taxanaha',
    yenidenDeneyin: 'Isku day mar kale',
    yukleniyor: 'Xogta taxanahaaga waa la soo rarayaa...',
    gunlukSeri: 'maalmood taxane ah',
    rekor: 'rikoor',
    sozErisim: '{metin} Isha: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Hadafka xiga',
    tumu: 'Waxaad dhammaystirtay calaamadaha oo dhan',
    kalan: cogul({ one: 'Calaamadda {ad}: {n} maalin ayaa haray', other: 'Calaamadda {ad}: {n} maalmood ayaa haray' }),
    tumuErisim: 'Waxaad dhammaystirtay calaamadaha oo dhan: tusbaxu waa buuxaa.',
    erisim: 'Calaamadda {ad}: {n} ka mid ah {hedef} maalmood ayaa la dhammaystiray.',
  },

  gok: {
    gunHarfleri: ['I', 'T', 'A', 'K', 'J', 'S', 'A'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} maalin ayaa hadafka gaartay', other: '{n} maalmood ayaa hadafka gaaray' }),
    besVakit: cogul({ one: '{n} maalin oo shanta salaadood leh', other: '{n} maalmood oo shanta salaadood leh' }),
    dondurulmus: cogul({ one: '{n} maalin oo la qaboojiyay', other: '{n} maalmood oo la qaboojiyay' }),
    mevcutSeri: cogul({ one: 'Taxanaha hadda: {n} maalin.', other: 'Taxanaha hadda: {n} maalmood.' }),
  },

  hedefAyar: {
    azalt: 'Yaree',
    deger: 'Qiimaha',
    artir: 'Kordhi',
    esik: cogul({ one: '{n} salaad', other: '{n} salaadood' }),
    sifirlaBaslik: 'Dib u deji taxanaha',
    sifirlaMesaj: 'Dhammaan xogta taxanahaaga (taxanaha, calaamadaha, dhibcaha) dib ayaa loo dejin doonaa. Tan dib looma celin karo. Ma rabtaa inaad sii wado?',
    sifirla: 'Dib u deji',
    iptal: 'Ka noqo',
    basarili: 'Waa la dhammeeyay',
    sifirlandi: 'Xogta taxanahaaga dib ayaa loo dejiyay.',
    hedefAyarlari: 'DEJINTA HADAFKA',
    tamGunEsigi: 'Xadka maalin buuxda',
    tamGunAciklama: 'Wuxuu dejiyaa tirada ugu yar ee salaadaha maalintii ee looga baahan yahay in maalintaas lagu tiriyo taxanahaaga',
    sifirlama: 'DIB U DEJIN',
    verileriSifirla: 'Dib u deji xogta taxanaha',
    verileriSifirlaAlt: 'Wuxuu tirtiraa dhammaan xogta taxanaha, calaamadaha iyo dhibcaha',
  },

  rozetKarti: {
    erisim: 'Calaamadda {ad}, {durum}',
    kazanildi: 'la helay',
    kilitli: 'xiran',
  },

  toparlanma: {
    kartBaslik: 'QAABKA SOO KABASHADA',
    kartAltBaslik: 'Waad dib u heli kartaa taxanahaaga',
    kartMesaj: 'Waxaad ka sii wadi kartaa taxanahaaga {vurgu} meeshii aad ka joogsatay.',
    oncekiGun: cogul({ one: '{n} maalin ah', other: '{n} maalmood ah' }),
    ilerleme: '{tamam}/{hedef} maalmood ayaa la dhammaystiray',
    kalan: cogul({
      one: 'Dhammaystir shanta salaadood {n} maalin oo kale, taxanahaaguna wuxuu ka sii socdaa meeshii uu ka joogsaday.',
      other: 'Dhammaystir shanta salaadood {n} maalmood oo kale, taxanahaaguna wuxuu ka sii socdaa meeshii uu ka joogsaday.',
    }),
    bugun: 'Dhammaystir maanta, taxanahaaguna wuxuu ka sii socdaa meeshii uu ka joogsaday.',
    uyari: 'Maalmuhu waa inay isku xigaan; haddii maalin dhexda ka dhaafto, soo kabashadu dib ayay u bilaabataa.',
    kapatErisim: 'Xir faahfaahinta soo kabashada',
    anladim: 'Waan fahmay',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'La wadaag horumarkaaga',
    hazirDegilBaslik: 'Sawirku diyaar ma aha',
    hazirDegilMesaj: 'Sawirku weli diyaar ma aha. Isku day dhowr ilbiriqsi kadib.',
    olusturulamadiBaslik: 'Sawirka lama samayn karin',
    olusturulamadiMesaj: 'Wax khalad ah ayaa dhacay intii sawirka la samaynayay. Isku day mar kale.',
    kullanilamiyorBaslik: 'La wadaagistu lama heli karo',
    kullanilamiyorMesaj: 'La wadaagistu lagama heli karo qalabkan.',
    kapat: 'Xir',
    hikaye: 'Ku dar sheekadaada',
    platformlar: 'Waxaa lagu wadaagi karaa Instagram, WhatsApp iyo kuwo kale.',
    tamam: 'Hagaag',
    seriEnUzun: cogul({ one: 'Taxanahayga ugu Dheer: {n} Maalin', other: 'Taxanahayga ugu Dheer: {n} Maalmood' }),
    seriZincir: cogul({ one: 'MAALIN AANAN SILSILADDA JARIN!', other: 'MAALMOOD AANAN SILSILADDA JARIN!' }),
    seriSoz: '"Tallaabo yar maalin kasta, nabad weyn oo nafteyda ah. 🔥"',
    rozetYeni: 'WAXAAN HELAY CALAAMAD CUSUB!',
    rozetSozleri: [
      'Maanta tallaabo wanaagsan ayaan naftayda u qaaday! 🌟',
      'Go\'aan ayaan ku sii socdaa; calaamaddan waa tayda! 💪',
      'Waxaan gaaray barakada subaxa! 🌅',
      'Waxaan ka mid ahay socodkan naftayda wanaag u leh! ✨',
      'Tallaabooyinka yaryar waxay keenaan nabad weyn. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'WAXAAN HELAY CALAAMAD CUSUB!',
      hedef_tamamlandi: 'WAXAAN GAARAY HADAFKAYGA!',
      seviye_atlandi: 'HEER CUSUB!',
      toparlanma_tamamlandi: 'WADDADII AYAAN KU SOO NOQDAY!',
      en_uzun_seri: 'RIKOOR CUSUB!',
      varsayilan: 'GUUL!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Rabbigay ha sii waariyo. 🤲', 'Tallaabooyinka yaryar waxay keenaan nabad weyn. 🍃', 'Alle ha nagu wada sugo. 🌱'],
      hedef_tamamlandi: ['Tallaabooyinka yaryar waxay keenaan nabad weyn. 🍃', 'Alle ha sii waariyo. 🤲', 'Hal tallaabo oo kale maalin kasta. 🌱'],
      seviye_atlandi: [
        'Wax yar oo dheeraad ah maalin kasta; Alle ha fududeeyo. 🍃',
        'Alle ha sii waariyo. 🤲',
        'Safarku wuu socdaa. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Waxa muhiimka ahi ma aha dhicitaanka ee waa kicitaanka. 🔄',
        'Alle ha ku sugo. 🤲',
        'Waddo kasta waxaa lagu maraa sabar. 🌱',
      ],
      en_uzun_seri: [
        'Tallaabo yar maalin kasta, nabad weyn oo qalbigayga ah. 🍃',
        'Alle ha sii waariyo. 🤲',
        'Rabbigay ha nagu wada sugo. 🌱',
      ],
    },
  },
};
