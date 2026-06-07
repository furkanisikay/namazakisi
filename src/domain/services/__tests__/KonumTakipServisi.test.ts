/**
 * Konum Takip Servisi Testleri
 * Arka plan konum takibi icin birim testleri
 */

import { KonumTakipServisi, KONUM_TAKIP_GOREVI } from '../KonumTakipServisi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';

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
        Lowest: 1,
        Low: 2,
        Balanced: 3,
        High: 4,
        Highest: 5,
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

        it('gorev zaten kayitliysa once durdurup yeniden baslatmali', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
            (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
            (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(true);
            // Once mevcut gorevi durdurmali
            expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(KONUM_TAKIP_GOREVI);
            // Sonra yeniden baslatmali (varsayilan dengeli profil: dogruluk=2 Low)
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    accuracy: 2, // Accuracy.Low (dengeli profil)
                })
            );
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
                    accuracy: 2, // Accuracy.Low (varsayilan dengeli profil)
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

    describe('yenidenBaslat', () => {
        it('takip aktif degilse false donmeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
                aktif: false,
                sonKoordinatlar: null,
                sonGuncellemeTarihi: null,
            }));

            const sonuc = await servis.yenidenBaslat();

            expect(sonuc).toBe(false);
            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        });

        it('arka plan izni iptal edilmisse false donmeli ve takibi devre disi birakmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
                aktif: true,
                sonKoordinatlar: null,
                sonGuncellemeTarihi: null,
            }));
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const sonuc = await servis.yenidenBaslat();

            expect(sonuc).toBe(false);
            // Ayarlari aktif: false olarak guncellemeli (graceful deactivation)
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_takip_ayarlari',
                expect.stringContaining('"aktif":false')
            );
        });

        it('on plan izni iptal edilmisse false donmeli ve takibi devre disi birakmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
                aktif: true,
                sonKoordinatlar: null,
                sonGuncellemeTarihi: null,
            }));
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'denied',
            });

            const sonuc = await servis.yenidenBaslat();

            expect(sonuc).toBe(false);
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_takip_ayarlari',
                expect.stringContaining('"aktif":false')
            );
        });

        it('takip aktif ve izin varsa baslat cagirmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
                aktif: true,
                sonKoordinatlar: null,
                sonGuncellemeTarihi: null,
            }));
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
                status: 'granted',
            });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

            const sonuc = await servis.yenidenBaslat();

            expect(sonuc).toBe(true);
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalled();
        });
    });

    describe('sonKonumBilgisiniGetir', () => {
        it('konum ayarlari yoksa null donmeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const sonuc = await servis.sonKonumBilgisiniGetir();

            expect(sonuc).toBeNull();
        });

        it('manuel modda null donmeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
                konumModu: 'manuel',
                koordinatlar: { lat: 41.0082, lng: 28.9784 },
                sonGpsGuncellemesi: '2026-01-17T12:00:00.000Z',
            }));

            const sonuc = await servis.sonKonumBilgisiniGetir();

            expect(sonuc).toBeNull();
        });

        it('oto modda konum bilgisini donmeli', async () => {
            const konumVerisi = {
                konumModu: 'oto',
                koordinatlar: { lat: 39.9334, lng: 32.8597 },
                gpsAdres: { semt: '', ilce: 'Cankaya', il: 'Ankara' },
                sonGpsGuncellemesi: '2026-02-13T10:00:00.000Z',
            };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(konumVerisi));

            const sonuc = await servis.sonKonumBilgisiniGetir();

            expect(sonuc).not.toBeNull();
            expect(sonuc!.koordinatlar.lat).toBeCloseTo(39.9334);
            expect(sonuc!.koordinatlar.lng).toBeCloseTo(32.8597);
            expect(sonuc!.gpsAdres?.il).toBe('Ankara');
            expect(sonuc!.sonGpsGuncellemesi).toBe('2026-02-13T10:00:00.000Z');
        });
    });
});

describe('Konum Takip Ayarlari ve Sabitler', () => {
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

    it('konum takibi pausesUpdatesAutomatically false ile baslatilmali', async () => {
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
                pausesUpdatesAutomatically: false,
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

describe('Profil Sistemi', () => {
    let servis: KonumTakipServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        (KonumTakipServisi as any).instance = undefined;
        servis = KonumTakipServisi.getInstance();
    });

    it('hassas profil secildiginde dogru ayarlarla baslatmali', async () => {
        // Hassas profili AsyncStorage'da ayarla
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === '@namaz_akisi/konum_ayarlari') {
                return Promise.resolve(JSON.stringify({
                    takipHassasiyeti: 'hassas',
                    konumModu: 'oto',
                }));
            }
            if (key === '@namaz_akisi/konum_takip_ayarlari') {
                return Promise.resolve(null);
            }
            return Promise.resolve(null);
        });
        (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

        await servis.baslat();

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

    it('pil_dostu profil secildiginde dogru ayarlarla baslatmali', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === '@namaz_akisi/konum_ayarlari') {
                return Promise.resolve(JSON.stringify({
                    takipHassasiyeti: 'pil_dostu',
                    konumModu: 'oto',
                }));
            }
            if (key === '@namaz_akisi/konum_takip_ayarlari') {
                return Promise.resolve(null);
            }
            return Promise.resolve(null);
        });
        (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

        await servis.baslat();

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

    it('profil ayari yoksa varsayilan dengeli profil kullanmali', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

        await servis.baslat();

        expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
            KONUM_TAKIP_GOREVI,
            expect.objectContaining({
                accuracy: 2, // Accuracy.Low (dengeli profil)
                distanceInterval: 5000, // 5km
                timeInterval: 900000, // 15 dakika
                pausesUpdatesAutomatically: false,
            })
        );
    });

    it('durumBilgisiGetir profil mesafesini donmeli', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === '@namaz_akisi/konum_ayarlari') {
                return Promise.resolve(JSON.stringify({
                    takipHassasiyeti: 'hassas',
                }));
            }
            if (key === '@namaz_akisi/konum_takip_ayarlari') {
                return Promise.resolve(null);
            }
            return Promise.resolve(null);
        });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

        const durum = await servis.durumBilgisiGetir();

        expect(durum.minimumMesafe).toBe(2000); // hassas profil: 2km
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

/**
 * Arka plan gorevinin (TaskManager.defineTask govdesi) cekirdek mantigi.
 *
 * Bu, servisin GERCEK FIZIKSEL davranisidir: kullanici esik mesafeden fazla
 * hareket edince vakitler/koordinatlar guncellenir, az hareket edince ATLANIR.
 * Uretim kodu modul yuklenirken defineTask(...) cagrir; geri cagirma fonksiyonunu
 * o anda (clearAllMocks'tan ONCE) yakaliyoruz.
 */
const KONUM_ANAHTARI = '@namaz_akisi/konum_ayarlari';
const MUHAFIZ_ANAHTARI = 'muhafiz_ayarlari';

// Modul yuklenirken kaydedilen gorev adini ve geri-cagirimini yakala (ilk defineTask cagrisi).
// clearAllMocks mock.calls'u sildigi icin bunlari modul-kapsaminda, ilk beforeEach'ten ONCE yakaliyoruz.
const ilkDefineTaskCagrisi = (TaskManager.defineTask as jest.Mock).mock.calls[0];
const kayitliGorevAdi: string = ilkDefineTaskCagrisi[0];
const arkaPlanGorevi: (body: {
    data?: { locations?: Location.LocationObject[] };
    error?: unknown;
}) => Promise<void> = ilkDefineTaskCagrisi[1];

/** Test icin sahte bir LocationObject uretir */
function konumNesnesiUret(lat: number, lng: number): Location.LocationObject {
    return {
        coords: {
            latitude: lat,
            longitude: lng,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
        },
        timestamp: 0,
    } as Location.LocationObject;
}

describe('Arka Plan Gorevi (defineTask callback)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gorev gercekten kaydedilmis ve dogru ad ile tanimlanmali', () => {
        expect(typeof arkaPlanGorevi).toBe('function');
        expect(kayitliGorevAdi).toBe(KONUM_TAKIP_GOREVI);
    });

    it('error gelince hicbir yazma yapmamali', async () => {
        await arkaPlanGorevi({ error: new Error('GPS hatasi') });
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('konum verisi bos ise hicbir yazma yapmamali', async () => {
        await arkaPlanGorevi({ data: { locations: [] } });
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('manuel modda erken cikmali ve AsyncStorage YAZMAMALI (kullanici secimi ezilmemeli)', async () => {
        // konumModu manuel: GPS guncellemesi kullanicinin manuel secimini ezmemeli
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
            konumModu: 'manuel',
            koordinatlar: { lat: 41.0, lng: 29.0 },
        }));

        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(39.92, 32.85)] } });

        // Manuel modda hicbir sey yazilmamali
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        // Adres cozumlemesi de denenmemeli
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
    });

    it('konum ayarlari hic kayitli degilse erken cikmali (yazma yok)', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(41.0, 29.0)] } });

        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
    });

    it('mesafe esik ALTINDA (oto, ~3km < 5km): koordinat GUNCELLENMEMELI, sadece zaman damgasi yazilmali', async () => {
        // dengeli varsayilan profil: 5000m esik. ~3km hareket -> esik asilmadi.
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0, lng: 29.0 },
                    gpsAdres: { semt: '', ilce: 'EskiIlce', il: 'EskiIl' },
                }));
            }
            return Promise.resolve(null);
        });

        // 41.0,29.0 -> 41.0,29.0358 ~ 3km (5km esigin altinda)
        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(41.0, 29.0358)] } });

        // Esik asilmadigi icin adres cozumlemesi YAPILMAMALI
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();

        // Sadece tek bir yazma olmali ve koordinatlar ESKI deger olarak korunmali
        expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
        const [yazilanAnahtar, yazilanJson] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
        expect(yazilanAnahtar).toBe(KONUM_ANAHTARI);
        const yazilan = JSON.parse(yazilanJson);
        // Koordinat ESKI deger (39.92/32.85 degil, 41.0/29.0)
        expect(yazilan.koordinatlar).toEqual({ lat: 41.0, lng: 29.0 });
        // Yeni koordinat KESINLIKLE yazilmamali
        expect(yazilan.koordinatlar.lng).not.toBeCloseTo(29.0358);
        // Yine de takibin canli oldugunu gostermek icin zaman damgasi yazilmis olmali
        expect(typeof yazilan.sonGpsGuncellemesi).toBe('string');
    });

    it('mesafe esik USTUNDE (oto, Istanbul->Ankara ~350km): koordinat ve adres GUNCELLENMELI', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0369, lng: 28.9850 }, // Istanbul
                    gpsAdres: { semt: '', ilce: 'Beyoglu', il: 'Istanbul' },
                }));
            }
            return Promise.resolve(null); // muhafiz ayarlari yok -> yeniden planlama atlanir
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
            { district: 'Cankaya', subregion: '', city: 'Ankara', region: '' },
        ]);

        // Ankara Kizilay (~350km, 5km esigin cok ustunde)
        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(39.9208, 32.8541)] } });

        // Adres cozumlemesi YENI koordinatla yapilmali
        expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith({
            latitude: 39.9208,
            longitude: 32.8541,
        });

        // Yeni koordinatlar ve cozulen adres yazilmali
        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        expect(sonYazma).toBeDefined();
        const yazilan = JSON.parse(sonYazma![1]);
        expect(yazilan.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(32.8541);
        expect(yazilan.gpsAdres.ilce).toBe('Cankaya');
        expect(yazilan.gpsAdres.il).toBe('Ankara');
    });

    it('mesafe TAM esikte degil ama hemen ALTINDA degil: ~6km > 5km esik -> guncellenir (sinir davranisi)', async () => {
        // Uretim `mesafe < profil.mesafe` kullanir: 6km esigi asar, guncelleme yapilmali.
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli', // 5km esik
                    koordinatlar: { lat: 41.0, lng: 29.0 },
                }));
            }
            return Promise.resolve(null);
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        // 41.0,29.0 -> 41.0,29.0716 ~ 6km (5km esigin ustunde)
        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(41.0, 29.0716)] } });

        // Esik asildigi icin adres cozumlemesi denenmeli (guncelleme dali)
        expect(Location.reverseGeocodeAsync).toHaveBeenCalled();
        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        const yazilan = JSON.parse(sonYazma![1]);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(29.0716);
    });

    it('onceki koordinat yoksa (ilk olcum) dogrudan guncelleme dalina girmeli', async () => {
        // sonLat/sonLng yoksa mesafe karsilastirmasi atlanir, koordinat yazilir.
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: null,
                }));
            }
            return Promise.resolve(null);
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(41.0082, 28.9784)] } });

        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        const yazilan = JSON.parse(sonYazma![1]);
        expect(yazilan.koordinatlar.lat).toBeCloseTo(41.0082);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(28.9784);
    });

    it('reverseGeocodeAsync HATA firlatirsa cokmemeli: gpsAdres=null ile koordinat YINE de kaydedilmeli', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0369, lng: 28.9850 },
                }));
            }
            return Promise.resolve(null);
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockRejectedValue(new Error('Ag hatasi'));

        // Istanbul -> Ankara, esik asili. Geocode patlasa bile koordinat kaydedilmeli.
        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(39.9208, 32.8541)] } });

        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        expect(sonYazma).toBeDefined();
        const yazilan = JSON.parse(sonYazma![1]);
        // Adres cozulemedi -> null, ama koordinat graceful sekilde kaydedildi
        expect(yazilan.gpsAdres).toBeNull();
        expect(yazilan.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(32.8541);
    });

    it('sehir degisince muhafiz bildirimleri YENI koordinatla yeniden planlanmali', async () => {
        // Stabil bir muhafiz instance'i ver (mock her cagride yeni nesne dondurur)
        const yapilandirVePlanlaMock = jest.fn().mockResolvedValue(undefined);
        (ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({
            yapilandirVePlanla: yapilandirVePlanlaMock,
        });

        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0369, lng: 28.9850 }, // Istanbul
                }));
            }
            if (key === MUHAFIZ_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    aktif: true,
                    sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
                    esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
                }));
            }
            return Promise.resolve(null);
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
            { district: 'Cankaya', city: 'Ankara' },
        ]);

        // Ankara'ya tasin (~350km)
        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(39.9208, 32.8541)] } });

        // Yeniden planlama cagrilmali ve YENI (Ankara) koordinatlari iletilmeli (eski Istanbul DEGIL)
        expect(yapilandirVePlanlaMock).toHaveBeenCalledTimes(1);
        const iletilenAyar = yapilandirVePlanlaMock.mock.calls[0][0];
        expect(iletilenAyar.aktif).toBe(true);
        expect(iletilenAyar.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(iletilenAyar.koordinatlar.lng).toBeCloseTo(32.8541);
        // Eski Istanbul koordinati KESINLIKLE iletilmemeli
        expect(iletilenAyar.koordinatlar.lat).not.toBeCloseTo(41.0369);
    });

    it('muhafiz ayarlari aktif:false ise yeniden planlama YAPILMAMALI', async () => {
        const yapilandirVePlanlaMock = jest.fn().mockResolvedValue(undefined);
        (ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({
            yapilandirVePlanla: yapilandirVePlanlaMock,
        });

        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0369, lng: 28.9850 },
                }));
            }
            if (key === MUHAFIZ_ANAHTARI) {
                return Promise.resolve(JSON.stringify({ aktif: false }));
            }
            return Promise.resolve(null);
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        await arkaPlanGorevi({ data: { locations: [konumNesnesiUret(39.9208, 32.8541)] } });

        // Muhafiz pasifken bildirim planlanmamali (ama koordinat yine guncellenmis olmali)
        expect(yapilandirVePlanlaMock).not.toHaveBeenCalled();
        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        expect(sonYazma).toBeDefined();
    });
});
