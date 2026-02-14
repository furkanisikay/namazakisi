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

    it('rejected durumunda hata mesaji set edilir', async () => {
      __mockKontrolEt.mockRejectedValue(new Error('Test hatasi'));

      const store = storeOlustur();
      await store.dispatch(guncellemeKontrolEt(false));

      const state = store.getState().guncelleme;
      expect(state.kontrolEdiliyor).toBe(false);
      expect(state.hata).toBeDefined();
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
  });
});
