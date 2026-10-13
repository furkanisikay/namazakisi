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
import { Platform } from 'react-native';
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
import { NamazVaktiHesaplayiciServisi } from '../NamazVaktiHesaplayiciServisi';
import { bildirimDefteriOlustur, type DefterGirdisi, type DefterKaynagi } from '../../../core/bildirim/bildirimDefteri';
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
            // Sınırın altına inen öneride ikisi birebir aynı olmalı.
            if (oneri.sonrakiToplam <= 60) expect(kurulan).toBe(oneri.sonrakiToplam);
            else expect(kurulan).toBeLessThanOrEqual(oneri.sonrakiToplam);
            expect(oneri.sonrakiToplam).toBe(say(oneri.girdi, 'muhafiz'));
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
