/**
 * GuncellemeBildirimi Bilesen Testleri
 *
 * Guncelleme bildirim bileseni icin testler:
 * - Gosterim/gizleme mantigi
 * - Versiyon bilgisi gosterimi
 * - Buton davranislari
 */

import * as React from 'react';
import { create, act, ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TouchableOpacity, Text, Linking } from 'react-native';
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
// NOT: guvenilirBaglantiMi'yi URETIM ile AYNI sozlesmeye gore (https + guvenilir domain)
// implemente ediyoruz; cunku GuncellemeBildirimi.tsx GitHub dalinda bunu cagiriyor.
// Mock'tan eksik olsaydi component icinde undefined olup TypeError firlatirdi.
const GUVENILIR_DOMAINLER_TEST = [
  'github.com',
  'objects.githubusercontent.com',
  'play.google.com',
  'apps.apple.com',
];
// Stabil spy: guncellemeErtele thunk'i GuncellemeServisi.getInstance().guncellemeErtele'yi
// cagirir. getInstance her cagrida YENI jest.fn dondurseydi cagriyi izleyemezdik;
// bu yuzden ayni instance'i (ve ayni spy'i) dondururuz. Boylece "Sonra" butonunun
// hangi dala (ertele vs sade kapat) gittigini servis cagrisindan kesin ayirt ederiz.
const mockServisGuncellemeErtele = jest.fn().mockResolvedValue(undefined);
jest.mock('../../../../domain/services/GuncellemeServisi', () => ({
  GuncellemeServisi: {
    getInstance: () => ({
      guncellemeKontrolEt: jest.fn(),
      guncellemeErtele: (...args: any[]) => mockServisGuncellemeErtele(...args),
    }),
  },
  yayinTarihiniFormatla: (tarih: string) => tarih ? '14.02.2026' : '',
  guvenilirBaglantiMi: (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      return GUVENILIR_DOMAINLER_TEST.some(
        (domain) =>
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  },
}));

// Linking mock
// Bilesen `import { Linking } from 'react-native'` kullaniyor; bu yuzden
// react-native'in dogrudan Linking.openURL'unu jest.fn ile stub'liyoruz
// (deep path mock'u jest-expo altinda ayni objeyi yakalamiyor).
(Linking as unknown as { openURL: jest.Mock }).openURL = jest.fn().mockResolvedValue(undefined);

// PlayStoreGuncellemeModulu mock
const mockEsnekGuncellemeBaslat = jest.fn().mockResolvedValue('DOWNLOADED');
// mockInstallDurumDinle: bilesen installDurumDinle(callback) cagirir; biz callback'i
// yakalayip testte elle tetikleyecegiz (DOWNLOADED olayini simule etmek icin).
// Donus degeri (abonelikIptal) ayri bir spy'dir; unmount'ta cagrildigini dogrularz.
const mockAbonelikIptal = jest.fn();
const mockInstallDurumDinle = jest.fn().mockReturnValue(mockAbonelikIptal);
const mockGuncellemeYuklemeyiTamamla = jest.fn().mockResolvedValue(true);
jest.mock('../../../../domain/services/PlayStoreGuncellemeModulu', () => ({
  PlayStoreModulu: {
    esnekGuncellemeBaslat: (...args: any[]) => mockEsnekGuncellemeBaslat(...args),
    guncellemeYuklemeyiTamamla: (...args: any[]) => mockGuncellemeYuklemeyiTamamla(...args),
    installDurumDinle: (...args: any[]) => mockInstallDurumDinle(...args),
    kurulumKaynagiGetir: jest.fn().mockResolvedValue('play_store'),
    guncellemeDurumunuKontrolEt: jest.fn().mockResolvedValue({ guncellemeMevcut: false }),
    bekleyenGuncellemeVarMi: jest.fn().mockResolvedValue(false),
  },
}));

// ==================== YARDIMCI ====================

function storeOlustur(preloadedState?: any) {
  return configureStore({
    reducer: {
      guncelleme: guncellemeReducer,
    } as any,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

/**
 * Cocuk Text icerigine gore TouchableOpacity butonunu bulur.
 * Boylece testler gercek onPress handler'ini (guncelleBasildi / sonraBasildi)
 * tetikleyebilir — JSON string-contains yerine gercek davranisi dogrular.
 */
function butonBul(tree: ReactTestRenderer, metin: string): ReactTestInstance {
  const adaylar = tree.root.findAll(
    (node) =>
      node.type === TouchableOpacity &&
      node.findAll(
        (c) =>
          c.type === Text &&
          JSON.stringify(c.props.children).includes(metin)
      ).length > 0
  );
  if (adaylar.length === 0) {
    throw new Error(`"${metin}" metnini iceren TouchableOpacity bulunamadi`);
  }
  return adaylar[0];
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

  it('Sonra butonuna basinca bildirim kapanir (guncellemeErtele -> bildirimiKapatti true)', async () => {
    (Linking.openURL as jest.Mock).mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          // github.com guvenilir domaindir -> guvenilirBaglantiMi(true)
          indirmeBaglantisi: 'https://github.com/ornek/repo/releases/download/v1.0.0/app.apk',
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

    // "Sonra" butonunun onPress'ini gercekten tetikle (sonraBasildi)
    await act(async () => {
      butonBul(tree!, 'Sonra').props.onPress();
    });

    // yeniVersiyon dolu oldugundan guncellemeErtele thunk'i dispatch edilir;
    // fulfilled olunca bildirimiKapatti true olur.
    expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
    // Sonra butonu indirme baglantisini ACMAMALI
    expect(Linking.openURL).not.toHaveBeenCalled();

    act(() => { tree!.unmount(); });
  });

  it('Guncelle butonuna (GitHub) basinca guvenilir baglanti Linking.openURL ile acilir', async () => {
    (Linking.openURL as jest.Mock).mockClear();
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

    const baglanti = 'https://github.com/ornek/repo/releases/download/v1.0.0/app.apk';
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: baglanti,
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

    // "Güncelle" butonunun gercek onPress'i (guncelleBasildi, github dali)
    await act(async () => {
      await butonBul(tree!, 'Güncelle').props.onPress();
    });

    // GitHub dali: indirme baglantisi guvenilir oldugu icin acilmali
    expect(Linking.openURL).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).toHaveBeenCalledWith(baglanti);
    // GitHub dalinda Play Store native akisi tetiklenmemeli
    expect(mockEsnekGuncellemeBaslat).not.toHaveBeenCalled();

    act(() => { tree!.unmount(); });
  });

  it('Guncelle butonuna (GitHub) basinca guvenilmez baglanti ACILMAZ', async () => {
    (Linking.openURL as jest.Mock).mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          // example.com guvenilir domain listesinde DEGIL -> acilmamali
          indirmeBaglantisi: 'https://example.com/app.apk',
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

    await act(async () => {
      await butonBul(tree!, 'Güncelle').props.onPress();
    });

    // Guvenilmez domain (example.com) acilmamali — guvenlik kurali
    expect(Linking.openURL).not.toHaveBeenCalled();

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

  // ==================== PLAY STORE DAL TESTLERİ ====================

  it('Play Store kaynağında temiz etiket gosterir, ham versionCode SIZDIRMAZ', () => {
    // Gercekci Play Store state'i: uretimde yeniVersiyon ham versionCode ( or. '28'),
    // ama kullaniciya yeniVersiyonEtiketi ('Yeni sürüm') gosterilir.
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
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
    // Temiz etiket gosterilmeli
    expect(json).toContain('Yeni sürüm');
    // Kullaniciya ASLA 'versionCode' veya ham versiyon sayisi sizmamali (AGENTS.md kurali)
    expect(json).not.toContain('versionCode');
    expect(json).not.toMatch(/v\s?28\b/);

    act(() => { tree!.unmount(); });
  });

  it('Play Store etiketi eksikse render olur ama versionCode metni SIZMAZ (fallback degismezi)', () => {
    // yeniVersiyonEtiketi kasitli olarak undefined -> fallback `v${yeniVersiyon}`.
    // Fallback ham versionCode formati (or. "versionCode 28") icermemeli; bu degismez
    // kullaniciya ham sayi sizmasini bilesen katmaninda kilitler.
    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
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
    // Etiket yoksa bile 'versionCode' ham metni asla gosterilmemeli
    expect(json).not.toContain('versionCode');

    act(() => { tree!.unmount(); });
  });

  it('Play Store "Güncelle" butonuna basınca esnekGuncellemeBaslat çağrılır', async () => {
    mockEsnekGuncellemeBaslat.mockReset();
    mockEsnekGuncellemeBaslat.mockResolvedValue('DOWNLOADED');
    (Linking.openURL as jest.Mock).mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
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

    // "Güncelle" butonunun GERCEK onPress'ini tetikle (guncelleBasildi, playstore dali)
    await act(async () => {
      await butonBul(tree!, 'Güncelle').props.onPress();
    });

    // Play Store native in-app update akisi baslamali
    expect(mockEsnekGuncellemeBaslat).toHaveBeenCalledTimes(1);
    // Play Store native sheet devraldigi icin kendi UI'i hemen kapanmali
    expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);
    // Play Store dalinda harici tarayici/indirme baglantisi ACILMAMALI
    expect(Linking.openURL).not.toHaveBeenCalled();

    act(() => { tree!.unmount(); });
  });

  it('Play Store kaynağında "Güncelle" basinca Linking.openURL çağrılmaz', async () => {
    mockEsnekGuncellemeBaslat.mockReset();
    mockEsnekGuncellemeBaslat.mockResolvedValue('DOWNLOADED');
    (Linking.openURL as jest.Mock).mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
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

    // "Güncelle" butonunun gercek onPress'ini tetikle
    await act(async () => {
      await butonBul(tree!, 'Güncelle').props.onPress();
    });

    // Play Store dalinda native akis kullanilir; harici URL ASLA acilmaz
    expect(Linking.openURL).not.toHaveBeenCalled();
    // Bunun yerine native in-app update baslatilir
    expect(mockEsnekGuncellemeBaslat).toHaveBeenCalledTimes(1);
    expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

    act(() => { tree!.unmount(); });
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

  // ==================== "SONRA" FALLBACK DALI (yeniVersiyon yok) ====================

  it('"Sonra" basinca yeniVersiyon YOKKEN guncellemeErtele DEGIL sade bildirimiKapat calisir', async () => {
    // Uretim sonraBasildi(): bilgi?.yeniVersiyon doluysa guncellemeErtele(versiyon),
    // YOKSA bildirimiKapat(). Mevcut testler yalniz dolu dali kapsiyor.
    // Bu test bos-versiyon fallback dalini kanitlar: ertele servis cagrisi YAPILMAMALI,
    // ama bildirim yine kapanmali (bildirimiKapatti=true). Iki dal da bildirimiKapatti'yi
    // true yaptigindan, ayrimi state degil SERVIS CAGRISI ile yapariz.
    mockServisGuncellemeErtele.mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          // yeniVersiyon kasitli olarak bos -> fallback dali (bildirimiKapat)
          yeniVersiyon: '',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://github.com/ornek/repo/releases/download/v1.0.0/app.apk',
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

    await act(async () => {
      butonBul(tree!, 'Sonra').props.onPress();
    });

    // Fallback dali: ertele thunk'i (ve onun servis cagrisi) tetiklenMEMELI
    expect(mockServisGuncellemeErtele).not.toHaveBeenCalled();
    // Ama bildirim yine de kapatilmali (sade bildirimiKapat)
    expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

    act(() => { tree!.unmount(); });
  });

  it('"Sonra" basinca yeniVersiyon DOLUYKEN guncellemeErtele servis cagrisi YAPILIR (dogru versiyonla)', async () => {
    // Pozitif kontrast: dolu versiyonda ertele dali secilmeli ve servise TAM versiyon
    // gecmeli. Bu test ile fallback testi birlikte iki dali kesin ayirir.
    mockServisGuncellemeErtele.mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '2.5.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://github.com/ornek/repo/releases/download/v2.5.0/app.apk',
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

    await act(async () => {
      butonBul(tree!, 'Sonra').props.onPress();
    });

    // Ertele dali: servise tam yeniVersiyon gecmeli
    expect(mockServisGuncellemeErtele).toHaveBeenCalledTimes(1);
    expect(mockServisGuncellemeErtele).toHaveBeenCalledWith('2.5.0');
    expect(store.getState().guncelleme.bildirimiKapatti).toBe(true);

    act(() => { tree!.unmount(); });
  });

  // ==================== PLAY STORE INSTALL DURUM DINLEYICISI ====================

  // ISSUE #91: DOWNLOADED gelince OTOMATIK completeUpdate (restart) cagrilmaz;
  // kullaniciya "Yeniden Baslat" ONAYI gosterilir. completeUpdate yalnizca onayla cagrilir.
  it('Play Store: installStatus===11 (DOWNLOADED) gelince OTOMATIK restart cagrilmaz, onay gosterilir', async () => {
    mockInstallDurumDinle.mockClear();
    mockGuncellemeYuklemeyiTamamla.mockClear();
    mockGuncellemeYuklemeyiTamamla.mockResolvedValue(true);

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        indirmeTamamlandi: false,
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

    // playstore kaynaginda dinleyici kurulmus olmali
    expect(mockInstallDurumDinle).toHaveBeenCalledTimes(1);
    const callback = mockInstallDurumDinle.mock.calls[0][0];
    expect(typeof callback).toBe('function');

    // DOWNLOADED (11) disi bir durum gelince hicbir sey olmamali
    await act(async () => {
      callback({ installStatus: 2 /* DOWNLOADING */ });
    });
    expect(mockGuncellemeYuklemeyiTamamla).not.toHaveBeenCalled();
    expect(store.getState().guncelleme.indirmeTamamlandi).toBe(false);

    // DOWNLOADED (11) gelince: OTOMATIK restart YOK; sadece onay durumu isaretlenir
    await act(async () => {
      callback({ installStatus: 11 /* DOWNLOADED */ });
    });
    expect(mockGuncellemeYuklemeyiTamamla).not.toHaveBeenCalled();
    expect(store.getState().guncelleme.indirmeTamamlandi).toBe(true);

    act(() => { tree!.unmount(); });
  });

  it('Play Store: "Yeniden Başlat" onayina basinca completeUpdate cagrilir (idempotent)', async () => {
    mockInstallDurumDinle.mockClear();
    mockGuncellemeYuklemeyiTamamla.mockClear();
    mockGuncellemeYuklemeyiTamamla.mockResolvedValue(true);

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
          zorunluMu: false,
        },
        bildirimiKapatti: false,
        // Indirme zaten tamamlanmis -> onay kartini gostermeli
        indirmeTamamlandi: true,
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

    // "Yeniden Başlat" butonu gorunmeli ve onPress completeUpdate cagirmali
    const buton = butonBul(tree!, 'Yeniden Başlat');
    await act(async () => {
      await buton.props.onPress();
    });
    expect(mockGuncellemeYuklemeyiTamamla).toHaveBeenCalledTimes(1);

    // Idempotent: ikinci tiklama tekrar restart denememeli (ust uste restart onlenir)
    await act(async () => {
      await buton.props.onPress();
    });
    expect(mockGuncellemeYuklemeyiTamamla).toHaveBeenCalledTimes(1);

    act(() => { tree!.unmount(); });
  });

  it('Play Store DISI kaynakta install durum dinleyicisi KURULMAZ', () => {
    mockInstallDurumDinle.mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '1.0.0',
          mevcutVersiyon: '0.3.0',
          degisiklikNotlari: 'Test',
          indirmeBaglantisi: 'https://github.com/ornek/repo/releases/download/v1.0.0/app.apk',
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

    // github kaynaginda (kaynak !== 'playstore') dinleyici erken return ile kurulMAMALI
    expect(mockInstallDurumDinle).not.toHaveBeenCalled();

    act(() => { tree!.unmount(); });
  });

  it('Play Store: unmount edilince abonelikIptal cagrilir (sizinti/temizlik)', () => {
    mockInstallDurumDinle.mockClear();
    mockAbonelikIptal.mockClear();

    const store = storeOlustur({
      guncelleme: {
        kontrolEdiliyor: false,
        guncellemeMevcut: true,
        bilgi: {
          yeniVersiyon: '28',
          yeniVersiyonEtiketi: 'Yeni sürüm',
          mevcutVersiyon: '0.14.0',
          degisiklikNotlari: '',
          indirmeBaglantisi: 'playstore://update',
          yayinTarihi: '',
          kaynak: 'playstore',
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

    // Dinleyici kuruldu, abonelikIptal henuz cagrilmadi
    expect(mockInstallDurumDinle).toHaveBeenCalledTimes(1);
    expect(mockAbonelikIptal).not.toHaveBeenCalled();

    // Unmount -> useEffect cleanup -> abonelikIptal() calismali
    act(() => { tree!.unmount(); });
    expect(mockAbonelikIptal).toHaveBeenCalledTimes(1);
  });
});
