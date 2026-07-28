/**
 * KonumTakipServisi — hata-yolu / bozuk-veri / kalıcılık davranış testleri
 *
 * Ana test dosyası (KonumTakipServisi.test.ts) AsyncStorage'ı düz `jest.fn()`
 * ile mock'lar; bu dosya ise BELLEK İÇİ bir depolama kullanır, böylece "diske ne
 * yazıldı ve sonraki okumada ne görülüyor" davranışsal olarak doğrulanabilir.
 * Sessiz hata yakalama (catch) ve bozuk-JSON kurtarma yolları burada sınanır.
 *
 * TARİHÇE: Bu dosya eskiden Android'e özgü foreground-service dallarını
 * (AppState kapısı, "ön plana gelince tekrar dene" yeniden deneme sayacı)
 * doğruluyordu. Takip geofence'e geçince o mekanizmanın tamamı kalktı:
 * `startGeofencingAsync` foreground service kullanmaz, dolayısıyla uygulamanın
 * ön planda olması gerekmez. İlgili testler bilinçli olarak SİLİNDİ — geri
 * eklenmeleri, kaldırılan kalıcı bildirimin geri gelmesi demek olurdu.
 */

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

import { KonumTakipServisi, KONUM_GEOFENCE_GOREVI } from '../KonumTakipServisi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { eskidenMatriseGoc } from '../../../core/muhafiz/muhafizGoc';

const TAKIP_AYAR_ANAHTARI = '@namaz_akisi/konum_takip_ayarlari';
const KONUM_ANAHTARI = '@namaz_akisi/konum_ayarlari';

// Arka plan gorevi modul yuklenirken defineTask(...) ile kaydedilir. beforeEach'teki
// jest.clearAllMocks() mock.calls'u siler, bu yuzden geri-cagirimi MODUL KAPSAMINDA,
// herhangi bir beforeEach'ten ONCE yakaliyoruz.
const ilkDefineTaskCagrisi = (TaskManager.defineTask as jest.Mock).mock.calls[0];
const bolgeGorevi: (b: { data?: { eventType?: number; region?: unknown }; error?: unknown }) => Promise<void> =
    ilkDefineTaskCagrisi[1];

/** Yeni izole singleton al (statik 'instance' alanini test icin sifirla) */
function yeniServis(): KonumTakipServisi {
    (KonumTakipServisi as unknown as { instance?: KonumTakipServisi }).instance = undefined;
    return KonumTakipServisi.getInstance();
}

/** Taze zaman damgali sahte konum */
function tazeKonum(lat: number, lng: number): Location.LocationObject {
    return {
        coords: { latitude: lat, longitude: lng, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
    } as Location.LocationObject;
}

/** Bolge cikis olayi yuku */
function cikisOlayi() {
    return { data: { eventType: 2, region: { identifier: 'aktif_konum_bolgesi' } } };
}

/** Tum izinleri ver + bolge kayitli degil + kurulum basarili: "mutlu yol" mock'lari */
function mutluYolKur(): void {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted', canAskAgain: true });
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
    (Location.startGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
    (Location.stopGeofencingAsync as jest.Mock).mockResolvedValue(undefined);
    (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(41.0082, 28.9784));
}

beforeEach(() => {
    jest.clearAllMocks();
    mockStore.clear();
    // clearAllMocks IMPLEMENTASYONU silmez; her testte temiz zemin kur.
    mutluYolKur();
});

describe('baslat — kurulum hatasi (catch dali)', () => {
    it('bolge kurulumu patlarsa false donmeli ve ayarlar aktif YAZILMAMALI', async () => {
        (Location.startGeofencingAsync as jest.Mock).mockRejectedValue(new Error('geofence reddedildi'));
        const servis = yeniServis();

        const sonuc = await servis.baslat();

        expect(sonuc).toBe(false);
        // Kurulum basarisizken "aktif: true" diske yazilmamali (yalanci durum olmasin)
        expect(mockStore.has(TAKIP_AYAR_ANAHTARI)).toBe(false);
    });

    it('basarili kurulumda ayarlar aktif:true olarak KALICI yazilmali', async () => {
        const servis = yeniServis();

        const sonuc = await servis.baslat();

        expect(sonuc).toBe(true);
        expect(JSON.parse(mockStore.get(TAKIP_AYAR_ANAHTARI)!).aktif).toBe(true);
    });
});

describe('durdur — hata yutma (catch dali)', () => {
    it('isTaskRegisteredAsync hata atarsa firlatmamali (sessizce yutmali)', async () => {
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(new Error('TM hatasi'));
        const servis = yeniServis();

        await expect(servis.durdur()).resolves.toBeUndefined();
    });

    it('durdurma sonrasi ayarlar aktif:false olarak kalici olmali', async () => {
        mockStore.set(TAKIP_AYAR_ANAHTARI, JSON.stringify({
            aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null,
        }));
        (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
        const servis = yeniServis();

        await servis.durdur();

        expect(Location.stopGeofencingAsync).toHaveBeenCalledWith(KONUM_GEOFENCE_GOREVI);
        expect(JSON.parse(mockStore.get(TAKIP_AYAR_ANAHTARI)!).aktif).toBe(false);
    });
});

describe('yenidenBaslat — izin ve bozuk veri yollari', () => {
    it('on plan izin kontrolu HATA atarsa cokmemeli, baslat yoluna devam etmeli', async () => {
        // aktif=true, arka plan izni var. yenidenBaslat icindeki on-plan izin kontrolu
        // ILK cagride patlar (try/catch yutar), sonra baslat'in KENDI kontrolunde granted
        // doner -> akis cokmeden basariyla baslamali.
        mockStore.set(TAKIP_AYAR_ANAHTARI, JSON.stringify({
            aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null,
        }));
        (Location.getForegroundPermissionsAsync as jest.Mock)
            .mockRejectedValueOnce(new Error('izin kontrol hatasi')) // yenidenBaslat'in kontrolu
            .mockResolvedValue({ status: 'granted' });                // baslat'in kontrolu
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        expect(sonuc).toBe(true);
        expect(Location.startGeofencingAsync).toHaveBeenCalled();
    });

    it('ayarlar bozuk JSON ise false donmeli (guvenli varsayilan)', async () => {
        // ayarlariGetir bozuk JSON'da CATCH'e dusup varsayilan {aktif:false} doner ->
        // yenidenBaslat "aktif degil" yoluyla guvenli false doner (cokme yok).
        mockStore.set(TAKIP_AYAR_ANAHTARI, '{bozuk json');
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        expect(sonuc).toBe(false);
        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
    });

    it('izin iptal yolunda disk yazma patlarsa cokmeden false donmeli (dis catch)', async () => {
        mockStore.set(TAKIP_AYAR_ANAHTARI, JSON.stringify({
            aktif: true, sonKoordinatlar: null, sonGuncellemeTarihi: null,
        }));
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
        (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk dolu'));
        const servis = yeniServis();

        const sonuc = await servis.yenidenBaslat();

        expect(sonuc).toBe(false);
        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
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
        (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
        const servis = yeniServis();

        const durum = await servis.durumBilgisiGetir();

        // Profil okuma catch'e dustu -> VARSAYILAN_TAKIP_HASSASIYETI ('dengeli') -> 5000m
        expect(durum.minimumMesafe).toBe(5000);
        expect(durum.takipAktif).toBe(false);
        expect(durum.arkaPlanIzniVar).toBe(false);
    });

    it('TANINMAYAN hassasiyet degeri varsayilan dengeli profile (5km) DUSMELI', async () => {
        mockStore.set(KONUM_ANAHTARI, JSON.stringify({ takipHassasiyeti: 'bilinmeyen_mod' }));
        const servis = yeniServis();

        const durum = await servis.durumBilgisiGetir();

        expect(durum.minimumMesafe).toBe(5000);
    });
});

describe('arka plan bolge gorevi — kalicilik ve hata yutma', () => {
    it('muhafiz yapilandirVePlanla HATA atsa bile koordinat guncellemesi kalici olmali', async () => {
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
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(39.9208, 32.8541));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ district: 'Cankaya', city: 'Ankara' }]);

        await expect(bolgeGorevi(cikisOlayi())).resolves.toBeUndefined();

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
            koordinatlar: { lat: 41.0369, lng: 28.9850 },
        }));
        mockStore.set('muhafiz_ayarlari', JSON.stringify({ aktif: true }));
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(39.9208, 32.8541));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ district: 'Cankaya', city: 'Ankara' }]);

        await bolgeGorevi(cikisOlayi());

        expect(yapilandirVePlanlaMock).toHaveBeenCalledTimes(1);
        const iletilen = yapilandirVePlanlaMock.mock.calls[0][0];
        // Faz 3: varsayilan esik (45/25/10/3) + siklik (15/10/5/1) degerlerinden
        // MATRIS turetilerek iletilmeli (5 vakit x 4 seviye).
        const ogle = iletilen.matris.ogle.seviyeler;
        expect(ogle).toHaveLength(4);
        expect(ogle[0].esikDk).toBe(45);
        expect(ogle[0].siklik).toEqual({ herDk: 15 });
        expect(ogle[3].esikDk).toBe(3);
        expect(ogle[3].siklik).toEqual({ herDk: 1 });
        expect(iletilen.koordinatlar.lat).toBeCloseTo(39.9208);
    });

    it('diskteki MATRIS varsa konum degisiminde de o kullanilir (bayat global esikler EZMEZ)', async () => {
        const yapilandirVePlanlaMock = jest.fn().mockResolvedValue(undefined);
        const { ArkaplanMuhafizServisi } = require('../ArkaplanMuhafizServisi');
        (ArkaplanMuhafizServisi.getInstance as jest.Mock).mockReturnValue({
            yapilandirVePlanla: yapilandirVePlanlaMock,
        });

        mockStore.set(KONUM_ANAHTARI, JSON.stringify({
            konumModu: 'oto',
            takipHassasiyeti: 'dengeli',
            koordinatlar: { lat: 41.0369, lng: 28.9850 },
        }));
        const matris = eskidenMatriseGoc({
            esikler: { seviye1: 45, seviye2: 25, seviye3: 10, seviye4: 3 },
            sikliklar: { seviye1: 15, seviye2: 10, seviye3: 5, seviye4: 1 },
        });
        matris.aksam.seviyeler[0].esikDk = 77;
        mockStore.set('muhafiz_ayarlari', JSON.stringify({
            aktif: true,
            esikler: { seviye1: 5, seviye2: 4, seviye3: 3, seviye4: 2 }, // BAYAT
            matris,
        }));
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(39.9208, 32.8541));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ district: 'Cankaya', city: 'Ankara' }]);

        await bolgeGorevi(cikisOlayi());

        const iletilen = yapilandirVePlanlaMock.mock.calls[0][0];
        expect(iletilen.matris.aksam.seviyeler[0].esikDk).toBe(77);
        expect(iletilen.matris.ogle.seviyeler[0].esikDk).toBe(45); // bayat 5 sizmamali
    });

    it('geocode district/city YOKSA subregion/region alanlarina DUSMELI (alan fallback)', async () => {
        mockStore.set(KONUM_ANAHTARI, JSON.stringify({
            konumModu: 'oto',
            takipHassasiyeti: 'dengeli',
            koordinatlar: { lat: 41.0369, lng: 28.9850 },
        }));
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(39.9208, 32.8541));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
            { district: null, subregion: 'TasraIlce', city: null, region: 'TasraIl' },
        ]);

        await bolgeGorevi(cikisOlayi());

        const yazilan = JSON.parse(mockStore.get(KONUM_ANAHTARI)!);
        expect(yazilan.gpsAdres.ilce).toBe('TasraIlce'); // subregion fallback
        expect(yazilan.gpsAdres.il).toBe('TasraIl');     // region fallback
    });

    it('konum ayarlari BOZUK JSON ise gorev cokmeden sessizce cikmali (dis catch)', async () => {
        mockStore.set(KONUM_ANAHTARI, '{"konumModu":"oto", BOZUK');

        await expect(bolgeGorevi(cikisOlayi())).resolves.toBeUndefined();
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
        expect(Location.reverseGeocodeAsync).not.toHaveBeenCalled();
        expect(Location.startGeofencingAsync).not.toHaveBeenCalled();
    });

    it('KALICILIK: bilinmeyen alanlar korunmali (tip diskteki semanin tamami degildir)', async () => {
        // Konum blob'u tarihsel olarak tiplenmemis alanlar tasiyabilir
        // (ArkaplanGorevServisi hala okuyor). Yazma yolu onlari SILMEMELI.
        mockStore.set(KONUM_ANAHTARI, JSON.stringify({
            konumModu: 'oto',
            takipHassasiyeti: 'dengeli',
            koordinatlar: { lat: 41.0369, lng: 28.9850 },
            bilinmeyenAlan: 'korunmali',
        }));
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(tazeKonum(39.9208, 32.8541));
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        await bolgeGorevi(cikisOlayi());

        const yazilan = JSON.parse(mockStore.get(KONUM_ANAHTARI)!);
        expect(yazilan.bilinmeyenAlan).toBe('korunmali');
        expect(yazilan.takipHassasiyeti).toBe('dengeli');
    });
});
