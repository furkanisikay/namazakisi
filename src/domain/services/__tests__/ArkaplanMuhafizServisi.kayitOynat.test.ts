/**
 * NOBETCI — ANDROID PLANI KAYIT-OYNAT (snapshot).
 *
 * iOS portu icin teslim kodu `ArkaplanMuhafizServisi`'nden `MuhafizTeslimcisi`
 * arkasina tasiniyor. Tasima MANTIK DEGISIKLIGI ICERMEMELI; bunu "testler hala
 * geciyor"dan daha guclu bir sekilde kanitlamak icin servisin cihaza gonderdigi
 * HER CAGRININ ARGUMANLARI donduruluyor.
 *
 * Snapshot dosyasi refactor'dan ONCE uretildi. Refactor sonrasi bir bayt bile
 * degisirse bu test kirmizi yanar — "Android davranisi birebir korundu" iddiasi
 * boyle olculur, gozle degil.
 *
 * ZAMAN NORMALIZASYONU: adhan mock'u vakitleri `new Date()` uzerine kurar, yani
 * mutlak zaman damgalari her kosuda farklidir. Snapshot'a damga degil, VAKIT
 * CIKISINA KALAN DAKIKA yazilir — plani belirleyen sey zaten budur.
 *
 * Kapsanan yuzey:
 *   - `Notifications.scheduleNotificationAsync` (id, baslik, govde, ses,
 *     titresim, oncelik, kategori, data, kanal id, tetik dakikasi)
 *   - `planlaAnons` (id, dakika, COZULMUS metin)
 *   - `MuhafizKanalServisi.hazirla` (matris) + cagri SIRASI (kanal hazirligi
 *     planlamadan ONCE olmali; degilse Android 8+ bildirimi hic gostermez)
 */
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: {
        MAX: 'max',
        HIGH: 'high',
    },
    SchedulableTriggerInputTypes: {
        DATE: 'date',
    },
}));

jest.mock('../BildirimServisi', () => ({
    MUHAFIZ_KATEGORISI: 'muhafiz_category',
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
}));

const mockPlanlaAnons = jest.fn();
const mockIptalEtAnons = jest.fn();
const mockIptalEtTumAnonslar = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: (...args: unknown[]) => mockIptalEtAnons(...args),
    iptalEtTumAnonslar: (...args: unknown[]) => mockIptalEtTumAnonslar(...args),
    trDestekleniyorMu: jest.fn().mockResolvedValue(true),
    muhafizKanaliniGarantile: jest.fn(),
    muhafizKanallariniTemizle: jest.fn(),
}));

const mockKanallariHazirla = jest.fn();
jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: (...args: unknown[]) => mockKanallariHazirla(...args),
    },
}));

// Vakit cizelgesi: yalniz 'aksam' gelecekte (cikisa 30 dk) → tum planlama
// deterministik olarak o vakit uzerinden olur.
jest.mock('adhan', () => {
    const now = new Date();
    const cikis = new Date(now.getTime() + 30 * 60 * 1000);
    return {
        Coordinates: jest.fn(),
        CalculationMethod: { Turkey: jest.fn().mockReturnValue({}) },
        PrayerTimes: jest.fn().mockImplementation(() => ({
            fajr: new Date(now.getTime() - 4 * 60 * 60 * 1000),
            sunrise: new Date(now.getTime() - 3 * 60 * 60 * 1000),
            dhuhr: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            asr: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            maghrib: now,
            isha: cikis,
        })),
    };
});

import { ArkaplanMuhafizServisi } from '../ArkaplanMuhafizServisi';
import { PrayerTimes } from 'adhan';
import type {
    MuhafizMatrisi,
    MuhafizVakti,
    SeviyeAyari,
    UyariKanallari,
} from '../../../core/muhafiz/matrisTipleri';
import {
    MUHAFIZ_VAKITLERI,
    SEVIYE_KADEMELERI,
    VARSAYILAN_SES,
} from '../../../core/muhafiz/matrisTipleri';
import { bugunuAl, dunuAl, gunEkle } from '../../../core/utils/TarihYardimcisi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

/**
 * Snapshot'tan TARIHI COZ.
 *
 * Bildirim id'leri ve `data.tarih` bugunun tarihini tasir; ham haliyle
 * dondurulursa snapshot YARIN kirilir (AGENTS.md: "Testlerde sabit tarih
 * yazma"). Tarih plani belirleyen bir degisken degil, yalnizca bir etiket →
 * yer tutucuya cevrilir.
 */
function tarihiNormalize<T>(deger: T): T {
    const bugun = bugunuAl();
    const dun = dunuAl();
    const cevir = (metin: string): string =>
        metin.split(bugun).join('<BUGUN>').split(dun).join('<DUN>');

    if (typeof deger === 'string') return cevir(deger) as unknown as T;
    if (Array.isArray(deger)) return deger.map((e) => tarihiNormalize(e)) as unknown as T;
    if (deger && typeof deger === 'object') {
        const cikti: Record<string, unknown> = {};
        for (const [anahtar, alt] of Object.entries(deger as Record<string, unknown>)) {
            cikti[anahtar] = tarihiNormalize(alt);
        }
        return cikti as unknown as T;
    }
    return deger;
}


// TESLIMCIYI ACIKCA ANDROID YAP.
//
// Bu repoda jest'in VARSAYILAN `Platform.OS` degeri **'ios'**
// (`preset: "react-native"` → `haste.defaultPlatform: 'ios'`). Teslimci secimi
// platformdan turetildigi icin, acikca soylenmezse bu suite SESSIZCE iOS
// teslimcisine duser ve Android davranis sozlesmesini olcmeyi birakir —
// YESIL KALARAK. `MuhafizTeslimcisi` bu yuzden enjekte edilebilir.
import { muhafizTeslimcisiniAyarla } from '../MuhafizTeslimcisi';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';

beforeEach(() => {
    muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
});

afterAll(() => {
    // Modul duzeyi durumu diger suite'lere sizdirma.
    muhafizTeslimcisiniAyarla(null);
});

/** Mock'lanan adhan'dan vakit cikisini al — normalizasyonun capasi. */
function vakitCikisiniAl(): number {
    const pt = new (PrayerTimes as unknown as new () => { isha: Date })();
    return pt.isha.getTime();
}

interface SeviyeTanimi {
    esikDk: number;
    siklikDk: number;
    kanallar?: UyariKanallari;
    ses?: string;
    anons?: string;
    acilKanal?: boolean;
}

const seviyeKur = (indeks: number, t: SeviyeTanimi): SeviyeAyari => ({
    kademe: SEVIYE_KADEMELERI[indeks],
    kanallar: t.kanallar ?? { bildirim: true },
    esikDk: t.esikDk,
    siklik: { herDk: t.siklikDk },
    bildirimSesi: t.ses ?? VARSAYILAN_SES,
    anonsMetni: t.anons ?? '',
    acilKanal: t.acilKanal,
});

/**
 * FIKSTUR — teslim yuzeyinin tamamini tek plandan gecirir:
 *   seviye 1: yalniz bildirim, varsayilan ses
 *   seviye 2: bildirim + TITRESIM (kanal id'sine titresim izi girer)
 *   seviye 3: bildirim + SESLI anons (planlaAnons + cozulmus metin)
 *   seviye 4: acil kanal + OZEL ses (content:// → hash'li acil kanal)
 */
function fikstürMatrisi(): MuhafizMatrisi {
    const seviyeler: SeviyeAyari[] = [
        seviyeKur(0, { esikDk: 25, siklikDk: 10 }),
        seviyeKur(1, { esikDk: 15, siklikDk: 5, kanallar: { bildirim: true, titresim: true } }),
        seviyeKur(2, {
            esikDk: 8,
            siklikDk: 4,
            kanallar: { bildirim: true, sesli: true },
            anons: '{vakit} vakti çıkıyor, {süre} dakika {yön}.',
        }),
        seviyeKur(3, {
            esikDk: 3,
            siklikDk: 1,
            kanallar: { bildirim: true, titresim: true },
            ses: 'content://media/internal/audio/media/42',
            acilKanal: true,
        }),
    ];

    const matris = {} as MuhafizMatrisi;
    for (const vakit of MUHAFIZ_VAKITLERI as MuhafizVakti[]) {
        matris[vakit] = { seviyeler: seviyeler.map((s) => ({ ...s })) };
    }
    return matris;
}

/**
 * `data` icindeki MUTLAK zaman alanlari (Ertele, issue #289: `cikisMs`,
 * `erteleSinirMs`) da "cikisa kalan dakika"ya cevrilir — yoksa snapshot her
 * kosuda degisirdi.
 */
function veriyiNormalize(data: Record<string, unknown> | undefined, cikisMs: number) {
    if (!data) return data;
    const cikti: Record<string, unknown> = {};
    for (const [anahtar, deger] of Object.entries(data)) {
        cikti[anahtar] =
            anahtar.endsWith('Ms') && typeof deger === 'number'
                ? `${Math.round((cikisMs - deger) / 60000)} dk kala`
                : deger;
    }
    return cikti;
}

/** `scheduleNotificationAsync` cagrilarini zamandan arindirilmis hale getir. */
function bildirimKayitlari(cikisMs: number) {
    const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    return cagrilar
        .map(([girdi]) => {
            const tetik = girdi.trigger as { type: string; date: Date; channelId?: string };
            return {
                id: girdi.identifier as string,
                dkKala: Math.round((cikisMs - tetik.date.getTime()) / 60000),
                baslik: girdi.content.title as string,
                govde: girdi.content.body as string,
                ses: girdi.content.sound,
                titresim: girdi.content.vibrate ?? null,
                oncelik: girdi.content.priority,
                kategori: girdi.content.categoryIdentifier,
                data: veriyiNormalize(girdi.content.data, cikisMs),
                tetikTipi: tetik.type,
                kanalId: tetik.channelId ?? null,
            };
        })
        .sort((a, b) => b.dkKala - a.dkKala || a.id.localeCompare(b.id));
}

/** `planlaAnons` cagrilarini zamandan arindirilmis hale getir. */
function anonsKayitlari(cikisMs: number) {
    return mockPlanlaAnons.mock.calls
        .map(([id, zamanMs, metin]) => ({
            id: id as string,
            dkKala: Math.round((cikisMs - (zamanMs as number)) / 60000),
            metin: metin as string,
        }))
        .sort((a, b) => b.dkKala - a.dkKala || a.id.localeCompare(b.id));
}

describe('ArkaplanMuhafizServisi — ANDROID PLANI KAYIT-OYNAT', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // GOVDE RASTGELEDIR: `bildirimMesajiOlustur` mucadele havuzundan
        // `Math.random()` ile secer. Snapshot'in anlamli olmasi icin rastgelelik
        // sabitlenir → havuzun ILK maddesi secilir. Rastgeleligi snapshot'tan
        // atmak yerine sabitliyoruz ki govde metni de kapsamda kalsin.
        jest.spyOn(Math, 'random').mockReturnValue(0);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        // `hazirla` dogrulanmis matrisi doner; mock aynen geri versin ki
        // planlama ham matrisle ayni kanal id'lerini uretsin.
        mockKanallariHazirla.mockImplementation(
            (matris?: MuhafizMatrisi) => Promise.resolve(matris)
        );
    });

    test('yogun fikstur — bildirim + anons cagrilarinin TAM argumanlari', async () => {
        const servis = ArkaplanMuhafizServisi.getInstance();
        const cikisMs = vakitCikisiniAl();

        await servis.yapilandirVePlanla({
            aktif: true,
            matris: fikstürMatrisi(),
            koordinatlar: { lat: 41.0082, lng: 28.9784 },
        });

        const bildirimler = bildirimKayitlari(cikisMs);
        const anonslar = anonsKayitlari(cikisMs);

        // Plan bos kalirsa snapshot "bos" olarak donar ve nobetci anlamsizlasir.
        expect(bildirimler.length).toBeGreaterThan(0);
        expect(anonslar.length).toBeGreaterThan(0);

        expect(tarihiNormalize({ bildirimler, anonslar })).toMatchSnapshot();
    });

    test('kanal hazirligi PLANLAMADAN ONCE calisir (Android 8+ sarti)', async () => {
        const servis = ArkaplanMuhafizServisi.getInstance();

        await servis.yapilandirVePlanla({
            aktif: true,
            matris: fikstürMatrisi(),
            koordinatlar: { lat: 41.0082, lng: 28.9784 },
        });

        const hazirlaSirasi = mockKanallariHazirla.mock.invocationCallOrder[0];
        const ilkPlanlama = (Notifications.scheduleNotificationAsync as jest.Mock).mock
            .invocationCallOrder[0];

        expect(hazirlaSirasi).toBeLessThan(ilkPlanlama);
    });

    test('muhafiz KAPALIYKEN: plan yok, anons temizligi ve kanal GC yine calisir', async () => {
        const servis = ArkaplanMuhafizServisi.getInstance();

        await servis.yapilandirVePlanla({
            aktif: false,
            matris: fikstürMatrisi(),
            koordinatlar: { lat: 41.0082, lng: 28.9784 },
        });

        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        expect(mockPlanlaAnons).not.toHaveBeenCalled();
        // Oksuz kanallar bildirim ayarlarinda kalmasin diye GC matrissiz cagrilir.
        expect(mockKanallariHazirla).toHaveBeenCalledWith();
        expect(mockIptalEtTumAnonslar).toHaveBeenCalled();
    });
});

/**
 * NOBETCI — OZEL GUN (issue #272). Aralik aktifken HICBIR muhafiz bildirimi ve
 * TTS anons alarmi kurulmaz; eski plan yine temizlenir. Aralik bitince (ya da
 * mod kapaliyken) plan, ozel gun hic yokmuscasina BIREBIR ayni uretilir.
 */
describe('ArkaplanMuhafizServisi — OZEL GUN KAPISI (kayit-oynat)', () => {
    const getItem = AsyncStorage.getItem as jest.Mock;

    function ozelGunDiskte(ayarlar: unknown) {
        getItem.mockImplementation((anahtar: string) =>
            Promise.resolve(
                anahtar === DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI ? JSON.stringify(ayarlar) : null
            )
        );
    }

    async function planiKaydet() {
        jest.clearAllMocks();
        const cikisMs = vakitCikisiniAl();
        await ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
            aktif: true,
            matris: fikstürMatrisi(),
            koordinatlar: { lat: 41.0082, lng: 28.9784 },
        });
        return { bildirimler: bildirimKayitlari(cikisMs), anonslar: anonsKayitlari(cikisMs) };
    }

    beforeEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        mockKanallariHazirla.mockImplementation(
            (matris?: MuhafizMatrisi) => Promise.resolve(matris)
        );
    });

    afterEach(() => {
        // clearAllMocks implementasyonu SILMEZ — sonraki suite'lere sizmasin.
        getItem.mockReset();
        getItem.mockResolvedValue(null);
    });

    const aralik = (bas: number, bit: number) => ({
        id: 'x',
        baslangicTarihi: gunEkle(bugunuAl(), bas),
        bitisTarihi: gunEkle(bugunuAl(), bit),
        olusturulmaTarihi: new Date().toISOString(),
    });

    test('aralik BUGUNU kapsiyorsa: bildirim YOK, anons alarmi YOK, eski plan temizlenir', async () => {
        ozelGunDiskte({ ozelGunModuAktif: true, aktifOzelGun: aralik(-2, 3), gecmisKayitlar: [] });

        const { bildirimler, anonslar } = await planiKaydet();

        expect(bildirimler).toEqual([]);
        expect(anonslar).toEqual([]);
        expect(mockIptalEtTumAnonslar).toHaveBeenCalled();
    });

    test('aralik DUN bittiyse plan ozel gunsuz planla BIREBIR ayni (geri gelir)', async () => {
        getItem.mockResolvedValue(null);
        const taban = await planiKaydet();
        expect(taban.bildirimler.length).toBeGreaterThan(0);

        ozelGunDiskte({ ozelGunModuAktif: true, aktifOzelGun: aralik(-5, -1), gecmisKayitlar: [] });
        expect(await planiKaydet()).toEqual(taban);
    });

    test('mod KAPALIYKEN ya da yalniz GECMIS kayit bugunu kapsarken plan degismez', async () => {
        getItem.mockResolvedValue(null);
        const taban = await planiKaydet();

        ozelGunDiskte({ ozelGunModuAktif: false, aktifOzelGun: aralik(-1, 1), gecmisKayitlar: [] });
        expect(await planiKaydet()).toEqual(taban);

        // Erken bitirilen kayit gecmise ORIJINAL bitisiyle tasinir; susturmaya
        // devam etmemeli.
        ozelGunDiskte({ ozelGunModuAktif: true, aktifOzelGun: null, gecmisKayitlar: [aralik(-1, 3)] });
        expect(await planiKaydet()).toEqual(taban);
    });

    test('bozuk ozel gun kaydi muhafizi SUSTURMAZ', async () => {
        getItem.mockResolvedValue(null);
        const taban = await planiKaydet();

        getItem.mockImplementation((anahtar: string) =>
            Promise.resolve(anahtar === DEPOLAMA_ANAHTARLARI.OZEL_GUN_AYARLARI ? '{bozuk' : null)
        );
        expect(await planiKaydet()).toEqual(taban);
    });
});
