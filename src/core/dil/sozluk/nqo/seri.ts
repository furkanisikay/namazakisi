import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/** Seri = "tugunni" (ardışıklık; türetildi). Övgü ve "!" yok. */
export const seri: Sozluk['seri'] = {
  kart: {
    baslik: 'ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߓߍ߫ ߕߊ߯ ߝߍ߬',
    enUzun: cogul({ other: 'ߕߎߜߎ߲ߠߌ ߖߊ߲߬ߓߊ: ߟߏ߲ {n}' }),
    gunBuyuk: cogul({ other: 'ߟߏ߲' }),
    sonrakiHedef: 'ߟߊߢߌߣߌ ߣߕߊ߬: ߟߏ߲ {hedef} ({durum})',
    kalanGun: cogul({ other: 'ߟߏ߲ {n} ߕߏߙߊ' }),
    tamamlandi: 'ߊ߬ ߘߊߝߊߙߊ',
    paylasErisim: 'ߊߟߎ߫ ߟߊ߫ ߢߍߕߊ ߕߌߟߊ',
    paylasBuyuk: 'ߊߟߎ߫ ߟߊ߫ ߢߍߕߊ ߕߌߟߊ',
  },

  hedefler: {
    ilk_adim: { ad: 'ߞߎ߲߬ߢߐ߮ ߝߟߐ', aciklama: 'ߛߊߟߌ ߞߍ߫ ߟߏ߲ 7 ߞߐ߬ߣߐ ߞߵߊ߬ ߛߐ߬ߘߐ߲߬ ߊ߬ ߡߊ߬ ߕߌߜߍ', cumle: 'ߞߎ߲߬ߢߐ߮ ߝߟߐ' },
    aliskanlik_ustasi: { ad: 'ߘߊߟߌߟߎ ߞߊߙߊߡߐߜߐ', aciklama: 'ߟߏ߲ 21 - ߘߊߟߌߟߎ ߛߌߜߌ ߥߊ߯ߕߌ߫', cumle: 'ߘߊߟߌߟߎ ߞߊߙߊߡߐߜߐ' },
    kararlilik: { ad: 'ߛߊߓߊߕߌߟߌ', aciklama: 'ߟߏ߲ 60 ߞߵߊ߬ ߛߐ߬ߘߐ߲߬ ߊ߬ ߡߊ߬ ߕߌߜߍ', cumle: 'ߛߊߓߊߕߌߟߌ' },
    efsane: { ad: 'ߕߐߜߐߓߊ', aciklama: 'ߟߏ߲ 90 - ߡߎߢߎߟߌ ߓߊ߯', cumle: 'ߕߐߜߐߓߊ' },
  },

  /** Klasik mertebe adları, Arapçadan N'Ko harf çevirisi (çeviri değil). */
  seviyeler: ['ߡߎߓߑߕߊߘߌ', 'ߕߊߟߌߓߎ', 'ߛߊߟߌߞߎ', 'ߡߎߙߌߘߎ', 'ߊߙߌߝߎ', 'ߤߊߝߌߖ߭ߎ', 'ߞߊߡߌߟߎ'],

  rozetler: {
    ilk_adim: { ad: 'ߕߊߓߟߏ ߝߟߐ', aciklama: 'ߊߟߎ߫ ߦߋ߫ ߊߟߎ߫ ߟߊ߫ ߞߎ߲߬ߢߐ߮ ߝߟߐ ߘߝߊ߫.', kosul: 'ߟߏ߲ 7 ߕߎߜߎ߲ߠߌ' },
    aliskanlik_ustasi: {
      ad: 'ߘߊߟߌߟߎ ߞߊߙߊߡߐߜߐ',
      aciklama: 'ߟߏ߲ 21 - ߘߊߟߌߟߎ ߛߌߜߌ ߥߊ߯ߕߌ߫ ߘߊߝߊߙߊ.',
      kosul: 'ߟߏ߲ 21 ߕߎߜߎ߲ߠߌ',
    },
    kararlilik: { ad: 'ߛߊߓߊߕߌߟߋ߲', aciklama: 'ߊߟߎ߫ ߦߋ߫ ߛߊߟߌ ߞߍ߫ ߟߏ߲ 60 ߞߵߊ߬ ߛߐ߬ߘߐ߲߬ ߊ߬ ߡߊ߬ ߕߌߜߍ.', kosul: 'ߟߏ߲ 60 ߕߎߜߎ߲ߠߌ' },
    efsane: { ad: 'ߕߐߜߐߓߊ', aciklama: 'ߟߏ߲ 90 - ߊߟߎ߫ ߦߋ߫ ߡߎߢߎߟߌ ߓߊ߯ ߦߌ߬ߘߊ߬.', kosul: 'ߟߏ߲ 90 ߕߎߜߎ߲ߠߌ' },
    toparlanma_ustasi: {
      ad: 'ߛߋߜߌ߲ ߞߊߙߊߡߐߜߐ',
      aciklama: 'ߊߟߎ߫ ߦߋ߫ ߛߋߜߌ߲ ߗߏߜߏ ߘߝߊ߫ ߛߌߢߍ 3.',
      kosul: 'ߛߋߜߌ߲ 3',
    },
    mukemmeliyetci: { ad: 'ߘߊߝߊߟߌߓߊ߯', aciklama: 'ߊߟߎ߫ ߦߋ߫ ߛߊߟߌ 5/5 ߞߍ߫ ߟߏ߲ 30.', kosul: 'ߟߏ߲ 30 ߛߊߟߌ 5/5' },
    yuz_namaz: { ad: 'ߛߊߟߌ 100', aciklama: 'ߊߟߎ߫ ߦߋ߫ ߛߊߟߌ 100 ߞߍ߫ ߊ߬ ߓߍ߯ ߟߊߖߍߟߋ߲.', kosul: 'ߛߊߟߌ 100 ߞߍ߫' },
    bin_namaz: { ad: 'ߛߊߟߌ 1000', aciklama: 'ߊߟߎ߫ ߦߋ߫ ߛߊߟߌ 1000 ߞߍ߫ ߊ߬ ߓߍ߯ ߟߊߖߍߟߋ߲.', kosul: 'ߛߊߟߌ 1000 ߞߍ߫' },
  },

  rozetSeviyeleri: { bronz: 'ߖ߭ߌߙߊ', gumus: 'ߥߊߙߌߖߍ', altin: 'ߛߊߣߎ', elmas: 'ߘߌߦߊߡߊ߲' },

  gunBitis: {
    erken: 'ߡߐ߰ ߡߌ߲ߠߎ ߓߍ߫ ߘߊ߫ ߖߏߣߊ߫',
    varsayilan: 'ߊ߬ ߗߏߜߏ ߝߟߐ - ߛߊߣߌ߬ ߖߍߡߎߙߍ߲ ߦߙߐ߫ ߗߊߡߊ߲ ߣߊ߬',
    gec: 'ߡߐ߰ ߡߌ߲ߠߎ ߓߍ߫ ߘߊ߫ ߞߐߝߍ߬',
  },

  kutlama: {
    rozetEklendi: '🏅 ߊ߬ ߟߊߙߊ ߊߟߎ߫ ߟߊ߫ ߕߊ߯ߡߊߛߌߦߍ߲ ߟߎ߬ ߞߊ߲',
    paylasin: 'ߊ߬ ߕߌߟߊ',
    rozetBaslik: 'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮',
    rozetMesaj: 'ߊߟߎ߫ ߦߋ߫ "{ad}" ߕߊ߯ߡߊߛߌߦߍ߲ ߛߐ߬ߘߐ߲߬.',
    hedefBaslik: cogul({ other: 'ߟߏ߲ {n}' }),
    hedefMesaj: 'ߊߟߎ߫ ߦߋ߫ "{ad}" ߟߊߢߌߣߌ ߘߝߊ߫. ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮.',
    yeniRank: 'ߘߊߞߎ߲ ߞߎߘߊ: {rank}',
    seviyeBaslik: 'ߊߟߎ߫ ߟߊ߫ ߘߊߞߎ߲ ߞߎߘߊ',
    seviyeMesaj: 'ߊߟߎ߫ ߓߍ߫ ߕߊ߯ ߝߍ߬ ߛߌߛߍ߲߬ "{rank}" ߦߋ߫. ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮.',
    toparlanmaBaslik: 'ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߛߋߜߌ߲ߠߊ',
    toparlanmaMesaj: cogul({
      other: 'ߊߟߎ߫ ߟߊ߫ ߟߏ߲ {n} ߕߎߜߎ߲ߠߌ ߓߍ߫ ߕߊ߯ ߝߍ߬ ߊ߬ ߕߏߙߊ ߦߙߐ߫ ߡߌ߲߬. ߊߟߊ߫ ߦߋ߫ ߛߊߓߊߕߌߟߌ ߘߌ߫.',
    }),
    enUzunBaslik: 'ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߖߊ߲߬ߓߊ',
    enUzunMesaj: cogul({
      other: 'ߟߏ߲ {n}: ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߖߊ߲߬ߓߊ ߝߏ߫ ߛߌߛߍ߲߬. ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮.',
    }),
  },

  sekme: {
    hataOkunamadi: 'ߊߟߎ߫ ߟߊ߫ ߛߓߍߟߌ ߕߍߡߍ߲ߠߍ߲ ߟߎ߬ ߡߊ߬ ߛߋ߫ ߞߊ߬ ߞߊߟߊ߲ ߛߌߛߍ߲߬.',
    yenidenErisim: 'ߕߎߜߎ߲ߠߌ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߟߊߘߏ߲߬ ߕߎߜߎ߲',
    yenidenDeneyin: 'ߊ߬ ߞߍ߫ ߕߎߜߎ߲',
    yukleniyor: 'ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߓߍ߫ ߟߊߘߏ߲߬...',
    gunlukSeri: 'ߟߏ߲ ߕߎߜߎ߲ߠߌ',
    rekor: 'ߖߊ߲߬ߓߊ',
    sozErisim: '{metin} ߛߐߙߐߦߐߙߐ: {kaynak}',
  },

  tesbih: {
    varsayilanHedef: 'ߟߊߢߌߣߌ ߣߕߊ߬',
    tumu: 'ߊߟߎ߫ ߦߋ߫ ߕߊ߯ߡߊߛߌߦߍ߲ ߓߍ߯ ߘߝߊ߫',
    kalan: cogul({ other: '{ad} ߕߊ߯ߡߊߛߌߦߍ߲: ߟߏ߲ {n} ߕߏߙߊ' }),
    tumuErisim: 'ߊߟߎ߫ ߦߋ߫ ߕߊ߯ߡߊߛߌߦߍ߲ ߓߍ߯ ߘߝߊ߫: ߕߊߛߌߓߌߦߊ ߝߊ߬ߟߋ߲߬ ߘߏ߲߬.',
    erisim: '{ad} ߕߊ߯ߡߊߛߌߦߍ߲: ߟߏ߲ {n} ߘߊߝߊߙߊ {hedef} ߟߊ߫.',
  },

  gok: {
    gunHarfleri: ['ߞߐ߬ߓ', 'ߞߐ߬ߟ', 'ߞߎߣ', 'ߓߌߟ', 'ߛߌ߬ߣ', 'ߞߍ߲ߘ', 'ߞߊ߯ߙ'],
    erisim: '{ay}. {hedef}߸ {bes}߸ {donmus}. {seri}',
    hedefTutuldu: cogul({ other: 'ߟߏ߲ {n} ߛߋߙߊ ߟߊߢߌߣߌ ߡߊ߬' }),
    besVakit: cogul({ other: 'ߟߏ߲ {n} ߛߊߟߌ ߘߎ߬ߙߎ߫ ߓߍ߯ ߦߋ߫' }),
    dondurulmus: cogul({ other: 'ߟߏ߲ {n} ߖߐ߲߰ߣߍ߲' }),
    mevcutSeri: cogul({ other: 'ߕߎߜߎ߲ߠߌ ߛߌߛߍ߲߬ ߕߊ: ߟߏ߲ {n}.' }),
  },

  hedefAyar: {
    azalt: 'ߊ߬ ߘߐߜߐߦߊ',
    deger: 'ߤߊߞߍ',
    artir: 'ߊ߬ ߗߊߦߊ',
    esik: cogul({ other: 'ߛߊߟߌ {n}' }),
    sifirlaBaslik: 'ߕߎߜߎ߲ߠߌ ߘߊߡߌ߬ߣߊ߬ ߞߏߞߎߙߊ',
    sifirlaMesaj: 'ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߓߍ߯ (ߕߎߜߎ߲ߠߌ߸ ߕߊ߯ߡߊߛߌߦߍ߲߸ ߖߊ߬ߕߋ߬) ߓߍߣߊ߬ ߖߏ߬ߛߌ߬. ߣߌ߲߬ ߕߍ߫ ߛߋ߫ ߞߊ߬ ߟߊߛߋߜߌ߲. ߊߟߎ߫ ߓߴߊ߬ ߝߍ߬ ߞߊ߬ ߕߊ߯ ߝߍ߬ ߥߊ߫؟',
    sifirla: 'ߊ߬ ߘߊߡߌ߬ߣߊ߬ ߞߏߞߎߙߊ',
    iptal: 'ߊ߬ ߘߐߛߊ߬',
    basarili: 'ߊ߬ ߓߊ߲ߠߊ',
    sifirlandi: 'ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߖߏߛߌߙߊ.',
    hedefAyarlari: 'ߟߊߢߌߣߌ ߟߊ߬ߓߍ߲߬ߢߐ߲߰ߡߊ',
    tamGunEsigi: 'ߟߏ߲ ߘߝߊߣߍ߲ ߘߊ߲߫',
    tamGunAciklama: 'ߊ߬ ߓߍ߫ ߛߊߟߌ ߤߊߞߍ ߘߐߜߐߡߊ߲ߓߊ ߟߊߓߍ߲߬ ߟߏ߲ ߞߐ߬ߣߐ ߥߊߟߊߛߊ ߏ߬ ߟߏ߲ ߞߊ߬ ߖߊ߬ߕߋ߬ ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߟߊ߫',
    sifirlama: 'ߘߊߡߌ߬ߣߊ߬ ߞߏߞߎߙߊ',
    verileriSifirla: 'ߕߎߜߎ߲ߠߌ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߖߏ߬ߛߌ߬',
    verileriSifirlaAlt: 'ߊ߬ ߓߍ߫ ߕߎߜߎ߲ߠߌ߸ ߕߊ߯ߡߊߛߌߦߍ߲ ߣߌ߫ ߖߊ߬ߕߋ߬ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߓߍ߯ ߖߏ߬ߛߌ߬',
  },

  rozetKarti: {
    erisim: '{ad} ߕߊ߯ߡߊߛߌߦߍ߲߸ {durum}',
    kazanildi: 'ߛߐߙߐߟߋ߲',
    kilitli: 'ߘߊߕߎߜߎ߲ߠߍ߲',
  },

  toparlanma: {
    kartBaslik: 'ߛߋߜߌ߲ ߗߏߜߏ',
    kartAltBaslik: 'ߊߟߎ߫ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߛߐ߬ߘߐ߲߬ ߕߎߜߎ߲',
    kartMesaj: 'ߊߟߎ߫ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߊߟߎ߫ ߟߊ߫ {vurgu} ߕߎߜߎ߲ߠߌ ߟߊߕߊ߯ ߝߍ߬ ߊ߬ ߕߏߙߊ ߦߙߐ߫ ߡߌ߲߬.',
    oncekiGun: cogul({ other: 'ߟߏ߲ {n}' }),
    ilerleme: '{tamam}/{hedef} ߟߏ߲ ߘߊߝߊߙߊ',
    kalan: cogul({
      other: 'ߊߟߎ߫ ߦߋ߫ ߛߊߟߌ ߘߎ߬ߙߎ߫ ߓߍ߯ ߞߍ߫ ߟߏ߲ {n} ߥߍߙߍ߸ ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߓߍ߫ ߕߊ߯ ߝߍ߬ ߊ߬ ߕߏߙߊ ߦߙߐ߫ ߡߌ߲߬.',
    }),
    bugun: 'ߊߟߎ߫ ߦߋ߫ ߓߌ߬ ߘߝߊ߫߸ ߊߟߎ߫ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߓߍ߫ ߕߊ߯ ߝߍ߬ ߊ߬ ߕߏߙߊ ߦߙߐ߫ ߡߌ߲߬.',
    uyari: 'ߟߏ߲ ߟߎ߬ ߞߊ߬ ߞߊ߲ ߞߊ߬ ߕߎߜߎ ߢߐߜߐ߲ ߣߊ߬; ߣߌ߫ ߟߏ߲ ߞߋߟߋ߲߫ ߕߎߣߎ߲߫ ߎ߯ ߗߍ߭߸ ߛߋߜߌ߲ ߓߍ߫ ߘߊߡߌ߬ߣߊ߬ ߞߏߞߎߙߊ.',
    kapatErisim: 'ߛߋߜߌ߲ ߞߎ߲߬ߠߊ߬ߝߏߣߌ߲ ߟߎ߬ ߘߊߕߎ߲߯',
    anladim: 'ߒ ߦߋ߫ ߊ߬ ߝߊ߯ߡߎ',
  },

  paylasim: {
    marka: 'Namaz Akışı',
    modalBaslik: 'ߊߟߎ߫ ߟߊ߫ ߢߍߕߊ ߕߌߟߊ',
    hazirDegilBaslik: 'ߖߊ߭ ߡߊ߬ ߟߊߓߍ߲߬',
    hazirDegilMesaj: 'ߖߊ߭ ߡߊ߬ ߟߊߓߍ߲߬ ߝߟߐ. ߊߟߎ߫ ߦߋ߫ ߊ߬ ߞߍ߫ ߕߎߜߎ߲ ߝߌ߬ߟߊ߲ ߘߐ߯ߣߌ߲ ߞߐߝߍ߬.',
    olusturulamadiBaslik: 'ߖߊ߭ ߡߊ߬ ߛߋ߫ ߞߊ߬ ߘߌߟߊ߲',
    olusturulamadiMesaj: 'ߝߟߌ߬ ߘߐ߫ ߞߍߙߊ ߖߊ߭ ߘߌߟߊ߲ߠߌ ߣߊ߬. ߊߟߎ߫ ߦߋ߫ ߊ߬ ߞߍ߫ ߕߎߜߎ߲.',
    kullanilamiyorBaslik: 'ߕߌߟߊߟߌ ߕߍ߫ ߛߐ߬ߘߐ߲߬',
    kullanilamiyorMesaj: 'ߕߌߟߊߟߌ ߕߍ߫ ߛߋ߫ ߞߊ߬ ߞߍ߫ ߣߌ߲߬ ߡߌߣߍ߲ ߣߊ߬.',
    kapat: 'ߊ߬ ߘߊߕߎ߲߯',
    hikaye: 'ߊ߬ ߟߊ߫ ߊߟߎ߫ ߟߊ߫ ߡߊߣߊ߬ ߞߊ߲',
    platformlar: 'ߊ߬ ߓߍ߫ ߛߋ߫ ߞߊ߬ ߕߌߟߊ Instagram߸ WhatsApp ߊߣߌ ߕߐ߮ ߟߎ߬ ߞߊ߲.',
    tamam: 'ߐ߲߬ߤߐ߲߫',
    seriEnUzun: cogul({ other: 'ߒ ߟߊ߫ ߕߎߜߎ߲ߠߌ ߖߊ߲߬ߓߊ: ߟߏ߲ {n}' }),
    seriZincir: cogul({ other: 'ߟߏ߲ ߞߵߊ߬ ߛߐ߬ߘߐ߲߬ ߖߟߐ߬ߞߐ ߡߊ߬ ߕߌߜߍ' }),
    seriSoz: '"ߕߊߓߟߏ ߝߌߕߌߣߌ ߟߏ߲ ߏ߬ ߟߏ߲߸ ߤߙߍ ߓߊ߯ ߒ ߣߌ߫ ߞߐ߬ߣߐ. 🔥"',
    rozetYeni: 'ߒ ߦߋ߫ ߕߊ߯ߡߊߛߌߦߍ߲ ߞߎߘߊ ߛߐ߬ߘߐ߲߬',
    rozetSozleri: [
      'ߓߌ߬ ߒ ߦߋ߫ ߕߊߓߟߏ ߢߎ߬ߡߊ߲߬ ߕߊ ߒ ߦߍߙߍ߫ ߞߊߡߊ߬. 🌟',
      'ߒ ߓߍ߫ ߕߊ߯ ߝߍ߬ ߣߌ߫ ߛߊߓߊߕߌߟߌ ߦߋ߫; ߣߌ߲߬ ߕߊ߯ߡߊߛߌߦߍ߲ ߦߋ߫ ߒ ߕߊ ߦߋ߫. 💪',
      'ߒ ߦߋ߫ ߛߐߜߐߡߊ ߓߊߙߌߞߊ ߛߐ߬ߘߐ߲߬. 🌅',
      'ߒ ߓߍ߫ ߣߌ߲߬ ߛߌߙߊ ߟߊ߫ ߡߌ߲߬ ߓߍ߫ ߒ ߣߌ߫ ߢߍ߫. ✨',
      'ߕߊߓߟߏ ߝߌߕߌߣߌ ߟߎ߬ ߓߍ߫ ߤߙߍ ߓߊ߯ ߟߊߣߊ߬. 🍃',
    ],
    etiketler: {
      rozet_kazanildi: 'ߒ ߦߋ߫ ߕߊ߯ߡߊߛߌߦߍ߲ ߞߎߘߊ ߛߐ߬ߘߐ߲߬',
      hedef_tamamlandi: 'ߒ ߛߋߙߊ ߒ ߟߊ߫ ߟߊߢߌߣߌ ߡߊ߬',
      seviye_atlandi: 'ߘߊߞߎ߲ ߞߎߘߊ',
      toparlanma_tamamlandi: 'ߒ ߛߋߜߌ߲ߠߊ ߛߌߙߊ ߞߊ߲',
      en_uzun_seri: 'ߖߊ߲߬ߓߊ ߞߎߘߊ',
      varsayilan: 'ߢߍߕߊ',
    },
    kutlamaSozleri: {
      rozet_kazanildi: ['ߒ ߡߊߕߌߜߌ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮. 🤲', 'ߕߊߓߟߏ ߝߌߕߌߣߌ ߟߎ߬ ߓߍ߫ ߤߙߍ ߓߊ߯ ߟߊߣߊ߬. 🍃', 'ߊߟߊ߫ ߦߋ߫ ߛߊߓߊߕߌߟߌ ߘߌ߫ ߊ߲ ߓߍ߯ ߡߊ߬. 🌱'],
      hedef_tamamlandi: ['ߕߊߓߟߏ ߝߌߕߌߣߌ ߟߎ߬ ߓߍ߫ ߤߙߍ ߓߊ߯ ߟߊߣߊ߬. 🍃', 'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮. 🤲', 'ߕߊߓߟߏ ߞߋߟߋ߲߫ ߥߍߙߍ ߟߏ߲ ߏ߬ ߟߏ߲. 🌱'],
      seviye_atlandi: [
        'ߘߐ߯ߣߌ߲ ߥߍߙߍ ߟߏ߲ ߏ߬ ߟߏ߲; ߊߟߊ߫ ߦߋ߫ ߊ߬ ߣߐߜߐߦߊ. 🍃',
        'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮. 🤲',
        'ߕߊ߯ߡߊ ߓߍ߫ ߕߊ߯ ߝߍ߬. 🌱',
      ],
      toparlanma_tamamlandi: [
        'ߓߌ߲ߠߌ ߕߍ߫ ߞߎ߲߭ ߦߋ߫߸ ߥߎߟߌ ߘߋ߬ ߦߋ߫ ߞߎ߲߭ ߦߋ߫. 🔄',
        'ߊߟߊ߫ ߦߋ߫ ߛߊߓߊߕߌߟߌ ߘߌ߫. 🤲',
        'ߛߌߙߊ ߓߍ߯ ߓߍ߫ ߕߊ߯ߡߊ ߣߌ߫ ߡߎߢߎ ߦߋ߫. 🌱',
      ],
      en_uzun_seri: [
        'ߕߊߓߟߏ ߝߌߕߌߣߌ ߟߏ߲ ߏ߬ ߟߏ߲߸ ߤߙߍ ߓߊ߯ ߒ ߘߎߛߎ ߞߐ߬ߣߐ. 🍃',
        'ߊߟߊ߫ ߦߋ߫ ߊ߬ ߛߓߊ߬ߕߌ߮. 🤲',
        'ߒ ߡߊߕߌߜߌ ߦߋ߫ ߛߊߓߊߕߌߟߌ ߘߌ߫ ߊ߲ ߓߍ߯ ߡߊ߬. 🌱',
      ],
    },
  },
};
