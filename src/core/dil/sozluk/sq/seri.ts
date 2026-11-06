import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * "Allah daim etsin" → "Allahu e bëftë të qëndrueshme"; "Allah sebat versin" → "Allahu na dhëntë
 * qëndrueshmëri". Paylaşılan söz kişinin kendi sesidir (unë), övünme değil.
 */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Seria juaj po vazhdon',
    enUzun: cogul({ one: 'Seria më e gjatë: {n} ditë', other: 'Seria më e gjatë: {n} ditë' }),
    gunBuyuk: cogul({ one: 'DITË', other: 'DITË' }),
    sonrakiHedef: 'Synimi i radhës: dita {hedef} ({durum})',
    kalanGun: cogul({ one: 'Edhe {n} ditë', other: 'Edhe {n} ditë' }),
    tamamlandi: 'U plotësua!',
    paylasErisim: 'Ndani përparimin tuaj',
    paylasBuyuk: 'NDANI PËRPARIMIN TUAJ',
  },

  hedefler: {
    ilk_adim: { ad: 'Java e Parë', aciklama: 'Falni namaz 7 ditë pa ndërprerje', cumle: 'Java e parë' },
    aliskanlik_ustasi: { ad: 'Mjeshtër i Zakonit', aciklama: '21 ditë - koha e krijimit të zakonit', cumle: 'Mjeshtër i zakonit' },
    kararlilik: { ad: 'Vendosmëria', aciklama: '60 ditë pa ndërprerje', cumle: 'Vendosmëria' },
    efsane: { ad: 'Legjenda', aciklama: '90 ditë - qëndrueshmëri e jashtëzakonshme', cumle: 'Legjenda' },
  },

  /** Emrat klasikë të niveleve, të transliteruar (jo të përkthyer). */
  seviyeler: ['Mubtedi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Hapi i Parë', aciklama: 'E plotësuat javën e parë!', kosul: 'Seri 7 ditore' },
    aliskanlik_ustasi: {
      ad: 'Mjeshtër i Zakonit',
      aciklama: '21 ditë - koha e krijimit të zakonit u plotësua!',
      kosul: 'Seri 21 ditore',
    },
    kararlilik: { ad: 'I Vendosur', aciklama: 'Falët namaz 60 ditë pa ndërprerje!', kosul: 'Seri 60 ditore' },
    efsane: { ad: 'Legjenda', aciklama: '90 ditë - treguat qëndrueshmëri të jashtëzakonshme!', kosul: 'Seri 90 ditore' },
    toparlanma_ustasi: {
      ad: 'Mjeshtër i Rimëkëmbjes',
      aciklama: 'E plotësuat modalitetin e rimëkëmbjes 3 herë!',
      kosul: '3 rimëkëmbje',
    },
    mukemmeliyetci: { ad: 'Perfeksionist', aciklama: 'Falët 5/5 namaze për 30 ditë!', kosul: '30 ditë me 5/5 namaze' },
    yuz_namaz: { ad: '100 Namaze', aciklama: 'Falët gjithsej 100 namaze!', kosul: 'Falni 100 namaze' },
    bin_namaz: { ad: '1000 Namaze', aciklama: 'Falët gjithsej 1000 namaze!', kosul: 'Falni 1000 namaze' },
  },

  rozetSeviyeleri: { bronz: 'BRONZ', gumus: 'ARGJEND', altin: 'AR', elmas: 'DIAMANT' },

  gunBitis: {
    erken: 'Për ata që flenë herët',
    varsayilan: 'Parazgjedhje - para sabahut në shumicën e vendeve',
    gec: 'Për ata që flenë vonë',
  },

  kutlama: {
    rozetEklendi: '🏅 U shtua në koleksionin tuaj të distinktivëve',
    paylasin: 'Ndani',
    rozetBaslik: 'Allahu e bëftë të qëndrueshme',
    rozetMesaj: 'Fituat distinktivin "{ad}".',
    hedefBaslik: cogul({ one: '{n} ditë', other: '{n} ditë' }),
    hedefMesaj: 'E plotësuat synimin "{ad}". Allahu e bëftë të qëndrueshme.',
    seviyeBaslik: 'Niveli juaj i ri',
    yeniRank: 'Niveli i ri: {rank}',
    seviyeMesaj: 'Tani vazhdoni si "{rank}". Allahu e bëftë të qëndrueshme.',
    toparlanmaBaslik: 'Seria juaj u rikthye',
    toparlanmaMesaj: cogul({
      one: 'Seria juaj {n} ditore vazhdon aty ku mbeti. Allahu ju dhëntë qëndrueshmëri.',
      other: 'Seria juaj {n} ditore vazhdon aty ku mbeti. Allahu ju dhëntë qëndrueshmëri.',
    }),
    enUzunBaslik: 'Seria juaj më e gjatë',
    enUzunMesaj: cogul({
      one: '{n} ditë: seria juaj më e gjatë deri tani. Allahu e bëftë të qëndrueshme.',
      other: '{n} ditë: seria juaj më e gjatë deri tani. Allahu e bëftë të qëndrueshme.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Regjistrimet tuaja të kaluara nuk mund të lexohen tani.',
    yenidenErisim: 'Provoni sërish të dhënat e serisë',
    yenidenDeneyin: 'Provoni sërish',
    yukleniyor: 'Po ngarkohen të dhënat e serisë...',
    gunlukSeri: 'ditë seri',
    rekor: 'rekord',
    sozErisim: '{metin} Burimi: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Synimi i radhës',
    tumu: 'I plotësuat të gjithë distinktivët',
    kalan: cogul({ one: 'Distinktivi {ad}: edhe {n} ditë', other: 'Distinktivi {ad}: edhe {n} ditë' }),
    tumuErisim: 'I plotësuat të gjithë distinktivët: tesbihu është plot.',
    erisim: 'Distinktivi {ad}: {n} nga {hedef} ditë të plotësuara.',
  },

  gok: {
    gunHarfleri: ['H', 'M', 'M', 'E', 'P', 'S', 'D'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} ditë në synim', other: '{n} ditë në synim' }),
    besVakit: cogul({ one: '{n} ditë me të pesë vaktet', other: '{n} ditë me të pesë vaktet' }),
    dondurulmus: cogul({ one: '{n} ditë e ngrirë', other: '{n} ditë të ngrira' }),
    mevcutSeri: cogul({ one: 'Seria aktuale: {n} ditë.', other: 'Seria aktuale: {n} ditë.' }),
  },

  hedefAyar: {
    azalt: 'Zvogëloni',
    deger: 'Vlera',
    artir: 'Rritni',
    esik: cogul({ one: '{n} vakt', other: '{n} vakte' }),
    sifirlaBaslik: 'Rivendosni serinë',
    sifirlaMesaj: 'Të gjitha të dhënat e serisë (seria, distinktivët, pikët) do të rivendosen. Ky veprim nuk mund të zhbëhet. Doni të vazhdoni?',
    sifirla: 'Rivendosni',
    iptal: 'Anuloni',
    basarili: 'U krye',
    sifirlandi: 'Të dhënat e serisë u rivendosën.',
    hedefAyarlari: 'CILËSIMET E SYNIMIT',
    tamGunEsigi: 'Pragu i ditës së plotë',
    tamGunAciklama: 'Cakton numrin minimal të namazeve në ditë që dita të llogaritet në seri',
    sifirlama: 'RIVENDOSJA',
    verileriSifirla: 'Rivendosni të dhënat e serisë',
    verileriSifirlaAlt: 'Fshin të gjitha të dhënat e serisë, distinktivëve dhe pikëve',
  },

  rozetKarti: {
    erisim: 'Distinktivi {ad}, {durum}',
    kazanildi: 'i fituar',
    kilitli: 'i kyçur',
  },

  toparlanma: {
    kartBaslik: 'MODALITETI I RIMËKËMBJES',
    kartAltBaslik: 'Mund ta rifitoni serinë tuaj',
    kartMesaj: 'Mund ta vazhdoni serinë tuaj {vurgu} aty ku mbetët.',
    oncekiGun: cogul({ one: '{n} ditore', other: '{n} ditore' }),
    ilerleme: '{tamam}/{hedef} ditë të plotësuara',
    kalan: cogul({
      one: 'Kur të plotësoni të pesë vaktet edhe {n} ditë, seria juaj vazhdon aty ku mbeti.',
      other: 'Kur të plotësoni të pesë vaktet edhe {n} ditë, seria juaj vazhdon aty ku mbeti.',
    }),
    bugun: 'Kur ta plotësoni ditën e sotme, seria juaj vazhdon aty ku mbeti.',
    uyari: 'Mjafton t’i plotësoni këto ditë radhazi; nëse mbetet një ditë bosh ndërmjet, rimëkëmbja fillon nga e para.',
    kapatErisim: 'Mbyllni detajet e rimëkëmbjes',
    anladim: 'E kuptova',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Ndani përparimin tuaj',
    hazirDegilBaslik: 'Figura nuk është gati',
    hazirDegilMesaj: 'Figura nuk është ende gati. Provoni sërish pas disa sekondash.',
    olusturulamadiBaslik: 'Figura nuk u krijua',
    olusturulamadiMesaj: 'Ndodhi një gabim gjatë krijimit të figurës. Provoni sërish.',
    kullanilamiyorBaslik: 'Ndarja nuk është në dispozicion',
    kullanilamiyorMesaj: 'Ndarja nuk është në dispozicion në këtë pajisje.',
    kapat: 'Mbyllni',
    hikaye: 'Shtojeni në story-n tuaj',
    platformlar: 'Mund të ndahet në Instagram, WhatsApp dhe të tjera.',
    tamam: 'Në rregull',
    seriEnUzun: cogul({ one: 'Seria ime më e gjatë: {n} ditë', other: 'Seria ime më e gjatë: {n} ditë' }),
    seriZincir: cogul({ one: 'DITË PA E KËPUTUR ZINXHIRIN!', other: 'DITË PA E KËPUTUR ZINXHIRIN!' }),
    seriSoz: '"Një hap i vogël çdo ditë, një qetësi e madhe në shpirt. 🔥"',
    rozetYeni: 'FITOVA NJË DISTINKTIV TË RI!',
    rozetSozleri: [
      'Sot bëra një hap të mirë për veten! 🌟',
      'Vazhdoj me vendosmëri, ky distinktiv është imi! 💪',
      'E kapa bekimin e mëngjesit! 🌅',
      'Edhe unë jam pjesë e kësaj rrjedhe që i bën mirë shpirtit! ✨',
      'Hapat e vegjël sjellin qetësi të madhe. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'FITOVA NJË DISTINKTIV TË RI!',
      hedef_tamamlandi: 'E ARRITA SYNIMIN!',
      seviye_atlandi: 'NIVEL I RI!',
      toparlanma_tamamlandi: 'U RIMËKËMBA!',
      en_uzun_seri: 'REKORD I RI!',
      varsayilan: 'ARRITJE!',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Zoti e bëftë të qëndrueshme. 🤲', 'Hapat e vegjël sjellin qetësi të madhe. 🍃', 'Allahu na dhëntë të gjithëve qëndrueshmëri. 🌱'],
      hedef_tamamlandi: ['Hapat e vegjël sjellin qetësi të madhe. 🍃', 'Allahu e bëftë të qëndrueshme. 🤲', 'Çdo ditë edhe një hap. 🌱'],
      seviye_atlandi: [
        'Çdo ditë eci pak më tutje; Allahu e lehtësoftë. 🍃',
        'Allahu e bëftë të qëndrueshme. 🤲',
        'Rrugëtimi vazhdon. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Rëndësi nuk ka rënia, por ngritja. 🔄',
        'Allahu na dhëntë qëndrueshmëri. 🤲',
        'Me durim ecet çdo rrugë. 🌱',
      ],
      en_uzun_seri: [
        'Një hap i vogël çdo ditë, një qetësi e madhe në zemër. 🍃',
        'Allahu e bëftë të qëndrueshme. 🤲',
        'Zoti na dhëntë të gjithëve qëndrueshmëri. 🌱',
      ],
    },
  },
};
