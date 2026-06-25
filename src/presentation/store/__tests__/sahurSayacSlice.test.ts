/**
 * sahurSayacSlice — davranışsal testler
 *
 * Kapsanan davranışlar:
 *  - yukle thunk: veri yokken / geçerli veri / aktif:false-string / bozuk JSON (catch)
 *  - guncelle thunk: mevcut state ile birleştirme (getState merge), diske yazma,
 *    setItem fırlatınca rejected + hata mesajı
 *  - reducer: pending/fulfilled/rejected dalları (yukleniyor/hata/ayarlar geçişleri)
 */

import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import reducer, {
  sahurSayacAyarlariniYukle,
  sahurSayacAyariniGuncelle,
} from '../sahurSayacSlice';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

// In-memory AsyncStorage mock (mock* öneki: jest.mock fabrikası closure dışına erişebilsin)
const mockStore = new Map<string, string>();
let mockSetItemHata: Error | null = null;
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null)),
    setItem: jest.fn(async (k: string, v: string) => {
      if (mockSetItemHata) throw mockSetItemHata;
      mockStore.set(k, v);
    }),
    removeItem: jest.fn(async (k: string) => {
      mockStore.delete(k);
    }),
  },
}));

// Logger'ı sustur (yan etki testi kirletmesin)
jest.mock('../../../core/utils/Logger', () => ({
  Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const KEY = DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI;

// Sadece sahurSayac reducer'ı ile gerçek store — thunk'taki getState().sahurSayac çalışsın
const yeniStore = () => configureStore({ reducer: { sahurSayac: reducer } });

beforeEach(() => {
  mockStore.clear();
  mockSetItemHata = null;
  jest.clearAllMocks();
});

describe('sahurSayacSlice — initial state', () => {
  test('başlangıçta sahur sayacı kapalı ve hata yok', () => {
    const state = yeniStore().getState().sahurSayac;
    expect(state.ayarlar.aktif).toBe(false);
    expect(state.yukleniyor).toBe(false);
    expect(state.hata).toBeNull();
  });
});

describe('sahurSayacAyarlariniYukle (thunk + reducer)', () => {
  test('disk boşken aktif:false ile yüklenir, yukleniyor false döner', async () => {
    const store = yeniStore();
    await store.dispatch(sahurSayacAyarlariniYukle());
    const state = store.getState().sahurSayac;
    expect(state.ayarlar.aktif).toBe(false);
    expect(state.yukleniyor).toBe(false);
    expect(state.hata).toBeNull();
  });

  test('diskte aktif:true varsa state.aktif true olur', async () => {
    mockStore.set(KEY, JSON.stringify({ aktif: true }));
    const store = yeniStore();
    await store.dispatch(sahurSayacAyarlariniYukle());
    expect(store.getState().sahurSayac.ayarlar.aktif).toBe(true);
  });

  test('aktif kesin true değilse (örn "true" string) false normalize edilir', async () => {
    // parsed?.aktif === true katı kontrolü: truthy ama true olmayan değer false döner
    mockStore.set(KEY, JSON.stringify({ aktif: 'true' }));
    const store = yeniStore();
    await store.dispatch(sahurSayacAyarlariniYukle());
    expect(store.getState().sahurSayac.ayarlar.aktif).toBe(false);
  });

  test('diskte aktif alanı yoksa (boş nesne) false döner', async () => {
    mockStore.set(KEY, JSON.stringify({}));
    const store = yeniStore();
    await store.dispatch(sahurSayacAyarlariniYukle());
    expect(store.getState().sahurSayac.ayarlar.aktif).toBe(false);
  });

  test('bozuk JSON catch dalına düşer, aktif:false ile başarılı (fulfilled) döner', async () => {
    mockStore.set(KEY, '{bozuk json'); // JSON.parse fırlatır
    const store = yeniStore();
    const sonuc = await store.dispatch(sahurSayacAyarlariniYukle());
    // Thunk fırlatmamalı: fulfilled olmalı, hata state'e yansımamalı
    expect(sonuc.type).toBe(sahurSayacAyarlariniYukle.fulfilled.type);
    const state = store.getState().sahurSayac;
    expect(state.ayarlar.aktif).toBe(false);
    expect(state.hata).toBeNull();
  });

  test('pending sırasında yukleniyor=true ve önceki hata temizlenir', () => {
    // Önce rejected ile hata bırak, sonra pending ile temizlendiğini gör
    const hataliState = reducer(undefined, {
      type: sahurSayacAyarlariniYukle.rejected.type,
      error: { message: 'eski hata' },
    });
    expect(hataliState.hata).toBe('eski hata');

    const pendingState = reducer(hataliState, {
      type: sahurSayacAyarlariniYukle.pending.type,
    });
    expect(pendingState.yukleniyor).toBe(true);
    expect(pendingState.hata).toBeNull();
  });

  test('rejected mesajsız hata için varsayılan mesaj kullanılır', () => {
    const state = reducer(undefined, {
      type: sahurSayacAyarlariniYukle.rejected.type,
      error: {},
    });
    expect(state.yukleniyor).toBe(false);
    expect(state.hata).toBe('Ayarlar yüklenemedi');
  });
});

describe('sahurSayacAyariniGuncelle (thunk + reducer)', () => {
  test('kısmi ayar mevcut state ile birleşir ve diske yazılır', async () => {
    const store = yeniStore();
    // Başlangıç aktif:false → guncelle aktif:true
    const sonuc = await store.dispatch(sahurSayacAyariniGuncelle({ aktif: true }));

    expect(sonuc.type).toBe(sahurSayacAyariniGuncelle.fulfilled.type);
    // State güncellendi
    expect(store.getState().sahurSayac.ayarlar.aktif).toBe(true);
    // Diske doğru değer yazıldı (yan etki)
    expect(mockStore.get(KEY)).toBe(JSON.stringify({ aktif: true }));
  });

  test('aktif:false ile geri kapatma diske yansır', async () => {
    const store = yeniStore();
    await store.dispatch(sahurSayacAyariniGuncelle({ aktif: true }));
    await store.dispatch(sahurSayacAyariniGuncelle({ aktif: false }));
    expect(store.getState().sahurSayac.ayarlar.aktif).toBe(false);
    expect(mockStore.get(KEY)).toBe(JSON.stringify({ aktif: false }));
  });

  test('boş kısmi ayar mevcut değeri korur (merge davranışı)', async () => {
    const store = yeniStore();
    await store.dispatch(sahurSayacAyariniGuncelle({ aktif: true }));
    // Boş güncelleme: mevcut aktif:true korunmalı
    await store.dispatch(sahurSayacAyariniGuncelle({}));
    expect(store.getState().sahurSayac.ayarlar.aktif).toBe(true);
  });

  test('setItem fırlatınca thunk rejected olur, hata state e yazılır, ayarlar değişmez', async () => {
    const store = yeniStore();
    mockSetItemHata = new Error('disk dolu');

    const sonuc = await store.dispatch(sahurSayacAyariniGuncelle({ aktif: true }));

    expect(sonuc.type).toBe(sahurSayacAyariniGuncelle.rejected.type);
    const state = store.getState().sahurSayac;
    // Yazma başarısız → ayar eski değerinde kalmalı
    expect(state.ayarlar.aktif).toBe(false);
    expect(state.hata).toBe('disk dolu');
    // Diske bir şey yazılmadı
    expect(mockStore.has(KEY)).toBe(false);
  });

  test('rejected mesajsız hata için varsayılan mesaj kullanılır', () => {
    const state = reducer(undefined, {
      type: sahurSayacAyariniGuncelle.rejected.type,
      error: {},
    });
    expect(state.hata).toBe('Ayar güncellenemedi');
  });

  test('fulfilled ayarlar payload ı doğrudan state e yazar', () => {
    const state = reducer(undefined, {
      type: sahurSayacAyariniGuncelle.fulfilled.type,
      payload: { aktif: true },
    });
    expect(state.ayarlar).toEqual({ aktif: true });
  });
});

describe('yukle ve guncelle birlikte (uçtan uca akış)', () => {
  test('guncelle ile yazılan değer sonraki yukle ile geri okunur', async () => {
    const store1 = yeniStore();
    await store1.dispatch(sahurSayacAyariniGuncelle({ aktif: true }));

    // Yeni bir store aynı diskten yüklesin
    const store2 = yeniStore();
    await store2.dispatch(sahurSayacAyarlariniYukle());
    expect(store2.getState().sahurSayac.ayarlar.aktif).toBe(true);
    // AsyncStorage gerçekten okundu
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(KEY);
  });
});
