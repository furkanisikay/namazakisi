import { configureStore } from '@reduxjs/toolkit';

const mockDepo: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => mockDepo[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      mockDepo[k] = v;
    }),
  },
}));

import nowBarReducer, { nowBarAyarlariniYukle, nowBarOgesiniGuncelle } from '../nowBarSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { VARSAYILAN_NOW_BAR_AYARLARI } from '../../../core/sayac/nowBar';

const magaza = () => configureStore({ reducer: { nowBar: nowBarReducer } });

describe('nowBarSlice', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockDepo)) delete mockDepo[k];
  });

  test('boş disk → varsayılan (ilk aşamanın davranışı), yüklendi', async () => {
    const m = magaza();
    expect(m.getState().nowBar.yuklendi).toBe(false);
    await m.dispatch(nowBarAyarlariniYukle());
    expect(m.getState().nowBar).toMatchObject({ yuklendi: true, ayarlar: VARSAYILAN_NOW_BAR_AYARLARI });
  });

  test('bozuk kayıt ASLA reddetmez, varsayılana düşer', async () => {
    mockDepo[DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI] = '{kesik';
    const m = magaza();
    await m.dispatch(nowBarAyarlariniYukle());
    expect(m.getState().nowBar.ayarlar).toEqual(VARSAYILAN_NOW_BAR_AYARLARI);
  });

  test('öğe güncellemesi diske yazılır ve yalnız o öğeyi değiştirir', async () => {
    const m = magaza();
    await m.dispatch(nowBarOgesiniGuncelle({ oge: 'teheccud', degisiklik: { acik: true, baslangic: 'sonDk', sonDk: 45 } }));
    expect(m.getState().nowBar.ayarlar.ogeler.teheccud).toEqual({ acik: true, baslangic: 'sonDk', sonDk: 45 });
    const disk = JSON.parse(mockDepo[DEPOLAMA_ANAHTARLARI.NOW_BAR_AYARLARI]);
    expect(disk.ogeler.teheccud.acik).toBe(true);
    expect(disk.ogeler.ogle).toEqual(VARSAYILAN_NOW_BAR_AYARLARI.ogeler.ogle);
  });
});
