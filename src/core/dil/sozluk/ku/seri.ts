import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Zincîra we dişewite',
    enUzun: cogul({ one: 'Zincîra herî dirêj: {n} roj', other: 'Zincîra herî dirêj: {n} roj' }),
    gunBuyuk: cogul({ one: 'ROJ', other: 'ROJ' }),
    sonrakiHedef: 'Armanca din: roja {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} roj ma', other: '{n} roj man' }),
    tamamlandi: 'Temam bû',
    paylasErisim: 'Pêşketina xwe parve bikin',
    paylasBuyuk: 'PÊŞKETINA XWE PARVE BIKIN',
  },

  hedefler: {
    ilk_adim: { ad: 'Hefteya Yekem', aciklama: '7 rojan bê navber nimêj bikin', cumle: 'Hefteya yekem' },
    aliskanlik_ustasi: { ad: 'Hostayê Adetê', aciklama: '21 roj - heyama avakirina adetê', cumle: 'Hostayê adetê' },
    kararlilik: { ad: 'Sebat', aciklama: '60 roj bê navber', cumle: 'Sebat' },
    efsane: { ad: 'Efsane', aciklama: '90 roj - sebateke berz', cumle: 'Efsane' },
  },

  /** Klasik mertebe adları, Hawar harfleriyle (çeviri değil). */
  seviyeler: ['Mubtedî', 'Talib', 'Salik', 'Murîd', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Gava Yekem', aciklama: 'We hefteya xwe ya yekem temam kir.', kosul: 'Zincîra 7 rojî' },
    aliskanlik_ustasi: {
      ad: 'Hostayê Adetê',
      aciklama: '21 roj - heyama avakirina adetê temam bû.',
      kosul: 'Zincîra 21 rojî',
    },
    kararlilik: { ad: 'Bisebat', aciklama: 'We 60 rojan bê navber nimêj kir.', kosul: 'Zincîra 60 rojî' },
    efsane: { ad: 'Efsane', aciklama: '90 roj - we sebateke berz nîşan da.', kosul: 'Zincîra 90 rojî' },
    toparlanma_ustasi: {
      ad: 'Hostayê Vegerê',
      aciklama: 'We moda vegerê 3 caran temam kir.',
      kosul: '3 veger',
    },
    mukemmeliyetci: { ad: 'Bêkêmasîxwaz', aciklama: 'We 30 rojan 5/5 nimêj kir.', kosul: '30 roj bi 5/5 nimêj' },
    yuz_namaz: { ad: '100 Nimêj', aciklama: 'We bi tevahî 100 nimêj kirin.', kosul: '100 nimêj bikin' },
    bin_namaz: { ad: '1000 Nimêj', aciklama: 'We bi tevahî 1000 nimêj kirin.', kosul: '1000 nimêj bikin' },
  },

  rozetSeviyeleri: { bronz: 'BRONZ', gumus: 'ZÎV', altin: 'ZÊR', elmas: 'ELMAS' },

  gunBitis: {
    erken: 'Ji bo yên zû radizên',
    varsayilan: 'Standard - li piraniya cihan berî Sibê',
    gec: 'Ji bo yên dereng radizên',
  },

  kutlama: {
    rozetEklendi: '🏅 Li berhevoka nîşanên we hate zêdekirin',
    paylasin: 'Parve bikin',
    rozetBaslik: 'Xwedê daîmî bike',
    rozetMesaj: 'We nîşana “{ad}” bi dest xist.',
    hedefBaslik: cogul({ one: '{n} roj', other: '{n} roj' }),
    hedefMesaj: 'We armanca “{ad}” temam kir. Xwedê daîmî bike.',
    yeniRank: 'Pileya nû: {rank}',
    seviyeBaslik: 'Asta we ya nû',
    seviyeMesaj: 'Êdî hûn wekî “{rank}” didomînin. Xwedê daîmî bike.',
    toparlanmaBaslik: 'Zincîra we vegeriya',
    toparlanmaMesaj: cogul({
      one: 'Zincîra we ya {n} rojî ji cihê ku mabû didome. Xwedê sebatê bide.',
      other: 'Zincîra we ya {n} rojî ji cihê ku mabû didome. Xwedê sebatê bide.',
    }),
    enUzunBaslik: 'Zincîra we ya herî dirêj',
    enUzunMesaj: cogul({
      one: '{n} roj: heta niha zincîra we ya herî dirêj. Xwedê daîmî bike.',
      other: '{n} roj: heta niha zincîra we ya herî dirêj. Xwedê daîmî bike.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Tomarên we yên berê niha nehatin xwendin.',
    yenidenErisim: 'Barkirina daneyên zincîrê dîsa biceribînin',
    yenidenDeneyin: 'Dîsa biceribînin',
    yukleniyor: 'Daneyên zincîra we tên barkirin...',
    gunlukSeri: 'zincîra rojan',
    rekor: 'rekor',
    sozErisim: '{metin} Çavkanî: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Armanca din',
    tumu: 'We hemû nîşan temam kirin',
    kalan: cogul({ one: 'Nîşana {ad}: {n} roj ma', other: 'Nîşana {ad}: {n} roj man' }),
    tumuErisim: 'We hemû nîşan temam kirin: tesbîh tije ye.',
    erisim: 'Nîşana {ad}: {n} ji {hedef} rojan temam bûn.',
  },

  gok: {
    gunHarfleri: ['D', 'S', 'Ç', 'P', 'Î', 'Ş', 'Y'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} roj gihîşt armancê', other: '{n} roj gihîştin armancê' }),
    besVakit: cogul({ one: '{n} roj bi her pênc nimêjan', other: '{n} roj bi her pênc nimêjan' }),
    dondurulmus: cogul({ one: '{n} roj hate cemidandin', other: '{n} roj hatin cemidandin' }),
    mevcutSeri: cogul({ one: 'Zincîra niha: {n} roj.', other: 'Zincîra niha: {n} roj.' }),
  },

  hedefAyar: {
    azalt: 'Kêm bikin',
    deger: 'Nirx',
    artir: 'Zêde bikin',
    esik: cogul({ one: '{n} nimêj', other: '{n} nimêj' }),
    sifirlaBaslik: 'Zincîrê sifir bikin',
    sifirlaMesaj: 'Hemû daneyên zincîra we (zincîr, nîşan, pûan) dê bên sifirkirin. Ev nayê vegerandin. Hûn dixwazin bidomînin?',
    sifirla: 'Sifir bikin',
    iptal: 'Betal bikin',
    basarili: 'Temam',
    sifirlandi: 'Daneyên zincîra we hatin sifirkirin.',
    hedefAyarlari: 'MÎHENGÊN ARMANCÊ',
    tamGunEsigi: 'Sînorê roja tam',
    tamGunAciklama: 'Hejmara herî kêm a nimêjên rojê diyar dike ku ew roj ji bo zincîra we bê hesibandin',
    sifirlama: 'SIFIRKIRIN',
    verileriSifirla: 'Daneyên zincîrê sifir bikin',
    verileriSifirlaAlt: 'Hemû daneyên zincîr, nîşan û pûanan jê dibe',
  },

  rozetKarti: {
    erisim: 'Nîşana {ad}, {durum}',
    kazanildi: 'bi dest ket',
    kilitli: 'kilîtkirî',
  },

  toparlanma: {
    kartBaslik: 'MODA VEGERÊ',
    kartAltBaslik: 'Hûn dikarin zincîra xwe vegerînin',
    kartMesaj: 'Hûn dikarin zincîra xwe ya {vurgu} ji cihê ku mabû bidomînin.',
    oncekiGun: cogul({ one: '{n} rojî', other: '{n} rojî' }),
    ilerleme: '{tamam}/{hedef} roj temam bûn',
    kalan: cogul({
      one: 'Ji bo {n} rojeke din her pênc nimêjan temam bikin û zincîra we ji cihê ku mabû didome.',
      other: 'Ji bo {n} rojên din her pênc nimêjan temam bikin û zincîra we ji cihê ku mabû didome.',
    }),
    bugun: 'Îro temam bikin û zincîra we ji cihê ku mabû didome.',
    uyari: 'Divê roj li pey hev bin; heke di navberê de rojek bimîne, veger ji nû ve dest pê dike.',
    kapatErisim: 'Hûrguliyên vegerê bigirin',
    anladim: 'Min fêm kir',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Pêşketina xwe parve bikin',
    hazirDegilBaslik: 'Wêne ne amade ye',
    hazirDegilMesaj: 'Wêne hîn ne amade ye. Piştî çend çirkeyan dîsa biceribînin.',
    olusturulamadiBaslik: 'Wêne nehate çêkirin',
    olusturulamadiMesaj: 'Di dema çêkirina wêneyê de tiştek çewt çû. Dîsa biceribînin.',
    kullanilamiyorBaslik: 'Parvekirin ne berdest e',
    kullanilamiyorMesaj: 'Parvekirin li ser vê cîhazê tune.',
    kapat: 'Bigirin',
    hikaye: 'Li çîroka xwe zêde bikin',
    platformlar: 'Dikare li Instagram, WhatsApp û cihên din bê parvekirin.',
    tamam: 'Temam',
    seriEnUzun: cogul({ one: 'Zincîra Min a Herî Dirêj: {n} Roj', other: 'Zincîra Min a Herî Dirêj: {n} Roj' }),
    seriZincir: cogul({ one: 'ROJ BÊ ŞIKANDINA ZINCÎRÊ', other: 'ROJ BÊ ŞIKANDINA ZINCÎRÊ' }),
    seriSoz: '“Her roj gaveke biçûk, di canê min de aramiyeke mezin. 🔥”',
    rozetYeni: 'MIN NÎŞANEKE NÛ BI DEST XIST',
    rozetSozleri: [
      'Îro min ji bo xwe gaveke baş avêt. 🌟',
      'Ez bi biryar didomînim; ev nîşan a min e. 💪',
      'Min bereketa sibehê girt. 🌅',
      'Ez jî beşek ji vê herikîna ku ji canê min re baş tê me. ✨',
      'Gavên biçûk aramiyeke mezin tînin. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'MIN NÎŞANEKE NÛ BI DEST XIST',
      hedef_tamamlandi: 'EZ GIHÎŞTIM ARMANCA XWE',
      seviye_atlandi: 'ASTA NÛ',
      toparlanma_tamamlandi: 'EZ VEGERIYAM SER RÊ',
      en_uzun_seri: 'REKORA NÛ',
      varsayilan: 'SERKEFTIN',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Xwedayê min daîmî bike. 🤲', 'Gavên biçûk aramiyeke mezin tînin. 🍃', 'Xwedê sebatê bide me hemûyan. 🌱'],
      hedef_tamamlandi: ['Gavên biçûk aramiyeke mezin tînin. 🍃', 'Xwedê daîmî bike. 🤲', 'Her roj gaveke din. 🌱'],
      seviye_atlandi: [
        'Her roj hinekî din; Xwedê hêsan bike. 🍃',
        'Xwedê daîmî bike. 🤲',
        'Rêwîtî didome. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ya girîng ne ketin e, rabûn e. 🔄',
        'Xwedê sebatê bide. 🤲',
        'Her rê bi sebrê tê meşîn. 🌱',
      ],
      en_uzun_seri: [
        'Her roj gaveke biçûk, di dilê min de aramiyeke mezin. 🍃',
        'Xwedê daîmî bike. 🤲',
        'Xwedayê min sebatê bide me hemûyan. 🌱',
      ],
    },
  },
};
