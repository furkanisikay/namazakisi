/**
 * TESLIMCI SECIMI + iOS TESLIMCISININ DAVRANISI.
 *
 * Olculen iki sozlesme:
 *   1. Secim platformdan turetilir AMA acikca degistirilebilir. Enjeksiyon
 *      olmasaydi, bu repoda jest'in varsayilan `Platform.OS` degeri **'ios'**
 *      oldugu icin Android davranis suite'leri sessizce iOS teslimcisine duser
 *      ve YESIL KALARAK yanlis seyi olcerdi.
 *   2. iOS teslimcisi: kanal id YAZMAZ, ses DOSYA ADIdir, kesinti seviyesi
 *      seviyeye gore secilir, 64 bekleyen siniri uygulanir ve yan kanal
 *      (TTS alarmi) HIC cagrilmaz.
 */
const mockPlatformDurumu = { OS: 'ios' };
jest.mock('react-native', () => ({
    Platform: {
        get OS() {
            return mockPlatformDurumu.OS;
        },
    },
}));

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mockPlanlaAnons = jest.fn();
const mockIptalEtAnons = jest.fn();
const mockIptalEtTumAnonslar = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: (...args: unknown[]) => mockIptalEtAnons(...args),
    iptalEtTumAnonslar: (...args: unknown[]) => mockIptalEtTumAnonslar(...args),
}));

const mockKanallariHazirla = jest.fn();
jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: (...args: unknown[]) => mockKanallariHazirla(...args),
    },
}));

import * as Notifications from 'expo-notifications';
import {
    muhafizTeslimcisiniAl,
    muhafizTeslimcisiniAyarla,
    type UyariTeslimi,
} from '../MuhafizTeslimcisi';
import { IosMuhafizTeslimcisi } from '../IosMuhafizTeslimcisi';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';
import type { UyariPlani } from '../../../core/muhafiz/motorAdaptoru';
import { IOS_BILDIRIM_SESI } from '../../../core/muhafiz/ios/teslimPlani';

function teslimKur(kismi: Partial<UyariPlani> = {}, zamanMs?: number): UyariTeslimi {
    const uyari = {
        seviye: 1,
        kalanDk: 10,
        olcuDk: 10,
        kanallar: { bildirim: true },
        bildirimSesi: 'varsayilan',
        sesliAnons: false,
        anonsMetni: '',
        ...kismi,
    } as UyariPlani;

    return {
        id: `muhafiz_2026-01-01_vakit_aksam_seviye_${uyari.seviye}_dk_${uyari.kalanDk}`,
        baslik: 'baslik',
        mesaj: 'mesaj',
        zaman: new Date(zamanMs ?? Date.now() + 10 * 60 * 1000),
        uyari,
        vakit: 'aksam',
        muhafizVakti: 'aksam',
        tarih: '2026-01-01',
        yon: 'cikisaDogru',
    };
}

describe('Teslimci secimi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        muhafizTeslimcisiniAyarla(null);
    });

    afterAll(() => muhafizTeslimcisiniAyarla(null));

    test('iOS platformunda iOS teslimcisi secilir', () => {
        mockPlatformDurumu.OS = 'ios';
        expect(muhafizTeslimcisiniAl().ad).toBe('ios');
    });

    test('Android platformunda Android teslimcisi secilir', () => {
        mockPlatformDurumu.OS = 'android';
        expect(muhafizTeslimcisiniAl().ad).toBe('android');
    });

    test('secim hatirlanir (her cagride yeniden kurulmaz)', () => {
        mockPlatformDurumu.OS = 'ios';
        expect(muhafizTeslimcisiniAl()).toBe(muhafizTeslimcisiniAl());
    });

    test('NOBETCI: acikca ayarlanan teslimci platformu EZER', () => {
        mockPlatformDurumu.OS = 'ios';
        muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
        expect(muhafizTeslimcisiniAl().ad).toBe('android');
    });

    test('null ile sifirlanir → platformdan yeniden turetilir', () => {
        mockPlatformDurumu.OS = 'ios';
        muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
        muhafizTeslimcisiniAyarla(null);
        expect(muhafizTeslimcisiniAl().ad).toBe('ios');
    });
});

describe('IosMuhafizTeslimcisi', () => {
    let teslimci: IosMuhafizTeslimcisi;

    beforeEach(async () => {
        jest.clearAllMocks();
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        teslimci = new IosMuhafizTeslimcisi();
        await teslimci.hazirla();
    });

    test('kanal OLUSTURMAZ ve matrisi aynen dondurur', async () => {
        const matris = { yatsi: { seviyeler: [] } } as never;
        await expect(teslimci.hazirla(matris)).resolves.toBe(matris);
        expect(mockKanallariHazirla).not.toHaveBeenCalled();
    });

    test('bildirim: channelId YAZMAZ, ses DOSYA ADIdir', async () => {
        await teslimci.uyariPlanla(teslimKur());

        const [girdi] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
        expect(girdi.trigger.channelId).toBeUndefined();
        expect(girdi.content.sound).toBe(IOS_BILDIRIM_SESI);
    });

    test('kesinti seviyesi seviyeye gore secilir', async () => {
        await teslimci.uyariPlanla(teslimKur({ seviye: 1 }));
        await teslimci.uyariPlanla(teslimKur({ seviye: 3 }));

        const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        expect(cagrilar[0][0].content.interruptionLevel).toBe('active');
        expect(cagrilar[1][0].content.interruptionLevel).toBe('timeSensitive');
    });

    test("Android'in content:// sesi paket sesine duser", async () => {
        await teslimci.uyariPlanla(
            teslimKur({ bildirimSesi: 'content://media/internal/audio/media/42' })
        );
        const [girdi] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
        expect(girdi.content.sound).toBe(IOS_BILDIRIM_SESI);
    });

    test('NOBETCI: sesli adimda bile TTS koprusu HIC cagrilmaz', async () => {
        await teslimci.uyariPlanla(
            teslimKur({
                seviye: 3,
                kanallar: { bildirim: true, sesli: true },
                sesliAnons: true,
                anonsMetni: 'Akşam vakti çıkıyor.',
            })
        );
        expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    test('yan kanal iptalleri no-op — native kopruye dokunmaz', () => {
        teslimci.yanKanaliIptalEt();
        teslimci.tumYanKanallariIptalEt();
        expect(mockIptalEtAnons).not.toHaveBeenCalled();
        expect(mockIptalEtTumAnonslar).not.toHaveBeenCalled();
    });

    test('gecmis zamanli uyari planlanmaz', async () => {
        await teslimci.uyariPlanla(teslimKur({}, Date.now() - 60_000));
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    test('64 SINIRI: slot tukenince fazlasi planlanmaz', async () => {
        // Muhafiz disi 56 bekleyen → slot = 64 - 56 - 4 = 4
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
            Array.from({ length: 56 }, (_, i) => ({ identifier: `vakit_${i}` }))
        );
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();

        for (let i = 0; i < 10; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
    });

    test('butce olcumu MUHAFIZ bildirimlerini saymaz (kendi yerimizi isgal etmeyiz)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            ...Array.from({ length: 50 }, (_, i) => ({ identifier: `muhafiz_eski_${i}` })),
            { identifier: 'vakit_1' },
        ]);
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();

        // Muhafiz disi yalniz 1 → slot 59; 10 uyarinin hepsi sigmali.
        for (let i = 0; i < 10; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(10);
    });

    test('butce OLCULEMEZSE kisitlama uygulanmaz (plani biz kesmeyiz)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(
            new Error('okunamadi')
        );
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();

        for (let i = 0; i < 80; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(80);
    });
});
