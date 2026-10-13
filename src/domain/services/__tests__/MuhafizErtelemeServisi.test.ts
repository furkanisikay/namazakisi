/**
 * Muhafız "Ertele" — JS basış yolu (issue #289). iOS'ta asıl yol, Android'de
 * native yolun yedeği. Kurallar `core/muhafiz/erteleme.ts`'ten gelir; burada
 * yalnız uygulama ölçülür: sınır, kopya içeriği, aralığın susturulması.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const mockYanKanaliIptalEt = jest.fn();
jest.mock('../MuhafizTeslimcisi', () => ({
    muhafizTeslimcisiniAl: () => ({ yanKanaliIptalEt: mockYanKanaliIptalEt }),
}));
jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { muhafizErtelemesiniIsle } from '../MuhafizErtelemeServisi';
import { ertelemeBasligiSablonu } from '../../../core/muhafiz/erteleme';

const DK = 60_000;
const SIMDI = 1_800_000_000_000;
const CIKIS = SIMDI + 45 * DK;
const SINIR = CIKIS - 3 * DK;

const veri = (ek: Record<string, unknown> = {}) => ({
    tip: 'muhafiz',
    vakit: 'ogle',
    tarih: '2027-01-15',
    seviye: 1,
    cikisMs: CIKIS,
    erteleSinirMs: SINIR,
    ertelemeBasligi: ertelemeBasligiSablonu('Öğle'),
    ...ek,
});

const planlanan = () => (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);

beforeEach(() => {
    jest.clearAllMocks();
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    (Notifications.dismissNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => jest.restoreAllMocks());

describe('muhafizErtelemesiniIsle', () => {
    it('ertele eylemi değilse false (başka yol)', async () => {
        expect(await muhafizErtelemesiniIsle({ kimlik: 'x', eylem: 'kildim_action', data: veri() }, SIMDI)).toBe(false);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('10 dk erteler: kopya sabit kimlikle, yeni başlıkla, hedef ana kurulur; basılan bildirim kapanır', async () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const kimlik = 'muhafiz_2027-01-15_vakit_ogle_seviye_1_dk_45';
        await muhafizErtelemesiniIsle(
            { kimlik, eylem: 'ertele_10', baslik: '⏰ 45 dk · Öğle vakti', govde: 'Gövde', data: veri({ kanalId: 'muhafiz_abc' }) },
            SIMDI
        );
        expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(kimlik);
        const [p] = planlanan();
        expect(p.identifier).toBe('muhafiz_2027-01-15_vakit_ogle_ertele');
        expect(p.content.title).toBe('⏳ 35 dk kaldı · Ertelediğin Öğle namazı');
        expect(p.content.body).toBe('Gövde');
        expect(p.content.data.ertelemeHedefMs).toBe(SIMDI + 10 * DK);
        expect(p.content.categoryIdentifier).toBe('muhafiz_ertele2_category');
        expect(p.trigger.date.getTime()).toBe(SIMDI + 10 * DK);
        expect(p.trigger.channelId).toBe('muhafiz_abc');
    });

    it('sınırı geçecek erteleme sınıra çekilir (çıkış − 3 dk)', async () => {
        await muhafizErtelemesiniIsle(
            { kimlik: 'muhafiz_2027-01-15_vakit_ogle_seviye_3_dk_15', eylem: 'ertele_20', data: veri() },
            CIKIS - 15 * DK
        );
        expect(planlanan()[0].trigger.date.getTime()).toBe(SINIR);
        // Sınırdaki kopyada artık ertele düğmesi yok.
        expect(planlanan()[0].content.categoryIdentifier).toBe('muhafiz_category');
    });

    it('sınır geçmişse ERTELENMEZ, yalnız kapanır', async () => {
        const kimlik = 'muhafiz_2027-01-15_vakit_ogle_seviye_4_dk_2';
        await muhafizErtelemesiniIsle({ kimlik, eylem: 'ertele_10', data: veri() }, CIKIS - 2 * DK);
        expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(kimlik);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('iOS: kopya aynı sesi (anons klibi) ve kesinti seviyesini taşır', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        await muhafizErtelemesiniIsle(
            {
                kimlik: 'muhafiz_2027-01-15_vakit_ogle_seviye_2_dk_45',
                eylem: 'ertele_10',
                data: veri({ ertelemeSesi: 'muhafiz_anons_ab.caf', kesintiSeviyesi: 'timeSensitive' }),
            },
            SIMDI
        );
        expect(planlanan()[0].content.sound).toBe('muhafiz_anons_ab.caf');
        expect(planlanan()[0].content.interruptionLevel).toBe('timeSensitive');
    });

    it('erteleme süresince vaktin planlı uyarıları (ve anonsları) susturulur; sonrakiler ve başka vakit kalır', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'muhafiz_2027-01-15_vakit_ogle_seviye_2_dk_40' }, // SIMDI+5 → susar
            { identifier: 'muhafiz_2027-01-15_vakit_ogle_seviye_2_dk_35' }, // SIMDI+10 (hedef dakikası) → susar
            { identifier: 'muhafiz_2027-01-15_vakit_ogle_seviye_3_dk_30' }, // SIMDI+15 → kalır
            { identifier: 'muhafiz_2027-01-15_vakit_ikindi_seviye_1_dk_44' }, // başka vakit → kalır
            { identifier: 'muhafiz_2027-01-15_vakit_ogle_yatis' }, // plan değil → kalır
        ]);
        await muhafizErtelemesiniIsle(
            { kimlik: 'muhafiz_2027-01-15_vakit_ogle_seviye_1_dk_45', eylem: 'ertele_10', data: veri() },
            SIMDI
        );
        const iptal = (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
        expect(iptal).toEqual([
            'muhafiz_2027-01-15_vakit_ogle_seviye_2_dk_40',
            'muhafiz_2027-01-15_vakit_ogle_seviye_2_dk_35',
        ]);
        expect(mockYanKanaliIptalEt.mock.calls.map((c) => c[0])).toEqual(iptal);
    });

    it('eksik veri (eski bildirim) kurulmaz ama çökmez', async () => {
        expect(
            await muhafizErtelemesiniIsle(
                { kimlik: 'muhafiz_2027-01-15_vakit_ogle_seviye_1_dk_45', eylem: 'ertele_10', data: { tip: 'muhafiz' } },
                SIMDI
            )
        ).toBe(true);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
});
