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
            // Sadece 'ogle' saklanir; imsak/ikindi/aksam/yatsi BILINCLI olarak EKSIK
            // birakilir ki uretimin merge-doldurma mantigi (takvimSlice.ts:80) gercekten
            // egzersiz edilsin. O satir silinirse bu test KIRILIR.
            const kayitli = {
                aktif: true,
                vakitAyarlari: {
                    ogle: { aktif: true, sureDakika: 10, baslangicTipi: 'vakit_oncesi', dakika: 15 },
                },
            } as unknown as Partial<TakvimAyarlari>;
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitli));

            await store.dispatch(takvimAyarlariniYukle());
            const state = store.getState().takvim;

            // Saklanan 'ogle' aynen korunur
            expect(state.ayarlar.vakitAyarlari.ogle).toEqual({
                aktif: true,
                sureDakika: 10,
                baslangicTipi: 'vakit_oncesi',
                dakika: 15,
            });

            // EKSIK vakitler VARSAYILAN_VAKIT_AYARI ile DOLDURULUR (merge-doldurma kaniti)
            (['imsak', 'ikindi', 'aksam', 'yatsi'] as const).forEach((vakit) => {
                expect(state.ayarlar.vakitAyarlari[vakit]).toEqual({
                    aktif: false,
                    sureDakika: 15,
                    baslangicTipi: 'vakit_girisi',
                    dakika: 5,
                });
            });
        });

        it('AsyncStorage hatasi durumunda state bozulmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

            await store.dispatch(takvimAyarlariniYukle());
            const state = store.getState().takvim;

            expect(state.ayarlar.aktif).toBe(false);
            expect(state.yukleniyor).toBe(false);
        });

        it('bozuk JSON kayitli oldugunda thunk FULFILLED olur ve varsayilan ayarlar korunur', async () => {
            // getItem REJECT etmiyor; gecerli string AMA bozuk JSON donuyor.
            // Bu, yukaridaki "Storage error" (reject) testinden FARKLI bir yol:
            // uretimdeki JSON.parse, try/catch ile sarmalanmis (takvimSlice.ts:72-89).
            // Catch null doner -> thunk FULFILLED biter (rejected DEGIL) ve fulfilled
            // handler null payload'i atamaz -> varsayilan ayarlar bozulmaz.
            // O try/catch silinirse JSON.parse firlatir, thunk REJECTED'a duser:
            // asagidaki "fulfilled" assertion'i KIRILIR. Bu, corrupt-storage
            // dayanikliligini gercekten koruyan ayirt edici testtir.
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{bozuk json: ');

            const sonuc = await store.dispatch(takvimAyarlariniYukle());

            // En kritik kanit: bozuk veride bile thunk patlamadan FULFILLED biter.
            expect(sonuc.type).toBe(takvimAyarlariniYukle.fulfilled.type);

            const state = store.getState().takvim;
            expect(state.ayarlar).toEqual(VARSAYILAN_TAKVIM_AYARLARI);
            expect(state.yukleniyor).toBe(false);
            expect(state.hata).toBeNull();
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

        it('kaydetme basarisiz olunca ayarlar ONCEKI degerinde KALIR (bozulmaz)', async () => {
            // Once basariyla bir ayar yaz: takvimId belirlensin, aktif=true olsun.
            (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);
            await store.dispatch(
                takvimAyarlariniGuncelle({ aktif: true, takvimId: 'cal-onceki', kaciGunIlerisi: 21 })
            );

            const oncekiAyarlar = store.getState().takvim.ayarlar;
            expect(oncekiAyarlar.aktif).toBe(true);
            expect(oncekiAyarlar.takvimId).toBe('cal-onceki');

            // Simdi kaydetme BASARISIZ olsun; ayarlar DEGISMEMELI, sadece hata yazilmali.
            // rejected handler (takvimSlice.ts:154-156) yalnizca state.hata set eder,
            // state.ayarlar'a DOKUNMAZ. Bir regression rejected'da ayarlari ezerse
            // (orn. optimistic-update geri alinmazsa) bu test KIRILIR.
            (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Write error'));
            await store.dispatch(
                takvimAyarlariniGuncelle({ aktif: false, takvimId: 'cal-yeni', kaciGunIlerisi: 99 })
            );

            const sonrakiAyarlar = store.getState().takvim.ayarlar;
            // Kullanicinin son gecerli ayarlari aynen korunmali (basarisiz degisiklik yutulmaz).
            expect(sonrakiAyarlar).toEqual(oncekiAyarlar);
            expect(sonrakiAyarlar.aktif).toBe(true);
            expect(sonrakiAyarlar.takvimId).toBe('cal-onceki');
            expect(sonrakiAyarlar.kaciGunIlerisi).toBe(21);
            expect(store.getState().takvim.hata).toBeTruthy();
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

        // NOT (atlanan kapsam): thunk'in TakvimServisi'ne ayarlar+koordinatlari AYNEN
        // ilettigini gercek dispatch ile dogrulamak istedik; ancak takvimSlice.ts:122
        // `await import('../../domain/services/TakvimServisi')` ile DINAMIK import yapiyor.
        // Bu jest yapilandirmasinda (babel-preset-expo + testEnvironment: node, ESM VM yok)
        // dinamik import jest.mock factory'sine BAGLANMIYOR; gercek modul yoluna gidip
        // "dynamic import callback was invoked without --experimental-vm-modules" ile
        // patliyor. Thunk govdesini calistirmak yalnizca uretim kodunu veya jest config'i
        // degistirerek mumkun -> gorev kapsami disi. Bu yuzden arguman-iletimi testi
        // EKLENMEDI; pending/fulfilled/rejected reducer gecisleri zaten yukarida kapsali.
    });
});
