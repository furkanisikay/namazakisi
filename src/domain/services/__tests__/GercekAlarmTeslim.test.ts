/**
 * NOBETCI — ANDROID GERCEK ALARM TESLIMI (issue #74).
 *
 * - Alarmli tetik native `setAlarmClock` yoluna gider ve o tetigin bildirimi + TTS
 *   anonsu KURULMAZ (alarm onlarin yerine gecer; cift ses yok).
 * - Alarm kurulamazsa (izin yok / kopru yok) AYNI tetik normal yoldan kurulur.
 * - Camideyken alarm kurulmaz; muhafiz disi (nafile) teslim alarm tasimaz.
 * - `hazirla` onceki turun alarmlarini BEKLEYEREK iptal eder ve oksuz alarm
 *   kanallarini toplar; nafile ornegi (`alarmDestegi: false`) buna dokunmaz.
 * - Alarm Android alarm butcesinden sayilir.
 */
jest.mock('expo-notifications', () => ({
    scheduleNotificationAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
    AndroidNotificationPriority: { MAX: 'max', HIGH: 'high' },
    SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mockPlanlaAnons = jest.fn();
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: (...args: unknown[]) => mockPlanlaAnons(...args),
    iptalEtAnons: jest.fn(),
    iptalEtTumAnonslar: jest.fn(),
    iptalEtOnekliAnonslar: jest.fn(() => true),
}));

jest.mock('../MuhafizKanalServisi', () => ({
    MuhafizKanalServisi: {
        hazirla: jest.fn(async (m: unknown) => m),
        nafileSesleriniDogrula: jest.fn(async (a: unknown) => a),
        // GERÇEK uygulama: ek yüzeylerin (nafile, cuma) alarm kanalları diskten okunur ve
        // sesler native çözümle doğrulanır (bu dosyada `sesAdiAl` yok → çözülemez sayılır).
        ekAlarmKanallariniOku: () =>
            jest.requireActual('../MuhafizKanalServisi').MuhafizKanalServisi.ekAlarmKanallariniOku(),
    },
}));

const mockKopru = {
    var: true,
    planla: jest.fn(async (_yuk: unknown) => true),
    onekliIptal: jest.fn(async (_onek: string) => undefined),
    sahipliIptal: jest.fn(async (_sahip: string, _k: { anons: boolean; alarm: boolean }) => true),
    sustur: jest.fn(async (_onek: string) => undefined),
    kanalTemizle: jest.fn(async (_k: string[]) => undefined),
    sira: [] as string[],
};
jest.mock('../MuhafizAlarmKoprusu', () => ({
    alarmKoprusuVarMi: () => mockKopru.var,
    alarmPlanla: (yuk: unknown) => {
        mockKopru.sira.push('planla');
        return mockKopru.planla(yuk);
    },
    onekliAlarmlariIptalEt: (onek: string) => {
        mockKopru.sira.push('iptal');
        return mockKopru.onekliIptal(onek);
    },
    sahipliYanKanallariIptalEt: (sahip: string, k: { anons: boolean; alarm: boolean }) => {
        mockKopru.sira.push('iptal');
        return mockKopru.sahipliIptal(sahip, k);
    },
    sahipliIptalVarMi: () => mockKopru.var,
    alarmKanallariniTemizle: (k: string[]) => mockKopru.kanalTemizle(k),
    vakitAlarmlariniSustur: (onek: string) => mockKopru.sustur(onek),
}));

import * as Notifications from 'expo-notifications';
import { sessizBitisMs } from '../../../../modules/expo-cami-geofence/src';
import { AndroidMuhafizTeslimcisi } from '../AndroidMuhafizTeslimcisi';
import type { UyariTeslimi } from '../MuhafizTeslimcisi';
import type { UyariPlani } from '../../../core/muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../../../core/muhafiz/matrisTipleri';
import { ALARM_KANAL_TABANI, alarmKanalIdOlustur, type AlarmYuku } from '../../../core/muhafiz/alarmYuku';

const DK = 60_000;

function teslimKur(kismi: Partial<UyariPlani> = {}, ek: Partial<UyariTeslimi> = {}): UyariTeslimi {
    const uyari = {
        seviye: 2,
        kalanDk: 20,
        olcuDk: 20,
        adimIndeks: 0,
        kanallar: { bildirim: true, sesli: true, alarm: true },
        bildirimSesi: 'varsayilan',
        sesliAnons: true,
        anonsMetni: '{vakit} vakti çıkıyor',
        alarm: true,
        ...kismi,
    } as UyariPlani;
    const zaman = new Date(Date.now() + 30 * DK);
    return {
        id: `muhafiz_2026-01-01_vakit_ikindi_seviye_${uyari.seviye}_dk_${uyari.kalanDk}`,
        baslik: 'İkindi · 20 dk kaldı',
        mesaj: 'mesaj',
        zaman,
        uyari,
        vakit: 'ikindi',
        muhafizVakti: 'ikindi',
        tarih: '2026-01-01',
        yon: 'cikisaDogru',
        cikis: new Date(zaman.getTime() + 20 * DK),
        ...ek,
    };
}

const alarmliMatris = (): MuhafizMatrisi => {
    const m = {} as MuhafizMatrisi;
    for (const v of MUHAFIZ_VAKITLERI) {
        m[v] = {
            seviyeler: [
                { kademe: 'nazik', kanallar: { bildirim: true, alarm: true }, esikDk: 30, siklik: 'birkez', bildirimSesi: 'varsayilan', anonsMetni: '' },
            ],
        };
    }
    return m;
};

beforeEach(() => {
    jest.clearAllMocks();
    mockKopru.var = true;
    mockKopru.planla.mockResolvedValue(true);
    mockKopru.sahipliIptal.mockResolvedValue(true);
    mockKopru.sira = [];
    (sessizBitisMs as jest.Mock).mockResolvedValue(0);
});

describe('alarmlı tetik', () => {
    test('native alarm kurulur; bildirim ve TTS anonsu KURULMAZ (alarm yerine geçer)', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        const teslim = teslimKur();
        await t.uyariPlanla(teslim);

        expect(mockKopru.planla).toHaveBeenCalledTimes(1);
        const yuk = mockKopru.planla.mock.calls[0][0] as AlarmYuku;
        expect(yuk.kimlik).toBe(teslim.id);
        expect(yuk.tetikMs).toBe(teslim.zaman.getTime());
        expect(yuk.alarmKanalId).toBe(ALARM_KANAL_TABANI);
        expect(yuk.vakitAdi).toBe('İkindi');
        // Ertele bilgisi muhafız bildirimiyle AYNI kaynaktan (çıkış − 3 dk; ikindide gurub).
        expect(yuk.erteleSinirMs).toBeGreaterThan(0);
        expect(yuk.veri).toMatchObject({ tip: 'muhafiz', vakit: 'ikindi', tarih: '2026-01-01', kanalId: yuk.kanalId });
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
        expect(mockPlanlaAnons).not.toHaveBeenCalled();
    });

    test('alarm kurulamazsa AYNI tetik normal bildirim + anons olarak kurulur (sessiz kayıp yok)', async () => {
        mockKopru.planla.mockResolvedValue(false);
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur());
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
        expect(mockPlanlaAnons).toHaveBeenCalledTimes(1);
    });

    test('köprü yoksa (eski ikili) alarm denenmez, normal yol', async () => {
        mockKopru.var = false;
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur());
        expect(mockKopru.planla).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    test('camideyken (#297) alarm KURULMAZ', async () => {
        (sessizBitisMs as jest.Mock).mockResolvedValue(Date.now() + 3 * 60 * DK);
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur());
        expect(mockKopru.planla).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    test('muhafız DIŞI teslim (nafile `ozel`) alarm taşımaz', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur({}, { ozel: { veri: { tip: 'nafile' } } }));
        expect(mockKopru.planla).not.toHaveBeenCalled();
    });

    test('alarmsız tetik köprüye HİÇ dokunmaz', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur({ alarm: undefined, kanallar: { bildirim: true } }));
        expect(mockKopru.planla).not.toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    test('alarm Android alarm bütçesinden sayılır', async () => {
        const t = new AndroidMuhafizTeslimcisi({ alarmButcesi: 1 });
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur());
        await t.uyariPlanla(teslimKur({ alarm: undefined, kalanDk: 10, olcuDk: 10, sesliAnons: false }));
        expect(mockKopru.planla).toHaveBeenCalledTimes(1);
        expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
});

describe('hazırlık ve temizlik', () => {
    test('hazirla önceki alarmları BEKLEYEREK iptal eder, sonra planlanır; kanallar toplanır', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla(alarmliMatris());
        await t.uyariPlanla(teslimKur());
        // SAHİPLİ iptal (plan §4.1): muhafız PLAN kimlikleri — `muhafiz_` önekiyle silmek
        // aynı uzaydaki yatış/muhasebe alarmlarını da silerdi.
        expect(mockKopru.sahipliIptal).toHaveBeenCalledWith('muhafiz_plan', { anons: false, alarm: true });
        expect(mockKopru.onekliIptal).not.toHaveBeenCalled();
        expect(mockKopru.sira).toEqual(['iptal', 'planla']);
        expect(mockKopru.kanalTemizle).toHaveBeenCalledWith([ALARM_KANAL_TABANI]);
    });

    test('muhafız kapalıyken (matrissiz) alarmlar ve hash\'li kanallar temizlenir', async () => {
        const t = new AndroidMuhafizTeslimcisi();
        await t.hazirla();
        // Kapalıyken erteleme dahil muhafız sahipli her şey — yatış HARİÇ.
        expect(mockKopru.sahipliIptal).toHaveBeenCalledWith('muhafiz_tumu', { anons: false, alarm: true });
        expect(mockKopru.kanalTemizle).toHaveBeenCalledWith([]);
    });

    test('sahipli native yöntem YOKSA (eski ikili) muhafız önekli eski yola düşer', async () => {
        mockKopru.sahipliIptal.mockResolvedValueOnce(false);
        await new AndroidMuhafizTeslimcisi().hazirla(alarmliMatris());
        expect(mockKopru.onekliIptal).toHaveBeenCalledWith('muhafiz_');
    });

    test('önekli örnek (cuma) yalnız KENDİ önekini iptal eder, sahipli yolu kullanmaz', async () => {
        const t = new AndroidMuhafizTeslimcisi({
            sahiplik: { tur: 'onek', onek: 'cuma_hatirlatma_' },
            kanalHazirligi: async (m) => m,
            alarmKanalTemizligi: false,
        });
        await t.hazirla();
        expect(mockKopru.onekliIptal).toHaveBeenCalledWith('cuma_hatirlatma_');
        expect(mockKopru.sahipliIptal).not.toHaveBeenCalled();
    });

    test("nafilenin alarm kanalı DOĞRULANMIŞ sesten korunur (çözülemeyen URI'nin kanalı DEĞİL)", async () => {
        const OLU = 'content://media/external/audio/media/9999';
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(
            'nafile_ayarlari',
            JSON.stringify({
                hatirlatmalar: {
                    kusluk: {
                        aktif: true,
                        yon: 'girisindenItibaren',
                        adimlar: [{ esikDk: 5, kanallar: { bildirim: true, alarm: true }, siklik: 'birkez', bildirimSesi: OLU }],
                    },
                },
            })
        );
        try {
            await new AndroidMuhafizTeslimcisi().hazirla();
            expect(mockKopru.kanalTemizle).toHaveBeenCalledWith([ALARM_KANAL_TABANI]);
            expect(mockKopru.kanalTemizle.mock.calls[0][0]).not.toContain(alarmKanalIdOlustur(OLU));
        } finally {
            await AsyncStorage.removeItem('nafile_ayarlari');
        }
    });

    test('nafile örneği (alarmDestegi: false) muhafızın alarmlarına/kanallarına DOKUNMAZ', async () => {
        const t = new AndroidMuhafizTeslimcisi({ alarmDestegi: false, anonsOneki: 'nafile_', kanalHazirligi: async (m) => m });
        await t.hazirla(alarmliMatris());
        t.vakitYanKanallariniIptalEt('muhafiz_2026-01-01_vakit_ikindi');
        expect(mockKopru.onekliIptal).not.toHaveBeenCalled();
        expect(mockKopru.sustur).not.toHaveBeenCalled();
        expect(mockKopru.kanalTemizle).not.toHaveBeenCalled();
    });

    test('uygulama içi "Kıldım": vaktin alarmları önekle SUSTURULUR (bekleyen + ÇALAN — H1)', () => {
        new AndroidMuhafizTeslimcisi().vakitYanKanallariniIptalEt('muhafiz_2026-01-01_vakit_ikindi');
        // Yalnız bekleyenleri silen yol çalan alarmı görmez → "Kıldım" susturma yolunu kullanır.
        expect(mockKopru.sustur).toHaveBeenCalledWith('muhafiz_2026-01-01_vakit_ikindi');
        expect(mockKopru.onekliIptal).not.toHaveBeenCalled();
    });
});
