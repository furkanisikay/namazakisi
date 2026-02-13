/**
 * Arka Plan Gorev Servisi - Konum Takip Canlandirma Testleri
 *
 * Bu testler su senaryolari kapsar:
 * 1. Telefon yeniden baslatildiginda konum takibinin canlandirilmasi
 * 2. Uygulama OS tarafindan olduruldugunde konum takibinin canlandirilmasi
 * 3. Kullanici izni iptal ettiginde graceful deactivation
 * 4. Manuel modda konum takibinin atlanmasi
 * 5. Konum takibi hic aktif edilmemisse atlanmasi
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
}));

// Expo Location mock
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestBackgroundPermissionsAsync: jest.fn(),
    getBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    reverseGeocodeAsync: jest.fn(),
    Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5 },
    ActivityType: { Other: 1 },
}));

// TaskManager mock
jest.mock('expo-task-manager', () => ({
    defineTask: jest.fn(),
    isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
}));

// ArkaplanMuhafizServisi mock
jest.mock('../ArkaplanMuhafizServisi', () => ({
    ArkaplanMuhafizServisi: {
        getInstance: jest.fn(() => ({
            yapilandirVePlanla: jest.fn(),
        })),
    },
}));

// expo-background-fetch mock
jest.mock('expo-background-fetch', () => ({
    registerTaskAsync: jest.fn(),
    unregisterTaskAsync: jest.fn(),
    getStatusAsync: jest.fn(),
    BackgroundFetchResult: {
        NewData: 2,
        NoData: 1,
        Failed: 3,
    },
    BackgroundFetchStatus: {
        Restricted: 1,
        Denied: 2,
        Available: 3,
    },
}));

import { arkaplandanKonumTakibiniYenidenBaslat } from '../ArkaplanGorevServisi';
import { KONUM_TAKIP_GOREVI } from '../KonumTakipServisi';

const KONUM_TAKIP_AYARLARI_ANAHTAR = '@namaz_akisi/konum_takip_ayarlari';
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

describe('arkaplandanKonumTakibiniYenidenBaslat', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ==========================================
    // SENARYO 1: Kullanici hic aktif etmemis
    // ==========================================
    describe('kullanici hic akilli takip etkinlestirmemisse', () => {
        it('takip ayarlari yoksa hicbir sey yapmamalı', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
            expect(Location.getBackgroundPermissionsAsync).not.toHaveBeenCalled();
        });

        it('takip aktif: false ise hicbir sey yapmamalı', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: false }));
                }
                return Promise.resolve(null);
            });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 2: Manuel mod - takibe gerek yok
    // ==========================================
    describe('manuel modda', () => {
        it('konum modu manuel ise konum takibi baslatmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'manuel' }));
                }
                return Promise.resolve(null);
            });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 3: Izin iptal edilmis
    // ==========================================
    describe('izin iptal senaryolari', () => {
        it('arka plan izni iptal edilmisse takibi devre disi birakmalı', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'oto' }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            await arkaplandanKonumTakibiniYenidenBaslat();

            // Konum takibi baslatilmamali
            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
            // Ayarlar aktif: false olarak guncellenmeli
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                KONUM_TAKIP_AYARLARI_ANAHTAR,
                expect.stringContaining('"aktif":false')
            );
        });

        it('on plan izni iptal edilmisse takibi devre disi birakmalı', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'oto' }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                KONUM_TAKIP_AYARLARI_ANAHTAR,
                expect.stringContaining('"aktif":false')
            );
        });
    });

    // ==========================================
    // SENARYO 4: Gorev hala calisiyor
    // ==========================================
    describe('gorev hala aktif', () => {
        it('gorev kayitliysa yeniden baslatmamali (zaten calisiyor)', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'oto' }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            await arkaplandanKonumTakibiniYenidenBaslat();

            // Gorev zaten calisiyor, startLocationUpdatesAsync cagrilmamali
            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 5: KRITIK - Gorev olmus, yeniden baslat!
    // (telefon reboot, app kill, OS kill)
    // ==========================================
    describe('gorev olmus - canlandirma (telefon reboot / app kill)', () => {
        it('gorev olmusse yeniden baslatmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'oto' }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            // KRITIK: Gorev kayitli DEGIL (olmus)
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await arkaplandanKonumTakibiniYenidenBaslat();

            // Yeniden baslatilmali (varsayilan dengeli profil: dogruluk=2, mesafe=5000, zaman=900)
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    accuracy: 2, // Accuracy.Low (dengeli profil)
                    pausesUpdatesAutomatically: false,
                    distanceInterval: 5000,
                    timeInterval: 900000,
                })
            );
        });

        it('foreground service ayarlarini dogru gecirmeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'oto' }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    foregroundService: expect.objectContaining({
                        notificationTitle: 'Namaz Akışı',
                        notificationBody: 'Şehir değişikliğini takip ediyor',
                    }),
                })
            );
        });
    });

    // ==========================================
    // SENARYO 5b: Profil ile canlandirma
    // ==========================================
    describe('profil tabanli canlandirma', () => {
        it('hassas profil kayitliysa hassas profil ayarlariyla yeniden baslatmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({
                        konumModu: 'oto',
                        takipHassasiyeti: 'hassas',
                    }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    accuracy: 3, // Accuracy.Balanced (hassas profil)
                    distanceInterval: 2000, // 2km
                    timeInterval: 300000, // 5 dakika
                    pausesUpdatesAutomatically: false,
                })
            );
        });

        it('pil_dostu profil kayitliysa pil_dostu ayarlariyla yeniden baslatmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({
                        konumModu: 'oto',
                        takipHassasiyeti: 'pil_dostu',
                    }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    accuracy: 2, // Accuracy.Low (pil_dostu profil)
                    distanceInterval: 10000, // 10km
                    timeInterval: 1800000, // 30 dakika
                    pausesUpdatesAutomatically: true,
                })
            );
        });
    });

    // ==========================================
    // SENARYO 6: Hata dayanikliligi
    // ==========================================
    describe('hata dayanikliligi', () => {
        it('startLocationUpdatesAsync basarisiz olursa hata firlatmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({ konumModu: 'oto' }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.startLocationUpdatesAsync as jest.Mock).mockRejectedValue(
                new Error('Location services unavailable')
            );

            // Hata firlatmamali (catch etmeli)
            await expect(arkaplandanKonumTakibiniYenidenBaslat()).resolves.toBeUndefined();
        });

        it('AsyncStorage hatasi olursa hata firlatmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
                new Error('AsyncStorage error')
            );

            await expect(arkaplandanKonumTakibiniYenidenBaslat()).resolves.toBeUndefined();
        });
    });
});
