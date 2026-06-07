/**
 * KonumYoneticiServisi Unit Testleri
 */

// Mock expo-location before importing the service
jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(),
    requestForegroundPermissionsAsync: jest.fn(),
    getLastKnownPositionAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
    Accuracy: { Low: 1 },
}));

import * as Location from 'expo-location';
import { KonumYoneticiServisi } from '../KonumYoneticiServisi';

// expo-location mock'unu tipli erişmek için kısa yardımcılar
const mockGetForegroundIzni = Location.getForegroundPermissionsAsync as jest.Mock;
const mockRequestForegroundIzni = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockSonBilinenKonum = Location.getLastKnownPositionAsync as jest.Mock;
const mockGuncelKonum = Location.getCurrentPositionAsync as jest.Mock;
const mockTersGeokod = Location.reverseGeocodeAsync as jest.Mock;

// expo-location konum nesnesi (LocationObject) üreten yardımcı
const konumNesnesiYap = (lat: number, lng: number) => ({
    coords: {
        latitude: lat,
        longitude: lng,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
    },
    timestamp: 0,
});

describe('KonumYoneticiServisi', () => {
    let servis: KonumYoneticiServisi;

    beforeEach(() => {
        servis = KonumYoneticiServisi.getInstance();
        servis.sifirla();
        mockGetForegroundIzni.mockReset();
        mockRequestForegroundIzni.mockReset();
        mockSonBilinenKonum.mockReset();
        mockGuncelKonum.mockReset();
        mockTersGeokod.mockReset();
    });

    describe('getInstance', () => {
        it('singleton instance döndürmeli', () => {
            const instance1 = KonumYoneticiServisi.getInstance();
            const instance2 = KonumYoneticiServisi.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('koordinatlarAyarla', () => {
        it('koordinatları doğru şekilde ayarlamalı', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784);
            const koordinatlar = servis.getKoordinatlar();

            expect(koordinatlar).not.toBeNull();
            expect(koordinatlar?.lat).toBe(41.0082);
            expect(koordinatlar?.lng).toBe(28.9784);
        });

        it('sonGuncelleme alanını güncellemeli', () => {
            servis.koordinatlarAyarla(39.9334, 32.8597);
            const durum = servis.getDurum();

            expect(durum.sonGuncelleme).not.toBeNull();
        });
    });

    describe('sonrakiGunImsakVaktiGetir', () => {
        it('koordinat yoksa null döndürmeli', () => {
            servis.sifirla();
            // Koordinatları temizle
            const durum = servis.getDurum();
            servis.durumYukle({ ...durum, koordinatlar: null });

            const vakit = servis.sonrakiGunImsakVaktiGetir();
            expect(vakit).toBeNull();
        });

        it('koordinat varsa Date döndürmeli', () => {
            // İstanbul koordinatları
            servis.koordinatlarAyarla(41.0082, 28.9784);

            const vakit = servis.sonrakiGunImsakVaktiGetir();

            expect(vakit).not.toBeNull();
            expect(vakit).toBeInstanceOf(Date);
        });

        it('yarının imsak vakti yarın tarihinde ve bugünden sonra olmalı', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784);

            const vakit = servis.sonrakiGunImsakVaktiGetir();
            const simdi = new Date();
            const yarin = new Date();
            yarin.setDate(yarin.getDate() + 1);

            expect(vakit).not.toBeNull();
            expect(Number.isNaN(vakit!.getTime())).toBe(false); // geçerli Date (Invalid Date değil)

            // Dönen tarih GERÇEKTEN yarın olmalı (gün sınırı / off-by-one regresyonunu yakalar)
            expect(vakit!.getDate()).toBe(yarin.getDate());
            expect(vakit!.getMonth()).toBe(yarin.getMonth());
            expect(vakit!.getFullYear()).toBe(yarin.getFullYear());

            // Her durumda gelecekte olmalı (gece yarısı-fajr arası koşullardan bağımsız)
            expect(vakit!.getTime()).toBeGreaterThan(simdi.getTime());

            // İmsak makul sabah aralığında (İstanbul yerel saati; CI UTC olabilir,
            // bu yüzden Europe/Istanbul'a sabitle). Yanlış method/açı regresyonunu yakalar.
            const saatStr = vakit!.toLocaleString('en-US', {
                timeZone: 'Europe/Istanbul',
                hour: '2-digit',
                hour12: false,
            });
            const saat = parseInt(saatStr, 10);
            expect(saat).toBeGreaterThanOrEqual(2);
            expect(saat).toBeLessThanOrEqual(7);
        });
    });

    describe('bugunImsakVaktiGetir', () => {
        it('koordinat varsa bugünün imsak vaktini döndürmeli', () => {
            servis.koordinatlarAyarla(41.0082, 28.9784); // İstanbul
            const simdi = new Date();

            const vakit = servis.bugunImsakVaktiGetir();

            expect(vakit).not.toBeNull();
            expect(vakit).toBeInstanceOf(Date);
            expect(Number.isNaN(vakit!.getTime())).toBe(false); // geçerli Date (Invalid Date değil)

            // İmsak/fajr makul bir sabah aralığında olmalı (İstanbul için yıl boyu ~03:00-06:30).
            // CI UTC olabileceğinden Europe/Istanbul'a sabitle; yanlış method/açı regresyonunu yakalar.
            const saatStr = vakit!.toLocaleString('en-US', {
                timeZone: 'Europe/Istanbul',
                hour: '2-digit',
                hour12: false,
            });
            const saat = parseInt(saatStr, 10);
            expect(saat).toBeGreaterThanOrEqual(2);
            expect(saat).toBeLessThanOrEqual(7);

            // Dönen Date'in günü = bugün olmalı (gece yarısı sınırı / yanlış gün regresyonunu yakalar)
            expect(vakit!.getFullYear()).toBe(simdi.getFullYear());
            expect(vakit!.getMonth()).toBe(simdi.getMonth());
            expect(vakit!.getDate()).toBe(simdi.getDate());
        });
    });

    describe('getKonumMetni', () => {
        it('il adı varsa il adını döndürmeli', () => {
            servis.durumYukle({
                modu: 'manuel',
                ilAdi: 'İstanbul',
                ilceAdi: '',
            });

            const metin = servis.getKonumMetni();
            expect(metin).toBe('İstanbul');
        });

        it('il ve ilçe adı varsa ikisini birlikte döndürmeli', () => {
            servis.durumYukle({
                modu: 'manuel',
                ilAdi: 'İstanbul',
                ilceAdi: 'Kadıköy',
            });

            const metin = servis.getKonumMetni();
            expect(metin).toBe('Kadıköy, İstanbul');
        });

        it('konum yoksa varsayılan metin döndürmeli', () => {
            servis.durumYukle({
                modu: 'manuel',
                ilAdi: '',
                ilceAdi: '',
            });

            const metin = servis.getKonumMetni();
            expect(metin).toBe('Konum seçilmedi');
        });
    });

    describe('sifirla', () => {
        it('durumu varsayılan değerlere sıfırlamalı', () => {
            servis.koordinatlarAyarla(40.0, 30.0);
            servis.durumYukle({ ilAdi: 'Ankara', ilId: 6 });

            servis.sifirla();

            const durum = servis.getDurum();
            expect(durum.ilAdi).toBe('İstanbul');
            expect(durum.ilId).toBe(34);
            expect(durum.koordinatlar).toBeNull();
        });
    });

    describe('gpsIzniKontrolEt', () => {
        it("izin 'granted' ise true dönmeli ve gpsIzniVar=true olmalı", async () => {
            mockGetForegroundIzni.mockResolvedValue({ status: 'granted' });

            const sonuc = await servis.gpsIzniKontrolEt();

            expect(sonuc).toBe(true);
            expect(servis.getDurum().gpsIzniVar).toBe(true);
        });

        it("izin 'granted' değilse (örn. 'denied') false dönmeli ve gpsIzniVar=false olmalı", async () => {
            mockGetForegroundIzni.mockResolvedValue({ status: 'denied' });

            const sonuc = await servis.gpsIzniKontrolEt();

            expect(sonuc).toBe(false);
            expect(servis.getDurum().gpsIzniVar).toBe(false);
        });

        it('izin sorgusu hata fırlatırsa çökmeden false dönmeli (graceful degradation)', async () => {
            mockGetForegroundIzni.mockRejectedValue(new Error('servis kapalı'));

            const sonuc = await servis.gpsIzniKontrolEt();

            expect(sonuc).toBe(false);
            expect(servis.getDurum().gpsIzniVar).toBe(false);
        });
    });

    describe('gpsKonumuAl', () => {
        it("izin reddedilirse null dönmeli, GPS sorgulanmamalı ve gpsIzniVar=false olmalı", async () => {
            mockRequestForegroundIzni.mockResolvedValue({ status: 'denied' });

            const sonuc = await servis.gpsKonumuAl();

            expect(sonuc).toBeNull();
            expect(servis.getDurum().gpsIzniVar).toBe(false);
            // İzin yoksa GPS donanımına HİÇ gidilmemeli (gizlilik + pil)
            expect(mockSonBilinenKonum).not.toHaveBeenCalled();
            expect(mockGuncelKonum).not.toHaveBeenCalled();
        });

        it('son bilinen konum varsa GPS (getCurrentPositionAsync) ÇAĞRILMAMALI (pil optimizasyonu)', async () => {
            mockRequestForegroundIzni.mockResolvedValue({ status: 'granted' });
            mockSonBilinenKonum.mockResolvedValue(konumNesnesiYap(41.0082, 28.9784));
            mockTersGeokod.mockResolvedValue([{ district: 'Kadıköy', city: 'İstanbul' }]);

            const sonuc = await servis.gpsKonumuAl();

            expect(sonuc).not.toBeNull();
            expect(sonuc?.koordinatlar).toEqual({ lat: 41.0082, lng: 28.9784 });
            // Son bilinen konum yeterli → maliyetli GPS çağrısı yapılmamalı
            expect(mockSonBilinenKonum).toHaveBeenCalledTimes(1);
            expect(mockGuncelKonum).not.toHaveBeenCalled();
        });

        it('son bilinen konum yoksa GPS (getCurrentPositionAsync) fallback olarak çağrılmalı', async () => {
            mockRequestForegroundIzni.mockResolvedValue({ status: 'granted' });
            mockSonBilinenKonum.mockResolvedValue(null);
            mockGuncelKonum.mockResolvedValue(konumNesnesiYap(39.9334, 32.8597));
            mockTersGeokod.mockResolvedValue([{ district: 'Çankaya', city: 'Ankara' }]);

            const sonuc = await servis.gpsKonumuAl();

            expect(sonuc?.koordinatlar).toEqual({ lat: 39.9334, lng: 32.8597 });
            expect(mockGuncelKonum).toHaveBeenCalledTimes(1);
        });

        it('başarılı akışta durum.modu=gps, koordinat, gpsAdres ve sonGuncelleme set edilmeli', async () => {
            mockRequestForegroundIzni.mockResolvedValue({ status: 'granted' });
            mockSonBilinenKonum.mockResolvedValue(konumNesnesiYap(41.0082, 28.9784));
            mockTersGeokod.mockResolvedValue([{ district: 'Kadıköy', city: 'İstanbul' }]);

            const sonuc = await servis.gpsKonumuAl();
            const durum = servis.getDurum();

            expect(sonuc?.adres).toEqual({ semt: '', ilce: 'Kadıköy', il: 'İstanbul' });
            expect(durum.modu).toBe('gps');
            expect(durum.gpsIzniVar).toBe(true);
            expect(durum.koordinatlar).toEqual({ lat: 41.0082, lng: 28.9784 });
            expect(durum.gpsAdres).toEqual({ semt: '', ilce: 'Kadıköy', il: 'İstanbul' });
            expect(durum.sonGuncelleme).not.toBeNull();
        });

        it("reverseGeocode subregion/region alanlarına düşmeli (district/city yoksa)", async () => {
            mockRequestForegroundIzni.mockResolvedValue({ status: 'granted' });
            mockSonBilinenKonum.mockResolvedValue(konumNesnesiYap(41.0, 29.0));
            // district/city boş → ilce subregion'a, il region'a düşmeli
            mockTersGeokod.mockResolvedValue([
                { district: null, subregion: 'Üsküdar', city: null, region: 'İstanbul' },
            ]);

            const sonuc = await servis.gpsKonumuAl();

            expect(sonuc?.adres).toEqual({ semt: '', ilce: 'Üsküdar', il: 'İstanbul' });
        });

        it('reverseGeocode hata fırlatsa bile koordinatlar set edilmeli, adres boş kalmalı (graceful degradation)', async () => {
            mockRequestForegroundIzni.mockResolvedValue({ status: 'granted' });
            mockSonBilinenKonum.mockResolvedValue(konumNesnesiYap(41.0082, 28.9784));
            mockTersGeokod.mockRejectedValue(new Error('geocode servis hatası'));

            const sonuc = await servis.gpsKonumuAl();
            const durum = servis.getDurum();

            // Geocode başarısız → akış çökmemeli; koordinat yine de kullanılabilir olmalı
            expect(sonuc).not.toBeNull();
            expect(sonuc?.koordinatlar).toEqual({ lat: 41.0082, lng: 28.9784 });
            expect(sonuc?.adres).toEqual({ semt: '', ilce: '', il: '' });
            expect(durum.koordinatlar).toEqual({ lat: 41.0082, lng: 28.9784 });
            expect(durum.gpsAdres).toEqual({ semt: '', ilce: '', il: '' });
        });
    });

    describe('manuelKonumAyarla', () => {
        const istanbulIl = { id: 34, ad: 'İstanbul', plakaKodu: '34', lat: 41.0082, lng: 28.9784 };

        it('ilçe koordinatı varsa il koordinatı yerine ilçe koordinatı kullanılmalı', async () => {
            const kadikoy = { id: 1, ilId: 34, ad: 'Kadıköy', lat: 40.9833, lng: 29.0833 };

            await servis.manuelKonumAyarla(istanbulIl, kadikoy);
            const durum = servis.getDurum();

            expect(durum.modu).toBe('manuel');
            expect(durum.ilId).toBe(34);
            expect(durum.ilceId).toBe(1);
            expect(durum.ilceAdi).toBe('Kadıköy');
            // İl (41.0082/28.9784) değil ilçe (40.9833/29.0833) koordinatı set edilmeli
            expect(durum.koordinatlar).toEqual({ lat: 40.9833, lng: 29.0833 });
            // Manuel konum GPS adresini temizlemeli
            expect(durum.gpsAdres).toBeNull();
        });

        it('ilçe verilmezse il koordinatı kullanılmalı ve ilceId/ilceAdi temizlenmeli', async () => {
            // Önce kirli bir ilçe durumu kur ki temizlik gerçekten doğrulanabilsin
            servis.durumYukle({ ilceId: 99, ilceAdi: 'Eski İlçe' });

            await servis.manuelKonumAyarla(istanbulIl);
            const durum = servis.getDurum();

            expect(durum.koordinatlar).toEqual({ lat: 41.0082, lng: 28.9784 });
            expect(durum.ilceId).toBeNull();
            expect(durum.ilceAdi).toBe('');
        });
    });

    describe('getKonumMetni (GPS modu)', () => {
        it("modu=gps ve ilçe+il varsa 'ilçe, il' döndürmeli", () => {
            servis.durumYukle({
                modu: 'gps',
                gpsAdres: { semt: '', ilce: 'Kadıköy', il: 'İstanbul' },
            });

            expect(servis.getKonumMetni()).toBe('Kadıköy, İstanbul');
        });

        it('modu=gps ve sadece il varsa sadece il adını döndürmeli', () => {
            servis.durumYukle({
                modu: 'gps',
                gpsAdres: { semt: '', ilce: '', il: 'İstanbul' },
            });

            expect(servis.getKonumMetni()).toBe('İstanbul');
        });

        it("modu=gps ama adres boşsa 'GPS Konumu' fallback'i dönmeli", () => {
            servis.durumYukle({
                modu: 'gps',
                gpsAdres: { semt: '', ilce: '', il: '' },
            });

            expect(servis.getKonumMetni()).toBe('GPS Konumu');
        });
    });

    describe('namaz vakti doğruluğu (sabit sistem saati ile referans değer)', () => {
        // Üretim 'bugün'ü new Date()'ten alır. CI UTC olabileceğinden öğlen-UTC bir an seç:
        // 2026-06-15T12:00:00Z hem UTC'de hem Europe/Istanbul'da (15:00) aynı takvim günü → gün sınırı flaky'liği yok.
        const SABIT_AN = new Date('2026-06-15T12:00:00Z');

        // Bir Date'i Europe/Istanbul'da 'HH:MM' string'ine çevir (CI timezone'undan bağımsız doğrulama)
        const istanbulSaatDk = (d: Date) =>
            d.toLocaleString('en-US', {
                timeZone: 'Europe/Istanbul',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        // 'HH:MM' → gün-içi dakikaya çevir (referansa yakınlık karşılaştırması için)
        const dakikayaCevir = (hhmm: string) => {
            const [s, dk] = hhmm.split(':').map((x) => parseInt(x, 10));
            return s * 60 + dk;
        };

        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(SABIT_AN);
            servis.sifirla();
            servis.koordinatlarAyarla(41.0082, 28.9784); // İstanbul
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("bugünün imsak'ı İstanbul için bilinen referans (~03:24) değere yakın olmalı", () => {
            const vakit = servis.bugunImsakVaktiGetir();

            expect(vakit).not.toBeNull();
            // 2026-06-15 İstanbul imsak ≈ 03:24 (CalculationMethod.Turkey). ±10 dk tolerans:
            // yanlış method/açı (örn. ISNA, MWL) 30+ dk kayar → bu sınır onu yakalar.
            const referans = dakikayaCevir('03:24');
            const gercek = dakikayaCevir(istanbulSaatDk(vakit!));
            expect(Math.abs(gercek - referans)).toBeLessThanOrEqual(10);
        });

        it("bugünün yatsı'sı İstanbul için bilinen referans (~22:36) değere yakın olmalı", () => {
            const vakit = servis.bugunYatsiVaktiGetir();

            expect(vakit).not.toBeNull();
            // 2026-06-15 İstanbul yatsı ≈ 22:36 (CalculationMethod.Turkey). ±10 dk tolerans.
            const referans = dakikayaCevir('22:36');
            const gercek = dakikayaCevir(istanbulSaatDk(vakit!));
            expect(Math.abs(gercek - referans)).toBeLessThanOrEqual(10);
        });

        it('imsak ile yatsı aynı gün içinde ve imsak yatsıdan önce olmalı (vakit sırası doğruluğu)', () => {
            const imsak = servis.bugunImsakVaktiGetir();
            const yatsi = servis.bugunYatsiVaktiGetir();

            expect(imsak).not.toBeNull();
            expect(yatsi).not.toBeNull();
            // İmsak sabah, yatsı gece → imsak kesinlikle daha erken olmalı
            expect(imsak!.getTime()).toBeLessThan(yatsi!.getTime());
        });

        it("sonrakiGunImsakVaktiGetir bugünün değil YARIN'ın imsakını dönmeli (~24 saat sonra, off-by-one)", () => {
            const yarinImsak = servis.sonrakiGunImsakVaktiGetir();
            const bugunImsak = servis.bugunImsakVaktiGetir();

            expect(yarinImsak).not.toBeNull();
            expect(bugunImsak).not.toBeNull();

            // Yarının imsakı bugünden ~24 saat sonra olmalı; yanlışlıkla bugünün imsakı dönerse fark ~0 olur.
            // TZ'den bağımsız tek invariant: iki ardışık imsak arası 23-25 saat. (DST yok → tam ~24 saat.)
            const farkSaat = (yarinImsak!.getTime() - bugunImsak!.getTime()) / (1000 * 60 * 60);
            expect(farkSaat).toBeGreaterThan(23);
            expect(farkSaat).toBeLessThan(25);
        });

        it('gün sonu sınırında (yerel 23:59) bile yarının imsakı bugünden ~24 saat sonraki güne ilerletilmeli', () => {
            // Gün-sınırı flaky'liğini bastırmak için saati çalışma zamanının YEREL gece yarısına 1 dk kala
            // sabitle: üretim getDate()/setDate()'i yerel saatte yürütür, bu yüzden karşılaştırma da yerele dayanmalı
            // (mutlak takvim-günü iddiası, adhan instant'ı koşan TZ'ye göre eşleyeceğinden flaky olurdu).
            jest.setSystemTime(new Date(2026, 5, 15, 23, 59, 0)); // yerel 15 Haziran 23:59

            const yarinImsak = servis.sonrakiGunImsakVaktiGetir();
            const bugunImsak = servis.bugunImsakVaktiGetir();

            expect(yarinImsak).not.toBeNull();
            expect(bugunImsak).not.toBeNull();
            expect(Number.isNaN(yarinImsak!.getTime())).toBe(false);

            // Gece yarısına 1 dk kala bile setDate(+1) bir sonraki güne ilerletmeli:
            // iki imsak arası TZ'den bağımsız olarak ~24 saat (23-25h) olmalı, gün atlanmamalı/iki katı olmamalı.
            const farkSaat = (yarinImsak!.getTime() - bugunImsak!.getTime()) / (1000 * 60 * 60);
            expect(farkSaat).toBeGreaterThan(23);
            expect(farkSaat).toBeLessThan(25);
        });
    });
});
