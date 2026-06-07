import { VakitBildirimYoneticiServisi } from '../VakitBildirimYoneticiServisi';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { LocalVakitBildirimServisi } from '../../../data/local/LocalVakitBildirimServisi';
import * as Notifications from 'expo-notifications';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('../NamazVaktiHesaplayiciServisi');
jest.mock('../../../data/local/LocalVakitBildirimServisi');

// adhan mock: PrayerTimes deterministik, geçirilen 'tarih' gününe sabit saatler kurar.
// Üretim kodu trigger.date olarak doğrudan bu Date'leri kullandığı için
// beklenen değerleri (saat, gün) bağımsız ve kesin doğrulayabiliriz.
jest.mock('adhan', () => ({
    Coordinates: jest.fn(),
    CalculationMethod: { Turkey: jest.fn(() => ({})) },
    PrayerTimes: jest.fn().mockImplementation((_koordinatlar, tarih) => {
        const vakitOlustur = (saat: number) => {
            const d = new Date(tarih);
            d.setHours(saat, 0, 0, 0);
            return d;
        };
        return {
            fajr: vakitOlustur(5),    // imsak  05:00
            sunrise: vakitOlustur(7), // güneş  07:00
            dhuhr: vakitOlustur(13),  // öğle   13:00
            asr: vakitOlustur(17),    // ikindi 17:00
            maghrib: vakitOlustur(20), // akşam 20:00
            isha: vakitOlustur(22),   // yatsı  22:00
        };
    }),
}));

describe('VakitBildirimYoneticiServisi', () => {
    let service: VakitBildirimYoneticiServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        service = VakitBildirimYoneticiServisi.getInstance();

        // Mock getInstance of NamazVaktiHesaplayiciServisi
        (NamazVaktiHesaplayiciServisi.getInstance as jest.Mock).mockReturnValue({
            getKonfig: jest.fn(),
        });

        // Mock getAllScheduledNotificationsAsync to return empty array by default
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    });

    it('konum yapılandırılmamışsa bildirim planlamamalı', async () => {
        // Mock getAyarlar
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
            imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true
        });

        // Mock getKonfig to return null
        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue(null);

        await service.bildirimleriGuncelle();

        // Expect notifications NOT to be scheduled
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('ayarlar pasifse bildirim planlamamalı', async () => {
        // Mock getAyarlar all false
        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
            imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false
        });

        // Mock config
        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

        await service.bildirimleriGuncelle();

        // Expect getAllScheduledNotificationsAsync called for cleanup
        expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();
        // But scheduleNotificationAsync NOT called because settings are off
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('ayarlar aktifse yalnızca açık vakitleri bugün+yarın için doğru içerikle planlamalı', async () => {
        // Sistem saatini sabit bir sabah anına (03:00) kilitle: tüm mock vakitler (en erken imsak 05:00)
        // gelecekte kalır, böylece üretimdeki "geçmiş zaman planlama yapma" kapısı hiçbirini elemez.
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-15T03:00:00'));

        try {
            // imsak + ikindi açık; ogle/aksam/yatsi KAPALI
            (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
                imsak: true, ogle: false, ikindi: true, aksam: false, yatsi: false
            });

            const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
            (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

            (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification_id');
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);

            await service.bildirimleriGuncelle();

            // Yalnızca imsak + ikindi, bugün (2024-06-15) + yarın (2024-06-16) = TAM 4 çağrı.
            // Sayı 4'ten farklıysa ya kapalı vakitler de planlanmış ya da bir gün düşmüştür.
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);

            const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
                (c) => c[0]
            );
            const idler = cagrilar.map((c) => c.identifier);

            // Açık vakitlerin her ikisi de bugün ve yarın için tam identifier'larla planlanmalı
            expect(idler).toEqual(
                expect.arrayContaining([
                    'vakit_bildirim_imsak_2024-06-15',
                    'vakit_bildirim_imsak_2024-06-16',
                    'vakit_bildirim_ikindi_2024-06-15',
                    'vakit_bildirim_ikindi_2024-06-16',
                ])
            );

            // KAPALI vakitler (ogle/aksam/yatsi) için HİÇ bildirim planlanmamalı (ayar kapısı seçiciliği)
            expect(idler.some((id) => /_(ogle|aksam|yatsi)_/.test(id))).toBe(false);

            // Bugünün imsak çağrısı: başlık + trigger.date + kanal fiziksel olarak doğru olmalı.
            // adhan mock'unda fajr = bugün 05:00 → trigger.date bu ana eşit olmalı.
            const bugunImsak = cagrilar.find(
                (c) => c.identifier === 'vakit_bildirim_imsak_2024-06-15'
            );
            expect(bugunImsak).toBeDefined();
            expect(bugunImsak.content.title).toBe('İmsak Vakti Girdi');
            expect(bugunImsak.content.data).toEqual({ tip: 'vakit_bildirim', vakit: 'imsak' });
            expect(bugunImsak.trigger.date).toEqual(new Date('2024-06-15T05:00:00'));
            expect(bugunImsak.trigger.channelId).toBe('vakit_bildirim');
            expect(bugunImsak.trigger.type).toBe(Notifications.SchedulableTriggerInputTypes.DATE);

            // Bugünün ikindi çağrısı: asr = bugün 17:00 (farklı başlık + doğru tetik anı)
            const bugunIkindi = cagrilar.find(
                (c) => c.identifier === 'vakit_bildirim_ikindi_2024-06-15'
            );
            expect(bugunIkindi).toBeDefined();
            expect(bugunIkindi.content.title).toBe('İkindi Vakti Girdi');
            expect(bugunIkindi.trigger.date).toEqual(new Date('2024-06-15T17:00:00'));

            // Yarının imsak çağrısı yarın tarihinde (off-by-one / gün kayması regresyonunu yakalar)
            const yarinImsak = cagrilar.find(
                (c) => c.identifier === 'vakit_bildirim_imsak_2024-06-16'
            );
            expect(yarinImsak).toBeDefined();
            expect(yarinImsak.trigger.date).toEqual(new Date('2024-06-16T05:00:00'));
        } finally {
            jest.useRealTimers();
        }
    });

    it('geçmişte kalan vakitleri planlamamalı (geçmiş-zaman kapısı)', async () => {
        // Sistem saatini 18:00'e kilitle: bugünün imsak(05:00)/öğle(13:00)/ikindi(17:00) GEÇMİŞTE,
        // akşam(20:00)/yatsı(22:00) ve yarının tüm vakitleri GELECEKTE.
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-15T18:00:00'));

        try {
            // Tüm vakitler açık → geçmiş filtresinin gerçekten elediğini izole edebiliriz
            (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
                imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true
            });

            const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
            (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

            (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification_id');
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);

            await service.bildirimleriGuncelle();

            const idler = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
                (c) => c[0].identifier
            );

            // Bugünün geçmiş vakitleri (imsak/ogle/ikindi @ 05/13/17 < 18:00) planlanmamalı
            expect(idler).not.toContain('vakit_bildirim_imsak_2024-06-15');
            expect(idler).not.toContain('vakit_bildirim_ogle_2024-06-15');
            expect(idler).not.toContain('vakit_bildirim_ikindi_2024-06-15');

            // Bugünün gelecekteki vakitleri (aksam/yatsi @ 20/22 > 18:00) planlanmalı
            expect(idler).toContain('vakit_bildirim_aksam_2024-06-15');
            expect(idler).toContain('vakit_bildirim_yatsi_2024-06-15');

            // Yarının tüm vakitleri (5 adet) tamamen gelecekte → hepsi planlanmalı
            expect(idler).toEqual(
                expect.arrayContaining([
                    'vakit_bildirim_imsak_2024-06-16',
                    'vakit_bildirim_ogle_2024-06-16',
                    'vakit_bildirim_ikindi_2024-06-16',
                    'vakit_bildirim_aksam_2024-06-16',
                    'vakit_bildirim_yatsi_2024-06-16',
                ])
            );

            // Toplam: bugün 2 (aksam, yatsi) + yarın 5 = 7 çağrı
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(7);
        } finally {
            jest.useRealTimers();
        }
    });

    it('önceki vakit bildirimlerini temizlemeli', async () => {
        // Mock existing notifications
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'vakit_bildirim_imsak_2024-01-01', content: {} },
            { identifier: 'other_notification', content: {} }
        ]);

        (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
             imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false
        });

        const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
        (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });

        await service.bildirimleriGuncelle();

        // Should cancel 'vakit_bildirim_imsak_2024-01-01' but NOT 'other_notification'
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vakit_bildirim_imsak_2024-01-01');
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('other_notification');
    });

    it('eski bildirimleri YENİ planlamadan ÖNCE temizlemeli (mükerrer bildirim önleme garantisi)', async () => {
        // Aktif senaryoda bile: önce eski vakit_bildirim_* iptal edilmeli, SONRA yeniler kurulmalı.
        // Sıra tersine dönerse (önce planla, sonra temizle) yeni kurulan bildirim de silinir → kullanıcı bildirim almaz.
        // Saati 03:00'e kilitle ki tüm vakitler (en erken 05:00) gelecekte kalsın ve gerçekten planlama yapılsın.
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-15T03:00:00'));

        try {
            // Temizlenecek eski bir vakit_bildirim_* mevcut
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
                { identifier: 'vakit_bildirim_imsak_2024-01-01', content: {} },
            ]);

            (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
                imsak: true, ogle: false, ikindi: false, aksam: false, yatsi: false
            });

            const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
            (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });
            (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');

            await service.bildirimleriGuncelle();

            // İki işlem de en az bir kez çağrılmalı (temizleme gerçekleşti + yeni planlama yapıldı)
            expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('vakit_bildirim_imsak_2024-01-01');
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();

            // Çağrı sırası: TÜM cancel çağrıları, TÜM schedule çağrılarından ÖNCE gelmeli.
            const sonCancelSira = Math.max(
                ...(Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.invocationCallOrder
            );
            const ilkScheduleSira = Math.min(
                ...(Notifications.scheduleNotificationAsync as jest.Mock).mock.invocationCallOrder
            );
            expect(sonCancelSira).toBeLessThan(ilkScheduleSira);
        } finally {
            jest.useRealTimers();
        }
    });

    it('bir vakit için scheduleNotificationAsync reddederse diğer vakitleri planlamaya DEVAM etmeli (hata yutma)', async () => {
        // tekBildirimPlanla try/catch ile tek bir vaktin hatasını yakalayıp Logger.error'a yazıp devam eder.
        // Tek hatanın tüm planlamayı çökertmediğini doğrula: ilk çağrı reddedilse de kalan çağrılar yapılmalı.
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-15T03:00:00'));

        try {
            // Tüm vakitler açık → bugün 5 + yarın 5 = 10 planlama denemesi yapılır
            (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
                imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true
            });

            const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
            (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);

            // İlk planlama çağrısı reddolsun, geri kalanı başarılı olsun
            (Notifications.scheduleNotificationAsync as jest.Mock)
                .mockRejectedValueOnce(new Error('planlama hatası'))
                .mockResolvedValue('id');

            // Hata yutulmalı: bildirimleriGuncelle reddetmemeli (throw etmemeli)
            await expect(service.bildirimleriGuncelle()).resolves.toBeUndefined();

            // 10 deneme de yapılmalı (ilk hata kalan 9'u engellememeli)
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(10);
        } finally {
            jest.useRealTimers();
        }
    });

    it('tarih damgasını YEREL takvim gününe göre üretmeli (gece yarısı / timezone sınırı)', async () => {
        // Sistem saatini yerel 23:30'a kilitle. Tarih damgası getFullYear/Month/Date (YEREL) ile üretildiği için
        // damga, makinenin TZ'sinden bağımsız olarak yerel takvim gününü (2024-06-15 / yarın 2024-06-16) yansıtmalı.
        // UTC'ye kayma olsaydı (ör. UTC+ saat dilimlerinde) damga yanlış güne düşerdi.
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-06-15T23:30:00')); // TZ belirteci yok → yerel saat

        try {
            (LocalVakitBildirimServisi.getAyarlar as jest.Mock).mockResolvedValue({
                imsak: true, ogle: false, ikindi: false, aksam: false, yatsi: false
            });

            const mockHesaplayici = NamazVaktiHesaplayiciServisi.getInstance();
            (mockHesaplayici.getKonfig as jest.Mock).mockReturnValue({ latitude: 41, longitude: 29 });
            (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);

            await service.bildirimleriGuncelle();

            const idler = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
                (c) => c[0].identifier
            );

            // 23:30'da bugünün imsağı (05:00) GEÇMİŞTE → bugün için planlama YOK.
            expect(idler).not.toContain('vakit_bildirim_imsak_2024-06-15');
            // Yarının imsağı (yerel 2024-06-16 05:00) GELECEKTE → yerel takvim damgasıyla planlanmalı.
            expect(idler).toContain('vakit_bildirim_imsak_2024-06-16');
            // Damga asla bir gün ileri/geri kaymamalı (UTC karışması olsaydı 06-17 ya da 06-15 düşerdi).
            expect(idler).not.toContain('vakit_bildirim_imsak_2024-06-17');

            // Trigger Date'i de yerel takvim gününün doğru anına (yarın 05:00) eşit olmalı.
            const yarinImsak = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls
                .map((c) => c[0])
                .find((c) => c.identifier === 'vakit_bildirim_imsak_2024-06-16');
            expect(yarinImsak).toBeDefined();
            expect(yarinImsak.trigger.date).toEqual(new Date('2024-06-16T05:00:00'));
        } finally {
            jest.useRealTimers();
        }
    });
});
