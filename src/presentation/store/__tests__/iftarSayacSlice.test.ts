/**
 * Iftar Sayac Slice Testleri
 * Redux state yonetimi icin birim testleri
 */

import { configureStore } from '@reduxjs/toolkit';
import iftarSayacReducer, {
    iftarSayacAyarlariniYukle,
    iftarSayacAyariniGuncelle,
    IftarSayacAyarlari,
} from '../iftarSayacSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

describe('iftarSayacSlice', () => {
    let store: ReturnType<typeof storeOlustur>;

    function storeOlustur() {
        return configureStore({
            reducer: { iftarSayac: iftarSayacReducer },
        });
    }

    beforeEach(() => {
        store = storeOlustur();
        jest.clearAllMocks();
    });

    describe('Baslangic State', () => {
        it('varsayilan state dogru olmali', () => {
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
        });
    });

    describe('iftarSayacAyarlariniYukle', () => {
        it('AsyncStorage bossa varsayilan ayarlari yukler', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
        });

        it('AsyncStorage dolu ise kayitli ayarlari yukler', async () => {
            const kayitliAyarlar: IftarSayacAyarlari = { aktif: true };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitliAyarlar));

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(true);
            expect(state.yukleniyor).toBe(false);
        });

        it('yukleme sirasinda yukleniyor true olmali', () => {
            const state = iftarSayacReducer(undefined, {
                type: iftarSayacAyarlariniYukle.pending.type,
            });

            expect(state.yukleniyor).toBe(true);
            expect(state.hata).toBeNull();
        });

        it('AsyncStorage hatasi durumunda varsayilan ayarlari doner', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
        });
    });

    describe('iftarSayacAyariniGuncelle', () => {
        it('ayari gunceller ve AsyncStorage e kaydeder', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            await store.dispatch(iftarSayacAyariniGuncelle({ aktif: true }));
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(true);
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'iftar_sayac_ayarlari',
                JSON.stringify({ aktif: true })
            );
        });

        it('ayari kapatinca AsyncStorage e kaydeder', async () => {
            // Once aktif et
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
            await store.dispatch(iftarSayacAyariniGuncelle({ aktif: true }));

            // Sonra kapat
            await store.dispatch(iftarSayacAyariniGuncelle({ aktif: false }));
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
                'iftar_sayac_ayarlari',
                JSON.stringify({ aktif: false })
            );
        });

        it('guncelleme hatasi durumunda hata mesaji ayarlanmali', async () => {
            (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));

            await store.dispatch(iftarSayacAyariniGuncelle({ aktif: true }));
            const state = store.getState().iftarSayac;

            expect(state.hata).toBeTruthy();
        });
    });
});
