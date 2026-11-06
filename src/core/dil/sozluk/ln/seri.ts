import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Mokoba na bino ezali kopela',
    enUzun: cogul({ one: 'Mokoba eleki molai: mokɔlɔ {n}', other: 'Mokoba eleki molai: mikɔlɔ {n}' }),
    gunBuyuk: cogul({ one: 'MOKƆLƆ', other: 'MIKƆLƆ' }),
    sonrakiHedef: 'Mokano oyo elandi: mokɔlɔ {hedef} ({durum})',
    kalanGun: cogul({ one: 'Etikali mokɔlɔ {n}', other: 'Etikali mikɔlɔ {n}' }),
    tamamlandi: 'Ekokisami',
    paylasErisim: 'Bokabola bokoli na bino',
    paylasBuyuk: 'BOKABOLA BOKOLI NA BINO',
  },

  hedefler: {
    ilk_adim: { ad: 'Pɔsɔ ya liboso', aciklama: 'Bosambela mikɔlɔ 7 kozanga kokatana', cumle: 'Pɔsɔ ya liboso' },
    aliskanlik_ustasi: { ad: 'Molakisi ya momesano', aciklama: 'Mikɔlɔ 21 - eleko ya kosala momesano', cumle: 'Molakisi ya momesano' },
    kararlilik: { ad: 'Mpiko', aciklama: 'Mikɔlɔ 60 kozanga kokatana', cumle: 'Mpiko' },
    efsane: { ad: 'Lisapo', aciklama: 'Mikɔlɔ 90 - mpiko monene', cumle: 'Lisapo' },
  },

  /** Klasik derece adları, harf çevirisiyle (çevrilmez). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Etape ya liboso', aciklama: 'Bokokisi pɔsɔ na bino ya liboso.', kosul: 'Mokoba ya mikɔlɔ 7' },
    aliskanlik_ustasi: {
      ad: 'Molakisi ya momesano',
      aciklama: 'Mikɔlɔ 21 - eleko ya kosala momesano ekokisami.',
      kosul: 'Mokoba ya mikɔlɔ 21',
    },
    kararlilik: { ad: 'Mpiko', aciklama: 'Bosambeli mikɔlɔ 60 kozanga kokatana.', kosul: 'Mokoba ya mikɔlɔ 60' },
    efsane: { ad: 'Lisapo', aciklama: 'Mikɔlɔ 90 - bolakisi mpiko monene.', kosul: 'Mokoba ya mikɔlɔ 90' },
    toparlanma_ustasi: {
      ad: 'Molakisi ya kozongela',
      aciklama: 'Bokokisi ndɛngɛ ya kozongela mbala 3.',
      kosul: 'Kozongela mbala 3',
    },
    mukemmeliyetci: { ad: 'Mobimba', aciklama: 'Bosambeli 5/5 mikɔlɔ 30.', kosul: 'Mikɔlɔ 30 ya losambo 5/5' },
    yuz_namaz: { ad: 'Losambo 100', aciklama: 'Bosambeli losambo 100 nyɔnsɔ.', kosul: 'Bosambela losambo 100' },
    bin_namaz: { ad: 'Losambo 1000', aciklama: 'Bosambeli losambo 1000 nyɔnsɔ.', kosul: 'Bosambela losambo 1000' },
  },

  rozetSeviyeleri: { bronz: 'BRONZE', gumus: 'PALATA', altin: 'WOLO', elmas: 'DIAMA' },

  gunBitis: {
    erken: 'Mpɔ na baye balalaka noki',
    varsayilan: 'Ya liboso - liboso ya Fajr na bisika mingi',
    gec: 'Mpɔ na baye balalaka na retare',
  },

  kutlama: {
    rozetEklendi: '🏅 Ebakisami na bilembo na bino ya lokumu',
    paylasin: 'Bokabola',
    rozetBaslik: 'Allah asala ete ewumela',
    rozetMesaj: 'Bozwi elembo ya lokumu "{ad}".',
    hedefBaslik: cogul({ one: 'Mokɔlɔ {n}', other: 'Mikɔlɔ {n}' }),
    hedefMesaj: 'Bokokisi mokano "{ad}". Allah asala ete ewumela.',
    yeniRank: 'Etape ya sika: {rank}',
    seviyeBaslik: 'Etape na bino ya sika',
    seviyeMesaj: 'Sikoyo bokobi lokola "{rank}". Allah asala ete ewumela.',
    toparlanmaBaslik: 'Mokoba na bino ezongi',
    toparlanmaMesaj: cogul({
      one: 'Mokoba na bino ya mokɔlɔ {n} ekobi esika etikalaki. Allah apesa bino mpiko.',
      other: 'Mokoba na bino ya mikɔlɔ {n} ekobi esika etikalaki. Allah apesa bino mpiko.',
    }),
    enUzunBaslik: 'Mokoba na bino eleki molai',
    enUzunMesaj: cogul({
      one: 'Mokɔlɔ {n}: mokoba na bino eleki molai tii sikoyo. Allah asala ete ewumela.',
      other: 'Mikɔlɔ {n}: mokoba na bino eleki molai tii sikoyo. Allah asala ete ewumela.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Makambo na bino ya kala ekoki kotangama te sikoyo.',
    yenidenErisim: 'Bomeka lisusu kozwa sango ya mokoba',
    yenidenDeneyin: 'Bomeka lisusu',
    yukleniyor: 'Ezali kozwa sango ya mokoba na bino...',
    gunlukSeri: 'mikɔlɔ ya mokoba',
    rekor: 'rekɔrɔ',
    sozErisim: '{metin} Mokanda: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Mokano oyo elandi',
    tumu: 'Bokokisi bilembo nyɔnsɔ ya lokumu',
    kalan: cogul({ one: 'Elembo {ad}: etikali mokɔlɔ {n}', other: 'Elembo {ad}: etikali mikɔlɔ {n}' }),
    tumuErisim: 'Bokokisi bilembo nyɔnsɔ ya lokumu: tasbih etondi.',
    erisim: 'Elembo {ad}: mikɔlɔ {n} na {hedef} ekokisami.',
  },

  gok: {
    gunHarfleri: ['Y', 'M', 'M', 'M', 'M', 'P', 'E'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Mokɔlɔ {n} ekokisi mokano', other: 'Mikɔlɔ {n} ekokisi mokano' }),
    besVakit: cogul({ one: 'Mokɔlɔ {n} na losambo nyɔnsɔ mitano', other: 'Mikɔlɔ {n} na losambo nyɔnsɔ mitano' }),
    dondurulmus: cogul({ one: 'Mokɔlɔ {n} ebatelami', other: 'Mikɔlɔ {n} ebatelami' }),
    mevcutSeri: cogul({ one: 'Mokoba ya sikoyo: mokɔlɔ {n}.', other: 'Mokoba ya sikoyo: mikɔlɔ {n}.' }),
  },

  hedefAyar: {
    azalt: 'Bokitisa',
    deger: 'Motuya',
    artir: 'Bobakisa',
    esik: cogul({ one: 'Losambo {n}', other: 'Losambo {n}' }),
    sifirlaBaslik: 'Bozongisa mokoba na zéro',
    sifirlaMesaj: 'Sango nyɔnsɔ ya mokoba na bino (mokoba, bilembo ya lokumu, bapwe) ekozonga na zéro. Ekoki kozongisama te. Bolingi kokoba?',
    sifirla: 'Bozongisa na zéro',
    iptal: 'Botika',
    basarili: 'Esili',
    sifirlandi: 'Sango ya mokoba na bino ezongi na zéro.',
    hedefAyarlari: 'MIBONGISELI YA MOKANO',
    tamGunEsigi: 'Ndelo ya mokɔlɔ mobimba',
    tamGunAciklama: 'Etiaka motango ya moke ya losambo na mokɔlɔ oyo esengeli mpɔ ete mokɔlɔ yango etangama na mokoba na bino',
    sifirlama: 'KOZONGISA NA ZÉRO',
    verileriSifirla: 'Bozongisa sango ya mokoba na zéro',
    verileriSifirlaAlt: 'Elongolaka sango nyɔnsɔ ya mokoba, ya bilembo ya lokumu mpe ya bapwe',
  },

  rozetKarti: {
    erisim: 'Elembo {ad}, {durum}',
    kazanildi: 'ezwami',
    kilitli: 'ekangami',
  },

  toparlanma: {
    kartBaslik: 'NDƐNGƐ YA KOZONGELA',
    kartAltBaslik: 'Bokoki kozwa mokoba na bino lisusu',
    kartMesaj: 'Bokoki kokoba mokoba na bino ya {vurgu} esika botikaki.',
    oncekiGun: cogul({ one: 'mokɔlɔ {n}', other: 'mikɔlɔ {n}' }),
    ilerleme: 'Mikɔlɔ {tamam}/{hedef} ekokisami',
    kalan: cogul({
      one: 'Bokokisa losambo nyɔnsɔ mitano mokɔlɔ {n} lisusu mpe mokoba na bino ekokoba esika etikalaki.',
      other: 'Bokokisa losambo nyɔnsɔ mitano mikɔlɔ {n} lisusu mpe mokoba na bino ekokoba esika etikalaki.',
    }),
    bugun: 'Bokokisa lɛlɔ mpe mokoba na bino ekokoba esika etikalaki.',
    uyari: 'Mikɔlɔ esengeli kolandana; soki mokɔlɔ mɔkɔ ekatani na katikati, kozongela ebandaka lisusu.',
    kapatErisim: 'Bokanga makambo ya kozongela',
    anladim: 'Nasosoli',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Bokabola bokoli na bino',
    hazirDegilBaslik: 'Elilingi ebongi naino te',
    hazirDegilMesaj: 'Elilingi ebongi naino te. Bomeka lisusu nsima ya sekondi moke.',
    olusturulamadiBaslik: 'Tokoki kosala elilingi te',
    olusturulamadiMesaj: 'Likambo mɔkɔ esalemi mabe ntango ya kosala elilingi. Bomeka lisusu.',
    kullanilamiyorBaslik: 'Kokabola ezali te',
    kullanilamiyorMesaj: 'Kokabola ekoki te na esaleli oyo.',
    kapat: 'Bokanga',
    hikaye: 'Bobakisa na lisolo na bino',
    platformlar: 'Ekoki kokabolama na Instagram, WhatsApp mpe bisika mosusu.',
    tamam: 'Malamu',
    seriEnUzun: cogul({ one: 'Mokoba na ngai eleki molai: Mokɔlɔ {n}', other: 'Mokoba na ngai eleki molai: Mikɔlɔ {n}' }),
    seriZincir: cogul({ one: 'MOKƆLƆ KOZANGA KOKATA NSINGA', other: 'MIKƆLƆ KOZANGA KOKATA NSINGA' }),
    seriSoz: '"Etape moke mokɔlɔ na mokɔlɔ, kimia monene na molimo na ngai. 🔥"',
    rozetYeni: 'NAZWI ELEMBO YA SIKA YA LOKUMU',
    rozetSozleri: [
      'Lɛlɔ nasali etape malamu mpɔ na ngai mɔkɔ. 🌟',
      'Nazali kokoba na mpiko; elembo oyo ezali ya ngai. 💪',
      'Nazwi lipamboli ya ntɔngɔ. 🌅',
      'Nazali eteni ya molɔngɔ oyo esalaka molimo na ngai malamu. ✨',
      'Bitape moke ememaka kimia monene. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NAZWI ELEMBO YA SIKA YA LOKUMU',
      hedef_tamamlandi: 'NAKOKISI MOKANO NA NGAI',
      seviye_atlandi: 'ETAPE YA SIKA',
      toparlanma_tamamlandi: 'NAZONGI NA NZELA',
      en_uzun_seri: 'REKƆRƆ YA SIKA',
      varsayilan: 'NAKOKISI',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Nkolo na ngai asala ete ewumela. 🤲', 'Bitape moke ememaka kimia monene. 🍃', 'Allah apesa biso nyɔnsɔ mpiko. 🌱'],
      hedef_tamamlandi: ['Bitape moke ememaka kimia monene. 🍃', 'Allah asala ete ewumela. 🤲', 'Etape mɔkɔ lisusu mokɔlɔ na mokɔlɔ. 🌱'],
      seviye_atlandi: [
        'Mwa moke koleka mokɔlɔ na mokɔlɔ; Allah asala ete ezala pɛtɛɛ. 🍃',
        'Allah asala ete ewumela. 🤲',
        'Mobembo ekobi. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Oyo ezali na ntina ezali kokwea te, kasi kotelema lisusu. 🔄',
        'Allah apesa mpiko. 🤲',
        'Nzela nyɔnsɔ etambolamaka na motema molai. 🌱',
      ],
      en_uzun_seri: [
        'Etape moke mokɔlɔ na mokɔlɔ, kimia monene na motema na ngai. 🍃',
        'Allah asala ete ewumela. 🤲',
        'Nkolo na ngai apesa biso nyɔnsɔ mpiko. 🌱',
      ],
    },
  },
};
