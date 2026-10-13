import {
  DUZ_POSTUR,
  MASAUSTU_MIN_YARI_DP,
  gunDuzeniSec,
  masaustuBolmeleriHesapla,
  posturlerAyniMi,
  posturuCoz,
} from '../katlanmaPosturu';

const sinir = { sol: 0, ust: 440, sag: 800, alt: 452 };

describe('posturuCoz', () => {
  it('yarı açık + yatay menteşe = MASAÜSTÜ (menteşe sınırıyla)', () => {
    expect(posturuCoz({ durum: 'yariAcik', yon: 'yatay', ayirici: true, sinir })).toEqual({
      tur: 'masaustu',
      mentese: sinir,
    });
  });

  it('yarı açık + dikey menteşe = kitap', () => {
    expect(posturuCoz({ durum: 'yariAcik', yon: 'dikey', sinir }).tur).toBe('kitap');
  });

  it('tam açık (duz) daima düz — menteşe sınırı olsa bile', () => {
    expect(posturuCoz({ durum: 'duz', yon: 'yatay', sinir })).toBe(DUZ_POSTUR);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['dize', 'yariAcik'],
    ['boş nesne', {}],
    ['sınır yok', { durum: 'yariAcik', yon: 'yatay', sinir: null }],
    ['sınır eksik alan', { durum: 'yariAcik', yon: 'yatay', sinir: { sol: 0, ust: 1, sag: 2 } }],
    ['sınır NaN', { durum: 'yariAcik', yon: 'yatay', sinir: { ...sinir, ust: Number.NaN } }],
    ['ters kutu', { durum: 'yariAcik', yon: 'yatay', sinir: { sol: 0, ust: 500, sag: 800, alt: 400 } }],
    ['bilinmeyen yön', { durum: 'yariAcik', yon: 'capraz', sinir }],
  ])('BOZUK veri (%s) düze düşer', (_ad, ham) => {
    expect(posturuCoz(ham)).toBe(DUZ_POSTUR);
  });
});

describe('gunDuzeniSec', () => {
  const masaustu = posturuCoz({ durum: 'yariAcik', yon: 'yatay', sinir });
  const kitap = posturuCoz({ durum: 'yariAcik', yon: 'dikey', sinir });

  it('düz postürde pencere sınıfı karar verir (eski davranış birebir)', () => {
    expect(gunDuzeniSec('kompakt', DUZ_POSTUR)).toBe('tek');
    expect(gunDuzeniSec('orta', DUZ_POSTUR)).toBe('ikiBolme');
    expect(gunDuzeniSec('genis', DUZ_POSTUR)).toBe('ikiBolme');
  });

  it('masaüstü postürü pencere sınıfından ÖNCE gelir (Z Flip iç ekranı kompakt, Fold yatay geniş)', () => {
    expect(gunDuzeniSec('kompakt', masaustu)).toBe('masaustu');
    expect(gunDuzeniSec('genis', masaustu)).toBe('masaustu');
  });

  it('kitap postürü masaüstü düzeni AÇMAZ', () => {
    expect(gunDuzeniSec('orta', kitap)).toBe('ikiBolme');
    expect(gunDuzeniSec('kompakt', kitap)).toBe('tek');
  });
});

describe('masaustuBolmeleriHesapla', () => {
  it('yarılar menteşenin sayfa içindeki konumundan hesaplanır', () => {
    expect(masaustuBolmeleriHesapla(sinir, 100, 700)).toEqual({
      ustYukseklik: 340,
      menteseYukseklik: 12,
      altYukseklik: 348,
    });
  });

  it('yarı en küçük sınırın altına düşerse null (eşit bölmeye düşülür)', () => {
    const yakin = { sol: 0, ust: 100 + MASAUSTU_MIN_YARI_DP - 1, sag: 800, alt: 100 + MASAUSTU_MIN_YARI_DP - 1 };
    expect(masaustuBolmeleriHesapla(yakin, 100, 700)).toBeNull();
    // Menteşe sayfanın dışında (başlığın üstünde).
    expect(masaustuBolmeleriHesapla({ sol: 0, ust: 50, sag: 800, alt: 50 }, 100, 700)).toBeNull();
  });

  it('geçersiz ölçü null döner', () => {
    expect(masaustuBolmeleriHesapla(sinir, Number.NaN, 700)).toBeNull();
    expect(masaustuBolmeleriHesapla(sinir, 100, 0)).toBeNull();
  });
});

describe('posturlerAyniMi', () => {
  it('değerce aynı postür aynıdır, menteşe kayınca değildir', () => {
    const a = posturuCoz({ durum: 'yariAcik', yon: 'yatay', sinir });
    const b = posturuCoz({ durum: 'yariAcik', yon: 'yatay', sinir: { ...sinir } });
    const c = posturuCoz({ durum: 'yariAcik', yon: 'yatay', sinir: { ...sinir, ust: 441 } });
    expect(posturlerAyniMi(a, b)).toBe(true);
    expect(posturlerAyniMi(a, c)).toBe(false);
    expect(posturlerAyniMi(a, DUZ_POSTUR)).toBe(false);
    expect(posturlerAyniMi(DUZ_POSTUR, posturuCoz(null))).toBe(true);
  });
});
