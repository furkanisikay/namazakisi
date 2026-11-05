import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri "kasunud-sunud" ("sunud" = izlemek, QE "makasunud"; türetildi). Övgü ve "!" yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Pedsulu su kasunud-sunud nu',
    enUzun: cogul({ one: 'Pinakamalendu a kasunud-sunud: {n} gay', other: 'Pinakamalendu a kasunud-sunud: {n} gay' }),
    gunBuyuk: cogul({ one: 'GAY', other: 'GAY' }),
    sonrakiHedef: 'Kasunud a target: gay {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} gay pan', other: '{n} gay pan' }),
    tamamlandi: 'Nasampay',
    paylasErisim: 'I-share su kauswag nu',
    paylasBuyuk: 'I-SHARE SU KAUSWAG NU',
  },

  hedefler: {
    ilk_adim: { ad: 'Paganay a Simana', aciklama: 'Edsambayang sa 7 gay sa da kalipas', cumle: 'Paganay a simana' },
    aliskanlik_ustasi: { ad: 'Maistru nu Kabiyasa', aciklama: '21 gay - timpu nu kapagbaluy sa kabiyasa', cumle: 'Maistru nu kabiyasa' },
    kararlilik: { ad: 'Katatap', aciklama: '60 gay sa da kalipas', cumle: 'Katatap' },
    efsane: { ad: 'Alamat', aciklama: '90 gay - mapulu a kasabar', cumle: 'Alamat' },
  },

  /** Klasik mertebe adları, harf çevirisiyle (çeviri değil). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Paganay a Hakbang', aciklama: 'Nasampay nu su paganay a simana.', kosul: 'Kasunud-sunud a 7 gay' },
    aliskanlik_ustasi: {
      ad: 'Maistru nu Kabiyasa',
      aciklama: '21 gay - nasampay su timpu nu kapagbaluy sa kabiyasa.',
      kosul: 'Kasunud-sunud a 21 gay',
    },
    kararlilik: { ad: 'Matatap', aciklama: 'Midsambayang kanu sa 60 gay sa da kalipas.', kosul: 'Kasunud-sunud a 60 gay' },
    efsane: { ad: 'Alamat', aciklama: '90 gay - inipailay nu su mapulu a kasabar.', kosul: 'Kasunud-sunud a 90 gay' },
    toparlanma_ustasi: {
      ad: 'Maistru nu Kambalingan',
      aciklama: 'Nasampay nu su mode a kambalingan sa makatelu.',
      kosul: '3 a kambalingan',
    },
    mukemmeliyetci: { ad: 'Malimpyu', aciklama: 'Midsambayang kanu sa 5/5 sa 30 gay.', kosul: '30 gay a 5/5 a sambayang' },
    yuz_namaz: { ad: '100 a Sambayang', aciklama: 'Nasambayang nu su 100 a sambayang sa langun.', kosul: 'Edsambayang sa 100 a sambayang' },
    bin_namaz: { ad: '1000 a Sambayang', aciklama: 'Nasambayang nu su 1000 a sambayang sa langun.', kosul: 'Edsambayang sa 1000 a sambayang' },
  },

  rozetSeviyeleri: { bronz: 'BRONSE', gumus: 'PILAK', altin: 'BULAWAN', elmas: 'DIAMANTE' },

  gunBitis: {
    erken: 'Para sa manga pedtulug sa masela',
    varsayilan: 'Default - sa di pan Subuh sa kadakelan a lugar',
    gec: 'Para sa manga pedtulug sa malugay',
  },

  kutlama: {
    rozetEklendi: '🏅 Inisama sa manga badge nu',
    paylasin: 'I-share',
    rozetBaslik: 'Pakatatapen nu Allah',
    rozetMesaj: 'Nakwa nu su badge a "{ad}".',
    hedefBaslik: cogul({ one: '{n} gay', other: '{n} gay' }),
    hedefMesaj: 'Nasampay nu su target a "{ad}". Pakatatapen nu Allah.',
    yeniRank: 'Bagu a rank: {rank}',
    seviyeBaslik: 'Bagu a level nu',
    seviyeMesaj: 'Saguna na ituluy nu lagid nu "{rank}". Pakatatapen nu Allah.',
    toparlanmaBaslik: 'Nakambalingan su kasunud-sunud nu',
    toparlanmaMesaj: cogul({
      one: 'Ituluy su kasunud-sunud nu a {n} gay sa lugar a nakatagakan nin. Inggan kanu nu Allah sa katatap.',
      other: 'Ituluy su kasunud-sunud nu a {n} gay sa lugar a nakatagakan nin. Inggan kanu nu Allah sa katatap.',
    }),
    enUzunBaslik: 'Pinakamalendu a kasunud-sunud nu',
    enUzunMesaj: cogul({
      one: '{n} gay: su pinakamalendu a kasunud-sunud nu taman saguna. Pakatatapen nu Allah.',
      other: '{n} gay: su pinakamalendu a kasunud-sunud nu taman saguna. Pakatatapen nu Allah.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Di mabasa saguna su manga rekord nu a nalipus.',
    yenidenErisim: 'Ulitin su kapagtagad sa datos nu kasunud-sunud',
    yenidenDeneyin: 'Ulit manem',
    yukleniyor: 'Pedtagad su datos nu kasunud-sunud nu...',
    gunlukSeri: 'gay a kasunud-sunud',
    rekor: 'rekord',
    sozErisim: '{metin} Ebpunan: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Kasunud a target',
    tumu: 'Nasampay nu su langun nu badge',
    kalan: cogul({ one: 'Badge a {ad}: {n} gay pan', other: 'Badge a {ad}: {n} gay pan' }),
    tumuErisim: 'Nasampay nu su langun nu badge: napenu su tasbih.',
    erisim: 'Badge a {ad}: {n} kanu {hedef} gay i nasampay.',
  },

  gok: {
    gunHarfleri: ['I', 'S', 'A', 'K', 'J', 'S', 'A'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} gay a nakasampay sa target', other: '{n} gay a nakasampay sa target' }),
    besVakit: cogul({ one: '{n} gay a langun nu lima a sambayang', other: '{n} gay a langun nu lima a sambayang' }),
    dondurulmus: cogul({ one: '{n} gay a nakapendeg', other: '{n} gay a nakapendeg' }),
    mevcutSeri: cogul({ one: 'Kasunud-sunud saguna: {n} gay.', other: 'Kasunud-sunud saguna: {n} gay.' }),
  },

  hedefAyar: {
    azalt: 'Kurangan',
    deger: 'Kadakel',
    artir: 'Dakelan',
    esik: cogul({ one: '{n} sambayang', other: '{n} sambayang' }),
    sifirlaBaslik: 'I-reset su kasunud-sunud',
    sifirlaMesaj: 'Ma-reset su langun nu datos nu kasunud-sunud nu (kasunud-sunud, badge, puntus). Di nu mabatal ini. Ituluy nu ba?',
    sifirla: 'I-reset',
    iptal: 'Ibatal',
    basarili: 'Nasampay',
    sifirlandi: 'Na-reset su datos nu kasunud-sunud nu.',
    hedefAyarlari: 'MANGA SETTING NU TARGET',
    tamGunEsigi: 'Kadakel para sa tamanan a gay',
    tamGunAciklama: 'Pedbetad sa pinakapaydu a kadakel nu sambayang sa isa a gay para maisap su gay sa kasunud-sunud nu',
    sifirlama: 'RESET',
    verileriSifirla: 'I-reset su datos nu kasunud-sunud',
    verileriSifirlaAlt: 'Pedkwaen su langun nu datos nu kasunud-sunud, badge endu puntus',
  },

  rozetKarti: {
    erisim: 'Badge a {ad}, {durum}',
    kazanildi: 'nakwa',
    kilitli: 'nakakandadu',
  },

  toparlanma: {
    kartBaslik: 'MODE A KAMBALINGAN',
    kartAltBaslik: 'Makambalingan nu su kasunud-sunud nu',
    kartMesaj: 'Maituluy nu su kasunud-sunud nu a {vurgu} sa lugar a nakatagakan nin.',
    oncekiGun: cogul({ one: '{n} gay', other: '{n} gay' }),
    ilerleme: '{tamam}/{hedef} gay i nasampay',
    kalan: cogul({
      one: 'Sampayan su langun nu lima a sambayang sa {n} gay pan endu ituluy su kasunud-sunud nu sa lugar a nakatagakan nin.',
      other: 'Sampayan su langun nu lima a sambayang sa {n} gay pan endu ituluy su kasunud-sunud nu sa lugar a nakatagakan nin.',
    }),
    bugun: 'Sampayan su gay ini endu ituluy su kasunud-sunud nu sa lugar a nakatagakan nin.',
    uyari: 'Kailangan a magkasunud su manga gay; amayka aden gay a nalipas, magpamula manem su kambalingan.',
    kapatErisim: 'Takepen su detalye nu kambalingan',
    anladim: 'Nasabut ku',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'I-share su kauswag nu',
    hazirDegilBaslik: 'Da pan nahanda su ladawan',
    hazirDegilMesaj: 'Da pan nahanda su ladawan. Ulit manem sa paydu a segundu.',
    olusturulamadiBaslik: 'Di nabaluy su ladawan',
    olusturulamadiMesaj: 'Aden sala sa kapagbaluy sa ladawan. Ulit manem.',
    kullanilamiyorBaslik: 'Di magamit su share',
    kullanilamiyorMesaj: 'Di makapag-share sa device ini.',
    kapat: 'Takepen',
    hikaye: 'Isama sa story nu',
    platformlar: 'Ma-share sa Instagram, WhatsApp endu salakaw pan.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Pinakamalendu a Kasunud-sunud ku: {n} Gay', other: 'Pinakamalendu a Kasunud-sunud ku: {n} Gay' }),
    seriZincir: cogul({ one: 'GAY A DI NAPUTUL SU KASUNUD-SUNUD', other: 'GAY A DI NAPUTUL SU KASUNUD-SUNUD' }),
    seriSoz: '"Isa a paydu a hakbang uman gay, mapulu a kalilintad sa ginawa ku. 🔥"',
    rozetYeni: 'NAKWA KU SU BAGU A BADGE',
    rozetSozleri: [
      'Saguna a gay, midsugud ako sa mapya a hakbang para sa ginawa ku. 🌟',
      'Ituluy ku sa katatap; lekaku su badge ini. 💪',
      'Nasampay ku su barakat nu mapita. 🌅',
      'Lu ako sa lalan ini a mapya sa ginawa ku. ✨',
      'Su manga paydu a hakbang na pedtalingumaan sa mapulu a kalilintad. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NAKWA KU SU BAGU A BADGE',
      hedef_tamamlandi: 'NASAMPAY KU SU TARGET KU',
      seviye_atlandi: 'BAGU A LEVEL',
      toparlanma_tamamlandi: 'NAKAMBALINGAN SA LALAN',
      en_uzun_seri: 'BAGU A REKORD',
      varsayilan: 'NASAMPAY',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Pakatatapen nu Kadenan ku. 🤲', 'Su manga paydu a hakbang na pedtalingumaan sa mapulu a kalilintad. 🍃', 'Inggan tanu nu Allah sa katatap. 🌱'],
      hedef_tamamlandi: ['Su manga paydu a hakbang na pedtalingumaan sa mapulu a kalilintad. 🍃', 'Pakatatapen nu Allah. 🤲', 'Isa pan a hakbang uman gay. 🌱'],
      seviye_atlandi: [
        'Paydu-paydu uman gay; pakapagaanen nu Allah. 🍃',
        'Pakatatapen nu Allah. 🤲',
        'Ituluy su lalan. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Kena su kapakalubu i mahalaga, su kabangun manem. 🔄',
        'Inggan kanu nu Allah sa katatap. 🤲',
        'Su uman lalan na pedlakawan sa kasabar. 🌱',
      ],
      en_uzun_seri: [
        'Isa a paydu a hakbang uman gay, mapulu a kalilintad sa atay ku. 🍃',
        'Pakatatapen nu Allah. 🤲',
        'Inggan tanu nu Kadenan ku sa katatap. 🌱',
      ],
    },
  },
};
