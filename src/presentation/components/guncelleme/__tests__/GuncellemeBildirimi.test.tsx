/**
 * GuncellemeBildirimi Bilesen Testleri
 *
 * Guncelleme bildirim bileseni icin testler:
 * - Gosterim/gizleme mantigi
 * - Versiyon bilgisi gosterimi
 * - Buton davranislari
 */

import * as React from 'react';
import { create, act, ReactTestRenderer } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import guncellemeReducer, { bildirimiKapat } from '../../../store/guncellemeSlice';

// ==================== MOCKLAR ====================

// Expo vector icons mock (expo-modules-core sorununu onler)
const MockIcon = (props: any) => React.createElement('MockIcon', props);
jest.mock('@expo/vector-icons/FontAwesome5', () => MockIcon);
jest.mock('@expo/vector-icons/MaterialIcons', () => MockIcon);
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: MockIcon,
  MaterialIcons: MockIcon,
}));

// Tema mock
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#212121',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    birincilKoyu: '#388E3C',
    birincilAcik: '#C8E6C9',
    bilgi: '#2196F3',
    basarili: '#4CAF50',
    uyari: '#FFC107',
    hata: '#F44336',
    vurgu: '#00BFA5',
  }),
}));

// GuncellemeServisi mock
jest.mock('../../../../domain/services/GuncellemeServisi', () => ({
  GuncellemeServisi: {
    getInstance: () => ({
      guncellemeKontrolEt: jest.fn(),
      guncellemeErtele: jest.fn(),
    }),
  },
  yayinTarihiniFormatla: (tarih: string) => tarih ? '14.02.2026' : '',
}));

// Linking mock
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

// ==================== YARDIMCI ====================

function storeOlustur(preloadedState?: any) {
  return configureStore({
    reducer: {
      guncelleme: guncellemeReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

// Bilesenin lazy import'u (mocklardan sonra)
let GuncellemeBildirimi: React.FC;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  GuncellemeBildirimi = require('../GuncellemeBildirimi').GuncellemeBildirimi;
});

// ==================== TESTLER ====================

describe('GuncellemeBildirimi', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('guncelleme yokken null render eder', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: false,
        bilgi: null,
        bildirimiKapatti: false,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    expect(tree!.toJSON()).toBeNull();

    act(() => { tree!.unmount(); });
  });

  it('guncelleme mevcut oldugunda render eder', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Yeni ozellikler eklendi',
          indirmeBaglantisi: 'https://example.com/app.apk',
          yayinTarihi: '2026-02-14T10:00:00Z',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    expect(tree!.toJSON()).not.toBeNull();

    act(() => { tree!.unmount(); });
  });

  it('bildirim kapatildiginda pointerEvents none olur', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '2026-02-14',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: true,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    // Bilesen hala render olur ama pointerEvents="none" ile etkilesime kapali
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('"pointerEvents":"none"');

    act(() => { tree!.unmount(); });
  });

  it('versiyon bilgileri dogru gosterilir', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Yeni ozellikler',
          indirmeBaglantisi: 'https://example.com/app.apk',
          yayinTarihi: '2026-02-14T10:00:00Z',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    const json = JSON.stringify(tree!.toJSON());

    // React children olarak ["v","0.3.0"] seklinde ayrilmis olabilir
    expect(json).toContain('0.3.0');
    expect(json).toContain('1.0.0');
    expect(json).toContain('Yeni Sürüm Mevcut');

    act(() => { tree!.unmount(); });
  });

  it('degisiklik notlari gosterilir', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Hata duzeltmeleri ve performans iyilestirmeleri',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '2026-02-14',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Hata duzeltmeleri ve performans iyilestirmeleri');

    act(() => { tree!.unmount(); });
  });

  it('Sonra ve Guncelle butonlari mevcut', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '2026-02-14',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Sonra');
    expect(json).toContain('Güncelle');

    act(() => { tree!.unmount(); });
  });

  it('bildirimiKapat aksiyonu state i gunceller', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        hata: null,
      },
    });

    store.dispatch(bildirimiKapat());
    expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
  });

  it('degisiklik notlari bos oldugunda bilesen hala render olur', () => {
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'https://example.com',
          yayinTarihi: '',
          kaynak: 'github',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        hata: null,
      },
    });

    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <Provider store={store}>
          <GuncellemeBildirimi />
        </Provider>
      );
    });
    act(() => { jest.runAllTimers(); });

    expect(tree!.toJSON()).not.toBeNull();
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Güncelle');

    act(() => { tree!.unmount(); });
  });
});
