/**
 * Konum Slice Testleri
 * Redux state yonetimi icin birim testleri
 */

import konumReducer, {
    konumAyarlariniGuncelle,
    koordinatlariGuncelle,
    gpsAdresiniGuncelle,
    yuklemeDurumunuAyarla,
    konumStateSifirla,
    konumAyarlariniYukle,
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
        it('GPS adresini guncellemeli', () => {
            const yeniAdres: GpsAdres = { semt: 'Alsancak', ilce: 'Konak', il: 'İzmir' };
            const state = konumReducer(varsayilanState, gpsAdresiniGuncelle(yeniAdres));

            expect(state.gpsAdres?.semt).toBe('Alsancak');
            expect(state.gpsAdres?.ilce).toBe('Konak');
            expect(state.gpsAdres?.il).toBe('İzmir');
        });

        it('GPS adresini null yapabilmeli', () => {
            const oncekiState = { ...varsayilanState, gpsAdres: { semt: 'Test', ilce: 'Test', il: 'Test' } };
            const state = konumReducer(oncekiState, gpsAdresiniGuncelle(null));

            expect(state.gpsAdres).toBeNull();
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
});
