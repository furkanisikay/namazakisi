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
// Android teslimcisi native TTS köprüsünü import eder (jest'te yok — AGENTS.md).
const mockOnekliAnons = jest.fn((_o: string) => true);
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: (o: string) => mockOnekliAnons(o),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

import { NativeModules } from 'react-native';
import { YatisHatirlatmaServisi, yatisTeslimcisiniAl, yatisTeslimcisiniAyarla } from '../YatisHatirlatmaServisi';
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
    // Teslimci `Date.now()` ile geçmiş tetiği atar → saat SIMDI'ye sabitlenir (zamanlayıcılar gerçek).
    jest.useFakeTimers({ now: SIMDI, doNotFake: ['setTimeout', 'clearTimeout', 'setImmediate', 'nextTick', 'queueMicrotask'] });
    yatisTeslimcisiniAyarla(null);
    await AsyncStorage.clear();
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockResolvedValue(undefined);
    jest.replaceProperty(Platform, 'OS', 'android');
    servis = YatisHatirlatmaServisi.getInstance();
    servis.__testIcinSifirla();
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});

afterAll(() => yatisTeslimcisiniAyarla(null));

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

    it('teslim muhafızın teslim katmanından, YATIŞ sahipli kendi örneğiyle; kategori ve yük korunur', async () => {
        await servis.hatirlatmalariGuncelle(ISTANBUL, AYAR, SIMDI);
        expect(yatisTeslimcisiniAl().ad).toBe('android');
        const p = planlanan()[0];
        expect(p.content.data).toMatchObject({ tip: 'yatis', vakit: 'yatsi' });
        // Önek yolu ÇAĞRILMAZ: `muhafiz_` öneki muhafızın anonslarını da silerdi.
        expect(mockOnekliAnons).not.toHaveBeenCalled();
    });

    it('önceki turun anons + alarmları YATIŞ sahipliğiyle silinir (native sahipliIptalEt)', async () => {
        const sahipliIptalEt = jest.fn().mockResolvedValue(undefined);
        (NativeModules as Record<string, unknown>).MuhafizAlarm = {
            sahipliIptalEt,
            onekliIptalEt: jest.fn().mockResolvedValue(0),
            kanallariTemizle: jest.fn(),
            planla: jest.fn().mockResolvedValue(true),
        };
        try {
            await servis.hatirlatmalariGuncelle(ISTANBUL, AYAR, SIMDI);
            expect(sahipliIptalEt).toHaveBeenCalledWith('yatis', true, false);
            expect(sahipliIptalEt).toHaveBeenCalledWith('yatis', false, true);
            expect(sahipliIptalEt).not.toHaveBeenCalledWith('muhafiz_plan', expect.anything(), expect.anything());
        } finally {
            delete (NativeModules as Record<string, unknown>).MuhafizAlarm;
        }
    });

    it('çok adım + tekrar: ilk tetik tarihsel kimlik, tekrarlar `_<kalanDk>`; hepsi aynı içerik', async () => {
        const ayar = {
            ...AYAR,
            adimlar: [{ ...AYAR.adimlar[0], esikDk: 60, siklik: { herDk: 20 } as const }],
        };
        await servis.hatirlatmalariGuncelle(ISTANBUL, ayar, SIMDI);
        const bugun = planlanan().filter((p) => String(p.identifier).startsWith('muhafiz_2026-10-13_vakit_yatsi_yatis'));
        expect(bugun.map((p) => p.identifier)).toEqual([
            'muhafiz_2026-10-13_vakit_yatsi_yatis',
            'muhafiz_2026-10-13_vakit_yatsi_yatis_40',
            'muhafiz_2026-10-13_vakit_yatsi_yatis_20',
        ]);
        expect(new Set(bugun.map((p) => p.content.title)).size).toBe(1);
    });
});
