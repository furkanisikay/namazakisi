/**
 * Ozellikler Slice Testleri
 * Yeni özellik duyuru durumu (görülen / kart kapatılan) yönetimi
 */

import { configureStore } from '@reduxjs/toolkit';
import ozelliklerReducer, {
    ozellikleriYukle,
    ozellikGorulduIsaretle,
    ozellikKartiKapat,
} from '../ozelliklerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

describe('ozelliklerSlice', () => {
    function storeOlustur() {
        return configureStore({
            reducer: { ozellikler: ozelliklerReducer },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({ serializableCheck: false }),
        });
    }

    let store: ReturnType<typeof storeOlustur>;

    beforeEach(() => {
        store = storeOlustur();
        jest.clearAllMocks();
    });

    it('başlangıç state boş dizilerle başlar', () => {
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual([]);
        expect(state.kapatilanKartIdler).toEqual([]);
        expect(state.yuklendi).toBe(false);
    });

    it('AsyncStorage boşsa varsayılan boş durum yüklenir ve yuklendi=true olur', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
        await store.dispatch(ozellikleriYukle());
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual([]);
        expect(state.yuklendi).toBe(true);
    });

    it('kayıtlı durum yüklenir', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
            JSON.stringify({ gorulenIdler: ['a'], kapatilanKartIdler: ['b'] })
        );
        await store.dispatch(ozellikleriYukle());
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual(['a']);
        expect(state.kapatilanKartIdler).toEqual(['b']);
    });

    it('eksik alanlı kayıt güvenli şekilde merge edilir', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
            JSON.stringify({ gorulenIdler: ['x'] })
        );
        await store.dispatch(ozellikleriYukle());
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toEqual(['x']);
        expect(state.kapatilanKartIdler).toEqual([]);
    });

    it('ozellikGorulduIsaretle tek id ekler ve kaydeder', async () => {
        await store.dispatch(ozellikGorulduIsaretle('takvim-entegrasyonu'));
        const state = store.getState().ozellikler;
        expect(state.gorulenIdler).toContain('takvim-entegrasyonu');
        expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('ozellikGorulduIsaretle dizi kabul eder ve tekrarları teklestirir', async () => {
        await store.dispatch(ozellikGorulduIsaretle(['a', 'b']));
        await store.dispatch(ozellikGorulduIsaretle(['b', 'c']));
        const state = store.getState().ozellikler;
        expect([...state.gorulenIdler].sort()).toEqual(['a', 'b', 'c']);
    });

    it('ozellikKartiKapat kartı kapatır ama görülenleri etkilemez', async () => {
        await store.dispatch(ozellikKartiKapat('takvim-entegrasyonu'));
        const state = store.getState().ozellikler;
        expect(state.kapatilanKartIdler).toContain('takvim-entegrasyonu');
        expect(state.gorulenIdler).toEqual([]);
    });
});
