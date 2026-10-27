/**
 * Dil değişince planlanmış metinler yeni dilde yeniden kurulur (tek yayma noktası
 * `konumDegistiUygula`); aynı dil ya da konumsuz durumda yayılmaz.
 */
import { configureStore } from '@reduxjs/toolkit';

const mockUygula = jest.fn((_k: unknown) => Promise.resolve());
jest.mock('../../../domain/services/KonumDegisikligiServisi', () => ({ konumDegistiUygula: (k: unknown) => mockUygula(k) }));
const mockKaydet = jest.fn((_kod: string) => Promise.resolve(true));
jest.mock('../../../domain/services/DilServisi', () => ({
  DilServisi: { kaydet: (kod: string) => mockKaydet(kod), yukle: () => Promise.resolve('tr') },
}));

const mockKategori = jest.fn(() => Promise.resolve());
jest.mock('../../../domain/services/bildirimKategorileri', () => ({ bildirimKategorileriniKaydet: () => mockKategori() }));
const mockKanal = jest.fn(() => Promise.resolve());
jest.mock('../../../domain/services/BildirimServisi', () => ({
  BildirimServisi: { getInstance: () => ({ temelKanallariKur: () => mockKanal() }) },
}));

import { I18nManager } from 'react-native';
import dilReducer, { diliKaydet, yonDegisimiAyarla } from '../dilSlice';
import { aktifDiliKur, aktifDilSifirla } from '../../../core/dil/aktifDil';

const kur = (koordinatlar: { lat: number; lng: number } | null) =>
  configureStore({
    reducer: { dil: dilReducer, konum: (s: unknown = { koordinatlar }) => s },
  });

beforeEach(() => {
  mockUygula.mockReset().mockResolvedValue(undefined);
  mockKaydet.mockReset().mockResolvedValue(true);
  mockKategori.mockReset().mockResolvedValue(undefined);
  mockKanal.mockReset().mockResolvedValue(undefined);
});

it('dil değişti → konumDegistiUygula ile planlar yeniden kurulur', async () => {
  const store = kur({ lat: 3.14, lng: 101.69 });
  await store.dispatch(diliKaydet('en'));
  expect(mockUygula).toHaveBeenCalledWith({ lat: 3.14, lng: 101.69 });
  expect(mockKategori).toHaveBeenCalledTimes(1);
  expect(mockKanal).toHaveBeenCalledTimes(1);
  expect(store.getState().dil.kod).toBe('en');
});

it('dil aynı → yayılmaz', async () => {
  mockKaydet.mockResolvedValue(false);
  await kur({ lat: 3.14, lng: 101.69 }).dispatch(diliKaydet('tr'));
  expect(mockUygula).not.toHaveBeenCalled();
  expect(mockKategori).not.toHaveBeenCalled();
});

it('konum yapılandırılmamış ({0,0} ya da yok) → yayılmaz, dil yine kaydedilir', async () => {
  const store = kur({ lat: 0, lng: 0 });
  await store.dispatch(diliKaydet('en'));
  await kur(null).dispatch(diliKaydet('en'));
  expect(mockUygula).not.toHaveBeenCalled();
  expect(store.getState().dil.kod).toBe('en');
});

it('yayma hatası kaydı bozmaz', async () => {
  mockUygula.mockRejectedValue(new Error('x'));
  const store = kur({ lat: 1, lng: 1 });
  await store.dispatch(diliKaydet('en'));
  expect(store.getState().dil.kod).toBe('en');
});

describe('cihaz dili ve elle yazılmış sesli okuma metinleri', () => {
  it("'cihaz' → açık seçim silinir, etkin dil store'a yazılır", async () => {
    const { DilServisi } = jest.requireMock('../../../domain/services/DilServisi') as { DilServisi: Record<string, unknown> };
    DilServisi.cihazDilineDon = jest.fn(() => Promise.resolve(false));
    const store = kur({ lat: 3.14, lng: 101.69 });
    await store.dispatch(diliKaydet('cihaz'));
    expect(DilServisi.cihazDilineDon).toHaveBeenCalledTimes(1);
    expect(mockKaydet).not.toHaveBeenCalled();
    expect(mockUygula).not.toHaveBeenCalled();
    expect(store.getState().dil.kod).toBe('tr');
  });
});

describe('yazı yönü değişimi (sahip kararı 2026-10-26)', () => {
  // Gerçek etkin dil: YonServisi istenen yönü `aktifDil()`'den okur.
  beforeEach(() => {
    aktifDilSifirla();
    mockKaydet.mockImplementation(async (kod: string) => aktifDiliKur(kod));
  });
  afterEach(() => {
    aktifDilSifirla();
    jest.restoreAllMocks();
  });

  it('başlangıç durumu: yok', () => {
    expect(kur(null).getState().dil.yonDegisimi).toBe('yok');
  });

  it("soldan sağa → sağdan sola dil: soruluyor; yön native'e planlar kurulduktan SONRA yazılır", async () => {
    jest.replaceProperty(I18nManager, 'isRTL', false);
    let planlarKuruldu = false;
    mockUygula.mockImplementation(async () => {
      planlarKuruldu = true;
    });
    const force = jest.spyOn(I18nManager, 'forceRTL').mockImplementation(() => {
      expect(planlarKuruldu).toBe(true);
    });
    const store = kur({ lat: 21.4, lng: 39.8 });
    await store.dispatch(diliKaydet('ar'));
    expect(force).toHaveBeenCalledWith(true);
    expect(store.getState().dil.yonDegisimi).toBe('soruluyor');
  });

  it('aynı yönde dil değişimi → yok (soru yok)', async () => {
    jest.replaceProperty(I18nManager, 'isRTL', false);
    const store = kur({ lat: 1, lng: 1 });
    await store.dispatch(diliKaydet('en'));
    expect(store.getState().dil.yonDegisimi).toBe('yok');
  });

  it('"Sonra" (ertelendi) sonrası çizilen yöne geri dönülürse → yok', async () => {
    jest.replaceProperty(I18nManager, 'isRTL', false);
    const store = kur({ lat: 1, lng: 1 });
    await store.dispatch(diliKaydet('ar'));
    store.dispatch(yonDegisimiAyarla('ertelendi'));
    expect(store.getState().dil.yonDegisimi).toBe('ertelendi');
    await store.dispatch(diliKaydet('tr'));
    expect(store.getState().dil.yonDegisimi).toBe('yok');
  });

  it('dil değişmediyse yön durumuna dokunulmaz', async () => {
    jest.replaceProperty(I18nManager, 'isRTL', false);
    const store = kur({ lat: 1, lng: 1 });
    store.dispatch(yonDegisimiAyarla('ertelendi'));
    mockKaydet.mockResolvedValue(false);
    await store.dispatch(diliKaydet('tr'));
    expect(store.getState().dil.yonDegisimi).toBe('ertelendi');
  });
});
