import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri "toatoaso" (devamlılık). Dua kalıpları istek kipiyle ("Allah mma …"); övgü ve "!" yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Wo toatoaso redɛw',
    enUzun: cogul({ one: 'Toatoaso a ɛware sen biara: da {n}', other: 'Toatoaso a ɛware sen biara: nna {n}' }),
    gunBuyuk: cogul({ one: 'DA', other: 'NNA' }),
    sonrakiHedef: 'Botaeɛ a ɛdi hɔ: da {hedef} ({durum})',
    kalanGun: cogul({ one: 'Da {n} aka', other: 'Nna {n} aka' }),
    tamamlandi: 'Awie',
    paylasErisim: 'Kyɛ wo nkɔsoɔ',
    paylasBuyuk: 'KYƐ WO NKƆSOƆ',
  },

  hedefler: {
    ilk_adim: { ad: 'Nnawɔtwe a Edi Kan', aciklama: 'Yɛ Nyamefrɛ nna 7 a wonnyae', cumle: 'Nnawɔtwe a edi kan' },
    aliskanlik_ustasi: { ad: 'Suban Wura', aciklama: 'Nna 21 - berɛ a suban yɛ den', cumle: 'Suban wura' },
    kararlilik: { ad: 'Gyinapintinn', aciklama: 'Nna 60 a wonnyae', cumle: 'Gyinapintinn' },
    efsane: { ad: 'Abakɔsɛm', aciklama: 'Nna 90 - boasetɔ kɛseɛ', cumle: 'Abakɔsɛm' },
  },

  /** Klasik mertebe adları, Latin harfle (çeviri değil). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Anammɔn a Edi Kan', aciklama: 'Woawie wo nnawɔtwe a edi kan.', kosul: 'Toatoaso nna 7' },
    aliskanlik_ustasi: {
      ad: 'Suban Wura',
      aciklama: 'Nna 21 - woawie berɛ a suban yɛ den.',
      kosul: 'Toatoaso nna 21',
    },
    kararlilik: { ad: 'Ogyinapintinnfoɔ', aciklama: 'Woayɛ Nyamefrɛ nna 60 a wonnyae.', kosul: 'Toatoaso nna 60' },
    efsane: { ad: 'Abakɔsɛm', aciklama: 'Nna 90 - woakyerɛ boasetɔ kɛseɛ.', kosul: 'Toatoaso nna 90' },
    toparlanma_ustasi: {
      ad: 'San-tu-mu Wura',
      aciklama: 'Woawie san-tu-mu tebea mprɛ 3.',
      kosul: 'San-tu-mu 3',
    },
    mukemmeliyetci: { ad: 'Pɛpɛɛpɛ', aciklama: 'Woayɛ 5/5 nna 30.', kosul: 'Nna 30 a Nyamefrɛ yɛ 5/5' },
    yuz_namaz: { ad: 'Nyamefrɛ 100', aciklama: 'Woayɛ Nyamefrɛ 100 nyinaa.', kosul: 'Yɛ Nyamefrɛ 100' },
    bin_namaz: { ad: 'Nyamefrɛ 1000', aciklama: 'Woayɛ Nyamefrɛ 1000 nyinaa.', kosul: 'Yɛ Nyamefrɛ 1000' },
  },

  rozetSeviyeleri: { bronz: 'KƆBERE', gumus: 'DWETƐ', altin: 'SIKA KƆKƆƆ', elmas: 'DAAMAN' },

  gunBitis: {
    erken: 'Ma wɔn a wɔda ntɛm',
    varsayilan: 'Deɛ ɛtaa yɛ - ansa na Fajr adu wɔ mmeaeɛ pii',
    gec: 'Ma wɔn a wɔkyɛ ansa na wɔada',
  },

  kutlama: {
    rozetEklendi: '🏅 Wɔde aka wo agyiraeɛ ho',
    paylasin: 'Kyɛ',
    rozetBaslik: 'Allah mma ɛnkɔ so',
    rozetMesaj: 'Woanya "{ad}" agyiraeɛ no.',
    hedefBaslik: cogul({ one: 'Da {n}', other: 'Nna {n}' }),
    hedefMesaj: 'Woawie "{ad}" botaeɛ no. Allah mma ɛnkɔ so.',
    yeniRank: 'Gyinabea foforo: {rank}',
    seviyeBaslik: 'Wo gyinabea foforo',
    seviyeMesaj: 'Seesei wokɔ so sɛ "{rank}". Allah mma ɛnkɔ so.',
    toparlanmaBaslik: 'Wo toatoaso asan aba',
    toparlanmaMesaj: cogul({
      one: 'Wo toatoaso da {n} kɔ so firi baabi a ɛgyinaeɛ. Allah mma wo nnyina pintinn.',
      other: 'Wo toatoaso nna {n} kɔ so firi baabi a ɛgyinaeɛ. Allah mma wo nnyina pintinn.',
    }),
    enUzunBaslik: 'Wo toatoaso a ɛware sen biara',
    enUzunMesaj: cogul({
      one: 'Da {n}: wo toatoaso a ɛware sen biara kosi seesei. Allah mma ɛnkɔ so.',
      other: 'Nna {n}: wo toatoaso a ɛware sen biara kosi seesei. Allah mma ɛnkɔ so.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Wɔntumi nkenkan wo nsɛm a atwam mprempren.',
    yenidenErisim: 'San bɔ mmɔden fa toatoaso nsɛm no bra',
    yenidenDeneyin: 'San bɔ mmɔden',
    yukleniyor: 'Ɛreba wo toatoaso nsɛm...',
    gunlukSeri: 'nna toatoaso',
    rekor: 'deɛ ɛkorɔn',
    sozErisim: '{metin} Fibea: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Botaeɛ a ɛdi hɔ',
    tumu: 'Woanya agyiraeɛ nyinaa',
    kalan: cogul({ one: '{ad} agyiraeɛ: da {n} aka', other: '{ad} agyiraeɛ: nna {n} aka' }),
    tumuErisim: 'Woanya agyiraeɛ nyinaa: tasbih no ayɛ ma.',
    erisim: '{ad} agyiraeɛ: nna {hedef} mu {n} awie.',
  },

  gok: {
    gunHarfleri: ['D', 'B', 'W', 'Y', 'F', 'M', 'K'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Da {n} duruu botaeɛ', other: 'Nna {n} duruu botaeɛ' }),
    besVakit: cogul({ one: 'Da {n} a Nyamefrɛ anum no nyinaa wɔ mu', other: 'Nna {n} a Nyamefrɛ anum no nyinaa wɔ mu' }),
    dondurulmus: cogul({ one: 'Da {n} a wɔasiw', other: 'Nna {n} a wɔasiw' }),
    mevcutSeri: cogul({ one: 'Toatoaso seesei: da {n}.', other: 'Toatoaso seesei: nna {n}.' }),
  },

  hedefAyar: {
    azalt: 'Te so',
    deger: 'Bo',
    artir: 'Fa ka ho',
    esik: cogul({ one: 'Nyamefrɛ {n}', other: 'Nyamefrɛ {n}' }),
    sifirlaBaslik: 'San toatoaso no fi ase',
    sifirlaMesaj: 'Wo toatoaso nsɛm nyinaa (toatoaso, agyiraeɛ, akontaa) bɛsan afi ase. Wontumi nsan nnane. Wopɛ sɛ wotoa so?',
    sifirla: 'San fi ase',
    iptal: 'Gyae',
    basarili: 'Ayɛ',
    sifirlandi: 'Wo toatoaso nsɛm asan afi ase.',
    hedefAyarlari: 'BOTAEƐ NHYEHYƐE',
    tamGunEsigi: 'Da mũ anohyeto',
    tamGunAciklama: 'Ɛhyɛ Nyamefrɛ dodoɔ a ɛsɛ sɛ woyɛ da biara ansa na saa da no aka wo toatoaso ho',
    sifirlama: 'SAN FI ASE',
    verileriSifirla: 'San toatoaso nsɛm fi ase',
    verileriSifirlaAlt: 'Ɛpopa toatoaso, agyiraeɛ ne akontaa nsɛm nyinaa',
  },

  rozetKarti: {
    erisim: '{ad} agyiraeɛ, {durum}',
    kazanildi: 'woanya',
    kilitli: 'ato mu',
  },

  toparlanma: {
    kartBaslik: 'SAN-TU-MU TEBEA',
    kartAltBaslik: 'Wobɛtumi asan anya wo toatoaso',
    kartMesaj: 'Wobɛtumi atoa wo {vurgu} toatoaso so firi baabi a ɛgyinaeɛ.',
    oncekiGun: cogul({ one: 'da {n}', other: 'nna {n}' }),
    ilerleme: 'Nna {hedef} mu {tamam} awie',
    kalan: cogul({
      one: 'Yɛ Nyamefrɛ anum no nyinaa da {n} bio na wo toatoaso bɛkɔ so firi baabi a ɛgyinaeɛ.',
      other: 'Yɛ Nyamefrɛ anum no nyinaa nna {n} bio na wo toatoaso bɛkɔ so firi baabi a ɛgyinaeɛ.',
    }),
    bugun: 'Wie ɛnnɛ na wo toatoaso bɛkɔ so firi baabi a ɛgyinaeɛ.',
    uyari: 'Ɛsɛ sɛ nna no toatoa so; sɛ da bi twa mu a, san-tu-mu no san fi ase.',
    kapatErisim: 'To san-tu-mu nkyerɛkyerɛmu mu',
    anladim: 'Mate ase',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Kyɛ wo nkɔsoɔ',
    hazirDegilBaslik: 'Mfoni no nnya nsiesieeɛ',
    hazirDegilMesaj: 'Mfoni no nnya nsiesieeɛ. San bɔ mmɔden wɔ sima sini kakra mu.',
    olusturulamadiBaslik: 'Wɔantumi anyɛ mfoni no',
    olusturulamadiMesaj: 'Biribi ankɔ yie berɛ a wɔreyɛ mfoni no. San bɔ mmɔden.',
    kullanilamiyorBaslik: 'Kyɛ nni hɔ',
    kullanilamiyorMesaj: 'Wɔntumi nkyɛ wɔ afidie yi so.',
    kapat: 'To mu',
    hikaye: 'Fa ka wo story ho',
    platformlar: 'Wobɛtumi akyɛ wɔ Instagram, WhatsApp ne afoforo so.',
    tamam: 'Ɛyɛ',
    seriEnUzun: cogul({ one: 'Me Toatoaso a Ɛware Sen Biara: Da {n}', other: 'Me Toatoaso a Ɛware Sen Biara: Nna {n}' }),
    seriZincir: cogul({ one: 'DA A MENNTWA NKƆNSƆNKƆNSƆN NO', other: 'NNA A MENNTWA NKƆNSƆNKƆNSƆN NO' }),
    seriSoz: '"Anammɔn ketewa da biara, asomdwoeɛ kɛseɛ wɔ me kra mu. 🔥"',
    rozetYeni: 'MANYA AGYIRAEƐ FOFORO',
    rozetSozleri: [
      'Ɛnnɛ matu anammɔn pa ama me ho. 🌟',
      'Mekɔ so pintinn; agyiraeɛ yi yɛ me deɛ. 💪',
      'Manya anɔpa nhyira. 🌅',
      'Meka saa nhyehyɛeɛ a ɛyɛ me kra papa yi ho. ✨',
      'Anammɔn nketewa de asomdwoeɛ kɛseɛ ba. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'MANYA AGYIRAEƐ FOFORO',
      hedef_tamamlandi: 'MADURU ME BOTAEƐ',
      seviye_atlandi: 'GYINABEA FOFORO',
      toparlanma_tamamlandi: 'MASAN ABA KWAN SO',
      en_uzun_seri: 'DEƐ ƐKORƆN FOFORO',
      varsayilan: 'NKONIMDIE',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Me Wura mma ɛnkɔ so. 🤲', 'Anammɔn nketewa de asomdwoeɛ kɛseɛ ba. 🍃', 'Allah mma yɛn nyinaa nnyina pintinn. 🌱'],
      hedef_tamamlandi: ['Anammɔn nketewa de asomdwoeɛ kɛseɛ ba. 🍃', 'Allah mma ɛnkɔ so. 🤲', 'Anammɔn baako bio da biara. 🌱'],
      seviye_atlandi: [
        'Kakra bio da biara; Allah mma ɛnyɛ mmerɛw. 🍃',
        'Allah mma ɛnkɔ so. 🤲',
        'Akwantuo no kɔ so. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ɛnyɛ hwe na ɛho hia, na mmom sɔre. 🔄',
        'Allah mma yɛn nnyina pintinn. 🤲',
        'Boasetɔ na yɛde nante kwan biara so. 🌱',
      ],
      en_uzun_seri: [
        'Anammɔn ketewa da biara, asomdwoeɛ kɛseɛ wɔ m’akoma mu. 🍃',
        'Allah mma ɛnkɔ so. 🤲',
        'Me Wura mma yɛn nyinaa nnyina pintinn. 🌱',
      ],
    },
  },
};
