const mockOku = jest.fn();
const mockYaz = jest.fn();
jest.mock('../../../data/local/Depolama', () => ({
  Depolama: { oku: (...a: unknown[]) => mockOku(...a), yaz: (...a: unknown[]) => mockYaz(...a) },
}));
jest.mock('../../../core/utils/Logger', () => ({ Logger: { error: jest.fn(), warn: jest.fn() } }));

import { configureStore } from '@reduxjs/toolkit';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import reducer, {
  sorunBildirildi,
  taniModaliKapat,
  hatirlatmaAyariniYukle,
  hatirlatmayiGuncelle,
} from '../taniSlice';

const ilk = reducer(undefined, { type: '@@INIT' });

function testStoruKur() {
  return configureStore({ reducer: { tani: reducer } });
}

describe('taniSlice', () => {
  test('başlangıç durumu', () => {
    expect(ilk).toEqual({ sorunAlgilandi: false, baglam: null, hatirlatmaAcik: true, oturumdaGosterildi: false });
  });

  test('sorunBildirildi → flag + bağlam set', () => {
    const s = reducer(ilk, sorunBildirildi('Kaza yüklenemedi'));
    expect(s.sorunAlgilandi).toBe(true);
    expect(s.baglam).toBe('Kaza yüklenemedi');
  });

  test('taniModaliKapat → oturumdaGosterildi=true, sorunAlgilandi=false', () => {
    const acik = reducer(ilk, sorunBildirildi('x'));
    const s = reducer(acik, taniModaliKapat());
    expect(s.sorunAlgilandi).toBe(false);
    expect(s.oturumdaGosterildi).toBe(true);
  });

  test('oturumda ikinci kez gösterilmez', () => {
    let s = reducer(ilk, sorunBildirildi('a'));
    s = reducer(s, taniModaliKapat());
    s = reducer(s, sorunBildirildi('b'));
    expect(s.oturumdaGosterildi).toBe(true);
  });
});

describe('taniSlice — hatırlatma thunk\'ları', () => {
  beforeEach(() => jest.clearAllMocks());

  test('hatirlatmaAyariniYukle: null → true (güvenli varsayılan)', async () => {
    mockOku.mockResolvedValue(null);
    const store = testStoruKur();
    await store.dispatch(hatirlatmaAyariniYukle());
    expect(store.getState().tani.hatirlatmaAcik).toBe(true);
  });

  test('hatirlatmaAyariniYukle: false → false', async () => {
    mockOku.mockResolvedValue(false);
    const store = testStoruKur();
    await store.dispatch(hatirlatmaAyariniYukle());
    expect(store.getState().tani.hatirlatmaAcik).toBe(false);
  });

  test('hatirlatmaAyariniYukle: okuma reddolursa → true (güvenli varsayılan)', async () => {
    mockOku.mockRejectedValue(new Error('disk'));
    const store = testStoruKur();
    await store.dispatch(hatirlatmaAyariniYukle());
    expect(store.getState().tani.hatirlatmaAcik).toBe(true);
  });

  test('hatirlatmayiGuncelle: Depolama anahtarına yazar + fulfilled state set', async () => {
    mockYaz.mockResolvedValue(undefined);
    const store = testStoruKur();
    await store.dispatch(hatirlatmayiGuncelle(false));
    expect(mockYaz).toHaveBeenCalledWith(DEPOLAMA_ANAHTARLARI.TANI_HATIRLATMA_ACIK, false);
    expect(store.getState().tani.hatirlatmaAcik).toBe(false);
  });

  test('hatirlatmayiGuncelle: yazım reddolursa state değişmez', async () => {
    mockYaz.mockRejectedValue(new Error('disk'));
    const store = testStoruKur();
    const oncekiDeger = store.getState().tani.hatirlatmaAcik;
    await store.dispatch(hatirlatmayiGuncelle(false));
    expect(store.getState().tani.hatirlatmaAcik).toBe(oncekiDeger);
  });
});
