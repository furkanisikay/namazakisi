import { ozelGunKumesi, OzelGunGirdisi } from '../ozelGunKumesi';

describe('ozelGunKumesi', () => {
  const bosGirdi: OzelGunGirdisi = {
    ozelGunModuAktif: false,
    aktifOzelGun: null,
    gecmisKayitlar: [],
  };

  test('bos girdide bos kume doner', () => {
    const kume = ozelGunKumesi(bosGirdi);
    expect(kume.size).toBe(0);
  });

  test('aralik genisletilir (baslangic-bitis dahil)', () => {
    const kume = ozelGunKumesi({
      ...bosGirdi,
      gecmisKayitlar: [{ baslangicTarihi: '2026-01-10', bitisTarihi: '2026-01-13' }],
    });
    expect([...kume].sort()).toEqual([
      '2026-01-10',
      '2026-01-11',
      '2026-01-12',
      '2026-01-13',
    ]);
  });

  test('tek gunluk aralik tek eleman uretir', () => {
    const kume = ozelGunKumesi({
      ...bosGirdi,
      gecmisKayitlar: [{ baslangicTarihi: '2026-03-05', bitisTarihi: '2026-03-05' }],
    });
    expect([...kume]).toEqual(['2026-03-05']);
  });

  test('gecmisKayitlar kosulsuz katilir (mod kapali olsa da)', () => {
    const kume = ozelGunKumesi({
      ozelGunModuAktif: false,
      aktifOzelGun: null,
      gecmisKayitlar: [{ baslangicTarihi: '2026-02-01', bitisTarihi: '2026-02-02' }],
    });
    expect([...kume].sort()).toEqual(['2026-02-01', '2026-02-02']);
  });

  test('ozelGunModuAktif false iken aktifOzelGun KATILMAZ', () => {
    const kume = ozelGunKumesi({
      ozelGunModuAktif: false,
      aktifOzelGun: { baslangicTarihi: '2026-04-01', bitisTarihi: '2026-04-03' },
      gecmisKayitlar: [],
    });
    expect(kume.size).toBe(0);
  });

  test('ozelGunModuAktif true iken aktifOzelGun katilir', () => {
    const kume = ozelGunKumesi({
      ozelGunModuAktif: true,
      aktifOzelGun: { baslangicTarihi: '2026-04-01', bitisTarihi: '2026-04-03' },
      gecmisKayitlar: [],
    });
    expect([...kume].sort()).toEqual(['2026-04-01', '2026-04-02', '2026-04-03']);
  });

  test('ters aralik (bitis < baslangic) bos doner, cokmez', () => {
    const kume = ozelGunKumesi({
      ...bosGirdi,
      gecmisKayitlar: [{ baslangicTarihi: '2026-05-10', bitisTarihi: '2026-05-05' }],
    });
    expect(kume.size).toBe(0);
  });

  test('asiri genis aralik ust sinirla kesilir (sonsuz donguye girmez)', () => {
    const kume = ozelGunKumesi({
      ...bosGirdi,
      gecmisKayitlar: [{ baslangicTarihi: '2020-01-01', bitisTarihi: '2030-01-01' }],
    });
    expect(kume.size).toBeLessThanOrEqual(400);
    expect(kume.size).toBeGreaterThan(0);
  });

  test('birden fazla aralik birlesir', () => {
    const kume = ozelGunKumesi({
      ozelGunModuAktif: true,
      aktifOzelGun: { baslangicTarihi: '2026-06-01', bitisTarihi: '2026-06-01' },
      gecmisKayitlar: [
        { baslangicTarihi: '2026-01-01', bitisTarihi: '2026-01-02' },
        { baslangicTarihi: '2026-02-05', bitisTarihi: '2026-02-05' },
      ],
    });
    expect([...kume].sort()).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-02-05',
      '2026-06-01',
    ]);
  });
});
