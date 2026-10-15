/**
 * "Her farzla bir kaza" orkestrasyonu (issue #294) — gerçek kaza slice'ı +
 * bellek-içi AsyncStorage. Kerahat tek kaynaktan (`mekruhVakitKontrolEt`) gelir,
 * burada yalnız o fonksiyon sahtelenir.
 */
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react-native';
import kazaReducer from '../../store/kazaSlice';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { useFarzSonrasiKazaOnerisi, type KazaOnerisiDegerlendirmeGirdisi } from '../useFarzSonrasiKazaOnerisi';
import { kisaBildirimGoster } from '../../components/common/KisaBildirim';

const mockDisk = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: async (k: string) => (mockDisk.has(k) ? mockDisk.get(k)! : null),
    setItem: async (k: string, v: string) => {
      mockDisk.set(k, v);
    },
    removeItem: async (k: string) => {
      mockDisk.delete(k);
    },
  },
}));

const mockKerahat = { mekruhMu: false };
jest.mock('../../../domain/services/KazaHesaplayiciServisi', () => ({
  ...jest.requireActual('../../../domain/services/KazaHesaplayiciServisi'),
  mekruhVakitKontrolEt: jest.fn(() => ({ mekruhMu: mockKerahat.mekruhMu, aciklama: null, bitis: null })),
}));
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const GUN = '2026-10-13';

const borcYaz = (borclar: Record<string, number>) => {
  const namazlar = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı', 'Vitir'].map((namazAdi) => ({
    namazAdi,
    toplamBorc: borclar[namazAdi] ?? 0,
    kalanBorc: borclar[namazAdi] ?? 0,
    tamamlanan: 0,
  }));
  const toplamKalan = namazlar.reduce((t, n) => t + n.kalanBorc, 0);
  mockDisk.set(
    DEPOLAMA_ANAHTARLARI.KAZA_DURUMU,
    JSON.stringify({
      namazlar,
      toplamKalan,
      toplamTamamlanan: 0,
      gunlukHedef: 3,
      gunlukTamamlanan: 0,
      gunlukHedefTarihi: GUN,
      toplamGizleMi: false,
      guncellemeTarihi: new Date().toISOString(),
    })
  );
};

const girdi = (d: Partial<KazaOnerisiDegerlendirmeGirdisi> = {}): KazaOnerisiDegerlendirmeGirdisi => ({
  kilinanNamaz: NamazAdi.Ogle,
  tamamlandi: true,
  gosterilenGun: GUN,
  aktifGun: GUN,
  suankiVakitNamazi: NamazAdi.Ogle,
  koordinat: { lat: 41, lng: 29 },
  ...d,
});

const kur = () => {
  const store = configureStore({ reducer: { kaza: kazaReducer } });
  const sarmalayici = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  const hook = renderHook(() => useFarzSonrasiKazaOnerisi(), { wrapper: sarmalayici });
  return { store, hook };
};

const kalanBorc = (ad: string): number => {
  const d = JSON.parse(mockDisk.get(DEPOLAMA_ANAHTARLARI.KAZA_DURUMU)!);
  return d.namazlar.find((n: { namazAdi: string }) => n.namazAdi === ad).kalanBorc;
};

beforeEach(() => {
  mockDisk.clear();
  mockKerahat.mekruhMu = false;
  jest.clearAllMocks();
});

describe('useFarzSonrasiKazaOnerisi', () => {
  it('borç varken soruyu açar, "Kıldım" kazayı defterden düşer', async () => {
    borcYaz({ 'Öğle': 2 });
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    expect(hook.result.current.oneri).toEqual({ kilinanFarz: 'Öğle', kazaNamazi: 'Öğle', aktifGun: GUN });

    await act(async () => {
      await hook.result.current.kildim();
    });
    expect(hook.result.current.oneri).toBeNull();
    expect(kalanBorc('Öğle')).toBe(1);
    expect(kisaBildirimGoster).toHaveBeenCalledWith(expect.stringContaining('öğle kazası'));
  });

  it('kerahat vaktinde sormaz, defteri okumaz bile', async () => {
    borcYaz({ 'Öğle': 2 });
    mockKerahat.mekruhMu = true;
    const { hook, store } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    expect(hook.result.current.oneri).toBeNull();
    expect(store.getState().kaza.kazaDurumu).toBeNull();
  });

  it('defter boşsa sormaz', async () => {
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    expect(hook.result.current.oneri).toBeNull();
  });

  it('ayar kapalıysa sormaz', async () => {
    borcYaz({ 'Öğle': 2 });
    mockDisk.set(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI, JSON.stringify({ farzSonrasiOner: false }));
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    expect(hook.result.current.oneri).toBeNull();
  });

  it('aynı vakit aynı gün bir kez: soru kapandıktan sonra yeniden "kıldım" sormaz', async () => {
    borcYaz({ 'Öğle': 2 });
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    expect(hook.result.current.oneri).not.toBeNull();
    // Kullanıcı soruyu "Kıldım" ile kapatır (ertelemeden), sonra farzı geri alıp yeniden işaretler.
    await act(async () => {
      await hook.result.current.kildim();
    });
    await act(async () => {
      await hook.result.current.degerlendir(girdi({ tamamlandi: false }));
      await hook.result.current.degerlendir(girdi());
    });
    expect(hook.result.current.oneri).toBeNull();
  });

  it('"Şimdi değil" o gün başka vakitte de sordurmaz', async () => {
    borcYaz({ 'Öğle': 2, 'Akşam': 1 });
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    await act(async () => {
      await hook.result.current.simdiDegil();
    });
    expect(hook.result.current.oneri).toBeNull();
    await act(async () => {
      await hook.result.current.degerlendir(
        girdi({ kilinanNamaz: NamazAdi.Aksam, suankiVakitNamazi: NamazAdi.Aksam })
      );
    });
    expect(hook.result.current.oneri).toBeNull();
    expect(kalanBorc('Öğle')).toBe(2);
  });

  it('kıldım → hemen geri al: geç dönen değerlendirme bayat soruyu AÇMAZ', async () => {
    borcYaz({ 'Öğle': 2 });
    const { hook } = kur();
    await act(async () => {
      const ilk = hook.result.current.degerlendir(girdi());
      void hook.result.current.degerlendir(girdi({ tamamlandi: false }));
      await ilk;
    });
    expect(hook.result.current.oneri).toBeNull();
  });

  it('"Bir daha sormayın" ayarı kapatır ve diske yazar', async () => {
    borcYaz({ 'Öğle': 2 });
    const { hook, store } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    await act(async () => {
      await hook.result.current.birDahaSorma();
    });
    expect(hook.result.current.oneri).toBeNull();
    expect(store.getState().kaza.oneriAyarlari).toEqual({ farzSonrasiOner: false });
    expect(JSON.parse(mockDisk.get(DEPOLAMA_ANAHTARLARI.KAZA_ONERI_AYARLARI)!)).toEqual({
      farzSonrasiOner: false,
    });
  });

  it('"Kıldım" bayat store ile yazmaz: araya giren disk yazımını (bildirimden borç ekleme) korur', async () => {
    borcYaz({ 'Öğle': 2 });
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi());
    });
    // Soru açıkken bildirimden "Kazaya ekle" store'suz diske yazar.
    borcYaz({ 'Öğle': 2, Sabah: 5 });
    await act(async () => {
      await hook.result.current.kildim();
    });
    expect(kalanBorc('Öğle')).toBe(1);
    expect(kalanBorc('Sabah')).toBe(5);
  });

  it('konum yoksa (kerahat bilinemez) sormaz', async () => {
    borcYaz({ 'Öğle': 2 });
    const { hook } = kur();
    await act(async () => {
      await hook.result.current.degerlendir(girdi({ koordinat: { lat: 0, lng: 0 } }));
    });
    expect(hook.result.current.oneri).toBeNull();
  });
});
