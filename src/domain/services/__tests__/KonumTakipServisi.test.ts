/**
 * Konum Takip Servisi Testleri
 * Arka plan konum takibi icin birim testleri
 */

import { KonumTakipServisi, KONUM_TAKIP_GOREVI } from '../KonumTakipServisi';
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
    getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined' })),
    requestBackgroundPermissionsAsync: jest.fn(),
    getBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined', canAskAgain: true })),
    startLocationUpdatesAsync: jest.fn(),
    stopLocationUpdatesAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
    Accuracy: {
        Balanced: 3,
    },
    ActivityType: {
        Other: 1,
    },
}));

// TaskManager mock
jest.mock('expo-task-manager', () => ({
    defineTask: jest.fn(),
    isTaskRegisteredAsync: jest.fn(),
}));

// ArkaplanMuhafizServisi mock
jest.mock('../ArkaplanMuhafizServisi', () => ({
    ArkaplanMuhafizServisi: {
        getInstance: jest.fn(() => ({
            yapilandirVePlanla: jest.fn(),
        })),
    },
}));

describe('KonumTakipServisi', () => {
    let servis: KonumTakipServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        // Singleton'i sifirla
        (KonumTakipServisi as any).instance = undefined;
        servis = KonumTakipServisi.getInstance();
    });

    describe('Singleton Pattern', () => {
        it('her zaman ayni instance donmeli', () => {
            const instance1 = KonumTakipServisi.getInstance();
            const instance2 = KonumTakipServisi.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('baslat', () => {
        it('on plan izni reddedilirse false donmeli', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(false);
            expect(Location.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
        });

        it('arka plan izni reddedilirse false donmeli', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(false);
        });

        it('gorev zaten kayitliysa yeni gorev baslatmamali', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(true);
            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        });

        it('tum izinler varsa konum takibini baslatmali', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(true);
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    accuracy: Location.Accuracy.Balanced,
                    distanceInterval: 5000, // 5km
                    timeInterval: 900000, // 15 dakika
                })
            );
        });

        it('basarili baslatmada ayarlari kaydetmeli', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

            await servis.baslat();

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_takip_ayarlari',
                expect.stringContaining('"aktif":true')
            );
        });
    });

    describe('durdur', () => {
        it('gorev kayitliysa durdurmali', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
            (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

            await servis.durdur();

            expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(KONUM_TAKIP_GOREVI);
        });

        it('gorev kayitli degilse stopLocationUpdatesAsync cagirmamali', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await servis.durdur();

            expect(Location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
        });

        it('ayarlari aktif:false olarak guncellemeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
            (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
                aktif: true,
                sonKoordinatlar: null,
                sonGuncellemeTarihi: null,
            }));

            await servis.durdur();

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_takip_ayarlari',
                expect.stringContaining('"aktif":false')
            );
        });
    });

    describe('aktifMi', () => {
        it('gorev kayitliysa true donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            const sonuc = await servis.aktifMi();

            expect(sonuc).toBe(true);
        });

        it('gorev kayitli degilse false donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            const sonuc = await servis.aktifMi();

            expect(sonuc).toBe(false);
        });

        it('hata durumunda false donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(new Error('Test hatasi'));

            const sonuc = await servis.aktifMi();

            expect(sonuc).toBe(false);
        });
    });

    describe('arkaPlanIzniVarMi', () => {
        it('izin varsa true donmeli', async () => {
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });

            const sonuc = await servis.arkaPlanIzniVarMi();

            expect(sonuc).toBe(true);
        });

        it('izin yoksa false donmeli', async () => {
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const sonuc = await servis.arkaPlanIzniVarMi();

            expect(sonuc).toBe(false);
        });

        it('hata durumunda false donmeli', async () => {
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Test'));

            const sonuc = await servis.arkaPlanIzniVarMi();

            expect(sonuc).toBe(false);
        });
    });

    describe('ayarlariGetir', () => {
        it('kayitli ayarlar varsa dondürmeli', async () => {
            const kayitliAyarlar = {
                aktif: true,
                sonKoordinatlar: { lat: 41.0082, lng: 28.9784 },
                sonGuncellemeTarihi: '2026-01-17T12:00:00.000Z',
            };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(kayitliAyarlar));

            const sonuc = await servis.ayarlariGetir();

            expect(sonuc.aktif).toBe(true);
            expect(sonuc.sonKoordinatlar?.lat).toBeCloseTo(41.0082);
        });

        it('kayitli ayar yoksa varsayilan donmeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const sonuc = await servis.ayarlariGetir();

            expect(sonuc.aktif).toBe(false);
            expect(sonuc.sonKoordinatlar).toBeNull();
            expect(sonuc.sonGuncellemeTarihi).toBeNull();
        });
    });

    describe('durumBilgisiGetir', () => {
        it('tum durum bilgilerini donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });

            const sonuc = await servis.durumBilgisiGetir();

            expect(sonuc.takipAktif).toBe(true);
            expect(sonuc.arkaPlanIzniVar).toBe(true);
            expect(sonuc.minimumMesafe).toBe(5000); // 5km
        });
    });
});

describe('Haversine Mesafe Hesaplama ve Sabitler', () => {
    // mesafeHesapla fonksiyonu private, bu yuzden dogrudan test edemiyoruz
    // Ancak servisin dogru ayarlarla calistigini test edebiliriz

    it('KONUM_TAKIP_GOREVI dogru tanimlanmali', () => {
        expect(KONUM_TAKIP_GOREVI).toBe('KONUM_TAKIP_GOREVI');
    });

    it('konum takibi dogru mesafe esigi ile baslatilmali (5km)', async () => {
        const servis = KonumTakipServisi.getInstance();

        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

        await servis.baslat();

        expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
            KONUM_TAKIP_GOREVI,
            expect.objectContaining({
                distanceInterval: 5000, // 5km minimum mesafe
            })
        );
    });

    it('konum takibi dogru zaman araligi ile baslatilmali (15dk)', async () => {
        (KonumTakipServisi as any).instance = undefined;
        const servis = KonumTakipServisi.getInstance();

        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

        await servis.baslat();

        expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
            KONUM_TAKIP_GOREVI,
            expect.objectContaining({
                timeInterval: 900000, // 15 dakika (saniye * 1000)
            })
        );
    });
});

describe('Konum Takip Entegrasyon Senaryolari', () => {
    let servis: KonumTakipServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        (KonumTakipServisi as any).instance = undefined;
        servis = KonumTakipServisi.getInstance();
    });

    it('tam yasam dongusu: baslat -> durum kontrol -> durdur', async () => {
        // Izinleri ver
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

        // Baslat
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        const baslatSonuc = await servis.baslat();
        expect(baslatSonuc).toBe(true);

        // Durum kontrol (artik aktif)
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
        const durum = await servis.durumBilgisiGetir();
        expect(durum.takipAktif).toBe(true);

        // Durdur
        await servis.durdur();
        expect(Location.stopLocationUpdatesAsync).toHaveBeenCalled();
    });

    it('izin reddedildiginde kullanici bilgilendirilmeli', async () => {
        // On plan izni ver, arka plan izni reddet
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

        const sonuc = await servis.baslat();

        expect(sonuc).toBe(false);
        // Konum takibi baslatilmamali
        expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
    });
});
