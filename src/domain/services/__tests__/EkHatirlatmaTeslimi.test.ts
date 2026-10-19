/**
 * NÖBETÇİ — EK HATIRLATMA YÜZEYLERİNİN TESLİMİ (ortak hatırlatma yüzeyleri, plan §3.2/§4.1).
 *
 * Cuma / camiye gitme / yatış / takvim muhafızla AYNI teslimciden kendi örnekleriyle geçer.
 * Göçten gelen kayıt bugünkü bildirimle BİREBİR aynı duyulmalı ve "Kıldım" FARZ yazmamalı:
 * - `kategori: null` → `categoryIdentifier` HİÇ yazılmaz (İKİ teslimcide),
 * - `varsayilanKanalId` → varsayılan ses + titreşimsiz adım bugünkü kanalda kalır (alarm
 *   düşüşünde de); ses/titreşim seçilince ortak muhafız uzayına geçer,
 * - iOS `varsayilanSistemSesi` → `sound: true` (paket sesine çevrilmez),
 * - muhafız turu (kapalıyken de) yatış/muhasebe alarmlarını SİLMEZ.
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
    NativeModules: {},
}));

jest.mock('../../../data/local/Depolama', () => ({
    Depolama: {
        oku: jest.fn(async () => null),
        yaz: jest.fn(async () => undefined),
        guncelle: jest.fn(async (_a: string, d: (m: unknown) => unknown) => d(null)),
    },
}));

jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn(() => true),
}));

jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: jest.fn(async (m: unknown) => m),
        nafileSesleriniDogrula: async (a: unknown) => a,
    },
}));

const mockKopru = {
    var: true,
    planla: jest.fn(async (_yuk: unknown) => false),
};
jest.mock('../MuhafizAlarmKoprusu', () => ({
    alarmKoprusuVarMi: () => mockKopru.var,
    alarmPlanla: (yuk: unknown) => mockKopru.planla(yuk),
    onekliAlarmlariIptalEt: jest.fn(async () => undefined),
    sahipliYanKanallariIptalEt: jest.fn(async () => true),
    sahipliIptalVarMi: () => true,
    alarmKanallariniTemizle: jest.fn(async () => undefined),
    vakitAlarmlariniSustur: jest.fn(async () => undefined),
}));

import * as Notifications from 'expo-notifications';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';
import { IosMuhafizTeslimcisi, ucustakiKlipleriSifirla } from '../IosMuhafizTeslimcisi';
import type { OzelTeslim, UyariTeslimi } from '../MuhafizTeslimcisi';
import type { UyariPlani } from '../../../core/muhafiz/motorAdaptoru';
import { muhafizKanaliSec } from '../../../core/muhafiz/motorAdaptoru';
import { IOS_BILDIRIM_SESI } from '../../../core/muhafiz/ios/teslimPlani';

const DK = 60_000;
const OZEL: OzelTeslim = {
    veri: { tip: 'cuma_hatirlatma' },
    kategori: null,
    varsayilanKanalId: 'vakit_bildirim',
    varsayilanSistemSesi: true,
    alarmAdi: 'Cuma',
    alarmTuru: 'bilgi',
};

function teslim(kismi: Partial<UyariPlani> = {}, ozel: OzelTeslim = OZEL): UyariTeslimi {
    const uyari = {
        seviye: 1,
        kalanDk: 60,
        olcuDk: 60,
        adimIndeks: 0,
        kanallar: { bildirim: true },
        bildirimSesi: 'varsayilan',
        sesliAnons: false,
        anonsMetni: '',
        acilKanal: false,
        ...kismi,
    } as UyariPlani;
    const zaman = new Date(Date.now() + 30 * DK);
    return {
        id: 'cuma_hatirlatma_2026-10-16',
        baslik: 'Cuma · 1 sa kaldı',
        mesaj: 'Öğle vaktine 1 saat kaldı.',
        zaman,
        uyari,
        vakit: 'ogle',
        muhafizVakti: 'ogle',
        tarih: '2026-10-16',
        yon: 'cikisaDogru',
        cikis: new Date(zaman.getTime() + 60 * DK),
        ozel,
    };
}

const son = () => {
    const c = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    return c[c.length - 1][0] as { content: Record<string, unknown>; trigger: Record<string, unknown> };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockKopru.var = true;
    mockKopru.planla.mockResolvedValue(false);
});

describe('Android — ek hatırlatma teslimi', () => {
    beforeEach(() => {
        mockPlatformDurumu.OS = 'android';
    });

    const yeni = () =>
        new AndroidMuhafizTeslimcisi({
            sahiplik: { tur: 'onek', onek: 'cuma_hatirlatma_' },
            kanalHazirligi: async (m) => m,
            alarmKanalTemizligi: false,
        });

    test('kategori: null → categoryIdentifier HİÇ yazılmaz; data muhafız yükü DEĞİL', async () => {
        const t = yeni();
        await t.hazirla();
        await t.uyariPlanla(teslim());
        const { content } = son();
        expect('categoryIdentifier' in content).toBe(false);
        expect(content.data).toEqual({ tip: 'cuma_hatirlatma' });
        expect(content.sound).toBe(true);
    });

    test('varsayılan ses + titreşimsiz → bugünkü kanal (vakit_bildirim)', async () => {
        const t = yeni();
        await t.hazirla();
        await t.uyariPlanla(teslim());
        expect(son().trigger.channelId).toBe('vakit_bildirim');
    });

    test('titreşim ya da özel ses seçilince ortak muhafız kanal uzayına geçer', async () => {
        const t = yeni();
        await t.hazirla();
        await t.uyariPlanla(teslim({ kanallar: { bildirim: true, titresim: true } }));
        expect(son().trigger.channelId).toBe(muhafizKanaliSec(1, 'varsayilan', false, true));
        await t.uyariPlanla(teslim({ bildirimSesi: 'content://media/1' }));
        expect(son().trigger.channelId).toBe(muhafizKanaliSec(1, 'content://media/1', false, false));
    });

    test('kategori verilmezse (nafile) muhafız davranışı korunur', async () => {
        const t = yeni();
        await t.hazirla();
        await t.uyariPlanla(teslim({}, { veri: { tip: 'nafile' } }));
        expect(son().content.categoryIdentifier).toBe('muhafiz_category');
    });

    test('alarm kurulamazsa düşüş kanalı da varsayılan kanaldır', async () => {
        const t = yeni();
        await t.hazirla();
        mockKopru.planla.mockResolvedValue(true);
        await t.uyariPlanla(teslim({ kanallar: { bildirim: true, alarm: true }, alarm: true }));
        const yuk = mockKopru.planla.mock.calls[0][0] as { kanalId: string };
        expect(yuk.kanalId).toBe('vakit_bildirim');
    });

    test('CAMİDEYKEN (#297, plan §4.5): alarm ve sesli anons KURULMAZ, bildirim yine gelir (bugünkü kapı korunur)', async () => {
        const { sessizBitisMs } = require('../../../../modules/expo-cami-geofence/src');
        (sessizBitisMs as jest.Mock).mockResolvedValue(Date.now() + 3 * 60 * DK);
        const anons = require('../../../../modules/expo-countdown-notification/src').planlaAnons as jest.Mock;
        try {
            const t = yeni();
            await t.hazirla();
            mockKopru.planla.mockResolvedValue(true);
            await t.uyariPlanla(teslim({ kanallar: { bildirim: true, sesli: true, alarm: true }, alarm: true, sesliAnons: true, anonsMetni: 'Cuma için öğle vaktine 1 saat kaldı.' }));
            expect(mockKopru.planla).not.toHaveBeenCalled();
            expect(anons).not.toHaveBeenCalled();
            expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        } finally {
            (sessizBitisMs as jest.Mock).mockResolvedValue(0);
        }
    });

    test('BİLGİ türü alarm: yük `tur: bilgi`, `cikisMs` = pencere sonu, ad = yüzey adı, data kendi yükü', async () => {
        const t = yeni();
        await t.hazirla();
        mockKopru.planla.mockResolvedValue(true);
        const te = teslim({ kanallar: { bildirim: true, alarm: true }, alarm: true });
        await t.uyariPlanla(te);
        const yuk = mockKopru.planla.mock.calls[0][0] as Record<string, unknown>;
        expect(yuk.tur).toBe('bilgi');
        expect(yuk.cikisMs).toBe(te.cikis!.getTime());
        expect(yuk).not.toHaveProperty('erteleSinirMs');
        expect(yuk.vakitAdi).toBe('Cuma');
        expect(yuk.veri).toEqual({ tip: 'cuma_hatirlatma' });
        // Alarm o tetiğin bildiriminin YERİNE geçer.
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        // Cuma kılınmışlığa bağlı DEĞİL (vakit girmeden çalar) → bayrak yükte YOK.
        expect('kilinmisligaBagli' in yuk).toBe(false);
    });

    test('KILINMIŞLIĞA BAĞLI bilgi alarmı (takvim): yükte bayrak + vakit/tarih (native kuyruk denetimi)', async () => {
        const t = new AndroidMuhafizTeslimcisi({
            sahiplik: { tur: 'onek', onek: 'takvim_cakisma_' },
            kanalHazirligi: async (m) => m,
            alarmKanalTemizligi: false,
        });
        await t.hazirla();
        mockKopru.planla.mockResolvedValue(true);
        const te = {
            ...teslim(
                { kanallar: { bildirim: true, alarm: true }, alarm: true },
                {
                    veri: { tip: 'takvim_cakisma', vakit: 'ogle', tarih: '2026-10-16' },
                    kategori: null,
                    alarmAdi: 'Takvim',
                    alarmTuru: 'bilgi',
                    alarmKilinmisligaBagli: true,
                }
            ),
            id: 'takvim_cakisma_2026-10-16_ogle',
        };
        await t.uyariPlanla(te);
        const yuk = mockKopru.planla.mock.calls[0][0] as Record<string, unknown>;
        expect(yuk).toMatchObject({ tur: 'bilgi', kilinmisligaBagli: true, vakit: 'ogle', tarih: '2026-10-16' });
    });
});

describe('iOS — ek hatırlatma teslimi', () => {
    beforeEach(() => {
        mockPlatformDurumu.OS = 'ios';
    });

    test('kategori YOK, varsayılan ses SİSTEM sesi (sound: true)', async () => {
        const t = new IosMuhafizTeslimcisi({ sahiplik: { tur: 'onek', onek: 'cuma_hatirlatma_' }, matrissizAnons: true });
        await t.hazirla();
        await t.uyariPlanla(teslim());
        const { content, trigger } = son();
        expect('categoryIdentifier' in content).toBe(false);
        expect(content.sound).toBe(true);
        expect(content.interruptionLevel).toBe('active');
        expect('channelId' in trigger).toBe(false);
    });

    test('özel ses seçilince sistem sesi DEĞİL (paket sesine düşer — iOS kanal yok)', async () => {
        const t = new IosMuhafizTeslimcisi({ sahiplik: { tur: 'onek', onek: 'cuma_hatirlatma_' }, matrissizAnons: true });
        await t.hazirla();
        await t.uyariPlanla(teslim({ bildirimSesi: 'content://media/1' }));
        expect(son().content.sound).toBe(IOS_BILDIRIM_SESI);
    });

    test('NÖBETÇİ 64: PARALEL iki örnek (muhafız + cuma) toplamda sınırı AŞMAZ — sıra varsayımı YOK', async () => {
        ucustakiKlipleriSifirla();
        const BASKA = 40;
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
            Array.from({ length: BASKA }, (_, i) => ({ identifier: `vakit_bildirim_${i}` }))
        );
        const muhafiz = new IosMuhafizTeslimcisi();
        const cuma = new IosMuhafizTeslimcisi({ sahiplik: { tur: 'onek', onek: 'cuma_hatirlatma_' }, matrissizAnons: true });
        // İkisi de AYNI anda ölçer (Promise.all ile paralel koşan tüketiciler).
        await Promise.all([muhafiz.hazirla({} as never), cuma.hazirla()]);
        for (let i = 0; i < 30; i++) {
            await muhafiz.uyariPlanla({ ...teslim(), id: `muhafiz_2026-10-16_vakit_ogle_seviye_1_dk_${i + 1}`, ozel: undefined });
            await cuma.uyariPlanla({ ...teslim(), id: `cuma_hatirlatma_2026-10-16_${i + 1}` });
        }
        const kurulan = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length;
        // 64 − 40 başka − 4 güvenlik payı = 20: iki örnek AYNI boş slotu iki kez harcamaz.
        expect(kurulan).toBe(64 - BASKA - 4);
        await Promise.all([muhafiz.tamamla(), cuma.tamamla()]);
        (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
    });

    test('NÖBETÇİ: muhafız KAPALIYKEN AlarmKit temizliği yatış/muhasebe alarmlarını SİLMEZ', async () => {
        const kopru = require('../../../../modules/expo-muhafiz-alarmkit/src');
        kopru.alarmKitDurumu.mockResolvedValue('izinli');
        kopru.alarmKitKayitlari.mockResolvedValue([
            { kimlik: 'muhafiz_2026-10-16_vakit_ogle_seviye_1_dk_30', uuid: 'a', caliyor: false },
            { kimlik: 'muhafiz_2026-10-16_vakit_ogle_ertele', uuid: 'b', caliyor: false },
            { kimlik: 'muhafiz_2026-10-16_vakit_yatsi_yatis', uuid: 'c', caliyor: false },
        ]);
        try {
            await new IosMuhafizTeslimcisi().hazirla();
            const silinen = kopru.alarmKitIptalEt.mock.calls.flatMap((c: unknown[]) => c[0] as string[]);
            expect(silinen).toEqual(
                expect.arrayContaining(['muhafiz_2026-10-16_vakit_ogle_seviye_1_dk_30', 'muhafiz_2026-10-16_vakit_ogle_ertele'])
            );
            expect(silinen).not.toContain('muhafiz_2026-10-16_vakit_yatsi_yatis');
        } finally {
            kopru.alarmKitDurumu.mockResolvedValue('desteklenmiyor');
            kopru.alarmKitKayitlari.mockResolvedValue([]);
        }
    });
});
