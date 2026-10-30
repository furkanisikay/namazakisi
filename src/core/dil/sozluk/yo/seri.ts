import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = "ìtẹ̀léra" (art arda gelme). Övgü ünlemi yazılmaz; kutlama dua kalıbıyla. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Ìtẹ̀léra yín ń jó',
    enUzun: cogul({ other: 'Ìtẹ̀léra tó gùn jùlọ: ọjọ́ {n}' }),
    gunBuyuk: cogul({ other: 'ỌJỌ́' }),
    sonrakiHedef: 'Àfojúsùn tó kàn: ọjọ́ {hedef} ({durum})',
    kalanGun: cogul({ other: 'Ọjọ́ {n} ló kù' }),
    tamamlandi: 'Ó ti parí',
    paylasErisim: 'Pín ìtẹ̀síwájú yín',
    paylasBuyuk: 'PÍN ÌTẸ̀SÍWÁJÚ YÍN',
  },

  hedefler: {
    ilk_adim: { ad: 'Ọ̀sẹ̀ Àkọ́kọ́', aciklama: 'Kírun fún ọjọ́ 7 láìdáwọ́dúró', cumle: 'Ọ̀sẹ̀ àkọ́kọ́' },
    aliskanlik_ustasi: { ad: 'Ọ̀gá Àṣà', aciklama: 'Ọjọ́ 21 - àsìkò kíkọ́ àṣà', cumle: 'Ọ̀gá àṣà' },
    kararlilik: { ad: 'Ìdúróṣinṣin', aciklama: 'Ọjọ́ 60 láìdáwọ́dúró', cumle: 'Ìdúróṣinṣin' },
    efsane: { ad: 'Àrà', aciklama: 'Ọjọ́ 90 - ìforítì tó ta yọ', cumle: 'Àrà' },
  },

  /** Kadim mertebe adları, Arapça (meal yazım düzeniyle; çevrilmez). */
  seviyeler: ['Mubtadi’', 'Ṭālib', 'Sālik', 'Murīd', '‘Ārif', 'Ḥāfiẓ', 'Kāmil'],

  rozetler: {
    ilk_adim: { ad: 'Ìgbésẹ̀ Àkọ́kọ́', aciklama: 'Ẹ ti parí ọ̀sẹ̀ àkọ́kọ́ yín.', kosul: 'Ìtẹ̀léra ọjọ́ 7' },
    aliskanlik_ustasi: {
      ad: 'Ọ̀gá Àṣà',
      aciklama: 'Ọjọ́ 21 - àsìkò kíkọ́ àṣà ti parí.',
      kosul: 'Ìtẹ̀léra ọjọ́ 21',
    },
    kararlilik: { ad: 'Adúróṣinṣin', aciklama: 'Ẹ ti kírun fún ọjọ́ 60 láìdáwọ́dúró.', kosul: 'Ìtẹ̀léra ọjọ́ 60' },
    efsane: { ad: 'Àrà', aciklama: 'Ọjọ́ 90 - ẹ ti fi ìforítì tó ta yọ hàn.', kosul: 'Ìtẹ̀léra ọjọ́ 90' },
    toparlanma_ustasi: {
      ad: 'Ọ̀gá Ìmúpadàbọ̀sípò',
      aciklama: 'Ẹ ti parí ipò ìmúpadàbọ̀sípò ní ìgbà 3.',
      kosul: 'Ìmúpadàbọ̀sípò 3',
    },
    mukemmeliyetci: { ad: 'Aláìkù-síbìkan', aciklama: 'Ẹ ti kírun 5/5 fún ọjọ́ 30.', kosul: 'Ọjọ́ 30 ti ìrun 5/5' },
    yuz_namaz: { ad: 'Ìrun 100', aciklama: 'Ẹ ti kí ìrun 100 lápapọ̀.', kosul: 'Kí ìrun 100' },
    bin_namaz: { ad: 'Ìrun 1000', aciklama: 'Ẹ ti kí ìrun 1000 lápapọ̀.', kosul: 'Kí ìrun 1000' },
  },

  rozetSeviyeleri: { bronz: 'BÁRÓǸSÌ', gumus: 'FÀDÁKÀ', altin: 'WÚRÀ', elmas: 'DÁYÁMỌ́ŃDÌ' },

  gunBitis: {
    erken: 'Fún àwọn tí ń sùn ní kùtùkùtù',
    varsayilan: 'Àṣà - ṣáájú Subh ní ọ̀pọ̀ ibi',
    gec: 'Fún àwọn tí ń sùn pẹ́',
  },

  kutlama: {
    rozetEklendi: '🏅 A ti fi kún àkójọ àmì-ẹ̀yẹ yín',
    paylasin: 'Pín in',
    rozetBaslik: 'Kí Allāhu mú un wà pẹ́',
    rozetMesaj: 'Ẹ ti gba àmì-ẹ̀yẹ "{ad}".',
    hedefBaslik: cogul({ other: 'Ọjọ́ {n}' }),
    hedefMesaj: 'Ẹ ti parí àfojúsùn "{ad}". Kí Allāhu mú un wà pẹ́.',
    yeniRank: 'Ipò tuntun: {rank}',
    seviyeBaslik: 'Ìpele yín tuntun',
    seviyeMesaj: 'Ẹ ń tẹ̀síwájú báyìí gẹ́gẹ́ bí "{rank}". Kí Allāhu mú un wà pẹ́.',
    toparlanmaBaslik: 'Ìtẹ̀léra yín ti padà',
    toparlanmaMesaj: cogul({
      other: 'Ìtẹ̀léra ọjọ́ {n} yín ń tẹ̀síwájú láti ibi tí ó dúró sí. Kí Allāhu fún wa ní ìdúróṣinṣin.',
    }),
    enUzunBaslik: 'Ìtẹ̀léra yín tó gùn jùlọ',
    enUzunMesaj: cogul({
      other: 'Ọjọ́ {n}: ìtẹ̀léra yín tó gùn jùlọ títí di báyìí. Kí Allāhu mú un wà pẹ́.',
    }),
  },

  sekme: {
    hataOkunamadi: 'A kò lè ka àwọn àkọsílẹ̀ yín tó ti kọjá báyìí.',
    yenidenErisim: 'Tún gbìyànjú láti gbé dátà ìtẹ̀léra wọlé',
    yenidenDeneyin: 'Gbìyànjú lẹ́ẹ̀kan sí i',
    yukleniyor: 'À ń gbé dátà ìtẹ̀léra yín wọlé...',
    gunlukSeri: 'ọjọ́ ìtẹ̀léra',
    rekor: 'àkọsílẹ̀ tó ga jùlọ',
    sozErisim: '{metin} Orísun: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Àfojúsùn tó kàn',
    tumu: 'Ẹ ti parí gbogbo àmì-ẹ̀yẹ',
    kalan: cogul({ other: 'Àmì-ẹ̀yẹ {ad}: ọjọ́ {n} ló kù' }),
    tumuErisim: 'Ẹ ti parí gbogbo àmì-ẹ̀yẹ: tasbīḥ ti kún.',
    erisim: 'Àmì-ẹ̀yẹ {ad}: ọjọ́ {n} nínú {hedef} ti parí.',
  },

  gok: {
    gunHarfleri: ['A', 'Ì', 'Ọ', 'Ọ', 'Ẹ', 'À', 'À'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ other: 'Ọjọ́ {n} pé àfojúsùn' }),
    besVakit: cogul({ other: 'Ọjọ́ {n} pẹ̀lú ìrun márààrún' }),
    dondurulmus: cogul({ other: 'Ọjọ́ {n} tí a dì' }),
    mevcutSeri: cogul({ other: 'Ìtẹ̀léra lọ́wọ́lọ́wọ́: ọjọ́ {n}.' }),
  },

  hedefAyar: {
    azalt: 'Dín kù',
    deger: 'Iye',
    artir: 'Fi kún un',
    esik: cogul({ other: 'Ìrun {n}' }),
    sifirlaBaslik: 'Tún ìtẹ̀léra bẹ̀rẹ̀',
    sifirlaMesaj: 'A ó tún gbogbo dátà ìtẹ̀léra yín (ìtẹ̀léra, àmì-ẹ̀yẹ, máàkì) bẹ̀rẹ̀ láti òdo. A kò lè dá èyí padà. Ṣé ẹ fẹ́ tẹ̀síwájú?',
    sifirla: 'Tún bẹ̀rẹ̀',
    iptal: 'Fagilé',
    basarili: 'Ó ti parí',
    sifirlandi: 'A ti tún dátà ìtẹ̀léra yín bẹ̀rẹ̀.',
    hedefAyarlari: 'ÈTÒ ÀFOJÚSÙN',
    tamGunEsigi: 'Òdiwọ̀n ọjọ́ kíkún',
    tamGunAciklama: 'Ó ń ṣètò iye ìrun tó kéré jùlọ lójúmọ́ tí a nílò kí ọjọ́ náà tó ka sí ìtẹ̀léra yín',
    sifirlama: 'ÌTÚNBẸ̀RẸ̀',
    verileriSifirla: 'Tún dátà ìtẹ̀léra bẹ̀rẹ̀',
    verileriSifirlaAlt: 'Ó ń pa gbogbo dátà ìtẹ̀léra, àmì-ẹ̀yẹ àti máàkì rẹ́',
  },

  rozetKarti: {
    erisim: 'Àmì-ẹ̀yẹ {ad}, {durum}',
    kazanildi: 'a ti gbà á',
    kilitli: 'ó wà ní títì',
  },

  toparlanma: {
    kartBaslik: 'IPÒ ÌMÚPADÀBỌ̀SÍPÒ',
    kartAltBaslik: 'Ẹ lè gba ìtẹ̀léra yín padà',
    kartMesaj: 'Ẹ lè tẹ̀síwájú ìtẹ̀léra {vurgu} yín láti ibi tí ẹ dúró sí.',
    oncekiGun: cogul({ other: 'ọjọ́ {n}' }),
    ilerleme: 'Ọjọ́ {tamam}/{hedef} ti parí',
    kalan: cogul({
      other: 'Ẹ parí ìrun márààrún fún ọjọ́ {n} sí i, ìtẹ̀léra yín yóò sì tẹ̀síwájú láti ibi tí ó dúró sí.',
    }),
    bugun: 'Ẹ parí òní, ìtẹ̀léra yín yóò sì tẹ̀síwájú láti ibi tí ó dúró sí.',
    uyari: 'Àwọn ọjọ́ náà gbọ́dọ̀ tẹ̀ léra; tí ọjọ́ kan bá bọ́ láàrin, ìmúpadàbọ̀sípò yóò tún bẹ̀rẹ̀.',
    kapatErisim: 'Pa àlàyé ìmúpadàbọ̀sípò dé',
    anladim: 'Ó yé mi',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Pín ìtẹ̀síwájú yín',
    hazirDegilBaslik: 'Àwòrán kò tíì ṣetán',
    hazirDegilMesaj: 'Àwòrán náà kò tíì ṣetán. Ẹ gbìyànjú lẹ́ẹ̀kan sí i ní ìṣẹ́jú-àáyá díẹ̀.',
    olusturulamadiBaslik: 'A kò lè ṣẹ̀dá àwòrán náà',
    olusturulamadiMesaj: 'Nǹkan kan kò lọ dáadáa nígbà tí a ń ṣẹ̀dá àwòrán náà. Ẹ gbìyànjú lẹ́ẹ̀kan sí i.',
    kullanilamiyorBaslik: 'Pínpín kò sí',
    kullanilamiyorMesaj: 'Pínpín kò sí lórí ẹ̀rọ yìí.',
    kapat: 'Pa á dé',
    hikaye: 'Fi kún ìtàn yín',
    platformlar: 'A lè pín in lórí Instagram, WhatsApp àti àwọn mìíràn.',
    tamam: 'Ó dáa',
    seriEnUzun: cogul({ other: 'Ìtẹ̀léra Mi Tó Gùn Jùlọ: Ọjọ́ {n}' }),
    seriZincir: cogul({ other: 'ỌJỌ́ LÁÌJÁ Ẹ̀WỌ̀N' }),
    seriSoz: '"Ìgbésẹ̀ kékeré lójoojúmọ́, àlàáfíà ńlá nínú ẹ̀mí mi. 🔥"',
    rozetYeni: 'MO GBA ÀMÌ-Ẹ̀YẸ TUNTUN',
    rozetSozleri: [
      'Lónìí mo gbé ìgbésẹ̀ rere fún ara mi. 🌟',
      'Mo ń tẹ̀síwájú pẹ̀lú ìpinnu; àmì-ẹ̀yẹ yìí jẹ́ tèmi. 💪',
      'Mo bá ìbùkún òwúrọ̀. 🌅',
      'Mo jẹ́ ara ìṣàn yìí tí ó ń ṣe ẹ̀mí mi ní rere. ✨',
      'Ìgbésẹ̀ kékeré ń mú àlàáfíà ńlá wá. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'MO GBA ÀMÌ-Ẹ̀YẸ TUNTUN',
      hedef_tamamlandi: 'MO DÉ ÀFOJÚSÙN MI',
      seviye_atlandi: 'ÌPELE TUNTUN',
      toparlanma_tamamlandi: 'MO TI PADÀ SÍ Ọ̀NÀ',
      en_uzun_seri: 'ÀKỌSÍLẸ̀ TUNTUN',
      varsayilan: 'ÀṢEYỌRÍ',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Kí Olúwa mi mú un wà pẹ́. 🤲', 'Ìgbésẹ̀ kékeré ń mú àlàáfíà ńlá wá. 🍃', 'Kí Allāhu fún gbogbo wa ní ìdúróṣinṣin. 🌱'],
      hedef_tamamlandi: ['Ìgbésẹ̀ kékeré ń mú àlàáfíà ńlá wá. 🍃', 'Kí Allāhu mú un wà pẹ́. 🤲', 'Ìgbésẹ̀ kan sí i lójoojúmọ́. 🌱'],
      seviye_atlandi: [
        'Díẹ̀ sí i lójoojúmọ́; kí Allāhu mú un rọrùn. 🍃',
        'Kí Allāhu mú un wà pẹ́. 🤲',
        'Ìrìn-àjò ń bá a lọ. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ohun tí ó ṣe pàtàkì kì í ṣe ìṣubú, bí kò ṣe ìdìde. 🔄',
        'Kí Allāhu fún wa ní ìdúróṣinṣin. 🤲',
        'Pẹ̀lú sùúrù ni a ń rin gbogbo ọ̀nà. 🌱',
      ],
      en_uzun_seri: [
        'Ìgbésẹ̀ kékeré lójoojúmọ́, àlàáfíà ńlá nínú ọkàn mi. 🍃',
        'Kí Allāhu mú un wà pẹ́. 🤲',
        'Kí Olúwa mi fún gbogbo wa ní ìdúróṣinṣin. 🌱',
      ],
    },
  },
};
