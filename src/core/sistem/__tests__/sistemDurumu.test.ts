import {
  BILINMEYEN_SISTEM_DURUMU,
  DENGELI_KONUM_DOGRULUGU,
  GUNCELLEME_ERTELEME_TAVANI_MS,
  SistemDurumu,
  arkaPlanKisitlanmisMi,
  dekoratifHareketAzaltilsinMi,
  guncellemeKontroluErtelensinMi,
  konumDogrulugunuSinirla,
  sinirsizAgMi,
  sistemCipi,
  sistemDurumuEsitMi,
  sistemDurumunuCoz,
} from '../sistemDurumu';

const d = (x: Partial<SistemDurumu>): SistemDurumu => ({ ...BILINMEYEN_SISTEM_DURUMU, ...x });

describe('sistemDurumunuCoz', () => {
  it('Android ham sözlüğünü çevirir (sabit kodları dahil)', () => {
    expect(
      sistemDurumunuCoz({
        platform: 'android',
        gucTasarrufu: true,
        veriTasarrufu: 3,
        olculuAg: true,
        agTuru: 'hucresel',
        sarjda: false,
        pilYuzde: 41,
        arkaPlanKisitli: false,
        beklemeKovasi: 45,
        konumGucModu: 2,
      })
    ).toEqual({
      platform: 'android',
      gucTasarrufu: true,
      veriTasarrufu: 'acik',
      olculuAg: true,
      agTuru: 'hucresel',
      sarjda: false,
      pilYuzde: 41,
      arkaPlanKisitli: false,
      beklemeKovasi: 'kisitli',
      arkaPlanYenileme: null,
    });
  });

  it('Veri Tasarrufu kodları: 1 kapalı, 2 muaf, 3 açık; iOS dizeleri', () => {
    expect(sistemDurumunuCoz({ veriTasarrufu: 1 }).veriTasarrufu).toBe('kapali');
    expect(sistemDurumunuCoz({ veriTasarrufu: 2 }).veriTasarrufu).toBe('muaf');
    expect(sistemDurumunuCoz({ veriTasarrufu: 'acik' }).veriTasarrufu).toBe('acik');
    expect(sistemDurumunuCoz({ veriTasarrufu: 9 }).veriTasarrufu).toBeNull();
  });

  it('bekleme kovaları; bilinmeyen sayı "diger", sayı olmayan null', () => {
    expect(sistemDurumunuCoz({ beklemeKovasi: 10 }).beklemeKovasi).toBe('aktif');
    expect(sistemDurumunuCoz({ beklemeKovasi: 40 }).beklemeKovasi).toBe('nadir');
    expect(sistemDurumunuCoz({ beklemeKovasi: 5 }).beklemeKovasi).toBe('diger');
    expect(sistemDurumunuCoz({ beklemeKovasi: 'x' }).beklemeKovasi).toBeNull();
  });

  it('bozuk girdi asla fırlatmaz: her alan bilinmiyor', () => {
    expect(sistemDurumunuCoz(null)).toEqual(BILINMEYEN_SISTEM_DURUMU);
    expect(sistemDurumunuCoz('x')).toEqual(BILINMEYEN_SISTEM_DURUMU);
    expect(sistemDurumunuCoz({ gucTasarrufu: 'evet', pilYuzde: 140, agTuru: 'uydu' })).toEqual(BILINMEYEN_SISTEM_DURUMU);
  });

  it('sistemDurumuEsitMi alan alan karşılaştırır', () => {
    expect(sistemDurumuEsitMi(d({ sarjda: true }), d({ sarjda: true }))).toBe(true);
    expect(sistemDurumuEsitMi(d({ sarjda: true }), d({ sarjda: false }))).toBe(false);
  });
});

describe('politika', () => {
  it('sınırsız ağ: Wi-Fi/kablolu ve ölçülmeyen; bilinmiyorsa null', () => {
    expect(sinirsizAgMi(d({ agTuru: 'wifi', olculuAg: false }))).toBe(true);
    expect(sinirsizAgMi(d({ agTuru: 'wifi', olculuAg: true }))).toBe(false); // kişisel erişim noktası
    expect(sinirsizAgMi(d({ agTuru: 'hucresel' }))).toBe(false);
    expect(sinirsizAgMi(d({ agTuru: 'ethernet' }))).toBe(true);
    expect(sinirsizAgMi(d({}))).toBeNull();
  });

  it('dekoratif hareket yalnız güç tasarrufunda azalır (bilinmiyor = hareket açık)', () => {
    expect(dekoratifHareketAzaltilsinMi(d({ gucTasarrufu: true }))).toBe(true);
    expect(dekoratifHareketAzaltilsinMi(d({ gucTasarrufu: false }))).toBe(false);
    expect(dekoratifHareketAzaltilsinMi(d({}))).toBe(false);
  });

  it('konum doğruluğu güç tasarrufunda en fazla dengeli; düşük istek yükseltilmez', () => {
    expect(konumDogrulugunuSinirla(6, d({ gucTasarrufu: true }))).toBe(DENGELI_KONUM_DOGRULUGU);
    expect(konumDogrulugunuSinirla(2, d({ gucTasarrufu: true }))).toBe(2);
    expect(konumDogrulugunuSinirla(6, d({ gucTasarrufu: false }))).toBe(6);
    expect(konumDogrulugunuSinirla(6, d({}))).toBe(6);
  });

  it('güncelleme kontrolü: ölçülen ağ / veri tasarrufu erteler; elle, ilk kontrol ve 7 gün tavanı ertelemez', () => {
    const simdiMs = 10 * GUNCELLEME_ERTELEME_TAVANI_MS;
    const yakin = simdiMs - 60_000;
    const hucresel = d({ agTuru: 'hucresel', olculuAg: true });
    expect(guncellemeKontroluErtelensinMi({ sistem: hucresel, zorla: false, sonKontrolMs: yakin, simdiMs })).toBe(true);
    expect(
      guncellemeKontroluErtelensinMi({ sistem: d({ agTuru: 'wifi', veriTasarrufu: 'acik' }), zorla: false, sonKontrolMs: yakin, simdiMs })
    ).toBe(true);
    expect(guncellemeKontroluErtelensinMi({ sistem: hucresel, zorla: true, sonKontrolMs: yakin, simdiMs })).toBe(false);
    expect(guncellemeKontroluErtelensinMi({ sistem: hucresel, zorla: false, sonKontrolMs: null, simdiMs })).toBe(false);
    expect(
      guncellemeKontroluErtelensinMi({ sistem: hucresel, zorla: false, sonKontrolMs: simdiMs - GUNCELLEME_ERTELEME_TAVANI_MS, simdiMs })
    ).toBe(false);
    expect(
      guncellemeKontroluErtelensinMi({ sistem: d({ agTuru: 'wifi', olculuAg: false }), zorla: false, sonKontrolMs: yakin, simdiMs })
    ).toBe(false);
    // Bilinmiyor (köprüsüz build) ertelemez.
    expect(guncellemeKontroluErtelensinMi({ sistem: d({}), zorla: false, sonKontrolMs: yakin, simdiMs })).toBe(false);
  });

  it('arka plan kısıtı: "Kısıtlı" kullanım ya da RESTRICTED kovası', () => {
    expect(arkaPlanKisitlanmisMi(d({ arkaPlanKisitli: true }))).toBe(true);
    expect(arkaPlanKisitlanmisMi(d({ beklemeKovasi: 'kisitli' }))).toBe(true);
    expect(arkaPlanKisitlanmisMi(d({ beklemeKovasi: 'nadir', arkaPlanKisitli: false }))).toBe(false);
    expect(arkaPlanKisitlanmisMi(d({}))).toBe(false);
  });
});

describe('sistemCipi', () => {
  it('iOS Düşük Güç Modu: hatırlatmalar etkilenmez (yerel bildirim)', () => {
    expect(sistemCipi(d({ platform: 'ios', gucTasarrufu: true }), null)?.metin).toBe(
      'Düşük Güç Modu açık — hatırlatmalar etkilenmez'
    );
  });

  it('Android: "etkilenmez" YALNIZ pil muafiyeti varken ve arka plan kısıtı yokken söylenir', () => {
    const acik = d({ platform: 'android', gucTasarrufu: true });
    expect(sistemCipi(acik, true)).toMatchObject({ metin: 'Güç tasarrufu açık — hatırlatmalar etkilenmez', ton: 'bilgi' });
    expect(sistemCipi(acik, null)).toMatchObject({ metin: 'Güç tasarrufu açık — hatırlatmalar gecikebilir', pilRehberi: false });
    expect(sistemCipi(acik, false)).toMatchObject({ ton: 'uyari', pilRehberi: true });
    expect(sistemCipi({ ...acik, beklemeKovasi: 'kisitli' }, true)).toMatchObject({ ton: 'uyari', pilRehberi: true });
  });

  it('veri tasarrufu çipi; hiçbir koşul yoksa ya da bilinmiyorsa çip yok', () => {
    expect(sistemCipi(d({ platform: 'android', veriTasarrufu: 'acik' }), true)?.metin).toBe(
      'Veri tasarrufu açık — hatırlatmalar etkilenmez'
    );
    expect(sistemCipi(d({ platform: 'ios', veriTasarrufu: 'acik' }), null)?.metin).toBe(
      'Düşük Veri Modu açık — hatırlatmalar etkilenmez'
    );
    expect(sistemCipi(d({ platform: 'android', veriTasarrufu: 'muaf' }), true)).toBeNull();
    expect(sistemCipi(d({}), null)).toBeNull();
  });
});
