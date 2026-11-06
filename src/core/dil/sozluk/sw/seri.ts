import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Mfululizo wako unawaka',
    enUzun: cogul({ one: 'Mfululizo mrefu zaidi: siku {n}', other: 'Mfululizo mrefu zaidi: siku {n}' }),
    gunBuyuk: cogul({ one: 'SIKU', other: 'SIKU' }),
    sonrakiHedef: 'Lengo linalofuata: siku ya {hedef} ({durum})',
    kalanGun: cogul({ one: 'Imebaki siku {n}', other: 'Zimebaki siku {n}' }),
    tamamlandi: 'Imekamilika',
    paylasErisim: 'Shiriki maendeleo yako',
    paylasBuyuk: 'SHIRIKI MAENDELEO YAKO',
  },

  hedefler: {
    ilk_adim: { ad: 'Wiki ya Kwanza', aciklama: 'Siku 7 za kuswali bila kukatiza', cumle: 'Wiki ya kwanza' },
    aliskanlik_ustasi: { ad: 'Bingwa wa Mazoea', aciklama: 'Siku 21 - kipindi cha kujenga mazoea', cumle: 'Bingwa wa mazoea' },
    kararlilik: { ad: 'Uthabiti', aciklama: 'Siku 60 bila kukatiza', cumle: 'Uthabiti' },
    efsane: { ad: 'Gwiji', aciklama: 'Siku 90 - uvumilivu wa kipekee', cumle: 'Gwiji' },
  },

  /** Majina ya daraja ya kale, kwa tahajia ya Kilatini (hayatafsiriwi). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafidh', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Hatua ya Kwanza', aciklama: 'Umekamilisha wiki yako ya kwanza.', kosul: 'Mfululizo wa siku 7' },
    aliskanlik_ustasi: {
      ad: 'Bingwa wa Mazoea',
      aciklama: 'Siku 21 - kipindi cha kujenga mazoea kimekamilika.',
      kosul: 'Mfululizo wa siku 21',
    },
    kararlilik: { ad: 'Imara', aciklama: 'Umeswali kwa siku 60 bila kukatiza.', kosul: 'Mfululizo wa siku 60' },
    efsane: { ad: 'Gwiji', aciklama: 'Siku 90 - umeonyesha uvumilivu wa kipekee.', kosul: 'Mfululizo wa siku 90' },
    toparlanma_ustasi: {
      ad: 'Bingwa wa Kurejea',
      aciklama: 'Umekamilisha hali ya kurejea mara 3.',
      kosul: 'Kurejea mara 3',
    },
    mukemmeliyetci: { ad: 'Mkamilifu', aciklama: 'Umeswali 5/5 kwa siku 30.', kosul: 'Siku 30 za Swala 5/5' },
    yuz_namaz: { ad: 'Swala 100', aciklama: 'Umeswali Swala 100 kwa jumla.', kosul: 'Swala 100 kwa jumla' },
    bin_namaz: { ad: 'Swala 1000', aciklama: 'Umeswali Swala 1000 kwa jumla.', kosul: 'Swala 1000 kwa jumla' },
  },

  rozetSeviyeleri: { bronz: 'SHABA', gumus: 'FEDHA', altin: 'DHAHABU', elmas: 'ALMASI' },

  gunBitis: {
    erken: 'Kwa wanaolala mapema',
    varsayilan: 'Chaguo-msingi - kabla ya Alfajiri katika maeneo mengi',
    gec: 'Kwa wanaolala kwa kuchelewa',
  },

  kutlama: {
    rozetEklendi: '🏅 Imeongezwa kwenye mkusanyiko wako wa beji',
    paylasin: 'Shiriki',
    rozetBaslik: 'Mwenyezi Mungu aifanye idumu',
    rozetMesaj: 'Umepata beji ya "{ad}".',
    hedefBaslik: cogul({ one: 'Siku {n}', other: 'Siku {n}' }),
    hedefMesaj: 'Umekamilisha lengo la "{ad}". Mwenyezi Mungu aifanye idumu.',
    yeniRank: 'Daraja jipya: {rank}',
    seviyeBaslik: 'Ngazi yako mpya',
    seviyeMesaj: 'Sasa unaendelea kama "{rank}". Mwenyezi Mungu aifanye idumu.',
    toparlanmaBaslik: 'Mfululizo wako umerudi',
    toparlanmaMesaj: cogul({
      one: 'Mfululizo wako wa siku {n} unaendelea ulipoishia. Mwenyezi Mungu akupe uthabiti.',
      other: 'Mfululizo wako wa siku {n} unaendelea ulipoishia. Mwenyezi Mungu akupe uthabiti.',
    }),
    enUzunBaslik: 'Mfululizo wako mrefu zaidi',
    enUzunMesaj: cogul({
      one: 'Siku {n}: mfululizo wako mrefu zaidi hadi sasa. Mwenyezi Mungu aifanye idumu.',
      other: 'Siku {n}: mfululizo wako mrefu zaidi hadi sasa. Mwenyezi Mungu aifanye idumu.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Kumbukumbu zako za zamani hazikuweza kusomwa kwa sasa.',
    yenidenErisim: 'Jaribu tena kupakia data ya mfululizo',
    yenidenDeneyin: 'Jaribu tena',
    yukleniyor: 'Inapakia data yako ya mfululizo...',
    gunlukSeri: 'siku za mfululizo',
    rekor: 'rekodi',
    sozErisim: '{metin} Chanzo: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Lengo linalofuata',
    tumu: 'Umekamilisha beji zote',
    kalan: cogul({ one: 'Beji ya {ad}: imebaki siku {n}', other: 'Beji ya {ad}: zimebaki siku {n}' }),
    tumuErisim: 'Umekamilisha beji zote: tasbihi imejaa.',
    erisim: 'Beji ya {ad}: siku {n} kati ya {hedef} zimekamilika.',
  },

  gok: {
    gunHarfleri: ['T', 'N', 'T', 'A', 'I', 'M', 'P'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Siku {n} imefikia lengo', other: 'Siku {n} zimefikia lengo' }),
    besVakit: cogul({ one: 'Siku {n} yenye Swala zote tano', other: 'Siku {n} zenye Swala zote tano' }),
    dondurulmus: cogul({ one: 'Siku {n} imegandishwa', other: 'Siku {n} zimegandishwa' }),
    mevcutSeri: cogul({ one: 'Mfululizo wa sasa: siku {n}.', other: 'Mfululizo wa sasa: siku {n}.' }),
  },

  hedefAyar: {
    azalt: 'Punguza',
    deger: 'Thamani',
    artir: 'Ongeza',
    esik: cogul({ one: 'Swala {n}', other: 'Swala {n}' }),
    sifirlaBaslik: 'Weka upya mfululizo',
    sifirlaMesaj: 'Data yako yote ya mfululizo (mfululizo, beji, pointi) itawekwa upya. Hili haliwezi kutenduliwa. Unataka kuendelea?',
    sifirla: 'Weka upya',
    iptal: 'Ghairi',
    basarili: 'Imekamilika',
    sifirlandi: 'Data yako ya mfululizo imewekwa upya.',
    hedefAyarlari: 'MIPANGILIO YA LENGO',
    tamGunEsigi: 'Kiwango cha siku kamili',
    tamGunAciklama: 'Huweka idadi ya chini ya Swala kwa siku inayohitajika ili siku hiyo ihesabiwe kwenye mfululizo wako',
    sifirlama: 'KUWEKA UPYA',
    verileriSifirla: 'Weka upya data ya mfululizo',
    verileriSifirlaAlt: 'Hufuta data yote ya mfululizo, beji na pointi',
  },

  rozetKarti: {
    erisim: 'Beji ya {ad}, {durum}',
    kazanildi: 'imepatikana',
    kilitli: 'imefungwa',
  },

  toparlanma: {
    kartBaslik: 'HALI YA KUREJEA',
    kartAltBaslik: 'Unaweza kurudisha mfululizo wako',
    kartMesaj: 'Unaweza kuendeleza mfululizo wako wa {vurgu} ulipoishia.',
    oncekiGun: cogul({ one: 'siku {n}', other: 'siku {n}' }),
    ilerleme: 'Siku {tamam}/{hedef} zimekamilika',
    kalan: cogul({
      one: 'Kamilisha Swala zote tano kwa siku {n} zaidi na mfululizo wako unaendelea ulipoishia.',
      other: 'Kamilisha Swala zote tano kwa siku {n} zaidi na mfululizo wako unaendelea ulipoishia.',
    }),
    bugun: 'Kamilisha leo na mfululizo wako unaendelea ulipoishia.',
    uyari: 'Siku lazima zifuatane; siku moja ikikosekana katikati, kurejea kunaanza upya.',
    kapatErisim: 'Funga maelezo ya kurejea',
    anladim: 'Nimeelewa',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Shiriki maendeleo yako',
    hazirDegilBaslik: 'Picha haiko tayari',
    hazirDegilMesaj: 'Picha bado haiko tayari. Jaribu tena baada ya sekunde chache.',
    olusturulamadiBaslik: 'Picha haikuweza kuundwa',
    olusturulamadiMesaj: 'Hitilafu imetokea wakati wa kuunda picha. Jaribu tena.',
    kullanilamiyorBaslik: 'Kushiriki hakupatikani',
    kullanilamiyorMesaj: 'Kushiriki hakupatikani kwenye kifaa hiki.',
    kapat: 'Funga',
    hikaye: 'Ongeza kwenye hadithi yako',
    platformlar: 'Inaweza kushirikiwa kwenye Instagram, WhatsApp na kwingineko.',
    tamam: 'Sawa',
    seriEnUzun: cogul({ one: 'Mfululizo Wangu Mrefu Zaidi: Siku {n}', other: 'Mfululizo Wangu Mrefu Zaidi: Siku {n}' }),
    seriZincir: cogul({ one: 'SIKU BILA KUKATA MNYORORO', other: 'SIKU BILA KUKATA MNYORORO' }),
    seriSoz: '"Hatua ndogo kila siku, utulivu mkubwa moyoni mwangu. 🔥"',
    rozetYeni: 'NIMEPATA BEJI MPYA',
    rozetSozleri: [
      'Leo nimepiga hatua nzuri kwa ajili yangu. 🌟',
      'Ninaendelea kwa azma; beji hii ni yangu. 💪',
      'Nimewahi baraka za asubuhi. 🌅',
      'Mimi ni sehemu ya mtiririko huu unaonufaisha roho yangu. ✨',
      'Hatua ndogo huleta utulivu mkubwa. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NIMEPATA BEJI MPYA',
      hedef_tamamlandi: 'NIMEFIKIA LENGO LANGU',
      seviye_atlandi: 'NGAZI MPYA',
      toparlanma_tamamlandi: 'NIMERUDI KWENYE NJIA',
      en_uzun_seri: 'REKODI MPYA',
      varsayilan: 'MAFANIKIO',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Mola wangu aifanye idumu. 🤲', 'Hatua ndogo huleta utulivu mkubwa. 🍃', 'Mwenyezi Mungu atupe sote uthabiti. 🌱'],
      hedef_tamamlandi: ['Hatua ndogo huleta utulivu mkubwa. 🍃', 'Mwenyezi Mungu aifanye idumu. 🤲', 'Hatua moja zaidi kila siku. 🌱'],
      seviye_atlandi: [
        'Kidogo zaidi kila siku; Mwenyezi Mungu airahisishe. 🍃',
        'Mwenyezi Mungu aifanye idumu. 🤲',
        'Safari inaendelea. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Jambo muhimu si kuanguka bali kuinuka. 🔄',
        'Mwenyezi Mungu atupe uthabiti. 🤲',
        'Kila njia hutembewa kwa subira. 🌱',
      ],
      en_uzun_seri: [
        'Hatua ndogo kila siku, utulivu mkubwa moyoni mwangu. 🍃',
        'Mwenyezi Mungu aifanye idumu. 🤲',
        'Mola wangu atupe sote uthabiti. 🌱',
      ],
    },
  },
};
