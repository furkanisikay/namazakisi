import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'Omuddiriŋŋanwa gwo gwaka',
    enUzun: cogul({ one: 'Omuddiriŋŋanwa ogusinga obuwanvu: olunaku {n}', other: 'Omuddiriŋŋanwa ogusinga obuwanvu: ennaku {n}' }),
    gunBuyuk: cogul({ one: 'OLUNAKU', other: 'ENNAKU' }),
    sonrakiHedef: 'Ekigendererwa ekiddako: olunaku {hedef} ({durum})',
    kalanGun: cogul({ one: 'Esigadde olunaku {n}', other: 'Zisigadde ennaku {n}' }),
    tamamlandi: 'Kiwedde',
    paylasErisim: 'Gabana enkulaakulana yo',
    paylasBuyuk: 'GABANA ENKULAAKULANA YO',
  },

  hedefler: {
    ilk_adim: { ad: 'Wiiki Esooka', aciklama: 'Saala okumala ennaku 7 nga tosaliddeeko', cumle: 'Wiiki esooka' },
    aliskanlik_ustasi: { ad: 'Omukugu w’Empisa', aciklama: 'Ennaku 21 - ekiseera ky’okuzimba empisa', cumle: 'Omukugu w’empisa' },
    kararlilik: { ad: 'Obunywevu', aciklama: 'Ennaku 60 nga tosaliddeeko', cumle: 'Obunywevu' },
    efsane: { ad: 'Ow’Ettutumu', aciklama: 'Ennaku 90 - obugumiikiriza obw’enjawulo', cumle: 'Ow’ettutumu' },
  },

  /** Klasik mertebe adları, Arapçadan harf çevirisi (çeviri değil). */
  seviyeler: ['Mubtadi', 'Talib', 'Salik', 'Murid', 'Arif', 'Hafiz', 'Kamil'],

  rozetler: {
    ilk_adim: { ad: 'Eddaala Erisooka', aciklama: 'Omalirizza wiiki yo esooka.', kosul: 'Omuddiriŋŋanwa gw’ennaku 7' },
    aliskanlik_ustasi: {
      ad: 'Omukugu w’Empisa',
      aciklama: 'Ennaku 21 - ekiseera ky’okuzimba empisa kiwedde.',
      kosul: 'Omuddiriŋŋanwa gw’ennaku 21',
    },
    kararlilik: { ad: 'Omunywevu', aciklama: 'Osaaze okumala ennaku 60 nga tosaliddeeko.', kosul: 'Omuddiriŋŋanwa gw’ennaku 60' },
    efsane: { ad: 'Ow’Ettutumu', aciklama: 'Ennaku 90 - olaze obugumiikiriza obw’enjawulo.', kosul: 'Omuddiriŋŋanwa gw’ennaku 90' },
    toparlanma_ustasi: {
      ad: 'Omukugu w’Okudda Engulu',
      aciklama: 'Omalirizza okudda engulu emirundi 3.',
      kosul: 'Okudda engulu 3',
    },
    mukemmeliyetci: { ad: 'Atuukiriza', aciklama: 'Osaaze 5/5 okumala ennaku 30.', kosul: 'Ennaku 30 eza 5/5' },
    yuz_namaz: { ad: 'Esswala 100', aciklama: 'Osaaze esswala 100 zonna awamu.', kosul: 'Saala esswala 100' },
    bin_namaz: { ad: 'Esswala 1000', aciklama: 'Osaaze esswala 1000 zonna awamu.', kosul: 'Saala esswala 1000' },
  },

  rozetSeviyeleri: { bronz: 'EKIKOMO', gumus: 'FFEEZA', altin: 'ZAABU', elmas: 'DAYAMONDI' },

  gunBitis: {
    erken: 'Ku beebaka amangu',
    varsayilan: 'Ekya bulijjo - nga Subuhi tennatuuka mu bifo bingi',
    gec: 'Ku beebaka ekikeerezi',
  },

  kutlama: {
    rozetEklendi: '🏅 Gugattiddwa ku midaali gyo',
    paylasin: 'Gabana',
    rozetBaslik: 'Allah akiwangaaze',
    rozetMesaj: 'Ofunye omudaali “{ad}”.',
    hedefBaslik: cogul({ one: 'Olunaku {n}', other: 'Ennaku {n}' }),
    hedefMesaj: 'Omalirizza ekigendererwa “{ad}”. Allah akiwangaaze.',
    yeniRank: 'Omutendera omupya: {rank}',
    seviyeBaslik: 'Omutendera gwo omupya',
    seviyeMesaj: 'Kati ogenda mu maaso nga “{rank}”. Allah akiwangaaze.',
    toparlanmaBaslik: 'Omuddiriŋŋanwa gwo gukomyewo',
    toparlanmaMesaj: cogul({
      one: 'Omuddiriŋŋanwa gwo ogw’olunaku {n} gugenda mu maaso we gwakoma. Allah akuwe obunywevu.',
      other: 'Omuddiriŋŋanwa gwo ogw’ennaku {n} gugenda mu maaso we gwakoma. Allah akuwe obunywevu.',
    }),
    enUzunBaslik: 'Omuddiriŋŋanwa gwo ogusinga obuwanvu',
    enUzunMesaj: cogul({
      one: 'Olunaku {n}: omuddiriŋŋanwa gwo ogusinga obuwanvu okutuusa kati. Allah akiwangaaze.',
      other: 'Ennaku {n}: omuddiriŋŋanwa gwo ogusinga obuwanvu okutuusa kati. Allah akiwangaaze.',
    }),
  },

  sekme: {
    hataOkunamadi: 'Ebiwandiiko byo eby’emabega tebisobodde kusomebwa kati.',
    yenidenErisim: 'Ddamu otikke ebikwata ku muddiriŋŋanwa',
    yenidenDeneyin: 'Ddamu ogezeeko',
    yukleniyor: 'Ebikwata ku muddiriŋŋanwa gwo bitikkibwa...',
    gunlukSeri: 'ennaku ezigoberera',
    rekor: 'ekisinga',
    sozErisim: '{metin} Ensibuko: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'Ekigendererwa ekiddako',
    tumu: 'Omalirizza emidaali gyonna',
    kalan: cogul({ one: 'Omudaali {ad}: esigadde olunaku {n}', other: 'Omudaali {ad}: zisigadde ennaku {n}' }),
    tumuErisim: 'Omalirizza emidaali gyonna: tasbiih ejjudde.',
    erisim: 'Omudaali {ad}: ennaku {n} ku {hedef} ziwedde.',
  },

  gok: {
    gunHarfleri: ['B', '2', '3', '4', '5', '6', 'S'],
    erisim: '{ay}. {hedef}, {bes}, {donmus}. {seri}',
    hedefTutuldu: cogul({ one: 'Olunaku {n} lwatuuka ku kigendererwa', other: 'Ennaku {n} zaatuuka ku kigendererwa' }),
    besVakit: cogul({ one: 'Olunaku {n} n’esswala zonna ettaano', other: 'Ennaku {n} n’esswala zonna ettaano' }),
    dondurulmus: cogul({ one: 'Olunaku {n} luyimiriziddwa', other: 'Ennaku {n} ziyimiriziddwa' }),
    mevcutSeri: cogul({ one: 'Omuddiriŋŋanwa oguliwo: olunaku {n}.', other: 'Omuddiriŋŋanwa oguliwo: ennaku {n}.' }),
  },

  hedefAyar: {
    azalt: 'Kendeeza',
    deger: 'Omuwendo',
    artir: 'Yongera',
    esik: cogul({ one: 'esswala {n}', other: 'esswala {n}' }),
    sifirlaBaslik: 'Zzaawo omuddiriŋŋanwa',
    sifirlaMesaj: 'Ebikwata ku muddiriŋŋanwa gwo byonna (omuddiriŋŋanwa, emidaali, obubonero) bijja kuzzibwa ku ntandikwa. Kino tekisobola kukomezebwawo. Oyagala okugenda mu maaso?',
    sifirla: 'Zzaawo',
    iptal: 'Sazaamu',
    basarili: 'Kiwedde',
    sifirlandi: 'Ebikwata ku muddiriŋŋanwa gwo bizziddwa ku ntandikwa.',
    hedefAyarlari: 'ENTEGEKA Z’EKIGENDERERWA',
    tamGunEsigi: 'Ekipimo ky’olunaku olujjuvu',
    tamGunAciklama: 'Kiteekawo omuwendo gw’esswala ogutono ogwetaagisa olunaku okubalibwa mu muddiriŋŋanwa gwo',
    sifirlama: 'OKUZZAAWO',
    verileriSifirla: 'Zzaawo ebikwata ku muddiriŋŋanwa',
    verileriSifirlaAlt: 'Kisangula byonna ebikwata ku muddiriŋŋanwa, emidaali n’obubonero',
  },

  rozetKarti: {
    erisim: 'Omudaali {ad}, {durum}',
    kazanildi: 'gufunyiddwa',
    kilitli: 'gusibiddwa',
  },

  toparlanma: {
    kartBaslik: 'OKUDDA ENGULU',
    kartAltBaslik: 'Osobola okukomyawo omuddiriŋŋanwa gwo',
    kartMesaj: 'Osobola okugenda mu maaso n’omuddiriŋŋanwa gwo {vurgu} we wakoma.',
    oncekiGun: cogul({ one: 'ogw’olunaku {n}', other: 'ogw’ennaku {n}' }),
    ilerleme: '{tamam}/{hedef} ennaku ziwedde',
    kalan: cogul({
      one: 'Maliriza esswala zonna ettaano okumala olunaku {n} olulala, omuddiriŋŋanwa gwo gugende mu maaso we gwakoma.',
      other: 'Maliriza esswala zonna ettaano okumala ennaku {n} endala, omuddiriŋŋanwa gwo gugende mu maaso we gwakoma.',
    }),
    bugun: 'Maliriza leero, omuddiriŋŋanwa gwo gugende mu maaso we gwakoma.',
    uyari: 'Ennaku zirina okugobererana; olunaku bwe lusubwa wakati, okudda engulu kuddamu okutandika.',
    kapatErisim: 'Ggalawo ebikwata ku kudda engulu',
    anladim: 'Ntegedde',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'Gabana enkulaakulana yo',
    hazirDegilBaslik: 'Ekifaananyi tekinnetegeka',
    hazirDegilMesaj: 'Ekifaananyi tekinnetegeka. Ddamu ogezeeko mu butikitiki butono.',
    olusturulamadiBaslik: 'Ekifaananyi tekisobodde kukolebwa',
    olusturulamadiMesaj: 'Waliwo ekitatambudde bulungi nga ekifaananyi kikolebwa. Ddamu ogezeeko.',
    kullanilamiyorBaslik: 'Okugabana tekufunika',
    kullanilamiyorMesaj: 'Okugabana tekusoboka ku kyuma kino.',
    kapat: 'Ggalawo',
    hikaye: 'Gatta ku story yo',
    platformlar: 'Kisobola okugabanibwa ku Instagram, WhatsApp n’ebirala.',
    tamam: 'Kale',
    seriEnUzun: cogul({ one: 'Omuddiriŋŋanwa Gwange Ogusinga: Olunaku {n}', other: 'Omuddiriŋŋanwa Gwange Ogusinga: Ennaku {n}' }),
    seriZincir: cogul({ one: 'OLUNAKU NGA SIKUTUSE KALIKO', other: 'ENNAKU NGA SIKUTUSE KALIKO' }),
    seriSoz: '“Eddaala ettono buli lunaku, emirembe eminene mu mwoyo gwange. 🔥”',
    rozetYeni: 'NFUNYE OMUDAALI OMUPYA',
    rozetSozleri: [
      'Leero nkoze eddaala eddungi ku lwange. 🌟',
      'Ngenda mu maaso n’obumalirivu; omudaali guno gwange. 💪',
      'Nfunye omukisa gw’enkya. 🌅',
      'Ndi kitundu ku lugendo luno olulungi eri omwoyo gwange. ✨',
      'Amadaala amatono gaaleeta emirembe eminene. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'NFUNYE OMUDAALI OMUPYA',
      hedef_tamamlandi: 'NTUUSE KU KIGENDERERWA KYANGE',
      seviye_atlandi: 'OMUTENDERA OMUPYA',
      toparlanma_tamamlandi: 'NDIZZE KU KKUBO',
      en_uzun_seri: 'EKISINGA EKIPYA',
      varsayilan: 'EKITUUKIDDWAKO',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['Mukama wange akiwangaaze. 🤲', 'Amadaala amatono gaaleeta emirembe eminene. 🍃', 'Allah atuwe ffenna obunywevu. 🌱'],
      hedef_tamamlandi: ['Amadaala amatono gaaleeta emirembe eminene. 🍃', 'Allah akiwangaaze. 🤲', 'Eddaala erirala buli lunaku. 🌱'],
      seviye_atlandi: [
        'Katono okweyongerayo buli lunaku; Allah akyanguye. 🍃',
        'Allah akiwangaaze. 🤲',
        'Olugendo lugenda mu maaso. 🌱',
      ],
      toparlanma_tamamlandi: [
        'Ekikulu si kugwa wabula okusituka. 🔄',
        'Allah atuwe obunywevu. 🤲',
        'Buli kkubo litambulirwa n’obugumiikiriza. 🌱',
      ],
      en_uzun_seri: [
        'Eddaala ettono buli lunaku, emirembe eminene mu mutima gwange. 🍃',
        'Allah akiwangaaze. 🤲',
        'Mukama wange atuwe ffenna obunywevu. 🌱',
      ],
    },
  },
};
