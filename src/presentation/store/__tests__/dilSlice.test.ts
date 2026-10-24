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

import dilReducer, { diliKaydet } from '../dilSlice';

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
