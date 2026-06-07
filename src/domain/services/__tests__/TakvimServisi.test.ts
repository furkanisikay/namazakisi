/**
 * TakvimServisi Testleri
 * expo-calendar + adhan mock'lariyla takvim etkinligi olusturma/temizleme akislari
 */

import * as Calendar from 'expo-calendar';
import { TakvimServisi } from '../TakvimServisi';

// ─── Mock'lar ──────────────────────────────────────────────────────────────────

jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

jest.mock('expo-calendar', () => ({
    EntityTypes: { EVENT: 'event' },
    requestCalendarPermissionsAsync: jest.fn(),
    getCalendarsAsync: jest.fn(),
    getEventsAsync: jest.fn(),
    createEventAsync: jest.fn(),
    deleteEventAsync: jest.fn(),
}));

// adhan: her gun icin deterministik vakitler dondur (gercek hesap yapmaya gerek yok)
jest.mock('adhan', () => ({
    Coordinates: jest.fn().mockImplementation((lat: number, lng: number) => ({ lat, lng })),
    CalculationMethod: { Turkey: jest.fn(() => ({})) },
    PrayerTimes: jest.fn().mockImplementation((_coords: any, date: Date) => {
        const g = (saat: number, dakika = 0) =>
            new Date(date.getFullYear(), date.getMonth(), date.getDate(), saat, dakika);
        return {
            fajr:     g(5, 0),
            sunrise:  g(6, 30),
            dhuhr:    g(13, 0),
            asr:      g(16, 0),
            maghrib:  g(19, 0),
            isha:     g(20, 30),
        };
    }),
}));

const mockCalendar = Calendar as jest.Mocked<typeof Calendar>;

const OLUSTURULDU_NOTU = 'Namaz Akışı tarafından oluşturuldu';

// ─── Yardimcilar ────────────────────────────────────────────────────────────────

type VakitAyari = { aktif: boolean; sureDakika: number; baslangicTipi: string; dakika: number };

function vakit(aktif: boolean, ekstra: Partial<VakitAyari> = {}): VakitAyari {
    return { aktif, sureDakika: 15, baslangicTipi: 'vakit_girisi', dakika: 5, ...ekstra };
}

function ayarlarOlustur(overrides: any = {}) {
    return {
        takvimId: 'cal-1',
        kaciGunIlerisi: 2,
        vakitAyarlari: {
            imsak:  vakit(true),
            ogle:   vakit(false),
            ikindi: vakit(false),
            aksam:  vakit(false),
            yatsi:  vakit(true),
        },
        ...overrides,
    };
}

const KOORDINAT = { lat: 41.0, lng: 29.0 };

describe('TakvimServisi', () => {
    const servis = TakvimServisi.getInstance();

    beforeEach(() => {
        jest.clearAllMocks();
        // Varsayilan: izin verildi, temizlenecek eski etkinlik yok
        (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (mockCalendar.getEventsAsync as jest.Mock).mockResolvedValue([]);
        (mockCalendar.createEventAsync as jest.Mock).mockResolvedValue('evt-id');
        (mockCalendar.deleteEventAsync as jest.Mock).mockResolvedValue(undefined);
    });

    // ─── izin / on kosullar ──────────────────────────────────────────────────

    describe('takvimOlaylariOlustur — ön koşullar', () => {
        it('izin reddedilirse hata fırlatır ve etkinlik oluşturmaz', async () => {
            (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            await expect(
                servis.takvimOlaylariOlustur(ayarlarOlustur() as any, KOORDINAT)
            ).rejects.toThrow('Takvim izni reddedildi');

            expect(mockCalendar.createEventAsync).not.toHaveBeenCalled();
        });

        it('takvim seçilmemişse hata fırlatır', async () => {
            await expect(
                servis.takvimOlaylariOlustur(ayarlarOlustur({ takvimId: null }) as any, KOORDINAT)
            ).rejects.toThrow('Takvim seçilmedi');

            expect(mockCalendar.createEventAsync).not.toHaveBeenCalled();
        });
    });

    // ─── aktif vakit filtreleme ──────────────────────────────────────────────

    describe('takvimOlaylariOlustur — etkinlik oluşturma', () => {
        it('yalnızca aktif vakitler için, gün × aktif vakit sayısı kadar etkinlik oluşturur', async () => {
            // 2 aktif vakit (imsak, yatsi) × 2 gün = 4 etkinlik
            const sayi = await servis.takvimOlaylariOlustur(ayarlarOlustur() as any, KOORDINAT);

            expect(sayi).toBe(4);
            expect(mockCalendar.createEventAsync).toHaveBeenCalledTimes(4);
        });

        it('hiç aktif vakit yoksa 0 döner ve etkinlik oluşturmaz', async () => {
            const ayarlar = ayarlarOlustur({
                vakitAyarlari: {
                    imsak: vakit(false), ogle: vakit(false), ikindi: vakit(false),
                    aksam: vakit(false), yatsi: vakit(false),
                },
            });

            const sayi = await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            expect(sayi).toBe(0);
            expect(mockCalendar.createEventAsync).not.toHaveBeenCalled();
        });

        it('oluşturulan etkinlik doğru başlık, takvim ve "oluşturuldu" notunu içerir', async () => {
            const ayarlar = ayarlarOlustur({
                kaciGunIlerisi: 1,
                vakitAyarlari: {
                    imsak: vakit(true), ogle: vakit(false), ikindi: vakit(false),
                    aksam: vakit(false), yatsi: vakit(false),
                },
            });

            await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            expect(mockCalendar.createEventAsync).toHaveBeenCalledTimes(1);
            const [takvimId, detay] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
            expect(takvimId).toBe('cal-1');
            expect(detay.title).toBe('Sabah Namazı');
            expect(detay.notes).toBe(OLUSTURULDU_NOTU);
            expect(detay.startDate).toBeInstanceOf(Date);
            expect(detay.endDate).toBeInstanceOf(Date);
            // vakit_girisi: imsak girisi 05:00, sure 15 dk → bitis 05:15
            expect(detay.startDate.getHours()).toBe(5);
            expect(detay.startDate.getMinutes()).toBe(0);
            expect(detay.endDate.getMinutes()).toBe(15);
        });

        it('bir etkinlik oluşturulamasa bile diğerleri oluşturulur ve sayım doğru kalır', async () => {
            (mockCalendar.createEventAsync as jest.Mock)
                .mockRejectedValueOnce(new Error('takvim hatası')) // ilk çağrı patlar
                .mockResolvedValue('evt-id');

            const sayi = await servis.takvimOlaylariOlustur(ayarlarOlustur() as any, KOORDINAT);

            // 4 deneme, 1 başarısız → 3 başarılı
            expect(mockCalendar.createEventAsync).toHaveBeenCalledTimes(4);
            expect(sayi).toBe(3);
        });
    });

    // ─── hesaplaBaslangic (private) ──────────────────────────────────────────

    describe('hesaplaBaslangic — başlangıç tipi mantığı', () => {
        const giris = new Date(2026, 5, 5, 13, 0); // 13:00
        const cikis = new Date(2026, 5, 5, 16, 0); // 16:00

        it('vakit_girisi: tam vakit girişinde başlar', () => {
            const sonuc = (servis as any).hesaplaBaslangic(giris, cikis, 'vakit_girisi', 10);
            expect(sonuc.getHours()).toBe(13);
            expect(sonuc.getMinutes()).toBe(0);
        });

        it('vakit_sonrasi: giriş + dakika kadar sonra başlar', () => {
            const sonuc = (servis as any).hesaplaBaslangic(giris, cikis, 'vakit_sonrasi', 10);
            expect(sonuc.getHours()).toBe(13);
            expect(sonuc.getMinutes()).toBe(10);
        });

        it('vakit_oncesi: çıkış - dakika kadar önce başlar', () => {
            const sonuc = (servis as any).hesaplaBaslangic(giris, cikis, 'vakit_oncesi', 10);
            expect(sonuc.getHours()).toBe(15);
            expect(sonuc.getMinutes()).toBe(50);
        });
    });

    // ─── eskiOlaylariTemizle ──────────────────────────────────────────────────

    describe('eskiOlaylariTemizle', () => {
        it('yalnızca "oluşturuldu" notu taşıyan etkinlikleri siler', async () => {
            (mockCalendar.getEventsAsync as jest.Mock).mockResolvedValue([
                { id: 'a', notes: OLUSTURULDU_NOTU },
                { id: 'b', notes: 'kullanıcının kendi etkinliği' },
                { id: 'c', notes: undefined },
                { id: 'd', notes: `${OLUSTURULDU_NOTU} (Öğle)` },
            ]);

            await servis.eskiOlaylariTemizle('cal-1', 7);

            expect(mockCalendar.deleteEventAsync).toHaveBeenCalledTimes(2);
            expect(mockCalendar.deleteEventAsync).toHaveBeenCalledWith('a');
            expect(mockCalendar.deleteEventAsync).toHaveBeenCalledWith('d');
            expect(mockCalendar.deleteEventAsync).not.toHaveBeenCalledWith('b');
        });

        it('gün sayısı düşük olsa bile en az 31 günlük aralığı tarar (orphan önleme)', async () => {
            await servis.eskiOlaylariTemizle('cal-1', 7);

            const [, baslangic, bitis] = (mockCalendar.getEventsAsync as jest.Mock).mock.calls[0];
            const gunFarki = Math.round((bitis.getTime() - baslangic.getTime()) / (24 * 60 * 60 * 1000));
            expect(gunFarki).toBeGreaterThanOrEqual(31);
        });

        it('gün sayısı 31’den büyükse o değeri kullanır', async () => {
            await servis.eskiOlaylariTemizle('cal-1', 60);

            const [, baslangic, bitis] = (mockCalendar.getEventsAsync as jest.Mock).mock.calls[0];
            const gunFarki = Math.round((bitis.getTime() - baslangic.getTime()) / (24 * 60 * 60 * 1000));
            expect(gunFarki).toBe(60);
        });
    });

    // ─── cihazTakvimleriniGetir ──────────────────────────────────────────────

    describe('cihazTakvimleriniGetir', () => {
        it('yalnızca düzenlenebilir takvimleri döndürür', async () => {
            (mockCalendar.getCalendarsAsync as jest.Mock).mockResolvedValue([
                { id: '1', title: 'Kişisel', color: '#FF0000', allowsModifications: true },
                { id: '2', title: 'Tatiller', color: '#00FF00', allowsModifications: false },
                { id: '3', title: 'İş', color: '', allowsModifications: true },
            ]);

            const sonuc = await servis.cihazTakvimleriniGetir();

            expect(sonuc).toHaveLength(2);
            expect(sonuc.map(t => t.id)).toEqual(['1', '3']);
            // renk boşsa varsayılan atanır
            expect(sonuc[1].color).toBe('#007AFF');
        });

        it('izin yoksa boş dizi döner', async () => {
            (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            const sonuc = await servis.cihazTakvimleriniGetir();

            expect(sonuc).toEqual([]);
            expect(mockCalendar.getCalendarsAsync).not.toHaveBeenCalled();
        });
    });

    // ─── etkinlikleriSil ──────────────────────────────────────────────────────

    describe('etkinlikleriSil', () => {
        it('başarıyla silinen etkinlik sayısını döndürür', async () => {
            (mockCalendar.deleteEventAsync as jest.Mock)
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('silinemedi'))
                .mockResolvedValueOnce(undefined);

            const silinen = await servis.etkinlikleriSil(['a', 'b', 'c']);

            expect(silinen).toBe(2);
            expect(mockCalendar.deleteEventAsync).toHaveBeenCalledTimes(3);
        });
    });

    // ─── takvimOlaylariOlustur — giriş/çıkış kablolaması ve gün ilerlemesi ───────
    //
    // Saat sabit bir öğlene (2026-06-15 12:00, yerel kurucu) DONDURULUR.
    // Böylece üretimin `new Date()` ile aldığı "bugün" deterministik olur ve
    // gece-yarısı/gün-sınırı flaky'liği yaşanmaz. (Mock adhan vakitleri yalnızca
    // geçirilen tarihin yıl/ay/gün'ünü kullandığından dondurulmuş saat yeterli.)
    describe('takvimOlaylariOlustur — gün ilerlemesi ve çıkış saati kablolaması', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date(2026, 5, 15, 12, 0, 0)); // 2026-06-15 öğlen, yerel
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('yatsı çıkışı ertesi günün imsakına bağlanır (vakit_oncesi gece-yarısı geçişi)', async () => {
            // Üretimde cikisSaatleri.yatsi = ptYarin.fajr (ertesi gün imsak/fajr).
            // Mock ptYarin.fajr -> (bugün+1) 05:00. vakit_oncesi & dakika=30 →
            // başlangıç = ertesi gün 05:00 - 30 dk = ertesi gün 04:30.
            // Çıkış haritası karışıp yatsı'ya BUGÜNÜN bir vaktini beslerse
            // (örn. bugünkü isha/sunrise) hem saat hem TARİH değişir → test FAIL.
            const ayarlar = ayarlarOlustur({
                kaciGunIlerisi: 1,
                vakitAyarlari: {
                    imsak:  vakit(false),
                    ogle:   vakit(false),
                    ikindi: vakit(false),
                    aksam:  vakit(false),
                    yatsi:  vakit(true, { baslangicTipi: 'vakit_oncesi', dakika: 30 }),
                },
            });

            await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            expect(mockCalendar.createEventAsync).toHaveBeenCalledTimes(1);
            const [, detay] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
            // Ertesi gün (16) 04:30 — bugünün (15) değil
            expect(detay.startDate.getDate()).toBe(16);
            expect(detay.startDate.getHours()).toBe(4);
            expect(detay.startDate.getMinutes()).toBe(30);
        });

        it('aksam çıkışı aynı günün yatsısına (isha) bağlanır (vakit_oncesi, gün taşmaz)', async () => {
            // cikisSaatleri.aksam = pt.isha (BUGÜNÜN yatsısı = 20:30).
            // vakit_oncesi & dakika=10 → başlangıç = 20:30 - 10 = 20:20, AYNI gün.
            // Yanlışlıkla ptYarin.isha gibi ertesi güne bağlanırsa getDate() kayar → FAIL.
            const ayarlar = ayarlarOlustur({
                kaciGunIlerisi: 1,
                vakitAyarlari: {
                    imsak:  vakit(false),
                    ogle:   vakit(false),
                    ikindi: vakit(false),
                    aksam:  vakit(true, { baslangicTipi: 'vakit_oncesi', dakika: 10 }),
                    yatsi:  vakit(false),
                },
            });

            await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            const [, detay] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
            expect(detay.startDate.getDate()).toBe(15); // bugün
            expect(detay.startDate.getHours()).toBe(20);
            expect(detay.startDate.getMinutes()).toBe(20);
        });

        it('vakit_sonrasi uçtan uca: giriş saatinden + dakika kadar sonra başlar', async () => {
            // imsak girişi 05:00 (pt.fajr). vakit_sonrasi & dakika=20 → 05:20.
            // girisSaatleri haritası karışırsa (örn. imsak'a dhuhr beslenirse) saat kayar → FAIL.
            const ayarlar = ayarlarOlustur({
                kaciGunIlerisi: 1,
                vakitAyarlari: {
                    imsak:  vakit(true, { baslangicTipi: 'vakit_sonrasi', dakika: 20 }),
                    ogle:   vakit(false),
                    ikindi: vakit(false),
                    aksam:  vakit(false),
                    yatsi:  vakit(false),
                },
            });

            await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            const [, detay] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
            expect(detay.startDate.getDate()).toBe(15);
            expect(detay.startDate.getHours()).toBe(5);
            expect(detay.startDate.getMinutes()).toBe(20);
        });

        it('kaciGunIlerisi=2: etkinlikler iki ayrı takvim gününe (bugün ve yarın) dağılır', async () => {
            // 1 aktif vakit (imsak) × 2 gün = 2 etkinlik.
            // tarih.setDate(getDate()+g) kırılıp hep "bugün"e düşerse iki etkinlik de
            // 15'ine düşer → bu test FAIL. Doğru davranışta {15, 16} olmalı.
            const ayarlar = ayarlarOlustur({
                kaciGunIlerisi: 2,
                vakitAyarlari: {
                    imsak:  vakit(true), // varsayılan vakit_girisi
                    ogle:   vakit(false),
                    ikindi: vakit(false),
                    aksam:  vakit(false),
                    yatsi:  vakit(false),
                },
            });

            await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            expect(mockCalendar.createEventAsync).toHaveBeenCalledTimes(2);
            const gunler = (mockCalendar.createEventAsync as jest.Mock).mock.calls
                .map(([, detay]) => detay.startDate.getDate())
                .sort((a: number, b: number) => a - b);
            expect(gunler).toEqual([15, 16]);
        });
    });

    // ─── takvimOlaylariOlustur — timeZone alanı ────────────────────────────────

    describe('takvimOlaylariOlustur — timeZone', () => {
        it('Android için geçerli IANA timeZone geçirir ("local" gibi geçersiz değer değil)', async () => {
            // Platform.OS mock'u 'android' → deviceTimeZone = Intl ile çözülen IANA tz.
            // Gotcha: 'local' geçersizdir; gerçek bir bölge/şehir IANA string olmalı.
            const ayarlar = ayarlarOlustur({
                kaciGunIlerisi: 1,
                vakitAyarlari: {
                    imsak:  vakit(true),
                    ogle:   vakit(false),
                    ikindi: vakit(false),
                    aksam:  vakit(false),
                    yatsi:  vakit(false),
                },
            });

            await servis.takvimOlaylariOlustur(ayarlar as any, KOORDINAT);

            const [, detay] = (mockCalendar.createEventAsync as jest.Mock).mock.calls[0];
            expect(typeof detay.timeZone).toBe('string');
            expect(detay.timeZone).not.toBe('local');
            // IANA tz kabaca "Bölge/Şehir" biçimindedir (en az bir '/' içerir)
            expect(detay.timeZone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+/);
        });
    });

    // ─── etkinlikleriGetir ─────────────────────────────────────────────────────

    describe('etkinlikleriGetir', () => {
        const bas = new Date(2026, 5, 1);
        const bit = new Date(2026, 5, 30);

        it('yalnızca "oluşturuldu" notlu etkinlikleri döndürür ve startDate’e göre artan sıralar', async () => {
            // Karışık notlu + sırasız startDate'li etkinlikler tek takvimden gelir.
            (mockCalendar.getEventsAsync as jest.Mock).mockResolvedValue([
                { id: 'gec',  title: 'Akşam Namazı', notes: OLUSTURULDU_NOTU, startDate: '2026-06-10T19:00:00.000Z' },
                { id: 'yad',  title: 'Toplantı',     notes: 'kullanıcının kendi etkinliği', startDate: '2026-06-05T09:00:00.000Z' },
                { id: 'erken', title: 'Sabah Namazı', notes: OLUSTURULDU_NOTU, startDate: '2026-06-02T05:00:00.000Z' },
                { id: 'bos',  title: 'Notsuz',       notes: undefined, startDate: '2026-06-01T00:00:00.000Z' },
            ]);

            const sonuc = await servis.etkinlikleriGetir(['cal-1'], bas, bit);

            // Yalnızca 2 "oluşturuldu" notlu etkinlik; yabancı/notsuz atılır
            expect(sonuc.map(e => e.id)).toEqual(['erken', 'gec']);
            // Artan startDate sıralaması korunur (erken < gec)
            expect(sonuc[0].startDate.getTime()).toBeLessThan(sonuc[1].startDate.getTime());
            expect(sonuc[0].startDate).toBeInstanceOf(Date);
        });

        it('vakitBasliklari verilirse yalnızca eşleşen başlıkları döndürür', async () => {
            (mockCalendar.getEventsAsync as jest.Mock).mockResolvedValue([
                { id: 'sabah', title: 'Sabah Namazı', notes: OLUSTURULDU_NOTU, startDate: '2026-06-02T05:00:00.000Z' },
                { id: 'yatsi', title: 'Yatsı Namazı', notes: OLUSTURULDU_NOTU, startDate: '2026-06-02T20:30:00.000Z' },
            ]);

            const sonuc = await servis.etkinlikleriGetir(['cal-1'], bas, bit, ['Yatsı Namazı']);

            expect(sonuc.map(e => e.id)).toEqual(['yatsi']);
        });

        it('bir takvim sorgulanamasa bile diğer takvimlerin etkinliklerini döndürür', async () => {
            (mockCalendar.getEventsAsync as jest.Mock)
                .mockRejectedValueOnce(new Error('takvim okunamadı')) // cal-1 patlar
                .mockResolvedValueOnce([
                    { id: 'ok', title: 'Sabah Namazı', notes: OLUSTURULDU_NOTU, startDate: '2026-06-03T05:00:00.000Z' },
                ]);

            const sonuc = await servis.etkinlikleriGetir(['cal-1', 'cal-2'], bas, bit);

            expect(sonuc.map(e => e.id)).toEqual(['ok']);
            expect(sonuc[0].takvimId).toBe('cal-2');
        });

        it('izin yoksa boş dizi döner ve takvim sorgulamaz', async () => {
            (mockCalendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            const sonuc = await servis.etkinlikleriGetir(['cal-1'], bas, bit);

            expect(sonuc).toEqual([]);
            expect(mockCalendar.getEventsAsync).not.toHaveBeenCalled();
        });
    });
});
