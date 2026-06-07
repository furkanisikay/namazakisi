
import { configureStore } from '@reduxjs/toolkit';
import namazReducer, { namazDurumunuDegistir, namazlariYukle } from '../presentation/store/namazSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazAdi } from '../core/constants/UygulamaSabitleri';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));


describe('Offline Namaz Entegrasyon Testi (Redux namazSlice <-> LocalStorage)', () => {
    let store: any;
    const mockDate = '2025-05-15';

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Store setup — bu test dosyasi yalnizca namazSlice <-> LocalStorage
        // round-trip'ini dogrular; seri/bildirim/konum zinciri burada kapsam disi.
        store = configureStore({
            reducer: {
                namaz: namazReducer,
            },
        });
    });


    test('Namaz durumu değiştirildiğinde AsyncStorage güncellenmeli', async () => {
        // 0. Mock initial load to populate state
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
            [mockDate]: { 'Sabah': false }
        }));
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 1. Dispatch action to toggle prayer status
        await store.dispatch(namazDurumunuDegistir({
            tarih: mockDate,
            namazAdi: 'Sabah' as NamazAdi,
            tamamlandi: true
        }));

        // 2. Verify state update
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();
        expect(gunlukData!.tarih).toBe(mockDate);
        expect(gunlukData!.namazlar.find((n: any) => n.namazAdi === 'Sabah')?.tamamlandi).toBe(true);

        // 3. Verify AsyncStorage interaction
        // It saves to "namaz_verileri" key
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        const callArgs = (AsyncStorage.setItem as jest.Mock).mock.lastCall;

        // First arg is key (namaz_verileri), we don't check exact string content of key if we use constant, 
        // but based on logs it is likely "namaz_verileri". 
        // Second arg is validated
        expect(callArgs[1]).toContain(mockDate); // The JSON content should have the date key
        expect(callArgs[1]).toContain('"Sabah":true'); // The JSON content should have the updated status
    });

    test('Namazlar yüklendiğinde AsyncStorage verisi okunmalı', async () => {
        // 1. Storage'da var olan veriyi mock'la.
        //    Anahtarlar NamazAdi enum degerleridir (Turkce karakterli: 'Öğle', 'İkindi', ...).
        //    Storage'da string anahtar olarak Turkce karakterli saklanir; bunlarin storage'dan
        //    DOGRU sekilde okunup state'e tasindigini (round-trip) dogrularız.
        const mockStorageData = JSON.stringify({
            [mockDate]: {
                [NamazAdi.Sabah]: true,
                [NamazAdi.Ogle]: true,    // 'Öğle' Turkce anahtar round-trip
                [NamazAdi.Ikindi]: false,
                [NamazAdi.Aksam]: true,   // 'Akşam' Turkce anahtar round-trip
                [NamazAdi.Yatsi]: false,
            }
        });

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockStorageData);

        // 2. Dispatch load action
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 3. Verify AsyncStorage was queried
        // LocalNamazServisi uses DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI
        expect(AsyncStorage.getItem).toHaveBeenCalled();

        // 4. State, storage'daki BES vaktin tamamiyla beslenmis olmali.
        //    Sadece 'Sabah' (ASCII) degil; Turkce-karakterli enum anahtarlarinin da
        //    true/false olarak dogru okundugunu net assert ediyoruz. Uretimdeki
        //    `tarihVerileri[namazAdi] || false` fallback'i, kirik bir anahtar aramasini
        //    sessizce false'a cevirip regresyonu gizleyebilir; bu yuzden true beklenen
        //    Turkce anahtarlar (Öğle/Akşam) round-trip'i fiilen kanitlar.
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();

        const bul = (ad: NamazAdi) =>
            gunlukData!.namazlar.find((n: any) => n.namazAdi === ad)?.tamamlandi;
        expect(bul(NamazAdi.Sabah)).toBe(true);
        expect(bul(NamazAdi.Ogle)).toBe(true);    // 'Öğle' Turkce anahtar round-trip
        expect(bul(NamazAdi.Ikindi)).toBe(false);
        expect(bul(NamazAdi.Aksam)).toBe(true);   // 'Akşam' Turkce anahtar round-trip
        expect(bul(NamazAdi.Yatsi)).toBe(false);
    });


    test('Olmayan veri yüklendiğinde varsayılan yapı oluşturulmalı', async () => {
        // 1. Mock no data (null)
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        // 2. Dispatch load action
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 3. Verify state has default structure (all false)
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();
        expect(gunlukData!.namazlar).toHaveLength(5);
        expect(gunlukData!.namazlar.every((n: any) => n.tamamlandi === false)).toBe(true);
    });
});
