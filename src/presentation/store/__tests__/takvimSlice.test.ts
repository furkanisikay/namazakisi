/**
 * Takvim Slice Testleri
 * Redux state yonetimi icin birim testleri
 */

import { configureStore } from '@reduxjs/toolkit';
import takvimReducer, {
    takvimAyarlariniYukle,
    takvimAyarlariniGuncelle,
    VARSAYILAN_TAKVIM_AYARLARI,
    type TakvimAyarlari,
    type VakitTakvimAyari,
} from '../takvimSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

// takvimOlaylariniOlustur TakvimServisi'ni dinamik import eder, mock'luyoruz
jest.mock('../../../domain/services/TakvimServisi', () => ({
    TakvimServisi: {
        getInstance: jest.fn(() => ({
            takvimOlaylariOlustur: jest.fn(() => Promise.resolve(14)),
        })),
    },
}));

describe('takvimSlice', () => {
    let store: ReturnType<typeof storeOlustur>;

    function storeOlustur() {
        return configureStore({
            reducer: { takvim: takvimReducer },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({ serializableCheck: false }),
        });
    }

    beforeEach(() => {
        store = storeOlustur();
        jest.clearAllMocks();
    });

    // ─── Başlangıç State ──────────────────────────────────────────────────────

    describe('Baslangic State', () => {
        it('varsayilan state dogru olmali', () => {
            const state = store.getState().takvim;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.ayarlar.takvimId).toBeNull();
            expect(state.ayarlar.kaciGunIlerisi).toBe(7);
            expect(state.yukleniyor).toBe(false);
            expect(state.olayOlusturuluyor).toBe(false);
            expect(state.hata).toBeNull();
        });

        it('tum vakitler varsayilan olarak pasif olmali', () => {
            const state = store.getState().takvim;
            const vakitler = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;

            vakitler.forEach(vakit => {
                expect(state.ayarlar.vakitAyarlari[vakit].aktif).toBe(false);
                expect(state.ayarlar.vakitAyarlari[vakit].baslangicTipi).toBe('vakit_girisi');
            });
        });
    });

    // ─── takvimAyarlariniYukle ────────────────────────────────────────────────

    describe('takvimAyarlariniYukle', () => {
        it('AsyncStorage bossa varsayilan state kalir', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            await store.dispatch(takvimAyarlariniYukle());
            const state = store.getState().takvim;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
        });

        it('kayitli ayarlar yuklenince state guncellenir', async () => {
            const kayitli: Partial<TakvimAyarlari> = {
                aktif: true,
                takvimId: 'test-cal-123',
                takvimAdi: 'Kişisel',
                kaciGunIlerisi: 14,
            };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitli));

            await store.dispatch(takvimAyarlariniYukle());
            const state = store.getState().takvim;

            expect(state.ayarlar.aktif).toBe(true);
            expect(state.ayarlar.takvimId).toBe('test-cal-123');
            expect(state.ayarlar.kaciGunIlerisi).toBe(14);
            expect(state.yukleniyor).toBe(false);
        });

        it('yuklemede eksik vakit ayarlari varsayilanla merge edilir', async () => {
            const kayitli: Partial<TakvimAyarlari> = {
                aktif: true,
                vakitAyarlari: {
                    ...VARSAYILAN_TAKVIM_AYARLARI.vakitAyarlari,
                    ogle: { aktif: true, sureDakika: 10, baslangicTipi: 'vakit_oncesi', dakika: 15 },
                },
            };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitli));

            await store.dispatch(takvimAyarlariniYukle());
            const state = store.getState().takvim;

            expect(state.ayarlar.vakitAyarlari.ogle.aktif).toBe(true);
            expect(state.ayarlar.vakitAyarlari.ogle.sureDakika).toBe(10);
            expect(state.ayarlar.vakitAyarlari.ogle.baslangicTipi).toBe('vakit_oncesi');
            // diger vakitler varsayilan kalmali
            expect(state.ayarlar.vakitAyarlari.ikindi.aktif).toBe(false);
        });

        it('AsyncStorage hatasi durumunda state bozulmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

            await store.dispatch(takvimAyarlariniYukle());
            const state = store.getState().takvim;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
        });

        it('yukleme pending aninda yukleniyor true olmali', () => {
            const state = takvimReducer(undefined, {
                type: takvimAyarlariniYukle.pending.type,
            });

            expect(state.yukleniyor).toBe(true);
        });
    });

    // ─── takvimAyarlariniGuncelle ─────────────────────────────────────────────

    describe('takvimAyarlariniGuncelle', () => {
        it('aktif bayragi guncellenir ve AsyncStorage e kaydedilir', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            await store.dispatch(takvimAyarlariniGuncelle({ aktif: true }));
            const state = store.getState().takvim;

            expect(state.ayarlar.aktif).toBe(true);
            expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
            const kaydedilen = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
            expect(kaydedilen.aktif).toBe(true);
        });

        it('takvimId secimi guncellenir', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            await store.dispatch(takvimAyarlariniGuncelle({ takvimId: 'cal-456', takvimAdi: 'İş' }));
            const state = store.getState().takvim;

            expect(state.ayarlar.takvimId).toBe('cal-456');
            expect(state.ayarlar.takvimAdi).toBe('İş');
        });

        it('kaciGunIlerisi degeri guncellenir', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            await store.dispatch(takvimAyarlariniGuncelle({ kaciGunIlerisi: 30 }));
            const state = store.getState().takvim;

            expect(state.ayarlar.kaciGunIlerisi).toBe(30);
        });

        it('vakit ayari guncellenince diger vakitler bozulmaz', async () => {
            (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

            const ogleAyari: VakitTakvimAyari = {
                aktif: true,
                sureDakika: 10,
                baslangicTipi: 'vakit_oncesi',
                dakika: 15,
            };

            await store.dispatch(takvimAyarlariniGuncelle({
                vakitAyarlari: {
                    ...VARSAYILAN_TAKVIM_AYARLARI.vakitAyarlari,
                    ogle: ogleAyari,
                },
            }));

            const state = store.getState().takvim;
            expect(state.ayarlar.vakitAyarlari.ogle.aktif).toBe(true);
            expect(state.ayarlar.vakitAyarlari.ogle.sureDakika).toBe(10);
            expect(state.ayarlar.vakitAyarlari.ogle.baslangicTipi).toBe('vakit_oncesi');
            expect(state.ayarlar.vakitAyarlari.imsak.aktif).toBe(false);
        });

        it('kaydetme hatasi durumunda hata state e yazilir', async () => {
            (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Write error'));

            await store.dispatch(takvimAyarlariniGuncelle({ aktif: true }));
            const state = store.getState().takvim;

            expect(state.hata).toBeTruthy();
        });
    });

    // ─── takvimOlaylariniOlustur ──────────────────────────────────────────────

    describe('takvimOlaylariniOlustur', () => {
        it('olay olusturma sirasinda olayOlusturuluyor true olmali', () => {
            const { takvimOlaylariniOlustur } = jest.requireActual('../takvimSlice');
            const state = takvimReducer(undefined, {
                type: takvimOlaylariniOlustur.pending.type,
            });

            expect(state.olayOlusturuluyor).toBe(true);
            expect(state.hata).toBeNull();
        });

        it('fulfilled olunca olayOlusturuluyor false olmali', () => {
            const { takvimOlaylariniOlustur } = jest.requireActual('../takvimSlice');
            const state = takvimReducer(undefined, {
                type: takvimOlaylariniOlustur.fulfilled.type,
                payload: { olusturulanSayi: 14 },
            });

            expect(state.olayOlusturuluyor).toBe(false);
        });

        it('rejected olunca olayOlusturuluyor false ve hata dolu olmali', () => {
            const { takvimOlaylariniOlustur } = jest.requireActual('../takvimSlice');
            const state = takvimReducer(undefined, {
                type: takvimOlaylariniOlustur.rejected.type,
                payload: 'Takvim izni reddedildi',
            });

            expect(state.olayOlusturuluyor).toBe(false);
            expect(state.hata).toBe('Takvim izni reddedildi');
        });
    });
});
