/**
 * Cihazlar arası eşitleme (issue #288) — Google Drive appDataFolder sağlayıcısı (fetch mock).
 */
const mockRastgele = (n: number) => new Uint8Array(require('crypto').randomBytes(n));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(),
  getRandomBytes: (n: number) => mockRastgele(n),
}));

import {
  DRIVE_KAPSAMI,
  GoogleDriveSaglayicisi,
  YENILEME_BELIRTECI_ANAHTARI,
  sorguParametreleri,
} from '../GoogleDriveSaglayicisi';
import { EsitlemeHatasi } from '../../../core/esitleme/esitlemeTipleri';

const secureStore = require('expo-secure-store');
const ISTEMCI = '123-abc.apps.googleusercontent.com';
const YONLENDIRME = 'com.furkanisikay.namazakisi:/oauth2redirect';

/** Basit yanıt kurucu. */
const yanit = (status: number, govde: unknown = {}) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => govde,
    text: async () => (typeof govde === 'string' ? govde : JSON.stringify(govde)),
  }) as unknown as Response;

const kod = async (p: Promise<unknown>) => {
  try {
    await p;
    return 'basarili';
  } catch (e) {
    return e instanceof EsitlemeHatasi ? e.kod : 'tipsiz';
  }
};

describe('GoogleDriveSaglayicisi', () => {
  let istek: jest.Mock;
  let yetkiOturumu: jest.Mock;
  let saglayici: GoogleDriveSaglayicisi;

  beforeEach(() => {
    secureStore.__sifirla();
    istek = jest.fn();
    yetkiOturumu = jest.fn();
    saglayici = new GoogleDriveSaglayicisi(ISTEMCI, YONLENDIRME, {
      istek: istek as unknown as typeof fetch,
      yetkiOturumu,
      simdi: () => 1_000_000,
    });
  });

  it('istemci kimliği yoksa yapılandırılmamış (ekran göstermez)', async () => {
    const yok = new GoogleDriveSaglayicisi(null, null);
    expect(yok.yapilandirildiMi()).toBe(false);
    expect(await kod(yok.baglan())).toBe('yapilandirilmamis');
    expect(saglayici.yapilandirildiMi()).toBe(true);
  });

  describe('baglan (PKCE)', () => {
    it('drive.appdata kapsamıyla S256 meydan okuması gönderir, kodu değişip yenileme belirtecini GÜVENLİ depoya yazar', async () => {
      yetkiOturumu.mockImplementation(async (url: string) => {
        const p = sorguParametreleri(url);
        expect(p.scope).toBe(DRIVE_KAPSAMI);
        expect(p.code_challenge_method).toBe('S256');
        expect(p.client_id).toBe(ISTEMCI);
        expect(p.redirect_uri).toBe(YONLENDIRME);
        return { type: 'success', url: `${YONLENDIRME}?code=KOD1&state=${p.state}` };
      });
      istek.mockResolvedValueOnce(yanit(200, { access_token: 'ERISIM', expires_in: 3600, refresh_token: 'YENI' }));

      expect(await saglayici.baglan()).toBe(true);
      const govde = String(istek.mock.calls[0][1].body);
      expect(govde).toContain('grant_type=authorization_code');
      expect(govde).toContain('code=KOD1');
      expect(govde).toMatch(/code_verifier=[A-Za-z0-9_-]{43}/);
      expect(govde).not.toContain('client_secret');
      expect(await secureStore.getItemAsync(YENILEME_BELIRTECI_ANAHTARI)).toBe('YENI');
      expect(await saglayici.oturumVarMi()).toBe(true);
    });

    it('state uyuşmazsa (CSRF) belirteç değişimi YAPILMAZ', async () => {
      yetkiOturumu.mockResolvedValue({ type: 'success', url: `${YONLENDIRME}?code=K&state=sahte` });
      expect(await saglayici.baglan()).toBe(false);
      expect(istek).not.toHaveBeenCalled();
    });

    it('kullanıcı iptal ederse false', async () => {
      yetkiOturumu.mockResolvedValue({ type: 'cancel' });
      expect(await saglayici.baglan()).toBe(false);
    });
  });

  describe('dosya işlemleri', () => {
    beforeEach(async () => {
      await secureStore.setItemAsync(YENILEME_BELIRTECI_ANAHTARI, 'YENI');
    });

    /** İlk istek her zaman belirteç yenilemesidir. */
    const belirtec = () => yanit(200, { access_token: 'ERISIM', expires_in: 3600 });

    it('meta: dosya yoksa null, varsa sürüm etiketi; arama yalnız appDataFolder alanında', async () => {
      istek
        .mockResolvedValueOnce(belirtec())
        .mockResolvedValueOnce(yanit(200, { files: [] }))
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '7' }] }));
      expect(await saglayici.meta()).toBeNull();
      expect(await saglayici.meta()).toEqual({ etiket: '7' });
      expect(String(istek.mock.calls[1][0])).toContain('spaces=appDataFolder');
      expect(istek.mock.calls[1][1].headers.Authorization).toBe('Bearer ERISIM');
      // Erişim belirteci bellekte tekrar kullanılır (ikinci yenileme yok).
      expect(istek).toHaveBeenCalledTimes(3);
    });

    it('yaz: dosya yoksa appDataFolder içinde multipart OLUŞTURUR, sonra PATCH ile günceller', async () => {
      istek
        .mockResolvedValueOnce(belirtec())
        .mockResolvedValueOnce(yanit(200, { files: [] }))
        .mockResolvedValueOnce(yanit(200, { id: 'D1', version: '1' }))
        .mockResolvedValueOnce(yanit(200, { id: 'D1', version: '2' }));
      expect(await saglayici.yaz('ZARF1')).toEqual({ etiket: '1' });
      const olustur = istek.mock.calls[2];
      expect(olustur[1].method).toBe('POST');
      expect(String(olustur[1].body)).toContain('"parents":["appDataFolder"]');
      expect(String(olustur[1].body)).toContain('ZARF1');
      expect(await saglayici.yaz('ZARF2')).toEqual({ etiket: '2' });
      const guncelle = istek.mock.calls[3];
      expect(guncelle[1].method).toBe('PATCH');
      expect(String(guncelle[0])).toContain('/D1?uploadType=media');
      expect(guncelle[1].body).toBe('ZARF2');
    });

    it('oku: içeriği ve etiketi döndürür', async () => {
      istek
        .mockResolvedValueOnce(belirtec())
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '4' }] }))
        .mockResolvedValueOnce(yanit(200, 'ZARF'));
      expect(await saglayici.oku()).toEqual({ icerik: 'ZARF', etiket: '4' });
      expect(String(istek.mock.calls[2][0])).toContain('/D1?alt=media');
    });

    it('401: belirteci BİR KEZ yenileyip yeniden dener', async () => {
      istek
        .mockResolvedValueOnce(belirtec())
        .mockResolvedValueOnce(yanit(401))
        .mockResolvedValueOnce(yanit(200, { access_token: 'TAZE', expires_in: 3600 }))
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '3' }] }));
      expect(await saglayici.meta()).toEqual({ etiket: '3' });
      expect(istek.mock.calls[3][1].headers.Authorization).toBe('Bearer TAZE');
    });

    it('yenileme reddedilirse (invalid_grant) yetkiYok + yenileme belirteci silinir', async () => {
      istek.mockResolvedValueOnce(yanit(400, { error: 'invalid_grant' }));
      expect(await kod(saglayici.meta())).toBe('yetkiYok');
      expect(await saglayici.oturumVarMi()).toBe(false);
    });

    it('ağ hatası / 5xx / 429 → agYok (geçici, sessiz)', async () => {
      istek.mockRejectedValueOnce(new TypeError('Network request failed'));
      expect(await kod(saglayici.meta())).toBe('agYok');
      istek.mockResolvedValueOnce(belirtec()).mockResolvedValueOnce(yanit(503));
      expect(await kod(saglayici.meta())).toBe('agYok');
      istek.mockResolvedValueOnce(yanit(429));
      expect(await kod(saglayici.meta())).toBe('agYok');
    });

    it('403 kota → boyutAsimi, hız sınırı → agYok', async () => {
      istek.mockResolvedValueOnce(belirtec()).mockResolvedValueOnce(yanit(403, 'storageQuotaExceeded'));
      expect(await kod(saglayici.meta())).toBe('boyutAsimi');
      istek.mockResolvedValueOnce(yanit(403, 'userRateLimitExceeded'));
      expect(await kod(saglayici.meta())).toBe('agYok');
    });

    it('sil: dosyayı siler; baglantiyiKes belirteci iptal edip yerelden siler', async () => {
      istek
        .mockResolvedValueOnce(belirtec())
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '3' }] }))
        .mockResolvedValueOnce(yanit(204))
        .mockResolvedValueOnce(yanit(200));
      await saglayici.sil();
      expect(istek.mock.calls[2][1].method).toBe('DELETE');
      await saglayici.baglantiyiKes();
      expect(String(istek.mock.calls[3][0])).toContain('revoke');
      expect(await saglayici.oturumVarMi()).toBe(false);
    });
  });

  it('sorguParametreleri: kodlanmış değerleri çözer, parçayı (#) yok sayar', () => {
    expect(sorguParametreleri('x:/y?code=a%2Fb&state=s+t#z=1')).toEqual({ code: 'a/b', state: 's t' });
    expect(sorguParametreleri('x:/y')).toEqual({});
  });
});
