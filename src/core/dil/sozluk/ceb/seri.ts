import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = "sunod-sunod" (türetildi). Övgü, "Tebrikler" ve "!" yok; dilek "Hinaut nga … sa Allah". */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Nagdilaab ang inyong sunod-sunod',
    enUzun: cogul({ one: 'Labing taas nga sunod-sunod: {n} ka adlaw', other: 'Labing taas nga sunod-sunod: {n} ka adlaw' }),
    gunBuyuk: cogul({ one: 'KA ADLAW', other: 'KA ADLAW' }),
    sonrakiHedef: 'Sunod nga tumong: adlaw {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} ka adlaw pa', other: '{n} ka adlaw pa' }),
    tamamlandi: 'Nahuman',
    paylasErisim: 'Ipaambit ang inyong pag-uswag',
    paylasBuyuk: 'IPAAMBIT ANG INYONG PAG-USWAG',
  },

  hedefler: {
    ilk_adim: { ad: 'Unang Semana', aciklama: 'Mag-ampo sulod sa 7 ka adlaw nga walay putol', cumle: 'Unang semana' },
    aliskanlik_ustasi: { ad: 'Batid sa Batasan', aciklama: '21 ka adlaw - panahon sa pagtukod og batasan', cumle: 'Batid sa batasan' },
    kararlilik: { ad: 'Kalig-on', aciklama: '60 ka adlaw nga walay putol', cumle: 'Kalig-on' },
    efsane: { ad: 'Alamat', aciklama: '90 ka adlaw - talagsaong pagpadayon', cumle: 'Alamat' },
  },

  /** Classical rank names, transliterated (not translated). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Unang Lakang', aciklama: 'Nahuman ninyo ang inyong unang semana.', kosul: '7 ka adlaw nga sunod-sunod' },
    aliskanlik_ustasi: {
      ad: 'Batid sa Batasan',
      aciklama: '21 ka adlaw - nahuman ang panahon sa pagtukod og batasan.',
      kosul: '21 ka adlaw nga sunod-sunod',
    },
    kararlilik: { ad: 'Malig-on', aciklama: 'Nag-ampo kamo sulod sa 60 ka adlaw nga walay putol.', kosul: '60 ka adlaw nga sunod-sunod' },
    efsane: { ad: 'Alamat', aciklama: '90 ka adlaw - nagpakita kamo og talagsaong pagpadayon.', kosul: '90 ka adlaw nga sunod-sunod' },
    toparlanma_ustasi: {
      ad: 'Batid sa Pagbangon',
      aciklama: 'Nahuman ninyo ang mode sa pagbangon sa makatulo.',
      kosul: '3 ka pagbangon',
    },
    mukemmeliyetci: { ad: 'Hingpit', aciklama: 'Nag-ampo kamo og 5/5 sulod sa 30 ka adlaw.', kosul: '30 ka adlaw nga 5/5 ang Salah' },
    yuz_namaz: { ad: '100 ka Salah', aciklama: 'Nahimo ninyo ang 100 ka Salah sa kinatibuk-an.', kosul: 'Paghimo og 100 ka Salah' },
    bin_namaz: { ad: '1000 ka Salah', aciklama: 'Nahimo ninyo ang 1000 ka Salah sa kinatibuk-an.', kosul: 'Paghimo og 1000 ka Salah' },
  },

  rozetSeviyeleri: { bronz: 'BRONSE', gumus: 'PILAK', altin: 'BULAWAN', elmas: 'DIYAMANTE' },

  gunBitis: {
    erken: 'Alang sa sayo matulog',
    varsayilan: 'Default - una sa Fajr sa kadaghanang dapit',
    gec: 'Alang sa ulahi matulog',
  },

  kutlama: {
    rozetEklendi: '🏅 Gidugang sa inyong koleksyon sa badge',
    paylasin: 'Ipaambit',
    rozetBaslik: 'Hinaut nga padayonon kini sa Allah',
    rozetMesaj: 'Naangkon ninyo ang badge nga "{ad}".',
    hedefBaslik: cogul({ one: '{n} ka adlaw', other: '{n} ka adlaw' }),
    hedefMesaj: 'Nahuman ninyo ang tumong nga "{ad}". Hinaut nga padayonon kini sa Allah.',
    yeniRank: 'Bag-ong ranggo: {rank}',
    seviyeBaslik: 'Inyong bag-ong lebel',
    seviyeMesaj: 'Magpadayon na kamo isip "{rank}". Hinaut nga padayonon kini sa Allah.',
    toparlanmaBaslik: 'Nibalik ang inyong sunod-sunod',
    toparlanmaMesaj: cogul({
      one: 'Ang inyong {n} ka adlaw nga sunod-sunod nagpadayon gikan sa inyong gibiyaan. Hinaut nga hatagan kita sa Allah og kalig-on.',
      other: 'Ang inyong {n} ka adlaw nga sunod-sunod nagpadayon gikan sa inyong gibiyaan. Hinaut nga hatagan kita sa Allah og kalig-on.',
    }),
    enUzunBaslik: 'Inyong labing taas nga sunod-sunod',
    enUzunMesaj: cogul({
      one: '{n} ka adlaw: ang inyong labing taas nga sunod-sunod hangtod karon. Hinaut nga padayonon kini sa Allah.',
      other: '{n} ka adlaw: ang inyong labing taas nga sunod-sunod hangtod karon. Hinaut nga padayonon kini sa Allah.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Dili mabasa karon ang inyong miaging mga rekord.',
    yenidenErisim: 'Sulayi pag-usab ang pag-load sa datos sa sunod-sunod',
    yenidenDeneyin: 'Sulayi pag-usab',
    yukleniyor: 'Nag-load sa datos sa inyong sunod-sunod...',
    gunlukSeri: 'ka adlaw nga sunod-sunod',
    rekor: 'rekord',
    sozErisim: '{metin} Tinubdan: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Sunod nga tumong',
    tumu: 'Nahuman ninyo ang tanang badge',
    kalan: cogul({ one: 'Badge nga {ad}: {n} ka adlaw pa', other: 'Badge nga {ad}: {n} ka adlaw pa' }),
    tumuErisim: 'Nahuman ninyo ang tanang badge: puno na ang tasbih.',
    erisim: 'Badge nga {ad}: {n} sa {hedef} ka adlaw ang nahuman.',
  },

  gok: {
    gunHarfleri: ['L', 'M', 'M', 'H', 'B', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} ka adlaw ang nakaabot sa tumong', other: '{n} ka adlaw ang nakaabot sa tumong' }),
    besVakit: cogul({ one: '{n} ka adlaw nga kompleto ang lima ka Salah', other: '{n} ka adlaw nga kompleto ang lima ka Salah' }),
    dondurulmus: cogul({ one: '{n} ka adlaw ang gi-freeze', other: '{n} ka adlaw ang gi-freeze' }),
    mevcutSeri: cogul({ one: 'Karon nga sunod-sunod: {n} ka adlaw.', other: 'Karon nga sunod-sunod: {n} ka adlaw.' }),
  },

  hedefAyar: {
    azalt: 'Kunhuran',
    deger: 'Bili',
    artir: 'Dugangan',
    esik: cogul({ one: '{n} ka Salah', other: '{n} ka Salah' }),
    sifirlaBaslik: 'I-reset ang sunod-sunod',
    sifirlaMesaj: 'Ma-reset ang tanan ninyong datos sa sunod-sunod (sunod-sunod, mga badge, puntos). Dili na kini mabawi. Gusto ba ninyong mopadayon?',
    sifirla: 'I-reset',
    iptal: 'Kanselaha',
    basarili: 'Nahuman',
    sifirlandi: 'Na-reset na ang datos sa inyong sunod-sunod.',
    hedefAyarlari: 'MGA SETTING SA TUMONG',
    tamGunEsigi: 'Utlanan sa tibuok adlaw',
    tamGunAciklama: 'I-set ang pinakagamay nga ihap sa Salah kada adlaw aron maisip ang adlaw sa inyong sunod-sunod',
    sifirlama: 'I-RESET',
    verileriSifirla: 'I-reset ang datos sa sunod-sunod',
    verileriSifirlaAlt: 'Papason ang tanang datos sa sunod-sunod, badge ug puntos',
  },

  rozetKarti: {
    erisim: 'Badge nga {ad}, {durum}',
    kazanildi: 'naangkon',
    kilitli: 'naka-lock',
  },

  toparlanma: {
    kartBaslik: 'MODE SA PAGBANGON',
    kartAltBaslik: 'Mabawi ninyo ang inyong sunod-sunod',
    kartMesaj: 'Mapadayon ninyo ang inyong {vurgu} nga sunod-sunod gikan sa inyong gibiyaan.',
    oncekiGun: cogul({ one: '{n} ka adlaw', other: '{n} ka adlaw' }),
    ilerleme: '{tamam}/{hedef} ka adlaw ang nahuman',
    kalan: cogul({
      one: 'Kompletoha ang lima ka Salah sulod sa {n} pa ka adlaw ug magpadayon ang inyong sunod-sunod gikan sa inyong gibiyaan.',
      other: 'Kompletoha ang lima ka Salah sulod sa {n} pa ka adlaw ug magpadayon ang inyong sunod-sunod gikan sa inyong gibiyaan.',
    }),
    bugun: 'Kompletoha karong adlawa ug magpadayon ang inyong sunod-sunod gikan sa inyong gibiyaan.',
    uyari: 'Kinahanglan sunod-sunod ang mga adlaw; kon may malaktawan nga adlaw, magsugod pag-usab ang pagbangon.',
    kapatErisim: 'Isira ang mga detalye sa pagbangon',
    anladim: 'Nasabtan',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Ipaambit ang inyong pag-uswag',
    hazirDegilBaslik: 'Dili pa andam ang hulagway',
    hazirDegilMesaj: 'Dili pa andam ang hulagway. Sulayi pag-usab human sa pipila ka segundo.',
    olusturulamadiBaslik: 'Dili mahimo ang hulagway',
    olusturulamadiMesaj: 'Adunay sayop samtang gihimo ang hulagway. Sulayi pag-usab.',
    kullanilamiyorBaslik: 'Dili magamit ang pagpaambit',
    kullanilamiyorMesaj: 'Dili magamit ang pagpaambit niining device.',
    kapat: 'Isira',
    hikaye: 'Idugang sa inyong story',
    platformlar: 'Mapaambit sa Instagram, WhatsApp ug uban pa.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Akong Labing Taas nga Sunod-sunod: {n} ka Adlaw', other: 'Akong Labing Taas nga Sunod-sunod: {n} ka Adlaw' }),
    seriZincir: cogul({ one: 'KA ADLAW NGA WALAY PUTOL', other: 'KA ADLAW NGA WALAY PUTOL' }),
    seriSoz: '"Gamay nga lakang matag adlaw, dakong kalinaw sa akong kalag. 🔥"',
    rozetYeni: 'NAKAANGKON KO OG BAG-ONG BADGE',
    rozetSozleri: [
      'Karong adlawa mihimo ko og maayong lakang alang sa akong kaugalingon. 🌟',
      'Nagpadayon ko nga malig-on; ako kining badge. 💪',
      'Naabtan nako ang panalangin sa buntag. 🌅',
      'Bahin ko niining dagan nga maayo sa akong kalag. ✨',
      'Ang gagmay nga lakang magdala og dakong kalinaw. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NAKAANGKON KO OG BAG-ONG BADGE',
      hedef_tamamlandi: 'NAABOT NAKO ANG AKONG TUMONG',
      seviye_atlandi: 'MISAKA OG LEBEL',
      toparlanma_tamamlandi: 'NIBALIK SA DALAN',
      en_uzun_seri: 'BAG-ONG REKORD',
      varsayilan: 'NAKAB-OT',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Hinaut nga padayonon kini sa akong Ginoo. 🤲', 'Ang gagmay nga lakang magdala og dakong kalinaw. 🍃', 'Hinaut nga hatagan kitang tanan sa Allah og kalig-on. 🌱'],
      hedef_tamamlandi: ['Ang gagmay nga lakang magdala og dakong kalinaw. 🍃', 'Hinaut nga padayonon kini sa Allah. 🤲', 'Usa pa ka lakang matag adlaw. 🌱'],
      seviye_atlandi: [
        'Gamay pa matag adlaw; hinaut nga pasayon kini sa Allah. 🍃',
        'Hinaut nga padayonon kini sa Allah. 🤲',
        'Nagpadayon ang panaw. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ang importante dili ang pagkapukan kondili ang pagbangon. 🔄',
        'Hinaut nga hatagan kita sa Allah og kalig-on. 🤲',
        'Ang matag dalan gilakaw uban ang pailub. 🌱',
      ],
      en_uzun_seri: [
        'Gamay nga lakang matag adlaw, dakong kalinaw sa akong kasingkasing. 🍃',
        'Hinaut nga padayonon kini sa Allah. 🤲',
        'Hinaut nga hatagan kitang tanan sa akong Ginoo og kalig-on. 🌱',
      ],
    },
  },
};
