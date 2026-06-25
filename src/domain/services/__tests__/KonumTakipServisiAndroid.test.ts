/**
 * KonumTakipServisi — Android / hata-yolu / bozuk-veri davranis testleri
 *
 * Ana test dosyasi (KonumTakipServisi.test.ts) react-native'i MOCKLAMAZ; preset
 * altinda Platform.OS = 'ios' oldugu icin Android-ozgu dallar (arka plan foreground
 * service kisitlamasi, onPlanaGelinceDene retry mantigi, yenidenBaslat'in erken
 * cikisi) ORADA hic calismaz. Bu dosya Platform.OS='android' ve KONTROL EDILEBILIR
 * bir AppState ile o dallari + sessiz hata yakalama (catch) ve bozuk-JSON kurtarma
 * yollarini DAVRANISSAL olarak dogrular.
 *
 * Izolasyon: react-native mock'u modul-yuklenisinde okundugu icin bu senaryolar
 * AYRI bir test dosyasinda olmali (ana dosya 'ios' varsayar; ikisi ayni modulu
 * farkli Platform ile paylasamaz).
 */

// ---- Kontrol edilebilir AppState ----
// currentState bir GETTER ile okunur: namespace import altinda duz property kaybolur,
// getter ise mock* tutucudan canli okur (kanitlandi). Dinleyiciler mock* dizide tutulur
// ki testler "on plana gelis"i elle tetikleyebilsin.
const mockAppStateDurum = { deger: 'active' as string };
const mockAppStateDinleyiciler: Array<(s: string) => void> = [];

jest.mock('react-native', () => ({
    Platform: { OS: 'android' },
    AppState: {
        get currentState() { return mockAppStateDurum.deger; },
        addEventListener: jest.fn((_olay: string, cb: (s: string) => void) => {
            mockAppStateDinleyiciler.push(cb);
            return {
                remove: jest.fn(() => {
                    const i = mockAppStateDinleyiciler.indexOf(cb);
                    if (i >= 0) mockAppStateDinleyiciler.splice(i, 1);
                }),
            };
        }),
    },
}));

// In-memory AsyncStorage (mock* oneki: jest.mock fabrikasi erisebilsin)
const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null)),
        setItem: jest.fn(async (k: string, v: string) => { mockStore.set(k, v); }),
        removeItem: jest.fn(async (k: string) => { mockStore.delete(k); }),
    },
}));

jest.mock('expo-task-manager', () => ({
    defineTask: jest.fn(),
    isTaskRegisteredAsync: jest.fn(),
}));

jest.mock('../ArkaplanMuhafizServisi', () => ({
    ArkaplanMuhafizServisi: {
        getInstance: jest.fn(() => ({ yapilandirVePlanla: jest.fn() })),
    },
}));

// Logger'i sustur (yan etki testi kirletmesin)
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { KonumTakipServisi, KONUM_TAKIP_GOREVI } from '../KonumTakipServisi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const TAKIP_AYAR_ANAHTARI = '@namaz_akisi/konum_takip_ayarlari';
const KONUM_ANAHTARI = '@namaz_akisi/konum_ayarlari';

// Arka plan gorevi modul yuklenirken defineTask(...) ile kaydedilir. beforeEach'teki
// jest.clearAllMocks() mock.calls'u siler, bu yuzden geri-cagirimi MODUL KAPSAMINDA,
// herhangi bir beforeEach'ten ONCE yakaliyoruz.
const ilkDefineTaskCagrisi = (TaskManager.defineTask as jest.Mock).mock.calls[0];
const arkaPlanGorevi: (b: { data?: { locations?: Location.LocationObject[] }; error?: unknown }) => Promise<void> =
    ilkDefineTaskCagrisi[1];

/** Yeni izole singleton al (statik 'instance' alanini test icin sifirla) */
function yeniServis(): KonumTakipServisi {
    (KonumTakipServisi as unknown as { instance?: KonumTakipServisi }).instance = undefined;
    return KonumTakipServisi.getInstance();
}

/** Tum izinleri ver + gorev kayitli degil + start basarili: "mutlu yol" mock'lari */
function mutluYolKur(): void {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
    (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
    (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
}

beforeEach(() => {
    jest.clearAllMocks();
    mockStore.clear();
    mockAppStateDurum.deger = 'active';
    mockAppStateDinleyiciler.length = 0;
});

describe('baslat — Android arka plan erteleme (Platform.OS=android)', () => {
    it('uygulama arka plandayken baslatmamali, false donmeli ve izin SORMAMALI', async () => {
        mockAppStateDurum.deger = 'background';
        const servis = yeniServis();

        const sonuc = await servis.baslat();

        expect(sonuc).toBe(false);
        // Erken cikis: izin akisi hic baslamamali, konum guncellemesi planlanmamali
        expect(Location.getForegroundPermissionsAsync).not.toHaveBeenCalled();
        expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        // On plana gelince tekrar denemek icin bir AppState dinleyicisi kaydedilmeli
        expect(mockAppStateDinleyiciler.length).toBe(1);
    });

    it('arka planda kayitli dinleyici ON PLANA gelince baslat-i tetikleyip basariyla baslatmali', async () => {
        mockAppStateDurum.deger = 'background';
        mutluYolKur();
        const servis = yeniServis();

        // 1) Arka planda: ertelendi, dinleyici kuruldu
        expect(await servis.baslat()).toBe(false);
        expect(mockAppStateDinleyiciler.length).toBe(1);

        // 2) Uygulama on plana geldi: dinleyici baslat'i yeniden cagirmali
        mockAppStateDurum.deger = 'active';
        await mockAppStateDinleyiciler[0]('active');
        // mikro-gorev kuyrugunu bosalt (listener icindeki await baslat)
        await Promise.resolve();
        await Promise.resolve();

        // Bu sefer on planda -> gercekten baslatilmali
        expect(Location.startLocationUpdatesAsync).toHaveBeenCalledTimes(1);
        // Basarili baslatma ayarlari yazmali
        expect(JSON.parse(mockStore.get(TAKIP_AYAR_ANAHTARI)!).aktif).toBe(true);
    });

    it('arka planda ust uste cagri TEK dinleyici kaydetmeli (memory leak korumasi)', async () => {
        mockAppStateDurum.deger = 'background';
        const servis = yeniServis();

        await servis.baslat();
        await servis.baslat();
        await servis.baslat();

        // Birden cok erteleme isteginde yalnizca tek subscription tutulmali
        expect(mockAppStateDinleyiciler.length).toBe(1);
    });

    it('dinleyici "active" DISI bir durumla tetiklenirse hicbir sey yapmamali (no-op)', async () => {
        mockAppStateDurum.deger = 'background';
        const servis = yeniServis();
        await servis.baslat();
        expect(mockAppStateDinleyiciler.length).toBe(1);

        // Uygulama 'inactive'e gecti (active DEGIL) -> baslatma denenmemeli, dinleyici kalmali
        await mockAppStateDinleyiciler[0]('inactive');
        await Promise.resolve();

        expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
        expect(mockAppStateDinleyiciler.length).toBe(1); // hala bekliyor (remove edilmedi)
    });
});

describe('baslat — foreground service hatasi (Android catch dali)', () => {
    it('start "foreground service" hatasi atarsa false donmeli ve on plana gelince yeniden denemeli', async () => {
        mutluYolKur();
        (Location.startLocationUpdatesAsync as jest.Mock).mockRejectedValue(
            new Error('Not allowed to start foreground service'),
        );
        const servis = yeniServis();

        const sonuc = await servis.baslat();

        expect(sonuc).toBe(false);
        // Catch dali on-plana-gelince retry icin dinleyici kurmali
        expect(mockAppStateDinleyiciler.length).toBe(1);
    });

    it('genel (foreground-disi) hata atarsa false donmeli ve retry dinleyicisi KURMAMALI', async () => {
        mutluYolKur();
        (Location.startLocationUpdatesAsync as jest.Mock).mockRejectedValue(new Error('beklenmeyen hata'));
        const servis = yeniServis();

        const sonuc = await servis.baslat();

        expect(sonuc).toBe(false);
        // foreground service'e ozgu olmayan hata -> retry dinleyicisi kurulmamali
        expect(mockAppStateDinleyiciler.length).toBe(0);
    });
});

describe('onPlanaGelinceDene — maksimum deneme siniri (3)', () => {
    it('foreground service hatasi 3 kez tekrarlasa da en fazla 3 kez yeniden denemeli', async () => {
        mutluYolKur();
        (Location.startLocationUpdatesAsync as jest.Mock).mockRejectedValue(
            new Error('Unable to start foreground service'),
        );
        const servis = yeniServis();

        // Ilk start: hata -> 1. deneme dinleyicisi kuruldu
        await servis.baslat();
        expect(mockAppStateDinleyiciler.length).toBe(1);

        // 3 tur: her on-plana-gelis yeni bir baslat -> yine hata -> yeni dinleyici (sayac artar)
        for (let tur = 0; tur < 3; tur++) {
            const dinleyici = mockAppStateDinleyiciler[0];
            mockAppStateDurum.deger = 'active';
            await dinleyici('active');
            await Promise.resolve();
            await Promise.resolve();
        }

        // baslatmaDenemeSayisi MAX_BASLATMA_DENEME(3)'e ulasinca yeni dinleyici KURULMAMALI
        // -> sonunda bekleyen dinleyici kalmaz (hepsi tuketildi, yenisi eklenmedi)
        expect(mockAppStateDinleyiciler.length).toBe(0);
        // start her turda denendi ama hep patladi (sonsuz dongu YOK: sinir devrede)
        expect((Location.startLocationUpdatesAsync as jest.Mock).mock.calls.length).toBeLessThanOrEqual(4);
    });
});

describe('baslat — kayitli gorevi durdururken hata (stopError catch)', () => {
    it('mevcut gorev durdurulamasa bile cokmeden yeniden baslatmali', async () => {
        mutluYolKur();
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true); // zaten kayitli
        (Location.stopLocationUpdatesAsync as jest.Mock).mockRejectedValue(new Error('durdurulamadi'));
        const servis = yeniServis();

        const sonuc = await servis.baslat();

        // stopError yutulmali -> akis devam edip yeni takip baslatilmali
        expect(sonuc).toBe(true);
        expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
            KONUM_TAKIP_GOREVI,
            expect.objectContaining({ distanceInterval: 5000 }),
        );
    });
});

describe('durdur — hata yutma (catch dali)', () => {
    it('isTaskRegisteredAsync hata atarsa firlatmamali (sessizce yutmali)', async () => {
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(new Error('TM hatasi'));
        const servis = yeniServis();

        await expect(servis.durdur()).resolves.toBeUndefined();
    });
});

describe('yenidenBaslat — Android arka plan erken cikis', () => {
    it('uygulama arka plandayken yeniden baslatmamali, false donmeli ve ayarlari OKUMAMALI', async () => {
        mockAppStateDurum.deger = 'background';
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        expect(sonuc).toBe(false);
        // Erken cikis: ayarlar bile okunmamali (arka plan kontrolu en basta)
        expect(AsyncStorage.getItem).not.toHaveBeenCalled();
        // On plana gelince denemek icin dinleyici kurulmali
        expect(mockAppStateDinleyiciler.length).toBe(1);
    });

    it('on plan izin kontrolu HATA atarsa cokmemeli, baslat yoluna devam etmeli', async () => {
        // aktif=true, arka plan izni var. yenidenBaslat icindeki on-plan izin kontrolu
        // ILK cagride patlar (try/catch yutar), sonra baslat'in KENDI kontrolunde granted
        // doner -> akis cokmeden basariyla baslamali.
        mockStore.set(TAKIP_AYAR_ANAHTARI, JSON.stringify({
            aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null,
        }));
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getForegroundPermissionsAsync as jest.Mock)
            .mockRejectedValueOnce(new Error('izin kontrol hatasi')) // yenidenBaslat'in kontrolu
            .mockResolvedValue({ status: 'granted' });                // baslat'in kontrolu
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        // On plan izin kontrolu try/catch ile yutuldu; baslat'a dusup basariyla baslatti
        expect(sonuc).toBe(true);
        expect(Location.startLocationUpdatesAsync).toHaveBeenCalled();
    });

    it('ayarlar okunurken beklenmedik hata olusursa false donmeli (dis catch)', async () => {
        // ayarlariGetir bozuk JSON'da CATCH'e dusup varsayilan {aktif:false} doner ->
        // yenidenBaslat "aktif degil" yoluyla guvenli false doner (cokme yok).
        mockStore.set(TAKIP_AYAR_ANAHTARI, '{bozuk json');
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        expect(sonuc).toBe(false);
        expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
    });

    it('izin iptal yolunda disk yazma patlarsa cokmeden false donmeli (dis catch)', async () => {
        // aktif=true ama arka plan izni iptal -> "devre disi birak" disk yazmasi reject ediyor.
        // Outer try/catch hatayi yutmali; servis cokmeden false donmeli.
        mockStore.set(TAKIP_AYAR_ANAHTARI, JSON.stringify({
            aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null,
        }));
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk dolu'));
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        expect(sonuc).toBe(false);
        expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
    });
});

describe('ayarlariGetir — bozuk JSON dayanikliligi', () => {
    it('kayitli ayar bozuk JSON ise varsayilan (pasif) donmeli, FIRLATMAMALI', async () => {
        mockStore.set(TAKIP_AYAR_ANAHTARI, '{"aktif":tr');
        const servis = yeniServis();

        const sonuc = await servis.ayarlariGetir();

        expect(sonuc).toEqual({ aktif: false, sonKoordinatlar: null, sonGuncellemeTarihi: null });
    });
});

describe('sonKonumBilgisiniGetir — bozuk JSON dayanikliligi', () => {
    it('konum ayarlari bozuk JSON ise null donmeli, FIRLATMAMALI', async () => {
        mockStore.set(KONUM_ANAHTARI, 'not-json-{');
        const servis = yeniServis();

        const sonuc = await servis.sonKonumBilgisiniGetir();

        expect(sonuc).toBeNull();
    });
});

describe('aktifProfilGetir (durumBilgisiGetir uzerinden) — bozuk JSON varsayilan profile duser', () => {
    it('konum_ayarlari JSON bozuksa varsayilan dengeli profil mesafesi (5km) donmeli', async () => {
        mockStore.set(KONUM_ANAHTARI, '{"takipHassasiyeti":');
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
        const servis = yeniServis();

        const durum = await servis.durumBilgisiGetir();

        // Profil okuma catch'e dustu -> VARSAYILAN_TAKIP_HASSASIYETI ('dengeli') -> 5000m
        expect(durum.minimumMesafe).toBe(5000);
        expect(durum.takipAktif).toBe(false);
        expect(durum.arkaPlanIzniVar).toBe(false);
    });

    it('TANINMAYAN hassasiyet degeri varsayilan dengeli profile (5km) DUSMELI', async () => {
        // Gecerli JSON ama bilinmeyen hassasiyet anahtari -> TAKIP_PROFILLERI[x] undefined
        // -> uretim VARSAYILAN profile dusmeli (5000m), patlamamali.
        mockStore.set(KONUM_ANAHTARI, JSON.stringify({ takipHassasiyeti: 'bilinmeyen_mod' }));
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        const servis = yeniServis();

        const durum = await servis.durumBilgisiGetir();

        expect(durum.minimumMesafe).toBe(5000);
    });
});

describe('arka plan gorevi — bildirim yeniden planlama hatasi yutulmali', () => {
    it('muhafiz yapilandirVePlanla HATA atsa bile koordinat guncellemesi kalici olmali', async () => {
        // Muhafiz aktif ama yapilandirVePlanla reject ediyor -> ic try/catch yutmali,
        // ana islem (koordinat yazma) zaten ONCEDEN diske yazildigi icin korunmali.
        const { ArkaplanMuhafizServisi } = require('../ArkaplanMuhafizServisi');
        (ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({
            yapilandirVePlanla: jest.fn().mockRejectedValue(new Error('planlama coktu')),
        });

        mockStore.set(KONUM_ANAHTARI, JSON.stringify({
            konumModu: 'oto',
            takipHassasiyeti: 'dengeli',
            koordinatlar: { lat: 41.0369, lng: 28.9850 }, // Istanbul
        }));
        mockStore.set('muhafiz_ayarlari', JSON.stringify({
            aktif: true,
            esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
        }));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ district: 'Cankaya', city: 'Ankara' }]);

        const ankara = {
            coords: { latitude: 39.9208, longitude: 32.8541, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
            timestamp: 0,
        } as Location.LocationObject;

        // Planlama hatasina ragmen gorev REJECT etmemeli (modul-kapsaminda yakalanan govde)
        await expect(arkaPlanGorevi({ data: { locations: [ankara] } })).resolves.toBeUndefined();

        // Koordinat diske yeni (Ankara) deger olarak yazilmis olmali (planlama hatasi bunu bozmamali)
        const yazilan = JSON.parse(mockStore.get(KONUM_ANAHTARI)!);
        expect(yazilan.koordinatlar.lat).toBeCloseTo(39.9208);
        expect(yazilan.koordinatlar.lng).toBeCloseTo(32.8541);
    });

    it('muhafiz aktif ama esikler/sikliklar YOKSA varsayilan esik+sikliklarla yeniden planlamali', async () => {
        const yapilandirVePlanlaMock = jest.fn().mockResolvedValue(undefined);
        const { ArkaplanMuhafizServisi } = require('../ArkaplanMuhafizServisi');
        (ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({
            yapilandirVePlanla: yapilandirVePlanlaMock,
        });

        mockStore.set(KONUM_ANAHTARI, JSON.stringify({
            konumModu: 'oto',
            takipHassasiyeti: 'dengeli',
            koordinatlar: { lat: 41.0369, lng: 28.9850 }, // Istanbul
        }));
        // Muhafiz aktif AMA esikler ve sikliklar tanimsiz -> uretim varsayilanlara dusmeli
        mockStore.set('muhafiz_ayarlari', JSON.stringify({ aktif: true }));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ district: 'Cankaya', city: 'Ankara' }]);

        const ankara = {
            coords: { latitude: 39.9208, longitude: 32.8541, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
            timestamp: 0,
        } as Location.LocationObject;

        await arkaPlanGorevi({ data: { locations: [ankara] } });

        expect(yapilandirVePlanlaMock).toHaveBeenCalledTimes(1);
        const iletilen = yapilandirVePlanlaMock.mock.calls[0][0];
        // Varsayilan esik degerleri (45/25/10/3) ve siklik degerleri (15/10/5/1) uygulanmali
        expect(iletilen.esikler.seviye1).toBe(45);
        expect(iletilen.esikler.seviye1Siklik).toBe(15);
        expect(iletilen.esikler.seviye2).toBe(25);
        expect(iletilen.esikler.seviye3).toBe(10);
        expect(iletilen.esikler.seviye4).toBe(3);
        expect(iletilen.esikler.seviye4Siklik).toBe(1);
        // Yeni koordinatlar iletilmeli
        expect(iletilen.koordinatlar.lat).toBeCloseTo(39.9208);
    });

    it('geocode district/city YOKSA subregion/region alanlarina DUSMELI (alan fallback)', async () => {
        mockStore.set(KONUM_ANAHTARI, JSON.stringify({
            konumModu: 'oto',
            takipHassasiyeti: 'dengeli',
            koordinatlar: { lat: 41.0369, lng: 28.9850 }, // Istanbul
        }));
        // district ve city YOK -> uretim subregion/region'a dusmeli
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
            { district: null, subregion: 'TasraIlce', city: null, region: 'TasraIl' },
        ]);

        const ankara = {
            coords: { latitude: 39.9208, longitude: 32.8541, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
            timestamp: 0,
        } as Location.LocationObject;

        await arkaPlanGorevi({ data: { locations: [ankara] } });

        const yazilan = JSON.parse(mockStore.get(KONUM_ANAHTARI)!);
        expect(yazilan.gpsAdres.ilce).toBe('TasraIlce'); // subregion fallback
        expect(yazilan.gpsAdres.il).toBe('TasraIl');     // region fallback
    });

    it('konum ayarlari BOZUK JSON ise gorev cokmeden sessizce cikmali (dis catch)', async () => {
        // getItem null degil ama JSON.parse patliyor -> ic kontrollerden onceki parse
        // disardaki try/catch'e dusmeli; gorev reject ETMEMELI ve hicbir yazma yapmamali.
        mockStore.set(KONUM_ANAHTARI, '{"konumModu":"oto", BOZUK');

        const istanbul = {
            coords: { latitude: 41.0082, longitude: 28.9784, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
            timestamp: 0,
        } as Location.LocationObject;

        await expect(arkaPlanGorevi({ data: { locations: [istanbul] } })).resolves.toBeUndefined();
        // Parse patladigi icin hicbir guncelleme/yazma olmamali (bozuk veri korunur)
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
    });
});
