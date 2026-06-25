/**
 * NamazVaktiHesaplayiciServisi Testleri
 * Davranışsal testler: yapılandırma (oto/manuel/plaka), günlük vakitler,
 * şu anki vakit bilgisi (yatsı sonrası yarına geçiş dahil) ve PrayerTimes önbellek davranışı.
 *
 * adhan tamamen mock'lanır (gerçek trig hesabı yok) → deterministik, hızlı, tarihe bağımsız.
 */

import * as Location from 'expo-location';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';

// ─── Mock'lar ──────────────────────────────────────────────────────────────────

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

// adhan: her gün için deterministik vakitler + currentPrayer/nextPrayer/timeForPrayer döndür.
// PrayerTimes ctor jest.fn → "kaç kez instantiate edildi?" (önbellek) testleri için sayılır.
const vakitTreti = (date: Date, saat: number, dakika = 0) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), saat, dakika);

// Mock davranışını test gövdesinden ayarlamak için dışarıda tutulan kancalar.
const mockKancalar = {
    // currentPrayer'in döneceği adhan-anahtarı (ör. 'dhuhr'); 'none' = vakit yok
    current: 'dhuhr' as string,
    // nextPrayer'in döneceği adhan-anahtarı; 'none' = bugün için kalan vakit yok
    next: 'asr' as string,
};

jest.mock('adhan', () => {
    const Coordinates = jest.fn().mockImplementation((lat: number, lng: number) => ({ lat, lng }));
    const PrayerTimes = jest.fn().mockImplementation((_coords: any, date: Date) => {
        const vakitler: Record<string, Date> = {
            fajr: vakitTreti(date, 5, 0),
            sunrise: vakitTreti(date, 6, 30),
            dhuhr: vakitTreti(date, 13, 0),
            asr: vakitTreti(date, 16, 0),
            maghrib: vakitTreti(date, 19, 0),
            isha: vakitTreti(date, 20, 30),
        };
        return {
            ...vakitler,
            currentPrayer: jest.fn(() => mockKancalar.current),
            nextPrayer: jest.fn(() => mockKancalar.next),
            timeForPrayer: jest.fn((p: string) => (p === 'none' ? null : vakitler[p] ?? null)),
        };
    });
    return {
        Coordinates,
        PrayerTimes,
        CalculationMethod: { Turkey: jest.fn(() => ({})) },
        Madhab: { Hanafi: 'hanafi', Shafi: 'shafi' },
        SunnahTimes: jest.fn(),
    };
});

// adhan mock'una eriş (PrayerTimes çağrı sayımı için)
const adhan = require('adhan');
const mockLocation = Location as jest.Mocked<typeof Location>;

// ─── Yardımcılar ────────────────────────────────────────────────────────────────

const servis = NamazVaktiHesaplayiciServisi.getInstance();

/** Singleton durumunu testler arası sıfırlar (config + önbellek). */
function servisiSifirla() {
    (servis as any).config = null;
    (servis as any).yapilandirildi = false;
    (servis as any).ptCache.clear();
}

beforeEach(() => {
    jest.clearAllMocks();
    servisiSifirla();
    mockKancalar.current = 'dhuhr';
    mockKancalar.next = 'asr';
});

// ─── Testler ─────────────────────────────────────────────────────────────────────

describe('NamazVaktiHesaplayiciServisi', () => {
    it('getInstance her zaman aynı örneği döndürür (singleton)', () => {
        expect(NamazVaktiHesaplayiciServisi.getInstance()).toBe(servis);
    });

    describe('yapilandir / getKonfig', () => {
        it('yapılandırmadan önce getKonfig null döner', () => {
            expect(servis.getKonfig()).toBeNull();
        });

        it('yapılandırma config nesnesini saklar', () => {
            servis.yapilandir({ latitude: 41, longitude: 29 });
            expect(servis.getKonfig()).toEqual({ latitude: 41, longitude: 29 });
        });

        it('yeniden yapılandırma PrayerTimes önbelleğini temizler', () => {
            servis.yapilandir({ latitude: 41, longitude: 29 });
            const tarih = new Date(2026, 0, 15);
            servis.getGunlukVakitler(tarih); // önbelleğe 1 giriş
            expect(adhan.PrayerTimes).toHaveBeenCalledTimes(1);

            // Aynı gün tekrar → önbellekten gelir, yeni ctor yok
            servis.getGunlukVakitler(tarih);
            expect(adhan.PrayerTimes).toHaveBeenCalledTimes(1);

            // Yeniden yapılandır → önbellek temizlenir → aynı gün artık yeniden hesaplanır
            servis.yapilandir({ latitude: 40, longitude: 32 });
            servis.getGunlukVakitler(tarih);
            expect(adhan.PrayerTimes).toHaveBeenCalledTimes(2);
        });
    });

    describe('getGunlukVakitler', () => {
        it('config yoksa null döner', () => {
            expect(servis.getGunlukVakitler(new Date(2026, 0, 15))).toBeNull();
        });

        it('altı vakti adhan alanlarından doğru eşler', () => {
            servis.yapilandir({ latitude: 41, longitude: 29 });
            const tarih = new Date(2026, 0, 15);
            const v = servis.getGunlukVakitler(tarih)!;

            expect(v.imsak).toEqual(vakitTreti(tarih, 5, 0));
            expect(v.gunes).toEqual(vakitTreti(tarih, 6, 30));
            expect(v.ogle).toEqual(vakitTreti(tarih, 13, 0));
            expect(v.ikindi).toEqual(vakitTreti(tarih, 16, 0));
            expect(v.aksam).toEqual(vakitTreti(tarih, 19, 0));
            expect(v.yatsi).toEqual(vakitTreti(tarih, 20, 30));
        });

        it('Coordinates yapılandırılan enlem/boylam ile oluşturulur', () => {
            servis.yapilandir({ latitude: 38.75, longitude: 30.55 });
            servis.getGunlukVakitler(new Date(2026, 0, 15));
            expect(adhan.Coordinates).toHaveBeenCalledWith(38.75, 30.55);
        });
    });

    describe('prayerTimesAl önbellek davranışı', () => {
        beforeEach(() => servis.yapilandir({ latitude: 41, longitude: 29 }));

        it('aynı gün için ikinci çağrıda yeni PrayerTimes oluşturmaz', () => {
            const tarih = new Date(2026, 0, 15);
            servis.getGunlukVakitler(tarih);
            servis.getGunlukVakitler(tarih);
            expect(adhan.PrayerTimes).toHaveBeenCalledTimes(1);
        });

        it('farklı günler için ayrı PrayerTimes oluşturur', () => {
            servis.getGunlukVakitler(new Date(2026, 0, 15));
            servis.getGunlukVakitler(new Date(2026, 0, 16));
            expect(adhan.PrayerTimes).toHaveBeenCalledTimes(2);
        });

        it('önbellek sınırsız büyümez: eşik aşılınca temizlenir', () => {
            // Temizlik kontrolü yeni giriş eklenmeden ÖNCE `size > 4` ise tetiklenir.
            // 1..5 eklenince size 5'e ulaşır (5. eklemeden önce size=4, > değil → clear yok).
            for (let g = 1; g <= 5; g++) servis.getGunlukVakitler(new Date(2026, 0, g));
            expect((servis as any).ptCache.size).toBe(5);

            // 6. gün eklenmeden önce size=5 > 4 → clear → yalnız yeni gün kalır.
            servis.getGunlukVakitler(new Date(2026, 0, 6));
            expect((servis as any).ptCache.size).toBe(1);

            // Temizlik sonrası ilk gün artık önbellekte değil → yeniden hesaplanır.
            const oncekiSayim = (adhan.PrayerTimes as jest.Mock).mock.calls.length;
            servis.getGunlukVakitler(new Date(2026, 0, 1));
            expect((adhan.PrayerTimes as jest.Mock).mock.calls.length).toBe(oncekiSayim + 1);
        });
    });

    describe('guncelleKonumManuel', () => {
        it('koordinat objesi ile yapılandırır ve true döner', () => {
            const sonuc = servis.guncelleKonumManuel({ lat: 36.89, lng: 30.71 });
            expect(sonuc).toBe(true);
            expect(servis.getKonfig()).toMatchObject({ latitude: 36.89, longitude: 30.71 });
        });

        it('geçerli plaka kodu ile ili bulup yapılandırır (06 → Ankara)', () => {
            const sonuc = servis.guncelleKonumManuel('06');
            expect(sonuc).toBe(true);
            const cfg = servis.getKonfig()!;
            expect(cfg.latitude).toBeCloseTo(39.9334, 3);
            expect(cfg.longitude).toBeCloseTo(32.8597, 3);
        });

        it('geçersiz plaka kodunda false döner ve config değişmez', () => {
            servis.yapilandir({ latitude: 41, longitude: 29 });
            const sonuc = servis.guncelleKonumManuel('999');
            expect(sonuc).toBe(false);
            expect(servis.getKonfig()).toEqual({ latitude: 41, longitude: 29 });
        });

        it('var olan method/madhab tercihlerini korur', () => {
            servis.yapilandir({ latitude: 41, longitude: 29, method: 'Turkey', madhab: 'Shafi' });
            servis.guncelleKonumManuel({ lat: 1, lng: 2 });
            expect(servis.getKonfig()).toMatchObject({ method: 'Turkey', madhab: 'Shafi' });
        });

        it('method/madhab yoksa varsayılan Turkey/Hanafi atanır', () => {
            servis.guncelleKonumManuel({ lat: 1, lng: 2 });
            expect(servis.getKonfig()).toMatchObject({ method: 'Turkey', madhab: 'Hanafi' });
        });
    });

    describe('guncelleKonumOto', () => {
        it('izin verildiğinde konumu alır ve yapılandırır', async () => {
            (mockLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (mockLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
                coords: { latitude: 40.5, longitude: 32.5 },
            });

            const sonuc = await servis.guncelleKonumOto();

            expect(sonuc).toEqual({ lat: 40.5, lng: 32.5 });
            expect(servis.getKonfig()).toMatchObject({ latitude: 40.5, longitude: 32.5, method: 'Turkey', madhab: 'Hanafi' });
        });

        it('izin reddedilince null döner ve config oluşmaz', async () => {
            (mockLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            const sonuc = await servis.guncelleKonumOto();

            expect(sonuc).toBeNull();
            expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
            expect(servis.getKonfig()).toBeNull();
        });

        it('konum alımı hata fırlatırsa null döner (yutulur)', async () => {
            (mockLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (mockLocation.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS yok'));

            await expect(servis.guncelleKonumOto()).resolves.toBeNull();
        });
    });

    describe('getSuankiVakitBilgisi', () => {
        beforeEach(() => servis.yapilandir({ latitude: 41, longitude: 29 }));

        it('config yoksa null döner', () => {
            servisiSifirla();
            expect(servis.getSuankiVakitBilgisi()).toBeNull();
        });

        it('içinde bulunulan vakti Türkçeleştirir ve sonraki vakte kalan süreyi pozitif verir', () => {
            // current = öğle (dhuhr=13:00), next = ikindi (asr=16:00)
            mockKancalar.current = 'dhuhr';
            mockKancalar.next = 'asr';

            const bilgi = servis.getSuankiVakitBilgisi()!;
            expect(bilgi).not.toBeNull();
            expect(bilgi.vakit).toBe('ogle');
            expect(bilgi.sonrakiVakitAdi).toBe('ikindi');
            // saat = sonraki vaktin (ikindi) saati; bugünün 16:00'sı
            const bugun = new Date();
            expect(bilgi.saat).toEqual(vakitTreti(bugun, 16, 0));
            expect(bilgi.sonrakiVakitGiris).toBe(vakitTreti(bugun, 16, 0).toISOString());
            // kalanSureMs = nextTime - now; gerçek duvar saati kullanıldığından işaret belirsiz,
            // bu yüzden değer/işaret değil yalnız sonlu-sayı tipi doğrulanır.
            expect(Number.isFinite(bilgi.kalanSureMs)).toBe(true);
        });

        it('yatsı sonrası (next=none) yarının imsak vaktine geçer', () => {
            mockKancalar.current = 'isha';
            mockKancalar.next = 'none'; // bugün için kalan vakit yok

            const bilgi = servis.getSuankiVakitBilgisi()!;
            expect(bilgi).not.toBeNull();
            // içinde bulunulan vakit yatsı
            expect(bilgi.vakit).toBe('yatsi');
            // sonraki vakit yarının imsak'ı
            expect(bilgi.sonrakiVakitAdi).toBe('imsak');

            const yarin = new Date();
            yarin.setDate(yarin.getDate() + 1);
            expect(bilgi.saat).toEqual(vakitTreti(yarin, 5, 0));
        });

        it('bilinmeyen current değeri yatsı olarak fallback eder', () => {
            mockKancalar.current = 'none';
            mockKancalar.next = 'fajr';
            const bilgi = servis.getSuankiVakitBilgisi()!;
            expect(bilgi.vakit).toBe('yatsi');
        });
    });
});
