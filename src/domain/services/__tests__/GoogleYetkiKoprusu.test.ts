/**
 * `modules/expo-google-yetki/src/index.ts` köprü sarmalayıcısı (issue #288).
 *
 * moduleNameMapper `.../src` yolunu mock'a çevirdiği için gerçek dosya `src/index`
 * yoluyla yüklenir; `expo-modules-core` jest'te gerçek hâliyle yüklenemediği için
 * `requireOptionalNativeModule` burada sahte köprüyü döndürür. Modül düzeyi önbellek
 * her testte `jest.isolateModules` ile sıfırlanır.
 */
import { Platform } from 'react-native';

const mockKopru: { deger: Record<string, jest.Mock> | null } = { deger: null };
jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: () => mockKopru.deger,
}));

type Kopru = typeof import('../../../../modules/expo-google-yetki/src/index');

const yukle = (): Kopru => {
  let m: Kopru | undefined;
  jest.isolateModules(() => {
    m = require('../../../../modules/expo-google-yetki/src/index') as Kopru;
  });
  return m!;
};

const sahteKopru = () => ({
  playHizmetleriVarMi: jest.fn().mockReturnValue(true),
  yetkiAl: jest.fn().mockResolvedValue({ durum: 'izin', belirtec: 'B', kapsamlar: ['k'] }),
  belirteciTemizle: jest.fn().mockResolvedValue(true),
  erisimiGeriAl: jest.fn().mockResolvedValue(true),
});

describe('expo-google-yetki köprüsü', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockKopru.deger = sahteKopru();
  });

  it('köprü yoksa hiçbir fonksiyon fırlatmaz: kullanılamaz, hata sonucu, false', async () => {
    mockKopru.deger = null;
    const k = yukle();
    expect(k.googleYetkisiKullanilabilirMi()).toBe(false);
    await expect(k.googleYetkiAl(['k'], true)).resolves.toMatchObject({ durum: 'hata' });
    await expect(k.googleBelirteciTemizle('B')).resolves.toBe(false);
    await expect(k.googleErisimiGeriAl(['k'])).resolves.toBe(false);
  });

  it('iOS\'ta köprü olsa bile kullanılamaz', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    expect(yukle().googleYetkisiKullanilabilirMi()).toBe(false);
  });

  it('Play hizmetleri VAR sonucu önbelleklenir (köprü bir kez sorulur)', () => {
    const k = yukle();
    expect(k.googleYetkisiKullanilabilirMi()).toBe(true);
    expect(k.googleYetkisiKullanilabilirMi()).toBe(true);
    expect(mockKopru.deger!.playHizmetleriVarMi).toHaveBeenCalledTimes(1);
  });

  it('YOK sonucu önbelleklenMEZ: Play hizmetleri sonradan gelince kart görünür', () => {
    mockKopru.deger!.playHizmetleriVarMi.mockReturnValueOnce(false).mockReturnValue(true);
    const k = yukle();
    expect(k.googleYetkisiKullanilabilirMi()).toBe(false);
    expect(k.googleYetkisiKullanilabilirMi()).toBe(true);
    expect(mockKopru.deger!.playHizmetleriVarMi).toHaveBeenCalledTimes(2);
  });

  it('köprü sorgusu fırlatırsa false (önbelleğe alınmaz)', () => {
    mockKopru.deger!.playHizmetleriVarMi.mockImplementationOnce(() => {
      throw new Error('kopru');
    });
    const k = yukle();
    expect(k.googleYetkisiKullanilabilirMi()).toBe(false);
    expect(k.googleYetkisiKullanilabilirMi()).toBe(true);
  });

  it('yetkiAl: sonucu doğrular; köprü reddederse hata sonucuna çevirir', async () => {
    const k = yukle();
    await expect(k.googleYetkiAl(['k'], false)).resolves.toEqual({
      durum: 'izin',
      belirtec: 'B',
      kapsamlar: ['k'],
    });
    expect(mockKopru.deger!.yetkiAl).toHaveBeenCalledWith(['k'], false);
    mockKopru.deger!.yetkiAl.mockRejectedValueOnce(new Error('patladi'));
    await expect(k.googleYetkiAl(['k'], true)).resolves.toEqual({ durum: 'hata', mesaj: 'patladi' });
  });

  it('belirteciTemizle / erisimiGeriAl köprü reddinde false döner', async () => {
    mockKopru.deger!.belirteciTemizle.mockRejectedValueOnce(new Error('x'));
    mockKopru.deger!.erisimiGeriAl.mockRejectedValueOnce(new Error('x'));
    const k = yukle();
    await expect(k.googleBelirteciTemizle('B')).resolves.toBe(false);
    await expect(k.googleErisimiGeriAl(['k'])).resolves.toBe(false);
    await expect(k.googleBelirteciTemizle('B')).resolves.toBe(true);
  });
});
