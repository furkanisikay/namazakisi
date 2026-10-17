/**
 * NÖBETÇİ — "CAMİDE KILACAĞIM" HATIRLATMASI KAYIT-OYNAT (snapshot).
 *
 * Camiye gitme (#292) ortak hatırlatma modeline (`{ aktif, adimlar }`) ve muhafızla AYNI
 * teslim katmanına (`MuhafizTeslimcisi`'nin kendi önekli örneği) taşınıyor (plan §5.2).
 * Taşıma ESKİ KAYDI BİREBİR AYNI PLANA çevirmeli: aynı kimlik, aynı başlık/gövde, aynı
 * tetik, aynı `data`, kategori YOK ("Kıldım" düğmesi FARZ namazı yazardı), Android'de
 * aynı kanal (`vakit_bildirim`) ve `sound: true`.
 *
 * Snapshot refactor ÖNCESİ koddan üretildi (plan §8 1a). Refactor sonrası bir alan bile
 * değişirse bu test kırmızı yanar.
 *
 * NORMALİZASYON:
 * - Tarih SABİT: sistem saati sahte (Çarşamba 09:00) ve adhan mock'u vakitleri her gün aynı
 *   saate kurar → kimlikler deterministiktir. Tetik yerel `G-A-G SS:DD` olarak yazılır.
 * - `priority` HARİÇ: teslimci önceliği yazar; Android 8+'ta kanal önemi kazanır (plan §3.2).
 * - iOS: `trigger.channelId` (Android'e özgü) ve `interruptionLevel: 'active'`
 *   (belirtilmemişle aynı) karşılaştırmaya GİRMEZ. Ses (`sound: true` = sistem sesi) GİRER.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CamiyeGitHatirlatmaServisi } from '../CamiyeGitHatirlatmaServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn(() => true),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
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
/** 5 Ağustos 2026 = Çarşamba (o haftanın cuması 7 Ağustos — Android 7 gün ufkunda). */
const CARSAMBA_SABAH = new Date(2026, 7, 5, 9, 0, 0);

const TUM_VAKITLER = { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true };

/** Eski (refactor öncesi) kayıt biçimleri — göçün kapsaması gereken şekiller. */
const SENARYOLAR: { ad: string; kayit: Record<string, unknown>; cuma?: Record<string, unknown> }[] = [
    {
        ad: 'varsayilan bes vakit (yurume 10 + hazirlik 5)',
        kayit: { aktif: true, vakitler: TUM_VAKITLER, yurumeDk: 10, hazirlikDk: 5, yurumeKaynagi: 'varsayilan' },
    },
    {
        ad: 'hazirlik payi yok (metin dali degisir)',
        kayit: { aktif: true, vakitler: TUM_VAKITLER, yurumeDk: 20, hazirlikDk: 0, yurumeKaynagi: 'elle' },
    },
    {
        ad: 'alt kume vakitler + tahmin kaynagi',
        kayit: {
            aktif: true,
            vakitler: { imsak: false, ogle: true, ikindi: false, aksam: true, yatsi: false },
            yurumeDk: 7,
            hazirlikDk: 10,
            yurumeKaynagi: 'tahmin',
            camiAdi: 'Merkez Camii',
        },
    },
    {
        ad: 'cuma hatirlatmasi ACIK (cuma gunu ogle atlanir)',
        kayit: { aktif: true, vakitler: TUM_VAKITLER, yurumeDk: 12, hazirlikDk: 5, yurumeKaynagi: 'varsayilan' },
        cuma: { aktif: true, oncedenDk: 60, siklik: 'birkez' },
    },
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
    // iOS'ta `interruptionLevel` belirtilmemişle aynıdır ('active'); başka bir değer KABUL EDİLMEZ.
    if (platform === 'ios' && kesinti !== undefined && kesinti !== 'active') content.interruptionLevel = kesinti;
    return { identifier: c.identifier, content, trigger };
}

async function oynat(
    kayit: Record<string, unknown>,
    cuma: Record<string, unknown> | undefined,
    platform: 'android' | 'ios'
) {
    await AsyncStorage.clear();
    await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI, JSON.stringify(kayit));
    if (cuma) await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, JSON.stringify(cuma));
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
    await CamiyeGitHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(KOORDINAT);
    return (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => normalize(c[0] as Cagri, platform));
}

describe('CamiyeGitHatirlatmaServisi — kayıt-oynat (eski ayar BİREBİR aynı plan)', () => {
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

        it.each(SENARYOLAR)('$ad', async ({ kayit, cuma }) => {
            const plan = await oynat(kayit, cuma, platform);
            expect(plan.length).toBeGreaterThan(0);
            expect(plan).toMatchSnapshot();
        });
    });
});
