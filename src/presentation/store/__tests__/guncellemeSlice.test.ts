/**
 * guncellemeSlice Testleri
 *
 * Redux guncelleme state yonetimi icin birim testleri:
 * - Baslangic durumu
 * - Senkron aksiyonlar
 * - Async thunk'lar (guncellemeKontrolEt, guncellemeErtele)
 * - State gecisleri
 */

import { configureStore } from '@reduxjs/toolkit';
import guncellemeReducer, {
  guncellemeKontrolEt,
  guncellemeErtele,
  bildirimiKapat,
  bildirimiSifirla,
} from '../guncellemeSlice';
import { GuncellemeServisi } from '../../../domain/services/GuncellemeServisi';

// ==================== MOCKLAR ====================

// GuncellemeServisi mock
jest.mock('../../../domain/services/GuncellemeServisi', () => {
  const mockGuncellemeKontrolEt = jest.fn();
  const mockGuncellemeErtele = jest.fn();

  return {
    GuncellemeServisi: {
      getInstance: jest.fn(() => ({
        guncellemeKontrolEt: mockGuncellemeKontrolEt,
        guncellemeErtele: mockGuncellemeErtele,
      })),
    },
    // Test icin mock fonksiyonlara erisim
    __mockKontrolEt: mockGuncellemeKontrolEt,
    __mockErtele: mockGuncellemeErtele,
  };
});

// Mock fonksiyonlara erisim
const { __mockKontrolEt, __mockErtele } = jest.requireMock(
  '../../../domain/services/GuncellemeServisi'
) as any;

// ==================== YARDIMCI ====================

function storeOlustur() {
  return configureStore({
    reducer: {
      guncelleme: guncellemeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

// ==================== TESTLER ====================

describe('guncellemeSlice', () => {
  beforeEach(() => {
    __mockKontrolEt.mockReset();
    __mockErtele.mockReset();
  });

  describe('baslangic durumu', () => {
    it('dogru baslangic degerlerine sahip', () => {
      const store = storeOlustur();
      const state = store.getState().guncelleme;

      expect(state.kontrolEdiliyor).toBe(false);
      expect(state.guncellemeMevcut).toBe(false);
      expect(state.bilgi).toBeNull();
      expect(state.bildirimiKapatti).toBe(false);
      expect(state.hata).toBeNull();
    });
  });

  describe('senkron aksiyonlar', () => {
    it('bildirimiKapat durumu dogru gunceller', () => {
      const store = storeOlustur();

      store.dispatch(bildirimiKapat());

      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
    });

    it('bildirimiSifirla durumu dogru gunceller', () => {
      const store = storeOlustur();

      store.dispatch(bildirimiKapat());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

      store.dispatch(bildirimiSifirla());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(false);
    });
  });

  describe('guncellemeKontrolEt thunk', () => {
    it('pending durumunda kontrolEdiliyor true olur', () => {
      __mockKontrolEt.mockReturnValue(new Promise(() => {})); // Beklemede kal

      const store = storeOlustur();
      store.dispatch(guncellemeKontrolEt(false));

      expect(store.getState().guncelleme.kontrolEdiliyor).toBe(true);
      expect(store.getState().guncelleme.hata).toBeNull();
    });

    it('fulfilled - guncelleme mevcut oldugunda state dogru guncellenir', async () => {
      const guncellemeBilgisi = {
        yeniVersiyon: '99.0.0',
        mevcutVersiyon: '0.3.0',
        degisiklikNotlari: 'Yeni ozellikler',
        indirmeBaglantisi: 'https://example.com/app.apk',
        yayinTarihi: '2026-02-14',
        kaynak: 'github' as const,
        zorunluMu: false,
      };

      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        bilgi: guncellemeBilgisi,
      });

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));

      const state = store.getState().guncelleme;
      expect(state.kontrolEdiliyor).toBe(false);
      expect(state.guncellemeMevcut).toBe(true);
      expect(state.bilgi).toEqual(guncellemeBilgisi);
    });

    it('fulfilled - guncelleme yokken state dogru guncellenir', async () => {
      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: false,
        bilgi: null,
      });

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));

      const state = store.getState().guncelleme;
      expect(state.kontrolEdiliyor).toBe(false);
      expect(state.guncellemeMevcut).toBe(false);
      expect(state.bilgi).toBeNull();
    });

    it('rejected durumunda hata mesaji state e tasinir', async () => {
      __mockKontrolEt.mockRejectedValue(new Error('Test hatasi'));

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));

      const state = store.getState().guncelleme;
      expect(state.kontrolEdiliyor).toBe(false);
      // Reducer action.error.message'i AYNEN state'e tasimali (sadece "tanimsiz degil" yetmez)
      expect(state.hata).toBe('Test hatasi');
    });

    it('rejected - mesajsiz hatada varsayilan hata metni kullanilir', async () => {
      // Bos obje -> RTK serilestirmesinde action.error.message undefined olur,
      // boylece reducer'daki `|| 'Guncelleme kontrol edilemedi'` fallback dali tetiklenir
      __mockKontrolEt.mockRejectedValue({});

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));

      const state = store.getState().guncelleme;
      expect(state.kontrolEdiliyor).toBe(false);
      expect(state.hata).toBe('Guncelleme kontrol edilemedi');
    });

    it('zorla parametresi servise iletilir', async () => {
      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: false,
        bilgi: null,
      });

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(true));

      expect(__mockKontrolEt).toHaveBeenCalledWith(true);
    });
  });

  describe('guncellemeErtele thunk', () => {
    it('fulfilled durumunda bildirimiKapatti true olur', async () => {
      __mockErtele.mockResolvedValue(undefined);

      const store = storeOlustur();
      await store.dispatch(guncellemeErtele('99.0.0'));

      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
    });

    it('versiyon servise iletilir', async () => {
      __mockErtele.mockResolvedValue(undefined);

      const store = storeOlustur();
      await store.dispatch(guncellemeErtele('99.0.0'));

      expect(__mockErtele).toHaveBeenCalledWith('99.0.0');
    });
  });

  describe('state gecisleri', () => {
    it('tam guncelleme akisi dogru calisir', async () => {
      const bilgi = {
        yeniVersiyon: '99.0.0',
        mevcutVersiyon: '0.3.0',
        degisiklikNotlari: 'Yeni',
        indirmeBaglantisi: 'https://example.com',
        yayinTarihi: '2026-01-01',
        kaynak: 'github' as const,
        zorunluMu: false,
      };

      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        bilgi,
      });
      __mockErtele.mockResolvedValue(undefined);

      const store = storeOlustur();

      // 1. Kontrol et
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.guncellemeMevcut).toBe(true);
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(false);

      // 2. Ertele
      await store.dispatch(guncellemeErtele('99.0.0'));
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

      // 3. Sifirla
      store.dispatch(bildirimiSifirla());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(false);
    });

    it('yeni versiyon geldiginde bildirim durumu sifirlanir', async () => {
      // Ilk versiyon
      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github' as const,
          zorunluMu: false,
        },
      });

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(false);

      // Kullanici bildirimi kapatti
      store.dispatch(bildirimiKapat());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

      // Yeni versiyon geldi - bildirim tekrar gosterilmeli
      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '2.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github' as const,
          zorunluMu: false,
        },
      });

      await store.dispatch(guncellemeKontrolEt(false));
      // BUG-1 fix: bildirimiKapatti SIFIRLANMALI cunku yeni versiyon geldi
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(false);
      expect(store.getState().guncelleme.bilgi?.yeniVersiyon).toBe('2.0.0');
    });

    it('ayni versiyon tekrar geldiginde bildirim durumu korunur', async () => {
      __mockKontrolEt.mockResolvedValue({
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github' as const,
          zorunluMu: false,
        },
      });

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));

      // Kullanici bildirimi kapatti
      store.dispatch(bildirimiKapat());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

      // Ayni versiyon tekrar kontrol edildi
      await store.dispatch(guncellemeKontrolEt(false));
      // Ayni versiyon, bildirim kapali kalmali
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
    });
  });

  // ==================== EK KAPSAM (denetim gapleri) ====================

  describe('hata temizleme gecisi', () => {
    it('hatali kontrol sonrasi yeni kontrol baslayinca eski hata temizlenir', async () => {
      const store = storeOlustur();

      // 1. Ilk kontrol HATA ile sonuclanir -> state.hata dolar
      __mockKontrolEt.mockRejectedValueOnce(new Error('Ag hatasi'));
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.hata).toBe('Ag hatasi');

      // 2. Kullanici tekrar dener; pending'e gectigi an hata SIFIRLANMALI.
      //    Cozumlenmemis bir promise vererek thunk'i pending'de tutuyoruz;
      //    boylece sadece pending reducer'inin etkisini izole olarak gozluyoruz.
      __mockKontrolEt.mockReturnValueOnce(new Promise(() => {}));
      store.dispatch(guncellemeKontrolEt(false));

      expect(store.getState().guncelleme.kontrolEdiliyor).toBe(true);
      // pending reducer state.hata = null yapmali (uretimdeki temizleme dali)
      expect(store.getState().guncelleme.hata).toBeNull();
    });
  });

  describe('guncelleme durumu temizleme gecisleri', () => {
    it('guncellemeMevcut true->false oldugunda bilgi de temizlenir', async () => {
      const store = storeOlustur();

      // 1. Once guncelleme MEVCUT ve bilgi DOLU bir state'e ulas
      const dolu = {
        yeniVersiyon: '5.0.0',
        mevcutVersiyon: '0.3.0',
        degisiklikNotlari: 'Notlar',
        indirmeBaglantisi: 'https://example.com/app.apk',
        yayinTarihi: '2026-02-14',
        kaynak: 'github' as const,
        zorunluMu: false,
      };
      __mockKontrolEt.mockResolvedValueOnce({
        guncellemeMevcut: true,
        bilgi: dolu,
      });
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.guncellemeMevcut).toBe(true);
      expect(store.getState().guncelleme.bilgi).toEqual(dolu);

      // 2. Kullanici uygulamayi guncelledi -> sonraki kontrol 'guncelleme yok' doner.
      //    Bilgi DOLU state'ten null'a temizlenmeli (sifir state'ten degil).
      __mockKontrolEt.mockResolvedValueOnce({
        guncellemeMevcut: false,
        bilgi: null,
      });
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.guncellemeMevcut).toBe(false);
      expect(store.getState().guncelleme.bilgi).toBeNull();
    });

    it('guncelleme yok donerse onceden kapatilan bildirim durumu korunur', async () => {
      const store = storeOlustur();

      // 1. Guncelleme mevcut, kullanici bildirimi kapatti
      __mockKontrolEt.mockResolvedValueOnce({
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '5.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github' as const,
          zorunluMu: false,
        },
      });
      await store.dispatch(guncellemeKontrolEt(false));
      store.dispatch(bildirimiKapat());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

      // 2. Sonraki kontrol 'guncelleme yok' doner -> reducer if(guncellemeMevcut)
      //    bloguna GIRMEZ, dolayisiyla bildirimiKapatti'ya DOKUNMAMALI (true kalmali).
      __mockKontrolEt.mockResolvedValueOnce({
        guncellemeMevcut: false,
        bilgi: null,
      });
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
    });
  });

  describe('bildirim sifirlama savunma dali (yeniVer falsy)', () => {
    it('guncellemeMevcut true ama bilgi null iken kapatilan bildirim sifirlanmaz', async () => {
      const store = storeOlustur();

      // 1. Gercek bir guncelleme gelir, kullanici kapatir
      __mockKontrolEt.mockResolvedValueOnce({
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github' as const,
          zorunluMu: false,
        },
      });
      await store.dispatch(guncellemeKontrolEt(false));
      store.dispatch(bildirimiKapat());
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

      // 2. guncellemeMevcut=true AMA bilgi=null (yeniVer falsy) gelir.
      //    Uretimdeki `if (yeniVer && yeniVer !== eskiVer)` savunma dali nedeniyle
      //    sifirlama YAPILMAMALI -> bildirimiKapatti true KALMALI.
      //    (yeniVer && korumasi kaldirilsaydi null !== '1.0.0' true olur ve yanlislikla sifirlanirdi.)
      __mockKontrolEt.mockResolvedValueOnce({
        guncellemeMevcut: true,
        bilgi: null,
      });
      await store.dispatch(guncellemeKontrolEt(false));
      expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
      expect(store.getState().guncelleme.bilgi).toBeNull();
    });
  });
});
