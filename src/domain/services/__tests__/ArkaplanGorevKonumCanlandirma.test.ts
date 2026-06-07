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
            // Ayarlar aktif: false olarak guncellenmeli.
            // stringContaining yerine kaydedilen argumani parse edip net dogrula:
            // boylece "aktif" anahtari/false degeri uretim kodunda degisirse test kirilir.
            const kayit = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_TAKIP_AYARLARI_ANAHTAR
            );
            expect(kayit).toBeDefined();
            expect(JSON.parse(kayit![1])).toMatchObject({ aktif: false });
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
            // Kaydedilen ayar argumanini parse edip aktif:false oldugunu net dogrula
            // (stringContaining sadece alt-string arar; parse + toMatchObject yapisal kontrol yapar).
            const kayit = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_TAKIP_AYARLARI_ANAHTAR
            );
            expect(kayit).toBeDefined();
            expect(JSON.parse(kayit![1])).toMatchObject({ aktif: false });
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
                        notificationTitle: 'Seyahatte otomatik güncelleme',
                        notificationBody: 'Şehir değiştiğinde namaz vakitleri konumunuza göre güncellenir.',
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

        it('AsyncStorage hatasi olursa hata firlatmamali ve takip baslatmamali', async () => {
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
                new Error('AsyncStorage error')
            );

            await expect(arkaplandanKonumTakibiniYenidenBaslat()).resolves.toBeUndefined();

            // Fail-safe: depolama okunamadiginda izin/ayar bilinemez,
            // dolayisiyla konum takibi ASLA baslatilmamali (gizlilik/izin guvenli tarafi).
            // Sadece "cokmedi" demek yetmez; getItem her zaman reject ederken bile
            // start cagrilirsa bu bir regresyondur.
            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
            // Depolama tamamen erisilemezken "aktif:false" yazma denemesi de yapilmamali
            // (izinIptalKontrolEt'e hic ulasilmadigi icin setItem cagrilmaz).
            expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        });
    });

    // ==========================================
    // SENARYO 7: Konum ayarlari hic kaydedilmemis (depolama bos)
    // Uretim satir 110-116: konumAyarlariJson falsy ise `if` blogu KOMPLE
    // atlanir -> `konumModu !== 'oto'` kontrolu YAPILMAZ -> izin kontrolune ve
    // canlandirmaya gecilir. Yani "aktif:true ama konum ayarlari hic
    // kaydedilmemis" senaryosunda takip YINE de baslatilir.
    // ==========================================
    describe('konum ayarlari hic kaydedilmemis (depolama null)', () => {
        it('konum depolamasi null iken manuel-mod kapisi atlanir ve takip baslatilir', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                // KONUM_DEPOLAMA_ANAHTARI dahil diger her sey null -> konum ayarlari yok
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

            // Konum ayarlari okunamasa bile (manuel-mod kontrolu yapilamadigi icin)
            // takip baslatilmali. Bu, "if (konumAyarlariJson)" guard'inin yanlislikla
            // erken return'e cevrilmesini (ornegin `if (!konumAyarlariJson) return`)
            // yakalar: o regresyonda bu cagri ASLA start etmezdi.
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledTimes(1);
            // Konum ayarlari okunamadigindan varsayilan (dengeli) profil kullanilmali
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
                KONUM_TAKIP_GOREVI,
                expect.objectContaining({
                    accuracy: 2,
                    distanceInterval: 5000,
                    timeInterval: 900000,
                })
            );
        });
    });

    // ==========================================
    // SENARYO 8: Profil fallback - gecersiz takipHassasiyeti
    // Uretim satir 46-47: TAKIP_PROFILLERI[hassasiyet] || TAKIP_PROFILLERI[varsayilan]
    // Bilinmeyen bir hassasiyet degeri TAKIP_PROFILLERI'nde undefined doner ve
    // varsayilan (dengeli) profile DUSMELI. Bu fallback bozulursa accuracy/interval
    // undefined gonderilir.
    // ==========================================
    describe('profil fallback davranisi', () => {
        it('gecersiz takipHassasiyeti degeri varsayilan dengeli profile dusmeli', async () => {
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
                if (key === KONUM_TAKIP_AYARLARI_ANAHTAR) {
                    return Promise.resolve(JSON.stringify({ aktif: true }));
                }
                if (key === KONUM_DEPOLAMA_ANAHTARI) {
                    return Promise.resolve(JSON.stringify({
                        konumModu: 'oto',
                        takipHassasiyeti: 'gecersizDeger',
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

            // Fallback dengeli profil: dogruluk=2, mesafe=5000, zaman=900sn
            // Eger fallback bozulursa TAKIP_PROFILLERI['gecersizDeger'] undefined olur
            // ve bu alanlar undefined gonderilir -> assertion FAIL.
            const cagri = (Location.startLocationUpdatesAsync as jest.Mock).mock.calls[0];
            expect(cagri).toBeDefined();
            const secenekler = cagri![1];
            expect(secenekler.accuracy).toBe(2);
            expect(secenekler.distanceInterval).toBe(5000);
            expect(secenekler.timeInterval).toBe(900000);
            // undefined sizintisina karsi acik koruma
            expect(secenekler.accuracy).not.toBeUndefined();
            expect(secenekler.distanceInterval).not.toBeUndefined();
            expect(secenekler.timeInterval).not.toBeUndefined();
        });
    });

    // ==========================================
    // SENARYO 9: Pozitif yolda ayarlar BOZULMAMALI
    // Graceful deactivation (aktif:false yazma) YALNIZCA izin iptalinde olmali.
    // Gorev zaten kayitli (kisa devre) veya izin granted iken yeniden baslatma
    // yollarinda setItem ile ayarlar aktif:false'a DUSURULMEMELI.
    // ==========================================
    describe('pozitif yollarda ayarlar bozulmamali', () => {
        it('gorev zaten kayitliyken setItem cagrilmamali (ayarlar yazilmamali)', async () => {
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
            // Gorev zaten kayitli -> kisa devre
            (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

            await arkaplandanKonumTakibiniYenidenBaslat();

            // Zaten calisan goreve dokunulmamali; ne start ne de ayar yazma olmali.
            // Bir regresyon kisa devrede ayarlari yeniden yazsa veya aktif:false'a
            // dusurse bu assertion FAIL eder.
            expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
            expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        });

        it('izin granted ve yeniden baslatma yapilirken ayarlar aktif:false yapilMAMALI', async () => {
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

            // Pozitif yolda takip baslatilmali...
            expect(Location.startLocationUpdatesAsync).toHaveBeenCalledTimes(1);
            // ...ama izin iptaline ozgu "aktif:false" yazimi ASLA olmamali.
            // Yani takip ayarlari anahtarina hicbir setItem cagrisi yapilmamali.
            const ayarYazimi = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
                ([anahtar]) => anahtar === KONUM_TAKIP_AYARLARI_ANAHTAR
            );
            expect(ayarYazimi).toBeUndefined();
        });
    });

    // ==========================================
    // SENARYO 10: foregroundService ek parametreleri (renk + activityType)
    // Uretim satir 150 (notificationColor) ve satir 153 (activityType) hicbir
    // testte dogrulanmiyor. Mevcut foregroundService testi yalnizca title/body
    // bakiyor.
    // ==========================================
    describe('foregroundService ek parametreleri', () => {
        it('notificationColor ve activityType dogru gecirilmeli', async () => {
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

            const cagri = (Location.startLocationUpdatesAsync as jest.Mock).mock.calls[0];
            expect(cagri).toBeDefined();
            const secenekler = cagri![1];
            // Bildirim rengi (kurumsal mavi) - satir 150
            expect(secenekler.foregroundService.notificationColor).toBe('#4A90D9');
            // ActivityType.Other (mock'ta 1) - satir 153
            expect(secenekler.activityType).toBe(Location.ActivityType.Other);
        });
    });
});
