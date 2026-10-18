/**
 * Cihazlar arası eşitleme (issue #288) — Google Drive appDataFolder sağlayıcısı.
 * Yetki: yerleşik Authorization API köprüsü (enjekte edilen sahte kaynak) + fetch mock.
 */
const mockRastgele = (n: number) => new Uint8Array(require('crypto').randomBytes(n));
jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(),
  getRandomBytes: (n: number) => mockRastgele(n),
}));

import {
  BAGLANTI_ANAHTARI,
  DRIVE_KAPSAMI,
  DriveYetkiKaynagi,
  ESKI_YENILEME_BELIRTECI_ANAHTARI,
  GoogleDriveSaglayicisi,
} from '../GoogleDriveSaglayicisi';
import { EsitlemeHatasi } from '../../../core/esitleme/esitlemeTipleri';
import { yetkiSonucunuCoz } from '../../../../modules/expo-google-yetki/src/yetkiSonucu';

const secureStore = require('expo-secure-store');

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

const izin = (belirtec: string, kapsamlar: string[] = [DRIVE_KAPSAMI]) =>
  ({ durum: 'izin', belirtec, kapsamlar }) as const;

describe('GoogleDriveSaglayicisi', () => {
  let istek: jest.Mock;
  let yetki: {
    kullanilabilirMi: jest.Mock;
    yetkiAl: jest.Mock;
    belirteciTemizle: jest.Mock;
    erisimiGeriAl: jest.Mock;
  };
  let simdi: number;
  let saglayici: GoogleDriveSaglayicisi;

  beforeEach(() => {
    secureStore.__sifirla();
    istek = jest.fn();
    simdi = 1_000_000;
    yetki = {
      kullanilabilirMi: jest.fn().mockReturnValue(true),
      yetkiAl: jest.fn().mockResolvedValue(izin('ERISIM')),
      belirteciTemizle: jest.fn().mockResolvedValue(true),
      erisimiGeriAl: jest.fn().mockResolvedValue(true),
    };
    saglayici = new GoogleDriveSaglayicisi({
      yetki: yetki as unknown as DriveYetkiKaynagi,
      istek: istek as unknown as typeof fetch,
      simdi: () => simdi,
    });
  });

  it('köprü / Play hizmetleri yoksa yapılandırılmamış (ekran göstermez)', async () => {
    yetki.kullanilabilirMi.mockReturnValue(false);
    expect(saglayici.yapilandirildiMi()).toBe(false);
    expect(await kod(saglayici.baglan())).toBe('yapilandirilmamis');
    yetki.kullanilabilirMi.mockReturnValue(true);
    expect(saglayici.yapilandirildiMi()).toBe(true);
  });

  it('varsayılan kaynak (jest: köprü yok) → yapılandırılmamış; istemci kimliği GEREKMEZ', () => {
    expect(new GoogleDriveSaglayicisi().yapilandirildiMi()).toBe(false);
  });

  describe('baglan (Authorization API)', () => {
    it('izin verildi: etkileşimli ister, bağlantı işaretini yazar, eski yenileme belirtecini siler', async () => {
      await secureStore.setItemAsync(ESKI_YENILEME_BELIRTECI_ANAHTARI, 'ESKI');
      expect(await saglayici.baglan()).toBe(true);
      expect(yetki.yetkiAl).toHaveBeenCalledWith(true);
      expect(await saglayici.oturumVarMi()).toBe(true);
      expect(await secureStore.getItemAsync(BAGLANTI_ANAHTARI)).toBe('1');
      expect(await secureStore.getItemAsync(ESKI_YENILEME_BELIRTECI_ANAHTARI)).toBeNull();
      // Belirteç bellekte: ilk Drive isteği yeniden yetki istemez.
      istek.mockResolvedValueOnce(yanit(200, { files: [] }));
      await saglayici.meta();
      expect(yetki.yetkiAl).toHaveBeenCalledTimes(1);
      expect(istek.mock.calls[0][1].headers.Authorization).toBe('Bearer ERISIM');
    });

    it('kullanıcı reddetti / vazgeçti → false, işaret YOK', async () => {
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'iptal' });
      expect(await saglayici.baglan()).toBe(false);
      expect(await saglayici.oturumVarMi()).toBe(false);
    });

    it('ayrıntılı onayda Drive kapsamının işareti kaldırıldıysa bağlanmış SAYILMAZ', async () => {
      yetki.yetkiAl.mockResolvedValueOnce(izin('E', ['openid']));
      expect(await saglayici.baglan()).toBe(false);
      expect(await saglayici.oturumVarMi()).toBe(false);
    });

    it('onay ekranı açılamadı (çözüm gerekli) / meşgul → false', async () => {
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'cozumGerekli' });
      expect(await saglayici.baglan()).toBe(false);
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'mesgul' });
      expect(await saglayici.baglan()).toBe(false);
    });

    it('ağ yok → agYok; diğer hata (ör. SHA-1 eşleşmedi) → bilinmiyor', async () => {
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'agYok' });
      expect(await kod(saglayici.baglan())).toBe('agYok');
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'hata', kod: 10 });
      expect(await kod(saglayici.baglan())).toBe('bilinmiyor');
      expect(await saglayici.oturumVarMi()).toBe(false);
    });
  });

  describe('dosya işlemleri (bağlı oturum)', () => {
    beforeEach(async () => {
      await secureStore.setItemAsync(BAGLANTI_ANAHTARI, '1');
    });

    it('bağlantı işareti yoksa ağa çıkmadan yetkiYok', async () => {
      secureStore.__sifirla();
      expect(await kod(saglayici.meta())).toBe('yetkiYok');
      expect(yetki.yetkiAl).not.toHaveBeenCalled();
      expect(istek).not.toHaveBeenCalled();
    });

    it('belirteç SESSİZ istenir (onay ekranı açılmaz); meta: dosya yoksa null, varsa sürüm etiketi', async () => {
      istek
        .mockResolvedValueOnce(yanit(200, { files: [] }))
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '7' }] }));
      expect(await saglayici.meta()).toBeNull();
      expect(await saglayici.meta()).toEqual({ etiket: '7' });
      expect(yetki.yetkiAl).toHaveBeenCalledTimes(1);
      expect(yetki.yetkiAl).toHaveBeenCalledWith(false);
      expect(String(istek.mock.calls[0][0])).toContain('spaces=appDataFolder');
      expect(istek.mock.calls[0][1].headers.Authorization).toBe('Bearer ERISIM');
    });

    it('bellek ömrü dolunca belirteç Play hizmetlerinden yeniden (sessizce) istenir', async () => {
      istek.mockResolvedValue(yanit(200, { files: [] }));
      await saglayici.meta();
      simdi += 46 * 60_000;
      yetki.yetkiAl.mockResolvedValueOnce(izin('TAZE'));
      await saglayici.meta();
      expect(yetki.yetkiAl).toHaveBeenCalledTimes(2);
      expect(istek.mock.calls[1][1].headers.Authorization).toBe('Bearer TAZE');
    });

    it('yaz: dosya yoksa appDataFolder içinde multipart OLUŞTURUR, sonra PATCH ile günceller', async () => {
      istek
        .mockResolvedValueOnce(yanit(200, { files: [] }))
        .mockResolvedValueOnce(yanit(200, { id: 'D1', version: '1' }))
        .mockResolvedValueOnce(yanit(200, { id: 'D1', version: '2' }));
      expect(await saglayici.yaz('ZARF1')).toEqual({ etiket: '1' });
      const olustur = istek.mock.calls[1];
      expect(olustur[1].method).toBe('POST');
      expect(String(olustur[1].body)).toContain('"parents":["appDataFolder"]');
      expect(String(olustur[1].body)).toContain('ZARF1');
      expect(await saglayici.yaz('ZARF2')).toEqual({ etiket: '2' });
      const guncelle = istek.mock.calls[2];
      expect(guncelle[1].method).toBe('PATCH');
      expect(String(guncelle[0])).toContain('/D1?uploadType=media');
      expect(guncelle[1].body).toBe('ZARF2');
    });

    it('oku: içeriği ve etiketi döndürür', async () => {
      istek
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '4' }] }))
        .mockResolvedValueOnce(yanit(200, 'ZARF'));
      expect(await saglayici.oku()).toEqual({ icerik: 'ZARF', etiket: '4' });
      expect(String(istek.mock.calls[1][0])).toContain('/D1?alt=media');
    });

    it('401: bayat belirteci Play hizmetlerinden SİLER, sessizce yenisini alıp BİR KEZ yeniden dener', async () => {
      yetki.yetkiAl.mockResolvedValueOnce(izin('BAYAT')).mockResolvedValueOnce(izin('TAZE'));
      istek
        .mockResolvedValueOnce(yanit(401))
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '3' }] }));
      expect(await saglayici.meta()).toEqual({ etiket: '3' });
      expect(yetki.belirteciTemizle).toHaveBeenCalledWith('BAYAT');
      // Temizlik yeniden istemeden ÖNCE: yoksa authorize() aynı bayat belirteci döndürürdü.
      expect(yetki.belirteciTemizle.mock.invocationCallOrder[0]).toBeLessThan(
        yetki.yetkiAl.mock.invocationCallOrder[1]
      );
      expect(yetki.yetkiAl).toHaveBeenLastCalledWith(false);
      expect(istek.mock.calls[1][1].headers.Authorization).toBe('Bearer TAZE');
    });

    it('ikinci 401 → yetkiYok', async () => {
      istek.mockResolvedValue(yanit(401));
      expect(await kod(saglayici.meta())).toBe('yetkiYok');
    });

    it('izin Google hesabından geri alındı (sessiz yetki çözüm istiyor) → yetkiYok + işaret silinir', async () => {
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'cozumGerekli' });
      expect(await kod(saglayici.meta())).toBe('yetkiYok');
      expect(await saglayici.oturumVarMi()).toBe(false);
      expect(istek).not.toHaveBeenCalled();
    });

    it('sessiz yetkide geçici durumlar işareti SİLMEZ (ağ yok → agYok, iptal/hata → bilinmiyor)', async () => {
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'agYok' });
      expect(await kod(saglayici.meta())).toBe('agYok');
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'iptal' });
      expect(await kod(saglayici.meta())).toBe('bilinmiyor');
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'hata', kod: 8 });
      expect(await kod(saglayici.meta())).toBe('bilinmiyor');
      expect(await saglayici.oturumVarMi()).toBe(true);
    });

    it('sessiz yetki SIGN_IN_REQUIRED (4) → yetkiYok + işaret silinir ("Yeniden bağlanın")', async () => {
      yetki.yetkiAl.mockResolvedValueOnce({ durum: 'hata', kod: 4 });
      expect(await kod(saglayici.meta())).toBe('yetkiYok');
      expect(await saglayici.oturumVarMi()).toBe(false);
    });

    it('kalıcı proje 403 (accessNotConfigured) yetkiYok DEĞİL bilinmiyor: yeniden bağlanma döngüsü olmaz', async () => {
      istek.mockResolvedValueOnce(
        yanit(403, '{"error":{"errors":[{"reason":"accessNotConfigured"}]}}')
      );
      expect(await kod(saglayici.meta())).toBe('bilinmiyor');
      expect(await saglayici.oturumVarMi()).toBe(true);
    });

    it('kapsam eksik 403 → yetkiYok', async () => {
      istek.mockResolvedValueOnce(yanit(403, '{"error":{"errors":[{"reason":"insufficientPermissions"}]}}'));
      expect(await kod(saglayici.meta())).toBe('yetkiYok');
    });

    it('ağ hatası / 5xx / 429 → agYok (geçici, sessiz)', async () => {
      istek.mockRejectedValueOnce(new TypeError('Network request failed'));
      expect(await kod(saglayici.meta())).toBe('agYok');
      istek.mockResolvedValueOnce(yanit(503));
      expect(await kod(saglayici.meta())).toBe('agYok');
      istek.mockResolvedValueOnce(yanit(429));
      expect(await kod(saglayici.meta())).toBe('agYok');
    });

    it('403 kota → boyutAsimi, hız sınırı → agYok', async () => {
      istek.mockResolvedValueOnce(yanit(403, 'storageQuotaExceeded'));
      expect(await kod(saglayici.meta())).toBe('boyutAsimi');
      istek.mockResolvedValueOnce(yanit(403, 'userRateLimitExceeded'));
      expect(await kod(saglayici.meta())).toBe('agYok');
    });

    it('sil: dosyayı siler', async () => {
      istek
        .mockResolvedValueOnce(yanit(200, { files: [{ id: 'D1', version: '3' }] }))
        .mockResolvedValueOnce(yanit(204));
      await saglayici.sil();
      expect(istek.mock.calls[1][1].method).toBe('DELETE');
    });
  });

  describe('baglantiyiKes', () => {
    beforeEach(async () => {
      await secureStore.setItemAsync(BAGLANTI_ANAHTARI, '1');
    });

    /**
     * Gerçekçi sahte: izin geri alındıktan SONRA sessiz yetki artık belirteç vermez
     * (`cozumGerekli`). Belirteç geri almadan önce alınmazsa temizlenecek belirteç kalmaz.
     */
    const geriAlinincaCozumGerekli = (geriAlmaSonucu: boolean) => {
      let geriAlindi = false;
      yetki.erisimiGeriAl.mockImplementation(async () => {
        geriAlindi = true;
        return geriAlmaSonucu;
      });
      yetki.yetkiAl.mockImplementation(async () =>
        geriAlindi ? { durum: 'cozumGerekli' } : izin('SESSIZ')
      );
    };

    it('bellek boşken belirteci geri almadan ÖNCE sessizce alır; geri alır, belirteci temizler, işareti siler', async () => {
      geriAlinincaCozumGerekli(true);
      await saglayici.baglantiyiKes();
      expect(yetki.yetkiAl.mock.invocationCallOrder[0]).toBeLessThan(
        yetki.erisimiGeriAl.mock.invocationCallOrder[0]
      );
      expect(yetki.belirteciTemizle).toHaveBeenCalledWith('SESSIZ');
      expect(istek).not.toHaveBeenCalled();
      expect(await saglayici.oturumVarMi()).toBe(false);
    });

    it('native geri alma başaramazsa ÖNCEDEN alınan belirteç HTTP ile iptal edilir', async () => {
      geriAlinincaCozumGerekli(false);
      istek.mockResolvedValueOnce(yanit(200));
      await saglayici.baglantiyiKes();
      expect(String(istek.mock.calls[0][0])).toContain('revoke');
      expect(String(istek.mock.calls[0][1].body)).toBe('token=SESSIZ');
      expect(yetki.belirteciTemizle).toHaveBeenCalledWith('SESSIZ');
      expect(await saglayici.oturumVarMi()).toBe(false);
    });

    it('bellekte belirteç varsa sessiz yetki hiç istenmez', async () => {
      istek.mockResolvedValueOnce(yanit(200, { files: [] }));
      await saglayici.meta(); // belirteç belleğe alınır
      yetki.yetkiAl.mockClear();
      await saglayici.baglantiyiKes();
      expect(yetki.yetkiAl).not.toHaveBeenCalled();
      expect(yetki.belirteciTemizle).toHaveBeenCalledWith('ERISIM');
    });

    it('ağ yokken de yerel işaret silinir', async () => {
      yetki.erisimiGeriAl.mockResolvedValueOnce(false);
      istek.mockRejectedValueOnce(new TypeError('Network request failed'));
      await saglayici.baglantiyiKes();
      expect(await saglayici.oturumVarMi()).toBe(false);
    });
  });
});

describe('yetkiSonucunuCoz (köprü sonucu doğrulaması)', () => {
  it('izin: belirteç + yalnız dize kapsamlar', () => {
    expect(yetkiSonucunuCoz({ durum: 'izin', belirtec: 'B', kapsamlar: [DRIVE_KAPSAMI, 3] })).toEqual({
      durum: 'izin',
      belirtec: 'B',
      kapsamlar: [DRIVE_KAPSAMI],
    });
  });

  it('belirteçsiz izin / tanınmayan şekil → hata (fırlatmaz)', () => {
    expect(yetkiSonucunuCoz({ durum: 'izin' }).durum).toBe('hata');
    expect(yetkiSonucunuCoz(null).durum).toBe('hata');
    expect(yetkiSonucunuCoz({ durum: 'garip', kod: 10 })).toEqual({ durum: 'hata', kod: 10 });
  });

  it('çözüm gerekli / iptal / meşgul / ağ yok olduğu gibi geçer', () => {
    for (const durum of ['cozumGerekli', 'iptal', 'mesgul', 'agYok']) {
      expect(yetkiSonucunuCoz({ durum })).toEqual({ durum });
    }
  });
});
