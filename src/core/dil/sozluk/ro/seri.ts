import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Seria este aprinsă',
    enUzun: cogul({ one: 'Cea mai lungă serie: {n} zi', few: 'Cea mai lungă serie: {n} zile', other: 'Cea mai lungă serie: {n} de zile' }),
    gunBuyuk: cogul({ one: 'ZI', few: 'ZILE', other: 'DE ZILE' }),
    sonrakiHedef: 'Următorul obiectiv: ziua {hedef} ({durum})',
    kalanGun: cogul({ one: 'Mai este {n} zi', few: 'Mai sunt {n} zile', other: 'Mai sunt {n} de zile' }),
    tamamlandi: 'Încheiat!',
    paylasErisim: 'Distribuiți progresul',
    paylasBuyuk: 'DISTRIBUIȚI PROGRESUL',
  },

  hedefler: {
    ilk_adim: { ad: 'Prima săptămână', aciklama: 'Rugați-vă 7 zile fără întrerupere', cumle: 'Prima săptămână' },
    aliskanlik_ustasi: { ad: 'Maestrul obiceiului', aciklama: '21 de zile - perioada de formare a obiceiului', cumle: 'Maestrul obiceiului' },
    kararlilik: { ad: 'Statornicie', aciklama: '60 de zile fără întrerupere', cumle: 'Statornicie' },
    efsane: { ad: 'Legendă', aciklama: '90 de zile - perseverență remarcabilă', cumle: 'Legendă' },
  },

  /** Klasik mertebe adları, harf çevirisi (çevrilmez; İngilizceyle aynı). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Primul pas', aciklama: 'Ați încheiat prima săptămână!', kosul: 'Serie de 7 zile' },
    aliskanlik_ustasi: {
      ad: 'Maestrul obiceiului',
      aciklama: '21 de zile - perioada de formare a obiceiului s-a încheiat!',
      kosul: 'Serie de 21 de zile',
    },
    kararlilik: { ad: 'Statornic', aciklama: 'V-ați rugat 60 de zile fără întrerupere!', kosul: 'Serie de 60 de zile' },
    efsane: { ad: 'Legendă', aciklama: '90 de zile - ați dat dovadă de o perseverență remarcabilă!', kosul: 'Serie de 90 de zile' },
    toparlanma_ustasi: {
      ad: 'Maestrul revenirii',
      aciklama: 'Ați încheiat de 3 ori modul de revenire!',
      kosul: '3 reveniri',
    },
    mukemmeliyetci: { ad: 'Perfecționist', aciklama: 'V-ați rugat 5/5 timp de 30 de zile!', kosul: '30 de zile cu 5/5 rugăciuni' },
    yuz_namaz: { ad: '100 de rugăciuni', aciklama: 'Ați efectuat în total 100 de rugăciuni!', kosul: 'Efectuați 100 de rugăciuni' },
    bin_namaz: { ad: '1000 de rugăciuni', aciklama: 'Ați efectuat în total 1000 de rugăciuni!', kosul: 'Efectuați 1000 de rugăciuni' },
  },

  rozetSeviyeleri: { bronz: 'BRONZ', gumus: 'ARGINT', altin: 'AUR', elmas: 'DIAMANT' },

  gunBitis: {
    erken: 'Pentru cei care se culcă devreme',
    varsayilan: 'Implicit - înainte de Fajr în majoritatea locurilor',
    gec: 'Pentru cei care se culcă târziu',
  },

  kutlama: {
    rozetEklendi: '🏅 Adăugată în colecția de insigne',
    paylasin: 'Distribuiți',
    rozetBaslik: 'Allah să o mențină',
    rozetMesaj: 'Ați obținut insigna „{ad}”.',
    hedefBaslik: cogul({ one: '{n} zi', few: '{n} zile', other: '{n} de zile' }),
    hedefMesaj: 'Ați încheiat obiectivul „{ad}”. Allah să o mențină.',
    yeniRank: 'Rang nou: {rank}',
    seviyeBaslik: 'Noul nivel',
    seviyeMesaj: 'Acum continuați ca „{rank}”. Allah să o mențină.',
    toparlanmaBaslik: 'Seria a revenit',
    toparlanmaMesaj: cogul({
      one: 'Seria de {n} zi continuă de unde a rămas. Allah să ne dea statornicie.',
      few: 'Seria de {n} zile continuă de unde a rămas. Allah să ne dea statornicie.',
      other: 'Seria de {n} de zile continuă de unde a rămas. Allah să ne dea statornicie.',
    }),
    enUzunBaslik: 'Cea mai lungă serie',
    enUzunMesaj: cogul({
      one: '{n} zi: cea mai lungă serie de până acum. Allah să o mențină.',
      few: '{n} zile: cea mai lungă serie de până acum. Allah să o mențină.',
      other: '{n} de zile: cea mai lungă serie de până acum. Allah să o mențină.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Înregistrările anterioare nu au putut fi citite acum.',
    yenidenErisim: 'Reîncercați încărcarea datelor seriei',
    yenidenDeneyin: 'Încercați din nou',
    yukleniyor: 'Se încarcă datele seriei...',
    gunlukSeri: 'zile de serie',
    rekor: 'record',
    sozErisim: '{metin} Sursa: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Următorul obiectiv',
    tumu: 'Ați obținut toate insignele',
    kalan: cogul({ one: 'Insigna {ad}: mai este {n} zi', few: 'Insigna {ad}: mai sunt {n} zile', other: 'Insigna {ad}: mai sunt {n} de zile' }),
    tumuErisim: 'Ați obținut toate insignele: tesbihul este complet.',
    erisim: 'Insigna {ad}: {n} din {hedef} zile încheiate.',
  },

  gok: {
    gunHarfleri: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} zi cu obiectiv atins', few: '{n} zile cu obiectiv atins', other: '{n} de zile cu obiectiv atins' }),
    besVakit: cogul({ one: '{n} zi cu toate cele cinci rugăciuni', few: '{n} zile cu toate cele cinci rugăciuni', other: '{n} de zile cu toate cele cinci rugăciuni' }),
    dondurulmus: cogul({ one: '{n} zi înghețată', few: '{n} zile înghețate', other: '{n} de zile înghețate' }),
    mevcutSeri: cogul({ one: 'Seria curentă: {n} zi.', few: 'Seria curentă: {n} zile.', other: 'Seria curentă: {n} de zile.' }),
  },

  hedefAyar: {
    azalt: 'Reduceți',
    deger: 'Valoare',
    artir: 'Creșteți',
    esik: cogul({ one: '{n} rugăciune', few: '{n} rugăciuni', other: '{n} de rugăciuni' }),
    sifirlaBaslik: 'Resetați seria',
    sifirlaMesaj: 'Toate datele seriei (serie, insigne, puncte) vor fi resetate. Acțiunea nu poate fi anulată. Doriți să continuați?',
    sifirla: 'Resetați',
    iptal: 'Anulați',
    basarili: 'Gata',
    sifirlandi: 'Datele seriei au fost resetate.',
    hedefAyarlari: 'SETĂRILE OBIECTIVULUI',
    tamGunEsigi: 'Pragul zilei complete',
    tamGunAciklama: 'Stabilește numărul minim de rugăciuni pe zi necesar pentru ca ziua să conteze în serie',
    sifirlama: 'RESETARE',
    verileriSifirla: 'Resetați datele seriei',
    verileriSifirlaAlt: 'Șterge toate datele despre serie, insigne și puncte',
  },

  rozetKarti: {
    erisim: 'Insigna {ad}, {durum}',
    kazanildi: 'obținută',
    kilitli: 'blocată',
  },

  toparlanma: {
    kartBaslik: 'MODUL DE REVENIRE',
    kartAltBaslik: 'Puteți recupera seria',
    kartMesaj: 'Puteți continua seria {vurgu} de unde ați rămas.',
    oncekiGun: cogul({ one: 'de {n} zi', few: 'de {n} zile', other: 'de {n} de zile' }),
    ilerleme: '{tamam}/{hedef} zile încheiate',
    kalan: cogul({
      one: 'Efectuați toate cele cinci rugăciuni încă {n} zi și seria continuă de unde a rămas.',
      few: 'Efectuați toate cele cinci rugăciuni încă {n} zile și seria continuă de unde a rămas.',
      other: 'Efectuați toate cele cinci rugăciuni încă {n} de zile și seria continuă de unde a rămas.',
    }),
    bugun: 'Încheiați ziua de azi și seria continuă de unde a rămas.',
    uyari: 'Zilele trebuie să fie consecutive; dacă o zi lipsește între ele, revenirea începe de la capăt.',
    kapatErisim: 'Închideți detaliile revenirii',
    anladim: 'Am înțeles',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Distribuiți progresul',
    hazirDegilBaslik: 'Imaginea nu este gata',
    hazirDegilMesaj: 'Imaginea nu este încă gata. Încercați din nou în câteva secunde.',
    olusturulamadiBaslik: 'Imaginea nu a putut fi creată',
    olusturulamadiMesaj: 'Ceva nu a mers bine la crearea imaginii. Încercați din nou.',
    kullanilamiyorBaslik: 'Distribuire indisponibilă',
    kullanilamiyorMesaj: 'Distribuirea nu este disponibilă pe acest dispozitiv.',
    kapat: 'Închideți',
    hikaye: 'Adăugați în story',
    platformlar: 'Se poate distribui pe Instagram, WhatsApp și altele.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Cea mai lungă serie a mea: {n} zi', few: 'Cea mai lungă serie a mea: {n} zile', other: 'Cea mai lungă serie a mea: {n} de zile' }),
    seriZincir: cogul({ one: 'ZI FĂRĂ SĂ RUP LANȚUL!', few: 'ZILE FĂRĂ SĂ RUP LANȚUL!', other: 'DE ZILE FĂRĂ SĂ RUP LANȚUL!' }),
    seriSoz: '„Un pas mic în fiecare zi, o mare liniște în suflet. 🔥”',
    rozetYeni: 'AM OBȚINUT O INSIGNĂ NOUĂ!',
    rozetSozleri: [
      'Azi am făcut un pas bun pentru mine! 🌟',
      'Merg mai departe cu hotărâre; insigna aceasta e a mea! 💪',
      'Am prins binecuvântarea dimineții! 🌅',
      'Fac parte din acest flux care îmi face bine sufletului! ✨',
      'Pașii mici aduc o mare liniște. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'AM OBȚINUT O INSIGNĂ NOUĂ!',
      hedef_tamamlandi: 'MI-AM ATINS OBIECTIVUL!',
      seviye_atlandi: 'NIVEL NOU!',
      toparlanma_tamamlandi: 'ÎNAPOI PE DRUM!',
      en_uzun_seri: 'RECORD NOU!',
      varsayilan: 'REALIZARE!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Domnul meu să o mențină. 🤲', 'Pașii mici aduc o mare liniște. 🍃', 'Allah să ne dea tuturor statornicie. 🌱'],
      hedef_tamamlandi: ['Pașii mici aduc o mare liniște. 🍃', 'Allah să o mențină. 🤲', 'Încă un pas în fiecare zi. 🌱'],
      seviye_atlandi: [
        'Puțin mai departe în fiecare zi; Allah să ne ușureze. 🍃',
        'Allah să o mențină. 🤲',
        'Drumul continuă. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Important nu este să cazi, ci să te ridici. 🔄',
        'Allah să ne dea statornicie. 🤲',
        'Orice drum se parcurge cu răbdare. 🌱',
      ],
      en_uzun_seri: [
        'Un pas mic în fiecare zi, o mare liniște în inimă. 🍃',
        'Allah să o mențină. 🤲',
        'Domnul meu să ne dea tuturor statornicie. 🌱',
      ],
    },
  },
};
