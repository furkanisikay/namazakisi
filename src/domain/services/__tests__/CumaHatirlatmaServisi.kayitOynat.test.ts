/**
 * NÖBETÇİ — CUMA HATIRLATMASI KAYIT-OYNAT (snapshot).
 *
 * Cuma (#173) ortak hatırlatma modeline (`{ aktif, adimlar }`) ve muhafızla AYNI
 * teslim katmanına (`MuhafizTeslimcisi`'nin kendi önekli örneği) taşınıyor. Taşıma
 * ESKİ KAYDI BİREBİR AYNI PLANA çevirmeli: aynı kimlik, aynı başlık/gövde, aynı
 * tetik, aynı `data`, kategori YOK ("Kıldım" düğmesi FARZ öğleyi yazardı), Android'de
 * aynı kanal (`vakit_bildirim`) ve `sound: true`.
 *
 * Snapshot refactor ÖNCESİ koddan üretildi (plan §8 1a). Refactor sonrası bir alan
 * bile değişirse bu test kırmızı yanar.
 *
 * NORMALİZASYON:
 * - Tarih SABİT: sistem saati sahte (Çarşamba 09:00) ve adhan mock'u öğleyi her gün
 *   13:00'e kurar → kimlikler deterministiktir. Tetik, ham damga yerine "öğleye kalan
 *   dk" olarak yazılır (planı belirleyen odur).
 * - `priority` HARİÇ: teslimci önceliği yazar; Android 8+'ta kanal önemi kazanır,
 *   yalnız Android 7'de heads-up farkı vardır (plan §3.2 — bilinçli kabul).
 * - iOS: `trigger.channelId` (Android'e özgü; expo iOS'ta yok sayar) ve
 *   `interruptionLevel` (`active` = belirtilmemişle aynı davranış) karşılaştırmaya
 *   GİRMEZ. Ses (`sound: true` = sistem sesi) GİRER.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CumaHatirlatmaServisi } from '../CumaHatirlatmaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => {
    const disk = new Map<string, string>();
    return {
        __disk: disk,
        getItem: jest.fn(async (k: string) => disk.get(k) ?? null),
        setItem: jest.fn(async (k: string, v: string) => {
            disk.set(k, v);
        }),
        removeItem: jest.fn(async (k: string) => {
            disk.delete(k);
        }),
        multiGet: jest.fn(async (ks: string[]) => ks.map((k) => [k, disk.get(k) ?? null])),
        getAllKeys: jest.fn(async () => [...disk.keys()]),
    };
});

jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn(() => true),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

// adhan: öğle her gün 13:00 (deterministik).
jest.mock('adhan', () => ({
    Coordinates: jest.fn(),
    CalculationMethod: { Turkey: jest.fn(() => ({})) },
    PrayerTimes: jest.fn().mockImplementation((_k, tarih: Date) => {
        const d = new Date(tarih);
        d.setHours(13, 0, 0, 0);
        return { dhuhr: d };
    }),
}));

const KOORDINAT = { lat: 41.0, lng: 29.0 };
/** 5 Ağustos 2026 = Çarşamba (o haftanın cuması 7 Ağustos). */
const CARSAMBA_SABAH = new Date(2026, 7, 5, 9, 0, 0);

const disk = (AsyncStorage as unknown as { __disk: Map<string, string> }).__disk;

/** Eski (refactor öncesi) kayıt biçimleri — göçün kapsaması gereken tüm şekiller. */
const SENARYOLAR: { ad: string; kayit: Record<string, unknown> }[] = [
    { ad: 'varsayilan tek atis', kayit: { aktif: true, oncedenDk: 60, siklik: 'birkez' } },
    { ad: 'tekrarli 15 dk', kayit: { aktif: true, oncedenDk: 90, siklik: { herDk: 15 } } },
    { ad: 'uzun pencere 60 dk tekrar', kayit: { aktif: true, oncedenDk: 180, siklik: { herDk: 60 } } },
    { ad: 'siklik alani yok (en eski kayit)', kayit: { aktif: true, oncedenDk: 45 } },
];

type Cagri = { identifier: string; content: Record<string, unknown>; trigger: Record<string, unknown> };

/** Öğleye kalan dakika — tetik tarihinin cumasının 13:00'ü çapadır. */
function ogleyeKalanDk(tarih: Date): number {
    const ogle = new Date(tarih);
    ogle.setHours(13, 0, 0, 0);
    return Math.round((ogle.getTime() - tarih.getTime()) / 60000);
}

function normalize(c: Cagri, platform: 'android' | 'ios'): Record<string, unknown> {
    const content: Record<string, unknown> = { ...c.content };
    const kesinti = content.interruptionLevel;
    delete content.priority;
    delete content.interruptionLevel;
    const tetik = c.trigger.date as Date;
    const trigger: Record<string, unknown> = { type: c.trigger.type, ogleyeKalanDk: ogleyeKalanDk(tetik) };
    if (platform === 'android') trigger.channelId = c.trigger.channelId;
    // iOS'ta `interruptionLevel` belirtilmemişle aynıdır ('active'); başka bir değer KABUL EDİLMEZ.
    if (platform === 'ios' && kesinti !== undefined && kesinti !== 'active') content.interruptionLevel = kesinti;
    return {
        identifier: c.identifier,
        gun: `${tetik.getFullYear()}-${tetik.getMonth() + 1}-${tetik.getDate()}`,
        content,
        trigger,
    };
}

async function oynat(kayit: Record<string, unknown>, platform: 'android' | 'ios') {
    disk.clear();
    disk.set(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, JSON.stringify(kayit));
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
    await CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(KOORDINAT);
    return (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => normalize(c[0] as Cagri, platform));
}

describe('CumaHatirlatmaServisi — kayıt-oynat (eski ayar BİREBİR aynı plan)', () => {
    beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
        jest.setSystemTime(CARSAMBA_SABAH);
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
        });

        it.each(SENARYOLAR)('$ad', async ({ kayit }) => {
            const plan = await oynat(kayit, platform);
            expect(plan.length).toBeGreaterThan(0);
            expect(plan).toMatchSnapshot();
        });
    });
});
