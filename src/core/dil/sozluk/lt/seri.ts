import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * Büyük harfli metinler sabit yazılır (`toUpperCase` YASAK). "N dienų serija" kalıbında isim hep
 * ilgi hâlinde; süre belirtme hâlinde ("5 dienas"). Dua kalıpları TÜRETİLDİ: "Allah daim etsin" =
 * "Teišlaiko tai Allahas", "Allah sebat versin" = "Teduoda Allahas ištvermės" (yerli okuyucu baksın).
 * Seviye adları klasik terimlerin harf çevirisi (çeviri değil).
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Jūsų serijos ugnis dega',
    enUzun: cogul({ one: 'Ilgiausia serija: {n} diena', few: 'Ilgiausia serija: {n} dienos', many: 'Ilgiausia serija: {n} dienos', other: 'Ilgiausia serija: {n} dienų' }),
    gunBuyuk: cogul({ one: 'DIENA', few: 'DIENOS', many: 'DIENOS', other: 'DIENŲ' }),
    sonrakiHedef: 'Kitas tikslas: {hedef} d. ({durum})',
    kalanGun: cogul({ one: 'Liko {n} diena', few: 'Liko {n} dienos', many: 'Liko {n} dienos', other: 'Liko {n} dienų' }),
    tamamlandi: 'Užbaigta',
    paylasErisim: 'Pasidalykite savo pažanga',
    paylasBuyuk: 'PASIDALYKITE PAŽANGA',
  },

  hedefler: {
    ilk_adim: { ad: 'Pirmoji savaitė', aciklama: '7 dienas melskitės be pertraukos', cumle: 'Pirmoji savaitė' },
    aliskanlik_ustasi: { ad: 'Įpročio meistras', aciklama: '21 diena – įpročio formavimo laikotarpis', cumle: 'Įpročio meistras' },
    kararlilik: { ad: 'Ištvermė', aciklama: '60 dienų be pertraukos', cumle: 'Ištvermė' },
    efsane: { ad: 'Legenda', aciklama: '90 dienų – išskirtinis atkaklumas', cumle: 'Legenda' },
  },

  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Pirmasis žingsnis', aciklama: 'Užbaigėte pirmąją savaitę.', kosul: '7 dienų serija' },
    aliskanlik_ustasi: {
      ad: 'Įpročio meistras',
      aciklama: '21 diena – įpročio formavimo laikotarpis užbaigtas.',
      kosul: '21 dienos serija',
    },
    kararlilik: { ad: 'Pastovumas', aciklama: '60 dienų meldėtės be pertraukos.', kosul: '60 dienų serija' },
    efsane: { ad: 'Legenda', aciklama: '90 dienų – parodėte išskirtinį atkaklumą.', kosul: '90 dienų serija' },
    toparlanma_ustasi: {
      ad: 'Atsigavimo meistras',
      aciklama: '3 kartus sėkmingai užbaigėte atsigavimo režimą.',
      kosul: '3 atsigavimai',
    },
    mukemmeliyetci: { ad: 'Tobulumo siekis', aciklama: '30 dienų atlikote 5 iš 5 maldų.', kosul: '30 dienų po 5/5 maldas' },
    yuz_namaz: { ad: '100 maldų', aciklama: 'Iš viso atlikote 100 maldų.', kosul: 'Atlikti 100 maldų' },
    bin_namaz: { ad: '1000 maldų', aciklama: 'Iš viso atlikote 1000 maldų.', kosul: 'Atlikti 1000 maldų' },
  },

  rozetSeviyeleri: { bronz: 'BRONZA', gumus: 'SIDABRAS', altin: 'AUKSAS', elmas: 'DEIMANTAS' },

  gunBitis: {
    erken: 'Anksti einantiems miegoti',
    varsayilan: 'Numatytasis – daugumoje vietų prieš Fajr',
    gec: 'Vėlai einantiems miegoti',
  },

  kutlama: {
    rozetEklendi: '🏅 Įtraukta į jūsų ženklelių kolekciją',
    paylasin: 'Bendrinti',
    rozetBaslik: 'Teišlaiko tai Allahas',
    rozetMesaj: 'Gavote ženklelį „{ad}“.',
    hedefBaslik: cogul({ one: '{n} diena', few: '{n} dienos', many: '{n} dienos', other: '{n} dienų' }),
    hedefMesaj: 'Pasiekėte tikslą „{ad}“. Teišlaiko tai Allahas.',
    seviyeBaslik: 'Jūsų naujas lygis',
    yeniRank: 'Naujas lygis: {rank}',
    seviyeMesaj: 'Dabar tęsiate kaip „{rank}“. Teišlaiko tai Allahas.',
    toparlanmaBaslik: 'Jūsų serija atkurta',
    toparlanmaMesaj: cogul({
      one: 'Jūsų {n} dienos serija tęsiasi nuo ten, kur sustojo. Teduoda Allahas ištvermės.',
      few: 'Jūsų {n} dienų serija tęsiasi nuo ten, kur sustojo. Teduoda Allahas ištvermės.',
      many: 'Jūsų {n} dienos serija tęsiasi nuo ten, kur sustojo. Teduoda Allahas ištvermės.',
      other: 'Jūsų {n} dienų serija tęsiasi nuo ten, kur sustojo. Teduoda Allahas ištvermės.',
    }),
    enUzunBaslik: 'Jūsų ilgiausia serija',
    enUzunMesaj: cogul({
      one: '{n} diena; tai ilgiausia jūsų serija iki šiol. Teišlaiko tai Allahas.',
      few: '{n} dienos; tai ilgiausia jūsų serija iki šiol. Teišlaiko tai Allahas.',
      many: '{n} dienos; tai ilgiausia jūsų serija iki šiol. Teišlaiko tai Allahas.',
      other: '{n} dienų; tai ilgiausia jūsų serija iki šiol. Teišlaiko tai Allahas.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Šiuo metu nepavyko nuskaityti jūsų ankstesnių įrašų.',
    yenidenErisim: 'Bandyti dar kartą įkelti serijos duomenis',
    yenidenDeneyin: 'Bandyti dar kartą',
    yukleniyor: 'Įkeliami jūsų serijos duomenys...',
    gunlukSeri: 'dienų serija',
    rekor: 'rekordas',
    sozErisim: '{metin} Šaltinis: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Kitas tikslas',
    tumu: 'Gavote visus ženklelius',
    kalan: cogul({ one: 'Iki ženklelio „{ad}“ liko {n} diena', few: 'Iki ženklelio „{ad}“ liko {n} dienos', many: 'Iki ženklelio „{ad}“ liko {n} dienos', other: 'Iki ženklelio „{ad}“ liko {n} dienų' }),
    tumuErisim: 'Gavote visus ženklelius: tasbihas visiškai užpildytas.',
    erisim: 'Ženklelis „{ad}“: įvykdyta dienų – {n} iš {hedef}.',
  },

  gok: {
    gunHarfleri: ['P', 'A', 'T', 'K', 'P', 'Š', 'S'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Tikslas pasiektas {n} dieną', few: 'Tikslas pasiektas {n} dienas', many: 'Tikslas pasiektas {n} dienos', other: 'Tikslas pasiektas {n} dienų' }),
    besVakit: cogul({ one: 'Visos penkios maldos atliktos {n} dieną', few: 'Visos penkios maldos atliktos {n} dienas', many: 'Visos penkios maldos atliktos {n} dienos', other: 'Visos penkios maldos atliktos {n} dienų' }),
    dondurulmus: cogul({ one: 'Užšaldyta {n} diena', few: 'Užšaldytos {n} dienos', many: 'Užšaldyta {n} dienos', other: 'Užšaldyta {n} dienų' }),
    mevcutSeri: cogul({ one: 'Dabartinė serija: {n} diena.', few: 'Dabartinė serija: {n} dienos.', many: 'Dabartinė serija: {n} dienos.', other: 'Dabartinė serija: {n} dienų.' }),
  },

  hedefAyar: {
    azalt: 'Sumažinti',
    deger: 'Reikšmė',
    artir: 'Padidinti',
    esik: cogul({ one: '{n} malda', few: '{n} maldos', many: '{n} maldos', other: '{n} maldų' }),
    sifirlaBaslik: 'Atstatyti seriją',
    sifirlaMesaj: 'Visi jūsų serijos duomenys (serija, ženkleliai, taškai) bus ištrinti. Šio veiksmo anuliuoti negalima. Ar norite tęsti?',
    sifirla: 'Atstatyti',
    iptal: 'Atšaukti',
    basarili: 'Atlikta',
    sifirlandi: 'Jūsų serijos duomenys atstatyti.',
    hedefAyarlari: 'TIKSLO NUSTATYMAI',
    tamGunEsigi: 'Pilnos dienos riba',
    tamGunAciklama: 'Nustato mažiausią maldų skaičių per dieną, kad tos dienos serija būtų laikoma užbaigta',
    sifirlama: 'ATSTATYMAS',
    verileriSifirla: 'Atstatyti serijos duomenis',
    verileriSifirlaAlt: 'Ištrina visus serijos, ženklelių ir taškų duomenis',
  },

  rozetKarti: {
    erisim: 'Ženklelis „{ad}“, {durum}',
    kazanildi: 'gautas',
    kilitli: 'užrakintas',
  },

  toparlanma: {
    kartBaslik: 'ATSIGAVIMO REŽIMAS',
    kartAltBaslik: 'Galite atkurti savo seriją',
    kartMesaj: 'Galite tęsti savo {vurgu} seriją nuo ten, kur sustojote.',
    oncekiGun: cogul({ one: '{n} dienos', few: '{n} dienų', many: '{n} dienos', other: '{n} dienų' }),
    ilerleme: 'Įvykdyta {tamam}/{hedef} d.',
    kalan: cogul({
      one: 'Kai dar {n} dieną atliksite visas penkias maldas, jūsų serija tęsis nuo ten, kur sustojo.',
      few: 'Kai dar {n} dienas atliksite visas penkias maldas, jūsų serija tęsis nuo ten, kur sustojo.',
      many: 'Kai dar {n} dienos atliksite visas penkias maldas, jūsų serija tęsis nuo ten, kur sustojo.',
      other: 'Kai dar {n} dienų atliksite visas penkias maldas, jūsų serija tęsis nuo ten, kur sustojo.',
    }),
    bugun: 'Kai užbaigsite šią dieną, jūsų serija tęsis nuo ten, kur sustojo.',
    uyari: 'Pakanka šias dienas užbaigti iš eilės; jei tarp jų liks tuščia diena, atsigavimas prasidės iš naujo.',
    kapatErisim: 'Uždaryti atsigavimo langą',
    anladim: 'Supratau',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Pasidalykite pasiekimu',
    hazirDegilBaslik: 'Vaizdas neparuoštas',
    hazirDegilMesaj: 'Vaizdas dar neparuoštas. Bandykite dar kartą po kelių sekundžių.',
    olusturulamadiBaslik: 'Nepavyko sukurti vaizdo',
    olusturulamadiMesaj: 'Kuriant vaizdą įvyko klaida. Bandykite dar kartą.',
    kullanilamiyorBaslik: 'Bendrinti negalima',
    kullanilamiyorMesaj: 'Šiame įrenginyje bendrinimo funkcija nepasiekiama.',
    kapat: 'Uždaryti',
    hikaye: 'Pridėti prie istorijos',
    platformlar: 'Galima bendrinti „Instagram“, „WhatsApp“ ir kitur.',
    tamam: 'Gerai',
    seriEnUzun: cogul({ one: 'Mano ilgiausia serija: {n} diena', few: 'Mano ilgiausia serija: {n} dienos', many: 'Mano ilgiausia serija: {n} dienos', other: 'Mano ilgiausia serija: {n} dienų' }),
    seriZincir: cogul({ one: 'DIENĄ NENUTRAUKIU GRANDINĖS', few: 'DIENAS NENUTRAUKIU GRANDINĖS', many: 'DIENOS NENUTRAUKIU GRANDINĖS', other: 'DIENŲ NENUTRAUKIU GRANDINĖS' }),
    seriSoz: '„Kiekvieną dieną mažas žingsnis, sieloje didelė ramybė. 🔥“',
    rozetYeni: 'GAVAU NAUJĄ ŽENKLELĮ',
    rozetSozleri: [
      'Šiandien žengiau gerą žingsnį dėl savęs. 🌟',
      'Tęsiu su ryžtu, šis ženklelis mano. 💪',
      'Pagavau ryto palaimą. 🌅',
      'Ir aš esu šioje sielai gerą darančioje tėkmėje. ✨',
      'Maži žingsniai atneša didelę ramybę. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'GAVAU NAUJĄ ŽENKLELĮ',
      hedef_tamamlandi: 'PASIEKIAU TIKSLĄ',
      seviye_atlandi: 'NAUJAS LYGIS',
      toparlanma_tamamlandi: 'ATSIGAVAU',
      en_uzun_seri: 'NAUJAS REKORDAS',
      varsayilan: 'PASIEKIMAS',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Teišlaiko tai mano Viešpats. 🤲', 'Maži žingsniai atneša didelę ramybę. 🍃', 'Teduoda Allahas mums visiems ištvermės. 🌱'],
      hedef_tamamlandi: ['Maži žingsniai atneša didelę ramybę. 🍃', 'Teišlaiko tai Allahas. 🤲', 'Kasdien dar vienas žingsnis. 🌱'],
      seviye_atlandi: [
        'Kasdien nueinu dar truputį, tepalengvina Allahas. 🍃',
        'Teišlaiko tai Allahas. 🤲',
        'Kelionė tęsiasi. 🌱',
      ],
      toparlanma_tamamlandi: ['Svarbu ne nukristi, o atsikelti. 🔄', 'Teduoda Allahas ištvermės. 🤲', 'Su kantrybe nueinamas kiekvienas kelias. 🌱'],
      en_uzun_seri: [
        'Kasdien mažas žingsnis, širdyje didelė ramybė. 🍃',
        'Teišlaiko tai Allahas. 🤲',
        'Teduoda mano Viešpats mums visiems ištvermės. 🌱',
      ],
    },
  },
};
