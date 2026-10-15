import { configureStore } from '@reduxjs/toolkit';

const mockDepo: Record<string, string> = {};
const mockHata = { getItem: false, setItem: false };
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => {
      if (mockHata.getItem) throw new Error('disk');
      return mockDepo[k] ?? null;
    }),
    setItem: jest.fn(async (k: string, v: string) => {
      if (mockHata.setItem) throw new Error('disk');
      mockDepo[k] = v;
    }),
  },
}));

jest.mock('../../../core/utils/Logger', () => ({
  Logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import sadeReducer, {
  geciciCik,
  geciciCikisiBitir,
  sadeGorunumAyarlariniYukle,
  sadeGorunumuAyarla,
} from '../sadeGorunumSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const magaza = () => configureStore({ reducer: { sadeGorunum: sadeReducer } });
const ANAHTAR = DEPOLAMA_ANAHTARLARI.SADE_GORUNUM_AYARLARI;

describe('sadeGorunumSlice (issue #295)', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockDepo)) delete mockDepo[k];
    mockHata.getItem = false;
    mockHata.setItem = false;
    jest.clearAllMocks();
  });

  test('boş disk → KAPALI, yüklendi (initialState gerçek veri sanılmasın)', async () => {
    const m = magaza();
    expect(m.getState().sadeGorunum.yuklendi).toBe(false);
    await m.dispatch(sadeGorunumAyarlariniYukle());
    expect(m.getState().sadeGorunum).toMatchObject({ yuklendi: true, ayarlar: { aktif: false } });
  });

  test('bozuk kayıt ve okuma hatası ASLA reddetmez (sessiz sonsuz spinner dersi)', async () => {
    mockDepo[ANAHTAR] = '{kesik';
    const m = magaza();
    await m.dispatch(sadeGorunumAyarlariniYukle());
    expect(m.getState().sadeGorunum).toMatchObject({ yuklendi: true, ayarlar: { aktif: false } });

    mockHata.getItem = true;
    const m2 = magaza();
    await m2.dispatch(sadeGorunumAyarlariniYukle());
    expect(m2.getState().sadeGorunum).toMatchObject({ yuklendi: true, ayarlar: { aktif: false } });
  });

  test('yüklüyken ikinci okuma atlanır; içe aktarma "zorla" ile yeniden okur', async () => {
    mockDepo[ANAHTAR] = JSON.stringify({ aktif: true });
    const m = magaza();
    await m.dispatch(sadeGorunumAyarlariniYukle());
    await m.dispatch(sadeGorunumAyarlariniYukle());
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);

    mockDepo[ANAHTAR] = JSON.stringify({ aktif: false });
    await m.dispatch(sadeGorunumAyarlariniYukle({ zorla: true }));
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(2);
    expect(m.getState().sadeGorunum.ayarlar.aktif).toBe(false);
  });

  test('açmak diske yazar ve geçici çıkışı sıfırlar', async () => {
    const m = magaza();
    m.dispatch(geciciCik());
    await m.dispatch(sadeGorunumuAyarla(true));
    expect(m.getState().sadeGorunum).toMatchObject({ ayarlar: { aktif: true }, geciciCikis: false });
    expect(JSON.parse(mockDepo[ANAHTAR])).toEqual({ aktif: true });
  });

  test('yazma başarısızsa iyimser değer geri alınır', async () => {
    mockHata.setItem = true;
    const m = magaza();
    await m.dispatch(sadeGorunumuAyarla(true));
    expect(m.getState().sadeGorunum.ayarlar.aktif).toBe(false);
    expect(m.getState().sadeGorunum.hata).toBeTruthy();
  });

  test('geçici çıkış KALICI değildir (diske yazılmaz) ve geri alınabilir', () => {
    const m = magaza();
    m.dispatch(geciciCik());
    expect(m.getState().sadeGorunum.geciciCikis).toBe(true);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    m.dispatch(geciciCikisiBitir());
    expect(m.getState().sadeGorunum.geciciCikis).toBe(false);
  });
});
