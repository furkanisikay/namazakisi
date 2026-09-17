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
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: (...args: unknown[]) => mockIptalEtAnons(...args),
    iptalEtTumAnonslar: (...args: unknown[]) => mockIptalEtTumAnonslar(...args),
}));

const mockKanallariHazirla = jest.fn();
jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: (...args: unknown[]) => mockKanallariHazirla(...args),
    },
}));

import * as Notifications from 'expo-notifications';
import {
    muhafizTeslimcisiniAl,
    muhafizTeslimcisiniAyarla,
    type UyariTeslimi,
} from '../MuhafizTeslimcisi';
import { IosMuhafizTeslimcisi } from '../IosMuhafizTeslimcisi';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';
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

    test('yan kanal iptalleri no-op — native kopruye dokunmaz', () => {
        teslimci.yanKanaliIptalEt();
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
            ...Array.from({ length: 50 }, (_, i) => ({ identifier: `muhafiz_eski_${i}` })),
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
