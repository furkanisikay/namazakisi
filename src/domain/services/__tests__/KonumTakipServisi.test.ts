/**
 * Konum Takip Servisi Testleri
 *
 * Takip OLAY TABANLIDIR: bulunulan noktaya bir bölge (geofence) kaydedilir ve
 * yalnızca o çemberden çıkınca uyanılır. Testler hem servis API'sini hem de
 * arka plan bölge görevinin gövdesini davranışsal olarak doğrular.
 */

import {
    KonumTakipServisi,
    KONUM_TAKIP_GOREVI,
    KONUM_GEOFENCE_GOREVI,
    AKTIF_BOLGE_KIMLIGI,
} from '../KonumTakipServisi';
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
    startGeofencingAsync: jest.fn(() => Promise.resolve()),
    stopGeofencingAsync: jest.fn(() => Promise.resolve()),
    getCurrentPositionAsync: jest.fn(),
    stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
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
    LocationGeofencingEventType: {
        Enter: 1,
        Exit: 2,
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

/** Test icin sahte bir LocationObject uretir (varsayilan: TAZE sabitleme) */
function konumNesnesiUret(lat: number, lng: number, zamanDamgasi: number = Date.now()): Location.LocationObject {
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
        timestamp: zamanDamgasi,
    } as Location.LocationObject;
}

describe('KonumTakipServisi', () => {
    let servis: KonumTakipServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        // Singleton'i sifirla
        (KonumTakipServisi as unknown as { instance?: KonumTakipServisi }).instance = undefined;
        servis = KonumTakipServisi.getInstance();
        // clearAllMocks cagri kaydini siler ama IMPLEMENTASYONU silmez:
        // bir testteki mockRejectedValue sonrakine sizar. Acikca sifirla.
        (Location.startGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.stopGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
        // Bolge merkezi icin varsayilan taze konum
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
            konumNesnesiUret(41.0082, 28.9784),
        );
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
            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
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
            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        });

        it('tum izinler varsa bolgeyi TAZE konum merkezli ve profil yaricapiyla kurmali', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
                konumNesnesiUret(39.9208, 32.8541),
            );

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(true);
            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [
                    expect.objectContaining({
                        identifier: AKTIF_BOLGE_KIMLIGI,
                        latitude: 39.9208,
                        longitude: 32.8541,
                        radius: 5000, // dengeli profil
                        notifyOnEnter: false,
                        notifyOnExit: true,
                    }),
                ],
            );
        });

        it('KALICI BILDIRIM: eski foreground service li gorev kayitliysa DURDURULMALI (surum gecisi)', async () => {
            // Yukseltme yapan kullanicida eski gorev diskte kayitli kalir ve kalici
            // bildirimi ekranda tutar. baslat() onu acikca durdurmali.
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            await servis.baslat();

            expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(KONUM_TAKIP_GOREVI);
        });

        it('taze konum alinamazsa KAYITLI koordinata dusup bolgeyi yine kurmali', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS kapali'));
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === '@namaz_akisi/konum_ayarlari') {
                    return Promise.resolve(JSON.stringify({
                        konumModu: 'oto',
                        koordinatlar: { lat: 41.0369, lng: 28.9850 },
                    }));
                }
                return Promise.resolve(null);
            });

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(true);
            expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
                KONUM_GEOFENCE_GOREVI,
                [expect.objectContaining({ latitude: 41.0369, longitude: 28.9850 })],
            );
        });

        it('ne taze konum ne kayitli koordinat varsa false donmeli (bolge kurulamaz)', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS kapali'));
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(false);
            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        });

        it('basarili baslatmada ayarlari kaydetmeli', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await servis.baslat();

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                '@namaz_akisi/konum_takip_ayarlari',
                expect.stringContaining('"aktif":true')
            );
        });

        it('bolge kurulumu patlarsa false donmeli (cokmemeli)', async () => {
            (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
            (Location.startGeofencingAsync as jest.Mock).mockRejectedValue(new Error('geofence reddedildi'));

            const sonuc = await servis.baslat();

            expect(sonuc).toBe(false);
        });
    });

    describe('durdur', () => {
        it('bolge kayitliysa izlemeyi durdurmali', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            await servis.durdur();

            expect(Location.stopGeofencingAsync).toHaveBeenCalledWith(KONUM_GEOFENCE_GOREVI);
        });

        it('bolge kayitli degilse stopGeofencingAsync cagirmamali', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            await servis.durdur();

            expect(Location.stopGeofencingAsync).not.toHaveBeenCalled();
        });

        it('eski gorev de temizlenmeli (surum gecisi)', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            await servis.durdur();

            expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(KONUM_TAKIP_GOREVI);
        });

        it('ayarlari aktif:false olarak guncellemeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
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
        it('bolge gorevi kayitliysa true donmeli', async () => {
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            const sonuc = await servis.aktifMi();

            expect(sonuc).toBe(true);
            expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(KONUM_GEOFENCE_GOREVI);
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
            expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
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

        it('takip aktif ve izin varsa bolgeyi yeniden kurmali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === '@namaz_akisi/konum_takip_ayarlari') {
                    return Promise.resolve(JSON.stringify({
                        aktif: true,
                        sonKoordinatlar: null,
                        sonGuncellemeTarihi: null,
                    }));
                }
                return Promise.resolve(null);
            });
            (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

            const sonuc = await servis.yenidenBaslat();

            expect(sonuc).toBe(true);
            expect(Location.startGeofencingAsync).toHaveBeenCalled();
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

describe('Konum Takip Sabitleri', () => {
    it('gorev adlari dogru tanimlanmali', () => {
        expect(KONUM_GEOFENCE_GOREVI).toBe('KONUM_GEOFENCE_GOREVI');
        // Eski gorev adi surum gecisi temizligi icin KORUNMALI
        expect(KONUM_TAKIP_GOREVI).toBe('KONUM_TAKIP_GOREVI');
    });
});

describe('Profil Sistemi', () => {
    let servis: KonumTakipServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        (KonumTakipServisi as unknown as { instance?: KonumTakipServisi }).instance = undefined;
        servis = KonumTakipServisi.getInstance();
        // Implementasyon sizintisini onle (bkz. ustteki not)
        (Location.startGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
            konumNesnesiUret(41.0082, 28.9784),
        );
        (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
    });

    /** Verilen hassasiyeti diske koyan getItem mock'u kurar */
    function hassasiyetKur(hassasiyet: string | null): void {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === '@namaz_akisi/konum_ayarlari' && hassasiyet !== null) {
                return Promise.resolve(JSON.stringify({ takipHassasiyeti: hassasiyet, konumModu: 'oto' }));
            }
            return Promise.resolve(null);
        });
    }

    it('hassas profil secildiginde 2km yaricap ve Balanced dogruluk kullanmali', async () => {
        hassasiyetKur('hassas');

        await servis.baslat();

        expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
            KONUM_GEOFENCE_GOREVI,
            [expect.objectContaining({ radius: 2000 })],
        );
        // Tek seferlik sabitleme profil dogrulugunu kullanmali
        expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 3 });
    });

    it('pil_dostu profil secildiginde 10km yaricap kullanmali', async () => {
        hassasiyetKur('pil_dostu');

        await servis.baslat();

        expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
            KONUM_GEOFENCE_GOREVI,
            [expect.objectContaining({ radius: 10000 })],
        );
        expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 2 });
    });

    it('profil ayari yoksa varsayilan dengeli profil (5km) kullanmali', async () => {
        hassasiyetKur(null);

        await servis.baslat();

        expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
            KONUM_GEOFENCE_GOREVI,
            [expect.objectContaining({ radius: 5000 })],
        );
    });

    it('durumBilgisiGetir profil mesafesini donmeli', async () => {
        hassasiyetKur('hassas');
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

        const durum = await servis.durumBilgisiGetir();

        expect(durum.minimumMesafe).toBe(2000); // hassas profil: 2km
    });
});

/**
 * Arka plan bolge gorevinin (TaskManager.defineTask govdesi) cekirdek mantigi.
 *
 * Bu, servisin GERCEK FIZIKSEL davranisidir: kullanici bolgeden cikinca taze
 * konum alinir, bolge yeni konuma tasinir ve esik asildiysa vakitler guncellenir.
 * Uretim kodu modul yuklenirken defineTask(...) cagrir; geri cagirma fonksiyonunu
 * o anda (clearAllMocks'tan ONCE) yakaliyoruz.
 */
const KONUM_ANAHTARI = '@namaz_akisi/konum_ayarlari';
const MUHAFIZ_ANAHTARI = 'muhafiz_ayarlari';

const ilkDefineTaskCagrisi = (TaskManager.defineTask as jest.Mock).mock.calls[0];
const kayitliGorevAdi: string = ilkDefineTaskCagrisi[0];
const bolgeGorevi: (body: {
    data?: { eventType?: number; region?: unknown };
    error?: unknown;
}) => Promise<void> = ilkDefineTaskCagrisi[1];

/** Bolge cikis olayi yuku uretir */
function cikisOlayi() {
    return {
        data: {
            eventType: 2, // LocationGeofencingEventType.Exit
            region: { identifier: AKTIF_BOLGE_KIMLIGI, latitude: 41.0, longitude: 29.0, radius: 5000 },
        },
    };
}

describe('Arka Plan Bolge Gorevi (defineTask callback)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Implementasyon sizintisini onle (bkz. ustteki not)
        (Location.startGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
            konumNesnesiUret(39.9208, 32.8541),
        );
    });

    it('gorev gercekten kaydedilmis ve BOLGE gorev adi ile tanimlanmali', () => {
        expect(typeof bolgeGorevi).toBe('function');
        expect(kayitliGorevAdi).toBe(KONUM_GEOFENCE_GOREVI);
    });

    it('error gelince hicbir yazma yapmamali', async () => {
        await bolgeGorevi({ error: new Error('Bolge hatasi') });
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('GIRIS olayi yok sayilmali (yalniz cikis islenir)', async () => {
        await bolgeGorevi({ data: { eventType: 1 } }); // Enter
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('manuel modda erken cikmali ve AsyncStorage YAZMAMALI (kullanici secimi ezilmemeli)', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
            konumModu: 'manuel',
            koordinatlar: { lat: 41.0, lng: 29.0 },
        }));

        await bolgeGorevi(cikisOlayi());

        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
    });

    it('konum ayarlari hic kayitli degilse erken cikmali (yazma yok)', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        await bolgeGorevi(cikisOlayi());

        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
    });

    it('KRITIK (dongu korumasi): taze konum ALINAMAZSA bolge YENIDEN KURULMAMALI', async () => {
        // expo INITIAL_TRIGGER_EXIT'i sabit kodlar: bayat/eski merkeze yeniden kayit
        // aninda yeni bir cikis olayi dogurur -> sonsuz dongu. Uretim bu durumda
        // bolgeye DOKUNMAMALI; onarimi 15dk'lik arka plan gorevi ustlenir.
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0, lng: 29.0 },
                }));
            }
            return Promise.resolve(null);
        });
        (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS yok'));

        await bolgeGorevi(cikisOlayi());

        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
        // Olay damgasi yine de yazilmali (arka arkaya gelen olaylar hizla tekrarlamasin)
        const yazilan = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
        expect(typeof yazilan.sonGeofenceOlayi).toBe('string');
        // Koordinat DEGISMEMELI
        expect(yazilan.koordinatlar).toEqual({ lat: 41.0, lng: 29.0 });
    });

    it('KRITIK (dongu korumasi): BAYAT zaman damgali konumla da bolge yeniden kurulmamali', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0, lng: 29.0 },
                }));
            }
            return Promise.resolve(null);
        });
        // 10 dakika onceki onbellek sabitlemesi -> bayat
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
            konumNesnesiUret(39.9208, 32.8541, Date.now() - 10 * 60 * 1000),
        );

        await bolgeGorevi(cikisOlayi());

        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
    });

    it('PATLAMA korumasi: bekleme penceresi icindeki olay tamamen ATLANMALI', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0, lng: 29.0 },
                    sonGeofenceOlayi: new Date(Date.now() - 5_000).toISOString(),
                }));
            }
            return Promise.resolve(null);
        });

        await bolgeGorevi(cikisOlayi());

        // Pahali islerin HICBIRI yapilmamali
        expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('taze konumda bolge YENI merkeze tasinmali (profil yaricapiyla)', async () => {
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
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        await bolgeGorevi(cikisOlayi());

        expect(Location.startGeofencingAsync).toHaveBeenCalledWith(
            KONUM_GEOFENCE_GOREVI,
            [expect.objectContaining({
                latitude: 39.9208,
                longitude: 32.8541,
                radius: 5000,
                notifyOnExit: true,
            })],
        );
    });

    it('mesafe esik ALTINDA: koordinat GUNCELLENMEMELI, sadece zaman damgalari yazilmali', async () => {
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
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(
            konumNesnesiUret(41.0, 29.0358),
        );

        await bolgeGorevi(cikisOlayi());

        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();

        const yazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        const yazilan = JSON.parse(yazma![1]);
        expect(yazilan.koordinatlar).toEqual({ lat: 41.0, lng: 29.0 });
        expect(typeof yazilan.sonGpsGuncellemesi).toBe('string');
        expect(typeof yazilan.sonGeofenceOlayi).toBe('string');
    });

    it('mesafe esik USTUNDE (Istanbul->Ankara): koordinat ve adres GUNCELLENMELI', async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === KONUM_ANAHTARI) {
                return Promise.resolve(JSON.stringify({
                    konumModu: 'oto',
                    takipHassasiyeti: 'dengeli',
                    koordinatlar: { lat: 41.0369, lng: 28.9850 }, // Istanbul
                    gpsAdres: { semt: '', ilce: 'Beyoglu', il: 'Istanbul' },
                }));
            }
            return Promise.resolve(null);
        });
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
            { district: 'Cankaya', subregion: '', city: 'Ankara', region: '' },
        ]);

        await bolgeGorevi(cikisOlayi());

        expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith({
            latitude: 39.9208,
            longitude: 32.8541,
        });

        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        const yazilan = JSON.parse(sonYazma![1]);
        expect(yazilan.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(32.8541);
        expect(yazilan.gpsAdres.ilce).toBe('Cankaya');
        expect(yazilan.gpsAdres.il).toBe('Ankara');
    });

    it('onceki koordinat yoksa (ilk olcum) dogrudan guncelleme dalina girmeli', async () => {
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

        await bolgeGorevi(cikisOlayi());

        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        const yazilan = JSON.parse(sonYazma![1]);
        expect(yazilan.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(32.8541);
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

        await bolgeGorevi(cikisOlayi());

        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        const yazilan = JSON.parse(sonYazma![1]);
        expect(yazilan.gpsAdres).toBeNull();
        expect(yazilan.koordinatlar.lat).toBeCloseTo(39.9208);
    });

    it('bolge yeniden kurulumu PATLASA bile konum guncellemesi devam etmeli', async () => {
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
        (Location.startGeofencingAsync as jest.Mock).mockRejectedValue(new Error('kurulum reddedildi'));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        await expect(bolgeGorevi(cikisOlayi())).resolves.toBeUndefined();

        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        expect(JSON.parse(sonYazma![1]).koordinatlar.lat).toBeCloseTo(39.9208);
    });

    it('sehir degisince muhafiz bildirimleri YENI koordinatla yeniden planlanmali', async () => {
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

        await bolgeGorevi(cikisOlayi());

        expect(yapilandirVePlanlaMock).toHaveBeenCalledTimes(1);
        const iletilenAyar = yapilandirVePlanlaMock.mock.calls[0][0];
        expect(iletilenAyar.aktif).toBe(true);
        expect(iletilenAyar.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(iletilenAyar.koordinatlar.lng).toBeCloseTo(32.8541);
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

        await bolgeGorevi(cikisOlayi());

        expect(yapilandirVePlanlaMock).not.toHaveBeenCalled();
        const sonYazma = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
            (c: [string, string]) => c[0] === KONUM_ANAHTARI
        );
        expect(sonYazma).toBeDefined();
    });
});
