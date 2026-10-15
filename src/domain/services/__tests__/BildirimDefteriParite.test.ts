/**
 * NÖBETÇİ — BİLDİRİM DEFTERİ ↔ GERÇEK PLAN PARİTESİ (issue #298).
 *
 * Fable kararı: defter ayrı bir tahmin fonksiyonu DEĞİL, gerçek plan
 * üreticilerinin kuru çalışmasıdır. Bu dosya iddiayı ölçer: aynı girdiyle
 * servisler cihaza kaç bildirim/alarm gönderiyorsa defter de o kaynak için
 * AYNI sayıyı vermeli. Biri ayrışırsa (ör. servise yeni bir eleme kuralı eklenip
 * üreticiye eklenmezse) rehber ekranı yalan söyler.
 *
 * Saat SABİTLENİR (yalnız `Date` sahtelenir; zamanlayıcılar gerçek kalır):
 * servisler `new Date()` okur, defter `simdi` alır — ikisi aynı anı görmeli.
 */
import * as Notifications from 'expo-notifications';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';

jest.mock('@notifee/react-native', () => ({
    __esModule: true,
    default: {
        getNotificationSettings: jest.fn(() => Promise.resolve({ android: { alarm: 1 } })),
        createChannel: jest.fn().mockResolvedValue('kanal'),
        deleteChannel: jest.fn().mockResolvedValue(undefined),
        displayNotification: jest.fn().mockResolvedValue('id'),
        cancelNotification: jest.fn().mockResolvedValue(undefined),
        cancelTriggerNotification: jest.fn().mockResolvedValue(undefined),
        getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
        getDisplayedNotifications: jest.fn().mockResolvedValue([]),
        createTriggerNotification: jest.fn().mockResolvedValue('tetik'),
    },
    TriggerType: { TIMESTAMP: 0 },
    AlarmType: { SET_AND_ALLOW_WHILE_IDLE: 1, SET_EXACT_AND_ALLOW_WHILE_IDLE: 3 },
    AndroidNotificationSetting: { NOT_SUPPORTED: -1, DISABLED: 0, ENABLED: 1 },
    AndroidImportance: { LOW: 2, DEFAULT: 3, HIGH: 4 },
    AndroidStyle: { BIGTEXT: 0 },
}));

const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...a: unknown[]) => mockPlanlaAnons(...a),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    startCountdown: jest.fn(),
    stopCountdown: jest.fn(),
    stopAll: jest.fn(),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

// Takvim çakışması (issue #291): servis ve defter AYNI okuyucudan geçer.
const mockTakvimEtkinlikleri = jest.fn((..._a: unknown[]) => Promise.resolve([] as unknown[]));
jest.mock('expo-calendar/legacy', () => ({
    EntityTypes: { EVENT: 'event' },
    getCalendarPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestCalendarPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCalendarsAsync: jest.fn(() => Promise.resolve([{ id: 'is' }])),
    getEventsAsync: (...a: unknown[]) => mockTakvimEtkinlikleri(...a),
}));

jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: { hazirla: jest.fn(async (m?: unknown) => m) },
}));

jest.mock('../../../core/utils/Logger', () => ({
    Logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';
import { muhafizTeslimcisiniAyarla } from '../MuhafizTeslimcisi';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';
import { IosMuhafizTeslimcisi } from '../IosMuhafizTeslimcisi';
import { NafileHatirlatmaServisi, nafileTeslimcisiniAyarla } from '../NafileHatirlatmaServisi';
import { ANDROID_NAFILE_PAYI } from '../../../core/bildirim/butceSabitleri';
import { CumaHatirlatmaServisi } from '../CumaHatirlatmaServisi';
import { CamiyeGitHatirlatmaServisi } from '../CamiyeGitHatirlatmaServisi';
import { VakitBildirimYoneticiServisi } from '../VakitBildirimYoneticiServisi';
import { VakitSayacBildirimServisi } from '../VakitSayacBildirimServisi';
import { gunSonuHatirlatmalariniGuncelle } from '../GunSonuHatirlaticiServisi';
import { YatisHatirlatmaServisi } from '../YatisHatirlatmaServisi';
import { YATIS_VARSAYILAN_AYARLARI, yatisKimligiMi } from '../../../core/yatis/yatisPlani';
import { TakvimCakismaServisi } from '../TakvimCakismaServisi';
import { defterDisGirdisiniOku } from '../BildirimDefteriServisi';
import { takvimCakismaKimligiMi } from '../../../core/bildirim/takvimCakismaPlani';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { bildirimDefteriOlustur, defterOzeti, iosYedekleriSigdir, type DefterGirdisi, type DefterKaynagi } from '../../../core/bildirim/bildirimDefteri';
import { butceOnerileriOlustur } from '../../../core/bildirim/butceOnerileri';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../../core/nafile/nafileTipleri';
import { nafileAyarlariniNormalize } from '../../../data/local/LocalNafileServisi';
import { sayacBaslangicEsikleriHesapla, muhafizUyarilanVakitleriBul } from '../../../core/utils/vakitSayacYardimcisi';
import { ISTANBUL, matrisKur } from '../../../core/bildirim/__tests__/defterFikstur';
import type { MuhafizMatrisi } from '../../../core/muhafiz/matrisTipleri';

const zamanDegilYalnizTarih = (an: Date) =>
    jest.useFakeTimers({
        now: an,
        doNotFake: [
            'hrtime',
            'nextTick',
            'performance',
            'queueMicrotask',
            'requestAnimationFrame',
            'cancelAnimationFrame',
            'requestIdleCallback',
            'cancelIdleCallback',
            'setImmediate',
            'clearImmediate',
            'setInterval',
            'clearInterval',
            'setTimeout',
            'clearTimeout',
        ],
    });

/** Yerel saatle sabit an — sabah 09:00: öğle/ikindi/akşam/yatsı gelecekte. */
const SABAH = new Date(2026, 9, 13, 9, 0, 0);

const disk = new Map<string, string>();
const planlananlar = () => (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0]);
const onekliSay = (onek: string) => planlananlar().filter((p) => String(p.identifier).startsWith(onek)).length;

const say = (g: DefterGirdisi, kaynak: DefterKaynagi) =>
    bildirimDefteriOlustur(g).filter((k) => k.kaynak === kaynak).length;

const temelGirdi = (platform: 'ios' | 'android', ek: Partial<DefterGirdisi> = {}): DefterGirdisi => ({
    platform,
    simdi: new Date(SABAH),
    koordinat: ISTANBUL,
    widget: false,
    ...ek,
});

beforeEach(() => {
    jest.clearAllMocks();
    zamanDegilYalnizTarih(SABAH);
    disk.clear();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (k: string) => disk.get(k) ?? null);
    (AsyncStorage.setItem as jest.Mock).mockImplementation(async (k: string, v: string) => {
        disk.set(k, v);
    });
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('id');
    jest.replaceProperty(Platform, 'OS', 'android');
});

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});

afterAll(() => muhafizTeslimcisiniAyarla(null));

describe('muhafız: defter = teslimcinin kurduğu', () => {
    const matris = matrisKur();

    it('Android: bildirim sayısı + sesli anons alarmı sayısı birebir', async () => {
        muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris });

        const g = temelGirdi('android', { muhafiz: { aktif: true, matris } });
        expect(say(g, 'muhafiz')).toBeGreaterThan(0);
        expect(onekliSay('muhafiz_')).toBe(say(g, 'muhafiz'));
        expect(mockPlanlaAnons).toHaveBeenCalledTimes(say(g, 'anons'));
    });

    it('Android AKŞAM (issue #74 M2): yarının imsağı da kurulur, defter onu da sayar', async () => {
        const aksam = new Date(2026, 9, 13, 21, 0, 0);
        zamanDegilYalnizTarih(aksam);
        muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris });

        const yarinImsak = onekliSay('muhafiz_2026-10-14_vakit_imsak_');
        expect(yarinImsak).toBeGreaterThan(0);
        const g = temelGirdi('android', { simdi: aksam, muhafiz: { aktif: true, matris } });
        expect(onekliSay('muhafiz_')).toBe(say(g, 'muhafiz'));
        expect(mockPlanlaAnons).toHaveBeenCalledTimes(say(g, 'anons'));

        // Android'de yarının imsağı tam haklıdır: bütçe artığı (yedek) değildir.
        expect(bildirimDefteriOlustur(g).some((k) => k.yedek)).toBe(false);
    });

    describe('iOS AKŞAM: yarının imsağı BÜTÇE ARTIĞI olarak kurulur', () => {
        const aksam = new Date(2026, 9, 13, 21, 0, 0);
        const iosAksam = async (m: MuhafizMatrisi, bekleyen = 0) => {
            zamanDegilYalnizTarih(aksam);
            jest.replaceProperty(Platform, 'OS', 'ios');
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
                Array.from({ length: bekleyen }, (_, i) => ({ identifier: `vakit_bildirim_${i}` }))
            );
            muhafizTeslimcisiniAyarla(new IosMuhafizTeslimcisi());
            await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris: m });
        };

        it('yer varken yarının imsağının TAMAMI kurulur; defter birebir, aşım yok', async () => {
            const hafif: MuhafizMatrisi = matrisKur(() => ({
                seviyeler: [
                    { kademe: 'nazik', esikDk: 30, siklik: { herDk: 15 }, kanallar: { bildirim: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                    { kademe: 'sert', esikDk: 5, siklik: 'birkez', kanallar: { bildirim: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                ],
            }));
            await iosAksam(hafif);

            const yarinImsak = onekliSay('muhafiz_2026-10-14_vakit_imsak_');
            expect(yarinImsak).toBeGreaterThan(0);
            const g = temelGirdi('ios', { simdi: aksam, muhafiz: { aktif: true, matris: hafif } });
            const ozet = defterOzeti(bildirimDefteriOlustur(g), 'ios');
            expect(ozet.yedek).toBe(yarinImsak);
            expect(onekliSay('muhafiz_')).toBe(ozet.toplam + ozet.yedek);
            expect(ozet.gelmeyecek).toBe(0);
        });

        it('slot darsa bugün ÖNCE sığar; yedek kalan yere (rezerv bırakılarak) KRONOLOJİK girer', async () => {
            // Muhafız dışı 25 bekleyen: muhafıza 64 − 25 − 4 = 35 slot.
            const diger = 25;
            const slot = 64 - diger - 4;
            const matris = matrisKur();
            await iosAksam(matris, diger);

            const kurulan = planlananlar().map((p) => String(p.identifier)).filter((k) => k.startsWith('muhafiz_'));
            const yedekKurulan = kurulan.filter((k) => k.startsWith('muhafiz_2026-10-14_vakit_imsak_'));

            // Defter: aynı 25 muhafız dışı bildirimle (uzak tarihli cuma gibi) yeniden sığdırılır.
            const disi = Array.from({ length: diger }, () => ({ kaynak: 'cuma' as const, zamanMs: aksam.getTime() + 1e10, tur: 'bildirim' as const }));
            const ham = bildirimDefteriOlustur(temelGirdi('ios', { simdi: aksam, muhafiz: { aktif: true, matris } }));
            const defter = iosYedekleriSigdir([...ham, ...disi].sort((x, y) => x.zamanMs - y.zamanMs));
            const ozet = defterOzeti(defter, 'ios');

            const bugun = ham.filter((k) => !k.yedek).length;
            expect(bugun).toBeLessThan(slot - 8); // senaryo: bugün sığar, yedeğe yer kalır
            expect(yedekKurulan.length).toBeGreaterThan(0);
            // Kırpıldı: yarının imsağının tamamı sığmadı.
            expect(yedekKurulan.length).toBeLessThan(ham.filter((k) => k.yedek).length);
            expect(yedekKurulan.length).toBe(ozet.yedek);
            expect(yedekKurulan.length).toBe(slot - bugun - 8);
            expect(kurulan.length).toBe(bugun + ozet.yedek);
            // Sığmayan yedek aşım DEĞİLDİR.
            expect(ozet.gelmeyecek).toBe(0);
            // KRONOLOJİK: kurulan yedekler yarının imsağının İLK tetikleridir.
            const yedekZamanlari = defter.filter((k) => k.yedek).map((k) => k.zamanMs);
            const kurulanZamanlar = planlananlar()
                .filter((p) => String(p.identifier).startsWith('muhafiz_2026-10-14_vakit_imsak_'))
                .map((p) => (p.trigger as { date: Date }).date.getTime());
            expect(kurulanZamanlar).toEqual(yedekZamanlari);
        });
    });

    it('Android GERÇEK ALARM (issue #74): alarm + bildirim + anons ayrı ayrı birebir', async () => {
        // Köprü varmış gibi: alarm kurulur → o tetiğin bildirimi ve anonsu KURULMAZ.
        const nativeAlarm = { planla: jest.fn().mockResolvedValue(true), onekliIptalEt: jest.fn().mockResolvedValue(0), kanallariTemizle: jest.fn().mockResolvedValue(undefined) };
        (NativeModules as Record<string, unknown>).MuhafizAlarm = nativeAlarm;
        try {
            const alarmli = matrisKur();
            for (const v of Object.keys(alarmli) as (keyof MuhafizMatrisi)[]) {
                // Yoğun fikstürün sesli 3. adımı (15 dk, her 3 dk) alarm da çalsın.
                alarmli[v].seviyeler[2].kanallar = { ...alarmli[v].seviyeler[2].kanallar, alarm: true };
            }
            muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
            await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris: alarmli });

            const g = temelGirdi('android', { muhafiz: { aktif: true, matris: alarmli } });
            expect(say(g, 'alarm')).toBeGreaterThan(0);
            expect(nativeAlarm.planla).toHaveBeenCalledTimes(say(g, 'alarm'));
            expect(onekliSay('muhafiz_')).toBe(say(g, 'muhafiz'));
            expect(mockPlanlaAnons).toHaveBeenCalledTimes(say(g, 'anons'));
        } finally {
            delete (NativeModules as Record<string, unknown>).MuhafizAlarm;
        }
    });

    it('iOS: bildirim sayısı birebir (slot bolken)', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        muhafizTeslimcisiniAyarla(new IosMuhafizTeslimcisi());
        const hafif: MuhafizMatrisi = matrisKur(() => ({
            seviyeler: [
                { kademe: 'nazik', esikDk: 30, siklik: { herDk: 15 }, kanallar: { bildirim: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                { kademe: 'sert', esikDk: 5, siklik: 'birkez', kanallar: { bildirim: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
            ],
        }));
        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris: hafif });

        const g = temelGirdi('ios', { muhafiz: { aktif: true, matris: hafif } });
        expect(onekliSay('muhafiz_')).toBe(say(g, 'muhafiz'));
        expect(say(g, 'anons')).toBe(0); // iOS'ta anons bildirimin sesidir, ayrı alarm değil
    });

    it('iOS GERÇEK ALARM (AlarmKit, issue #74): alarm ayrı sayılır, 64 sınırına GİRMEZ', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        const alarmKit = require('../../../../modules/expo-muhafiz-alarmkit/src') as {
            alarmKitDurumu: jest.Mock;
            alarmKitPlanla: jest.Mock;
        };
        alarmKit.alarmKitDurumu.mockResolvedValue('izinli');
        alarmKit.alarmKitPlanla.mockResolvedValue(true);
        try {
            // Slot bol (64 sınırı burada ölçülmüyor): hafif matris, ilk adım alarmlı.
            const alarmli: MuhafizMatrisi = matrisKur(() => ({
                seviyeler: [
                    { kademe: 'nazik', esikDk: 30, siklik: { herDk: 15 }, kanallar: { bildirim: true, alarm: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                    { kademe: 'sert', esikDk: 5, siklik: 'birkez', kanallar: { bildirim: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                ],
            }));
            muhafizTeslimcisiniAyarla(new IosMuhafizTeslimcisi());
            await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris: alarmli });

            const g = temelGirdi('ios', { muhafiz: { aktif: true, matris: alarmli }, iosAlarmKit: true });
            expect(say(g, 'alarm')).toBeGreaterThan(0);
            expect(alarmKit.alarmKitPlanla).toHaveBeenCalledTimes(say(g, 'alarm'));
            expect(onekliSay('muhafiz_')).toBe(say(g, 'muhafiz'));
            // iOS sayımı yalnız bildirimdir: alarmlar özette yer tutmaz. Yarının imsağı
            // (bütçe artığı) toplamda değil `yedek`te durur.
            const kayitlar = bildirimDefteriOlustur(g);
            const ozet = defterOzeti(kayitlar, 'ios');
            expect(ozet.toplam + ozet.yedek).toBe(say(g, 'muhafiz'));
            // AlarmKit yokken aynı tetikler bildirim olarak sayılır (bugünkü davranış).
            const alarmsiz = temelGirdi('ios', { muhafiz: { aktif: true, matris: alarmli } });
            expect(say(alarmsiz, 'alarm')).toBe(0);
            expect(say(alarmsiz, 'muhafiz')).toBe(say(g, 'muhafiz') + say(g, 'alarm'));
        } finally {
            alarmKit.alarmKitDurumu.mockResolvedValue('desteklenmiyor');
            alarmKit.alarmKitPlanla.mockResolvedValue(false);
        }
    });

    it.each(['reddedildi', 'belirsiz', 'desteklenmiyor'] as const)(
        'iOS AlarmKit %s → alarm tetiği BİLDİRİM olur ve 64 sayımına GİRER (defter girdisi servisle aynı durumdan)',
        async (durum) => {
            jest.replaceProperty(Platform, 'OS', 'ios');
            const alarmKit = require('../../../../modules/expo-muhafiz-alarmkit/src') as {
                alarmKitDurumu: jest.Mock;
                alarmKitPlanla: jest.Mock;
            };
            alarmKit.alarmKitDurumu.mockResolvedValue(durum);
            // Köprü kurmaya razı olsa bile izin yokken teslimci alarm DENEMEMELİ.
            alarmKit.alarmKitPlanla.mockResolvedValue(true);
            try {
                const alarmli: MuhafizMatrisi = matrisKur(() => ({
                    seviyeler: [
                        { kademe: 'nazik', esikDk: 30, siklik: { herDk: 15 }, kanallar: { bildirim: true, alarm: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                        { kademe: 'sert', esikDk: 5, siklik: 'birkez', kanallar: { bildirim: true }, bildirimSesi: 'varsayilan', anonsMetni: '' },
                    ],
                }));
                muhafizTeslimcisiniAyarla(new IosMuhafizTeslimcisi());
                await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({ aktif: true, koordinatlar: ISTANBUL, matris: alarmli });

                // Defterin AlarmKit girdisi ekranın kullandığı okuyucudan (servisle aynı köprü).
                const dis = await defterDisGirdisiniOku();
                expect(dis.iosAlarmKit).toBe(false);
                const g = temelGirdi('ios', { muhafiz: { aktif: true, matris: alarmli }, iosAlarmKit: dis.iosAlarmKit });

                expect(alarmKit.alarmKitPlanla).not.toHaveBeenCalled();
                expect(say(g, 'alarm')).toBe(0);
                // Alarm adımının ilk tetiği dahil HER tetik bekleyen bildirimdir → 64'e sayılır.
                expect(onekliSay('muhafiz_')).toBe(say(g, 'muhafiz'));
                const ozet = defterOzeti(bildirimDefteriOlustur(g), 'ios');
                expect(ozet.toplam + ozet.yedek).toBe(say(g, 'muhafiz'));
                // İzinli olsaydı aynı tetikler alarm olurdu: fark tam olarak alarm adımları kadar.
                const izinli = temelGirdi('ios', { muhafiz: { aktif: true, matris: alarmli }, iosAlarmKit: true });
                expect(say(izinli, 'alarm')).toBeGreaterThan(0);
                expect(say(g, 'muhafiz')).toBe(say(izinli, 'muhafiz') + say(izinli, 'alarm'));
            } finally {
                alarmKit.alarmKitDurumu.mockResolvedValue('desteklenmiyor');
                alarmKit.alarmKitPlanla.mockResolvedValue(false);
            }
        }
    );

    it('ÖNERİ uygulanınca gerçek plan da defterin söylediği sayıya iner', async () => {
        jest.replaceProperty(Platform, 'OS', 'ios');
        muhafizTeslimcisiniAyarla(new IosMuhafizTeslimcisi());
        const g = temelGirdi('ios', { muhafiz: { aktif: true, matris } });
        const oneriler = butceOnerileriOlustur(g);
        expect(oneriler.length).toBeGreaterThan(0);

        for (const oneri of oneriler.filter((o) => o.girdi.muhafiz && o.girdi.muhafiz.matris !== matris)) {
            (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
            await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
                aktif: true,
                koordinatlar: ISTANBUL,
                matris: oneri.girdi.muhafiz!.matris,
            });
            const kurulan = onekliSay('muhafiz_');
            // Teslimci 64 − 4 slotu aşan kısmı keser; defter TALEBİ sayar.
            // Sınırın altına inen öneride ikisi birebir aynı olmalı — yarının imsağı
            // (bütçe artığı) kalan yere girdiği için ondan ayrıca sayılır.
            const yedek = defterOzeti(bildirimDefteriOlustur(oneri.girdi), 'ios').yedek;
            if (oneri.sonrakiToplam <= 60) expect(kurulan).toBe(oneri.sonrakiToplam + yedek);
            else expect(kurulan).toBeLessThanOrEqual(oneri.sonrakiToplam);
            expect(oneri.sonrakiToplam).toBe(bildirimDefteriOlustur(oneri.girdi).filter((k) => k.kaynak === 'muhafiz' && !k.yedek).length);
        }
    });
});

describe('nafile: defter = servisin kurduğu', () => {
    // Eski (#273 öncesi) kayıt biçimi: göç yolu da kapsamda kalsın.
    const nafile: NafileAyarlari = nafileAyarlariniNormalize({
        ...VARSAYILAN_NAFILE_AYARLARI,
        hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 15 } },
        teheccud: { aktif: true, hedef: 'sonUcteBir', imsaktanOnceDk: 60, uyandirma: true },
    });

    it.each([false, true])('günü gününe = %s', async (gunuGunune) => {
        const ayar = { ...nafile, gunuGununeKur: gunuGunune };
        disk.set(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI, JSON.stringify(ayar));
        await NafileHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(ISTANBUL);
        const g = temelGirdi('ios', { nafile: ayar });
        expect(say(g, 'nafile')).toBeGreaterThan(0);
        expect(onekliSay('nafile_')).toBe(say(g, 'nafile'));
    });

    // Issue #273: sesli + tekrarlı adım Android'de nafile alarm payını (60) aşar;
    // kesme ÜRETİCİDE olduğu için defter ile servis yine birebir aynı sayar.
    it('Android: sesli tekrarlı nafile — bildirim + anons alarmı birebir, pay içinde', async () => {
        nafileTeslimcisiniAyarla(null);
        const sesli = { kanallar: { bildirim: true, sesli: true }, siklik: { herDk: 10 } };
        const ayar = nafileAyarlariniNormalize({
            hatirlatmalar: { kusluk: { aktif: true, yon: 'girisindenItibaren', adimlar: [{ esikDk: 5, ...sesli }] } },
            teheccud: { aktif: true, yon: 'girisindenItibaren', pencere: 'yatsi', adimlar: [{ esikDk: 5, ...sesli }] },
        });
        disk.set(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI, JSON.stringify(ayar));
        await NafileHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(ISTANBUL);
        nafileTeslimcisiniAyarla(null);

        const g = temelGirdi('android', { nafile: ayar });
        expect(onekliSay('nafile_')).toBe(say(g, 'nafile'));
        expect(mockPlanlaAnons).toHaveBeenCalledTimes(say(g, 'anons'));
        expect(say(g, 'nafile') + say(g, 'anons')).toBeLessThanOrEqual(ANDROID_NAFILE_PAYI);
        expect(say(g, 'nafile') + say(g, 'anons')).toBeGreaterThan(ANDROID_NAFILE_PAYI - 2);
    });

    it('günü gününe kurmak sayıyı GERÇEKTEN düşürür', () => {
        const uc = say(temelGirdi('ios', { nafile }), 'nafile');
        const bir = say(temelGirdi('ios', { nafile: { ...nafile, gunuGununeKur: true } }), 'nafile');
        expect(bir).toBeLessThan(uc);
    });
});

describe('cuma, vakit bildirimi, gün sonu: defter = servisin kurduğu', () => {
    it('cuma (tekrarlı)', async () => {
        const cuma = { aktif: true, oncedenDk: 60, siklik: { herDk: 15 } };
        disk.set(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, JSON.stringify(cuma));
        await CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(ISTANBUL);
        const g = temelGirdi('ios', { cuma });
        expect(say(g, 'cuma')).toBeGreaterThan(4);
        expect(onekliSay('cuma_hatirlatma_')).toBe(say(g, 'cuma'));
    });

    it.each(['ios', 'android'] as const)('camide kılacağım (%s ufku, cuma öğlesi çakışması)', async (platform) => {
        jest.replaceProperty(Platform, 'OS', platform);
        const cuma = { aktif: true, oncedenDk: 60, siklik: 'birkez' as const };
        const camiyeGit = {
            aktif: true,
            vakitler: { imsak: true, ogle: true, ikindi: false, aksam: true, yatsi: true },
            yurumeDk: 12,
            hazirlikDk: 5,
            yurumeKaynagi: 'elle' as const,
        };
        disk.set(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI, JSON.stringify(cuma));
        disk.set(DEPOLAMA_ANAHTARLARI.CAMIYE_GIT_AYARLARI, JSON.stringify(camiyeGit));
        await CamiyeGitHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(ISTANBUL);
        const g = temelGirdi(platform, { cuma, camiyeGit });
        expect(say(g, 'camiyeGit')).toBeGreaterThan(0);
        expect(onekliSay('camiye_git_')).toBe(say(g, 'camiyeGit'));
        // Android ufku (7 gün) 16 Ekim cumasını kapsar: o gün öğle KURULMAZ.
        const ids = planlananlar().map((p) => String(p.identifier));
        expect(ids).not.toContain('camiye_git_2026-10-16_ogle');
        if (platform === 'android') expect(ids).toContain('camiye_git_2026-10-16_aksam');
    });

    it('vakit girdi bildirimleri (bugün + yarın)', async () => {
        const ayar = { imsak: true, ogle: true, ikindi: false, aksam: true, yatsi: true };
        disk.set(DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI, JSON.stringify(ayar));
        NamazVaktiHesaplayiciServisi.getInstance().yapilandir({
            latitude: ISTANBUL.lat,
            longitude: ISTANBUL.lng,
        } as never);
        await VakitBildirimYoneticiServisi.getInstance().bildirimleriGuncelle();
        const g = temelGirdi('ios', { vakitBildirimi: ayar });
        expect(say(g, 'vakitBildirimi')).toBeGreaterThan(0);
        expect(onekliSay('vakit_bildirim_')).toBe(say(g, 'vakitBildirimi'));
    });

    it.each(['ios', 'android'] as const)('gün sonu (%s ufku)', async (platform) => {
        jest.replaceProperty(Platform, 'OS', platform);
        const ayar = {
            gunSonuBildirimAktif: true,
            gunSonuBildirimModu: 'otomatik' as const,
            bildirimImsakOncesiDk: 30,
            bildirimSaati: 4,
            bildirimDakikasi: 0,
        };
        await gunSonuHatirlatmalariniGuncelle(ISTANBUL, ayar, new Date(SABAH));
        const g = temelGirdi(platform, { gunSonu: ayar });
        expect(onekliSay('gun_sonu_hatirlatici_')).toBe(say(g, 'gunSonu'));
    });
});

describe('yatış hatırlatması + gün sonu muhasebesi (issue #290): defter = servisin kurduğu', () => {
    it.each(['ios', 'android'] as const)('%s ufku', async (platform) => {
        jest.replaceProperty(Platform, 'OS', platform);
        const ayar = { ...YATIS_VARSAYILAN_AYARLARI, aktif: true };
        await YatisHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(ISTANBUL, ayar, new Date(SABAH));
        const kurulan = planlananlar().filter((p) => yatisKimligiMi(String(p.identifier))).length;
        const g = temelGirdi(platform, { yatis: ayar });
        expect(say(g, 'yatis')).toBe(platform === 'ios' ? 3 : 7);
        expect(kurulan).toBe(say(g, 'yatis'));
    });
});

describe('takvim çakışması (issue #291): defter = servisin kurduğu', () => {
    // Her gün ikindinin sonunu yutan bir toplantı (ikindi + 60 dk → akşam + 10 dk).
    const toplantilar = () =>
        Array.from({ length: 8 }, (_, i) => {
            const gun = new Date(SABAH.getFullYear(), SABAH.getMonth(), SABAH.getDate() + i);
            const pt = new PrayerTimes(new Coordinates(ISTANBUL.lat, ISTANBUL.lng), gun, CalculationMethod.Turkey());
            return {
                startDate: new Date(pt.asr.getTime() + 60 * 60_000).toISOString(),
                endDate: new Date(pt.maghrib.getTime() + 10 * 60_000).toISOString(),
                allDay: false,
                availability: 'busy',
                status: 'confirmed',
                title: 'Toplantı',
                notes: '',
            };
        });

    it.each(['ios', 'android'] as const)('%s ufku (okuyucu dahil)', async (platform) => {
        jest.replaceProperty(Platform, 'OS', platform);
        mockTakvimEtkinlikleri.mockResolvedValue(toplantilar());
        disk.set(
            DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI,
            JSON.stringify({ aktif: true, oncedenDk: 30, baslikGoster: false, rizaZamani: '2026-10-01T00:00:00.000Z' })
        );
        await TakvimCakismaServisi.getInstance().hatirlatmalariGuncelle(ISTANBUL);
        const kurulan = planlananlar().filter((p) => takvimCakismaKimligiMi(String(p.identifier))).length;
        const dis = await defterDisGirdisiniOku();
        const g = temelGirdi(platform, { takvimCakisma: dis.takvimCakisma });
        expect(say(g, 'takvimCakisma')).toBe(platform === 'ios' ? 3 : 7);
        expect(kurulan).toBe(say(g, 'takvimCakisma'));
    });

    it('özellik kapalıyken defter takvimi OKUMAZ', async () => {
        mockTakvimEtkinlikleri.mockClear();
        const dis = await defterDisGirdisiniOku();
        expect(dis.takvimCakisma).toBeNull();
        expect(mockTakvimEtkinlikleri).not.toHaveBeenCalled();
    });
});

describe('vakit sayacı (Android notifee): defter = servisin kurduğu', () => {
    it('muhafız kapalıyken her uygun vakit için başlangıç + temizleme', async () => {
        const matris = matrisKur();
        const sayac = { aktif: true, sayacBaslangicSeviyesi: 1 };
        await VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
            aktif: true,
            koordinatlar: ISTANBUL,
            baslangicEsikleri: sayacBaslangicEsikleriHesapla(1, matris),
            muhafizAktif: false,
            muhafizUyarilanVakitler: muhafizUyarilanVakitleriBul(matris),
        });
        const g = temelGirdi('android', { muhafiz: { aktif: false, matris }, vakitSayaci: sayac });
        expect(say(g, 'sayac')).toBeGreaterThan(0);
        expect((notifee.createTriggerNotification as jest.Mock).mock.calls.length).toBe(say(g, 'sayac'));
    });
});
