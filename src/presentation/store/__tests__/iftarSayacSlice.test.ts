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

        // Savunmaci mantik: `parsed?.aktif === true` SADECE literal true'yu kabul eder.
        // Beklenmedik/truthy degerler (string 'yes', sayi 1, bos obje) 'acik' olarak
        // yorumlanmamali; aksi halde kullanici ayari yanlislikla aktif kalir.
        it('aktif truthy ama true DEGIL ise (string "yes") aktif false olmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
                JSON.stringify({ aktif: 'yes' })
            );

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.hata).toBeNull();
        });

        it('aktif sayi 1 ise (truthy ama true degil) aktif false olmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
                JSON.stringify({ aktif: 1 })
            );

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
        });

        it('aktif alani hic yoksa (bos obje) aktif false olmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({}));

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
        });

        // Bozuk JSON: getItem gecerli string doner ama JSON.parse FIRLATIR.
        // Thunk ici try/catch bunu yakalayip { aktif: false } DONMELI (fulfilled yol),
        // reject ETMEMELI. Bu, getItem'in kendisinin reddettigi yoldan (yukaridaki test)
        // farkli bir daldir.
        it('getItem bozuk JSON dondurdugunde varsayilan ayarlari doner ve hata set etmez', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('bozuk-json{');

            await store.dispatch(iftarSayacAyarlariniYukle());
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
        });

        // Reducer'in rejected dali (state.hata atamasi) izole olarak test edilir.
        // Thunk normalde catch ile fulfilled doner, bu yuzden bu dal dogrudan
        // rejected action tipiyle uyarilmali.
        it('yukle rejected oldugunda hata mesaji set edilmeli', () => {
            const state = iftarSayacReducer(undefined, {
                type: iftarSayacAyarlariniYukle.rejected.type,
                error: { message: 'Yukleme basarisiz' },
            });

            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBe('Yukleme basarisiz');
        });

        it('yukle rejected oldugunda mesaj yoksa varsayilan hata metni kullanilir', () => {
            const state = iftarSayacReducer(undefined, {
                type: iftarSayacAyarlariniYukle.rejected.type,
                error: {},
            });

            expect(state.hata).toBe('Ayarlar yüklenemedi');
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

        // Partial-merge kontrati: thunk `{ ...state.ayarlar, ...ayarlar }` ile mevcut
        // ayarlarin uzerine yazar. Bos/partial payload ({}) dispatch edildiginde mevcut
        // `aktif` degeri KORUNMALI (payload state'i komple ezmemeli). Bu, arayuz
        // ileride alan kazandiginda refactor guvenligi saglar.
        it('bos partial payload mevcut aktif degerini korur (merge davranisi)', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            // Once aktif et
            await store.dispatch(iftarSayacAyariniGuncelle({ aktif: true }));
            expect(store.getState().iftarSayac.ayarlar.aktif).toBe(true);

            // Bos payload ile guncelle: aktif degismeden true kalmali
            await store.dispatch(iftarSayacAyariniGuncelle({}));
            const state = store.getState().iftarSayac;

            expect(state.ayarlar.aktif).toBe(true);
            // Storage'a yazilan deger de korunan aktif:true icermeli
            expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
                'iftar_sayac_ayarlari',
                JSON.stringify({ aktif: true })
            );
        });
    });
});
