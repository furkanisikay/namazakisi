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
            // Depoda seviye bilgisi YOK; uretim kodu seviyeyi 1'e default'lamali
            const kayitliAyarlar: VakitSayacAyarlari = { aktif: true };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitliAyarlar));

            await store.dispatch(vakitSayacAyarlariniYukle());
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(true);
            // typeof-number kontrolu (slice satir 49-52): seviye gelmediginde 1'e dusmeli.
            // Bu default dali kirilirsa (or. undefined birakilirsa) test FAIL eder.
            expect(state.ayarlar.sayacBaslangicSeviyesi).toBe(1);
            expect(state.yukleniyor).toBe(false);
        });

        it('AsyncStorage dolu ise kayitli seviyeyi korur', async () => {
            // Depoda gecerli bir seviye var; round-trip ile aynen korunmali
            const kayitliAyarlar: VakitSayacAyarlari = { aktif: true, sayacBaslangicSeviyesi: 3 };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitliAyarlar));

            await store.dispatch(vakitSayacAyarlariniYukle());
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(true);
            // Seviye 1'e zorla ezilirse (preserve dali kirilirsa) test FAIL eder.
            expect(state.ayarlar.sayacBaslangicSeviyesi).toBe(3);
            expect(state.yukleniyor).toBe(false);
        });

        it('AsyncStorage dolu ama seviye bozuk ise 1 e default lar', async () => {
            // Bozuk (sayi olmayan) seviye degeri; typeof-number guard bunu 1'e cevirmeli
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
                JSON.stringify({ aktif: true, sayacBaslangicSeviyesi: 'bozuk' })
            );

            await store.dispatch(vakitSayacAyarlariniYukle());
            const state = store.getState().vakitSayac;

            expect(state.ayarlar.aktif).toBe(true);
            expect(state.ayarlar.sayacBaslangicSeviyesi).toBe(1);
        });

        it('yukleme sirasinda yukleniyor true olmali', () => {
            const state = vakitSayacReducer(undefined, {
                type: vakitSayacAyarlariniYukle.pending.type,
            });

            expect(state.yukleniyor).toBe(true);
            expect(state.hata).toBeNull();
        });

        it('AsyncStorage hatasi durumunda guvenli (kapali) varsayilana duser', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

            // Thunk depo okunamasa bile reddetmemeli (fulfilled olmali);
            // hata yutulup guvenli varsayilan doner.
            const sonuc = await store.dispatch(vakitSayacAyarlariniYukle());
            expect(sonuc.type).toBe(vakitSayacAyarlariniYukle.fulfilled.type);

            const state = store.getState().vakitSayac;

            // Sozlesme: depo okunamadiginda sayac ASLA acik kalmamali (guvenli taraf).
            // catch dali aktif:true donerse veya istisnayi yukari sizdirirse test FAIL eder.
            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            // Hata yutuldugu icin slice hatasi set edilmemeli (rejected'a dusmemeli).
            expect(state.hata).toBeNull();
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
                JSON.stringify({ aktif: true, sayacBaslangicSeviyesi: 1 })
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
                JSON.stringify({ aktif: false, sayacBaslangicSeviyesi: 1 })
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
