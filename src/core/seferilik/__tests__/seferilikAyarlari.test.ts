import {
  VARSAYILAN_SEFERILIK_AYARLARI,
  gecerliKoordinatMi,
  seferilikAyarlariniNormalize,
  seferilikHafizasiniNormalize,
} from '../seferilikAyarlari';

describe('seferilikAyarlariniNormalize', () => {
  it('bozuk / nesne-dışı kayıt varsayılana düşer (kart açık, Hanefî, ikamet yok)', () => {
    for (const ham of [null, undefined, 42, 'x', [], true]) {
      expect(seferilikAyarlariniNormalize(ham)).toEqual(VARSAYILAN_SEFERILIK_AYARLARI);
    }
    expect(VARSAYILAN_SEFERILIK_AYARLARI).toEqual({ kartAcik: true, mezhep: 'hanefi', ikamet: null });
  });

  it('yalnız açık `false` kartı kapatır; bilinmeyen mezhep Hanefî olur', () => {
    expect(seferilikAyarlariniNormalize({ kartAcik: 'hayir', mezhep: 'maliki' })).toMatchObject({
      kartAcik: true,
      mezhep: 'hanefi',
    });
    expect(seferilikAyarlariniNormalize({ kartAcik: false, mezhep: 'safii' })).toMatchObject({
      kartAcik: false,
      mezhep: 'safii',
    });
  });

  it('ikamet: geçerli koordinat korunur, ad kırpılır; {0,0} ve bozuk değer düşer', () => {
    expect(
      seferilikAyarlariniNormalize({ ikamet: { lat: 41, lng: 29, ad: ' Üsküdar ', kaynak: 'kullanici' } }).ikamet,
    ).toEqual({ lat: 41, lng: 29, ad: 'Üsküdar', kaynak: 'kullanici' });
    expect(seferilikAyarlariniNormalize({ ikamet: { lat: 41, lng: 29, ad: '  ' } }).ikamet).toEqual({
      lat: 41,
      lng: 29,
      kaynak: 'ilkKonum',
    });
    expect(seferilikAyarlariniNormalize({ ikamet: { lat: 0, lng: 0 } }).ikamet).toBeNull();
    expect(seferilikAyarlariniNormalize({ ikamet: { lat: '41', lng: 29 } }).ikamet).toBeNull();
  });
});

describe('seferilikHafizasiniNormalize', () => {
  it('yalnız `true` kapatılmış sayılır', () => {
    expect(seferilikHafizasiniNormalize({ yolculuktaKapatildi: true })).toEqual({ yolculuktaKapatildi: true });
    expect(seferilikHafizasiniNormalize({ yolculuktaKapatildi: 1 })).toEqual({ yolculuktaKapatildi: false });
    expect(seferilikHafizasiniNormalize('null')).toEqual({ yolculuktaKapatildi: false });
  });
});

describe('gecerliKoordinatMi', () => {
  it('sonlu, aralıkta ve {0,0} değil', () => {
    expect(gecerliKoordinatMi({ lat: 39.9, lng: 32.8 })).toBe(true);
    expect(gecerliKoordinatMi({ lat: 0, lng: 0 })).toBe(false);
    expect(gecerliKoordinatMi({ lat: 0, lng: 5 })).toBe(true);
    expect(gecerliKoordinatMi({ lat: Infinity, lng: 5 })).toBe(false);
    expect(gecerliKoordinatMi({ lat: 10, lng: 181 })).toBe(false);
    expect(gecerliKoordinatMi(null)).toBe(false);
  });
});
