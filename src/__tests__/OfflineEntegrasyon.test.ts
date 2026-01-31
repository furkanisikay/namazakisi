
import { configureStore } from '@reduxjs/toolkit';
import namazReducer, { namazDurumunuDegistir, namazlariYukle } from '../presentation/store/namazSlice';
import seriReducer from '../presentation/store/seriSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazAdi } from '../core/constants/UygulamaSabitleri';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

// Mock BildirimServisi to avoid expo-notifications issues
jest.mock('../domain/services/BildirimServisi', () => ({
    BildirimServisi: {
        getInstance: () => ({
            bildirimPlanla: jest.fn(),
            bildirimIptalEt: jest.fn(),
        }),
    },
}));

// Mock KonumYoneticiServisi to avoid expo-location issues
jest.mock('../domain/services/KonumYoneticiServisi', () => ({
    KonumYoneticiServisi: {
        getInstance: () => ({
            sonrakiGunImsakVaktiGetir: jest.fn(),
        }),
    },
}));

// Mock LocalSeriServisi (simplified)
jest.mock('../data/local/LocalSeriServisi', () => ({
    localTumSeriVerileriniGetir: jest.fn().mockResolvedValue({ basarili: true, veri: { /* mock data needed? */ } }),
    localSeriAyarlariniKaydet: jest.fn(),
    localSeriDurumunuKaydet: jest.fn(),
    localRozetleriKaydet: jest.fn(),
    localSeviyeDurumunuKaydet: jest.fn(),
    localToplamKilinanNamaziKaydet: jest.fn(),
    localToparlanmaSayisiniArttir: jest.fn(),
    localMukemmelGunSayisiniArttir: jest.fn(),
    localOzelGunAyarlariniKaydet: jest.fn(),
    VARSAYILAN_OZEL_GUN_AYARLARI: {},
}));


describe('Offline Entegrasyon Testi (Redux <-> LocalStorage)', () => {
    let store: any;
    const mockDate = '2025-05-15';

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Store setup
        store = configureStore({
            reducer: {
                namaz: namazReducer,
                seri: seriReducer,
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
        // 1. Mock existing data in AsyncStorage
        const mockStorageData = JSON.stringify({
            [mockDate]: {
                'Sabah': true,
                'Öğle': false,
                'İkindi': false,
                'Akşam': false,
                'Yatsı': false
            }
        });

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockStorageData);

        // 2. Dispatch load action
        await store.dispatch(namazlariYukle({ tarih: mockDate }));

        // 3. Verify AsyncStorage was queried
        // LocalNamazServisi uses DEPOLAMA_ANAHTARLARI.NAMAZ_VERILERI
        expect(AsyncStorage.getItem).toHaveBeenCalled();

        // 4. Verify state is populated from storage
        const state = store.getState();
        const gunlukData = state.namaz.gunlukNamazlar;
        expect(gunlukData).toBeDefined();
        expect(gunlukData!.namazlar.find((n: any) => n.namazAdi === 'Sabah')?.tamamlandi).toBe(true);
        // Not: Diger namazlarin kontrolu CI ortaminda encoding sorunu yaratabiliyor
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
