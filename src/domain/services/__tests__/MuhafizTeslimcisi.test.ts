/**
 * TESLIMCI SECIMI + iOS TESLIMCISININ DAVRANISI.
 *
 * Olculen iki sozlesme:
 *   1. Secim platformdan turetilir AMA acikca degistirilebilir. Enjeksiyon
 *      olmasaydi, bu repoda jest'in varsayilan `Platform.OS` degeri **'ios'**
 *      oldugu icin Android davranis suite'leri sessizce iOS teslimcisine duser
 *      ve YESIL KALARAK yanlis seyi olcerdi.
 *   2. iOS teslimcisi: kanal id YAZMAZ, ses DOSYA ADIdir, kesinti seviyesi
 *      seviyeye gore secilir, 64 bekleyen siniri uygulanir ve yan kanal
 *      (TTS alarmi) HIC cagrilmaz.
 */
const mockPlatformDurumu = { OS: 'ios', uygulamaDurumu: 'active' };
jest.mock('react-native', () => ({
    Platform: {
        get OS() {
            return mockPlatformDurumu.OS;
        },
    },
    AppState: {
        get currentState() {
            return mockPlatformDurumu.uygulamaDurumu;
        },
    },
}));

const mockDepolama: Record<string, unknown> = {};
jest.mock('../../../data/local/Depolama', () => ({
    Depolama: {
        oku: jest.fn(async (anahtar: string) => mockDepolama[anahtar] ?? null),
        yaz: jest.fn(async (anahtar: string, deger: unknown) => {
            mockDepolama[anahtar] = deger;
        }),
        guncelle: jest.fn(async (anahtar: string, donustur: (m: unknown) => unknown) => {
            mockDepolama[anahtar] = donustur(mockDepolama[anahtar] ?? null);
            return mockDepolama[anahtar];
        }),
    },
}));

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mockPlanlaAnons = jest.fn();
const mockIptalEtAnons = jest.fn();
const mockIptalEtTumAnonslar = jest.fn();
const mockIptalEtOnekliAnonslar = jest.fn(() => true);
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: (...args: unknown[]) => mockIptalEtAnons(...args),
    iptalEtTumAnonslar: (...args: unknown[]) => mockIptalEtTumAnonslar(...args),
    iptalEtOnekliAnonslar: (...args: unknown[]) => (mockIptalEtOnekliAnonslar as jest.Mock)(...args),
}));

const mockKanallariHazirla = jest.fn();
jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: (...args: unknown[]) => mockKanallariHazirla(...args),
        nafileSesleriniDogrula: async (a: unknown) => a,
    },
}));

import * as Notifications from 'expo-notifications';
import {
    muhafizTeslimcisiniAl,
    muhafizTeslimcisiniAyarla,
    type UyariTeslimi,
} from '../MuhafizTeslimcisi';
import { IosMuhafizTeslimcisi, ucustakiKlipleriSifirla } from '../IosMuhafizTeslimcisi';
import { AndroidMuhafizTeslimcisi, ANDROID_MUHAFIZ_ALARM_BUTCESI } from '../AndroidMuhafizTeslimcisi';
import type { UyariPlani } from '../../../core/muhafiz/motorAdaptoru';
import { IOS_BILDIRIM_SESI } from '../../../core/muhafiz/ios/teslimPlani';
import * as anonsKoprusu from '../../../../modules/expo-muhafiz-anons/src';
import { ANONS_KLIP_ONEKI, anonsKlipAdi } from '../../../core/muhafiz/ios/anonsKlibi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';
import { gunAnahtari } from '../../../core/muhafiz/ios/klipKullanimi';

const kopru = anonsKoprusu as unknown as {
    trSesTanimlayici: jest.Mock;
    klipVarMi: jest.Mock;
    klipSentezle: jest.Mock;
    kullanilmayanKlipleriSil: jest.Mock;
};
const TR_SES = 'com.apple.voice.compact.tr-TR.Yelda';
const BOS_MATRIS = {} as never;

function teslimKur(kismi: Partial<UyariPlani> = {}, zamanMs?: number): UyariTeslimi {
    const uyari = {
        seviye: 1,
        kalanDk: 10,
        olcuDk: 10,
        kanallar: { bildirim: true },
        bildirimSesi: 'varsayilan',
        sesliAnons: false,
        anonsMetni: '',
        ...kismi,
    } as UyariPlani;

    return {
        id: `muhafiz_2026-01-01_vakit_aksam_seviye_${uyari.seviye}_dk_${uyari.kalanDk}`,
        baslik: 'baslik',
        mesaj: 'mesaj',
        zaman: new Date(zamanMs ?? Date.now() + 10 * 60 * 1000),
        uyari,
        vakit: 'aksam',
        muhafizVakti: 'aksam',
        tarih: '2026-01-01',
        yon: 'cikisaDogru',
    };
}

describe('Teslimci secimi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        muhafizTeslimcisiniAyarla(null);
    });

    afterAll(() => muhafizTeslimcisiniAyarla(null));

    test('iOS platformunda iOS teslimcisi secilir', () => {
        mockPlatformDurumu.OS = 'ios';
        expect(muhafizTeslimcisiniAl().ad).toBe('ios');
    });

    test('Android platformunda Android teslimcisi secilir', () => {
        mockPlatformDurumu.OS = 'android';
        expect(muhafizTeslimcisiniAl().ad).toBe('android');
    });

    test('secim hatirlanir (her cagride yeniden kurulmaz)', () => {
        mockPlatformDurumu.OS = 'ios';
        expect(muhafizTeslimcisiniAl()).toBe(muhafizTeslimcisiniAl());
    });

    test('NOBETCI: acikca ayarlanan teslimci platformu EZER', () => {
        mockPlatformDurumu.OS = 'ios';
        muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
        expect(muhafizTeslimcisiniAl().ad).toBe('android');
    });

    test('null ile sifirlanir → platformdan yeniden turetilir', () => {
        mockPlatformDurumu.OS = 'ios';
        muhafizTeslimcisiniAyarla(new AndroidMuhafizTeslimcisi());
        muhafizTeslimcisiniAyarla(null);
        expect(muhafizTeslimcisiniAl().ad).toBe('ios');
    });
});

describe('IosMuhafizTeslimcisi', () => {
    let teslimci: IosMuhafizTeslimcisi;

    beforeEach(async () => {
        jest.clearAllMocks();
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        teslimci = new IosMuhafizTeslimcisi();
        await teslimci.hazirla();
    });

    test('kanal OLUSTURMAZ ve matrisi aynen dondurur', async () => {
        const matris = { yatsi: { seviyeler: [] } } as never;
        await expect(teslimci.hazirla(matris)).resolves.toBe(matris);
        expect(mockKanallariHazirla).not.toHaveBeenCalled();
    });

    test('bildirim: channelId YAZMAZ, ses DOSYA ADIdir', async () => {
        await teslimci.uyariPlanla(teslimKur());

        const [girdi] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
        expect(girdi.trigger.channelId).toBeUndefined();
        expect(girdi.content.sound).toBe(IOS_BILDIRIM_SESI);
    });

    test('kesinti seviyesi seviyeye gore secilir', async () => {
        await teslimci.uyariPlanla(teslimKur({ seviye: 1 }));
        await teslimci.uyariPlanla(teslimKur({ seviye: 3 }));

        const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        expect(cagrilar[0][0].content.interruptionLevel).toBe('active');
        expect(cagrilar[1][0].content.interruptionLevel).toBe('timeSensitive');
    });

    test("Android'in content:// sesi paket sesine duser", async () => {
        await teslimci.uyariPlanla(
            teslimKur({ bildirimSesi: 'content://media/internal/audio/media/42' })
        );
        const [girdi] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
        expect(girdi.content.sound).toBe(IOS_BILDIRIM_SESI);
    });

    test('NOBETCI: sesli adimda bile TTS koprusu HIC cagrilmaz', async () => {
        await teslimci.uyariPlanla(
            teslimKur({
                seviye: 3,
                kanallar: { bildirim: true, sesli: true },
                sesliAnons: true,
                anonsMetni: 'Akşam vakti çıkıyor.',
            })
        );
        expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    test('yan kanal iptalleri Android TTS koprusune dokunmaz (iOS yan kanali yalniz AlarmKit)', () => {
        teslimci.yanKanaliIptalEt('muhafiz_2026-10-13_vakit_ogle_seviye_1_dk_30');
        teslimci.tumYanKanallariIptalEt();
        expect(mockIptalEtAnons).not.toHaveBeenCalled();
        expect(mockIptalEtTumAnonslar).not.toHaveBeenCalled();
    });

    test('gecmis zamanli uyari planlanmaz', async () => {
        await teslimci.uyariPlanla(teslimKur({}, Date.now() - 60_000));
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    test('64 SINIRI: slot tukenince fazlasi planlanmaz', async () => {
        // Muhafiz disi 56 bekleyen → slot = 64 - 56 - 4 = 4
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
            Array.from({ length: 56 }, (_, i) => ({ identifier: `vakit_${i}` }))
        );
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();

        for (let i = 0; i < 10; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
    });

    test('butce olcumu MUHAFIZ bildirimlerini saymaz (kendi yerimizi isgal etmeyiz)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            ...Array.from({ length: 50 }, (_, i) => ({ identifier: `muhafiz_2026-01-01_vakit_ogle_seviye_1_dk_${i}` })),
            { identifier: 'vakit_1' },
        ]);
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();

        // Muhafiz disi yalniz 1 → slot 59; 10 uyarinin hepsi sigmali.
        for (let i = 0; i < 10; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(10);
    });

    test('ayni `muhafiz_` uzayindaki ERTELEME ve YATIS bildirimleri muhafiz disi sayilir (#289/#290)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            ...Array.from({ length: 28 }, (_, i) => ({ identifier: `muhafiz_2026-01-0${(i % 9) + 1}_vakit_yatsi_yatis` })),
            ...Array.from({ length: 28 }, (_, i) => ({ identifier: `muhafiz_2026-01-0${(i % 9) + 1}_vakit_ogle_ertele` })),
        ]);
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();
        // 56 muhafiz disi → slot 4 (64 − 56 − 4 guvenlik payi).
        for (let i = 0; i < 10; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
    });

    test('butce OLCULEMEZSE kisitlama uygulanmaz (plani biz kesmeyiz)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(
            new Error('okunamadi')
        );
        const yeni = new IosMuhafizTeslimcisi();
        await yeni.hazirla();

        for (let i = 0; i < 80; i++) {
            await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
        }
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(80);
    });

    describe('BUTCE ARTIGI — yarinin imsagi (iOS)', () => {
        const yedek = (i: number): UyariTeslimi => ({
            ...teslimKur({ kalanDk: i + 1 }),
            id: `muhafiz_2026-01-02_vakit_imsak_seviye_1_dk_${i + 1}`,
            butceArtigi: true,
        });

        test('bugunun planindan SONRA kalan slota girer, rezerv (8) bos kalir', async () => {
            // Muhafiz disi 20 → slot 40; bugun 25 → yedege 40 − 25 − 8 = 7
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
                Array.from({ length: 20 }, (_, i) => ({ identifier: `vakit_${i}` }))
            );
            const yeni = new IosMuhafizTeslimcisi();
            await yeni.hazirla();
            for (let i = 0; i < 25; i++) await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
            for (let i = 0; i < 20; i++) await yeni.uyariPlanla(yedek(i));

            const kurulan = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0].identifier);
            expect(kurulan.length).toBe(25 + 7);
            // KRONOLOJIK: yedegin ILK tetikleri tutulur.
            expect(kurulan.filter((k: string) => k.includes('imsak'))).toEqual(
                Array.from({ length: 7 }, (_, i) => yedek(i).id)
            );
        });

        test('bugun slotu tuketiyorsa yedek HIC kurulmaz (bugun onceliklidir)', async () => {
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
                Array.from({ length: 56 }, (_, i) => ({ identifier: `vakit_${i}` }))
            );
            const yeni = new IosMuhafizTeslimcisi();
            await yeni.hazirla();
            for (let i = 0; i < 4; i++) await yeni.uyariPlanla(teslimKur({ kalanDk: i + 1 }));
            for (let i = 0; i < 5; i++) await yeni.uyariPlanla(yedek(i));
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4);
        });

        test('butce OLCULEMEZSE yedek kurulmaz (kor doldurma bugunu sistemin kesmesine iterdi)', async () => {
            (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(new Error('okunamadi'));
            const yeni = new IosMuhafizTeslimcisi();
            await yeni.hazirla();
            await yeni.uyariPlanla(teslimKur());
            await yeni.uyariPlanla(yedek(0));
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        });
    });
});


/**
 * FAZ 2 — iOS SESLI ANONS: metin planlamada cihazda ses dosyasina cevrilir ve
 * bildirimin SESI olur. Olculen sozlesmeler:
 *   - klip varsa bildirim onu calar; yoksa ON PLANDA sentezlenir, ARKA PLANDA
 *     paket sesine dusulur (arka plan gorevinin sure butcesi)
 *   - metin `olcuDk` ile cozulur (kalanDk degil)
 *   - Turkce ses yoksa kopruye hic gidilmez
 *   - ayni klip icin diske bir kez gidilir
 *   - tur sonu GC yasa dayalidir ve yalniz kendi onekimize dokunur
 */
describe('IosMuhafizTeslimcisi — anons klibi (Faz 2)', () => {
    const sesliTeslim = (kismi: Partial<UyariPlani> = {}) =>
        teslimKur({
            seviye: 3,
            kanallar: { bildirim: true, sesli: true },
            sesliAnons: true,
            anonsMetni: '{vakit} vakti çıkıyor, son {süre} dakika.',
            ...kismi,
        });

    beforeEach(() => {
        jest.clearAllMocks();
        ucustakiKlipleriSifirla();
        mockPlatformDurumu.uygulamaDurumu = 'active';
        for (const k of Object.keys(mockDepolama)) delete mockDepolama[k];
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        kopru.trSesTanimlayici.mockResolvedValue(TR_SES);
        kopru.klipVarMi.mockResolvedValue(false);
        kopru.klipSentezle.mockResolvedValue(true);
        kopru.kullanilmayanKlipleriSil.mockResolvedValue(0);
    });

    const planlananSes = () =>
        (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].content.sound;

    test('klip VARSA bildirim klibi calar, sentez yapilmaz', async () => {
        kopru.klipVarMi.mockResolvedValue(true);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());

        const beklenen = anonsKlipAdi({
            cozulmusMetin: 'Akşam vakti çıkıyor, son 10 dakika.',
            sesTanimlayici: TR_SES,
        });
        expect(planlananSes()).toBe(beklenen);
        expect(kopru.klipSentezle).not.toHaveBeenCalled();
    });

    // Issue #273: nafile teslimcisi aynı klip dizinini paylaşır. Turunu henüz
    // bitirmemiş örneğin sentezlediği klip, ötekinin GC'sinde SİLİNMEZ.
    test('PAYLAŞIMLI GC: başka örneğin UÇUŞTAKİ klibi korunur, tur bitince kayda geçer', async () => {
        const nafile = new IosMuhafizTeslimcisi({ kendiOneki: 'nafile_', matrissizAnons: true });
        await nafile.hazirla();
        await nafile.uyariPlanla(sesliTeslim());
        const klip = kopru.klipSentezle.mock.calls[0][1];

        const muhafiz = new IosMuhafizTeslimcisi();
        await muhafiz.hazirla(BOS_MATRIS);
        await muhafiz.tamamla();
        expect(kopru.kullanilmayanKlipleriSil.mock.calls[0][0]).toContain(klip);

        await nafile.tamamla();
        expect(Object.keys(mockDepolama[DEPOLAMA_ANAHTARLARI.IOS_ANONS_KLIP_KULLANIMI] as object)).toContain(klip);
    });

    test('klip YOK + ON PLAN → sentezlenir ve kullanilir', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());

        expect(kopru.klipSentezle).toHaveBeenCalledWith(
            'Akşam vakti çıkıyor, son 10 dakika.',
            expect.stringMatching(/^muhafiz_anons_[0-9a-f]+\.caf$/)
        );
        expect(planlananSes()).toBe(kopru.klipSentezle.mock.calls[0][1]);
    });

    /** Arka plan gorevinin sure butcesi: sentez YOK, var olan klip ya da paket sesi. */
    test('klip YOK + ARKA PLAN → sentez YAPILMAZ, paket sesine duser', async () => {
        mockPlatformDurumu.uygulamaDurumu = 'background';
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());

        expect(kopru.klipSentezle).not.toHaveBeenCalled();
        expect(planlananSes()).toBe(IOS_BILDIRIM_SESI);
    });

    test('sentez BASARISIZ → paket sesi (bildirim yine gelir)', async () => {
        kopru.klipSentezle.mockResolvedValue(false);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());

        expect(planlananSes()).toBe(IOS_BILDIRIM_SESI);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    test('Turkce ses YOKSA kopruye hic gidilmez, paket sesi', async () => {
        kopru.trSesTanimlayici.mockResolvedValue(null);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());

        expect(kopru.klipVarMi).not.toHaveBeenCalled();
        expect(planlananSes()).toBe(IOS_BILDIRIM_SESI);
    });

    test('sesli OLMAYAN adimda klip aranmaz', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur());

        expect(kopru.klipVarMi).not.toHaveBeenCalled();
        expect(planlananSes()).toBe(IOS_BILDIRIM_SESI);
    });

    /**
     * Asimetrik fikstur: giris yonunde kalanDk=500, olcuDk=12. Yanlis alan
     * verilseydi anons "…500 dakika" okurdu (AGENTS.md: olcuDk ≠ kalanDk).
     */
    test('metin OLCU dakikasiyla cozulur, kalan dakikayla degil', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla({
            ...sesliTeslim({ kalanDk: 500, olcuDk: 12, anonsMetni: '{süre} dakika {yön}.' }),
            yon: 'girisindenItibaren',
        });

        expect(kopru.klipSentezle.mock.calls[0][0]).toBe('12 dakika geçti.');
    });

    test('ayni metin icin diske ve sentezlere BIR KEZ gidilir', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());
        await t.uyariPlanla({ ...sesliTeslim(), id: 'baska_id' });

        expect(kopru.klipVarMi).toHaveBeenCalledTimes(1);
        expect(kopru.klipSentezle).toHaveBeenCalledTimes(1);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    });

    test('slot DOLUYSA sentez yapilmaz (planlanmayacak uyari icin is yok)', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
            Array.from({ length: 60 }, (_, i) => ({ identifier: `vakit_${i}` }))
        );
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());

        expect(kopru.klipSentezle).not.toHaveBeenCalled();
    });

    test('tamamla: kullanilan klipler kayda islenir, GC yalniz kendi onekimizle calisir', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(sesliTeslim());
        await t.tamamla();

        const ad = kopru.klipSentezle.mock.calls[0][1];
        const kayit = mockDepolama[DEPOLAMA_ANAHTARLARI.IOS_ANONS_KLIP_KULLANIMI] as Record<string, string>;
        expect(kayit).toEqual({ [ad]: gunAnahtari(new Date()) });
        expect(kopru.kullanilmayanKlipleriSil).toHaveBeenCalledWith([ad], ANONS_KLIP_ONEKI);
    });

    /**
     * Kilinmis vaktin klipleri o turda planlanmaz; "bu turda kullanilmayani sil"
     * olsaydi silinir ve ertesi gun arka planda yeniden uretilemezdi.
     */
    test('tamamla: bu turda kullanilmayan ama YAKIN zamanda kullanilan klip KORUNUR', async () => {
        mockDepolama[DEPOLAMA_ANAHTARLARI.IOS_ANONS_KLIP_KULLANIMI] = {
            'muhafiz_anons_dun.caf': gunAnahtari(new Date(Date.now() - 24 * 60 * 60 * 1000)),
            'muhafiz_anons_eski.caf': '2000-01-01',
        };
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla();
        await t.tamamla();

        expect(kopru.kullanilmayanKlipleriSil).toHaveBeenCalledWith(['muhafiz_anons_dun.caf'], ANONS_KLIP_ONEKI);
    });

    test('muhafiz KAPALIYKEN (matrissiz hazirla) ses sorgulanmaz', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla();
        expect(kopru.trSesTanimlayici).not.toHaveBeenCalled();
    });
});

describe('AndroidMuhafizTeslimcisi — alarm butcesi (500 alarm tavani)', () => {
    beforeEach(() => jest.clearAllMocks());

    test('bir turda butceden fazla alarm kurulmaz; kesme kronolojik (en uzaktakiler duser)', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        const taban = Date.now() + 60_000;
        // Her teslim sesli: bildirim + TTS = 2 alarm.
        for (let i = 0; i < ANDROID_MUHAFIZ_ALARM_BUTCESI; i++) {
            await t.uyariPlanla(teslimKur({ sesliAnons: true, anonsMetni: 'kalk', kanallar: { bildirim: true, sesli: true } }, taban + i * 60_000));
        }
        const bildirim = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length;
        expect(bildirim + mockPlanlaAnons.mock.calls.length).toBe(ANDROID_MUHAFIZ_ALARM_BUTCESI);
        // Ilk yarı kuruldu (kronolojik), son yarı düştü.
        expect(bildirim).toBe(ANDROID_MUHAFIZ_ALARM_BUTCESI / 2);
    });

    test('yeni tur (hazirla) butceyi sifirlar', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        for (let i = 0; i < ANDROID_MUHAFIZ_ALARM_BUTCESI + 5; i++) await t.uyariPlanla(teslimKur({}, Date.now() + 60_000 + i));
        (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur());
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    test('NÖBETÇİ: butce tavanin altinda kalir (diger bildirimlere pay)', () => {
        expect(ANDROID_MUHAFIZ_ALARM_BUTCESI).toBeLessThanOrEqual(400);
    });
});

describe('AndroidMuhafizTeslimcisi — camideyken (Camideyim #297)', () => {
    const camiKoprusu = require('../../../../modules/expo-cami-geofence/src') as { sessizBitisMs: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
        camiKoprusu.sessizBitisMs.mockResolvedValue(0);
    });

    const kanal = () =>
        (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].trigger.channelId as string;
    const sesliAcil: Partial<UyariPlani> = { seviye: 4, acilKanal: true, sesliAnons: true, anonsMetni: 'kalk', kanallar: { bildirim: true, sesli: true } };

    test('camideyken bildirim İPTAL EDİLMEZ ama acil kanala düşmez ve sesli anons planlanmaz', async () => {
        camiKoprusu.sessizBitisMs.mockResolvedValue(Date.now() + 60 * 60_000);
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur(sesliAcil));
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        expect(kanal()).toBe('muhafiz');
        expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    test('camide hâli bittikten SONRAKİ uyarılar eskisi gibi (acil + anons)', async () => {
        camiKoprusu.sessizBitisMs.mockResolvedValue(Date.now() + 60_000);
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur(sesliAcil));
        expect(kanal()).toBe('muhafiz_acil');
        expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
    });
});

describe('Muhafız DIŞI tüketici (nafile, issue #273) — teslimci seçenekleri', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIptalEtOnekliAnonslar.mockReturnValue(true);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    });

    test('ANDROID: anons temizliği ÖNEKLİDİR — muhafız turu nafile anonslarını silmez', () => {
        new AndroidMuhafizTeslimcisi().tumYanKanallariIptalEt();
        expect(mockIptalEtOnekliAnonslar).toHaveBeenCalledWith('muhafiz_');
        expect(mockIptalEtTumAnonslar).not.toHaveBeenCalled();
        new AndroidMuhafizTeslimcisi({ anonsOneki: 'nafile_' }).tumYanKanallariIptalEt();
        expect(mockIptalEtOnekliAnonslar).toHaveBeenLastCalledWith('nafile_');
    });

    test('ANDROID: native önekli iptal yoksa (eski köprü) eski "tümünü sil" yoluna düşer', () => {
        mockIptalEtOnekliAnonslar.mockReturnValue(false);
        new AndroidMuhafizTeslimcisi().tumYanKanallariIptalEt();
        expect(mockIptalEtTumAnonslar).toHaveBeenCalledTimes(1);
    });

    test('ANDROID: ozel yük + kanal zorlaması; kanal hazırlığı enjekte edilir (muhafız GC çağrılmaz)', async () => {
        const kanalHazirligi = jest.fn(async () => undefined);
        const t = new AndroidMuhafizTeslimcisi({ kanalHazirligi, alarmButcesi: 1 });
        await t.hazirla();
        expect(kanalHazirligi).toHaveBeenCalledTimes(1);
        expect(mockKanallariHazirla).not.toHaveBeenCalled();
        const veri = { tip: 'nafile', tur: 'kusluk', tarih: '2026-10-13' };
        await t.uyariPlanla({ ...teslimKur(), id: 'nafile_x_1', ozel: { veri, kanalId: 'nafile_uyandirma' } });
        await t.uyariPlanla({ ...teslimKur({}, Date.now() + 120_000), id: 'nafile_x_2', ozel: { veri } });
        const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        expect(cagrilar).toHaveLength(1); // bütçe 1
        expect(cagrilar[0][0].content.data).toEqual(veri);
        expect(cagrilar[0][0].trigger.channelId).toBe('nafile_uyandirma');
    });

    test('iOS: bütçe "kendimiz dışındaki" bekleyenleri sayar; zamana duyarlılık zorlanabilir', async () => {
        // 30 muhafız + 25 nafile bekliyor; nafile teslimcisi muhafızları SAYAR.
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
            ...Array.from({ length: 30 }, (_, i) => ({ identifier: `muhafiz_${i}` })),
            ...Array.from({ length: 25 }, (_, i) => ({ identifier: `nafile_${i}` })),
        ]);
        const t = new IosMuhafizTeslimcisi({ kendiOneki: 'nafile_' });
        await t.hazirla();
        const veri = { tip: 'nafile', tur: 'teheccud', tarih: '2026-10-13' };
        for (let i = 0; i < 40; i++) {
            await t.uyariPlanla({ ...teslimKur({ seviye: 1 }, Date.now() + 60_000 * (i + 1)), id: `nafile_${i}`, ozel: { veri, zamanaDuyarli: true } });
        }
        const cagrilar = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
        expect(cagrilar).toHaveLength(64 - 30 - 4);
        expect(cagrilar[0][0].content.interruptionLevel).toBe('timeSensitive');
        expect(cagrilar[0][0].content.data).toEqual(veri);
    });
});


/**
 * ODAK FİLTRESİ (issue #279): kullanıcı "Namaz" Odağına filtreyi ekleyip
 * "Hatırlatmaları sessiz ver"i açtıysa uyarılar `passive` kurulur — Odağı delen
 * `timeSensitive` dahil. Durum köprüden (`siriOdakDurumuAl`) `hazirla`'da okunur.
 */
describe('IosMuhafizTeslimcisi — Odak filtresi (issue #279)', () => {
    const siriKoprusu = require('../../../../modules/expo-siri-kisayollari/src') as {
        siriOdakDurumuAl: jest.Mock;
    };
    const odakKur = (sessiz: boolean, ms: number) =>
        siriKoprusu.siriOdakDurumuAl.mockResolvedValue(JSON.stringify({ sessiz, ms }));
    const planlanan = () =>
        (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map((c) => c[0].content);

    beforeEach(() => {
        jest.clearAllMocks();
        ucustakiKlipleriSifirla();
        mockPlatformDurumu.uygulamaDurumu = 'active';
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        kopru.trSesTanimlayici.mockResolvedValue(null);
        siriKoprusu.siriOdakDurumuAl.mockResolvedValue(null);
    });
    afterAll(() => siriKoprusu.siriOdakDurumuAl.mockResolvedValue(null));

    test('filtre sessizken HER seviye ve zamana duyarlı özel teslim passive kurulur', async () => {
        odakKur(true, Date.now() - 60_000);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur({ seviye: 1 }));
        await t.uyariPlanla(teslimKur({ seviye: 4, kalanDk: 3 }));
        await t.uyariPlanla({ ...teslimKur({ kalanDk: 2 }), id: 'nafile_1', ozel: { veri: {}, zamanaDuyarli: true } });
        expect(planlanan().map((c) => c.interruptionLevel)).toEqual(['passive', 'passive', 'passive']);
    });

    test('filtre yoksa / sessiz kapalıysa davranış birebir aynı', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur({ seviye: 1 }));
        odakKur(false, Date.now() - 60_000);
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur({ seviye: 3 }));
        expect(planlanan().map((c) => c.interruptionLevel)).toEqual(['active', 'timeSensitive']);
    });

    test('SÜRE TAVANI: filtre 3 saatten eski uyarıları susturmaz', async () => {
        odakKur(true, Date.now() - 3 * 60 * 60 * 1000 + 5 * 60 * 1000);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur({ seviye: 3 }, Date.now() + 2 * 60 * 1000)); // tavan içinde
        await t.uyariPlanla(teslimKur({ seviye: 3 }, Date.now() + 10 * 60 * 1000)); // tavan dışında
        expect(planlanan().map((c) => c.interruptionLevel)).toEqual(['passive', 'timeSensitive']);
    });

    test('sessizken sesli adımın anons klibi ÜRETİLMEZ (ses çalmayacak)', async () => {
        odakKur(true, Date.now() - 60_000);
        kopru.trSesTanimlayici.mockResolvedValue(TR_SES);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(
            teslimKur({ seviye: 3, kanallar: { bildirim: true, sesli: true }, sesliAnons: true, anonsMetni: 'Akşam vakti.' })
        );
        expect(kopru.klipVarMi).not.toHaveBeenCalled();
        expect(kopru.klipSentezle).not.toHaveBeenCalled();
        expect(planlanan()[0].sound).toBe(IOS_BILDIRIM_SESI);
    });

    test('ERTELE kopyası sessizliği KAYBETMEZ: data `odakSessiz` + TABAN seviye taşır (basışta yeniden değerlendirilir)', async () => {
        odakKur(true, Date.now() - 60_000);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        const zaman = Date.now() + 2 * 60 * 1000;
        await t.uyariPlanla({ ...teslimKur({ seviye: 3 }, zaman), cikis: new Date(zaman + 60 * 60 * 1000) });
        const c = planlanan()[0];
        expect(c.interruptionLevel).toBe('passive');
        expect(c.data.odakSessiz).toBe(true);
        expect(c.data.kesintiSeviyesi).toBe('timeSensitive');
    });

    test('bozuk filtre kaydı hatırlatmaları susturmaz', async () => {
        siriKoprusu.siriOdakDurumuAl.mockResolvedValue('{bozuk');
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur({ seviye: 3 }));
        expect(planlanan()[0].interruptionLevel).toBe('timeSensitive');
    });
});

describe('IosMuhafizTeslimcisi — GERÇEK ALARM / AlarmKit (iOS 26, issue #74)', () => {
    const alarmKoprusu = require('../../../../modules/expo-muhafiz-alarmkit/src') as {
        alarmKitDurumu: jest.Mock;
        alarmKitPlanla: jest.Mock;
        alarmKitIptalEt: jest.Mock;
        alarmKitKayitlari: jest.Mock;
    };
    const siriKoprusu = require('../../../../modules/expo-siri-kisayollari/src') as {
        siriOdakDurumuAl: jest.Mock;
    };
    const ALARM_ID = 'muhafiz_2026-01-01_vakit_aksam_seviye_1_dk_10';
    const alarmTeslimi = (zamanMs?: number) => {
        const zaman = zamanMs ?? Date.now() + 10 * 60 * 1000;
        return {
            ...teslimKur({ seviye: 1, alarm: true, kanallar: { bildirim: true, alarm: true } }, zaman),
            cikis: new Date(zaman + 60 * 60 * 1000),
        };
    };
    const KAYITLAR = [
        { kimlik: 'muhafiz_2026-01-01_vakit_aksam_seviye_1_dk_45', tetikMs: 1 },
        { kimlik: 'muhafiz_2026-01-01_vakit_aksam_ertele', tetikMs: 2 },
        { kimlik: 'muhafiz_2026-01-01_vakit_yatsi_seviye_2_dk_30', tetikMs: 3 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
        kopru.trSesTanimlayici.mockResolvedValue(null);
        siriKoprusu.siriOdakDurumuAl.mockResolvedValue(null);
        alarmKoprusu.alarmKitDurumu.mockResolvedValue('izinli');
        alarmKoprusu.alarmKitPlanla.mockResolvedValue(true);
        alarmKoprusu.alarmKitIptalEt.mockResolvedValue(undefined);
        alarmKoprusu.alarmKitKayitlari.mockResolvedValue(KAYITLAR);
    });
    afterAll(() => {
        alarmKoprusu.alarmKitDurumu.mockResolvedValue('desteklenmiyor');
        alarmKoprusu.alarmKitPlanla.mockResolvedValue(false);
        alarmKoprusu.alarmKitKayitlari.mockResolvedValue([]);
    });

    test('izinliyken alarm tetiği SİSTEM ALARMI olur: bildirim kurulmaz, yük erteleme sınırını taşır', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        const teslim = alarmTeslimi();
        await t.uyariPlanla(teslim);

        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        expect(alarmKoprusu.alarmKitPlanla).toHaveBeenCalledTimes(1);
        const yuk = alarmKoprusu.alarmKitPlanla.mock.calls[0][0];
        expect(yuk).toMatchObject({
            kimlik: ALARM_ID,
            tetikMs: teslim.zaman.getTime(),
            vakit: 'aksam',
            tarih: '2026-01-01',
            cikisMs: teslim.cikis.getTime(),
            erteleSinirMs: teslim.cikis.getTime() - 3 * 60_000,
        });
        expect(yuk.ertelemeBasligi).toContain('{sure}');
    });

    test('AlarmKit 64 bildirim bütçesine SAYILMAZ: slot dolu olsa da alarm kurulur', async () => {
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
            Array.from({ length: 64 }, (_, i) => ({ identifier: `vakit_${i}` }))
        );
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(alarmTeslimi());
        await t.uyariPlanla(teslimKur({ kalanDk: 5 }));
        expect(alarmKoprusu.alarmKitPlanla).toHaveBeenCalledTimes(1);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    test.each(['belirsiz', 'reddedildi', 'desteklenmiyor'])(
        'durum %s → bugünkü yol: zamana duyarlı bildirim + uzun ses',
        async (durum) => {
            alarmKoprusu.alarmKitDurumu.mockResolvedValue(durum);
            const t = new IosMuhafizTeslimcisi();
            await t.hazirla(BOS_MATRIS);
            await t.uyariPlanla(alarmTeslimi());
            expect(alarmKoprusu.alarmKitPlanla).not.toHaveBeenCalled();
            const [girdi] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
            expect(girdi.content).toMatchObject({ interruptionLevel: 'timeSensitive', sound: 'alarm_ios.wav' });
        }
    );

    test('kurulamazsa AYNI tetik bildirim olarak gelir (sessiz kayıp yok)', async () => {
        alarmKoprusu.alarmKitPlanla.mockResolvedValue(false);
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(alarmTeslimi());
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        expect((Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].identifier).toBe(ALARM_ID);
    });

    test('Odak filtresi sessizken alarm KURULMAZ (passive bildirim)', async () => {
        siriKoprusu.siriOdakDurumuAl.mockResolvedValue(JSON.stringify({ sessiz: true, ms: Date.now() - 60_000 }));
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(alarmTeslimi());
        expect(alarmKoprusu.alarmKitPlanla).not.toHaveBeenCalled();
        expect((Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0].content.interruptionLevel).toBe(
            'passive'
        );
    });

    test('alarm OLMAYAN tetik (acil ton dahil) alarma çevrilmez', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        await t.uyariPlanla(teslimKur({ seviye: 4, kalanDk: 3, acilKanal: true }));
        expect(alarmKoprusu.alarmKitPlanla).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    test('hazirla: önceki turun PLAN alarmları iptal, erteleme KORUNUR (muhafız açık)', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla(BOS_MATRIS);
        expect(alarmKoprusu.alarmKitIptalEt).toHaveBeenCalledWith([
            'muhafiz_2026-01-01_vakit_aksam_seviye_1_dk_45',
            'muhafiz_2026-01-01_vakit_yatsi_seviye_2_dk_30',
        ], false);
    });

    test('hazirla(): muhafız KAPALI → ertelenmiş dahil HEPSİ iptal, alarm kurulmaz', async () => {
        const t = new IosMuhafizTeslimcisi();
        await t.hazirla();
        expect(alarmKoprusu.alarmKitIptalEt).toHaveBeenCalledWith(KAYITLAR.map((k) => k.kimlik), false);
        await t.uyariPlanla(alarmTeslimi());
        expect(alarmKoprusu.alarmKitPlanla).not.toHaveBeenCalled();
    });

    test('uygulama içi "Kıldım": vaktin alarmları önekle (plan + erteleme)', async () => {
        const t = new IosMuhafizTeslimcisi();
        t.vakitYanKanallariniIptalEt('muhafiz_2026-01-01_vakit_aksam');
        await t.secilenYanKanallariIptalEt(() => false); // zincirin bitmesini bekle
        expect(alarmKoprusu.alarmKitIptalEt).toHaveBeenCalledWith([
            'muhafiz_2026-01-01_vakit_aksam_seviye_1_dk_45',
            'muhafiz_2026-01-01_vakit_aksam_ertele',
        ], true);
    });

    test('yeniden planlama (tumYanKanallariIptalEt) yalnız PLAN alarmlarını siler; tekil iptal kimlikle; SIRA korunur', async () => {
        const t = new IosMuhafizTeslimcisi();
        t.tumYanKanallariIptalEt();
        t.yanKanaliIptalEt(ALARM_ID);
        await t.secilenYanKanallariIptalEt(() => false);
        expect(alarmKoprusu.alarmKitIptalEt.mock.calls).toEqual([
            [['muhafiz_2026-01-01_vakit_aksam_seviye_1_dk_45', 'muhafiz_2026-01-01_vakit_yatsi_seviye_2_dk_30'], false],
            [[ALARM_ID]],
            [[], false],
        ]);
    });

    describe('ÇALAN alarm (Android kuralı: planlama turu çalan alarma dokunmaz)', () => {
        const CALAN = { kimlik: 'muhafiz_2026-01-01_vakit_aksam_seviye_1_dk_45', tetikMs: 1, caliyor: true };
        const DIGER = KAYITLAR.slice(1);
        beforeEach(() => {
            alarmKoprusu.alarmKitKayitlari.mockResolvedValue([CALAN, ...DIGER]);
        });

        test('hazirla (muhafız açık) çalanı İPTAL ETMEZ', async () => {
            const t = new IosMuhafizTeslimcisi();
            await t.hazirla(BOS_MATRIS);
            expect(alarmKoprusu.alarmKitIptalEt).toHaveBeenCalledWith(
                ['muhafiz_2026-01-01_vakit_yatsi_seviye_2_dk_30'],
                false
            );
        });

        test('muhafız KAPATILINCA bile çalan korunur (yalnız bekleyenler silinir)', async () => {
            const t = new IosMuhafizTeslimcisi();
            await t.hazirla();
            expect(alarmKoprusu.alarmKitIptalEt).toHaveBeenCalledWith(
                DIGER.map((k) => k.kimlik),
                false
            );
        });

        test('yeniden planlama ve erteleme aralığı çalanı atlar', async () => {
            const t = new IosMuhafizTeslimcisi();
            t.tumYanKanallariIptalEt();
            await t.secilenYanKanallariIptalEt((k) => k.includes('_aksam_'));
            for (const [kimlikler, calaniDurdur] of alarmKoprusu.alarmKitIptalEt.mock.calls) {
                expect(kimlikler).not.toContain(CALAN.kimlik);
                expect(calaniDurdur).toBe(false);
            }
        });

        test('uygulama içi "Kıldım" çalanı da SUSTURUR', async () => {
            const t = new IosMuhafizTeslimcisi();
            t.vakitYanKanallariniIptalEt('muhafiz_2026-01-01_vakit_aksam');
            await t.secilenYanKanallariIptalEt(() => false);
            expect(alarmKoprusu.alarmKitIptalEt).toHaveBeenCalledWith(
                [CALAN.kimlik, 'muhafiz_2026-01-01_vakit_aksam_ertele'],
                true
            );
        });
    });

    test('NAFİLE teslimcisi alarmlara HİÇ dokunmaz (muhafızın alarmlarını silmesin)', async () => {
        const t = new IosMuhafizTeslimcisi({ kendiOneki: 'nafile_', matrissizAnons: true });
        await t.hazirla();
        t.tumYanKanallariIptalEt();
        t.vakitYanKanallariniIptalEt('muhafiz_2026-01-01_vakit_aksam');
        await t.uyariPlanla({ ...alarmTeslimi(), id: 'nafile_x', ozel: { veri: { tip: 'nafile' } } });
        expect(alarmKoprusu.alarmKitDurumu).not.toHaveBeenCalled();
        expect(alarmKoprusu.alarmKitIptalEt).not.toHaveBeenCalled();
        expect(alarmKoprusu.alarmKitPlanla).not.toHaveBeenCalled();
    });
});
