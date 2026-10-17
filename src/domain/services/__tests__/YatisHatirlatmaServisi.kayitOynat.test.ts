/**
 * NÖBETÇİ — YATIŞ HATIRLATMASI + GÜN SONU MUHASEBESİ KAYIT-OYNAT (snapshot).
 *
 * Yatış (#290) ortak hatırlatma modeline (`{ aktif, adimlar }`) ve muhafızla AYNI teslim
 * katmanına (`MuhafizTeslimcisi`'nin yatış sahipli örneği) taşınıyor (plan §5.3). Taşıma
 * ESKİ KAYDI BİREBİR AYNI PLANA çevirmeli: aynı kimlik (`muhafiz_<gün>_vakit_<v>_(yatis|
 * muhasebe)` / `muhasebe_<gün>` — native "Kıldım" bunlardan vakit çözer), aynı başlık/gövde,
 * aynı tetik (yatsı girişi kayması dahil), aynı `data`, AYNI KATEGORİ (Kıldım / Kazaya ekle /
 * İnceleyin), Android'de aynı kanal (yatsı `muhafiz` tabanı, muhasebe `vakit_bildirim`) ve
 * `sound: true`.
 *
 * Snapshot refactor ÖNCESİ koddan üretildi (plan §8 1a). Refactor sonrası bir alan bile
 * değişirse bu test kırmızı yanar.
 *
 * NORMALİZASYON: sistem saati sahte, adhan mock'u vakitleri her gün aynı saate kurar; tetik
 * yerel `G-A-G SS:DD`. `priority` HARİÇ (plan §3.2); iOS'ta `trigger.channelId` ve
 * `interruptionLevel: 'active'` karşılaştırmaya GİRMEZ.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { yatisTeslimcisiniAl, yatisTeslimcisiniAyarla } from '../YatisHatirlatmaServisi';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn(() => true),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

// adhan: vakitler her gün aynı saatte (deterministik). Yatsı 21:00 → 20:30 yatışın
// tetiği (20:00) yatsı girişinden ÖNCE düşer (kayma senaryosu).
jest.mock('adhan', () => ({
    Coordinates: jest.fn(),
    CalculationMethod: { Turkey: jest.fn(() => ({})) },
    PrayerTimes: jest.fn().mockImplementation((_k, tarih: Date) => {
        const saat = (s: number, d: number) => {
            const t = new Date(tarih);
            t.setHours(s, d, 0, 0);
            return t;
        };
        return {
            fajr: saat(5, 0),
            sunrise: saat(6, 30),
            dhuhr: saat(13, 0),
            asr: saat(16, 30),
            maghrib: saat(19, 30),
            isha: saat(21, 0),
        };
    }),
}));

import { YatisHatirlatmaServisi } from '../YatisHatirlatmaServisi';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import * as LocalNamazServisi from '../../../data/local/LocalNamazServisi';

const KOORDINAT = { lat: 41.0, lng: 29.0 };
/** 5 Ağustos 2026 (Çarşamba) 15:00 — namaz günü: 5 Ağustos. */
const SIMDI = new Date(2026, 7, 5, 15, 0, 0);
const BUGUN = '2026-08-05';

const TEMEL = { aktif: true, saat: 23, dakika: 0, onceDk: 30, yatsiHatirlatmasi: true, muhasebe: true };

/** Eski (refactor öncesi) kayıt biçimleri + o günün kılınmışlığı. */
const SENARYOLAR: { ad: string; kayit: Record<string, unknown>; kilinan?: NamazAdi[] }[] = [
    { ad: 'varsayilan 23:00 / 30 dk, hicbiri kilinmamis (yatsi + muhasebe satiri)', kayit: TEMEL },
    { ad: '20:30 yatis — tetik yatsi girisinden ONCE (kayma)', kayit: { ...TEMEL, saat: 20, dakika: 30 } },
    { ad: '00:30 yatis — ertesi takvim gunu', kayit: { ...TEMEL, saat: 0, dakika: 30, onceDk: 30 } },
    { ad: 'uzun once (120 dk)', kayit: { ...TEMEL, saat: 1, dakika: 0, onceDk: 120 } },
    { ad: 'yalniz yatsi hatirlatmasi', kayit: { ...TEMEL, muhasebe: false } },
    {
        ad: 'yalniz muhasebe — yatsi tek eksik ve suruyor (muhasebeTek, muhafiz kategorisi)',
        kayit: { ...TEMEL, yatsiHatirlatmasi: false },
        kilinan: [NamazAdi.Sabah, NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam],
    },
    {
        ad: 'yatsi kilinmis + sabah eksik (muhasebeTek, Kazaya ekle kategorisi)',
        kayit: TEMEL,
        kilinan: [NamazAdi.Ogle, NamazAdi.Ikindi, NamazAdi.Aksam, NamazAdi.Yatsi],
    },
    {
        ad: 'yatsi kilinmis + birden fazla eksik (muhasebe_<gun>, Inceleyin)',
        kayit: TEMEL,
        kilinan: [NamazAdi.Aksam, NamazAdi.Yatsi],
    },
    { ad: 'onceDk alani yok (en eski kayit, varsayilana duser)', kayit: { aktif: true, saat: 22, dakika: 15 } },
];

type Cagri = { identifier: string; content: Record<string, unknown>; trigger: Record<string, unknown> };

const ikiHane = (n: number) => String(n).padStart(2, '0');
const yerelZaman = (t: Date) =>
    `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()} ${ikiHane(t.getHours())}:${ikiHane(t.getMinutes())}`;

function normalize(c: Cagri, platform: 'android' | 'ios'): Record<string, unknown> {
    const content: Record<string, unknown> = { ...c.content };
    const kesinti = content.interruptionLevel;
    delete content.priority;
    delete content.interruptionLevel;
    const tetik = c.trigger.date as Date;
    const trigger: Record<string, unknown> = { type: c.trigger.type, zaman: yerelZaman(tetik) };
    if (platform === 'android') trigger.channelId = c.trigger.channelId;
    if (platform === 'ios' && kesinti !== undefined && kesinti !== 'active') content.interruptionLevel = kesinti;
    return { identifier: c.identifier, content, trigger };
}

async function oynat(kayit: Record<string, unknown>, kilinan: NamazAdi[] | undefined, platform: 'android' | 'ios') {
    await AsyncStorage.clear();
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI, JSON.stringify(kayit));
    for (const n of kilinan ?? []) await LocalNamazServisi.localNamazDurumunuGuncelle(BUGUN, n, true);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
    const servis = YatisHatirlatmaServisi.getInstance();
    servis.__testIcinSifirla();
    await servis.hatirlatmalariGuncelle(KOORDINAT, undefined, new Date(SIMDI));
    return (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => normalize(c[0] as Cagri, platform));
}

describe('YatisHatirlatmaServisi — kayıt-oynat (eski ayar BİREBİR aynı plan)', () => {
    beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
        jest.setSystemTime(SIMDI);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        (Notifications.getPresentedNotificationsAsync as jest.Mock | undefined)?.mockResolvedValue?.([]);
        (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    describe.each(['android', 'ios'] as const)('%s', (platform) => {
        beforeEach(() => {
            jest.replaceProperty(Platform, 'OS', platform);
            // Önbellekteki teslimci sıfırlanır: aksi halde iOS turu Android teslimcisiyle ölçülürdü.
            yatisTeslimcisiniAyarla(null);
        });

        it.each(SENARYOLAR)('$ad', async ({ kayit, kilinan }) => {
            const plan = await oynat(kayit, kilinan, platform);
            expect(plan.length).toBeGreaterThan(0);
            // Kanıt: ölçülen yol GERÇEKTEN o platformun teslimcisi (jest varsayılanı iOS).
            expect(yatisTeslimcisiniAl().ad).toBe(platform);
            expect(plan).toMatchSnapshot();
        });
    });
});
