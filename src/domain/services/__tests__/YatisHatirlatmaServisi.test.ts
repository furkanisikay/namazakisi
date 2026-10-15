/**
 * Yatış hatırlatması servisi (issue #290): temizlik yalnız kendi kimliklerine
 * dokunur, konum yokken kurulu plan korunur, kılınmışlık değişince yeniden
 * planlanır (adlı yuva `yatis`).
 */
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { YatisHatirlatmaServisi } from '../YatisHatirlatmaServisi';
import { YATIS_VARSAYILAN_AYARLARI } from '../../../core/yatis/yatisPlani';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../../data/local/LocalNamazServisi';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };
const AYAR = { ...YATIS_VARSAYILAN_AYARLARI, aktif: true };
const SIMDI = new Date(2026, 9, 13, 15, 0);

const planlanan = () => (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
const iptal = () => (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);

let servis: YatisHatirlatmaServisi;

beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    jest.replaceProperty(Platform, 'OS', 'android');
    servis = YatisHatirlatmaServisi.getInstance();
    servis.__testIcinSifirla();
});

afterEach(() => jest.restoreAllMocks());

describe('YatisHatirlatmaServisi', () => {
    it('Android: 7 namaz günü planlar; yatsı bildirimi muhafızın taban kanalından', async () => {
        await servis.hatirlatmalariGuncelle(ISTANBUL, AYAR, SIMDI);
        const p = planlanan();
        expect(p).toHaveLength(7);
        expect(p[0].identifier).toMatch(/^muhafiz_\d{4}-\d{2}-\d{2}_vakit_yatsi_yatis$/);
        expect(p[0].trigger.channelId).toBe('muhafiz');
        expect(p[0].content.categoryIdentifier).toBe('muhafiz_category');
    });

    it('temizlik YALNIZ kendi kimliklerine dokunur (muhafız planı, erteleme, cuma kalır)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'muhafiz_2026-10-13_vakit_yatsi_yatis' },
            { identifier: 'muhafiz_2026-10-13_vakit_ogle_muhasebe' },
            { identifier: 'muhasebe_2026-10-12' },
            { identifier: 'muhafiz_2026-10-13_vakit_yatsi_seviye_1_dk_45' },
            { identifier: 'muhafiz_2026-10-13_vakit_yatsi_ertele' },
            { identifier: 'cuma_hatirlatma_2026-10-16' },
        ]);
        await servis.hatirlatmalariGuncelle(ISTANBUL, { ...AYAR, aktif: false }, SIMDI);
        expect(iptal()).toEqual([
            'muhafiz_2026-10-13_vakit_yatsi_yatis',
            'muhafiz_2026-10-13_vakit_ogle_muhasebe',
            'muhasebe_2026-10-12',
        ]);
        expect(planlanan()).toHaveLength(0);
    });

    it('konum YOKKEN kurulu plan KORUNUR (silip yerine hiçbir şey koymaz)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            { identifier: 'muhafiz_2026-10-13_vakit_yatsi_yatis' },
        ]);
        await servis.hatirlatmalariGuncelle({ lat: 0, lng: 0 }, AYAR, SIMDI);
        expect(iptal()).toHaveLength(0);
        expect(planlanan()).toHaveLength(0);
    });

    it('koordinat verilmezse ham konum kaydından okunur (headless yol)', async () => {
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI, JSON.stringify({ koordinatlar: ISTANBUL }));
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI, JSON.stringify(AYAR));
        await servis.hatirlatmalariGuncelle(undefined, undefined, SIMDI);
        expect(planlanan()).toHaveLength(7);
    });

    it('KILINMIŞLIK değişince yeniden planlar (adlı yuva) — içerik bayat kalmaz', async () => {
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI, JSON.stringify({ koordinatlar: ISTANBUL }));
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI, JSON.stringify(AYAR));
        servis.baslat();
        await LocalNamazServisi.localNamazDurumunuGuncelle('2026-10-13', NamazAdi.Yatsi, true);
        await new Promise((r) => setTimeout(r, 50));
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
        LocalNamazServisi.kayitDegistiDinleyicisiEkle('yatis', null);
    });
});
