import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri "sunod-sunod" (ardışık günler; kaynakta karşılık yok, arayüz terimi). Paylaşım metinleri kullanıcının kendi ağzından. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Nag-aalab ang inyong sunod-sunod',
    enUzun: cogul({ one: 'Pinakamahabang sunod-sunod: {n} araw', other: 'Pinakamahabang sunod-sunod: {n} araw' }),
    gunBuyuk: cogul({ one: 'ARAW', other: 'ARAW' }),
    sonrakiHedef: 'Susunod na layunin: ika-{hedef} araw ({durum})',
    kalanGun: cogul({ one: '{n} araw pa', other: '{n} araw pa' }),
    tamamlandi: 'Natapos!',
    paylasErisim: 'Ibahagi ang inyong pag-unlad',
    paylasBuyuk: 'IBAHAGI ANG INYONG PAG-UNLAD',
  },

  hedefler: {
    ilk_adim: { ad: 'Unang Linggo', aciklama: 'Magdasal nang 7 araw nang walang patid', cumle: 'Unang linggo' },
    aliskanlik_ustasi: { ad: 'Dalubhasa sa Gawi', aciklama: '21 araw - panahon ng pagbuo ng gawi', cumle: 'Dalubhasa sa gawi' },
    kararlilik: { ad: 'Katatagan', aciklama: '60 araw nang walang patid', cumle: 'Katatagan' },
    efsane: { ad: 'Alamat', aciklama: '90 araw - pambihirang tiyaga', cumle: 'Alamat' },
  },

  /** Klasik mertebe adları, harf çevirisiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Unang Hakbang', aciklama: 'Natapos ninyo ang unang linggo!', kosul: '7 araw na sunod-sunod' },
    aliskanlik_ustasi: {
      ad: 'Dalubhasa sa Gawi',
      aciklama: '21 araw - natapos ang panahon ng pagbuo ng gawi!',
      kosul: '21 araw na sunod-sunod',
    },
    kararlilik: { ad: 'Matatag', aciklama: 'Nagdasal kayo nang 60 araw nang walang patid!', kosul: '60 araw na sunod-sunod' },
    efsane: { ad: 'Alamat', aciklama: '90 araw - nagpakita kayo ng pambihirang tiyaga!', kosul: '90 araw na sunod-sunod' },
    toparlanma_ustasi: {
      ad: 'Dalubhasa sa Pagbangon',
      aciklama: 'Natapos ninyo nang 3 beses ang mode ng pagbangon!',
      kosul: '3 pagbangon',
    },
    mukemmeliyetci: { ad: 'Perpeksiyonista', aciklama: 'Nagdasal kayo nang 5/5 sa loob ng 30 araw!', kosul: '30 araw ng 5/5 na dasal' },
    yuz_namaz: { ad: '100 Dasal', aciklama: 'Nakapagdasal kayo ng 100 dasal sa kabuuan!', kosul: 'Magdasal ng 100 dasal' },
    bin_namaz: { ad: '1000 Dasal', aciklama: 'Nakapagdasal kayo ng 1000 dasal sa kabuuan!', kosul: 'Magdasal ng 1000 dasal' },
  },

  rozetSeviyeleri: { bronz: 'TANSO', gumus: 'PILAK', altin: 'GINTO', elmas: 'DIYAMANTE' },

  gunBitis: {
    erken: 'Para sa maagang natutulog',
    varsayilan: 'Default - bago ang Fajr sa karamihan ng lugar',
    gec: 'Para sa gabing natutulog',
  },

  kutlama: {
    rozetEklendi: '🏅 Idinagdag sa inyong koleksyon ng badge',
    paylasin: 'Ibahagi',
    rozetBaslik: 'Gawin nawa itong pangmatagalan ni Allah',
    rozetMesaj: 'Nakuha ninyo ang badge na "{ad}".',
    hedefBaslik: cogul({ one: '{n} araw', other: '{n} araw' }),
    hedefMesaj: 'Natapos ninyo ang layuning "{ad}". Gawin nawa itong pangmatagalan ni Allah.',
    yeniRank: 'Bagong ranggo: {rank}',
    seviyeBaslik: 'Ang bago ninyong antas',
    seviyeMesaj: 'Nagpapatuloy na kayo bilang "{rank}". Gawin nawa itong pangmatagalan ni Allah.',
    toparlanmaBaslik: 'Bumalik ang inyong sunod-sunod',
    toparlanmaMesaj: cogul({
      one: 'Nagpapatuloy ang inyong {n} araw na sunod-sunod mula sa naiwan nito. Pagkalooban nawa kayo ni Allah ng katatagan.',
      other: 'Nagpapatuloy ang inyong {n} araw na sunod-sunod mula sa naiwan nito. Pagkalooban nawa kayo ni Allah ng katatagan.',
    }),
    enUzunBaslik: 'Ang pinakamahaba ninyong sunod-sunod',
    enUzunMesaj: cogul({
      one: '{n} araw: ang pinakamahaba ninyong sunod-sunod sa ngayon. Gawin nawa itong pangmatagalan ni Allah.',
      other: '{n} araw: ang pinakamahaba ninyong sunod-sunod sa ngayon. Gawin nawa itong pangmatagalan ni Allah.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Hindi mabasa ngayon ang inyong mga nakaraang tala.',
    yenidenErisim: 'Subukang i-load muli ang datos ng sunod-sunod',
    yenidenDeneyin: 'Subukang muli',
    yukleniyor: 'Nilo-load ang datos ng inyong sunod-sunod...',
    gunlukSeri: 'araw na sunod-sunod',
    rekor: 'rekord',
    sozErisim: '{metin} Pinagmulan: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Susunod na layunin',
    tumu: 'Natapos ninyo ang lahat ng badge',
    kalan: cogul({ one: 'Badge na {ad}: {n} araw pa', other: 'Badge na {ad}: {n} araw pa' }),
    tumuErisim: 'Natapos ninyo ang lahat ng badge: puno na ang tasbih.',
    erisim: 'Badge na {ad}: {n} sa {hedef} araw ang natapos.',
  },

  gok: {
    gunHarfleri: ['L', 'M', 'M', 'H', 'B', 'S', 'L'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} araw ang umabot sa layunin', other: '{n} araw ang umabot sa layunin' }),
    besVakit: cogul({ one: '{n} araw na may limang dasal', other: '{n} araw na may limang dasal' }),
    dondurulmus: cogul({ one: '{n} araw na naka-freeze', other: '{n} araw na naka-freeze' }),
    mevcutSeri: cogul({ one: 'Kasalukuyang sunod-sunod: {n} araw.', other: 'Kasalukuyang sunod-sunod: {n} araw.' }),
  },

  hedefAyar: {
    azalt: 'Bawasan',
    deger: 'Halaga',
    artir: 'Dagdagan',
    esik: cogul({ one: '{n} dasal', other: '{n} dasal' }),
    sifirlaBaslik: 'I-reset ang sunod-sunod',
    sifirlaMesaj: 'Ire-reset ang lahat ng datos ng inyong sunod-sunod (sunod-sunod, badge, puntos). Hindi na ito maibabalik. Gusto ba ninyong magpatuloy?',
    sifirla: 'I-reset',
    iptal: 'Kanselahin',
    basarili: 'Tapos na',
    sifirlandi: 'Na-reset ang datos ng inyong sunod-sunod.',
    hedefAyarlari: 'MGA SETTING NG LAYUNIN',
    tamGunEsigi: 'Hangganan ng buong araw',
    tamGunAciklama: 'Itinatakda ang pinakamababang bilang ng dasal sa isang araw para mabilang ang araw na iyon sa inyong sunod-sunod',
    sifirlama: 'I-RESET',
    verileriSifirla: 'I-reset ang datos ng sunod-sunod',
    verileriSifirlaAlt: 'Binubura ang lahat ng datos ng sunod-sunod, badge at puntos',
  },

  rozetKarti: {
    erisim: 'Badge na {ad}, {durum}',
    kazanildi: 'nakuha',
    kilitli: 'naka-lock',
  },

  toparlanma: {
    kartBaslik: 'MODE NG PAGBANGON',
    kartAltBaslik: 'Maibabalik ninyo ang inyong sunod-sunod',
    kartMesaj: 'Maipagpapatuloy ninyo ang inyong {vurgu} na sunod-sunod mula sa naiwan nito.',
    oncekiGun: cogul({ one: '{n} araw', other: '{n} araw' }),
    ilerleme: '{tamam}/{hedef} araw ang natapos',
    kalan: cogul({
      one: 'Kumpletuhin ang limang dasal sa {n} pang araw at magpapatuloy ang inyong sunod-sunod mula sa naiwan nito.',
      other: 'Kumpletuhin ang limang dasal sa {n} pang araw at magpapatuloy ang inyong sunod-sunod mula sa naiwan nito.',
    }),
    bugun: 'Kumpletuhin ang araw na ito at magpapatuloy ang inyong sunod-sunod mula sa naiwan nito.',
    uyari: 'Dapat sunod-sunod ang mga araw; kung may lumaktaw na araw sa pagitan, magsisimula muli ang pagbangon.',
    kapatErisim: 'Isara ang mga detalye ng pagbangon',
    anladim: 'Naintindihan ko',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Ibahagi ang inyong pag-unlad',
    hazirDegilBaslik: 'Hindi pa handa ang larawan',
    hazirDegilMesaj: 'Hindi pa handa ang larawan. Subukang muli pagkalipas ng ilang segundo.',
    olusturulamadiBaslik: 'Hindi magawa ang larawan',
    olusturulamadiMesaj: 'Nagkaproblema habang ginagawa ang larawan. Subukang muli.',
    kullanilamiyorBaslik: 'Hindi available ang pagbabahagi',
    kullanilamiyorMesaj: 'Hindi available ang pagbabahagi sa device na ito.',
    kapat: 'Isara',
    hikaye: 'Idagdag sa inyong story',
    platformlar: 'Maibabahagi sa Instagram, WhatsApp at iba pa.',
    tamam: 'OK',
    seriEnUzun: cogul({ one: 'Pinakamahaba Kong Sunod-sunod: {n} Araw', other: 'Pinakamahaba Kong Sunod-sunod: {n} Araw' }),
    seriZincir: cogul({ one: 'ARAW NA HINDI KO PINUTOL ANG KADENA!', other: 'ARAW NA HINDI KO PINUTOL ANG KADENA!' }),
    seriSoz: '"Maliit na hakbang araw-araw, malaking kapayapaan sa aking kaluluwa. 🔥"',
    rozetYeni: 'NAKAKUHA AKO NG BAGONG BADGE!',
    rozetSozleri: [
      'Ngayon, gumawa ako ng mabuting hakbang para sa sarili ko! 🌟',
      'Nagpapatuloy ako nang may determinasyon; akin ang badge na ito! 💪',
      'Nakamit ko ang biyaya ng umaga! 🌅',
      'Bahagi ako ng daloy na ito na nakabubuti sa aking kaluluwa! ✨',
      'Ang maliliit na hakbang ay nagdadala ng malaking kapayapaan. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NAKAKUHA AKO NG BAGONG BADGE!',
      hedef_tamamlandi: 'NAABOT KO ANG AKING LAYUNIN!',
      seviye_atlandi: 'TUMAAS ANG ANTAS!',
      toparlanma_tamamlandi: 'BUMALIK AKO SA TAMANG LANDAS!',
      en_uzun_seri: 'BAGONG REKORD!',
      varsayilan: 'TAGUMPAY!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Gawin nawa itong pangmatagalan ng aking Panginoon. 🤲', 'Ang maliliit na hakbang ay nagdadala ng malaking kapayapaan. 🍃', 'Pagkalooban nawa tayong lahat ni Allah ng katatagan. 🌱'],
      hedef_tamamlandi: ['Ang maliliit na hakbang ay nagdadala ng malaking kapayapaan. 🍃', 'Gawin nawa itong pangmatagalan ni Allah. 🤲', 'Isa pang hakbang araw-araw. 🌱'],
      seviye_atlandi: [
        'Kaunti pa araw-araw; padaliin nawa ito ni Allah. 🍃',
        'Gawin nawa itong pangmatagalan ni Allah. 🤲',
        'Nagpapatuloy ang paglalakbay. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ang mahalaga ay hindi ang pagkadapa kundi ang pagbangon. 🔄',
        'Pagkalooban nawa tayo ni Allah ng katatagan. 🤲',
        'Nilalakad ang bawat daan nang may tiyaga. 🌱',
      ],
      en_uzun_seri: [
        'Maliit na hakbang araw-araw, malaking kapayapaan sa aking puso. 🍃',
        'Gawin nawa itong pangmatagalan ni Allah. 🤲',
        'Pagkalooban nawa tayong lahat ng aking Panginoon ng katatagan. 🌱',
      ],
    },
  },
};
