/**
 * Arka Plan Gorev Servisi - Konum Takip Onarim / Nabiz Testleri
 *
 * HİBRİT tasarımın güvenlik ağı ayağı. Birincil yol olay tabanlıdır (geofence);
 * bu 15 dakikalık görev onun iki bilinen boşluğunu kapatır:
 *   (a) sessiz kurulum hatası / reboot sonrası silinen bölge → ONARIM
 *   (b) hareketsiz kullanıcıda hiç olay olmaması → NABIZ
 * Ayrıca sürüm geçişinde dirilen eski foreground-service görevini temizler.
 *
 * Kapsanan senaryolar:
 * 1. Surum gecisi: eski (kalici bildirimli) gorev durdurulur
 * 2. Bolge sagliklyken nabiz atilir, bolgeye DOKUNULMAZ
 * 3. Bolge olmusse yeniden kurulur (reboot / app kill / sessiz hata)
 * 4. Kullanici izni iptal ettiginde graceful deactivation
 * 5. Manuel modda / hic aktif edilmemisse atlanir
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
    startGeofencingAsync: jest.fn(() => Promise.resolve()),
    stopGeofencingAsync: jest.fn(() => Promise.resolve()),
    getCurrentPositionAsync: jest.fn(),
    startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
    reverseGeocodeAsync: jest.fn(),
    Accuracy: { Lowest: 1, Low: 2, Balanced: 3, High: 4, Highest: 5 },
    ActivityType: { Other: 1 },
    LocationGeofencingEventType: { Enter: 1, Exit: 2 },
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
    BackgroundFetchResult: { NewData: 2, NoData: 1, Failed: 3 },
    BackgroundFetchStatus: { Restricted: 1, Denied: 2, Available: 3 },
}));

import { arkaplandanKonumTakibiniYenidenBaslat } from '../ArkaplanGorevServisi';
import { KONUM_TAKIP_GOREVI, KONUM_GEOFENCE_GOREVI, AKTIF_BOLGE_KIMLIGI } from '../KonumTakipServisi';

const KONUM_TAKIP_AYARLARI_ANAHTAR = '@namaz_akisi/konum_takip_ayarlari';
const KONUM_DEPOLAMA_ANAHTARI = '@namaz_akisi/konum_ayarlari';

/**
 * Gorev kayit durumunu GOREV ADINA gore ayarlar.
 * Tek bir mockResolvedValue yetmez: hem eski gorev temizligi hem bolge kontrolu
 * ayni fonksiyonu FARKLI adlarla cagirir.
 */
function gorevKayitDurumu({ eski = false, bolge = false }: { eski?: boolean; bolge?: boolean }): void {
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockImplementation((ad: string) => {
        if (ad === KONUM_TAKIP_GOREVI) return Promise.resolve(eski);
        if (ad === KONUM_GEOFENCE_GOREVI) return Promise.resolve(bolge);
        return Promise.resolve(false);
    });
}

/** Takip aktif + oto mod + izinler tamam: standart mutlu zemin */
function aktifTakipKur(konumEk: Record<string, unknown> = {}): void {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
            return Promise.resolve(JSON.stringify({ aktif: true }));
        }
        if (key === KONUM_DEPOLAMA_ANAHTARI) {
            return Promise.resolve(JSON.stringify({ konumModu: 'oto', ...konumEk }));
        }
        return Promise.resolve(null);
    });
}

/** Taze zaman damgali sahte konum */
function tazeKonum(lat: number, lng: number) {
    return {
        coords: { latitude: lat, longitude: lng, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
    };
}

describe('arkaplandanKonumTakibiniYenidenBaslat', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // clearAllMocks IMPLEMENTASYONU silmez; her testte temiz zemin kur.
        (Location.startGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(41.0082, 28.9784));
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        gorevKayitDurumu({ eski: false, bolge: false });
    });

    // ==========================================
    // SENARYO 1: SURUM GECISI (kalici bildirim)
    // ==========================================
    describe('surum gecisi - eski foreground service li gorev temizligi', () => {
        it('KRITIK: eski gorev kayitliysa AYAR KONTROLLERINDEN BAGIMSIZ durdurulmali', async () => {
            // expo-task-manager MY_PACKAGE_REPLACED yayininda kayitli gorevleri geri
            // yukler -> guncelleme sonrasi eski gorev ve kalici bildirimi DIRILIR.
            // Kullanici uygulamayi hic acmasa bile bu gorev onu temizlemeli; bu yuzden
            // temizlik en basta ve "takip aktif mi" kontrolunden ONCE calisir.
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // hic aktif edilmemis
            gorevKayitDurumu({ eski: true, bolge: false });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(KONUM_TAKIP_GOREVI);
        });

        it('eski gorev kayitli DEGILSE durdurma denenmemeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
            gorevKayitDurumu({ eski: false, bolge: false });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 2: Kullanici hic aktif etmemis
    // ==========================================
    describe('kullanici hic akilli takip etkinlestirmemisse', () => {
        it('takip ayarlari yoksa bolge kurulmamalı', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
            expect(Location.getBackgroundPermissionsAsync).not.toHaveBeenCalled();
        });

        it('takip aktif: false ise bolge kurulmamalı', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: false }));
                }
                return Promise.resolve(null);
            });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 3: Manuel mod - takibe gerek yok
    // ==========================================
    describe('manuel modda', () => {
        it('konum modu manuel ise bolge kurulmamali ve nabiz atilmamali', async () => {
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

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
            expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 4: Izin iptal edilmis
    // ==========================================
    describe('izin iptal senaryolari', () => {
        it('arka plan izni iptal edilmisse takibi devre disi birakmalı', async () => {
            aktifTakipKur();
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
            const kayit = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_TAKIP_AYARLARI_ANAHTAR
            );
            expect(kayit).toBeDefined();
            expect(JSON.parse(kayit![1])).toMatchObject({ aktif: false });
        });

        it('on plan izni iptal edilmisse takibi devre disi birakmalı', async () => {
            aktifTakipKur();
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
            const kayit = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_TAKIP_AYARLARI_ANAHTAR
            );
            expect(kayit).toBeDefined();
            expect(JSON.parse(kayit![1])).toMatchObject({ aktif: false });
        });
    });

    // ==========================================
    // SENARYO 5: Bolge saglikli -> yalniz NABIZ
    // ==========================================
    describe('bolge kayitli (saglikli)', () => {
        it('bolgeye DOKUNMAMALI ve konum sabitlemesi ALMAMALI (pil)', async () => {
            aktifTakipKur();
            gorevKayitDurumu({ eski: false, bolge: true });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
            // Nabiz atmak icin GPS acmak, olay tabanli tasarimin pil kazancini yok ederdi
            expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
        });

        it('NABIZ: sonGpsGuncellemesi tazelenmeli (ekran "gun once guncellendi" demesin)', async () => {
            // Hareketsiz kullanicida hic geofence olayi olmaz. Nabiz atilmazsa Konum
            // Ayarlari ekrani gunlerce bayat bir zaman gosterir ve kullanici takibi
            // bozuk sanir. Bu yazim eski periyodik yolun esik-alti daliyla ayni anlami tasir.
            aktifTakipKur({ koordinatlar: { lat: 41.0, lng: 29.0 } });
            gorevKayitDurumu({ eski: false, bolge: true });

            await arkaplandanKonumTakibiniYenidenBaslat();

            const yazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_DEPOLAMA_ANAHTARI
            );
            expect(yazma).toBeDefined();
            const yazilan = JSON.parse(yazma![1]);
            expect(typeof yazilan.sonGpsGuncellemesi).toBe('string');
            expect(Number.isFinite(new Date(yazilan.sonGpsGuncellemesi).getTime())).toBe(true);
        });

        it('NABIZ koordinatlara DOKUNMAMALI ve bilinmeyen alanlari korumali', async () => {
            aktifTakipKur({
                koordinatlar: { lat: 41.0, lng: 29.0 },
                gpsAdres: { semt: '', ilce: 'Kadikoy', il: 'Istanbul' },
                bilinmeyenAlan: 'korunmali',
            });
            gorevKayitDurumu({ eski: false, bolge: true });

            await arkaplandanKonumTakibiniYenidenBaslat();

            const yazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_DEPOLAMA_ANAHTARI
            );
            const yazilan = JSON.parse(yazma![1]);
            expect(yazilan.koordinatlar).toEqual({ lat: 41.0, lng: 29.0 });
            expect(yazilan.gpsAdres.ilce).toBe('Kadikoy');
            expect(yazilan.bilinmeyenAlan).toBe('korunmali');
        });

        it('takip ayarlari aktif:false yapilMAMALI (graceful deactivation yalniz izin iptalinde)', async () => {
            aktifTakipKur();
            gorevKayitDurumu({ eski: false, bolge: true });

            await arkaplandanKonumTakibiniYenidenBaslat();

            const ayarYazimi = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_TAKIP_AYARLARI_ANAHTAR
            );
            expect(ayarYazimi).toBeUndefined();
        });
    });

    // ==========================================
    // SENARYO 6: Bolge olmus -> ONARIM
    // (reboot / app kill / sessiz kurulum hatasi)
    // ==========================================
    describe('bolge olmus - onarim', () => {
        it('bolge kayitli degilse TAZE konum merkezli yeniden kurmali', async () => {
            aktifTakipKur();
            (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(39.9208, 32.8541));

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [expect.objectContaining({
                    identifier: AKTIF_BOLGE_KIMLIGI,
                    latitude: 39.9208,
                    longitude: 32.8541,
                    radius: 5000, // dengeli profil
                    notifyOnEnter: false,
                    notifyOnExit: true,
                })],
            );
        });

        it('taze konum alinamazsa KAYITLI koordinata dusup yine kurmali', async () => {
            // Kayitli koordinatla kurulan bolge, kullanici uzaktaysa aninda bir cikis
            // olayi uretir — bu ISTENEN kurtarma davranisidir (olay yolu merkezi duzeltir).
            aktifTakipKur({ koordinatlar: { lat: 41.0369, lng: 28.9850 } });
            (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS kapali'));

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [expect.objectContaining({ latitude: 41.0369, longitude: 28.9850 })],
            );
        });

        it('ne taze konum ne kayitli koordinat varsa kurulum ERTELENMELI (cokmemeli)', async () => {
            aktifTakipKur(); // koordinat yok
            (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS kapali'));

            await expect(arkaplandanKonumTakibiniYenidenBaslat()).resolves.toBeUndefined();

            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        });

        it('hassas profil kayitliysa 2km yaricapla kurmali', async () => {
            aktifTakipKur({ takipHassasiyeti: 'hassas' });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [expect.objectContaining({ radius: 2000 })],
            );
            // Tek seferlik sabitleme profil dogrulugunu kullanmali
            expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 3 });
        });

        it('pil_dostu profil kayitliysa 10km yaricapla kurmali', async () => {
            aktifTakipKur({ takipHassasiyeti: 'pil_dostu' });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [expect.objectContaining({ radius: 10000 })],
            );
        });

        it('gecersiz takipHassasiyeti degeri varsayilan dengeli profile dusmeli', async () => {
            aktifTakipKur({ takipHassasiyeti: 'gecersizDeger' });

            await arkaplandanKonumTakibiniYenidenBaslat();

            const cagri = (Location.startGeofencingAsync as jest.Mock).mock.calls[0];
            expect(cagri).toBeDefined();
            expect(cagri![1][0].radius).toBe(5000);
            expect(cagri![1][0].radius).not.toBeUndefined();
        });
    });

    // ==========================================
    // SENARYO 7: Hata dayanikliligi
    // ==========================================
    describe('hata dayanikliligi', () => {
        it('startGeofencingAsync basarisiz olursa hata firlatmamali', async () => {
            aktifTakipKur();
            (Location.startGeofencingAsync as jest.Mock).mockRejectedValue(
                new Error('Location services unavailable')
            );

            await expect(arkaplandanKonumTakibiniYenidenBaslat()).resolves.toBeUndefined();
        });

        it('AsyncStorage hatasi olursa hata firlatmamali ve bolge kurulmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage error'));

            await expect(arkaplandanKonumTakibiniYenidenBaslat()).resolves.toBeUndefined();

            // Fail-safe: depolama okunamadiginda izin/ayar bilinemez,
            // dolayisiyla konum takibi ASLA baslatilmamali (gizlilik/izin guvenli tarafi).
            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
            expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 8: Konum ayarlari hic kaydedilmemis (depolama bos)
    // `if (konumAyarlariJson)` guard'i falsy'de manuel-mod kontrolunu ATLAR ->
    // takip yine de onarilir. Guard yanlislikla erken return'e cevrilirse
    // (`if (!konumAyarlariJson) return`) bu test kirilir.
    // ==========================================
    describe('konum ayarlari hic kaydedilmemis (depolama null)', () => {
        it('konum depolamasi null iken manuel-mod kapisi atlanir ve bolge kurulur', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                return Promise.resolve(null);
            });

            await arkaplandanKonumTakibiniYenidenBaslat();

            expect(Location.startGeofencingAsync).toHaveBeenCalledTimes(1);
            // Konum ayarlari okunamadigindan varsayilan (dengeli) profil kullanilmali
            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [expect.objectContaining({ radius: 5000 })],
            );
        });
    });
});
