import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Y kellgã bee taoore',
    enUzun: cogul({ one: 'Kellg sẽn yɩɩd woglem: {n} raare', other: 'Kellg sẽn yɩɩd woglem: {n} rasem' }),
    gunBuyuk: cogul({ one: 'RAARE', other: 'RASEM' }),
    sonrakiHedef: 'Raab sẽn pʋgdẽ: raar {hedef} ({durum})',
    kalanGun: cogul({ one: '{n} raar n kell', other: '{n} rasem n kell' }),
    tamamlandi: 'A pida',
    paylasErisim: 'Tʋm-y y taoor-kẽndrã',
    paylasBuyuk: 'TƲM-Y Y TAOOR-KẼNDRÃ',
  },

  hedefler: {
    ilk_adim: { ad: 'Semeen sẽn deng', aciklama: 'Pʋʋs-y rasem 7 sẽn ka bas', cumle: 'Semeen sẽn deng' },
    aliskanlik_ustasi: { ad: 'Minim soaba', aciklama: 'Rasem 21 - minim maaneg wakato', cumle: 'Minim soaba' },
    kararlilik: { ad: 'Kell-n-tõogo', aciklama: 'Rasem 60 sẽn ka bas', cumle: 'Kell-n-tõogo' },
    efsane: { ad: 'Kɩbay soaba', aciklama: 'Rasem 90 - kell-n-tõog sẽn yɩɩda', cumle: 'Kɩbay soaba' },
  },

  /** Klasik derece adları, harf çevirisiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Taalib', 'Saalik', 'Muriid', 'Aarif', 'Haafiz', 'Kaamil'],

  rozetler: {
    ilk_adim: { ad: 'Tʋʋm sẽn deng', aciklama: 'Y pids y semeen sẽn deng pĩndã.', kosul: 'Rasem 7 kellgo' },
    aliskanlik_ustasi: {
      ad: 'Minim soaba',
      aciklama: 'Rasem 21 - minim maaneg wakatã pida.',
      kosul: 'Rasem 21 kellgo',
    },
    kararlilik: { ad: 'Kell-n-tõogo', aciklama: 'Y pʋʋsa rasem 60 sẽn ka bas.', kosul: 'Rasem 60 kellgo' },
    efsane: { ad: 'Kɩbay soaba', aciklama: 'Rasem 90 - y wilga kell-n-tõog sẽn yɩɩda.', kosul: 'Rasem 90 kellgo' },
    toparlanma_ustasi: {
      ad: 'Leb-n-sɩngr soaba',
      aciklama: 'Y pids leb-n-sɩngr wakatã naoor a tãabo.',
      kosul: 'Leb-n-sɩngr 3',
    },
    mukemmeliyetci: { ad: 'Pids-n-pids soaba', aciklama: 'Y pʋʋsa 5/5 rasem 30.', kosul: 'Rasem 30 ne pʋʋsg 5/5' },
    yuz_namaz: { ad: 'Pʋʋsg 100', aciklama: 'Y pʋʋsa pʋʋsg 100 fãa.', kosul: 'Pʋʋs-y pʋʋsg 100' },
    bin_namaz: { ad: 'Pʋʋsg 1000', aciklama: 'Y pʋʋsa pʋʋsg 1000 fãa.', kosul: 'Pʋʋs-y pʋʋsg 1000' },
  },

  rozetSeviyeleri: { bronz: 'BRÕNZ', gumus: 'WAN-PƐƐLGA', altin: 'SALMA', elmas: 'DIAMÃ' },

  gunBitis: {
    erken: 'Neb nins sẽn gõed yʋng-sɩngre',
    varsayilan: 'Sẽn be - Fagir taoore zĩis wʋsg pʋgẽ',
    gec: 'Neb nins sẽn gõed yʋng-zãnga',
  },

  kutlama: {
    rozetEklendi: '🏅 B paasa-a y kɩbã pʋgẽ',
    paylasin: 'Tʋm-y',
    rozetBaslik: 'Allah na kɩt tɩ a kell',
    rozetMesaj: 'Y paama "{ad}" kɩbga.',
    hedefBaslik: cogul({ one: '{n} raare', other: '{n} rasem' }),
    hedefMesaj: 'Y pids "{ad}" raabã. Allah na kɩt tɩ a kell.',
    yeniRank: 'Zĩig paalga: {rank}',
    seviyeBaslik: 'Y zĩig paalgã',
    seviyeMesaj: 'Masã y kẽnda taoore wala "{rank}". Allah na kɩt tɩ a kell.',
    toparlanmaBaslik: 'Y kellgã lebga',
    toparlanmaMesaj: cogul({
      one: 'Y kellg {n} rasem wã kẽnda taoore a sẽn bas zĩigẽ wã. Allah na kõ pãng n kell.',
      other: 'Y kellg {n} rasem wã kẽnda taoore a sẽn bas zĩigẽ wã. Allah na kõ pãng n kell.',
    }),
    enUzunBaslik: 'Y kellg sẽn yɩɩd woglem',
    enUzunMesaj: cogul({
      one: '{n} raare: y kellg sẽn yɩɩd woglem n tãag masã. Allah na kɩt tɩ a kell.',
      other: '{n} rasem: y kellg sẽn yɩɩd woglem n tãag masã. Allah na kɩt tɩ a kell.',
    }),
  },

  sekme: {
    hataOkunamadi: 'B pa tõe n karem y gʋlsg kʋdemsã masã ye.',
    yenidenErisim: 'Leb-y n wa ne kellg kibarã',
    yenidenDeneyin: 'Leb-y n maan',
    yukleniyor: 'Y kellg kibarã wata...',
    gunlukSeri: 'rasem kellgo',
    rekor: 'sẽn yɩɩd fãa',
    sozErisim: '{metin} Yi-zĩiga: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Raab sẽn pʋgdẽ',
    tumu: 'Y paama kɩbã fãa',
    kalan: cogul({ one: '{ad} kɩbga: {n} raar n kell', other: '{ad} kɩbga: {n} rasem n kell' }),
    tumuErisim: 'Y paama kɩbã fãa: tasbiihã pida.',
    erisim: '{ad} kɩbga: rasem {hedef} pʋgẽ, {n} pida.',
  },

  gok: {
    gunHarfleri: ['T', 'T', 'A', 'L', 'A', 'S', 'H'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: '{n} raar n ta raabã', other: '{n} rasem n ta raabã' }),
    besVakit: cogul({ one: '{n} raar ne pʋʋs-rãmbã a nu wã fãa', other: '{n} rasem ne pʋʋs-rãmbã a nu wã fãa' }),
    dondurulmus: cogul({ one: '{n} raar sẽn gũuse', other: '{n} rasem sẽn gũuse' }),
    mevcutSeri: cogul({ one: 'Kellg sẽn be masã: {n} raare.', other: 'Kellg sẽn be masã: {n} rasem.' }),
  },

  hedefAyar: {
    azalt: 'Boog-y',
    deger: 'Sõore',
    artir: 'Paas-y',
    esik: cogul({ one: '{n} pʋʋsgo', other: '{n} pʋʋsgo' }),
    sifirlaBaslik: 'Leb-y n sɩng kellgã',
    sifirlaMesaj: 'Y kellg kibarã fãa (kellgo, kɩba, sõore) na n leb n sɩnga. Y pa tõe n lebs-a ye. Y rata n kell taoore?',
    sifirla: 'Leb-y n sɩng',
    iptal: 'Bas-y',
    basarili: 'A sɛɛme',
    sifirlandi: 'Y kellg kibarã leba n sɩnga.',
    hedefAyarlari: 'RAABÃ SEGLGO',
    tamGunEsigi: 'Raar pidsg sõore',
    tamGunAciklama: 'A seglda pʋʋs-rãmb sõor sẽn segd raar fãa tɩ raarã sõd y kellgã pʋgẽ',
    sifirlama: 'LEB-N-SƖNGRE',
    verileriSifirla: 'Leb-y n sɩng kellg kibarã',
    verileriSifirlaAlt: 'A yikda kellgã, kɩbã la sõorã kibar fãa',
  },

  rozetKarti: {
    erisim: '{ad} kɩbga, {durum}',
    kazanildi: 'y paama',
    kilitli: 'pagame',
  },

  toparlanma: {
    kartBaslik: 'LEB-N-SƖNGR WAKATO',
    kartAltBaslik: 'Y tõe n leb n paam y kellgã',
    kartMesaj: 'Y tõe n kell ne y {vurgu} kellgã a sẽn bas zĩigẽ wã.',
    oncekiGun: cogul({ one: '{n} rasem', other: '{n} rasem' }),
    ilerleme: 'Rasem {hedef} pʋgẽ, {tamam} pida',
    kalan: cogul({
      one: 'Pids-y pʋʋs-rãmbã a nu wã fãa {n} raar n paase, la y kellgã na n kell a sẽn bas zĩigẽ wã.',
      other: 'Pids-y pʋʋs-rãmbã a nu wã fãa {n} rasem n paase, la y kellgã na n kell a sẽn bas zĩigẽ wã.',
    }),
    bugun: 'Pids-y rũndã la y kellgã na n kell a sẽn bas zĩigẽ wã.',
    uyari: 'Rasmã segd n pʋg taaba; raar a ye sã n põs sʋka, leb-n-sɩngrã leb n sɩngda.',
    kapatErisim: 'Pag-y leb-n-sɩngr vẽnegrã',
    anladim: 'M wʋma',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Tʋm-y y taoor-kẽndrã',
    hazirDegilBaslik: 'Foto wã nan ka segl ye',
    hazirDegilMesaj: 'Foto wã nan ka segl ye. Leb-y n maan sekõnd bilf poorẽ.',
    olusturulamadiBaslik: 'B pa tõog n maan foto wã ye',
    olusturulamadiMesaj: 'Bũmb n tudg foto wã maaneg pʋgẽ. Leb-y n maan.',
    kullanilamiyorBaslik: 'Tʋmsg ka be ye',
    kullanilamiyorMesaj: 'Tʋmsg pa be masĩn-kãngã pʋgẽ ye.',
    kapat: 'Pag-y',
    hikaye: 'Paas-y y kibar-kʋʋg pʋgẽ',
    platformlar: 'Y tõe n tʋm-a Instagram, WhatsApp la a taaba.',
    tamam: 'A sõmame',
    seriEnUzun: cogul({ one: 'M kellg sẽn yɩɩd woglem: {n} raare', other: 'M kellg sẽn yɩɩd woglem: {n} rasem' }),
    seriZincir: cogul({ one: 'RAARE SẼN KA BAS', other: 'RASEM SẼN KA BAS' }),
    seriSoz: '"Tʋʋm bilf raar fãa, sũ-noog kãseng m sũurẽ. 🔥"',
    rozetYeni: 'M PAAMA KƖBG PAALGA',
    rozetSozleri: [
      'Rũndã m maana tʋʋm-sõng m meng yĩnga. 🌟',
      'M kẽnda taoore ne yam-tʋʋdo; kɩbg-kãngã yaa maam rẽnda. 💪',
      'M paama yibeoogã barka. 🌅',
      'M bee sor-kãng sẽn yaa sõma ne m sũurã pʋgẽ. ✨',
      'Tʋʋm bilf wata ne sũ-noog kãsenga. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'M PAAMA KƖBG PAALGA',
      hedef_tamamlandi: 'M TA M RAABÃ',
      seviye_atlandi: 'ZĨIG PAALGA',
      toparlanma_tamamlandi: 'M LEBGA SORẼ',
      en_uzun_seri: 'SẼN YƖƖD FÃA PAALGA',
      varsayilan: 'TƲƲM-SÕNGO',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['M Soabã na kɩt tɩ a kell. 🤲', 'Tʋʋm bilf wata ne sũ-noog kãsenga. 🍃', 'Allah na kõ tõnd fãa pãng n kell. 🌱'],
      hedef_tamamlandi: ['Tʋʋm bilf wata ne sũ-noog kãsenga. 🍃', 'Allah na kɩt tɩ a kell. 🤲', 'Tʋʋm a ye n paase raar fãa. 🌱'],
      seviye_atlandi: [
        'Bilf n paase raar fãa; Allah na kɩt tɩ a yɩ nana. 🍃',
        'Allah na kɩt tɩ a kell. 🤲',
        'Sorã kẽnda taoore. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Sẽn tar yõod pa lʋɩɩb ye, la yikr. 🔄',
        'Allah na kõ pãng n kell. 🤲',
        'Sor fãa, b kẽnda-a ne sugri. 🌱',
      ],
      en_uzun_seri: [
        'Tʋʋm bilf raar fãa, sũ-noog kãseng m sũurẽ. 🍃',
        'Allah na kɩt tɩ a kell. 🤲',
        'M Soabã na kõ tõnd fãa pãng n kell. 🌱',
      ],
    },
  },
};
