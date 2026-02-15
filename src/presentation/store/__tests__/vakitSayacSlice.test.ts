/**
 * Vakit Sayac Slice Testleri
 * Redux state yonetimi icin birim testleri
 */

import { configureStore } from '@reduxjs/toolkit';
import vakitSayacReducer, {
    vakitSayacAyarlariniYukle,
    vakitSayacAyariniGuncelle,
    VakitSayacAyarlari,
} from '../vakitSayacSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

describe('vakitSayacSlice', () => {
    let store: ReturnType<typeof storeOlustur>;

    function storeOlustur() {
        return configureStore({
            reducer: { vakitSayac: vakitSayacReducer },
        });
    }

    beforeEach(() => {
        store = storeOlustur();
        jest.clearAllMocks();
    });

    describe('Baslangic State', () => {
        it('varsayilan state dogru olmali', () => {
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
        });
    });

    describe('vakitSayacAyarlariniYukle', () => {
        it('AsyncStorage bossa varsayilan ayarlari yukler', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            await store.dispatch(vakitSayacAyarlariniYukle());
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
        });

        it('AsyncStorage dolu ise kayitli ayarlari yukler', async () => {
            const kayitliAyarlar: VakitSayacAyarlari = { aktif: true };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitliAyarlar));

            await store.dispatch(vakitSayacAyarlariniYukle());
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(true);
            expect(state.yukleniyor).toBe(false);
        });

        it('yukleme sirasinda yukleniyor true olmali', () => {
            const state = vakitSayacReducer(undefined, {
                type: vakitSayacAyarlariniYukle.pending.type,
            });

            expect(state.yukleniyor).toBe(true);
            expect(state.hata).toBeNull();
        });

        it('AsyncStorage hatasi durumunda varsayilan ayarlari doner', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

            await store.dispatch(vakitSayacAyarlariniYukle());
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
        });
    });

    describe('vakitSayacAyariniGuncelle', () => {
        it('ayari gunceller ve AsyncStorage e kaydeder', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            await store.dispatch(vakitSayacAyariniGuncelle({ aktif: true }));
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(true);
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'vakit_sayac_ayarlari',
                JSON.stringify({ aktif: true })
            );
        });

        it('ayari kapatinca AsyncStorage e kaydeder', async () => {
            // Once aktif et
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
            await store.dispatch(vakitSayacAyariniGuncelle({ aktif: true }));

            // Sonra kapat
            await store.dispatch(vakitSayacAyariniGuncelle({ aktif: false }));
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
                'vakit_sayac_ayarlari',
                JSON.stringify({ aktif: false })
            );
        });

        it('guncelleme hatasi durumunda hata mesaji ayarlanmali', async () => {
            (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));

            await store.dispatch(vakitSayacAyariniGuncelle({ aktif: true }));
            const state = store.getState().vakitSayac;

            expect(state.hata).toBeTruthy();
        });
    });
});
