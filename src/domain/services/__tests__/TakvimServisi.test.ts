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
});
