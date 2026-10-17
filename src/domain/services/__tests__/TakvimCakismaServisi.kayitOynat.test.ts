/**
 * NÖBETÇİ — TAKVİM ÇAKIŞMASI UYARISI KAYIT-OYNAT (snapshot).
 *
 * Takvim çakışması (#291) ortak hatırlatma modeline (`{ aktif, adimlar }`) ve muhafızla AYNI
 * teslim katmanına (`MuhafizTeslimcisi`'nin kendi önekli örneği) taşınıyor (plan §5.4, PR-C).
 * Taşıma ESKİ KAYDI BİREBİR AYNI PLANA çevirmeli: aynı kimlik, aynı başlık/gövde (etkinlik
 * adı yalnız `baslikGoster` açıkken), aynı tetik (`once` / `kapliyor` tabanları dahil), aynı
 * `data` (ad YOK), kategori YOK, Android'de aynı kanal (`vakit_bildirim`) ve `sound: true`.
 *
 * Snapshot refactor ÖNCESİ koddan üretildi (plan §8 1a). Refactor sonrası bir alan bile
 * değişirse bu test kırmızı yanar.
 *
 * NORMALİZASYON:
 * - Tarih SABİT: sistem saati sahte (Çarşamba 09:00) ve adhan mock'u vakitleri her gün aynı
 *   saate kurar; etkinlikler mutlak tarihlidir → kimlikler deterministiktir. Tetik yerel
 *   `G-A-G SS:DD` olarak yazılır.
 * - `priority` HARİÇ: teslimci önceliği yazar; Android 8+'ta kanal önemi kazanır (plan §3.2).
 * - iOS: `trigger.channelId` (Android'e özgü) ve `interruptionLevel: 'active'`
 *   (belirtilmemişle aynı) karşılaştırmaya GİRMEZ. Ses (`sound: true` = sistem sesi) GİRER.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TakvimCakismaServisi } from '../TakvimCakismaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

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

const mockEtkinlikler = jest.fn();
jest.mock('expo-calendar/legacy', () => ({
    EntityTypes: { EVENT: 'event' },
    getCalendarPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    requestCalendarPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    getCalendarsAsync: jest.fn(async () => [{ id: 'is' }]),
    getEventsAsync: (...a: unknown[]) => mockEtkinlikler(...a),
}));

// adhan: vakitler her gün aynı saatte (deterministik).
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

const KOORDINAT = { lat: 41.0, lng: 29.0 };
/** 5 Ağustos 2026 = Çarşamba. */
const CARSAMBA_SABAH = new Date(2026, 7, 5, 9, 0, 0);

const t = (gunEk: number, s: number, d: number) => new Date(2026, 7, 5 + gunEk, s, d, 0).toISOString();
const etkinlik = (bas: string, bit: string, title: string, ek: Record<string, unknown> = {}) => ({
    startDate: bas,
    endDate: bit,
    allDay: false,
    availability: 'busy',
    status: 'confirmed',
    title,
    notes: '',
    ...ek,
});

/**
 * Karar tablosunun her dalını kapsayan etkinlikler:
 *  - bugün öğle `once` (14:30–16:45)
 *  - yarın öğle `kapliyor` (12:00–17:00; taban giriş − 60)
 *  - +2 akşam iki etkinlik TEK blok, `kapliyor` (19:00–19:50 + 19:55–21:10)
 *  - +3 yatsı gece yarısını aşan `once` (21:30–04:55)
 *  - +4 ikindi kerahat son anı `once` (18:00–19:20)
 *  - süzülenler: tüm gün, "belki", iptal, uygulamanın kendi namaz etkinliği
 */
const ETKINLIKLER = [
    etkinlik(t(0, 14, 30), t(0, 16, 45), 'Gizli proje toplantısı'),
    etkinlik(t(1, 12, 0), t(1, 17, 0), 'Uzun atölye'),
    etkinlik(t(2, 19, 0), t(2, 19, 50), 'Akşam yemeği'),
    etkinlik(t(2, 19, 55), t(2, 21, 10), 'Konser'),
    etkinlik(t(3, 21, 30), t(4, 4, 55), 'Gece nöbeti'),
    etkinlik(t(4, 18, 0), t(4, 19, 20), 'Veli toplantısı'),
    etkinlik(t(5, 12, 0), t(5, 17, 0), 'Tüm gün', { allDay: true }),
    etkinlik(t(5, 12, 0), t(5, 17, 0), 'Belki', { availability: 'tentative' }),
    etkinlik(t(6, 12, 0), t(6, 17, 0), 'İptal', { status: 'canceled' }),
    etkinlik(t(6, 15, 0), t(6, 16, 50), 'İkindi Namazı', { notes: 'Namaz Akışı tarafından oluşturuldu' }),
];

const RIZA = '2026-08-01T10:00:00.000Z';

/** Eski (refactor öncesi) kayıt biçimleri — göçün kapsaması gereken şekiller. */
const SENARYOLAR: { ad: string; kayit: Record<string, unknown>; kilinan?: Record<string, string[]> }[] = [
    { ad: 'varsayilan (30 dk once, ad gizli)', kayit: { aktif: true, oncedenDk: 30, baslikGoster: false, rizaZamani: RIZA } },
    { ad: 'ad acik + 10 dk once', kayit: { aktif: true, oncedenDk: 10, baslikGoster: true, rizaZamani: RIZA } },
    { ad: '120 dk once (taban kenetlenmesi)', kayit: { aktif: true, oncedenDk: 120, baslikGoster: false, rizaZamani: RIZA } },
    {
        ad: 'bugun ogle kilinmis (muhafiz kilinmisligi)',
        kayit: { aktif: true, oncedenDk: 30, baslikGoster: true, rizaZamani: RIZA },
        kilinan: { '2026-08-05': ['ogle'] },
    },
];

type Cagri = { identifier: string; content: Record<string, unknown>; trigger: Record<string, unknown> };

const ikiHane = (n: number) => String(n).padStart(2, '0');
const yerelZaman = (z: Date) =>
    `${z.getFullYear()}-${z.getMonth() + 1}-${z.getDate()} ${ikiHane(z.getHours())}:${ikiHane(z.getMinutes())}`;

function normalize(c: Cagri, platform: 'android' | 'ios'): Record<string, unknown> {
    const content: Record<string, unknown> = { ...c.content };
    const kesinti = content.interruptionLevel;
    delete content.priority;
    delete content.interruptionLevel;
    const tetik = c.trigger.date as Date;
    const trigger: Record<string, unknown> = { type: c.trigger.type, zaman: yerelZaman(tetik) };
    if (platform === 'android') trigger.channelId = c.trigger.channelId;
    // iOS'ta `interruptionLevel` belirtilmemişle aynıdır ('active'); başka bir değer KABUL EDİLMEZ.
    if (platform === 'ios' && kesinti !== undefined && kesinti !== 'active') content.interruptionLevel = kesinti;
    return { identifier: c.identifier, content, trigger };
}

async function oynat(kayit: Record<string, unknown>, kilinan: Record<string, string[]> | undefined, platform: 'android' | 'ios') {
    await AsyncStorage.clear();
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI, JSON.stringify(kayit));
    for (const [tarih, vakitler] of Object.entries(kilinan ?? {})) {
        await AsyncStorage.setItem(`${DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI}_kilinan_${tarih}`, JSON.stringify(vakitler));
    }
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
    const servis = TakvimCakismaServisi.getInstance();
    servis.__testIcinSifirla();
    await servis.hatirlatmalariGuncelle(KOORDINAT, new Date());
    return (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => normalize(c[0] as Cagri, platform));
}

describe('TakvimCakismaServisi — kayıt-oynat (eski ayar BİREBİR aynı plan)', () => {
    beforeEach(() => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
        jest.setSystemTime(CARSAMBA_SABAH);
        mockEtkinlikler.mockResolvedValue(ETKINLIKLER);
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

        it.each(SENARYOLAR)('$ad', async ({ kayit, kilinan }) => {
            const plan = await oynat(kayit, kilinan, platform);
            expect(plan.length).toBeGreaterThan(0);
            expect(plan).toMatchSnapshot();
        });
    });
});
