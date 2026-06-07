/**
 * Konum Slice Testleri
 * Redux state yonetimi icin birim testleri
 */

import { configureStore } from '@reduxjs/toolkit';
import konumReducer, {
    konumAyarlariniGuncelle,
    koordinatlariGuncelle,
    gpsAdresiniGuncelle,
    yuklemeDurumunuAyarla,
    konumStateSifirla,
    konumAyarlariniYukle,
    konumAyarlariniKaydetAsync,
    konumVerileriniTemizleAsync,
    KonumState,
    KonumModu,
    GpsAdres,
    Koordinatlar,
} from '../konumSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

describe('konumSlice', () => {
    // Varsayilan state
    const varsayilanState: KonumState = {
        konumModu: 'manuel',
        seciliSehirId: '34',
        seciliIlId: 34,
        seciliIlceId: null,
        seciliIlAdi: 'Istanbul',
        seciliIlceAdi: '',
        gpsAdres: null,
        koordinatlar: {
            lat: 41.0082,
            lng: 28.9784,
        },
        yukleniyor: false,
        sonGpsGuncellemesi: null,
        akilliTakipAktif: false,
        takipHassasiyeti: 'dengeli',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Baslangic State', () => {
        it('varsayilan state dogru olmali', () => {
            const state = konumReducer(undefined, { type: 'unknown' });

            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlId).toBe(34);
            expect(state.seciliIlAdi).toBe('Istanbul');
            expect(state.koordinatlar.lat).toBeCloseTo(41.0082);
            expect(state.koordinatlar.lng).toBeCloseTo(28.9784);
            expect(state.yukleniyor).toBe(false);
            expect(state.akilliTakipAktif).toBe(false);
        });
    });

    describe('konumAyarlariniGuncelle', () => {
        it('konum modunu guncellemeli', () => {
            const yeniMod: KonumModu = 'oto';
            const state = konumReducer(varsayilanState, konumAyarlariniGuncelle({ konumModu: yeniMod }));

            expect(state.konumModu).toBe('oto');
            expect(AsyncStorage.setItem).toHaveBeenCalled();
        });

        it('il ve ilce bilgilerini guncellemeli', () => {
            const state = konumReducer(
                varsayilanState,
                konumAyarlariniGuncelle({
                    seciliIlId: 6,
                    seciliIlAdi: 'Ankara',
                    seciliIlceId: 100,
                    seciliIlceAdi: 'Çankaya',
                })
            );

            expect(state.seciliIlId).toBe(6);
            expect(state.seciliIlAdi).toBe('Ankara');
            expect(state.seciliIlceId).toBe(100);
            expect(state.seciliIlceAdi).toBe('Çankaya');
        });

        it('koordinatlarla birlikte GPS adresini guncellemeli', () => {
            const yeniKoordinatlar: Koordinatlar = { lat: 39.9334, lng: 32.8597 };
            const yeniGpsAdres: GpsAdres = { semt: 'Merkez', ilce: 'Çankaya', il: 'Ankara' };

            const state = konumReducer(
                varsayilanState,
                konumAyarlariniGuncelle({
                    koordinatlar: yeniKoordinatlar,
                    gpsAdres: yeniGpsAdres,
                    sonGpsGuncellemesi: '2026-01-17T12:00:00.000Z',
                })
            );

            expect(state.koordinatlar.lat).toBeCloseTo(39.9334);
            expect(state.koordinatlar.lng).toBeCloseTo(32.8597);
            expect(state.gpsAdres?.il).toBe('Ankara');
            expect(state.sonGpsGuncellemesi).toBe('2026-01-17T12:00:00.000Z');
        });

        it('akilli takip durumunu guncellemeli', () => {
            const state = konumReducer(
                varsayilanState,
                konumAyarlariniGuncelle({ akilliTakipAktif: true })
            );

            expect(state.akilliTakipAktif).toBe(true);
        });

        it('AsyncStorage\'a kaydetmeli', () => {
            konumReducer(varsayilanState, konumAyarlariniGuncelle({ konumModu: 'oto' }));

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_ayarlari',
                expect.any(String)
            );

            // Kaydedilen icerigi dogrula: gercek veri persist edildi mi
            const [anahtar, json] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
            expect(anahtar).toBe('@namaz_akisi/konum_ayarlari');
            const kaydedilen = JSON.parse(json);
            expect(kaydedilen.konumModu).toBe('oto');
            // Transient 'yukleniyor' alani storage'a sizmamali (reducer ayikliyor)
            expect(kaydedilen.yukleniyor).toBeUndefined();
        });
    });

    describe('koordinatlariGuncelle', () => {
        it('sadece koordinatlari guncellemeli', () => {
            const yeniKoordinatlar: Koordinatlar = { lat: 38.4237, lng: 27.1428 };
            const state = konumReducer(varsayilanState, koordinatlariGuncelle(yeniKoordinatlar));

            expect(state.koordinatlar.lat).toBeCloseTo(38.4237);
            expect(state.koordinatlar.lng).toBeCloseTo(27.1428);
            // Diger degerler degismemeli
            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlAdi).toBe('Istanbul');
        });
    });

    describe('gpsAdresiniGuncelle', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        it('GPS adresini guncellemeli', () => {
            // Saati sabitle: yan etki olan sonGpsGuncellemesi mutlak degerle dogrulanabilsin
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-01-17T12:00:00.000Z'));

            const yeniAdres: GpsAdres = { semt: 'Alsancak', ilce: 'Konak', il: 'İzmir' };
            const state = konumReducer(varsayilanState, gpsAdresiniGuncelle(yeniAdres));

            expect(state.gpsAdres?.semt).toBe('Alsancak');
            expect(state.gpsAdres?.ilce).toBe('Konak');
            expect(state.gpsAdres?.il).toBe('İzmir');

            // Adres set edildiginde sonGpsGuncellemesi YAN ETKI olarak guncellenmeli
            // (uretim: payload truthy ise new Date().toISOString())
            expect(varsayilanState.sonGpsGuncellemesi).toBeNull();
            expect(state.sonGpsGuncellemesi).toBe('2026-01-17T12:00:00.000Z');
        });

        it('GPS adresini null yapabilmeli', () => {
            // Onceki state'te gecerli bir timestamp tohumla; null payload bunu KORUMALI
            const oncekiState: KonumState = {
                ...varsayilanState,
                gpsAdres: { semt: 'Test', ilce: 'Test', il: 'Test' },
                sonGpsGuncellemesi: '2026-01-17T12:00:00.000Z',
            };
            const state = konumReducer(oncekiState, gpsAdresiniGuncelle(null));

            expect(state.gpsAdres).toBeNull();
            // Adres null'lanırken zaman damgasi DEGISMEMELI (uretim: payload falsy -> set etme)
            expect(state.sonGpsGuncellemesi).toBe('2026-01-17T12:00:00.000Z');
        });
    });

    describe('yuklemeDurumunuAyarla', () => {
        it('yukleniyor durumunu true yapmali', () => {
            const state = konumReducer(varsayilanState, yuklemeDurumunuAyarla(true));

            expect(state.yukleniyor).toBe(true);
        });

        it('yukleniyor durumunu false yapmali', () => {
            const oncekiState = { ...varsayilanState, yukleniyor: true };
            const state = konumReducer(oncekiState, yuklemeDurumunuAyarla(false));

            expect(state.yukleniyor).toBe(false);
        });
    });

    describe('konumStateSifirla', () => {
        it('state\'i varsayilana dondürmeli', () => {
            const degismisState: KonumState = {
                ...varsayilanState,
                konumModu: 'oto',
                seciliIlId: 6,
                seciliIlAdi: 'Ankara',
                akilliTakipAktif: true,
            };

            const state = konumReducer(degismisState, konumStateSifirla());

            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlId).toBe(34);
            expect(state.seciliIlAdi).toBe('Istanbul');
            expect(state.akilliTakipAktif).toBe(false);
        });

        it('AsyncStorage\'dan silmeli', () => {
            konumReducer(varsayilanState, konumStateSifirla());

            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@namaz_akisi/konum_ayarlari');
        });
    });

    describe('konumAyarlariniYukle (async thunk)', () => {
        it('pending durumunda yukleniyor true olmali', () => {
            const state = konumReducer(varsayilanState, {
                type: konumAyarlariniYukle.pending.type,
            });

            expect(state.yukleniyor).toBe(true);
        });

        it('fulfilled durumunda verileri yuklemeli', () => {
            const yuklenenVeri: Partial<KonumState> = {
                konumModu: 'oto',
                seciliIlId: 35,
                seciliIlAdi: 'İzmir',
                koordinatlar: { lat: 38.4237, lng: 27.1428 },
            };

            const state = konumReducer(varsayilanState, {
                type: konumAyarlariniYukle.fulfilled.type,
                payload: yuklenenVeri,
            });

            expect(state.yukleniyor).toBe(false);
            expect(state.konumModu).toBe('oto');
            expect(state.seciliIlId).toBe(35);
            expect(state.seciliIlAdi).toBe('İzmir');
        });

        it('fulfilled durumunda null payload ile mevcut state kalmali', () => {
            const state = konumReducer(varsayilanState, {
                type: konumAyarlariniYukle.fulfilled.type,
                payload: null,
            });

            expect(state.yukleniyor).toBe(false);
            expect(state.konumModu).toBe('manuel');
        });

        it('rejected durumunda yukleniyor false olmali', () => {
            const state = konumReducer(
                { ...varsayilanState, yukleniyor: true },
                { type: konumAyarlariniYukle.rejected.type }
            );

            expect(state.yukleniyor).toBe(false);
        });
    });

    describe('Konum Senaryolari', () => {
        it('GPS moduna gecis senaryosu', () => {
            // 1. GPS moduna gec
            let state = konumReducer(varsayilanState, konumAyarlariniGuncelle({ konumModu: 'oto' }));
            expect(state.konumModu).toBe('oto');

            // 2. GPS koordinatlarini guncelle
            state = konumReducer(state, koordinatlariGuncelle({ lat: 40.9876, lng: 29.0123 }));
            expect(state.koordinatlar.lat).toBeCloseTo(40.9876);

            // 3. GPS adresini guncelle
            state = konumReducer(state, gpsAdresiniGuncelle({ semt: 'Kadikoy', ilce: 'Kadikoy', il: 'Istanbul' }));
            expect(state.gpsAdres?.ilce).toBe('Kadikoy');

            // 4. Son guncelleme zamanini kaydet
            const simdi = new Date().toISOString();
            state = konumReducer(state, konumAyarlariniGuncelle({ sonGpsGuncellemesi: simdi }));
            expect(state.sonGpsGuncellemesi).toBe(simdi);
        });

        it('Manuel moda geri donus senaryosu', () => {
            // GPS modunda basla
            const gpsState: KonumState = {
                ...varsayilanState,
                konumModu: 'oto',
                koordinatlar: { lat: 40.9876, lng: 29.0123 },
                gpsAdres: { semt: 'Test', ilce: 'Test', il: 'Test' },
                akilliTakipAktif: true,
            };

            // Manuel moda gec ve akilli takibi kapat
            const state = konumReducer(
                gpsState,
                konumAyarlariniGuncelle({
                    konumModu: 'manuel',
                    seciliIlId: 6,
                    seciliIlAdi: 'Ankara',
                    akilliTakipAktif: false,
                })
            );

            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlId).toBe(6);
            expect(state.akilliTakipAktif).toBe(false);
            // GPS adresi hala mevcut (temizlenmemeli)
            expect(state.gpsAdres).not.toBeNull();
        });

        it('Akilli takip senaryosu', () => {
            // 1. GPS modunu aktif et
            let state = konumReducer(varsayilanState, konumAyarlariniGuncelle({ konumModu: 'oto' }));

            // 2. Akilli takibi aktif et
            state = konumReducer(state, konumAyarlariniGuncelle({ akilliTakipAktif: true }));
            expect(state.akilliTakipAktif).toBe(true);

            // 3. Konum degisti (arka plan guncellemesi simule)
            state = konumReducer(state, konumAyarlariniGuncelle({
                koordinatlar: { lat: 39.9334, lng: 32.8597 }, // Ankara
                gpsAdres: { semt: '', ilce: 'Cankaya', il: 'Ankara' },
                sonGpsGuncellemesi: new Date().toISOString(),
            }));

            expect(state.koordinatlar.lat).toBeCloseTo(39.9334);
            expect(state.gpsAdres?.il).toBe('Ankara');
        });
    });

    // Gercek thunk govdesini calistirmak icin RTK store kur.
    // Boylece getState/dispatch/async akis (sadece elle action degil) test edilir.
    const storeOlustur = () =>
        configureStore({
            reducer: { konum: konumReducer },
        });

    describe('konumAyarlariniKaydetAsync (gercek thunk akisi)', () => {
        it('mevcut ayarlari payload ile birlestirip storage\'a yazmali ve state\'i guncellemeli', async () => {
            const store = storeOlustur();

            // Baslangic: varsayilan (Istanbul, manuel). Sadece bir alt kume gonder.
            await store.dispatch(
                konumAyarlariniKaydetAsync({ konumModu: 'oto', seciliIlAdi: 'Ankara' })
            );

            const state = store.getState().konum;
            // Payload uygulandi
            expect(state.konumModu).toBe('oto');
            expect(state.seciliIlAdi).toBe('Ankara');
            // Gonderilmeyen alanlar mevcut ayarlardan KORUNDU (merge dogrulugu)
            expect(state.seciliIlId).toBe(34);
            expect(state.koordinatlar.lat).toBeCloseTo(41.0082);

            // Storage'a, birlestirilmis ayar yazildi
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_ayarlari',
                expect.any(String)
            );
            const sonCagri = (AsyncStorage.setItem as jest.Mock).mock.calls.at(-1);
            const kaydedilen = JSON.parse(sonCagri[1]);
            expect(kaydedilen.konumModu).toBe('oto');
            expect(kaydedilen.seciliIlAdi).toBe('Ankara');
            expect(kaydedilen.seciliIlId).toBe(34);
            // Transient 'yukleniyor' alani hem mevcut hem yeni ayardan stripleniyor
            expect(kaydedilen.yukleniyor).toBeUndefined();
        });

        it('fulfilled state\'e yukleniyor alanini sizdirmamali (storage temiz kalmali)', async () => {
            const store = storeOlustur();
            // yukleniyor:true tohumla (pending), sonra kaydet -> yukleniyor storage'a gitmemeli
            store.dispatch(yuklemeDurumunuAyarla(true));

            await store.dispatch(konumAyarlariniKaydetAsync({ seciliIlAdi: 'Bursa' }));

            const sonCagri = (AsyncStorage.setItem as jest.Mock).mock.calls.at(-1);
            const kaydedilen = JSON.parse(sonCagri[1]);
            expect(kaydedilen.yukleniyor).toBeUndefined();
            expect(kaydedilen.seciliIlAdi).toBe('Bursa');
        });

        it('storage yazimi basarisiz olursa (setItem reject) state BOZULMAMALI', async () => {
            const store = storeOlustur();
            (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk dolu'));

            const sonuc = await store.dispatch(
                konumAyarlariniKaydetAsync({ konumModu: 'oto', seciliIlAdi: 'Ankara' })
            );

            // Thunk reddedildi
            expect(sonuc.type).toBe(konumAyarlariniKaydetAsync.rejected.type);
            // rejected reducer state'i degistirmemeli -> hala varsayilan
            const state = store.getState().konum;
            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlAdi).toBe('Istanbul');
        });
    });

    describe('konumVerileriniTemizleAsync (gercek thunk akisi)', () => {
        it('temizleme sonrasi state tam varsayilana donmeli ve storage\'dan silinmeli', async () => {
            const store = storeOlustur();
            // Once state'i degistir (Ankara, oto, akilli takip)
            store.dispatch(
                konumAyarlariniGuncelle({
                    konumModu: 'oto',
                    seciliIlId: 6,
                    seciliIlAdi: 'Ankara',
                    akilliTakipAktif: true,
                })
            );
            expect(store.getState().konum.konumModu).toBe('oto');

            const sonuc = await store.dispatch(konumVerileriniTemizleAsync());
            expect(sonuc.type).toBe(konumVerileriniTemizleAsync.fulfilled.type);

            // State tamamen varsayilana dondu
            const state = store.getState().konum;
            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlId).toBe(34);
            expect(state.seciliIlAdi).toBe('Istanbul');
            expect(state.akilliTakipAktif).toBe(false);
            expect(state.koordinatlar.lat).toBeCloseTo(41.0082);

            // Storage'dan dogru anahtar silindi
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@namaz_akisi/konum_ayarlari');
        });
    });

    describe('konumAyarlariniYukle (gercek async yol)', () => {
        afterEach(() => {
            (AsyncStorage.getItem as jest.Mock).mockReset();
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        });

        it('storage okuma hata verirse thunk reddedilmeli ve yukleniyor false kalmali (state bozulmamali)', async () => {
            const store = storeOlustur();
            // getItem reject -> servis basarili:false -> thunk Error firlatir -> rejected
            (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('okuma hatasi'));

            const sonuc = await store.dispatch(konumAyarlariniYukle());

            expect(sonuc.type).toBe(konumAyarlariniYukle.rejected.type);
            const state = store.getState().konum;
            expect(state.yukleniyor).toBe(false);
            // Hata yolu varsayilan state'i bozmamali
            expect(state.konumModu).toBe('manuel');
            expect(state.seciliIlAdi).toBe('Istanbul');
        });

        it('storage\'da gecerli veri varsa onu yukleyip yukleniyor\'u kapatmali', async () => {
            const store = storeOlustur();
            const kayitliJson = JSON.stringify({
                ...varsayilanState,
                konumModu: 'oto',
                seciliIlId: 35,
                seciliIlAdi: 'İzmir',
                koordinatlar: { lat: 38.4237, lng: 27.1428 },
            });
            (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(kayitliJson);

            const sonuc = await store.dispatch(konumAyarlariniYukle());

            expect(sonuc.type).toBe(konumAyarlariniYukle.fulfilled.type);
            const state = store.getState().konum;
            expect(state.yukleniyor).toBe(false);
            expect(state.konumModu).toBe('oto');
            expect(state.seciliIlAdi).toBe('İzmir');
            expect(state.koordinatlar.lat).toBeCloseTo(38.4237);
        });
    });

    describe('Persistence yan etkisinin icerigi (koordinat / gps adres)', () => {
        it('koordinatlariGuncelle storage\'a YENI koordinati yazmali, yukleniyor sizdirmamali', () => {
            // Reducer icindeki localKonumAyarlariniKaydet senkron olarak (ilk await\'e kadar)
            // AsyncStorage.setItem\'i cagirir -> dispatch sonrasi mock dolu olur.
            konumReducer(varsayilanState, koordinatlariGuncelle({ lat: 38.4237, lng: 27.1428 }));

            expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
            const [anahtar, json] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
            expect(anahtar).toBe('@namaz_akisi/konum_ayarlari');
            const kaydedilen = JSON.parse(json);
            expect(kaydedilen.koordinatlar.lat).toBeCloseTo(38.4237);
            expect(kaydedilen.koordinatlar.lng).toBeCloseTo(27.1428);
            // Transient alan storage'a sizmamali
            expect(kaydedilen.yukleniyor).toBeUndefined();
        });

        it('gpsAdresiniGuncelle storage\'a adres + sonGpsGuncellemesi yazmali, yukleniyor sizdirmamali', () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-01-17T12:00:00.000Z'));

            const adres: GpsAdres = { semt: 'Alsancak', ilce: 'Konak', il: 'İzmir' };
            konumReducer(varsayilanState, gpsAdresiniGuncelle(adres));

            expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
            const [, json] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
            const kaydedilen = JSON.parse(json);
            expect(kaydedilen.gpsAdres).toEqual(adres);
            // Yan etki: adres truthy -> sonGpsGuncellemesi guncellendi ve storage'a yazildi
            expect(kaydedilen.sonGpsGuncellemesi).toBe('2026-01-17T12:00:00.000Z');
            expect(kaydedilen.yukleniyor).toBeUndefined();

            jest.useRealTimers();
        });

        it('gpsAdresiniGuncelle(null) storage\'a null adres yazmali ve onceki zaman damgasini KORUMALI', () => {
            const oncekiState: KonumState = {
                ...varsayilanState,
                gpsAdres: { semt: 'Test', ilce: 'Test', il: 'Test' },
                sonGpsGuncellemesi: '2026-01-17T12:00:00.000Z',
            };

            konumReducer(oncekiState, gpsAdresiniGuncelle(null));

            expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
            const [, json] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
            const kaydedilen = JSON.parse(json);
            expect(kaydedilen.gpsAdres).toBeNull();
            // null payload -> sonGpsGuncellemesi DEGISMEMELI (uretim: falsy ise koru)
            expect(kaydedilen.sonGpsGuncellemesi).toBe('2026-01-17T12:00:00.000Z');
        });
    });
});
