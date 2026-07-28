import { CumaHatirlatmaServisi } from '../CumaHatirlatmaServisi';
import { LocalCumaHatirlatmaServisi } from '../../../data/local/LocalCumaHatirlatmaServisi';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications');
jest.mock('../../../data/local/LocalCumaHatirlatmaServisi');

// adhan mock: ogle vakti her gun 13:00 (deterministik).
jest.mock('adhan', () => ({
    Coordinates: jest.fn(),
    CalculationMethod: { Turkey: jest.fn(() => ({})) },
    PrayerTimes: jest.fn().mockImplementation((_koordinatlar, tarih) => {
        const d = new Date(tarih);
        d.setHours(13, 0, 0, 0);
        return { dhuhr: d };
    }),
}));

const KOORDINAT = { lat: 41.0, lng: 29.0 };

/** 5 Agustos 2026 = Carsamba (o haftanin cumasi 7 Agustos). */
const CARSAMBA_SABAH = new Date(2026, 7, 5, 9, 0, 0);

const ayarlariKur = (aktif: boolean, oncedenDk = 60) => {
    (LocalCumaHatirlatmaServisi.getAyarlar as jest.Mock).mockResolvedValue({ aktif, oncedenDk });
};

const planlananlar = () =>
    (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);

describe('CumaHatirlatmaServisi', () => {
    let servis: CumaHatirlatmaServisi;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.setSystemTime(CARSAMBA_SABAH);
        servis = CumaHatirlatmaServisi.getInstance();
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('ayar kapaliyken hicbir hatirlatma planlamaz', async () => {
        ayarlariKur(false);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('ayar kapatilinca onceden planlanmis hatirlatmalari TEMIZLER', async () => {
        ayarlariKur(false);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'cuma_hatirlatma_2026-08-07' },
            { identifier: 'vakit_bildirim_ogle_2026-08-07' },
        ]);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
            'cuma_hatirlatma_2026-08-07'
        );
        // Baska sistemlerin bildirimlerine DOKUNMAZ
        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith(
            'vakit_bildirim_ogle_2026-08-07'
        );
    });

    it('acikken sonraki dort cumayi planlar', async () => {
        ayarlariKur(true);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        const istekler = planlananlar();
        expect(istekler).toHaveLength(4);
        expect(istekler.map((i) => i.identifier)).toEqual([
            'cuma_hatirlatma_2026-08-07',
            'cuma_hatirlatma_2026-08-14',
            'cuma_hatirlatma_2026-08-21',
            'cuma_hatirlatma_2026-08-28',
        ]);
    });

    it('hatirlatmayi ogle vaktinden ayarlanan dakika kadar once kurar', async () => {
        ayarlariKur(true, 90);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        const ilk = planlananlar()[0];
        const zaman: Date = ilk.trigger.date;
        expect(zaman.getDate()).toBe(7);
        expect(zaman.getHours()).toBe(11); // 13:00 - 90 dk
        expect(zaman.getMinutes()).toBe(30);
    });

    it('gecmis zamanli hatirlatmayi ATLAR (cuma ogleden sonra acilis)', async () => {
        // Cuma gunu 14:00 — o haftanin hatirlatma ani (12:00) coktan gecti
        jest.setSystemTime(new Date(2026, 7, 7, 14, 0, 0));
        ayarlariKur(true);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        const idler = planlananlar().map((i) => i.identifier);
        expect(idler).not.toContain('cuma_hatirlatma_2026-08-07');
        expect(idler[0]).toBe('cuma_hatirlatma_2026-08-14');
    });

    it('cuma gunu hatirlatma anindan ONCE acilirsa O HAFTAYI planlar', async () => {
        jest.setSystemTime(new Date(2026, 7, 7, 8, 0, 0));
        ayarlariKur(true);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        expect(planlananlar()[0].identifier).toBe('cuma_hatirlatma_2026-08-07');
    });

    it('yeniden planlamadan ONCE eskileri temizler (cift bildirim yok)', async () => {
        ayarlariKur(true);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'cuma_hatirlatma_2026-08-07' },
        ]);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
            'cuma_hatirlatma_2026-08-07'
        );
        expect(planlananlar()).toHaveLength(4);
    });

    it('koordinat yoksa cokmeden doner ve planlama yapmaz', async () => {
        ayarlariKur(true);

        await expect(servis.hatirlatmalariGuncelle(null)).resolves.toBeUndefined();
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('gecersiz (0,0) koordinatla planlama yapmaz', async () => {
        ayarlariKur(true);

        await servis.hatirlatmalariGuncelle({ lat: 0, lng: 0 });

        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    /**
     * Konum gecici olarak okunamazsa (bozuk kayit, headless yol) KURULU plan
     * SILINMEMELI: silinip yerine bir sey konmazsa kullanici bir sonraki
     * basarili calismaya kadar hic hatirlatma almaz — sessiz kayip.
     */
    it('koordinat okunamazsa MEVCUT plani SILMEZ', async () => {
        ayarlariKur(true);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'cuma_hatirlatma_2026-08-07' },
        ]);

        await servis.hatirlatmalariGuncelle(null);

        expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    });

    it('bildirimi vakit bildirim kanalina ve dogru icerikle gonderir', async () => {
        ayarlariKur(true, 60);

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        const ilk = planlananlar()[0];
        expect(ilk.content.title).toContain('Cuma');
        expect(ilk.content.body).toContain('1 saat');
        expect(ilk.content.data.tip).toBe('cuma_hatirlatma');
        expect(ilk.trigger.channelId).toBe('vakit_bildirim');
    });

    /**
     * Uc cagiran ayni anda tetikleyebilir (acilis zinciri / ayar ekrani / arka plan).
     * Islem cok adimli oldugu icin ic ice girerse A'nin temizligi B'nin
     * planlamasindan sonra kosabilir → ayar ile kurulu saat AYRISIR.
     */
    it('es zamanli cagrilar SIRAYLA kosar (temizlik baskasinin planini yemez)', async () => {
        ayarlariKur(true);
        const olaylar: string[] = [];
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockImplementation(
            async () => {
                olaylar.push('temizlik');
                await Promise.resolve();
                return [];
            }
        );
        (Notifications.scheduleNotificationAsync as jest.Mock).mockImplementation(async () => {
            olaylar.push('planla');
            return 'id';
        });

        await Promise.all([
            servis.hatirlatmalariGuncelle(KOORDINAT),
            servis.hatirlatmalariGuncelle(KOORDINAT),
        ]);

        // Beklenen: temizlik, 4 planla, temizlik, 4 planla — turlar ic ice GECMEZ.
        expect(olaylar).toEqual([
            'temizlik', 'planla', 'planla', 'planla', 'planla',
            'temizlik', 'planla', 'planla', 'planla', 'planla',
        ]);
    });

    it('tek bir planlama hatasi kalan cumalari DUSURMEZ', async () => {
        ayarlariKur(true);
        (Notifications.scheduleNotificationAsync as jest.Mock)
            .mockRejectedValueOnce(new Error('planlanamadi'))
            .mockResolvedValue('id');

        await servis.hatirlatmalariGuncelle(KOORDINAT);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
    });
});
