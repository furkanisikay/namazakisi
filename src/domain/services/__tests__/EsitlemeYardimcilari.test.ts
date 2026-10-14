/**
 * Cihazlar arası eşitleme (issue #288) — yapılandırma, sağlayıcı kaydı, iCloud
 * sağlayıcısı ve anahtar deposu.
 */
const mockRastgele = (n: number) => new Uint8Array(require('crypto').randomBytes(n));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(),
  getRandomBytes: (n: number) => mockRastgele(n),
}));

const mockEkstra: { deger: Record<string, unknown> } = { deger: {} };
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return { extra: mockEkstra.deger, android: { package: 'com.furkanisikay.namazakisi' } };
    },
  },
}));

import naclUtil from 'tweetnacl-util';
import {
  googleDriveIstemciKimligi,
  googleYonlendirmeAdresi,
  icloudEsitlemeEtkinMi,
} from '../esitlemeYapilandirmasi';
import { kullanilabilirSaglayicilar, saglayicilariAyarla, saglayiciAl } from '../esitlemeSaglayicilari';
import { ICLOUD_BOYUT_SINIRI, IcloudSaglayicisi } from '../IcloudSaglayicisi';
import { EsitlemeAnahtarDeposu } from '../EsitlemeAnahtarDeposu';
import { EsitlemeHatasi } from '../../../core/esitleme/esitlemeTipleri';
import { KdfParametreleri } from '../../../core/esitleme/anahtarTuretme';

const icloud = require('../../../../modules/expo-icloud-esitleme/src');
const secureStore = require('expo-secure-store');
const ISTEMCI = '123-abc.apps.googleusercontent.com';

describe('esitlemeYapilandirmasi', () => {
  afterEach(() => {
    mockEkstra.deger = {};
  });

  it('istemci kimliği yoksa / geçersizse null (sağlayıcı GÖRÜNMEZ)', () => {
    expect(googleDriveIstemciKimligi('android')).toBeNull();
    mockEkstra.deger = { googleDriveIstemciKimligi: 'gecersiz' };
    expect(googleDriveIstemciKimligi('android')).toBeNull();
  });

  it('dize yalnız Android içindir; nesne platform başına', () => {
    mockEkstra.deger = { googleDriveIstemciKimligi: ISTEMCI };
    expect(googleDriveIstemciKimligi('android')).toBe(ISTEMCI);
    expect(googleDriveIstemciKimligi('ios')).toBeNull();
    mockEkstra.deger = { googleDriveIstemciKimligi: { ios: ISTEMCI } };
    expect(googleDriveIstemciKimligi('android')).toBeNull();
    expect(googleDriveIstemciKimligi('ios')).toBe(ISTEMCI);
  });

  it('yönlendirme: Android paket şeması, iOS ters istemci kimliği', () => {
    expect(googleYonlendirmeAdresi(ISTEMCI, 'android')).toBe('com.furkanisikay.namazakisi:/oauth2redirect');
    expect(googleYonlendirmeAdresi(ISTEMCI, 'ios')).toBe('com.googleusercontent.apps.123-abc:/oauth2redirect');
  });

  it('iCloud yalnız iOS + bayrakla', () => {
    expect(icloudEsitlemeEtkinMi('ios')).toBe(false);
    mockEkstra.deger = { icloudEsitlemeEtkin: true };
    expect(icloudEsitlemeEtkinMi('ios')).toBe(true);
    expect(icloudEsitlemeEtkinMi('android')).toBe(false);
  });
});

describe('esitlemeSaglayicilari', () => {
  afterEach(() => {
    saglayicilariAyarla(null);
    mockEkstra.deger = {};
  });

  it('hiçbir şey yapılandırılmamışken liste BOŞ (ekran eşitlemeyi göstermez)', () => {
    saglayicilariAyarla(null);
    expect(kullanilabilirSaglayicilar()).toEqual([]);
    expect(saglayiciAl(null)).toBeNull();
    expect(saglayiciAl('googleDrive')?.yapilandirildiMi()).toBe(false);
  });
});

describe('IcloudSaglayicisi', () => {
  beforeEach(() => {
    icloud.icloudModuluVarMi.mockReturnValue(true);
    icloud.icloudHesapVarMi.mockResolvedValue(true);
    icloud.icloudOku.mockReset();
    icloud.icloudYaz.mockReset().mockResolvedValue(true);
  });
  afterAll(() => {
    icloud.icloudModuluVarMi.mockReturnValue(false);
    icloud.icloudHesapVarMi.mockResolvedValue(false);
  });

  it('bayrak kapalıyken ya da köprü yokken yapılandırılmamış', async () => {
    expect(new IcloudSaglayicisi(false).yapilandirildiMi()).toBe(false);
    icloud.icloudModuluVarMi.mockReturnValue(false);
    const s = new IcloudSaglayicisi(true);
    expect(s.yapilandirildiMi()).toBe(false);
    await expect(s.meta()).rejects.toMatchObject({ kod: 'yapilandirilmamis' });
  });

  it('yaz: zarf + yeni etiket; meta/oku etiketi döndürür', async () => {
    const s = new IcloudSaglayicisi(true);
    const { etiket } = await s.yaz('ZARF');
    expect(icloud.icloudYaz).toHaveBeenCalledWith('namaz_akisi_esitleme_zarf', 'ZARF');
    expect(icloud.icloudYaz).toHaveBeenCalledWith('namaz_akisi_esitleme_etiket', etiket);
    icloud.icloudOku.mockImplementation(async (a: string) => (a.endsWith('zarf') ? 'ZARF' : etiket));
    expect(await s.meta()).toEqual({ etiket });
    expect(await s.oku()).toEqual({ icerik: 'ZARF', etiket });
  });

  it('kayıt yoksa null; 1 MB sınırı aşılırsa boyutAsimi', async () => {
    const s = new IcloudSaglayicisi(true);
    icloud.icloudOku.mockResolvedValue(null);
    expect(await s.meta()).toBeNull();
    await expect(s.yaz('x'.repeat(ICLOUD_BOYUT_SINIRI + 1))).rejects.toBeInstanceOf(EsitlemeHatasi);
    expect(icloud.icloudYaz).not.toHaveBeenCalled();
  });

  it('baglan iCloud hesabının açık olduğunu doğrular', async () => {
    const s = new IcloudSaglayicisi(true);
    expect(await s.baglan()).toBe(true);
    icloud.icloudHesapVarMi.mockResolvedValue(false);
    expect(await s.baglan()).toBe(false);
  });
});

describe('EsitlemeAnahtarDeposu', () => {
  const kdf = (dolgu: number): KdfParametreleri => ({
    ad: 'scrypt',
    N: 2 ** 10,
    r: 8,
    p: 1,
    tuz: naclUtil.encodeBase64(new Uint8Array(16).fill(dolgu)),
  });

  beforeEach(() => secureStore.__sifirla());

  it('parola yoksa parolaYok', async () => {
    expect(await EsitlemeAnahtarDeposu.anahtarAl(null, true)).toEqual({ tur: 'parolaYok' });
    expect(await EsitlemeAnahtarDeposu.parolaVarMi()).toBe(false);
  });

  it('önbellek eşleşirse türetmeden verir; tuz değişince arka planda ERTELER, ön planda türetir', async () => {
    const anahtar = new Uint8Array(32).fill(1);
    await EsitlemeAnahtarDeposu.kaydet('uzun bir parola', kdf(1), anahtar);
    const hazir = await EsitlemeAnahtarDeposu.anahtarAl(kdf(1), false);
    expect(hazir.tur).toBe('hazir');
    expect(await EsitlemeAnahtarDeposu.anahtarAl(kdf(2), false)).toEqual({ tur: 'ertelendi' });
    const turetilmis = await EsitlemeAnahtarDeposu.anahtarAl(kdf(2), true);
    expect(turetilmis.tur).toBe('hazir');
    // Yeni tuzla önbellek tazelendi.
    expect((await EsitlemeAnahtarDeposu.anahtarAl(kdf(2), false)).tur).toBe('hazir');
  });

  it('temizle her şeyi siler', async () => {
    await EsitlemeAnahtarDeposu.kaydet('uzun bir parola', kdf(1), new Uint8Array(32));
    await EsitlemeAnahtarDeposu.temizle();
    expect(await EsitlemeAnahtarDeposu.parolaVarMi()).toBe(false);
    expect(await EsitlemeAnahtarDeposu.anahtarAl(null, true)).toEqual({ tur: 'parolaYok' });
  });

  it('bozuk önbellek kaydı yok sayılır', async () => {
    await secureStore.setItemAsync('namaz_esitleme_anahtar', '{bozuk');
    expect(await EsitlemeAnahtarDeposu.anahtarAl(null, true)).toEqual({ tur: 'parolaYok' });
  });
});
